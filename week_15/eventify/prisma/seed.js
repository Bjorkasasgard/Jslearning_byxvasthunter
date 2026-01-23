const bcrypt = require("bcryptjs");
const prisma = require("./client");

const adminEmail = "admin@eventify.local";
const adminPassword = "Admin123!";

const events = [
  {
    title: "Eventify Music Fest 2026",
    description: "Festival musik outdoor dengan 12 artis nasional dan internasional.",
    location: "Jakarta International Stadium",
    date: new Date("2026-03-15T19:00:00.000Z"),
    imageUrl: "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1200&auto=format&fit=crop",
    tickets: [
      { price: 150000, quota: 300 },
      { price: 300000, quota: 200 },
      { price: 500000, quota: 100 },
    ],
  },
  {
    title: "Tech Conference NextGen",
    description: "Konferensi teknologi dengan sesi AI, Web, dan Cloud untuk praktisi.",
    location: "Bandung Tech Park",
    date: new Date("2026-04-02T08:30:00.000Z"),
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
    tickets: [
      { price: 100000, quota: 250 },
      { price: 250000, quota: 150 },
    ],
  },
  {
    title: "Local Food & Culture Expo",
    description: "Eksibisi kuliner dan budaya lokal dengan lebih dari 80 tenant.",
    location: "Surabaya Convention Center",
    date: new Date("2026-05-20T10:00:00.000Z"),
    imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop",
    tickets: [
      { price: 50000, quota: 400 },
      { price: 90000, quota: 200 },
    ],
  },
  {
    title: "Marathon City Night Run",
    description: "Lari malam 10K dan 5K dengan rute khusus pusat kota.",
    location: "Yogyakarta City Square",
    date: new Date("2026-06-12T17:00:00.000Z"),
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
    tickets: [
      { price: 75000, quota: 500 },
      { price: 120000, quota: 200 },
    ],
  },
  {
    title: "Startup Demo Day",
    description: "Pitching startup, networking investor, dan mentoring eksklusif.",
    location: "Bali Innovation Hub",
    date: new Date("2026-07-08T13:00:00.000Z"),
    imageUrl: "https://images.unsplash.com/photo-1515169067865-5387f1e41c6c?q=80&w=1200&auto=format&fit=crop",
    tickets: [
      { price: 200000, quota: 150 },
      { price: 350000, quota: 80 },
    ],
  },
];

const seedAdmin = async () => {
  const hashed = await bcrypt.hash(adminPassword, 10);
  const avatarBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";
  const avatarBuffer = Buffer.from(avatarBase64, "base64");

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Eventify Admin",
      password: hashed,
      role: "ADMIN",
      avatarData: avatarBuffer,
      avatarMime: "image/png",
    },
    create: {
      name: "Eventify Admin",
      email: adminEmail,
      password: hashed,
      role: "ADMIN",
      avatarData: avatarBuffer,
      avatarMime: "image/png",
    },
  });
};

const seedEvents = async () => {
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });

  const existing = await prisma.event.findMany({
    select: { id: true, title: true },
  });
  const existingTitles = new Set(existing.map((e) => e.title));

  for (const event of events) {
    if (existingTitles.has(event.title)) {
      continue;
    }

    await prisma.event.create({
      data: {
        title: event.title,
        description: event.description,
        location: event.location,
        date: event.date,
        imageUrl: event.imageUrl,
        createdById: admin ? admin.id : null,
        tickets: {
          create: event.tickets,
        },
      },
    });
  }
};

const main = async () => {
  await seedAdmin();
  await seedEvents();
};

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
