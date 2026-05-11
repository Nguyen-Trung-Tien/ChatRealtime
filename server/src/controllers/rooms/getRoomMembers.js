import {
  ensureUserIsMember,
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  listRoomMembers,
  normalizeRoomId,
} from "../../services/chatService.js";

export const getRoomMembers = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const isMember = await ensureUserIsMember({ userId: req.authUser.id, roomId });
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    const users = req.app.locals.users;
    const members = await listRoomMembers({ roomId, users });
    return res.json({ members });
  } catch (error) {
    console.error("get room members error:", error);
    return res.status(500).json({ message: "Cannot load room members" });
  }
};
