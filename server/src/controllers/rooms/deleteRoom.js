import {
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  normalizeRoomId,
  pool,
  prisma,
} from "../../services/chatService.js";

export const deleteRoom = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const roomResult = await pool.query(
      "SELECT room_id, created_by FROM rooms WHERE room_id = $1 LIMIT 1",
      [roomId]
    );

    if (roomResult.rowCount === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (roomResult.rows[0].created_by !== req.authUser.id) {
      return res.status(403).json({ message: "Only room owner can delete this room" });
    }

    await prisma.message.deleteMany({ where: { roomId } });
    await pool.query("DELETE FROM rooms WHERE room_id = $1", [roomId]);

    const io = req.app.locals.io;
    const users = req.app.locals.users;

    if (io) {
      io.to(roomId).emit("room_deleted", { roomId });
      io.in(roomId).socketsLeave(roomId);
    }

    if (users) {
      users.forEach((user, socketId) => {
        if (user.roomId === roomId) {
          users.set(socketId, { ...user, roomId: null });
        }
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error("delete room error:", error);
    return res.status(500).json({ message: "Cannot delete room" });
  }
};
