import {
  pool,
  revokeRefreshToken,
  revokeRefreshTokensBySession,
  verifyTokenAndSession,
} from "../../services/chatService.js";
import { clearRefreshTokenCookie, readRefreshTokenFromRequest } from "../../middleware/auth/cookies.js";
import { parseBearerToken } from "../../middleware/auth/parseBearerToken.js";

export const logout = async (req, res) => {
  try {
    const bearer = parseBearerToken(req.headers.authorization);
    if (bearer) {
      try {
        const authUser = await verifyTokenAndSession(bearer);
        await pool.query("UPDATE user_sessions SET revoked_at = NOW() WHERE jti = $1", [authUser.jti]);
        await revokeRefreshTokensBySession({ sessionJti: authUser.jti });
      } catch {
        // ignore invalid/expired bearer token in logout flow
      }
    }

    const refreshToken = readRefreshTokenFromRequest(req);
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
  } finally {
    clearRefreshTokenCookie(res);
  }

  return res.json({ ok: true });
};
