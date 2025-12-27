// Test setup: loads env and exposes a Prisma client instance for tests
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
  prisma,
};
