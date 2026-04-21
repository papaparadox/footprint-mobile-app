const { Router } = require("express");
const friendsController = require("../controllers/friends");
const authenticateToken = require("../middleware/authenticator");

const friendsRouter = Router();

friendsRouter.use(authenticateToken);

friendsRouter.get("/search", friendsController.searchUsers);
friendsRouter.post("/request", friendsController.sendFriendRequest);
friendsRouter.get("/requests", friendsController.getFriendRequests);
friendsRouter.patch(
  "/requests/:id/accept",
  friendsController.acceptFriendRequest,
);
friendsRouter.patch(
  "/requests/:id/decline",
  friendsController.declineFriendRequest,
);
friendsRouter.get("/", friendsController.getFriends);
friendsRouter.delete("/:friendId", friendsController.removeFriend);
friendsRouter.get("/:friendId/profile", friendsController.getFriendProfile);
friendsRouter.get("/:friendId/compare", friendsController.compareWithFriend);

module.exports = friendsRouter;
