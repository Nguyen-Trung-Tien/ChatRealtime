import bcrypt from "bcryptjs";
import { hashResetToken, pool } from "../../services/chatService.js";

export const resetForgotPassword = async (req, res) => {
  try {
    const username = (req.body?.username || "").toString().trim().toLowerCase();
    const token = (req.body?.token || "").toString().trim();
    const newPassword = (req.body?.newPassword || "").toString();

    if (!/^[a-z0-9_]{3,30}$/.test(username) || !token) {
      return res.status(400).json({ message: "Thong tin dat lai mat khau khong hop le" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mat khau moi phai co it nhat 6 ky tu" });
    }

    const userResult = await pool.query("SELECT id FROM users WHERE username = $1 LIMIT 1", [
      username,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(400).json({ message: "Token hoac username khong dung" });
    }

    const userId = userResult.rows[0].id;
    const tokenHash = hashResetToken(token);

    const resetResult = await pool.query(
      `SELECT id
       FROM password_resets
       WHERE user_id = $1
         AND token_hash = $2
         AND used_at IS NULL
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, tokenHash]
    );

    if (resetResult.rowCount === 0) {
      return res.status(400).json({ message: "Token hoac username khong dung/het han" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [newHash, userId]);
    await pool.query("UPDATE password_resets SET used_at = NOW() WHERE id = $1", [
      resetResult.rows[0].id,
    ]);
    await pool.query(
      "UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [userId]
    );
    await pool.query(
      "UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
      [userId]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("forgot password reset error:", error);
    return res.status(500).json({ message: "Khong the dat lai mat khau" });
  }
};
