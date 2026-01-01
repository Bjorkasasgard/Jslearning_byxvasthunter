const request = require('supertest');
const app = require('../../app');

describe('Auth integration', () => {
  test('register and login flow with CSRF', async () => {
    // get csrf token
    const csrfRes = await request(app).get('/api/csrf');
    expect(csrfRes.statusCode).toBe(200);
    const { csrfToken } = csrfRes.body;
    expect(csrfToken).toBeDefined();

    // register new user (unique email per run)
    const email = `testuser+${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .set('Cookie', csrfRes.headers['set-cookie'] || [])
      .set('x-csrf-token', csrfToken)
      .send({ name: 'Test User', email, password: 'pass1234' });

    expect([200,201]).toContain(regRes.statusCode);

    // login with same credentials
    const combinedCookies = []
      .concat(csrfRes.headers['set-cookie'] || [])
      .concat(regRes.headers['set-cookie'] || []);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .set('Cookie', combinedCookies)
      .set('x-csrf-token', csrfToken)
      .send({ email, password: 'pass1234' });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.user).toBeDefined();
  }, 20000);
});
