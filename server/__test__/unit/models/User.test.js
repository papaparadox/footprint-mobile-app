const db = require("../../../database/connect");
const User = require("../../../models/User");

describe("User", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe("getUsers", () => {
    it("resolves with users on a successful db query", async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          username: "maya",
          email: "maya@test.com",
          password: "hashedpass",
          home_country: "Spain",
        },
        {
          id: 2,
          username: "alex",
          email: "alex@test.com",
          password: "hashedpass2",
          home_country: "Italy",
        },
      ];

      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockUsers });

      // Act
      const users = await User.getUsers();

      // Assert
      expect(users).toHaveLength(2);
      expect(users[0]).toBeInstanceOf(User);
      expect(users[0]).toHaveProperty("id", 1);
      expect(users[0]).toHaveProperty("username", "maya");
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM users");
    });

    it("should throw an error when no users are found", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act & Assert
      await expect(User.getUsers()).rejects.toThrow("No users found");
    });
  });

  describe("getByEmail", () => {
    it("resolves with a user on successful db query", async () => {
      // Arrange
      const testUser = [
        {
          id: 1,
          username: "maya",
          email: "maya@test.com",
          password: "hashedpass",
          home_country: "Spain",
        },
      ];

      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: testUser });

      // Act
      const result = await User.getByEmail("maya@test.com");

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe("maya@test.com");
      expect(result.username).toBe("maya");
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE email = $1",
        ["maya@test.com"],
      );
    });

    it("should throw an error when no user is found", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act & Assert
      await expect(User.getByEmail("none@test.com")).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("getById", () => {
    it("resolves with a user on successful db query", async () => {
      // Arrange
      const testUser = [
        {
          id: 1,
          username: "maya",
          email: "maya@test.com",
          password: "hashedpass",
          home_country: "Spain",
        },
      ];

      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: testUser });

      // Act
      const result = await User.getById(1);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.username).toBe("maya");
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        [1],
      );
    });

    it("should throw an error when no user is found", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act & Assert
      await expect(User.getById(999)).rejects.toThrow("User not found");
    });
  });

  describe("create", () => {
    it("resolves with a user on successful creation", async () => {
      // Arrange
      const userData = {
        username: "maya",
        email: "maya@test.com",
        password: "hashedpass",
        home_country: "Spain",
      };

      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({ rows: [] }) // email check
        .mockResolvedValueOnce({
          rows: [{ id: 1, ...userData }],
        });

      // Act
      const result = await User.create(userData);

      // Assert
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        "SELECT * FROM users WHERE email = $1",
        [userData.email],
      );
      expect(db.query).toHaveBeenNthCalledWith(
        2,
        "INSERT INTO users (username, email, password, home_country) VALUES ($1, $2, $3, $4) RETURNING *",
        [
          userData.username,
          userData.email,
          userData.password,
          userData.home_country,
        ],
      );
      expect(result).toBeInstanceOf(User);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("username", "maya");
      expect(result).toHaveProperty("email", "maya@test.com");
    });

    it("should throw an error when required fields are missing", async () => {
      // Arrange
      const incompleteUserData = {
        username: "maya",
        email: "",
        password: "hashedpass",
        home_country: "Spain",
      };

      // Act & Assert
      await expect(User.create(incompleteUserData)).rejects.toThrow(
        "Missing required fields",
      );
    });

    it("should throw an error when email already exists", async () => {
      // Arrange
      const userData = {
        username: "maya",
        email: "maya@test.com",
        password: "hashedpass",
        home_country: "Spain",
      };

      jest.spyOn(db, "query").mockResolvedValueOnce({
        rows: [{ id: 1, ...userData }],
      });

      // Act & Assert
      await expect(User.create(userData)).rejects.toThrow(
        "Email already in use",
      );
    });
  });

  describe("update", () => {
    it("resolves with an updated user on successful db query", async () => {
      // Arrange
      const updatedRow = {
        id: 1,
        username: "updatedmaya",
        email: "maya@test.com",
        password: "hashedpass",
        home_country: "Spain",
      };

      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [updatedRow] });

      // Act
      const result = await User.update(1, { username: "updatedmaya" });

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.username).toBe("updatedmaya");
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE users SET username = $1 WHERE id = $2 RETURNING *",
        ["updatedmaya", 1],
      );
    });

    it("should throw an error when no fields are provided", async () => {
      // Act & Assert
      await expect(User.update(1, {})).rejects.toThrow("No fields to update");
    });

    it("should throw an error when user is not found", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act & Assert
      await expect(User.update(99, { username: "x" })).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("delete", () => {
    it("resolves with a deleted user on successful db query", async () => {
      // Arrange
      const deletedRow = {
        id: 1,
        username: "maya",
        email: "maya@test.com",
        password: "hashedpass",
        home_country: "Spain",
      };

      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [deletedRow] });

      // Act
      const result = await User.delete(1);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [1],
      );
    });

    it("should throw an error when user is not found", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act & Assert
      await expect(User.delete(999)).rejects.toThrow("User not found");
    });
  });
});