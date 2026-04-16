const { Router } = require("express");
const {
  getVisitedByUser,
  createVisit,
  bulkCreateVisits,
  deleteVisit,
} = require("../controllers/visitedLocation");
const authenticator = require("../middleware/authenticator");

const visitedRouter = Router();

visitedRouter.get("/:userId", authenticator, getVisitedByUser);
visitedRouter.post("/", authenticator, createVisit);
visitedRouter.post("/bulk", authenticator, bulkCreateVisits);
visitedRouter.delete("/:id", authenticator, deleteVisit);

module.exports = visitedRouter;