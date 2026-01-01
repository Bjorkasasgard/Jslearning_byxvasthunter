const prisma = require('./client');
const bcrypt = require('bcrypt');

async function seed() {
  const adminEmail = 'admin@jobportal.com';
  const memberEmail = 'member@jobportal.com';

  const adminPass = 'admin123';
  const memberPass = 'member123';

  // create admin if not exists
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashed = await bcrypt.hash(adminPass, 10);
    admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashed,
        role: 'ADMIN',
      },
    });
    console.log('Admin created:', adminEmail);
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  // create member if not exists
  let member = await prisma.user.findUnique({ where: { email: memberEmail } });
  if (!member) {
    const hashed = await bcrypt.hash(memberPass, 10);
    member = await prisma.user.create({
      data: {
        name: 'Test Member',
        email: memberEmail,
        password: hashed,
        role: 'MEMBER',
      },
    });
    console.log('Member created:', memberEmail);
  } else {
    console.log('Member already exists:', memberEmail);
  }

  return { admin, member };
}

// If called directly, run seed and exit
if (require.main === module) {
  seed()
    .then(() => {
      console.log('Seeding complete');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = seed;
