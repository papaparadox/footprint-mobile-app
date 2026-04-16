const jwt = require("jsonwebtoken");

function authenticator(req, res, next) {

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ err: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).json({ err: "No token provided" });
  }

  if (token) {
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
      if (err) {
        res.status(403).json({ err: "Invalid token" });
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.status(403).json({ err: "No token provided" });
  }
}

module.exports = authenticator;
