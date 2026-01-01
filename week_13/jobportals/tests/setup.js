// Test setup: loads env and exposes a Prisma client instance for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ensure database connection and seed test users before running tests
(async () => {
  try {
    await prisma.$connect();
    // run the project's seed (creates admin/member)
    const seed = require('../prisma/seed');
    await seed();
  } catch (e) {
    console.error('Test setup failed:', e);
  }
})();

module.exports = {
  prisma,
};
