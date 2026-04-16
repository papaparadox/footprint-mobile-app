const db = require("../database/connect.js");

class UserStats {
  static async getStats(user_id) {
    const result = await db.query(
      `SELECT
        COUNT(DISTINCT vl.country_id) as countries_visited,
        COUNT(DISTINCT c.continent) as continents_visited,
        COUNT(DISTINCT vl.city_id) as cities_visited,
        COUNT(DISTINCT vl.trip_id) as trips_taken
       FROM visited_locations vl
       JOIN countries c ON vl.country_id = c.id
       WHERE vl.user_id = $1`,
      [user_id]
    );
    return result.rows[0];
  }

  static async getContinentBreakdown(user_id) {
    const result = await db.query(
      `SELECT 
        c.continent,
        COUNT(DISTINCT vl.country_id) as countries_count
       FROM visited_locations vl
       JOIN countries c ON vl.country_id = c.id
       WHERE vl.user_id = $1
       GROUP BY c.continent
       ORDER BY countries_count DESC`,
      [user_id]
    );
    return result.rows;
  }

  static async getMostRecentVisit(user_id) {
    const result = await db.query(
      `SELECT vl.*, c.name as country_name, c.flag_url, c.iso_code
       FROM visited_locations vl
       JOIN countries c ON vl.country_id = c.id
       WHERE vl.user_id = $1
       ORDER BY vl.created_at DESC
       LIMIT 1`,
      [user_id]
    );
    return result.rows[0] || null;
  }
}

module.exports = UserStats;