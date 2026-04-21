const friendsController = require("../../../controllers/friends");
const Friendship = require("../../../models/Friendship");
const User = require("../../../models/User");
const UserStats = require("../../../models/UserStats");
const db = require("../../../database/connect");

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

describe("Friends controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe("searchUsers", () => {
    it("should return 200 with matching users", async () => {
      const mockReq = {
        user: { id: 1 },
        query: { username: "maya" },
      };

      const users = [
        {
          id: 2,
          username: "maya",
          email: "maya@test.com",
          home_country: "Spain",
        },
      ];

      jest.spyOn(Friendship, "searchUsers").mockResolvedValue(users);

      await friendsController.searchUsers(mockReq, mockRes);

      expect(Friendship.searchUsers).toHaveBeenCalledWith(1, "maya");
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        users,
      });
    });

    it("should return 400 if username query is missing", async () => {
      const mockReq = {
        user: { id: 1 },
        query: { username: "   " },
      };

      await friendsController.searchUsers(mockReq, mockRes);

      expect(Friendship.searchUsers).not.toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Username query is required",
      });
    });

    it("should return 500 if search fails", async () => {
      const mockReq = {
        user: { id: 1 },
        query: { username: "maya" },
      };

      jest
        .spyOn(Friendship, "searchUsers")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.searchUsers(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("sendFriendRequest", () => {
    it("should return 201 when friend request is created", async () => {
      const mockReq = {
        user: { id: 1 },
        body: { receiver_id: 2 },
      };

      const request = {
        id: 1,
        requester_id: 1,
        receiver_id: 2,
        status: "pending",
      };

      jest.spyOn(Friendship, "existingRelationship").mockResolvedValue(null);
      jest.spyOn(Friendship, "createRequest").mockResolvedValue(request);

      await friendsController.sendFriendRequest(mockReq, mockRes);

      expect(Friendship.existingRelationship).toHaveBeenCalledWith(1, 2);
      expect(Friendship.createRequest).toHaveBeenCalledWith(1, 2);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        request,
      });
    });

    it("should return 400 if receiver_id is missing", async () => {
      const mockReq = {
        user: { id: 1 },
        body: {},
      };

      await friendsController.sendFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "receiver_id is required",
      });
    });

    it("should return 400 if user tries to add themselves", async () => {
      const mockReq = {
        user: { id: 1 },
        body: { receiver_id: 1 },
      };

      await friendsController.sendFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "You cannot add yourself",
      });
    });

    it("should return 400 if relationship already exists", async () => {
      const mockReq = {
        user: { id: 1 },
        body: { receiver_id: 2 },
      };

      jest.spyOn(Friendship, "existingRelationship").mockResolvedValue({
        id: 1,
        requester_id: 1,
        receiver_id: 2,
        status: "pending",
      });

      await friendsController.sendFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Friend request or friendship already exists",
      });
    });

    it("should return 500 if request creation fails", async () => {
      const mockReq = {
        user: { id: 1 },
        body: { receiver_id: 2 },
      };

      jest.spyOn(Friendship, "existingRelationship").mockResolvedValue(null);
      jest
        .spyOn(Friendship, "createRequest")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.sendFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("getFriendRequests", () => {
    it("should return 200 with incoming and outgoing requests", async () => {
      const mockReq = {
        user: { id: 1 },
      };

      const requests = {
        incoming: [{ id: 1, username: "maya" }],
        outgoing: [{ id: 2, username: "alex" }],
      };

      jest.spyOn(Friendship, "getRequests").mockResolvedValue(requests);

      await friendsController.getFriendRequests(mockReq, mockRes);

      expect(Friendship.getRequests).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        requests,
      });
    });

    it("should return 500 if fetching requests fails", async () => {
      const mockReq = {
        user: { id: 1 },
      };

      jest
        .spyOn(Friendship, "getRequests")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.getFriendRequests(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("acceptFriendRequest", () => {
    it("should return 200 when request is accepted", async () => {
      const mockReq = {
        user: { id: 2 },
        params: { id: "1" },
      };

      const request = {
        id: 1,
        requester_id: 1,
        receiver_id: 2,
        status: "accepted",
      };

      jest.spyOn(Friendship, "updateRequestStatus").mockResolvedValue(request);

      await friendsController.acceptFriendRequest(mockReq, mockRes);

      expect(Friendship.updateRequestStatus).toHaveBeenCalledWith(
        1,
        2,
        "accepted",
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        request,
      });
    });

    it("should return 404 if request is not found", async () => {
      const mockReq = {
        user: { id: 2 },
        params: { id: "1" },
      };

      jest
        .spyOn(Friendship, "updateRequestStatus")
        .mockRejectedValue(new Error("Friend request not found"));

      await friendsController.acceptFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Friend request not found",
      });
    });

    it("should return 500 if accept fails unexpectedly", async () => {
      const mockReq = {
        user: { id: 2 },
        params: { id: "1" },
      };

      jest
        .spyOn(Friendship, "updateRequestStatus")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.acceptFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("declineFriendRequest", () => {
    it("should return 200 when request is declined", async () => {
      const mockReq = {
        user: { id: 2 },
        params: { id: "1" },
      };

      const request = {
        id: 1,
        requester_id: 1,
        receiver_id: 2,
        status: "declined",
      };

      jest.spyOn(Friendship, "updateRequestStatus").mockResolvedValue(request);

      await friendsController.declineFriendRequest(mockReq, mockRes);

      expect(Friendship.updateRequestStatus).toHaveBeenCalledWith(
        1,
        2,
        "declined",
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        request,
      });
    });

    it("should return 404 if request is not found", async () => {
      const mockReq = {
        user: { id: 2 },
        params: { id: "1" },
      };

      jest
        .spyOn(Friendship, "updateRequestStatus")
        .mockRejectedValue(new Error("Friend request not found"));

      await friendsController.declineFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Friend request not found",
      });
    });

    it("should return 500 if decline fails unexpectedly", async () => {
      const mockReq = {
        user: { id: 2 },
        params: { id: "1" },
      };

      jest
        .spyOn(Friendship, "updateRequestStatus")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.declineFriendRequest(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("getFriends", () => {
    it("should return 200 with friends list", async () => {
      const mockReq = {
        user: { id: 1 },
      };

      const friends = [
        { id: 2, username: "maya" },
        { id: 3, username: "alex" },
      ];

      jest.spyOn(Friendship, "getFriends").mockResolvedValue(friends);

      await friendsController.getFriends(mockReq, mockRes);

      expect(Friendship.getFriends).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        friends,
      });
    });

    it("should return 500 if getting friends fails", async () => {
      const mockReq = {
        user: { id: 1 },
      };

      jest
        .spyOn(Friendship, "getFriends")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.getFriends(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("removeFriend", () => {
    it("should return 200 when friend is removed", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "removeFriend").mockResolvedValue({
        id: 1,
        requester_id: 1,
        receiver_id: 2,
      });

      await friendsController.removeFriend(mockReq, mockRes);

      expect(Friendship.removeFriend).toHaveBeenCalledWith(1, 2);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Friend removed successfully",
      });
    });

    it("should return 404 if friendship is not found", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest
        .spyOn(Friendship, "removeFriend")
        .mockRejectedValue(new Error("Friendship not found"));

      await friendsController.removeFriend(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Friendship not found",
      });
    });

    it("should return 500 if remove fails unexpectedly", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest
        .spyOn(Friendship, "removeFriend")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.removeFriend(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("compareWithFriend", () => {
    it("should return 200 with comparison data", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "areFriends").mockResolvedValue(true);

      jest
        .spyOn(UserStats, "getStats")
        .mockResolvedValueOnce({
          countries_visited: "3",
          continents_visited: "2",
        })
        .mockResolvedValueOnce({
          countries_visited: "3",
          continents_visited: "2",
        });

      jest
        .spyOn(db, "query")
        .mockResolvedValueOnce({
          rows: [{ country_id: 1 }, { country_id: 2 }, { country_id: 3 }],
        })
        .mockResolvedValueOnce({
          rows: [{ country_id: 1 }, { country_id: 2 }, { country_id: 4 }],
        })
        .mockResolvedValueOnce({
          rows: [
            { id: 1, name: "Spain", iso_code: "ES", flag_url: "es.png" },
            { id: 2, name: "Italy", iso_code: "IT", flag_url: "it.png" },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 3, name: "India", iso_code: "IN", flag_url: "in.png" }],
        })
        .mockResolvedValueOnce({
          rows: [{ id: 4, name: "France", iso_code: "FR", flag_url: "fr.png" }],
        });

      await friendsController.compareWithFriend(mockReq, mockRes);

      expect(Friendship.areFriends).toHaveBeenCalledWith(1, 2);
      expect(UserStats.getStats).toHaveBeenNthCalledWith(1, 1);
      expect(UserStats.getStats).toHaveBeenNthCalledWith(2, 2);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        comparison: {
          my_stats: {
            countries_visited: 3,
            continents_visited: 2,
            world_coverage_percent: 2,
          },
          friend_stats: {
            countries_visited: 3,
            continents_visited: 2,
            world_coverage_percent: 2,
          },
          overlap: {
            common_count: 2,
            common_countries: [
              { id: 1, name: "Spain", iso_code: "ES", flag_url: "es.png" },
              { id: 2, name: "Italy", iso_code: "IT", flag_url: "it.png" },
            ],
            only_mine_count: 1,
            only_mine: [
              { id: 3, name: "India", iso_code: "IN", flag_url: "in.png" },
            ],
            only_theirs_count: 1,
            only_theirs: [
              { id: 4, name: "France", iso_code: "FR", flag_url: "fr.png" },
            ],
          },
        },
      });
    });

    it("should return 403 if users are not friends", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "areFriends").mockResolvedValue(false);

      await friendsController.compareWithFriend(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        err: "You can only compare with friends",
      });
    });

    it("should return 500 if comparison fails", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "areFriends").mockResolvedValue(true);
      jest
        .spyOn(UserStats, "getStats")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.compareWithFriend(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });

  describe("getFriendProfile", () => {
    it("should return 200 with friend profile data", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "areFriends").mockResolvedValue(true);
      jest.spyOn(User, "getById").mockResolvedValue({
        id: 2,
        username: "maya",
        email: "maya@test.com",
        home_country: "Spain",
      });

      jest.spyOn(UserStats, "getStats").mockResolvedValue({
        countries_visited: "12",
        continents_visited: "3",
      });

      jest.spyOn(UserStats, "getContinentBreakdown").mockResolvedValue([
        { continent: "Europe", countries_count: "6" },
        { continent: "Asia", countries_count: "4" },
      ]);

      jest.spyOn(UserStats, "getMostRecentVisit").mockResolvedValue({
        country_name: "Italy",
        iso_code: "IT",
      });

      await friendsController.getFriendProfile(mockReq, mockRes);

      expect(Friendship.areFriends).toHaveBeenCalledWith(1, 2);
      expect(User.getById).toHaveBeenCalledWith(2);
      expect(UserStats.getStats).toHaveBeenCalledWith(2);
      expect(UserStats.getContinentBreakdown).toHaveBeenCalledWith(2);
      expect(UserStats.getMostRecentVisit).toHaveBeenCalledWith(2);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: {
          id: 2,
          username: "maya",
          email: "maya@test.com",
          home_country: "Spain",
        },
        stats: {
          countries_visited: 12,
          continents_visited: 3,
        },
        continent_breakdown: [
          { continent: "Europe", countries_count: 6 },
          { continent: "Asia", countries_count: 4 },
          { world_coverage_percent: 2 },
        ],
        most_recent_visit: {
          country_name: "Italy",
          iso_code: "IT",
        },
      });
    });

    it("should return 403 if users are not friends", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "areFriends").mockResolvedValue(false);

      await friendsController.getFriendProfile(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        err: "You can only view profiles of friends",
      });
    });

    it("should return 404 if user is not found", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "areFriends").mockResolvedValue(true);
      jest
        .spyOn(User, "getById")
        .mockRejectedValue(new Error("User not found"));

      await friendsController.getFriendProfile(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        err: "User not found",
      });
    });

    it("should return 500 if profile fetch fails unexpectedly", async () => {
      const mockReq = {
        user: { id: 1 },
        params: { friendId: "2" },
      };

      jest.spyOn(Friendship, "areFriends").mockResolvedValue(true);
      jest.spyOn(User, "getById").mockResolvedValue({
        id: 2,
        username: "maya",
        email: "maya@test.com",
        home_country: "Spain",
      });
      jest
        .spyOn(UserStats, "getStats")
        .mockRejectedValue(new Error("Database error"));

      await friendsController.getFriendProfile(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        err: "Database error",
      });
    });
  });
});
