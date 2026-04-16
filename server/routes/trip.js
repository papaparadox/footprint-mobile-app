const { Router } = require("express");
const {
  getTripsByUser,
  getTripById,
  getTripByToken,
  createTrip,
  updateTrip,
  addImage,
  getImages,
  deleteImage,
  deleteTrip,
} = require("../controllers/trip");
const authenticator = require("../middleware/authenticator");
const upload = require("../middleware/upload")

const tripRouter = Router();

// public route — no auth needed for shared trips
tripRouter.get("/share/:token", getTripByToken);

// protected routes
tripRouter.get("/user/:userId", authenticator, getTripsByUser);
tripRouter.get("/:id", authenticator, getTripById);
tripRouter.post("/", authenticator, createTrip);
tripRouter.patch("/:id", authenticator, updateTrip);
tripRouter.delete("/:id", authenticator, deleteTrip);
tripRouter.post("/:id/images", authenticator, upload.single("image"), addImage);
tripRouter.get("/:id/images", authenticator, getImages);
tripRouter.delete("/:id/images/:imageId", authenticator, deleteImage);

module.exports = tripRouter;