import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import {
  createAccessTokenWithSession,
  createRefreshToken,
  isValidEmail,
  isValidPhone,
  normalizePhone,
  pool,
} from "../../services/chatService.js";
import { setRefreshTokenCookie } from "../../middleware/auth/cookies.js";

export const register = async (req, res) => {
  try {
    const username = (req.body?.username || "").toString().trim().toLowerCase();
    const password = (req.body?.password || "").toString();
    const email = (req.body?.email || "").toString().trim().toLowerCase();
    const phone = normalizePhone(req.body?.phone || "");

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({ message: "Username must be 3-30 chars: a-z, 0-9, _" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email khong hop le" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "So dien thoai khong hop le (9-15 so)" });
    }

    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, username, password_hash, email, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, username, passwordHash, email, phone]
    );

    const access = await createAccessTokenWithSession({ id: userId, username });
    const refresh = await createRefreshToken({ userId, sessionJti: access.jti });
    setRefreshTokenCookie(res, refresh.token);

    return res.status(201).json({
      token: access.token,
      user: { id: userId, username, email, phone },
    });
  } catch (error) {
    if (error?.code === "23505") {
      const details = (error?.detail || "").toLowerCase();
      if (details.includes("email")) {
        return res.status(409).json({ message: "Email da ton tai" });
      }
      if (details.includes("phone")) {
        return res.status(409).json({ message: "So dien thoai da ton tai" });
      }
      return res.status(409).json({ message: "Username already exists" });
    }
    console.error("register error:", error);
    return res.status(500).json({ message: "Register failed" });
  }
};
