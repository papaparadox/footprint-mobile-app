const request = require("supertest");
const app = require("../../app");
const pool = require("../../database/connect");

let token;
let countryId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'countryint@test.com'");

  await request(app).post("/user/register").send({
    username: "countryinttest",
    email: "countryint@test.com",
    password: "password123",
    home_country: "United Kingdom",
  });

  const res = await request(app).post("/user/login").send({
    username: "countryinttest",
    password: "password123",
  });
  token = res.body.token;
});

afterAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'countryint@test.com'");
  await pool.end();
});

describe("GET /country/", () => {
  it("should return all countries", async () => {
    const res = await request(app)
      .get("/country/")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("iso_code");
    expect(res.body[0]).toHaveProperty("flag_url");
    expect(res.body[0]).toHaveProperty("continent");
    countryId = res.body[0].id;
  });

  it("should return countries in alphabetical order", async () => {
    const res = await request(app)
      .get("/country/")
      .set("Authorization", `Bearer ${token}`);
    expect(res.body[0].name).toBe("Afghanistan");
  });

  it("should return 403 without auth token", async () => {
    const res = await request(app).get("/country/");
    expect(res.statusCode).toBe(403);
  });
});

describe("GET /country/:id", () => {
  it("should return a single country", async () => {
    const res = await request(app)
      .get(`/country/${countryId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("iso_code");
    expect(res.body).toHaveProperty("continent");
  });

  it("should return 404 for non-existent country", async () => {
    const res = await request(app)
      .get("/country/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});

describe("GET /country/:id/cities", () => {
  it("should return cities for a country", async () => {
    const res = await request(app)
      .get(`/country/${countryId}/cities`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});