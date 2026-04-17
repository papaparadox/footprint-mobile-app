const request = require("supertest");
const app = require("../../app");
const pool = require("../../database/connect");

let token;

beforeAll(async () => {
    await pool.query("DELETE FROM users WHERE email = 'auth@test.com'");
});

afterAll(async () => {
    await pool.query("DELETE FROM users WHERE email = 'auth@test.com'");
    await pool.end();
});

describe("POST /user/register", () => {
  it("should register a new user and return the user object", async () => {
    const res = await request(app).post("/user/register").send({
      username: "authtest",
      email: "auth@test.com",
      password: "password123",
      home_country: "United Kingdom",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.email).toBe("auth@test.com");
    expect(res.body).not.toHaveProperty("password");
  });

  it("should return 400 if email already exists", async () => {
    const res = await request(app).post("/user/register").send({
      username: "authtest2",
      email: "auth@test.com",
      password: "password123",
      home_country: "United Kingdom",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/user/register").send({
      email: "missing@test.com",
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("POST /user/login", () => {
  it("should login and return a token", async () => {
    const res = await request(app).post("/user/login").send({
      username: "authtest",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.success).toBe(true);
    token = res.body.token;
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app).post("/user/login").send({
      username: "authtest",
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for unknown username", async () => {
    const res = await request(app).post("/user/login").send({
      username: "ghost",
      password: "password123",
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("Protected routes", () => {
  it("should return 403 with no token", async () => {
    const res = await request(app).get("/country/");
    expect(res.statusCode).toBe(403);
  });

  it("should return 403 with invalid token", async () => {
    const res = await request(app)
      .get("/country/")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(403);
  });

  it("should return 200 with valid token", async () => {
    const res = await request(app)
      .get("/country/")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});