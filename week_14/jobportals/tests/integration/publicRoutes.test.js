const request = require('supertest');
const app = require('../../app');

describe('Public routes', () => {
  test('GET /jobs renders HTML', async () => {
    const res = await request(app).get('/jobs');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text).toMatch(/<html/i);
  });

  test('GET /auth/login renders HTML', async () => {
    const res = await request(app).get('/auth/login');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
    expect(res.text.toLowerCase()).toContain('login');
  });

  test('blocks path traversal on uploads', async () => {
    const res = await request(app).get('/uploads/resumes/../../etc/passwd');
    expect([400, 404]).toContain(res.statusCode);
  });

  test('blocks direct storage access', async () => {
    const res = await request(app).get('/storage/uploads/resumes/file.pdf');
    expect(res.statusCode).toBe(404);
  });
});