const { Router } = require("express");
const usercontroller = require("../controllers/user");
const authenticateToken = require("../middleware/authenticator");

const userRouter = Router();

// Public routes for registration and login
userRouter.post("/register", usercontroller.register);
userRouter.post("/login", usercontroller.login);
userRouter.get("/public/:token", usercontroller.getPublicProfile);

// Protected route for profile
userRouter.get("/profile", authenticateToken, usercontroller.getProfile);
userRouter.get(
  "/searchUser",
  authenticateToken,
  usercontroller.getUserByUsername,
);

userRouter.get(
  "/profileStat",
  authenticateToken,
  usercontroller.getProfileStat,
);
userRouter.patch(
  "/profile/update",
  authenticateToken,
  usercontroller.updateUser,
);
userRouter.delete(
  "/profile/delete",
  authenticateToken,
  usercontroller.deleteUser,
);
userRouter.get(
  "/profile/share-token",
  authenticateToken,
  usercontroller.getMyPublicToken,
);

module.exports = userRouter;
