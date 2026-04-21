const Friendship = require("../models/Friendship");
const User = require("../models/User");
const db = require("../database/connect");
const UserStats = require("../models/UserStats");

async function searchUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const username = req.query.username || "";

    if (!username.trim()) {
      return res.status(400).json({ err: "Username query is required" });
    }

    const users = await Friendship.searchUsers(currentUserId, username.trim());

    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

async function sendFriendRequest(req, res) {
  try {
    const requesterId = req.user.id;
    const { receiver_id } = req.body;

    if (!receiver_id) {
      return res.status(400).json({ err: "receiver_id is required" });
    }

    if (requesterId === receiver_id) {
      return res.status(400).json({ err: "You cannot add yourself" });
    }

    const existing = await Friendship.existingRelationship(
      requesterId,
      receiver_id,
    );

    if (existing) {
      return res
        .status(400)
        .json({ err: "Friend request or friendship already exists" });
    }

    const request = await Friendship.createRequest(requesterId, receiver_id);

    res.status(201).json({
      success: true,
      request,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

async function getFriendRequests(req, res) {
  try {
    const userId = req.user.id;
    const requests = await Friendship.getRequests(userId);

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

async function acceptFriendRequest(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id);

    const request = await Friendship.updateRequestStatus(
      requestId,
      userId,
      "accepted",
    );

    res.status(200).json({
      success: true,
      request,
    });
  } catch (err) {
    if (err.message === "Friend request not found") {
      return res.status(404).json({ err: err.message });
    }

    res.status(500).json({ err: err.message });
  }
}

async function declineFriendRequest(req, res) {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.id);

    const request = await Friendship.updateRequestStatus(
      requestId,
      userId,
      "declined",
    );

    res.status(200).json({
      success: true,
      request,
    });
  } catch (err) {
    if (err.message === "Friend request not found") {
      return res.status(404).json({ err: err.message });
    }

    res.status(500).json({ err: err.message });
  }
}

async function getFriends(req, res) {
  try {
    const userId = req.user.id;
    const friends = await Friendship.getFriends(userId);

    res.status(200).json({
      success: true,
      friends,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

async function removeFriend(req, res) {
  try {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId);

    await Friendship.removeFriend(userId, friendId);

    res.status(200).json({
      success: true,
      message: "Friend removed successfully",
    });
  } catch (err) {
    if (err.message === "Friendship not found") {
      return res.status(404).json({ err: err.message });
    }

    res.status(500).json({ err: err.message });
  }
}

async function compareWithFriend(req, res) {
  try {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId);

    const isFriend = await Friendship.areFriends(userId, friendId);

    if (!isFriend) {
      return res.status(403).json({ err: "You can only compare with friends" });
    }

    // stats
    const myStats = await UserStats.getStats(userId);
    const friendStats = await UserStats.getStats(friendId);

    // visited countries by country_id for overlap comparison
    const myCountriesResult = await db.query(
      `SELECT DISTINCT country_id FROM visited_locations WHERE user_id = $1`,
      [userId],
    );

    const friendCountriesResult = await db.query(
      `SELECT DISTINCT country_id FROM visited_locations WHERE user_id = $1`,
      [friendId],
    );

    const myCountryIds = myCountriesResult.rows.map((row) => row.country_id);
    const friendCountryIds = friendCountriesResult.rows.map(
      (row) => row.country_id,
    );

    const commonCountryIds = myCountryIds.filter((countryId) =>
      friendCountryIds.includes(countryId),
    );

    const onlyMineIds = myCountryIds.filter(
      (countryId) => !friendCountryIds.includes(countryId),
    );

    const onlyTheirsIds = friendCountryIds.filter(
      (countryId) => !myCountryIds.includes(countryId),
    );

    // optional: fetch country names for nicer frontend response
    const commonCountriesResult =
      commonCountryIds.length > 0
        ? await db.query(
            `SELECT id, name, iso_code, flag_url
             FROM countries
             WHERE id = ANY($1::int[])
             ORDER BY name ASC`,
            [commonCountryIds],
          )
        : { rows: [] };

    const onlyMineCountriesResult =
      onlyMineIds.length > 0
        ? await db.query(
            `SELECT id, name, iso_code, flag_url
             FROM countries
             WHERE id = ANY($1::int[])
             ORDER BY name ASC`,
            [onlyMineIds],
          )
        : { rows: [] };

    const onlyTheirsCountriesResult =
      onlyTheirsIds.length > 0
        ? await db.query(
            `SELECT id, name, iso_code, flag_url
             FROM countries
             WHERE id = ANY($1::int[])
             ORDER BY name ASC`,
            [onlyTheirsIds],
          )
        : { rows: [] };

    const TOTAL_COUNTRIES = 195;

    const myCountriesVisited = Number(myStats?.countries_visited) || 0;
    const friendCountriesVisited = Number(friendStats?.countries_visited) || 0;

    const myWorldCoverage = Math.round(
      (myCountriesVisited / TOTAL_COUNTRIES) * 100,
    );

    const friendWorldCoverage = Math.round(
      (friendCountriesVisited / TOTAL_COUNTRIES) * 100,
    );

    res.status(200).json({
      success: true,
      comparison: {
        my_stats: {
          countries_visited: myCountriesVisited,
          continents_visited: Number(myStats?.continents_visited) || 0,
          world_coverage_percent: myWorldCoverage,
        },
        friend_stats: {
          countries_visited: friendCountriesVisited,
          continents_visited: Number(friendStats?.continents_visited) || 0,
          world_coverage_percent: friendWorldCoverage,
        },
        overlap: {
          common_count: commonCountriesResult.rows.length,
          common_countries: commonCountriesResult.rows,
          only_mine_count: onlyMineCountriesResult.rows.length,
          only_mine: onlyMineCountriesResult.rows,
          only_theirs_count: onlyTheirsCountriesResult.rows.length,
          only_theirs: onlyTheirsCountriesResult.rows,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}
async function getFriendProfile(req, res) {
  try {
    const userId = req.user.id;
    const friendId = parseInt(req.params.friendId);

    const isFriend = await Friendship.areFriends(userId, friendId);

    if (!isFriend) {
      return res
        .status(403)
        .json({ err: "You can only view profiles of friends" });
    }

    const friend = await User.getById(friendId);

    if (!friend) {
      return res.status(404).json({ err: "User not found" });
    }

    const stats = await UserStats.getStats(friendId);
    const continentBreakdown = await UserStats.getContinentBreakdown(friendId);
    const mostRecentVisit = await UserStats.getMostRecentVisit(friendId);
    const countriesVisited = Number(stats?.countries_visited) || 0;
    const worldCoveragePercent = Math.round((countriesVisited / 195) * 100);

    res.status(200).json({
      success: true,
      user: {
        id: friend.id,
        username: friend.username,
        email: friend.email,
        home_country: friend.home_country,
      },
      stats: {
        countries_visited: Number(stats?.countries_visited) || 0,
        continents_visited: Number(stats?.continents_visited) || 0,
        world_coverage_percent: myWorldCoverage,
      },
      continent_breakdown: continentBreakdown.map((item) => ({
        continent: item.continent,
        countries_count: Number(item.countries_count),
      })),
      most_recent_visit: mostRecentVisit,
    });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ err: err.message });
    }

    res.status(500).json({ err: err.message });
  }
}

module.exports = {
  searchUsers,
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  removeFriend,
  compareWithFriend,
  getFriendProfile,
};
