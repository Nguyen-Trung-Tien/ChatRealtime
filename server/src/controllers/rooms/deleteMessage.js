import {
  ensureUserIsMember,
  getUserRoomRole,
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  normalizeRoomId,
  parsePositiveInt,
  prisma,
  updateRoomActivity,
} from "../../services/chatService.js";

export const deleteMessage = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const messageId = parsePositiveInt(req.params.messageId, null);
    if (!messageId) {
      return res.status(400).json({ message: "Invalid message ID" });
    }

    const isMember = await ensureUserIsMember({ userId: req.authUser.id, roomId });
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    const existing = await prisma.message.findUnique({ where: { id: messageId } });
    if (!existing || existing.roomId !== roomId) {
      return res.status(404).json({ message: "Message not found" });
    }

    const role = await getUserRoomRole({ roomId, userId: req.authUser.id });
    const canDelete =
      existing.senderId === req.authUser.id || role === "owner" || role === "admin";
    if (!canDelete || existing.deletedAt) {
      return res.status(403).json({ message: "You cannot delete this message" });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        text: "",
        deletedAt: new Date(),
      },
    });

    await updateRoomActivity({ roomId, userId: req.authUser.id });
    req.app.locals.io?.to(roomId).emit("message_deleted", { roomId, messageId });

    return res.json({ ok: true });
  } catch (error) {
    console.error("delete message error:", error);
    return res.status(500).json({ message: "Cannot delete message" });
  }
};
