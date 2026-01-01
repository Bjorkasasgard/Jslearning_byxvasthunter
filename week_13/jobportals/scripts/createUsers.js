// script shim that calls the canonical prisma seed
const seed = require('../prisma/seed');

seed()
  .then(() => {
    console.log('createUsers.js: seed complete');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
