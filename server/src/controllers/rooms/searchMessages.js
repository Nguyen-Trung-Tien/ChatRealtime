import {
  clamp,
  ensureUserIsMember,
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  MESSAGE_PAGE_SIZE,
  normalizeRoomId,
  parsePositiveInt,
  searchRoomMessages,
  toMessagePayload,
} from "../../services/chatService.js";

export const searchMessages = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const member = await ensureUserIsMember({ userId: req.authUser.id, roomId });
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    const query = (req.query.q || "").toString().trim();
    if (!query) {
      return res.status(400).json({ message: "Missing search query" });
    }

    const limit = clamp(parsePositiveInt(req.query.limit, MESSAGE_PAGE_SIZE), 1, 50);
    const messages = await searchRoomMessages({ roomId, query, limit });

    return res.json({
      query,
      messages: messages.reverse().map(toMessagePayload),
    });
  } catch (error) {
    console.error("search messages error:", error);
    return res.status(500).json({ message: "Cannot search messages" });
  }
};
