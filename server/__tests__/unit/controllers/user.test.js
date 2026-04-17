const userController = require("../../../controllers/user");
const User = require("../../../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mock response helpers
const mockSend = jest.fn();
const mockJson = jest.fn();
const mockEnd = jest.fn();

const mockStatus = jest.fn(() => ({
  send: mockSend,
  json: mockJson,
  end: mockEnd,
}));

const mockRes = {
  status: mockStatus,
};

describe("User controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BCRYPT_SALT_ROUNDS = "10";
    process.env.SECRET_TOKEN = "testsecret";
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("register", () => {
    it("should return a new user with a 201 status code", async () => {
      // Arrange
      const testUser = {
        username: "maya",
        email: "maya@test.com",
        password: "plainPassword",
        home_country: "Spain",
      };

      const createdUser = {
        id: 1,
        username: "maya",
        email: "maya@test.com",
        password: "hashedPassword",
        home_country: "Spain",
      };

      const mockReq = { body: { ...testUser } };

      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt");
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");
      jest.spyOn(User, "create").mockResolvedValue(createdUser);

      // Act
      await userController.register(mockReq, mockRes);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith("plainPassword", "salt");
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(User.create).toHaveBeenCalledWith({
        username: "maya",
        email: "maya@test.com",
        password: "hashedPassword",
        home_country: "Spain",
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(createdUser);
    });

    it("should return 400 if registration fails in create", async () => {
      // Arrange
      const mockReq = {
        body: {
          username: "maya",
          email: "maya@test.com",
          password: "plainPassword",
          home_country: "Spain",
        },
      };

      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt");
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedPassword");
      jest
        .spyOn(User, "create")
        .mockRejectedValue(new Error("Email already in use"));

      // Act
      await userController.register(mockReq, mockRes);

      // Assert
      expect(User.create).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Email already in use",
      });
    });

    it("should return 400 if salt generation fails", async () => {
      // Arrange
      const mockReq = {
        body: {
          username: "maya",
          email: "maya@test.com",
          password: "plainPassword",
          home_country: "Spain",
        },
      };

      jest
        .spyOn(bcrypt, "genSalt")
        .mockRejectedValue(new Error("Salt generation failed"));

      // Act
      await userController.register(mockReq, mockRes);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Salt generation failed",
      });
    });

    it("should return 400 if password hashing fails", async () => {
      // Arrange
      const mockReq = {
        body: {
          username: "maya",
          email: "maya@test.com",
          password: "plainPassword",
          home_country: "Spain",
        },
      };

      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt");
      jest
        .spyOn(bcrypt, "hash")
        .mockRejectedValue(new Error("Password hashing failed"));

      // Act
      await userController.register(mockReq, mockRes);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith("plainPassword", "salt");
      expect(User.create).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Password hashing failed",
      });
    });
  });

  describe("login", () => {
    it("should return a token with status 200 when login is successful", async () => {
      // Arrange
      const mockReq = {
        body: {
          email: "maya@test.com",
          password: "plainPassword",
        },
      };

      const testUser = {
        id: 1,
        username: "maya",
        email: "maya@test.com",
        password: "hashedPassword",
        home_country: "Spain",
      };

      jest.spyOn(User, "getByEmail").mockResolvedValue(testUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue("mockToken");

      // Act
      await userController.login(mockReq, mockRes);

      // Assert
      expect(User.getByEmail).toHaveBeenCalledTimes(1);
      expect(User.getByEmail).toHaveBeenCalledWith("maya@test.com");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "plainPassword",
        "hashedPassword"
      );
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        token: "mockToken",
      });
    });

    it("should return 401 if user does not exist", async () => {
      // Arrange
      const mockReq = {
        body: {
          email: "missing@test.com",
          password: "plainPassword",
        },
      };

      jest.spyOn(User, "getByEmail").mockResolvedValue(null);

      // Act
      await userController.login(mockReq, mockRes);

      // Assert
      expect(User.getByEmail).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Invalid email or password",
      });
    });

    it("should return 401 if password is invalid", async () => {
      // Arrange
      const mockReq = {
        body: {
          email: "maya@test.com",
          password: "wrongPassword",
        },
      };

      const testUser = {
        id: 1,
        username: "maya",
        email: "maya@test.com",
        password: "hashedPassword",
      };

      jest.spyOn(User, "getByEmail").mockResolvedValue(testUser);
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

      // Act
      await userController.login(mockReq, mockRes);

      // Assert
      expect(User.getByEmail).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Invalid email or password",
      });
    });

    it("should return 500 if login fails", async () => {
      // Arrange
      const mockReq = {
        body: {
          email: "maya@test.com",
          password: "plainPassword",
        },
      };

      jest
        .spyOn(User, "getByEmail")
        .mockRejectedValue(new Error("Database error"));

      // Act
      await userController.login(mockReq, mockRes);

      // Assert
      expect(User.getByEmail).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("getProfile", () => {
    it("should return user profile with status 200", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
      };

      const testUser = {
        id: 1,
        username: "maya",
        email: "maya@test.com",
        password: "hashedPassword",
        home_country: "Spain",
      };

      jest.spyOn(User, "getById").mockResolvedValue(testUser);

      // Act
      await userController.getProfile(mockReq, mockRes);

      // Assert
      expect(User.getById).toHaveBeenCalledTimes(1);
      expect(User.getById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: {
          id: 1,
          username: "maya",
          email: "maya@test.com",
          home_country: "Spain",
        },
      });
    });

    it("should return 404 if profile user does not exist", async () => {
      // Arrange
      const mockReq = {
        user: { id: 999 },
      };

      jest.spyOn(User, "getById").mockResolvedValue(null);

      // Act
      await userController.getProfile(mockReq, mockRes);

      // Assert
      expect(User.getById).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        err: "User not found",
      });
    });

    it("should return 500 if profile retrieval fails", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
      };

      jest.spyOn(User, "getById").mockRejectedValue(new Error("User not found"));

      // Act
      await userController.getProfile(mockReq, mockRes);

      // Assert
      expect(User.getById).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "User not found",
      });
    });
  });

  describe("updateUser", () => {
    it("should update a user and return status 200", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
        body: {
          username: "updatedmaya",
          home_country: "Italy",
        },
      };

      const updatedUser = {
        id: 1,
        username: "updatedmaya",
        email: "maya@test.com",
        password: "hashedPassword",
        home_country: "Italy",
      };

      jest.spyOn(User, "update").mockResolvedValue(updatedUser);

      // Act
      await userController.updateUser(mockReq, mockRes);

      // Assert
      expect(User.update).toHaveBeenCalledTimes(1);
      expect(User.update).toHaveBeenCalledWith(1, {
        username: "updatedmaya",
        home_country: "Italy",
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: {
          id: 1,
          username: "updatedmaya",
          email: "maya@test.com",
          home_country: "Italy",
        },
      });
    });

    it("should hash password before updating if password is provided", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
        body: {
          password: "newPassword",
        },
      };

      const updatedUser = {
        id: 1,
        username: "maya",
        email: "maya@test.com",
        password: "hashedNewPassword",
        home_country: "Spain",
      };

      jest.spyOn(bcrypt, "genSalt").mockResolvedValue("salt");
      jest.spyOn(bcrypt, "hash").mockResolvedValue("hashedNewPassword");
      jest.spyOn(User, "update").mockResolvedValue(updatedUser);

      // Act
      await userController.updateUser(mockReq, mockRes);

      // Assert
      expect(bcrypt.genSalt).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", "salt");
      expect(User.update).toHaveBeenCalledWith(1, {
        password: "hashedNewPassword",
      });
      expect(mockStatus).toHaveBeenCalledWith(200);
    });

    it("should return 400 if no fields are provided", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
        body: {},
      };

      // Act
      await userController.updateUser(mockReq, mockRes);

      // Assert
      expect(User.update).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "No fields to update",
      });
    });

    it("should return 404 if user is not found", async () => {
      // Arrange
      const mockReq = {
        user: { id: 999 },
        body: { username: "ghost" },
      };

      jest.spyOn(User, "update").mockRejectedValue(new Error("User not found"));

      // Act
      await userController.updateUser(mockReq, mockRes);

      // Assert
      expect(User.update).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        err: "User not found",
      });
    });

    it("should return 500 if update fails unexpectedly", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
        body: { username: "newname" },
      };

      jest
        .spyOn(User, "update")
        .mockRejectedValue(new Error("Database update failed"));

      // Act
      await userController.updateUser(mockReq, mockRes);

      // Assert
      expect(User.update).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database update failed",
      });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user and return status 200", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
      };

      const deletedUser = {
        id: 1,
        username: "maya",
        email: "maya@test.com",
        password: "hashedPassword",
        home_country: "Spain",
      };

      jest.spyOn(User, "delete").mockResolvedValue(deletedUser);

      // Act
      await userController.deleteUser(mockReq, mockRes);

      // Assert
      expect(User.delete).toHaveBeenCalledTimes(1);
      expect(User.delete).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
        user: {
          id: 1,
          username: "maya",
          email: "maya@test.com",
          home_country: "Spain",
        },
      });
    });

    it("should return 404 if user is not found", async () => {
      // Arrange
      const mockReq = {
        user: { id: 999 },
      };

      jest.spyOn(User, "delete").mockRejectedValue(new Error("User not found"));

      // Act
      await userController.deleteUser(mockReq, mockRes);

      // Assert
      expect(User.delete).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        err: "User not found",
      });
    });

    it("should return 500 if delete fails", async () => {
      // Arrange
      const mockReq = {
        user: { id: 1 },
      };

      jest
        .spyOn(User, "delete")
        .mockRejectedValue(new Error("Database delete failed"));

      // Act
      await userController.deleteUser(mockReq, mockRes);

      // Assert
      expect(User.delete).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database delete failed",
      });
    });
  });
});