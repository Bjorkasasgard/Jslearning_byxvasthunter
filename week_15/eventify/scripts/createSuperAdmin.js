const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");

const DEFAULT_EMAIL = "superadmin@eventify.local";
const DEFAULT_PASSWORD = "SuperAdmin123!";
const DEFAULT_NAME = "Eventify Super Admin";

const email = process.env.SUPER_ADMIN_EMAIL || process.argv[2] || DEFAULT_EMAIL;
const password =
  process.env.SUPER_ADMIN_PASSWORD || process.argv[3] || DEFAULT_PASSWORD;
const name = process.env.SUPER_ADMIN_NAME || process.argv[4] || DEFAULT_NAME;

const avatarBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
const avatarBuffer = Buffer.from(avatarBase64, "base64");

const upsertSuperAdmin = async () => {
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashed,
      role: "ADMIN",
      avatarData: avatarBuffer,
      avatarMime: "image/png",
    },
    create: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
      avatarData: avatarBuffer,
      avatarMime: "image/png",
    },
  });

  console.log("Super admin ready:", email);
};

upsertSuperAdmin()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Create super admin failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
