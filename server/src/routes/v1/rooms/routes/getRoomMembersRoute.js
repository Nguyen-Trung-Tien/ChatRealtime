import { getRoomMembers } from "../../../../controllers/rooms/getRoomMembers.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyGetRoomMembersRoute = (router) => {
  router.get("/:roomId/members", authMiddleware, getRoomMembers);
};
