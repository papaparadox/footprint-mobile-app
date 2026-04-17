const request = require("supertest");
const app = require("../../app");
const pool = require("../../database/connect");

let token;
let userId;
let countryId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'stats@test.com'");

  const reg = await request(app).post("/user/register").send({
    username: "statstest",
    email: "stats@test.com",
    password: "password123",
    home_country: "United Kingdom",
  });
  userId = reg.body.id;

  const res = await request(app).post("/user/login").send({
    email: "stats@test.com",
    password: "password123",
  });
  token = res.body.token;

  const country = await pool.query("SELECT id FROM countries LIMIT 1");
  countryId = country.rows[0].id;
});

afterAll(async () => {
  await pool.query("DELETE FROM visited_locations WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM users WHERE email = 'stats@test.com'");
});

describe("GET /stats/:userId", () => {
  it("should return zero stats for user with no visits", async () => {
    const res = await request(app)
      .get(`/stats/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("stats");
    expect(res.body).toHaveProperty("continents");
    expect(res.body).toHaveProperty("recentVisit");
    expect(res.body.stats.countries_visited).toBe("0");
    expect(res.body.recentVisit).toBeNull();
  });

  it("should return updated stats after logging a visit", async () => {
    await request(app)
      .post("/visited/")
      .set("Authorization", `Bearer ${token}`)
      .send({ country_id: countryId });

    const res = await request(app)
      .get(`/stats/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(parseInt(res.body.stats.countries_visited)).toBeGreaterThan(0);
    expect(res.body.recentVisit).not.toBeNull();
    expect(res.body.recentVisit).toHaveProperty("country_name");
    expect(res.body.recentVisit).toHaveProperty("iso_code");
  });

  it("should return continent breakdown after logging visits", async () => {
    const res = await request(app)
      .get(`/stats/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(Array.isArray(res.body.continents)).toBe(true);
    expect(res.body.continents[0]).toHaveProperty("continent");
    expect(res.body.continents[0]).toHaveProperty("countries_count");
  });

  it("should return 401 with no token", async () => {
    const res = await request(app).get(`/stats/${userId}`);
    expect(res.statusCode).toBe(401);
  });
});