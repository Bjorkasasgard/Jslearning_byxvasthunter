const request = require("supertest");

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "change-me";
});

const app = require("../../app");
const prisma = require("../../prisma/client");

describe("E2E: order flow", () => {
  jest.setTimeout(30_000);

  let userEmail;
  let userId;
  let token;
  let event;
  let ticket;
  let orderId;

  beforeAll(async () => {
    userEmail = `user_${Date.now()}@example.com`;

    await request(app)
      .post("/api/auth/register")
      .set("Accept", "application/json")
      .send({ name: "E2E User", email: userEmail, password: "secret123" })
      .expect(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .set("Accept", "application/json")
      .send({ email: userEmail, password: "secret123" })
      .expect(200);

    token = loginRes.body.token;
    userId = loginRes.body.user.id;

    event = await prisma.event.create({
      data: {
        title: "E2E Concert",
        description: "An end-to-end test event",
        location: "Jakarta",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    ticket = await prisma.ticket.create({
      data: {
        eventId: event.id,
        price: 50000,
        quota: 5,
      },
    });
  });

  afterAll(async () => {
    if (orderId) {
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.deleteMany({ where: { id: orderId } });
    }

    if (ticket?.id) await prisma.ticket.delete({ where: { id: ticket.id } });
    if (event?.id) await prisma.event.delete({ where: { id: event.id } });

    // delete user by email
    if (userEmail) {
      await prisma.user.deleteMany({ where: { email: userEmail } });
    }

    await prisma.$disconnect();
  });

  test("user can create an order and quota decrements", async () => {
    const before = await prisma.ticket.findUnique({ where: { id: ticket.id } });

    const res = await request(app)
      .post("/api/orders")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ ticketId: ticket.id, quantity: 1 }] })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    orderId = res.body.id;

    const after = await prisma.ticket.findUnique({ where: { id: ticket.id } });
    expect(after.quota).toBe(before.quota - 1);
  });
});
