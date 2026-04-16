const jwt = require("jsonwebtoken");

function authenticator(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ err: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ err: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ err: "Invalid token" });
  }
}

module.exports = authenticator;
