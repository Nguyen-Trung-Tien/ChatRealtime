import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  JWT_SECRET,
  REFRESH_TOKEN_TTL_SECONDS,
  TOKEN_TTL_SECONDS,
} from "../../config/env.js";
import { pool } from "./common.js";

const ACCESS_TTL = ACCESS_TOKEN_TTL_SECONDS || TOKEN_TTL_SECONDS;

export const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const createAccessTokenWithSession = async (user) => {
  const jti = crypto.randomUUID();
  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      jti,
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TTL }
  );

  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + ACCESS_TTL * 1000);

  await pool.query(
    `INSERT INTO user_sessions (jti, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [jti, user.id, expiresAt]
  );

  return { token, jti, expiresAt };
};

export const createAccessToken = async (user) => {
  const session = await createAccessTokenWithSession(user);
  return session.token;
};

export const createRefreshToken = async ({ userId, sessionJti }) => {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashRefreshToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);

  await pool.query(
    `INSERT INTO user_refresh_tokens (token_hash, user_id, session_jti, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [tokenHash, userId, sessionJti, expiresAt]
  );

  return { token, expiresAt };
};

export const verifyTokenAndSession = async (token) => {
  const payload = jwt.verify(token, JWT_SECRET);

  const result = await pool.query(
    `SELECT u.id, u.username, s.jti
     FROM user_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.jti = $1
       AND s.user_id = $2
       AND s.revoked_at IS NULL
       AND s.expires_at > NOW()
     LIMIT 1`,
    [payload.jti, payload.sub]
  );

  if (result.rowCount === 0) {
    throw new Error("Session expired");
  }

  return {
    id: result.rows[0].id,
    username: result.rows[0].username,
    jti: result.rows[0].jti,
  };
};

export const revokeRefreshToken = async (rawToken) => {
  const tokenHash = hashRefreshToken(rawToken || "");
  if (!tokenHash) return;
  await pool.query(
    `UPDATE user_refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1
       AND revoked_at IS NULL`,
    [tokenHash]
  );
};

export const revokeRefreshTokensBySession = async ({ sessionJti }) => {
  await pool.query(
    `UPDATE user_refresh_tokens
     SET revoked_at = NOW()
     WHERE session_jti = $1
       AND revoked_at IS NULL`,
    [sessionJti]
  );
};

export const revokeRefreshTokensByUser = async ({ userId }) => {
  await pool.query(
    `UPDATE user_refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1
       AND revoked_at IS NULL`,
    [userId]
  );
};

export const rotateRefreshToken = async (rawToken) => {
  const tokenHash = hashRefreshToken(rawToken || "");
  if (!tokenHash) {
    throw new Error("Invalid refresh token");
  }

  const current = await pool.query(
    `SELECT rt.token_hash, rt.user_id, rt.session_jti, u.username
     FROM user_refresh_tokens rt
     INNER JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1
       AND rt.revoked_at IS NULL
       AND rt.expires_at > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  if (current.rowCount === 0) {
    throw new Error("Refresh token expired");
  }

  const row = current.rows[0];
  await pool.query(
    `UPDATE user_refresh_tokens
     SET revoked_at = NOW()
     WHERE token_hash = $1`,
    [tokenHash]
  );

  return {
    user: {
      id: row.user_id,
      username: row.username,
    },
  };
};
