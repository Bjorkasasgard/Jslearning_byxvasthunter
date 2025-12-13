const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Coba buat 1 user dummy
  const user = await prisma.user.create({
    data: {
      name: 'Tes User',
      email: 'tes@example.com',
      posts: {
        create: {
          title: 'Halo Prisma',
          content: 'Ini adalah postingan pertama yang dibuat via script!',
        },
      },
    },
  });
  console.log('Berhasil membuat user:', user);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
