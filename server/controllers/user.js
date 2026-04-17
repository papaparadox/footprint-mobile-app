const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Controller function for user registration
async function register(req, res) {
  try {
    const data = req.body;
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
    data.password = await bcrypt.hash(data.password, salt);
    const newUser = await User.create(data);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
}

// Controller function for user login
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.getByEmail(email);

    if (!user) {
      return res.status(401).json({ err: "Invalid email or password" });
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ err: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.SECRET_TOKEN,
      { expiresIn: "15min" },
    );

    res.status(200).json({
      success: true,
      token,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}
async function getProfile(req, res) {
  try {
    const user = await User.getById(req.user.id);

    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        home_country: user.home_country,
      },
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
}

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

async function deleteUser(req, res) {
  try {
    const userId = req.user.id;

    const deletedUser = await User.delete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      user: {
        id: deletedUser.id,
        username: deletedUser.username,
        email: deletedUser.email,
        home_country: deletedUser.home_country,
      },
    });
  } catch (err) {
    if (err.message === "User not found") {
      return res.status(404).json({ err: err.message });
    }

    res.status(500).json({ err: err.message });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateUser,
  deleteUser,
};
