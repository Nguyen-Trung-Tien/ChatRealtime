import { getRoomsHistory } from "../../../../controllers/rooms/getRoomsHistory.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyGetRoomsHistoryRoute = (router) => {
  router.get("/history", authMiddleware, getRoomsHistory);
};
