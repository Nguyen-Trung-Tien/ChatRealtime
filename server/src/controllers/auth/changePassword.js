import bcrypt from "bcryptjs";
import { pool } from "../../services/chatService.js";

export const changePassword = async (req, res) => {
  try {
    const oldPassword = (req.body?.oldPassword || "").toString();
    const newPassword = (req.body?.newPassword || "").toString();

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const userResult = await pool.query("SELECT id, password_hash FROM users WHERE id = $1 LIMIT 1", [
      req.authUser.id,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidOldPassword = await bcrypt.compare(
      oldPassword,
      userResult.rows[0].password_hash
    );

    if (!isValidOldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      newHash,
      req.authUser.id,
    ]);

    await pool.query(
      `UPDATE user_sessions
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND jti <> $2
         AND revoked_at IS NULL`,
      [req.authUser.id, req.authUser.jti]
    );

    await pool.query(
      `UPDATE user_refresh_tokens
       SET revoked_at = NOW()
       WHERE user_id = $1
         AND session_jti <> $2
         AND revoked_at IS NULL`,
      [req.authUser.id, req.authUser.jti]
    );

    return res.json({ ok: true });
  } catch (error) {
    console.error("change password error:", error);
    return res.status(500).json({ message: "Cannot change password" });
  }
};
