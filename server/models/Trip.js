const db = require("../database/connect.js");
const { v4: uuidv4 } = require("uuid");

class Trip {
  constructor(id, user_id, title, start_date, end_date, total_days, notes, share_token, mood, created_at) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.start_date = start_date;
    this.end_date = end_date;
    this.total_days = total_days;
    this.notes = notes;
    this.share_token = share_token;
    this.mood = mood;
    this.created_at = created_at;
  }

  static async getByUser(user_id) {
    const result = await db.query(
      `SELECT t.*,
        COUNT(DISTINCT vl.id) as countries_count,
        COUNT(DISTINCT ti.id) as images_count
       FROM trips t
       LEFT JOIN visited_locations vl ON vl.trip_id = t.id
       LEFT JOIN trips_images ti ON ti.trip_id = t.id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.start_date DESC`,
      [user_id]
    );
    return result.rows;
  }

  static async getById(id) {
    const trip = await db.query(
      "SELECT * FROM trips WHERE id = $1",
      [id]
    );

    if (trip.rows.length === 0) {
      throw new Error("Trip not found");
    }

    const visits = await db.query(
      `SELECT vl.*, c.name as country_name, c.iso_code, c.flag_url
       FROM visited_locations vl
       JOIN countries c ON vl.country_id = c.id
       WHERE vl.trip_id = $1`,
      [id]
    );

    const images = await db.query(
      "SELECT * FROM trips_images WHERE trip_id = $1 ORDER BY uploaded_at ASC",
      [id]
    );

    return {
      ...trip.rows[0],
      visits: visits.rows,
      images: images.rows,
    };
  }

  static async getByToken(token) {
    const trip = await db.query(
      "SELECT * FROM trips WHERE share_token = $1",
      [token]
    );

    if (trip.rows.length === 0) {
      throw new Error("Trip not found");
    }

    const visits = await db.query(
      `SELECT vl.*, c.name as country_name, c.iso_code, c.flag_url
       FROM visited_locations vl
       JOIN countries c ON vl.country_id = c.id
       WHERE vl.trip_id = $1`,
      [trip.rows[0].id]
    );

    const images = await db.query(
      "SELECT * FROM trips_images WHERE trip_id = $1",
      [trip.rows[0].id]
    );

    return {
      ...trip.rows[0],
      visits: visits.rows,
      images: images.rows,
    };
  }

  static async create(data) {
    const { user_id, title, start_date, end_date, notes, mood } = data;
    let { total_days } = data;

    if (!user_id || !title) {
      throw new Error("user_id and title are required");
    }

    // auto calculate if both dates provided, otherwise use manual entry
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      total_days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    const share_token = uuidv4();

    const result = await db.query(
      `INSERT INTO trips (user_id, title, start_date, end_date, total_days, notes, mood, share_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, title, start_date || null, end_date || null, total_days || null, notes || null, mood || null, share_token]
    );

    const row = result.rows[0];
    return new Trip(
      row.id, row.user_id, row.title, row.start_date,
      row.end_date, row.total_days, row.notes, row.share_token, row.mood, row.created_at
    );
  }

  static async addImage(trip_id, image_url, caption) {
    if (!trip_id || !image_url) {
      throw new Error("trip_id and image_url are required");
    }

    const result = await db.query(
      `INSERT INTO trips_images (trip_id, image_url, caption)
       VALUES ($1, $2, $3) RETURNING *`,
      [trip_id, image_url, caption || null]
    );

    return result.rows[0];
  }

  static async getImages(trip_id) {
    const result = await db.query(
      "SELECT * FROM trips_images WHERE trip_id = $1 ORDER BY uploaded_at ASC",
      [trip_id]
    );
    return result.rows;
  }

  static async update(id, user_id, data) {
    const { title, start_date, end_date, total_days, notes, mood } = data;

    // recalculate total_days if both dates provided
    let calculatedDays = total_days;
    if (start_date && end_date) {
      const start = new Date(start_date);
      const end = new Date(end_date);
      calculatedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    const result = await db.query(
      `UPDATE trips SET
        title = COALESCE($1, title),
        start_date = COALESCE($2, start_date),
        end_date = COALESCE($3, end_date),
        total_days = COALESCE($4, total_days),
        notes = COALESCE($5, notes),
        mood = COALESCE($6, mood)
      WHERE id = $7 AND user_id = $8
      RETURNING *`,
      [title, start_date, end_date, calculatedDays, notes, mood, id, user_id]
    );

    if (result.rows.length === 0) {
      throw new Error("Trip not found or does not belong to this user");
    }

    return result.rows[0];
  }

  static async deleteImage(image_id, trip_id) {
    const result = await db.query(
      "DELETE FROM trips_images WHERE id = $1 AND trip_id = $2 RETURNING *",
      [image_id, trip_id]
    );
    if (result.rows.length === 0) {
      throw new Error("Image not found or does not belong to this trip");
    }
    return result.rows[0];
  }

  static async delete(id, user_id) {
    const result = await db.query(
      "DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, user_id]
    );
    if (result.rows.length === 0) {
      throw new Error("Trip not found or does not belong to this user");
    }
    return result.rows[0];
  }
}

module.exports = Trip;