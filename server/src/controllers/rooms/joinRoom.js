import {
  ensureRoomAndMembership,
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  normalizeRoomId,
  pool,
} from "../../services/chatService.js";

export const joinRoom = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({
        message: "Room ID must be 3-50 chars: a-z, 0-9, _ or -",
      });
    }

    const existingRoom = await pool.query(
      "SELECT room_id, name FROM rooms WHERE room_id = $1 LIMIT 1",
      [roomId]
    );

    if (existingRoom.rowCount === 0) {
      return res.status(404).json({ message: "Room not found" });
    }

    await ensureRoomAndMembership({
      userId: req.authUser.id,
      roomId,
      createdBy: req.authUser.id,
      roomName: existingRoom.rows[0].name,
    });

    return res.json({ room: existingRoom.rows[0] });
  } catch (error) {
    console.error("join room error:", error);
    return res.status(500).json({ message: "Cannot join room" });
  }
};
