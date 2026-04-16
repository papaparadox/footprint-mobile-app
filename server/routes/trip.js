const { Router } = require("express");
const {
  getTripsByUser,
  getTripById,
  getTripByToken,
  createTrip,
  addImage,
  deleteTrip,
} = require("../controllers/trip");
const authenticator = require("../middleware/authenticator");

const tripRouter = Router();

// public route — no auth needed for shared trips
tripRouter.get("/share/:token", getTripByToken);

// protected routes
tripRouter.get("/user/:userId", authenticator, getTripsByUser);
tripRouter.get("/:id", authenticator, getTripById);
tripRouter.post("/", authenticator, createTrip);
tripRouter.post("/:id/images", authenticator, addImage);
tripRouter.delete("/:id", authenticator, deleteTrip);

module.exports = tripRouter;