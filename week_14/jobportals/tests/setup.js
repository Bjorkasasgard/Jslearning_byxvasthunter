// Test setup: loads env and exposes a Prisma client instance for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Connect once per Jest worker; individual tests create their own fixtures.
(async () => {
  try {
    await prisma.$connect();
  } catch (e) {
    console.error('Test setup failed:', e);
  }
})();

module.exports = {
  prisma,
};
