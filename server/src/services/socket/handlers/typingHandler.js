import { emitChatError, ensureUserIsMember, normalizeRoomId } from "../../chatService.js";

export const handleTyping = async ({ io, users, socket, payload }) => {
  try {
    const user = users.get(socket.id);
    if (!user || !user.roomId) return;

    const roomId = user.roomId;
    const requestedRoomId = normalizeRoomId(payload?.roomId || roomId);
    if (requestedRoomId !== roomId) {
      emitChatError(socket, "Invalid room for typing event.");
      return;
    }

    const isMember = await ensureUserIsMember({ userId: user.userId, roomId });
    if (!isMember) return;

    io.to(roomId).emit("typing", {
      roomId,
      userId: user.userId,
      username: user.username,
      isTyping: Boolean(payload?.isTyping),
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("typing error:", error);
  }
};
