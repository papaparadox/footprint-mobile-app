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

    const {password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
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
    if (err.message === "User not found") {
      return res.status(401).json({ err: "Invalid email or password" });
    }
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

// async function getPublicProfile(req, res) {
//   try {
//     const profile = await User.getPublicProfile(req.params.token);
//     res.status(200).json(profile);
//   } catch (err) {
//     res.status(404).json({ err: err.message });
//   }
// }

async function getPublicProfile(req, res) {
  try {
    const profile = await User.getPublicProfile(req.params.token);
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${profile.username}'s Footprint</title>
          <style>
            body { font-family: sans-serif; background: #F5F0E8; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
            .card { background: white; border-radius: 20px; padding: 32px; text-align: center; max-width: 320px; width: 90%; border: 1px solid #E2D8CC; }
            .logo { font-size: 32px; margin-bottom: 8px; }
            .app { font-size: 22px; font-weight: 800; color: #C47B2B; }
            .username { font-size: 18px; font-weight: 700; color: #1C1C1E; margin: 8px 0 4px; }
            .tagline { font-size: 13px; color: #A89B8C; margin-bottom: 20px; }
            .divider { height: 1px; background: #E2D8CC; margin: 16px 0; }
            .stats { display: flex; justify-content: space-around; }
            .stat { flex: 1; }
            .stat-value { font-size: 32px; font-weight: 800; color: #C47B2B; }
            .stat-label { font-size: 11px; color: #A89B8C; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
            .stat-divider { width: 1px; background: #E2D8CC; }
            .footer { font-size: 12px; color: #A89B8C; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">👣</div>
            <div class="app">Footprint</div>
            <div class="username">@${profile.username}</div>
            <div class="tagline">Building my travel story</div>
            <div class="divider"></div>
            <div class="stats">
              <div class="stat">
                <div class="stat-value">${profile.countries_visited}</div>
                <div class="stat-label">Countries</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <div class="stat-value">${profile.continents_visited}</div>
                <div class="stat-label">Continents</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat">
                <div class="stat-value">${Math.round((parseInt(profile.countries_visited) / 195) * 100)}%</div>
                <div class="stat-label">World</div>
              </div>
            </div>
            <div class="divider"></div>
            <div class="footer">footprint.app</div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(404).json({ err: err.message });
  }
}

async function getMyPublicToken(req, res) {
  try {
    const token = await User.getPublicToken(req.user.id);
    res.status(200).json({ public_token: token });
  } catch (err) {
    res.status(404).json({ err: err.message });
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateUser,
  deleteUser,
  getPublicProfile,
  getMyPublicToken,
};
