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
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Controller function for user login
async function login(req, res) {
  const { username, password } = req.body;

  try {
    const user = await User.getByUsername(username);

    if (!user) {
      return res.status(401).json({ err: "Invalid username or password" });
    }
    const match = await bcrypt.compare(password, user.parrword);

    if (!match) {
      return res.status(401).json({ err: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
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

async function updateUser(req, res) {}

module.exports = {
  register,
  login,
};
