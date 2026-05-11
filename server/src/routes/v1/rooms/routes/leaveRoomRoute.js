import { leaveRoom } from "../../../../controllers/rooms/leaveRoom.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyLeaveRoomRoute = (router) => {
  router.post("/:roomId/leave", authMiddleware, leaveRoom);
};
