export {
  clamp,
  emitChatError,
  GLOBAL_ROOM_FALLBACK,
  isValidEmail,
  isValidPhone,
  isValidRoomId,
  MESSAGE_RATE_LIMIT_MAX,
  MESSAGE_RATE_LIMIT_WINDOW_MS,
  MESSAGE_PAGE_SIZE,
  UPLOAD_BASE_DIR,
  UPLOAD_MAX_BYTES,
  normalizePhone,
  normalizeRoomId,
  parsePositiveInt,
  pool,
  prisma,
  toMessagePayload,
} from "./chat/common.js";

export {
  createAccessToken,
  createAccessTokenWithSession,
  createRefreshToken,
  hashResetToken,
  revokeRefreshToken,
  revokeRefreshTokensBySession,
  revokeRefreshTokensByUser,
  rotateRefreshToken,
  verifyTokenAndSession,
} from "./chat/authService.js";
export { initDatabase } from "./chat/databaseInitService.js";
export { fetchRoomMessages, hasOlderMessages, searchRoomMessages } from "./chat/messageService.js";
export {
  ensureRoomAndMembership,
  getUserRoomRole,
  leaveRoomMembership,
  listRoomMembers,
  touchMemberLastSeen,
  ensureUserIsMember,
  updateMemberRole,
  updateRoomActivity,
} from "./chat/roomService.js";
