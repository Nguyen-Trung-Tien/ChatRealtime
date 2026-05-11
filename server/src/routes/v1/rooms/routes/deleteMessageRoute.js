import { deleteMessage } from "../../../../controllers/rooms/deleteMessage.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyDeleteMessageRoute = (router) => {
  router.delete("/:roomId/messages/:messageId", authMiddleware, deleteMessage);
};
