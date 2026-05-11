import {
  ensureRoomAndMembership,
  isValidRoomId,
  normalizeRoomId,
} from "../../services/chatService.js";

export const createRoom = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.body?.roomId);
    const roomName = (req.body?.name || roomId).toString().trim() || roomId;

    if (!isValidRoomId(roomId)) {
      return res.status(400).json({
        message: "Room ID must be 3-50 chars: a-z, 0-9, _ or -",
      });
    }

    await ensureRoomAndMembership({
      userId: req.authUser.id,
      roomId,
      createdBy: req.authUser.id,
      roomName,
    });

    return res.status(201).json({
      room: { roomId, name: roomName },
    });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({ message: "Room ID already exists" });
    }
    console.error("create room error:", error);
    return res.status(500).json({ message: "Cannot create room" });
  }
};
