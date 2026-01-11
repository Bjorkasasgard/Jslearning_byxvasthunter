const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../../app');
const { prisma } = require('../setup');

jest.setTimeout(30000);

const PASSWORD = process.env.SEED_PASSWORD || 'Password123!';

async function getCsrf() {
  const res = await request(app).get('/api/csrf');
  return {
    csrfToken: res.body.csrfToken,
    cookies: res.headers['set-cookie'] || [],
  };
}

async function login(email, password = PASSWORD) {
  const csrf = await getCsrf();
  const res = await request(app)
    .post('/api/auth/login')
    .set('Cookie', csrf.cookies)
    .set('x-csrf-token', csrf.csrfToken)
    .send({ email, password });

  expect(res.statusCode).toBe(200);

  return {
    csrfToken: csrf.csrfToken,
    cookies: [...csrf.cookies, ...(res.headers['set-cookie'] || [])],
    user: res.body.user,
  };
}

async function ensureUser({ email, role, name }) {
  const hashed = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: { password: hashed, role, name },
    create: { email, name, role, password: hashed },
  });
}

async function ensureVacancy(adminId) {
  const existing = await prisma.jobVacancy.findFirst();
  if (existing) return existing;

  return prisma.jobVacancy.create({
    data: {
      title: 'Seeded vacancy',
      company: 'Default Co',
      location: 'Jakarta',
      description: 'Autocreated for tests',
      requirements: 'Testing',
      jobType: 'REMOTE',
      status: 'ACTIVE',
      createdBy: adminId,
    },
  });
}

function authedRequest(auth, method, url) {
  const req = request(app)[method](url).set('Cookie', auth.cookies);
  if (['post', 'put', 'delete'].includes(method)) {
    req.set('x-csrf-token', auth.csrfToken);
  }
  return req;
}

