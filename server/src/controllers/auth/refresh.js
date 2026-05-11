import {
  createAccessTokenWithSession,
  createRefreshToken,
  rotateRefreshToken,
} from "../../services/chatService.js";
import {
  clearRefreshTokenCookie,
  readRefreshTokenFromRequest,
  setRefreshTokenCookie,
} from "../../middleware/auth/cookies.js";

export const refresh = async (req, res) => {
  try {
    const oldRefreshToken = readRefreshTokenFromRequest(req);
    if (!oldRefreshToken) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: "Missing refresh token" });
    }

    const rotated = await rotateRefreshToken(oldRefreshToken);
    const access = await createAccessTokenWithSession(rotated.user);
    const nextRefresh = await createRefreshToken({
      userId: rotated.user.id,
      sessionJti: access.jti,
    });

    setRefreshTokenCookie(res, nextRefresh.token);
    return res.json({ token: access.token });
  } catch (error) {
    clearRefreshTokenCookie(res);
    return res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};
