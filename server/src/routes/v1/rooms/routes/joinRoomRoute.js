import { joinRoom } from "../../../../controllers/rooms/joinRoom.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyJoinRoomRoute = (router) => {
  router.post("/:roomId/join", authMiddleware, joinRoom);
};
