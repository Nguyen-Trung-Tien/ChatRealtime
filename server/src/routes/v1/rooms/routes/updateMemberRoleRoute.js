import { updateRoomMemberRole } from "../../../../controllers/rooms/updateMemberRole.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyUpdateMemberRoleRoute = (router) => {
  router.patch("/:roomId/members/:userId/role", authMiddleware, updateRoomMemberRole);
};
