// Quick script to test Prisma read/write
require('dotenv').config();
const prisma = require('../prisma/client');

(async function(){
  try {
    console.log('Testing Prisma connection...');
    const count = await prisma.jobVacancy.count();
    console.log('JobVacancy count:', count);

    console.log('Ensuring test user exists...');
    let user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!user) {
      user = await prisma.user.create({ data: { name: 'Test User', email: 'test@example.com', password: 'hashed-placeholder' } });
      console.log('Created test user id:', user.id);
    }

    console.log('Creating test vacancy...');
    const v = await prisma.jobVacancy.create({ data: {
      title: 'Test Vacancy from script',
      company: 'Test Company',
      location: 'Remote',
      description: 'This is a test vacancy.',
      requirements: 'None',
      salary: '0',
      createdBy: user.id
    }});
    console.log('Created vacancy id:', v.id);

    const list = await prisma.jobVacancy.findMany({ take: 5 });
    console.log('Sample vacancies:', list.map(x=>({ id: x.id, title: x.title })));
  } catch (e) {
    console.error('Prisma test error:', e.message);
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
