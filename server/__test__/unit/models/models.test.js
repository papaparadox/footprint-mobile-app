const pool = require("../../../database/connect");
const User = require("../../../models/User");
const Country = require("../../../models/Country");
const VisitedLocation = require("../../../models/VisitedLocation");
const Trip = require("../../../models/Trip");
const UserStats = require("../../../models/UserStats")

let testUserId;
let testCountryId;
let testVisitId;
let testTripId;
let testUserStatId;

beforeAll(async () => {
  await pool.query("DELETE FROM users WHERE email = 'models@test.com'");

  const result = await pool.query(
    `INSERT INTO users (username, email, password, home_country)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    ["modelstest", "models@test.com", "hashedpassword", "United Kingdom"]
  );
  testUserId = result.rows[0].id;

  const country = await pool.query("SELECT id FROM countries LIMIT 1");
  testCountryId = country.rows[0].id;
});

afterAll(async () => {
  await pool.query("DELETE FROM trips_images WHERE trip_id IN (SELECT id FROM trips WHERE user_id = $1)", [testUserId]);
  await pool.query("DELETE FROM visited_locations WHERE user_id = $1", [testUserId]);
  await pool.query("DELETE FROM trips WHERE user_id = $1", [testUserId]);
  await pool.query("DELETE FROM users WHERE email = 'models@test.com'");
  await pool.end();
});

// ─── User Model ───────────────────────────────────────────
describe("User model", () => {
  it("should get a user by username", async () => {
    const user = await User.getByUsername("modelstest");
    expect(user).toHaveProperty("id");
    expect(user.email).toBe("models@test.com");
  });

  it("should get a user by id", async () => {
    const user = await User.getById(testUserId);
    expect(user).toHaveProperty("username", "modelstest");
  });

  it("should throw if username not found", async () => {
    await expect(User.getByUsername("nobody")).rejects.toThrow("User not found");
  });

  it("should throw if id not found", async () => {
    await expect(User.getById(99999)).rejects.toThrow("User not found");
  });
});

// ─── Country Model ────────────────────────────────────────
describe("Country model", () => {
  it("should get all countries", async () => {
    const countries = await Country.getAll();
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(0);
  });

  it("should get a country by id", async () => {
    const country = await Country.getById(testCountryId);
    expect(country).toHaveProperty("name");
    expect(country).toHaveProperty("iso_code");
    expect(country).toHaveProperty("continent");
  });

  it("should throw if country not found", async () => {
    await expect(Country.getById(99999)).rejects.toThrow("Country not found");
  });

  it("should get cities by country", async () => {
    const cities = await Country.getCitiesByCountry(testCountryId);
    expect(Array.isArray(cities)).toBe(true);
  });

  it("should get a country by iso_code", async () => {
    const country = await Country.getByIsoCode("GB");
    expect(country).toHaveProperty("name", "United Kingdom");
    expect(country).toHaveProperty("iso_code", "GB");
    expect(country).toHaveProperty("continent", "Europe");
  });

  it("should throw if iso_code not found", async () => {
    await expect(Country.getByIsoCode("XX")).rejects.toThrow("Country not found");
  });

  it("should return countries as Country instances", async () => {
    const countries = await Country.getAll();
    expect(countries[0]).toBeInstanceOf(Country);
    expect(countries[0]).toHaveProperty("id");
    expect(countries[0]).toHaveProperty("name");
    expect(countries[0]).toHaveProperty("flag_url");
  });
});

// ─── VisitedLocation Model ────────────────────────────────
describe("VisitedLocation model", () => {
  it("should create a visited location", async () => {
    const visit = await VisitedLocation.create({
      user_id: testUserId,
      country_id: testCountryId,
      notes: "model test visit",
    });
    expect(visit).toHaveProperty("id");
    expect(visit.country_id).toBe(testCountryId);
    testVisitId = visit.id;
  });

  it("should get visits by user", async () => {
    const visits = await VisitedLocation.getByUser(testUserId);
    expect(Array.isArray(visits)).toBe(true);
    expect(visits.length).toBeGreaterThan(0);
    expect(visits[0]).toHaveProperty("country_name");
    expect(visits[0]).toHaveProperty("iso_code");
  });

  it("should bulk create visited locations", async () => {
    const country = await pool.query("SELECT id FROM countries OFFSET 1 LIMIT 1");
    const secondCountryId = country.rows[0].id;
    const inserted = await VisitedLocation.bulkCreate(testUserId, [secondCountryId]);
    expect(Array.isArray(inserted)).toBe(true);
  });

  it("should throw if user_id or country_id missing", async () => {
    await expect(
      VisitedLocation.create({ notes: "no ids" })
    ).rejects.toThrow("user_id and country_id are required");
  });

  it("should delete a visited location", async () => {
    const deleted = await VisitedLocation.delete(testVisitId, testUserId);
    expect(deleted).toHaveProperty("id", testVisitId);
  });

  it("should throw when deleting non-existent visit", async () => {
    await expect(
      VisitedLocation.delete(99999, testUserId)
    ).rejects.toThrow("Visit not found or does not belong to this user");
  });
});

// ─── Trip Model ───────────────────────────────────────────
describe("Trip model", () => {
  it("should create a trip with share_token", async () => {
    const trip = await Trip.create({
      user_id: testUserId,
      title: "Model Test Trip",
      total_days: 5,
      mood: "Adventurous",
    });
    expect(trip).toHaveProperty("id");
    expect(trip).toHaveProperty("share_token");
    expect(trip.title).toBe("Model Test Trip");
    testTripId = trip.id;
  });

  it("should auto calculate total_days from dates", async () => {
    const trip = await Trip.create({
      user_id: testUserId,
      title: "Date Test Trip",
      start_date: "2026-06-01",
      end_date: "2026-06-10",
    });
    expect(trip.total_days).toBe(9);
  });

  it("should get trips by user", async () => {
    const trips = await Trip.getByUser(testUserId);
    expect(Array.isArray(trips)).toBe(true);
    expect(trips.length).toBeGreaterThan(0);
    expect(trips[0]).toHaveProperty("countries_count");
    expect(trips[0]).toHaveProperty("images_count");
  });

  it("should get a trip by id with visits and images", async () => {
    const trip = await Trip.getById(testTripId);
    expect(trip).toHaveProperty("visits");
    expect(trip).toHaveProperty("images");
    expect(Array.isArray(trip.visits)).toBe(true);
    expect(Array.isArray(trip.images)).toBe(true);
  });

  it("should throw if trip not found by id", async () => {
    await expect(Trip.getById(99999)).rejects.toThrow("Trip not found");
  });

  it("should get a trip by share token", async () => {
    const created = await Trip.create({
      user_id: testUserId,
      title: "Share Token Trip",
      total_days: 3,
    });
    const trip = await Trip.getByToken(created.share_token);
    expect(trip).toHaveProperty("title", "Share Token Trip");
  });

  it("should throw for invalid share token", async () => {
    await expect(Trip.getByToken("invalid-token")).rejects.toThrow("Trip not found");
  });

  it("should update a trip", async () => {
    const updated = await Trip.update(testTripId, testUserId, {
      mood: "Relaxing",
    });
    expect(updated.mood).toBe("Relaxing");
  });

  it("should throw when updating trip that doesn't belong to user", async () => {
    await expect(
      Trip.update(testTripId, 99999, { mood: "Wild" })
    ).rejects.toThrow("Trip not found or does not belong to this user");
  });

  it("should delete a trip", async () => {
    const deleted = await Trip.delete(testTripId, testUserId);
    expect(deleted).toHaveProperty("id", testTripId);
  });

  it("should throw when deleting non-existent trip", async () => {
    await expect(
      Trip.delete(99999, testUserId)
    ).rejects.toThrow("Trip not found or does not belong to this user");
  });

  it("should add an image to a trip", async () => {
    const trip = await Trip.create({
      user_id: testUserId,
      title: "Image Test Trip",
      total_days: 2,
    });

    const image = await Trip.addImage(
      trip.id,
      "https://res.cloudinary.com/test/image.jpg",
      "Test caption"
    );

    expect(image).toHaveProperty("id");
    expect(image.trip_id).toBe(trip.id);
    expect(image.image_url).toBe("https://res.cloudinary.com/test/image.jpg");
    expect(image.caption).toBe("Test caption");
  });

  it("should throw if trip_id or image_url missing for addImage", async () => {
    await expect(
      Trip.addImage(null, null, "caption")
    ).rejects.toThrow("trip_id and image_url are required");
  });

  it("should get images for a trip", async () => {
    const trip = await Trip.create({
      user_id: testUserId,
      title: "Get Images Trip",
      total_days: 1,
    });

    await Trip.addImage(trip.id, "https://res.cloudinary.com/test/img1.jpg", null);
    await Trip.addImage(trip.id, "https://res.cloudinary.com/test/img2.jpg", null);

    const images = await Trip.getImages(trip.id);
    expect(Array.isArray(images)).toBe(true);
    expect(images.length).toBe(2);
    expect(images[0]).toHaveProperty("image_url");
  });

  it("should delete an image from a trip", async () => {
    const trip = await Trip.create({
      user_id: testUserId,
      title: "Delete Image Trip",
      total_days: 1,
    });

    const image = await Trip.addImage(
      trip.id,
      "https://res.cloudinary.com/test/delete.jpg",
      null
    );

    const deleted = await Trip.deleteImage(image.id, trip.id);
    expect(deleted).toHaveProperty("id", image.id);
  });

  it("should throw when deleting non-existent image", async () => {
    await expect(
      Trip.deleteImage(99999, 99999)
    ).rejects.toThrow("Image not found or does not belong to this trip");
  });

  it("should update total_days automatically when dates provided on update", async () => {
    const trip = await Trip.create({
      user_id: testUserId,
      title: "Update Dates Trip",
      total_days: 1,
    });

    const updated = await Trip.update(trip.id, testUserId, {
      start_date: "2026-07-01",
      end_date: "2026-07-10",
    });

    expect(updated.total_days).toBe(9);
  });

  it("should create a trip with notes", async () => {
    const trip = await Trip.create({
      user_id: testUserId,
      title: "Notes Trip",
      total_days: 3,
      notes: "Great experience",
      mood: "Relaxing",
    });

    expect(trip.notes).toBe("Great experience");
    expect(trip.mood).toBe("Relaxing");
  });
});

// ─── UserStats Model ───────────────────────────────────────────
describe("UserStats model", () => {
  it("should get stats for a user", async () => {
    const stats = await UserStats.getStats(testUserId);
    expect(stats).toHaveProperty("countries_visited");
    expect(stats).toHaveProperty("continents_visited");
    expect(stats).toHaveProperty("cities_visited");
    expect(stats).toHaveProperty("trips_taken");
  });

  it("should get continent breakdown for a user", async () => {
    const continents = await UserStats.getContinentBreakdown(testUserId);
    expect(Array.isArray(continents)).toBe(true);
  });

  it("should get most recent visit for a user", async () => {
    const recent = await UserStats.getMostRecentVisit(testUserId);
    // can be null if no visits — just check it doesn't throw
    expect(recent === null || typeof recent === "object").toBe(true);
  });
});