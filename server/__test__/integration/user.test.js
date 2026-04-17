const request = require("supertest");
const app = require("../../app");
const pool = require("../../database/connect");

let token;
let userId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'user@test.com'");
});

afterAll(async () => {
  await pool.query("DELETE FROM visited_locations WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM trips WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM users WHERE email = 'user@test.com'");
});

// ─── Register ─────────────────────────────────────────────
describe("POST /user/register", () => {
  it("should register a new user and return user object without password", async () => {
    const res = await request(app).post("/user/register").send({
      username: "usertest",
      email: "user@test.com",
      password: "password123",
      home_country: "United Kingdom",
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("email", "user@test.com");
    expect(res.body).toHaveProperty("username", "usertest");
    expect(res.body).not.toHaveProperty("password");
    userId = res.body.id;
  });

  it("should return 400 if email already exists", async () => {
    const res = await request(app).post("/user/register").send({
      username: "usertest2",
      email: "user@test.com",
      password: "password123",
      home_country: "United Kingdom",
    });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("err");
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app).post("/user/register").send({
      email: "incomplete@test.com",
    });
    expect(res.statusCode).toBe(400);
  });
});

// ─── Login ────────────────────────────────────────────────
describe("POST /user/login", () => {
  it("should login and return a token", async () => {
    const res = await request(app).post("/user/login").send({
      email: "user@test.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.success).toBe(true);
    token = res.body.token;
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app).post("/user/login").send({
      email: "user@test.com",
      password: "wrongpassword",
    });
    expect(res.statusCode).toBe(401);
  });

  it("should return 401 for unknown email", async () => {
    const res = await request(app).post("/user/login").send({
      email: "ghost@test.com",
      password: "password123",
    });
    expect(res.statusCode).toBe(401);
  });
});

// ─── Get Profile ──────────────────────────────────────────
describe("GET /user/profile", () => {
  it("should return user profile when authenticated", async () => {
    const res = await request(app)
      .get("/user/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("username", "usertest");
    expect(res.body.user).toHaveProperty("email", "user@test.com");
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).get("/user/profile");
    expect(res.statusCode).toBe(401);
  });

  it("should return 403 with invalid token", async () => {
    const res = await request(app)
      .get("/user/profile")
      .set("Authorization", "Bearer invalidtoken");
    expect(res.statusCode).toBe(403);
  });
});

// ─── Update Profile ───────────────────────────────────────
describe("PATCH /user/profile/update", () => {
  it("should update user home_country", async () => {
    const res = await request(app)
      .patch("/user/profile/update")
      .set("Authorization", `Bearer ${token}`)
      .send({ home_country: "Egypt" });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.home_country).toBe("Egypt");
  });

  it("should update username", async () => {
    const res = await request(app)
      .patch("/user/profile/update")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "updateduser" });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.username).toBe("updateduser");
  });

  it("should return 400 if no fields provided", async () => {
    const res = await request(app)
      .patch("/user/profile/update")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("err");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app)
      .patch("/user/profile/update")
      .send({ home_country: "France" });
    expect(res.statusCode).toBe(401);
  });
});

// ─── Delete Profile ───────────────────────────────────────
describe("DELETE /user/profile/delete", () => {
  it("should return 401 with no token", async () => {
    const res = await request(app).delete("/user/profile/delete");
    expect(res.statusCode).toBe(401);
  });

  it("should delete the user account", async () => {
    const res = await request(app)
      .delete("/user/profile/delete")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("message", "User deleted successfully");
  });

  it("should return 500 after account is deleted — token no longer valid", async () => {
    const res = await request(app)
      .get("/user/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
  });
});