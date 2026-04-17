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
  async function updateUser(req, res) {
  try {
    const userId = req.user.id;
    const allowedFields = ["username", "email", "password", "home_country"];
    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ err: "No fields to update" });
    }

    if (updates.password) {
      const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.update(userId, updates);

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        home_country: updatedUser.home_country,
      },
    });
  } catch (err) {
    if (err.message === "No fields to update") {
      return res.status(400).json({ err: err.message });
    }

    if (err.message === "User not found") {
      return res.status(404).json({ err: err.message });
    }

    res.status(500).json({ err: err.message });
  }
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
}

module.exports = User;
