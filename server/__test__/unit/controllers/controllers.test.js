const countryController = require("../../../controllers/country");
const visitedController = require("../../../controllers/visitedLocation");
const tripController = require("../../../controllers/trip");
const statsController = require("../../../controllers/userStats");

const Country = require("../../../models/Country");
const VisitedLocation = require("../../../models/VisitedLocation");
const Trip = require("../../../models/Trip");
const UserStats = require("../../../models/UserStats");

let mockJson;
let mockSend; 
let mockEnd;
let mockStatus;
let mockResponse;

beforeEach(() => {
  mockJson = jest.fn();
  mockSend = jest.fn();
  mockEnd = jest.fn();
  mockStatus = jest.fn(() => ({
    send: mockSend,
    json: mockJson,
    end: mockEnd,
  }));
  mockResponse = { status: mockStatus };
});


// ─── Country Controller ───────────────────────────────────
describe("Country controller", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe("getAllCountries", () => {
    it("should return 200 and array of countries", async () => {
      const mockCountries = [
        { id: 1, name: "France", continent: "Europe", iso_code: "FR" },
        { id: 2, name: "Japan", continent: "Asia", iso_code: "JP" },
      ];

      jest.spyOn(Country, "getAll").mockResolvedValue(mockCountries);

      const mockReq = {};
      await countryController.getAllCountries(mockReq, mockResponse);

      expect(Country.getAll).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockCountries);
    });

    it("should return 404 if no countries found", async () => {
      jest.spyOn(Country, "getAll").mockRejectedValue(
        new Error("No countries found")
      );

      await countryController.getAllCountries({}, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "No countries found" });
    });
  });

  describe("getCountryById", () => {
    it("should return 200 and a single country", async () => {
      const mockCountry = { id: 1, name: "France", iso_code: "FR" };

      jest.spyOn(Country, "getById").mockResolvedValue(mockCountry);

      const mockReq = { params: { id: 1 } };
      await countryController.getCountryById(mockReq, mockResponse);

      expect(Country.getById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockCountry);
    });

    it("should return 404 if country not found", async () => {
      jest.spyOn(Country, "getById").mockRejectedValue(
        new Error("Country not found")
      );

      const mockReq = { params: { id: 99999 } };
      await countryController.getCountryById(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "Country not found" });
    });
  });

  describe("getCitiesByCountry", () => {
    it("should return 200 and array of cities", async () => {
      const mockCities = [
        { id: 1, name: "Paris", country_id: 1 },
      ];

      jest.spyOn(Country, "getCitiesByCountry").mockResolvedValue(mockCities);

      const mockReq = { params: { id: 1 } };
      await countryController.getCitiesByCountry(mockReq, mockResponse);

      expect(Country.getCitiesByCountry).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockCities);
    });

    it("should return 404 if getCitiesByCountry fails", async () => {
        jest.spyOn(Country, "getCitiesByCountry").mockRejectedValue(
            new Error("No cities found")
        );
        const mockReq = { params: { id: 99999 } };

        await countryController.getCitiesByCountry(mockReq, mockResponse);
        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({ error: "No cities found" });
    });
  });
});

