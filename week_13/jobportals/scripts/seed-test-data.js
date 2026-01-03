// Seeds test data: 5 admins, 5 members, 5 job vacancies (mixed ACTIVE/CLOSED).
//
// Usage:
//   node scripts/seed-test-data.js
//
// Notes:
// - Idempotent via upsert by email.
// - Uses a shared password for convenience.

require('dotenv').config();

const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');

const DEFAULT_PASSWORD = 'Password123!';
const SEED_DOMAIN = process.env.TEST_SEED_DOMAIN || 'gmail.com';

function makeEmail(prefix, idx) {
  return `${prefix}${idx}@${SEED_DOMAIN}`;
}

async function upsertUser({ email, name, role, city, phone }) {
  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, city: city || null, phone: phone || null, password: hashed },
    create: { email, name, role, city: city || null, phone: phone || null, password: hashed },
    select: { id: true, email: true, role: true, name: true },
  });
}

(async function main() {
  try {
    console.log('[seed-test-data] seeding users + vacancies...');

    // 1) Users
    const admins = [];
    const members = [];

    for (let i = 1; i <= 5; i++) {
      admins.push(
        await upsertUser({
          email: makeEmail('admin', i),
          name: `Admin ${i}`,
          role: 'ADMIN',
          city: 'Jakarta',
          phone: `0812000000${i}`,
        })
      );
    }

    for (let i = 1; i <= 5; i++) {
      members.push(
        await upsertUser({
          email: makeEmail('member', i),
          name: `Member ${i}`,
          role: 'MEMBER',
          city: 'Bandung',
          phone: `0813000000${i}`,
        })
      );
    }

    // 2) Vacancies (mix ACTIVE/CLOSED)
    // Use upsert by a deterministic unique key. JobVacancy has no unique fields,
    // so we implement idempotency by deleting previously created test vacancies first.
    const titles = [
      'Frontend Developer (Test)',
      'Backend Developer (Test)',
      'QA Engineer (Test)',
      'UI/UX Designer (Test)',
      'DevOps Engineer (Test)',
    ];

    await prisma.jobVacancy.deleteMany({
      where: {
        title: { in: titles },
      },
    });

    const vacancyPayloads = [
      {
        title: titles[0],
        company: 'PT Test Nusantara',
        location: 'Jakarta',
        description: 'Test vacancy for frontend role.',
        requirements: 'HTML, CSS, JavaScript, React.',
        salary: 'Rp 8.000.000 – Rp 12.000.000',
        jobType: 'FULLTIME',
        status: 'ACTIVE',
        questions: ['Tell us about your React experience.'],
      },
      {
        title: titles[1],
        company: 'PT Test Nusantara',
        location: 'Remote',
        description: 'Test vacancy for backend role.',
        requirements: 'Node.js, Express, SQL.',
        salary: 'Rp 10.000.000 – Rp 15.000.000',
        jobType: 'REMOTE',
        status: 'ACTIVE',
        questions: ['Have you used Prisma before? Explain.'],
      },
      {
        title: titles[2],
        company: 'PT Quality Test',
        location: 'Bandung',
        description: 'Test vacancy for QA role.',
        requirements: 'Manual testing, basic automation.',
        salary: null,
        jobType: 'FULLTIME',
        status: 'CLOSED',
        questions: ['What is your approach to writing test cases?'],
      },
      {
        title: titles[3],
        company: 'PT Design Test',
        location: 'Jakarta',
        description: 'Test vacancy for UI/UX role.',
        requirements: 'Figma, UX research fundamentals.',
        salary: 'Rp 7.000.000 – Rp 11.000.000',
        jobType: 'HYBRID',
        status: 'ACTIVE',
        questions: ['Share a UX project you are proud of.'],
      },
      {
        title: titles[4],
        company: 'PT Infra Test',
        location: 'Remote',
        description: 'Test vacancy for DevOps role.',
        requirements: 'Linux basics, CI/CD, Docker.',
        salary: null,
        jobType: 'CONTRACT',
        status: 'CLOSED',
        questions: ['Describe a CI/CD pipeline you have built.'],
      },
    ];

    const createdVacancies = [];
    for (let i = 0; i < vacancyPayloads.length; i++) {
      const admin = admins[i % admins.length];
      const v = await prisma.jobVacancy.create({
        data: {
          ...vacancyPayloads[i],
          createdBy: admin.id,
        },
        select: { id: true, title: true, status: true, createdBy: true },
      });
      createdVacancies.push(v);
    }

    console.log('[seed-test-data] done');
    console.log(
      JSON.stringify(
        {
          seedDomain: SEED_DOMAIN,
          passwordForAllUsers: DEFAULT_PASSWORD,
          admins: admins.map((a) => ({ id: a.id, email: a.email })),
          members: members.map((m) => ({ id: m.id, email: m.email })),
          vacancies: createdVacancies,
        },
        null,
        2
      )
    );
  } catch (e) {
    console.error('[seed-test-data] failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
