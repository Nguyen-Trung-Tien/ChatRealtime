import {
  emitChatError,
  ensureUserIsMember,
  MESSAGE_RATE_LIMIT_MAX,
  MESSAGE_RATE_LIMIT_WINDOW_MS,
  normalizeRoomId,
  prisma,
  toMessagePayload,
  updateRoomActivity,
} from "../../chatService.js";
import { consumeSocketRateLimit } from "../rateLimit.js";

export const handleSendMessage = async ({ io, users, socket, payload }) => {
  try {
    const user = users.get(socket.id);
    const text = (payload?.text || "").toString().trim();
    const replyToId = payload?.replyToId ? Number.parseInt(payload.replyToId, 10) : null;

    if (!user || !user.roomId || !text) {
      return;
    }

    const allowed = consumeSocketRateLimit({
      key: `chat:send-message:${user.userId}`,
      windowMs: MESSAGE_RATE_LIMIT_WINDOW_MS,
      max: MESSAGE_RATE_LIMIT_MAX,
    });
    if (!allowed) {
      emitChatError(socket, "You are sending messages too fast. Please slow down.");
      return;
    }

    const roomId = user.roomId;
    const requestedRoomId = normalizeRoomId(payload?.roomId || roomId);
    if (requestedRoomId !== roomId) {
      emitChatError(socket, "Ban khong co quyen gui tin vao phong nay.");
      return;
    }

    const isMember = await ensureUserIsMember({ userId: user.userId, roomId });
    if (!isMember) {
      emitChatError(socket, "Ban chua tham gia phong nay.");
      return;
    }

    let replyTo = null;
    if (replyToId) {
      replyTo = await prisma.message.findUnique({
        where: { id: replyToId },
      });
      if (!replyTo || replyTo.roomId !== roomId) {
        emitChatError(socket, "Cannot reply to this message.");
        return;
      }
    }

    const created = await prisma.message.create({
      data: {
        roomId,
        text,
        senderId: user.userId,
        senderName: user.username,
        type: "user",
        replyToId: replyTo ? replyTo.id : null,
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
    io.to(roomId).emit("receive_message", { message: toMessagePayload(created) });
  } catch (error) {
    console.error("send_message error:", error);
    emitChatError(socket, "Khong the gui tin nhan luc nay.");
  }
};
