import {
  emitChatError,
  ensureUserIsMember,
  normalizeRoomId,
  prisma,
  toMessagePayload,
  updateRoomActivity,
} from "../../chatService.js";

export const handleEditMessage = async ({ io, users, socket, payload }) => {
  try {
    const user = users.get(socket.id);
    const messageId = Number.parseInt(payload?.messageId, 10);
    const newText = (payload?.text || "").toString().trim();

    if (!user || !user.roomId || !Number.isFinite(messageId) || !newText) return;

    const roomId = user.roomId;
    const requestedRoomId = normalizeRoomId(payload?.roomId || roomId);
    if (requestedRoomId !== roomId) {
      emitChatError(socket, "Invalid room for editing message.");
      return;
    }

    const isMember = await ensureUserIsMember({ userId: user.userId, roomId });
    if (!isMember) {
      emitChatError(socket, "You are not a member of this room.");
      return;
    }

    const existing = await prisma.message.findUnique({ where: { id: messageId } });
    if (!existing || existing.roomId !== roomId) {
      emitChatError(socket, "Message not found.");
      return;
    }
    if (existing.senderId !== user.userId || existing.deletedAt) {
      emitChatError(socket, "You cannot edit this message.");
      return;
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        text: newText,
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

    await updateRoomActivity({ roomId, userId: user.userId });
    io.to(roomId).emit("message_updated", { message: toMessagePayload(updated) });
  } catch (error) {
    console.error("edit_message error:", error);
    emitChatError(socket, "Unable to edit message.");
  }
};
