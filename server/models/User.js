const db = require("../database/connect.js");

class User {
  constructor(id, username, email, password, home_country) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.home_country = home_country;
  }
  // Get all users
  static async getUsers() {
    const result = await db.query("SELECT * FROM users");
    if (result.rows.length === 0) {
      throw new Error("No users found");
    }
    return result.rows.map(
      (row) => new User(row.id, row.username, row.email,row.password, row.home_country),
    );
  }
  // Get user by email
  static async getByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    return result.rows.map(
      (row) =>
        new User(
          row.id,
          row.username,
          row.email,
          row.password,
          row.home_country,
        ),
    )[0];
  }

  // Get user by ID
  static async getById(id) {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    return result.rows.map(
      (row) => new User(row.id, row.username, row.email,row.password, row.home_country),
    )[0];
  }
  // create user
  static async create(user) {
    const { username, email, password, home_country } = user;
    if (!username || !email || !password || !home_country) {
      throw new Error("Missing required fields");
    }
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      throw new Error("Email already in use");
    }
    const result = await db.query(
      "INSERT INTO users (username, email, password, home_country) VALUES ($1, $2, $3, $4) RETURNING *",
      [user.username, user.email, user.password, user.home_country],
    );
    const row = result.rows[0];
    return new User(
      row.id,
      row.username,
      row.email,
      row.password,
      row.home_country,
    );
  }
  // Update user details
  static async update(id, user) {
    const fields = [];
    const values = [];
    let index = 1;

    // Dynamically build query
    for (const key in user) {
      fields.push(`${key} = $${index}`);
      values.push(user[key]);
      index++;
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const row = result.rows[0];

    return new User(
      row.id,
      row.username,
      row.email,
      row.password,
      row.home_country,
    );
  }

  // Delete user
  static async delete(id) {
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
    const row = result.rows[0];
    return new User(row.id, row.username, row.email,row.password, row.home_country);
  }

  // get public profile
  static async getPublicProfile(public_token) {
    const result = await db.query(
    `SELECT 
      u.username,
      u.home_country,
      COUNT(DISTINCT vl.country_id) AS countries_visited,
      COUNT(DISTINCT c.continent) AS continents_visited,
      COUNT(DISTINCT vl.city_id) AS cities_visited
     FROM users u
     LEFT JOIN visited_locations vl ON vl.user_id = u.id
     LEFT JOIN countries c ON vl.country_id = c.id
     WHERE u.public_token = $1
     GROUP BY u.id`,
     [public_token]
    );

    if (result.rows.length === 0) throw new Error("Profile not found");
    return result.rows[0];
  }

  static async getPublicToken(id) {
    const result = await db.query(
      "SELECT public_token FROM users WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) throw new Error("User not found");
    return result.rows[0].public_token;
  }
}

module.exports = User;
