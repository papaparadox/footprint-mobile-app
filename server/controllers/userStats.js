const UserStats = require("../models/UserStats");

async function getStats(req, res) {
  try {
    const { userId } = req.params;
    const stats = await UserStats.getStats(userId);
    const continents = await UserStats.getContinentBreakdown(userId);
    const recentVisit = await UserStats.getMostRecentVisit(userId);

    res.status(200).json({
      stats,
      continents,
      recentVisit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getStats };