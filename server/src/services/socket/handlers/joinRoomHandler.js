import {
  emitChatError,
  ensureRoomAndMembership,
  fetchRoomMessages,
  getUserRoomRole,
  GLOBAL_ROOM_FALLBACK,
  hasOlderMessages,
  isValidRoomId,
  listRoomMembers,
  MESSAGE_PAGE_SIZE,
  normalizeRoomId,
  prisma,
  toMessagePayload,
  updateRoomActivity,
} from "../../chatService.js";

export const handleJoinRoom = async ({ io, users, socket, authUser, payload }) => {
  try {
    const roomId = normalizeRoomId(payload?.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      emitChatError(socket, "Room ID khong hop le (3-50 ky tu: a-z, 0-9, _ hoac -).");
      return;
    }

    const existingUser = users.get(socket.id);
    const previousRoomId = existingUser?.roomId;

    if (previousRoomId && previousRoomId !== roomId) {
      socket.leave(previousRoomId);
      socket.to(previousRoomId).emit("user_left", {
        user: {
          id: socket.id,
          userId: authUser.id,
          username: authUser.username,
          roomId: previousRoomId,
        },
      });
      socket.to(previousRoomId).emit("member_presence", {
        userId: authUser.id,
        isOnline: false,
        lastSeenAt: Date.now(),
      });
    }

    await ensureRoomAndMembership({
      userId: authUser.id,
      roomId,
      createdBy: authUser.id,
      roomName: roomId,
    });
    const role = await getUserRoomRole({ roomId, userId: authUser.id });

    const user = {
      id: socket.id,
      userId: authUser.id,
      username: authUser.username,
      roomId,
      role: role || "member",
    };

    users.set(socket.id, user);
    socket.join(roomId);
    await updateRoomActivity({ roomId, userId: authUser.id });

    const roomMessages = await fetchRoomMessages({
      roomId,
      limit: MESSAGE_PAGE_SIZE,
    });
    const oldestId = roomMessages.length > 0 ? roomMessages[0].id : null;
    const hasMore = oldestId ? await hasOlderMessages({ roomId, oldestId }) : false;

    const members = await listRoomMembers({ roomId, users });

    socket.emit("room_joined", {
      user,
      roomId,
      messages: roomMessages.map(toMessagePayload),
      hasMore,
      onlineUsers: Array.from(users.values()).filter((u) => u.roomId === roomId),
      members,
    });

    socket.to(roomId).emit("user_joined", { user });
    io.to(roomId).emit("member_presence", {
      userId: authUser.id,
      isOnline: true,
      lastSeenAt: Date.now(),
    });

    const system = await prisma.message.create({
      data: {
        roomId,
        text: `${authUser.username} da tham gia phong`,
        senderId: "system",
        senderName: "System",
        type: "system",
      },
    });

    io.to(roomId).emit("receive_message", { message: toMessagePayload(system) });
  } catch (error) {
    console.error("join_room error:", error);
    emitChatError(socket, "Khong the tham gia phong luc nay.");
  }
};
