const request = require("supertest");

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "change-me";
});

const app = require("../../app");

describe("GET /api/health", () => {
  test("returns service status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok", service: "eventify" });
  });
});
