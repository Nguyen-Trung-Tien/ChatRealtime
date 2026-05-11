import {
  ensureUserIsMember,
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  normalizeRoomId,
  parsePositiveInt,
  prisma,
  toMessagePayload,
  updateRoomActivity,
} from "../../services/chatService.js";

export const updateMessage = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const messageId = parsePositiveInt(req.params.messageId, null);
    const text = (req.body?.text || "").toString().trim();
    if (!messageId || !text) {
      return res.status(400).json({ message: "Invalid message payload" });
    }

    const isMember = await ensureUserIsMember({ userId: req.authUser.id, roomId });
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    const existing = await prisma.message.findUnique({ where: { id: messageId } });
    if (!existing || existing.roomId !== roomId) {
      return res.status(404).json({ message: "Message not found" });
    }
    if (existing.senderId !== req.authUser.id || existing.deletedAt) {
      return res.status(403).json({ message: "You cannot edit this message" });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        text,
        editedAt: new Date(),
      },
      include: {
        replyTo: {
          select: {
            id: true,
            text: true,
            senderName: true,
            deletedAt: true,
          },
        },
      },
    });

    await updateRoomActivity({ roomId, userId: req.authUser.id });
    req.app.locals.io?.to(roomId).emit("message_updated", { message: toMessagePayload(updated) });

    return res.json({ message: toMessagePayload(updated) });
  } catch (error) {
    console.error("update message error:", error);
    return res.status(500).json({ message: "Cannot update message" });
  }
};
