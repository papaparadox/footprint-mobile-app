// Grab dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");

// Grab routes
const UserRoutes = require("./routes/user");
const CountryRoutes = require("./routes/country");
const VisitedRoutes = require("./routes/visitedLocation");
const TripRoutes = require("./routes/trip");
const UserStatsRoutes = require("./routes/userStats");

//Define app is an express application
const app = express();

//Define middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

//Link end points to router
app.use("/user", UserRoutes);
app.use("/country", CountryRoutes);
app.use("/visited", VisitedRoutes);
app.use("/trip", TripRoutes);
app.use("/stats", UserStatsRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Footprint API 👣");
});

module.exports = app;
