import {
  clamp,
  ensureUserIsMember,
  fetchRoomMessages,
  GLOBAL_ROOM_FALLBACK,
  hasOlderMessages,
  isValidRoomId,
  MESSAGE_PAGE_SIZE,
  normalizeRoomId,
  parsePositiveInt,
  toMessagePayload,
} from "../../services/chatService.js";

export const getRoomMessages = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const member = await ensureUserIsMember({ userId: req.authUser.id, roomId });
    if (!member) {
      return res.status(403).json({ message: "Ban chua tham gia phong nay" });
    }

    const beforeId = req.query.beforeId ? parsePositiveInt(req.query.beforeId, null) : null;
    const limit = clamp(parsePositiveInt(req.query.limit, MESSAGE_PAGE_SIZE), 1, 50);

    const messages = await fetchRoomMessages({ roomId, beforeId, limit });
    const oldestId = messages.length > 0 ? messages[0].id : null;

    const hasMore = oldestId ? await hasOlderMessages({ roomId, oldestId }) : false;

    return res.json({
      messages: messages.map(toMessagePayload),
      hasMore,
    });
  } catch (error) {
    console.error("get messages error:", error);
    return res.status(500).json({ message: "Cannot load messages" });
  }
};
