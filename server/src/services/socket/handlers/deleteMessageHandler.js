import {
  emitChatError,
  ensureUserIsMember,
  getUserRoomRole,
  normalizeRoomId,
  prisma,
  updateRoomActivity,
} from "../../chatService.js";

export const handleDeleteMessage = async ({ io, users, socket, payload }) => {
  try {
    const user = users.get(socket.id);
    const messageId = Number.parseInt(payload?.messageId, 10);

    if (!user || !user.roomId || !Number.isFinite(messageId)) return;

    const roomId = user.roomId;
    const requestedRoomId = normalizeRoomId(payload?.roomId || roomId);
    if (requestedRoomId !== roomId) {
      emitChatError(socket, "Invalid room for deleting message.");
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

    const role = await getUserRoomRole({ roomId, userId: user.userId });
    const canDelete =
      existing.senderId === user.userId || role === "owner" || role === "admin";
    if (!canDelete || existing.deletedAt) {
      emitChatError(socket, "You cannot delete this message.");
      return;
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        text: "",
        deletedAt: new Date(),
      },
    });

    await updateRoomActivity({ roomId, userId: user.userId });
    io.to(roomId).emit("message_deleted", { roomId, messageId });
  } catch (error) {
    console.error("delete_message error:", error);
    emitChatError(socket, "Unable to delete message.");
  }
};
