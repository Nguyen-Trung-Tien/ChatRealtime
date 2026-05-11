import {
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  leaveRoomMembership,
  listRoomMembers,
  normalizeRoomId,
} from "../../services/chatService.js";

export const leaveRoom = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const result = await leaveRoomMembership({ roomId, userId: req.authUser.id });
    if (!result.ok) {
      if (result.reason === "NOT_MEMBER") {
        return res.status(403).json({ message: "You are not a member of this room" });
      }
      if (result.reason === "OWNER_CANNOT_LEAVE") {
        return res.status(400).json({ message: "Room owner cannot leave. Delete room instead." });
      }
      return res.status(400).json({ message: "Cannot leave room" });
    }

    const io = req.app.locals.io;
    const users = req.app.locals.users;
    if (io && users) {
      users.forEach((entry, socketId) => {
        if (entry.userId === req.authUser.id && entry.roomId === roomId) {
          users.set(socketId, { ...entry, roomId: null });
          const targetSocket = io.sockets.sockets.get(socketId);
          targetSocket?.leave(roomId);
        }
      });

      const members = await listRoomMembers({ roomId, users });
      io.to(roomId).emit("room_members_updated", { roomId, members });
      io.to(roomId).emit("member_presence", {
        userId: req.authUser.id,
        isOnline: false,
        lastSeenAt: Date.now(),
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("leave room error:", error);
    return res.status(500).json({ message: "Cannot leave room" });
  }
};
