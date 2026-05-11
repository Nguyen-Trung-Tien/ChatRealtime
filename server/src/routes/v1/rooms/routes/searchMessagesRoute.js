import { searchMessages } from "../../../../controllers/rooms/searchMessages.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applySearchMessagesRoute = (router) => {
  router.get("/:roomId/messages/search", authMiddleware, searchMessages);
};
