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
      (row) =>
        new User(
          row.id,
          row.username,
          row.email,
          row.password,
          row.home_country,
        ),
    );
  }
  // Get user by username
  static async getByUsername(username) {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
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
    const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
      id,
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

    const query = `UPDATE users SET ${fields.join(", ")} WHERE user_id = $${index} RETURNING *`;

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
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [user_id],
    );
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
}

module.exports = User;
