import crypto from "node:crypto";
import { hashResetToken, pool } from "../../services/chatService.js";

export const requestForgotPassword = async (req, res) => {
  try {
    const username = (req.body?.username || "").toString().trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({ message: "Username khong hop le" });
    }

    const userResult = await pool.query("SELECT id FROM users WHERE username = $1 LIMIT 1", [
      username,
    ]);

    if (userResult.rowCount === 0) {
      return res.json({
        message: "Neu tai khoan ton tai, ma dat lai mat khau da duoc tao.",
      });
    }

    const userId = userResult.rows[0].id;
    const rawToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const resetId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "UPDATE password_resets SET used_at = NOW() WHERE user_id = $1 AND used_at IS NULL",
      [userId]
    );

    await pool.query(
      `INSERT INTO password_resets (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [resetId, userId, tokenHash, expiresAt]
    );

    // In production, raw reset tokens must never be returned by API and should be sent via email/SMS.
    if (process.env.NODE_ENV !== "production") {
      console.log(`Password reset token issued for ${username}: ${rawToken}`);
    }

    const responsePayload = {
      message: "Neu tai khoan ton tai, ma dat lai mat khau da duoc tao va gui qua kenh xac minh.",
      expiresAt,
    };

    if (process.env.NODE_ENV === "development") {
      responsePayload.resetToken = rawToken;
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error("forgot password request error:", error);
    return res.status(500).json({ message: "Khong the tao yeu cau quen mat khau" });
  }
};
