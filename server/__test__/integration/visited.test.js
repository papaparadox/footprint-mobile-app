const request = require("supertest");
const app = require("../../app");
const pool = require("../../database/connect");

let token;
let userId;
let visitId;
let countryId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'visited@test.com'");

  const reg = await request(app).post("/user/register").send({
    username: "visitedtest",
    email: "visited@test.com",
    password: "password123",
    home_country: "United Kingdom",
  });
  userId = reg.body.id;

  const res = await request(app).post("/user/login").send({
    email: "visited@test.com",
    password: "password123",
  });
  token = res.body.token;

  const country = await pool.query("SELECT id FROM countries LIMIT 1");
  countryId = country.rows[0].id;
});

afterAll(async () => {
  await pool.query("DELETE FROM visited_locations WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM users WHERE email = 'visited@test.com'");
});

describe("POST /visited/", () => {
  it("should log a country visit", async () => {
    const res = await request(app)
      .post("/visited/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        country_id: countryId,
        notes: "integration test visit",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.country_id).toBe(countryId);
    visitId = res.body.id;
  });

  it("should return 400 if country_id is missing", async () => {
    const res = await request(app)
      .post("/visited/")
      .set("Authorization", `Bearer ${token}`)
      .send({ notes: "no country" });
    expect(res.statusCode).toBe(400);
  });

  it("should return 401 with no token", async () => {
    const res = await request(app)
      .post("/visited/")
      .send({ country_id: countryId });
    expect(res.statusCode).toBe(401);
  });
});

describe("POST /visited/bulk", () => {
  it("should log multiple countries at once", async () => {
    const countries = await pool.query("SELECT id FROM countries LIMIT 3");
    const ids = countries.rows.map((r) => r.id);

    const res = await request(app)
      .post("/visited/bulk")
      .set("Authorization", `Bearer ${token}`)
      .send({ country_ids: ids });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("visits");
  });

  it("should return 400 if country_ids is missing", async () => {
    const res = await request(app)
      .post("/visited/bulk")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });
});

describe("GET /visited/:userId", () => {
  it("should return all visits for a user", async () => {
    const res = await request(app)
      .get(`/visited/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("country_name");
    expect(res.body[0]).toHaveProperty("iso_code");
  });
});

describe("DELETE /visited/:id", () => {
  it("should delete a visit", async () => {
    const res = await request(app)
      .delete(`/visited/${visitId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Visit deleted");
  });

  it("should return 404 for non-existent visit", async () => {
    const res = await request(app)
      .delete("/visited/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});