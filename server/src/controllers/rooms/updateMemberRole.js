import {
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  listRoomMembers,
  normalizeRoomId,
  updateMemberRole,
} from "../../services/chatService.js";

export const updateRoomMemberRole = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const targetUserId = (req.params.userId || "").toString().trim();
    const role = (req.body?.role || "").toString().trim().toLowerCase();
    if (!targetUserId || !role) {
      return res.status(400).json({ message: "Missing userId or role" });
    }

    const result = await updateMemberRole({
      roomId,
      actorUserId: req.authUser.id,
      targetUserId,
      role,
    });

    if (!result.ok) {
      if (result.reason === "FORBIDDEN") {
        return res.status(403).json({ message: "Only room owner can update roles" });
      }
      if (result.reason === "TARGET_NOT_MEMBER") {
        return res.status(404).json({ message: "Target user is not in room" });
      }
      return res.status(400).json({ message: "Invalid role update request" });
    }

    const io = req.app.locals.io;
    const users = req.app.locals.users;
    const members = await listRoomMembers({ roomId, users });
    if (io) {
      io.to(roomId).emit("room_members_updated", { roomId, members });
    }

    return res.json({ ok: true, members });
  } catch (error) {
    console.error("update member role error:", error);
    return res.status(500).json({ message: "Cannot update member role" });
  }
};
