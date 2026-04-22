jest.mock("../../src/services/tokenService", () => ({
  getToken: jest.fn().mockResolvedValue("test-token"),
}));

jest.mock("axios", () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: { request: { use: jest.fn() } },
  };
  return { create: jest.fn(() => instance) };
});

const { getTripById, getTripsByUser, createTrip, updateTrip, addTripImage } =
  require("../../src/services/tripService");

describe("tripService", () => {
  let api;

  beforeAll(() => {
    api = jest.requireMock("axios").create();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTripById", () => {
    it("calls GET /trip/:id and returns the response data", async () => {
      api.get.mockResolvedValue({ data: { id: 42, title: "Japan" } });
      const result = await getTripById(42);
      expect(api.get).toHaveBeenCalledWith("/trip/42");
      expect(result).toEqual({ id: 42, title: "Japan" });
    });

    it("throws a formatted error message on failure", async () => {
      api.get.mockRejectedValue({ response: { data: { err: "Trip not found" } } });
      await expect(getTripById(42)).rejects.toThrow("Trip not found");
    });

    it("falls back to error.message when no err field is present", async () => {
      api.get.mockRejectedValue(new Error("Network Error"));
      await expect(getTripById(42)).rejects.toThrow("Network Error");
    });
  });

  describe("getTripsByUser", () => {
    it("calls GET /trip/user/:userId and returns the list", async () => {
      const trips = [{ id: 1 }, { id: 2 }];
      api.get.mockResolvedValue({ data: trips });
      const result = await getTripsByUser(1);
      expect(api.get).toHaveBeenCalledWith("/trip/user/1");
      expect(result).toHaveLength(2);
    });

    it("throws a formatted error on failure", async () => {
      api.get.mockRejectedValue({ response: { data: { err: "User not found" } } });
      await expect(getTripsByUser(999)).rejects.toThrow("User not found");
    });
  });

  describe("createTrip", () => {
    it("calls POST /trip with the provided trip data", async () => {
      const payload = { title: "Japan", start_date: "2025-03-01", end_date: "2025-03-14" };
      api.post.mockResolvedValue({ data: { id: 42, ...payload } });
      const result = await createTrip(payload);
      expect(api.post).toHaveBeenCalledWith("/trip", payload);
      expect(result.id).toBe(42);
      expect(result.title).toBe("Japan");
    });

    it("throws a formatted error on failure", async () => {
      api.post.mockRejectedValue({ response: { data: { err: "Validation error" } } });
      await expect(createTrip({})).rejects.toThrow("Validation error");
    });
  });

  describe("updateTrip", () => {
    it("calls PATCH /trip/:id with the update payload", async () => {
      const updates = { notes: "Great trip!" };
      api.patch.mockResolvedValue({ data: { id: 42, notes: "Great trip!" } });
      const result = await updateTrip(42, updates);
      expect(api.patch).toHaveBeenCalledWith("/trip/42", updates);
      expect(result.notes).toBe("Great trip!");
    });

    it("throws a formatted error on failure", async () => {
      api.patch.mockRejectedValue({ response: { data: { err: "Not authorised" } } });
      await expect(updateTrip(42, {})).rejects.toThrow("Not authorised");
    });
  });

  describe("addTripImage", () => {
    const mockAsset = { uri: "file://test.jpg", mimeType: "image/jpeg", fileName: "test.jpg" };

    it("calls POST /trip/:id/images with a FormData body", async () => {
      api.post.mockResolvedValue({
        data: { id: 1, trip_id: 42, image_url: "https://res.cloudinary.com/photo.jpg" },
      });
      await addTripImage(42, mockAsset);
      expect(api.post).toHaveBeenCalledWith(
        "/trip/42/images",
        expect.any(FormData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    });

    it("returns the saved image record from the response", async () => {
      const savedImage = { id: 1, trip_id: 42, image_url: "https://res.cloudinary.com/photo.jpg" };
      api.post.mockResolvedValue({ data: savedImage });
      const result = await addTripImage(42, mockAsset);
      expect(result).toEqual(savedImage);
    });

    it("throws a formatted error on upload failure", async () => {
      api.post.mockRejectedValue({ response: { data: { err: "Upload failed" } } });
      await expect(addTripImage(42, mockAsset)).rejects.toThrow("Upload failed");
    });

    it("uses image/jpeg as the default mime type when not provided", async () => {
      api.post.mockResolvedValue({ data: { id: 1, image_url: "https://example.com/img.jpg" } });
      await addTripImage(42, { uri: "file://test.jpg" });
      expect(api.post).toHaveBeenCalled();
    });
  });
});
