const { Router } = require("express");
const usercontroller = require("../controllers/user");
const authenticateToken = require("../middleware/authenticator");

const userRouter = Router();

// Public routes for registration and login
userRouter.post("/register", usercontroller.register);
userRouter.post("/login", usercontroller.login);

// Protected route for profile
userRouter.get("/profile", authenticateToken, usercontroller.getProfile);

module.exports = userRouter;
