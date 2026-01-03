// Clears ALL data in the database (users + related data) using Prisma.
//
// Usage:
//   node scripts/clear-db.js
//   node scripts/clear-db.js --yes
//   node scripts/clear-db.js --yes --reset-seq
//   node scripts/clear-db.js --yes --no-reset-seq
//
// Notes:
// - Deletes rows only (does NOT delete the database file).
// - Order matters due to foreign keys: Application -> JobVacancy -> User

require('dotenv').config();

const readline = require('readline');
const prisma = require('../prisma/client');

function hasFlag(name) {
  return process.argv.includes(name);
}

async function confirmOrExit() {
  if (hasFlag('--yes') || hasFlag('-y')) return;

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise((resolve) => rl.question(q, resolve));

  const answer = await question(
    'This will DELETE ALL DATA (users, vacancies, applications). Type DELETE to continue: '
  );
  rl.close();

  if ((answer || '').trim() !== 'DELETE') {
    console.log('Aborted.');
    process.exit(0);
  }
}

async function resetSqliteSequences() {
  // Only relevant for SQLite. If table doesn't exist or DB differs, ignore.
  try {
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence;');
  } catch (_) {
    // ignore
  }
}

(async function main() {
  const resetSeq = hasFlag('--reset-seq') ? true : hasFlag('--no-reset-seq') ? false : true;

  try {
    await confirmOrExit();

    console.log('[clear-db] deleting data...');

    // Wrap in transaction so partial deletes don't happen.
    const result = await prisma.$transaction(async (tx) => {
      const applications = await tx.application.deleteMany({});
      const vacancies = await tx.jobVacancy.deleteMany({});
      const users = await tx.user.deleteMany({});
      return { applications, vacancies, users };
    });

    if (resetSeq) {
      await resetSqliteSequences();
    }

    console.log('[clear-db] done');
    console.log(
      JSON.stringify(
        {
          deleted: {
            applications: result.applications.count,
            vacancies: result.vacancies.count,
            users: result.users.count,
          },
          resetSeq,
        },
        null,
        2
      )
    );
  } catch (e) {
    console.error('[clear-db] failed:', e?.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
