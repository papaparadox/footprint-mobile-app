// Grab dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");

// Grab routes
const UserRoutes = require("./routes/user");
const CountryRoutes = require("./routes/country")

//Define app is an express application
const app = express();

//Define middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

//Link end points to router
app.use("/user", UserRoutes);
app.use("/country", CountryRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to Footprint API 👣");
});

module.exports = app;