describe('Admin + Member API (integration)', () => {
  let adminAuth;
  let memberAuth;
  let adminUser;
  let memberUser;
  const created = {
    users: [],
    vacancies: [],
    applications: [],
    members: [],
  };

  beforeAll(async () => {
    adminUser = await ensureUser({ email: 'admin1@gmail.com', role: 'ADMIN', name: 'Admin 1' });
    memberUser = await ensureUser({ email: 'user1@gmail.com', role: 'MEMBER', name: 'Member 1' });

    adminAuth = await login(adminUser.email);
    memberAuth = await login(memberUser.email);

    await ensureVacancy(adminUser.id);
  });

  afterAll(async () => {
    try {
      // Clean up in dependency order
      if (created.applications.length) {
        await prisma.application.deleteMany({ where: { id: { in: created.applications } } });
      }
      if (created.vacancies.length) {
        await prisma.jobVacancy.deleteMany({ where: { id: { in: created.vacancies } } });
      }
      if (created.users.length) {
        await prisma.user.deleteMany({ where: { id: { in: created.users } } });
      }
      if (created.members.length) {
        await prisma.user.deleteMany({ where: { id: { in: created.members } } });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  test('lists users and filters by role', async () => {
    const listRes = await authedRequest(adminAuth, 'get', '/api/admin/users');
    expect(listRes.statusCode).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(2);
    expect(listRes.body.map((u) => u.email)).toEqual(
      expect.arrayContaining([adminUser.email, memberUser.email])
    );

    const filterRes = await authedRequest(adminAuth, 'get', '/api/admin/users?role=MEMBER');
    expect(filterRes.statusCode).toBe(200);
    expect(filterRes.body.every((u) => u.role === 'MEMBER')).toBe(true);

    const invalidRes = await authedRequest(adminAuth, 'get', '/api/admin/users?role=OWNER');
    expect(invalidRes.statusCode).toBe(400);
  });

  test('creates, updates, and deletes a user', async () => {
    const email = `new.user+${Date.now()}@example.com`;
    const createRes = await authedRequest(adminAuth, 'post', '/api/admin/users')
      .send({
        name: 'New Member',
        email,
        password: 'Password123!',
        role: 'MEMBER',
      });

    expect(createRes.statusCode).toBe(201);
    const userId = createRes.body.id;
    created.users.push(userId);

    const updateRes = await authedRequest(adminAuth, 'put', `/api/admin/users/${userId}`)
      .send({ name: 'Updated Member', role: 'ADMIN', password: 'Password123!' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.role).toBe('ADMIN');

    const deleteRes = await authedRequest(adminAuth, 'delete', `/api/admin/users/${userId}`);
    expect(deleteRes.statusCode).toBe(200);
    const found = await prisma.user.findUnique({ where: { id: userId } });
    expect(found).toBeNull();

    // removed via API; no need to clean up later
    created.users = created.users.filter((id) => id !== userId);
  });

  test('creates, updates, and deletes a vacancy', async () => {
    const createRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        title: 'Integration Test Vacancy',
        company: 'Test Corp',
        location: 'Remote',
        description: 'A role for integration testing.',
        requirements: 'Attention to detail',
        salary: '10-20',
        jobType: 'REMOTE',
        status: 'ACTIVE',
        questions: ['Q1?', 'Q2?'],
      });

    expect(createRes.statusCode).toBe(201);
    const vacancyId = createRes.body.id;
    created.vacancies.push(vacancyId);

    const updateRes = await authedRequest(adminAuth, 'put', `/api/admin/vacancies/${vacancyId}`)
      .send({ status: 'CLOSED', title: 'Updated Vacancy' });
    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('CLOSED');

    const deleteRes = await authedRequest(adminAuth, 'delete', `/api/admin/vacancies/${vacancyId}`);
    expect(deleteRes.statusCode).toBe(200);
    created.vacancies = created.vacancies.filter((id) => id !== vacancyId);
  });

  test('member applies and admin reviews applications', async () => {
    const vacancyRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        title: 'Application Target Vacancy',
        company: 'App Co',
        location: 'Jakarta',
        description: 'For application flow test',
        requirements: 'Node.js experience',
        jobType: 'FULLTIME',
        status: 'ACTIVE',
      });

    expect(vacancyRes.statusCode).toBe(201);
    const vacancyId = vacancyRes.body.id;
    created.vacancies.push(vacancyId);

    const pdfBuffer = Buffer.from('%PDF-1.4\n%EOF');
    const applyRes = await authedRequest(memberAuth, 'post', `/api/vacancies/${vacancyId}/apply`)
      .field('coverLetter', 'I am very interested.')
      .attach('resumeFile', pdfBuffer, 'resume.pdf');

    expect(applyRes.statusCode).toBe(201);
    const applicationId = applyRes.body.application.id;
    created.applications.push(applicationId);

    const memberApps = await authedRequest(memberAuth, 'get', '/api/member/applications');
    expect(memberApps.statusCode).toBe(200);
    expect(memberApps.body.some((app) => app.id === applicationId)).toBe(true);

    const memberDetail = await authedRequest(memberAuth, 'get', `/api/member/applications/${applicationId}`);
    expect(memberDetail.statusCode).toBe(200);

    const byJob = await authedRequest(memberAuth, 'get', `/api/member/applications/by-job/${vacancyId}`);
    expect(byJob.statusCode).toBe(200);

    const markRead = await authedRequest(memberAuth, 'post', `/api/member/applications/${applicationId}/read`);
    expect(markRead.statusCode).toBe(200);

    const listApps = await authedRequest(adminAuth, 'get', '/api/admin/applications');
    expect(listApps.statusCode).toBe(200);
    expect(listApps.body.some((app) => app.id === applicationId)).toBe(true);

    const listByVacancy = await authedRequest(adminAuth, 'get', `/api/admin/vacancies/${vacancyId}/applications`);
    expect(listByVacancy.statusCode).toBe(200);
    expect(listByVacancy.body.some((app) => app.id === applicationId)).toBe(true);

    const updateStatus = await authedRequest(adminAuth, 'put', `/api/admin/applications/${applicationId}`)
      .send({ status: 'REVIEWED' });
    expect(updateStatus.statusCode).toBe(200);
    expect(updateStatus.body.status).toBe('REVIEWED');
  });

  test('public vacancy list is accessible', async () => {
    const res = await request(app).get('/api/vacancies/public?limit=5&page=1');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('rejects application to closed vacancy', async () => {
    const vacancyRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        title: 'Closed Vacancy',
        company: 'Closed Co',
        location: 'Anywhere',
        description: 'Should not accept applications',
        requirements: 'None',
        jobType: 'REMOTE',
        status: 'CLOSED',
      });

    expect(vacancyRes.statusCode).toBe(201);
    const vacancyId = vacancyRes.body.id;
    created.vacancies.push(vacancyId);

    const applyRes = await authedRequest(memberAuth, 'post', `/api/vacancies/${vacancyId}/apply`)
      .field('coverLetter', 'Interested')
      .attach('resumeFile', Buffer.from('%PDF-1.4\n%EOF'), 'resume.pdf');

    expect(applyRes.statusCode).toBe(400);
    expect(applyRes.body.message).toMatch(/closed/i);
  });

  test('rejects non-PDF resume upload', async () => {
    const vacancyRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        title: 'Mime Check Vacancy',
        company: 'Mime Co',
        location: 'Remote',
        description: 'Upload filter test',
        requirements: 'Follow rules',
        jobType: 'REMOTE',
        status: 'ACTIVE',
      });

    expect(vacancyRes.statusCode).toBe(201);
    const vacancyId = vacancyRes.body.id;
    created.vacancies.push(vacancyId);

    const applyRes = await authedRequest(memberAuth, 'post', `/api/vacancies/${vacancyId}/apply`)
      .field('coverLetter', 'Here is my note')
      .attach('resumeFile', Buffer.from('not-a-pdf'), 'resume.txt');

    expect(applyRes.statusCode).toBe(400);
    expect(applyRes.body.message).toMatch(/pdf/i);
  });

  test('rejects application without cover letter or resume', async () => {
    const vacancyRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        title: 'Cover Requirement Vacancy',
        company: 'Req Co',
        location: 'Remote',
        description: 'Needs cover',
        requirements: 'Write cover',
        jobType: 'REMOTE',
        status: 'ACTIVE',
      });

    expect(vacancyRes.statusCode).toBe(201);
    const vacancyId = vacancyRes.body.id;
    created.vacancies.push(vacancyId);

    const applyRes = await authedRequest(memberAuth, 'post', `/api/vacancies/${vacancyId}/apply`);

    expect(applyRes.statusCode).toBe(400);
    expect(applyRes.body.message).toMatch(/cover letter/i);
  });

  test('rejects invalid user payload (missing name/password)', async () => {
    const createRes = await authedRequest(adminAuth, 'post', '/api/admin/users')
      .send({ email: 'bad@x.test', role: 'MEMBER' });

    expect(createRes.statusCode).toBe(400);
    expect(createRes.body.message).toMatch(/validation/i);
  });

  test('rejects invalid vacancy payload (missing title)', async () => {
    const createRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        company: 'No Title Co',
        location: 'Nowhere',
        description: 'Missing title',
        requirements: 'N/A',
      });

    expect(createRes.statusCode).toBe(400);
    expect(createRes.body.message).toMatch(/validation/i);
    expect(createRes.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'title' })])
    );
  });

  test('update profile fails on duplicate email and unauthenticated', async () => {
    // create another member
    const email = `member+${Date.now()}@example.com`;
    const member = await prisma.user.create({
      data: { name: 'Dup Member', email, password: 'x', role: 'MEMBER' },
      select: { id: true, email: true },
    });
    created.members.push(member.id);

    // unauthenticated
    const unauth = await request(app).put('/api/member/profile').send({ email: 'x@test.com' });
    expect([401, 403]).toContain(unauth.statusCode);

    // duplicate email using existing memberAuth
    const dupRes = await authedRequest(memberAuth, 'put', '/api/member/profile')
      .send({ email });
    expect(dupRes.statusCode).toBe(400);
    expect(String(dupRes.body.message || '')).toMatch(/unique/i);
  });

  test('upload resume without file returns 400', async () => {
    const res = await authedRequest(memberAuth, 'post', '/api/member/profile/resume');
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/no file/i);
  });

  test('duplicate application blocked with friendly error', async () => {
    const vacancyRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        title: 'Duplicate Apply Vacancy',
        company: 'Dup Co',
        location: 'Remote',
        description: 'Dup check',
        requirements: 'None',
        jobType: 'REMOTE',
        status: 'ACTIVE',
      });

    expect(vacancyRes.statusCode).toBe(201);
    const vacancyId = vacancyRes.body.id;
    created.vacancies.push(vacancyId);

    const pdf = Buffer.from('%PDF-1.4\n%EOF');
    const first = await authedRequest(memberAuth, 'post', `/api/vacancies/${vacancyId}/apply`)
      .field('coverLetter', 'First')
      .attach('resumeFile', pdf, 'resume.pdf');
    expect(first.statusCode).toBe(201);
    const appId = first.body.application.id;
    created.applications.push(appId);

    const second = await authedRequest(memberAuth, 'post', `/api/vacancies/${vacancyId}/apply`)
      .field('coverLetter', 'Second')
      .attach('resumeFile', pdf, 'resume.pdf');
    expect(second.statusCode).toBe(400);
    expect(String(second.body.message || '')).toMatch(/already applied/i);
  });

  test('cover letter too long currently passes (no length guard on multipart)', async () => {
    const vacancyRes = await authedRequest(adminAuth, 'post', '/api/admin/vacancies')
      .send({
        title: 'Long Cover Vacancy',
        company: 'Long Co',
        location: 'Remote',
        description: 'Length test',
        requirements: 'None',
        jobType: 'REMOTE',
        status: 'ACTIVE',
      });

    expect(vacancyRes.statusCode).toBe(201);
    const vacancyId = vacancyRes.body.id;
    created.vacancies.push(vacancyId);

    const longText = 'a'.repeat(6000);
    const res = await authedRequest(memberAuth, 'post', `/api/vacancies/${vacancyId}/apply`)
      .field('coverLetter', longText)
      .attach('resumeFile', Buffer.from('%PDF-1.4\n%EOF'), 'resume.pdf');

    expect(res.statusCode).toBe(201);
    if (res.body?.application?.id) created.applications.push(res.body.application.id);
  });
});
