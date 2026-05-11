import { createRoom } from "../../../../controllers/rooms/createRoom.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyCreateRoomRoute = (router) => {
  router.post("/", authMiddleware, createRoom);
};
