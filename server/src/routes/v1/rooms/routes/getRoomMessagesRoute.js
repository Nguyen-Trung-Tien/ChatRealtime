import { getRoomMessages } from "../../../../controllers/rooms/getRoomMessages.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyGetRoomMessagesRoute = (router) => {
  router.get("/:roomId/messages", authMiddleware, getRoomMessages);
};
