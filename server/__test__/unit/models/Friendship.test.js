const db = require("../../../database/connect");
const Friendship = require("../../../models/Friendship");

describe("Friendship", () => {
  beforeEach(() => jest.clearAllMocks());
  afterAll(() => jest.resetAllMocks());

  describe("searchUsers", () => {
    it("resolves with matching users on successful db query", async () => {
      // Arrange
      const mockUsers = [
        {
          id: 2,
          username: "maya",
          email: "maya@test.com",
          home_country: "Spain",
        },
        {
          id: 3,
          username: "mayank",
          email: "mayank@test.com",
          home_country: "India",
        },
      ];

      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: mockUsers });

      // Act
      const result = await Friendship.searchUsers(1, "may");

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        `
      SELECT id, username, email, home_country
      FROM users
      WHERE id <> $1
      AND username ILIKE $2
      ORDER BY username ASC
      `,
        [1, "%may%"],
      );
      expect(result).toEqual(mockUsers);
    });

    it("resolves with empty array when no users match", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await Friendship.searchUsers(1, "zzz");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("existingRelationship", () => {
    it("resolves with an existing relationship if found", async () => {
      // Arrange
      const relationship = {
        id: 1,
        requester_id: 1,
        receiver_id: 2,
        status: "pending",
      };

      jest.spyOn(db, "query").mockResolvedValueOnce({
        rows: [relationship],
      });

      // Act
      const result = await Friendship.existingRelationship(1, 2);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        `
      SELECT * FROM friendships
      WHERE (requester_id = $1 AND receiver_id = $2)
         OR (requester_id = $2 AND receiver_id = $1)
      `,
        [1, 2],
      );
      expect(result).toEqual(relationship);
    });

    it("resolves with null when no relationship exists", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await Friendship.existingRelationship(1, 2);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("createRequest", () => {
    it("resolves with a Friendship instance on successful creation", async () => {
      // Arrange
      const createdRow = {
        id: 1,
        requester_id: 1,
        receiver_id: 2,
        status: "pending",
        created_at: "2026-04-20T10:00:00.000Z",
        updated_at: "2026-04-20T10:00:00.000Z",
      };

      jest.spyOn(db, "query").mockResolvedValueOnce({
        rows: [createdRow],
      });

      // Act
      const result = await Friendship.createRequest(1, 2);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        `
      INSERT INTO friendships (requester_id, receiver_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
        [1, 2],
      );
      expect(result).toBeInstanceOf(Friendship);
      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("requester_id", 1);
      expect(result).toHaveProperty("receiver_id", 2);
      expect(result).toHaveProperty("status", "pending");
    });
  });

  describe("getRequests", () => {
    it("resolves with incoming and outgoing requests", async () => {
      // Arrange
      const incomingRows = [
        {
          id: 1,
          requester_id: 2,
          receiver_id: 1,
          status: "pending",
          username: "maya",
          email: "maya@test.com",
          home_country: "Spain",
        },
      ];

      const outgoingRows = [
        {
          id: 2,
          requester_id: 1,
          receiver_id: 3,
          status: "pending",
          username: "alex",
          email: "alex@test.com",
          home_country: "Italy",
        },
      ];

      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({ rows: incomingRows })
        .mockResolvedValueOnce({ rows: outgoingRows });

      // Act
      const result = await Friendship.getRequests(1);

      // Assert
      expect(db.query).toHaveBeenNthCalledWith(
        1,
        `
      SELECT f.*, u.username, u.email, u.home_country
      FROM friendships f
      JOIN users u ON f.requester_id = u.id
      WHERE f.receiver_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
      `,
        [1],
      );

      expect(db.query).toHaveBeenNthCalledWith(
        2,
        `
      SELECT f.*, u.username, u.email, u.home_country
      FROM friendships f
      JOIN users u ON f.receiver_id = u.id
      WHERE f.requester_id = $1 AND f.status = 'pending'
      ORDER BY f.created_at DESC
      `,
        [1],
      );

      expect(result).toEqual({
        incoming: incomingRows,
        outgoing: outgoingRows,
      });
    });

    it("resolves with empty arrays when no requests exist", async () => {
      // Arrange
      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await Friendship.getRequests(1);

      // Assert
      expect(result).toEqual({
        incoming: [],
        outgoing: [],
      });
    });
  });

  describe("updateRequestStatus", () => {
    it("resolves with updated Friendship when request is found", async () => {
      // Arrange
      const updatedRow = {
        id: 1,
        requester_id: 2,
        receiver_id: 1,
        status: "accepted",
        created_at: "2026-04-20T10:00:00.000Z",
        updated_at: "2026-04-20T10:10:00.000Z",
      };

      jest.spyOn(db, "query").mockResolvedValueOnce({
        rows: [updatedRow],
      });

      // Act
      const result = await Friendship.updateRequestStatus(1, 1, "accepted");

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        `
      UPDATE friendships
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND receiver_id = $3 AND status = 'pending'
      RETURNING *
      `,
        ["accepted", 1, 1],
      );
      expect(result).toBeInstanceOf(Friendship);
      expect(result).toHaveProperty("status", "accepted");
    });

    it("should throw an error when request is not found", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act & Assert
      await expect(
        Friendship.updateRequestStatus(99, 1, "accepted"),
      ).rejects.toThrow("Friend request not found");
    });
  });

  describe("getFriends", () => {
    it("resolves with accepted friends", async () => {
      // Arrange
      const friends = [
        {
          id: 2,
          username: "maya",
          email: "maya@test.com",
          home_country: "Spain",
        },
        {
          id: 3,
          username: "alex",
          email: "alex@test.com",
          home_country: "Italy",
        },
      ];

      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: friends });

      // Act
      const result = await Friendship.getFriends(1);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.home_country
      FROM friendships f
      JOIN users u
        ON (
          (f.requester_id = $1 AND u.id = f.receiver_id)
          OR
          (f.receiver_id = $1 AND u.id = f.requester_id)
        )
      WHERE f.status = 'accepted'
      ORDER BY u.username ASC
      `,
        [1],
      );
      expect(result).toEqual(friends);
    });

    it("resolves with empty array when no friends exist", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await Friendship.getFriends(1);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("removeFriend", () => {
    it("resolves with deleted friendship row", async () => {
      // Arrange
      const deletedRow = {
        id: 1,
        requester_id: 1,
        receiver_id: 2,
        status: "accepted",
      };

      jest.spyOn(db, "query").mockResolvedValueOnce({
        rows: [deletedRow],
      });

      // Act
      const result = await Friendship.removeFriend(1, 2);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        `
      DELETE FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = $1 AND receiver_id = $2)
        OR
        (requester_id = $2 AND receiver_id = $1)
      )
      RETURNING *
      `,
        [1, 2],
      );
      expect(result).toEqual(deletedRow);
    });

    it("should throw an error when friendship is not found", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act & Assert
      await expect(Friendship.removeFriend(1, 99)).rejects.toThrow(
        "Friendship not found",
      );
    });
  });

  describe("areFriends", () => {
    it("resolves with true when users are accepted friends", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            requester_id: 1,
            receiver_id: 2,
            status: "accepted",
          },
        ],
      });

      // Act
      const result = await Friendship.areFriends(1, 2);

      // Assert
      expect(db.query).toHaveBeenCalledWith(
        `
      SELECT * FROM friendships
      WHERE status = 'accepted'
      AND (
        (requester_id = $1 AND receiver_id = $2)
        OR
        (requester_id = $2 AND receiver_id = $1)
      )
      `,
        [1, 2],
      );
      expect(result).toBe(true);
    });

    it("resolves with false when users are not friends", async () => {
      // Arrange
      jest.spyOn(db, "query").mockResolvedValueOnce({ rows: [] });

      // Act
      const result = await Friendship.areFriends(1, 2);

      // Assert
      expect(result).toBe(false);
    });
  });
});
