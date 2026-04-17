const jwt = require("jsonwebtoken");
const authenticator = require("../../../middleware/authenticator");
const logRoutes = require("../../../middleware/logger");

jest.mock("jsonwebtoken");

const mockSend = jest.fn();
const mockJson = jest.fn();
const mockEnd = jest.fn();

const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd,
}));

const mockNext = jest.fn();
const mockResponse = { status: mockStatus };

// ─── Authenticator ────────────────────────────────────────
describe("authenticator middleware", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  it("should call next() and set req.user if token is valid", () => {
    const mockReq = {
      headers: { authorization: "Bearer validToken" },
    };
    const mockDecoded = { id: 1, username: "testuser" };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, mockDecoded);
    });

    authenticator(mockReq, mockResponse, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken",
      process.env.SECRET_TOKEN,
      expect.any(Function)
    );
    expect(mockReq.user).toEqual(mockDecoded);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockStatus).not.toHaveBeenCalled();
  });

  it("should return 403 if token is invalid", () => {
    const mockReq = {
      headers: { authorization: "Bearer invalidToken" },
    };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("Invalid token"), null);
    });

    authenticator(mockReq, mockResponse, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({ err: "Invalid token" });
  });

  it("should return 403 if authorization header is missing", () => {
    const mockReq = { headers: {} };

    authenticator(mockReq, mockResponse, mockNext);

    expect(jwt.verify).not.toHaveBeenCalled();
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({ err: "No token provided" });
  });

  it("should return 403 if token is missing after Bearer", () => {
    const mockReq = {
      headers: { authorization: "Bearer " },
    };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error("Invalid token"), null);
    });

    authenticator(mockReq, mockResponse, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(403);
  });
});

// ─── Logger ───────────────────────────────────────────────
describe("logRoutes middleware", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  it("should log the method and url then call next()", () => {
    const mockReq = { method: "GET", originalUrl: "/test" };
    const mockRes = {};
    const mockNext = jest.fn();

    jest.spyOn(console, "log").mockImplementation(() => {});

    logRoutes(mockReq, mockRes, mockNext);

    expect(console.log).toHaveBeenCalledWith("GET", "/test");
    expect(mockNext).toHaveBeenCalledTimes(1);

    console.log.mockRestore();
  });

  it("should call next() for any route", () => {
    const mockReq = { method: "POST", originalUrl: "/user/login" };
    const mockRes = {};
    const mockNext = jest.fn();

    jest.spyOn(console, "log").mockImplementation(() => {});

    logRoutes(mockReq, mockRes, mockNext);

    expect(console.log).toHaveBeenCalledWith("POST", "/user/login");
    expect(mockNext).toHaveBeenCalledTimes(1);

    console.log.mockRestore();
  });
});

// ─── Upload middleware ────────────────────────────────────
describe("upload middleware", () => {
  it("should be a valid multer middleware function", () => {
    const upload = require("../../../middleware/upload");
    expect(upload).toBeDefined();
    expect(typeof upload.single).toBe("function");
    expect(typeof upload.array).toBe("function");
  });

  it("should expose a single() method for single file uploads", () => {
    const upload = require("../../../middleware/upload");
    const middleware = upload.single("image");
    expect(typeof middleware).toBe("function");
  });
});