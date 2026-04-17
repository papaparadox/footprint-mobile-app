const request = require("supertest");
const app = require("../../app");
const pool = require("../../database/connect");

let token;
let userId;
let tripId;
let shareToken;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'trip@test.com'");

  const reg = await request(app).post("/user/register").send({
    username: "triptest",
    email: "trip@test.com",
    password: "password123",
    home_country: "United Kingdom",
  });
  userId = reg.body.id;

  const res = await request(app).post("/user/login").send({
    email: "trip@test.com",
    password: "password123",
  });
  token = res.body.token;
});

afterAll(async () => {
  await pool.query("DELETE FROM trips_images WHERE trip_id IN (SELECT id FROM trips WHERE user_id = $1)", [userId]);
  await pool.query("DELETE FROM trips WHERE user_id = $1", [userId]);
  await pool.query("DELETE FROM users WHERE email = 'trip@test.com'");
});

describe("POST /trip/", () => {
  it("should create a trip and return share_token", async () => {
    const res = await request(app)
      .post("/trip/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Integration Test Trip",
        total_days: 7,
        mood: "Adventurous",
        notes: "Integration test notes",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("share_token");
    expect(res.body.title).toBe("Integration Test Trip");
    tripId = res.body.id;
    shareToken = res.body.share_token;
  });

  it("should auto calculate total_days from dates", async () => {
    const res = await request(app)
      .post("/trip/")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Date Trip",
        start_date: "2026-06-01",
        end_date: "2026-06-11",
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.total_days).toBe(10);
  });

  it("should return 400 if title is missing", async () => {
    const res = await request(app)
      .post("/trip/")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "Relaxing" });
    expect(res.statusCode).toBe(400);
  });

  it("should return 401 with no token", async () => {
    const res = await request(app)
      .post("/trip/")
      .send({ title: "No auth trip" });
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /trip/user/:userId", () => {
  it("should return all trips for a user", async () => {
    const res = await request(app)
      .get(`/trip/user/${userId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("share_token");
    expect(res.body[0]).toHaveProperty("countries_count");
  });
});

describe("GET /trip/:id", () => {
  it("should return a single trip with visits and images", async () => {
    const res = await request(app)
      .get(`/trip/${tripId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("visits");
    expect(res.body).toHaveProperty("images");
    expect(Array.isArray(res.body.visits)).toBe(true);
    expect(Array.isArray(res.body.images)).toBe(true);
  });

  it("should return 404 for non-existent trip", async () => {
    const res = await request(app)
      .get("/trip/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});

describe("GET /trip/share/:token", () => {
  it("should return trip by share token without auth", async () => {
    const res = await request(app).get(`/trip/share/${shareToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Integration Test Trip");
    expect(res.body).toHaveProperty("visits");
    expect(res.body).toHaveProperty("images");
  });

  it("should return 404 for invalid share token", async () => {
    const res = await request(app).get("/trip/share/invalid-token-xyz");
    expect(res.statusCode).toBe(404);
  });
});

describe("PATCH /trip/:id", () => {
  it("should update a trip", async () => {
    const res = await request(app)
      .patch(`/trip/${tripId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "Relaxing" });
    expect(res.statusCode).toBe(200);
    expect(res.body.mood).toBe("Relaxing");
  });

  it("should return 400 for non-existent trip", async () => {
    const res = await request(app)
      .patch("/trip/99999")
      .set("Authorization", `Bearer ${token}`)
      .send({ mood: "Wild" });
    expect(res.statusCode).toBe(400);
  });
});

describe("DELETE /trip/:id", () => {
  it("should delete a trip", async () => {
    const trip = await request(app)
      .post("/trip/")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Trip to delete", total_days: 1 });

    const res = await request(app)
      .delete(`/trip/${trip.body.id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Trip deleted");
  });

  it("should return 404 for non-existent trip", async () => {
    const res = await request(app)
      .delete("/trip/99999")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});