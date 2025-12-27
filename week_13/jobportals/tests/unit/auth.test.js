const bcrypt = require('bcrypt');

describe('Auth utilities (unit)', () => {
  test('hash and compare password', async () => {
    const password = 'TestPassword123!';
    const hash = await bcrypt.hash(password, 8);
    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);
  });
});
