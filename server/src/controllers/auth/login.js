import bcrypt from "bcryptjs";
import {
  createAccessTokenWithSession,
  createRefreshToken,
  pool,
} from "../../services/chatService.js";
import { setRefreshTokenCookie } from "../../middleware/auth/cookies.js";

export const login = async (req, res) => {
  try {
    const username = (req.body?.username || "").toString().trim().toLowerCase();
    const password = (req.body?.password || "").toString();

    const userResult = await pool.query(
      `SELECT id, username, email, phone, password_hash
       FROM users
       WHERE username = $1
       LIMIT 1`,
      [username]
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];
    const matched = await bcrypt.compare(password, user.password_hash);
    if (!matched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const access = await createAccessTokenWithSession({ id: user.id, username: user.username });
    const refresh = await createRefreshToken({ userId: user.id, sessionJti: access.jti });
    setRefreshTokenCookie(res, refresh.token);

    return res.json({
      token: access.token,
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone },
    });
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};
