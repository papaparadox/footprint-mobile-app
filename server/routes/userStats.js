const { Router } = require("express");
const { getStats } = require("../controllers/userStats");
const authenticator = require("../middleware/authenticator");

const userStatsRouter = Router();

userStatsRouter.get("/:userId", authenticator, getStats);

module.exports = userStatsRouter;