// ─── VisitedLocation Controller ───────────────────────────
describe("VisitedLocation controller", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe("createVisit", () => {
    it("should return 201 and the new visit", async () => {
      const mockVisit = {
        id: 1,
        user_id: 2,
        country_id: 1,
        notes: "Amazing trip",
      };

      jest.spyOn(VisitedLocation, "create").mockResolvedValue(mockVisit);

      const mockReq = {
        body: { country_id: 1, notes: "Amazing trip" },
        user: { id: 2 },
      };

      await visitedController.createVisit(mockReq, mockResponse);

      expect(VisitedLocation.create).toHaveBeenCalledWith({
        user_id: 2,
        country_id: 1,
        city_id: undefined,
        trip_id: undefined,
        date_visited: undefined,
        notes: "Amazing trip",
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockVisit);
    });

    it("should return 400 if country_id is missing", async () => {
      jest.spyOn(VisitedLocation, "create").mockRejectedValue(
        new Error("user_id and country_id are required")
      );

      const mockReq = {
        body: { notes: "no country" },
        user: { id: 2 },
      };

      await visitedController.createVisit(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "user_id and country_id are required",
      });
    });
  });

  describe("bulkCreateVisits", () => {
    it("should return 201 and a success message", async () => {
      const mockVisits = [
        { id: 1, user_id: 2, country_id: 1 },
        { id: 2, user_id: 2, country_id: 2 },
      ];

      jest.spyOn(VisitedLocation, "bulkCreate").mockResolvedValue(mockVisits);

      const mockReq = {
        body: { country_ids: [1, 2] },
        user: { id: 2 },
      };

      await visitedController.bulkCreateVisits(mockReq, mockResponse);

      expect(VisitedLocation.bulkCreate).toHaveBeenCalledWith(2, [1, 2]);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: "2 countries logged successfully",
        visits: mockVisits,
      });
    });

    it("should return 400 if country_ids is missing", async () => {
      jest.spyOn(VisitedLocation, "bulkCreate").mockRejectedValue(
        new Error("user_id and country_ids are required")
      );

      const mockReq = {
        body: {},
        user: { id: 2 },
      };

      await visitedController.bulkCreateVisits(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteVisit", () => {
    it("should return 200 and deleted visit", async () => {
      const mockDeleted = { id: 1, user_id: 2, country_id: 1 };

      jest.spyOn(VisitedLocation, "delete").mockResolvedValue(mockDeleted);

      const mockReq = { params: { id: 1 }, user: { id: 2 } };

      await visitedController.deleteVisit(mockReq, mockResponse);

      expect(VisitedLocation.delete).toHaveBeenCalledWith(1, 2);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Visit deleted",
        deleted: mockDeleted,
      });
    });

    it("should return 404 if visit not found", async () => {
      jest.spyOn(VisitedLocation, "delete").mockRejectedValue(
        new Error("Visit not found or does not belong to this user")
      );

      const mockReq = { params: { id: 99999 }, user: { id: 2 } };

      await visitedController.deleteVisit(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Visit not found or does not belong to this user",
      });
    });
  });

  describe("getVisitedByUser", () => {
    it("should return 200 and array of visits", async () => {
      const mockVisits = [
        { id: 1, country_name: "France", iso_code: "FR" },
        { id: 2, country_name: "Japan", iso_code: "JP" },
      ];

      jest.spyOn(VisitedLocation, "getByUser").mockResolvedValue(mockVisits);

      const mockReq = { params: { userId: 2 } };

      await visitedController.getVisitedByUser(mockReq, mockResponse);

      expect(VisitedLocation.getByUser).toHaveBeenCalledWith(2);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockVisits);
    });

    it("should return 404 if getVisitedByUser fails", async () => {
    jest.spyOn(VisitedLocation, "getByUser").mockRejectedValue(
        new Error("No visits found")
    );

    const mockReq = { params: { userId: 99999 } };

    await visitedController.getVisitedByUser(mockReq, mockResponse);
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: "No visits found" });
    });
  });
});

