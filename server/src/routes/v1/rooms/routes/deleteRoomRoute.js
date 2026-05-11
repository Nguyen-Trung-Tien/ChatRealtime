import { deleteRoom } from "../../../../controllers/rooms/deleteRoom.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyDeleteRoomRoute = (router) => {
  router.delete("/:roomId", authMiddleware, deleteRoom);
};
