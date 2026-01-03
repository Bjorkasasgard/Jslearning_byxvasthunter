// Seed script for local development.
// Creates exactly:
// - 2 ADMIN users
// - 2 MEMBER users
// - 10 JobVacancy records (5 per admin)
//
// Run:
//   npm run db:clear -- --yes
//   npm run prisma:seed

require('dotenv').config();

const bcrypt = require('bcrypt');
const prisma = require('./client');

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'Password123!';

async function createUser({ email, name, role, city, phone }) {
  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  return prisma.user.create({
    data: {
      email,
      name,
      role,
      city: city || null,
      phone: phone || null,
      password: hashed,
    },
    select: { id: true, email: true, role: true, name: true },
  });
}

function makeVacancyPayloads({ adminName, idxOffset }) {
  const baseCompany = `PT ${adminName.replace(/\s+/g, ' ')}`;
  const locations = ['Jakarta', 'Bandung', 'Surabaya', 'Remote', 'Yogyakarta'];
  const jobTypes = ['FULLTIME', 'PARTTIME', 'REMOTE', 'HYBRID', 'CONTRACT'];

  return Array.from({ length: 5 }).map((_, i) => {
    const n = idxOffset + i + 1;
    const jobType = jobTypes[i % jobTypes.length];

    return {
      title: `Seed Job #${n} (${adminName})`,
      company: baseCompany,
      location: locations[i % locations.length],
      description: `This is seeded vacancy #${n} created by ${adminName}.`,
      requirements: 'Basic communication, willingness to learn, and relevant skills.',
      salary: i % 2 === 0 ? 'Rp 6.000.000 - Rp 12.000.000' : null,
      jobType,
      status: 'ACTIVE',
      questions: [
        'Why do you want this job?',
        'Describe a project you have worked on.',
      ],
    };
  });
}

(async function main() {
  try {
    console.log('[seed] starting...');

    // Safety: ensure DB is empty (or wipe if not). User requested full reset.
    await prisma.$transaction(async (tx) => {
      await tx.application.deleteMany({});
      await tx.jobVacancy.deleteMany({});
      await tx.user.deleteMany({});
      try {
        await tx.$executeRawUnsafe('DELETE FROM sqlite_sequence;');
      } catch (_) {
        // ignore if not sqlite
      }
    });

    // 1) Users
    const admin1 = await createUser({
      email: 'admin1@gmail.com',
      name: 'Admin 1',
      role: 'ADMIN',
      city: 'Jakarta',
      phone: '08120000001',
    });

    const admin2 = await createUser({
      email: 'admin2@gmail.com',
      name: 'Admin 2',
      role: 'ADMIN',
      city: 'Jakarta',
      phone: '08120000002',
    });

    const member1 = await createUser({
      email: 'user1@gmail.com',
      name: 'User 1',
      role: 'MEMBER',
      city: 'Bandung',
      phone: '08130000001',
    });

    const member2 = await createUser({
      email: 'user2@gmail.com',
      name: 'User 2',
      role: 'MEMBER',
      city: 'Bandung',
      phone: '08130000002',
    });

    // 2) Vacancies (5 per admin)
    const v1 = makeVacancyPayloads({ adminName: admin1.name, idxOffset: 0 });
    const v2 = makeVacancyPayloads({ adminName: admin2.name, idxOffset: 5 });

    const createdVacancies = [];
    for (const payload of v1) {
      createdVacancies.push(
        await prisma.jobVacancy.create({
          data: { ...payload, createdBy: admin1.id },
          select: { id: true, title: true, createdBy: true, status: true },
        })
      );
    }

    for (const payload of v2) {
      createdVacancies.push(
        await prisma.jobVacancy.create({
          data: { ...payload, createdBy: admin2.id },
          select: { id: true, title: true, createdBy: true, status: true },
        })
      );
    }

    console.log('[seed] done');
    console.log(
      JSON.stringify(
        {
          passwordForAllUsers: DEFAULT_PASSWORD,
          admins: [admin1, admin2],
          members: [member1, member2],
          vacanciesCreated: createdVacancies.length,
        },
        null,
        2
      )
    );
  } catch (e) {
    console.error('[seed] failed:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