// ─── Trip Controller ──────────────────────────────────────
describe("Trip controller", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe("createTrip", () => {
    it("should return 201 and the new trip", async () => {
      const mockTrip = {
        id: 1,
        user_id: 2,
        title: "Euro Summer",
        share_token: "abc-123",
        mood: "Adventurous",
        total_days: 7,
      };

      jest.spyOn(Trip, "create").mockResolvedValue(mockTrip);

      const mockReq = {
        body: { title: "Euro Summer", mood: "Adventurous", total_days: 7 },
        user: { id: 2 },
      };

      await tripController.createTrip(mockReq, mockResponse);

      expect(Trip.create).toHaveBeenCalledWith({
        user_id: 2,
        title: "Euro Summer",
        start_date: undefined,
        end_date: undefined,
        total_days: 7,
        notes: undefined,
        mood: "Adventurous",
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockTrip);
    });

    it("should return 400 if title is missing", async () => {
      jest.spyOn(Trip, "create").mockRejectedValue(
        new Error("user_id and title are required")
      );

      const mockReq = {
        body: { mood: "Relaxing" },
        user: { id: 2 },
      };

      await tripController.createTrip(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "user_id and title are required",
      });
    });
  });

  describe("getTripsByUser", () => {
    it("should return 200 and array of trips", async () => {
      const mockTrips = [
        { id: 1, title: "Euro Summer", countries_count: "3" },
      ];

      jest.spyOn(Trip, "getByUser").mockResolvedValue(mockTrips);

      const mockReq = { params: { userId: 2 } };

      await tripController.getTripsByUser(mockReq, mockResponse);

      expect(Trip.getByUser).toHaveBeenCalledWith(2);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockTrips);
    });

    it("should return 404 if getTripsByUser fails", async () => {
    jest.spyOn(Trip, "getByUser").mockRejectedValue(
        new Error("No trips found")
    );
    const mockReq = { params: { userId: 99999 } };
    await tripController.getTripsByUser(mockReq, mockResponse);
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: "No trips found" });
    });
  });

  describe("getTripById", () => {
    it("should return 200 and trip with visits and images", async () => {
      const mockTrip = {
        id: 1,
        title: "Euro Summer",
        visits: [],
        images: [],
      };

      jest.spyOn(Trip, "getById").mockResolvedValue(mockTrip);

      const mockReq = { params: { id: 1 } };

      await tripController.getTripById(mockReq, mockResponse);

      expect(Trip.getById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockTrip);
    });

    it("should return 404 if trip not found", async () => {
      jest.spyOn(Trip, "getById").mockRejectedValue(
        new Error("Trip not found")
      );

      const mockReq = { params: { id: 99999 } };

      await tripController.getTripById(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "Trip not found" });
    });
  });

  describe("getTripByToken", () => {
    it("should return 200 and trip by share token", async () => {
      const mockTrip = {
        id: 1,
        title: "Euro Summer",
        share_token: "abc-123",
        visits: [],
        images: [],
      };

      jest.spyOn(Trip, "getByToken").mockResolvedValue(mockTrip);

      const mockReq = { params: { token: "abc-123" } };

      await tripController.getTripByToken(mockReq, mockResponse);

      expect(Trip.getByToken).toHaveBeenCalledWith("abc-123");
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockTrip);
    });

    it("should return 404 for invalid token", async () => {
      jest.spyOn(Trip, "getByToken").mockRejectedValue(
        new Error("Trip not found")
      );

      const mockReq = { params: { token: "invalid" } };

      await tripController.getTripByToken(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe("updateTrip", () => {
    it("should return 200 and updated trip", async () => {
      const mockUpdated = { id: 1, mood: "Relaxing", title: "Euro Summer" };

      jest.spyOn(Trip, "update").mockResolvedValue(mockUpdated);

      const mockReq = {
        params: { id: 1 },
        user: { id: 2 },
        body: { mood: "Relaxing" },
      };

      await tripController.updateTrip(mockReq, mockResponse);

      expect(Trip.update).toHaveBeenCalledWith(1, 2, { mood: "Relaxing" });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUpdated);
    });

    it("should return 400 if trip not found or not owned", async () => {
      jest.spyOn(Trip, "update").mockRejectedValue(
        new Error("Trip not found or does not belong to this user")
      );

      const mockReq = {
        params: { id: 99999 },
        user: { id: 2 },
        body: { mood: "Wild" },
      };

      await tripController.updateTrip(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteTrip", () => {
    it("should return 200 and deleted trip", async () => {
      const mockDeleted = { id: 1, title: "Euro Summer" };

      jest.spyOn(Trip, "delete").mockResolvedValue(mockDeleted);

      const mockReq = { params: { id: 1 }, user: { id: 2 } };

      await tripController.deleteTrip(mockReq, mockResponse);

      expect(Trip.delete).toHaveBeenCalledWith(1, 2);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Trip deleted",
        deleted: mockDeleted,
      });
    });

    it("should return 404 if trip not found", async () => {
      jest.spyOn(Trip, "delete").mockRejectedValue(
        new Error("Trip not found or does not belong to this user")
      );

      const mockReq = { params: { id: 99999 }, user: { id: 2 } };

      await tripController.deleteTrip(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  describe("addImage", () => {
    it("should return 400 if no file provided", async () => {
      const mockReq = {
        params: { id: 1 },
        file: null,
        body: {},
      };

      await tripController.addImage(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "No image file provided",
      });
    });

    it("should return 201 and the new image", async () => {
      const mockImage = {
        id: 1,
        trip_id: 1,
        image_url: "https://res.cloudinary.com/test/image.jpg",
        caption: "Test caption",
      };

      jest.spyOn(Trip, "addImage").mockResolvedValue(mockImage);

      const mockReq = {
        params: { id: 1 },
        file: { path: "https://res.cloudinary.com/test/image.jpg" },
        body: { caption: "Test caption" },
      };

      await tripController.addImage(mockReq, mockResponse);

      expect(Trip.addImage).toHaveBeenCalledWith(
        1,
        "https://res.cloudinary.com/test/image.jpg",
        "Test caption"
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockImage);
    });

    it("should return 400 if addImage throws", async () => {
    jest.spyOn(Trip, "addImage").mockRejectedValue(
        new Error("Upload failed")
    );
    const mockReq = {
        params: { id: 1 },
        file: { path: "https://res.cloudinary.com/test/image.jpg" },
        body: { caption: "test" },
    };
    await tripController.addImage(mockReq, mockResponse);
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({ error: "Upload failed" });
    });
  });

  describe("getImages", () => {
    it("should return 200 and images array from getImages", async () => {
    const mockImages = [
        { id: 1, trip_id: 1, image_url: "https://res.cloudinary.com/test/image.jpg" },
    ];
    jest.spyOn(Trip, "getImages").mockResolvedValue(mockImages);
    const mockReq = { params: { id: 1 } };
    await tripController.getImages(mockReq, mockResponse);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(mockImages);
    });

    it("should return 404 if getImages fails", async () => {
    jest.spyOn(Trip, "getImages").mockRejectedValue(
        new Error("No images found")
    );
    const mockReq = { params: { id: 99999 } };
    await tripController.getImages(mockReq, mockResponse);
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({ error: "No images found" });
    });
  });
});

// ─── Stats Controller ─────────────────────────────────────
describe("Stats controller", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe("getStats", () => {
    it("should return 200 with stats, continents and recentVisit", async () => {
      const mockStats = {
        countries_visited: "6",
        continents_visited: "3",
        cities_visited: "0",
        trips_taken: "0",
      };
      const mockContinents = [
        { continent: "Europe", countries_count: "3" },
        { continent: "Asia", countries_count: "2" },
      ];
      const mockRecentVisit = {
        country_name: "France",
        iso_code: "FR",
        flag_url: "https://flagcdn.com/fr.svg",
      };

      jest.spyOn(UserStats, "getStats").mockResolvedValue(mockStats);
      jest.spyOn(UserStats, "getContinentBreakdown").mockResolvedValue(mockContinents);
      jest.spyOn(UserStats, "getMostRecentVisit").mockResolvedValue(mockRecentVisit);

      const mockReq = { params: { userId: 2 } };

      await statsController.getStats(mockReq, mockResponse);

      expect(UserStats.getStats).toHaveBeenCalledWith(2);
      expect(UserStats.getContinentBreakdown).toHaveBeenCalledWith(2);
      expect(UserStats.getMostRecentVisit).toHaveBeenCalledWith(2);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        stats: mockStats,
        continents: mockContinents,
        recentVisit: mockRecentVisit,
      });
    });

    it("should return 500 if stats query fails", async () => {
      jest.spyOn(UserStats, "getStats").mockRejectedValue(
        new Error("DB error")
      );

      const mockReq = { params: { userId: 2 } };

      await statsController.getStats(mockReq, mockResponse);

      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });
});