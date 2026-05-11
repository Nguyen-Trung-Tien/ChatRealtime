import { pool, prisma } from "../../config/database/clients.js";
import { GLOBAL_ROOM_FALLBACK } from "../../config/env/rooms.js";
import { MESSAGE_PAGE_SIZE } from "../../config/env/pagination.js";
import { MESSAGE_RATE_LIMIT_MAX, MESSAGE_RATE_LIMIT_WINDOW_MS } from "../../config/env/rateLimit.js";
import { UPLOAD_BASE_DIR, UPLOAD_MAX_BYTES } from "../../config/env/uploads.js";

export {
  pool,
  prisma,
  GLOBAL_ROOM_FALLBACK,
  MESSAGE_PAGE_SIZE,
  MESSAGE_RATE_LIMIT_MAX,
  MESSAGE_RATE_LIMIT_WINDOW_MS,
  UPLOAD_BASE_DIR,
  UPLOAD_MAX_BYTES,
};

export const normalizeRoomId = (value) =>
  (value || "")
    .toString()
    .trim()
    .toLowerCase();

export const isValidRoomId = (roomId) => /^[a-z0-9_-]{3,50}$/.test(roomId);
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").toString().trim().toLowerCase());
export const normalizePhone = (phone) =>
  (phone || "")
    .toString()
    .trim()
    .replace(/[()\-\s]/g, "");
export const isValidPhone = (phone) => /^\+?[0-9]{9,15}$/.test(normalizePhone(phone));

export const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
};

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const toMessagePayload = (m) => ({
  id: m.id,
  text: m.deletedAt ? "" : m.text,
  senderId: m.senderId,
  senderName: m.senderName,
  type: m.type,
  editedAt: m.editedAt ? m.editedAt.getTime() : null,
  deletedAt: m.deletedAt ? m.deletedAt.getTime() : null,
  replyTo: m.replyTo
    ? {
        id: m.replyTo.id,
        text: m.replyTo.deletedAt ? "" : m.replyTo.text,
        senderName: m.replyTo.senderName,
        deletedAt: m.replyTo.deletedAt ? m.replyTo.deletedAt.getTime() : null,
      }
    : null,
  timestamp: m.createdAt.getTime(),
  roomId: m.roomId,
});

export const emitChatError = (socket, message) => {
  socket.emit("chat_error", { message });
};
