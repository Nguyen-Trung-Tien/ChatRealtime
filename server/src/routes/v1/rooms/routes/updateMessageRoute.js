import { updateMessage } from "../../../../controllers/rooms/updateMessage.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyUpdateMessageRoute = (router) => {
  router.patch("/:roomId/messages/:messageId", authMiddleware, updateMessage);
};
