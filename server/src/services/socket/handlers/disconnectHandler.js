import {
  GLOBAL_ROOM_FALLBACK,
  prisma,
  toMessagePayload,
  touchMemberLastSeen,
  updateRoomActivity,
} from "../../chatService.js";

export const handleDisconnect = async ({ io, users, socket }) => {
  const user = users.get(socket.id);
  if (!user) {
    console.log("User disconnected (unknown):", socket.id);
    return;
  }

  users.delete(socket.id);
  const roomId = user.roomId || GLOBAL_ROOM_FALLBACK;

  if (!roomId) return;

  socket.to(roomId).emit("user_left", { user });
  socket.to(roomId).emit("member_presence", {
    userId: user.userId,
    isOnline: false,
    lastSeenAt: Date.now(),
  });

  try {
    await touchMemberLastSeen({ roomId, userId: user.userId });

    const system = await prisma.message.create({
      data: {
        roomId,
        text: `${user.username} da roi phong`,
        senderId: "system",
        senderName: "System",
        type: "system",
      },
    });

    io.to(roomId).emit("receive_message", { message: toMessagePayload(system) });
    await updateRoomActivity({ roomId, userId: user.userId });
  } catch (error) {
    console.error("disconnect persistence error:", error);
  }
};
