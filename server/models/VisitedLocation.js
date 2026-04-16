const db = require("../database/connect.js");

class VisitedLocation {
  constructor(id, user_id, country_id, city_id, trip_id, date_visited, notes, created_at) {
    this.id = id;
    this.user_id = user_id;
    this.country_id = country_id;
    this.city_id = city_id;
    this.trip_id = trip_id;
    this.date_visited = date_visited;
    this.notes = notes;
    this.created_at = created_at;
  }

  static async getByUser(user_id) {
    const result = await db.query(
      `SELECT vl.*, 
        c.name as country_name, 
        c.iso_code, 
        c.flag_url, 
        c.continent,
        ci.name as city_name
       FROM visited_locations vl
       JOIN countries c ON vl.country_id = c.id
       LEFT JOIN cities ci ON vl.city_id = ci.id
       WHERE vl.user_id = $1
       ORDER BY vl.created_at DESC`,
      [user_id]
    );
    return result.rows;
  }

  static async create(data) {
    const { user_id, country_id, city_id, trip_id, date_visited, notes } = data;

    if (!user_id || !country_id) {
      throw new Error("user_id and country_id are required");
    }

    const result = await db.query(
      `INSERT INTO visited_locations 
        (user_id, country_id, city_id, trip_id, date_visited, notes)
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        user_id,
        country_id,
        city_id || null,
        trip_id || null,
        date_visited || new Date(),
        notes || null,
      ]
    );

    const row = result.rows[0];
    return new VisitedLocation(
      row.id, row.user_id, row.country_id, row.city_id,
      row.trip_id, row.date_visited, row.notes, row.created_at
    );
  }

  static async bulkCreate(user_id, country_ids) {
    if (!user_id || !country_ids || country_ids.length === 0) {
      throw new Error("user_id and country_ids are required");
    }

    const inserted = [];

    for (const country_id of country_ids) {
      const existing = await db.query(
        "SELECT * FROM visited_locations WHERE user_id = $1 AND country_id = $2",
        [user_id, country_id]
      );

      if (existing.rows.length === 0) {
        const result = await db.query(
          `INSERT INTO visited_locations (user_id, country_id, date_visited)
           VALUES ($1, $2, $3) RETURNING *`,
          [user_id, country_id, new Date()]
        );
        inserted.push(result.rows[0]);
      }
    }

    return inserted;
  }

  static async delete(id, user_id) {
    const result = await db.query(
      "DELETE FROM visited_locations WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, user_id]
    );
    if (result.rows.length === 0) {
      throw new Error("Visit not found or does not belong to this user");
    }
    return result.rows[0];
  }
}

module.exports = VisitedLocation;