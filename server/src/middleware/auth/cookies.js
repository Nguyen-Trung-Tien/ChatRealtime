import {
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_SECURE,
  REFRESH_TOKEN_TTL_SECONDS,
} from "../../config/env.js";

const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: REFRESH_TOKEN_COOKIE_SECURE,
  sameSite: "lax",
  path: "/",
};

const serializeCookie = (name, value, options = {}) => {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  const merged = { ...BASE_COOKIE_OPTIONS, ...options };

  if (merged.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.max(0, Math.floor(merged.maxAge))}`);
  }
  if (merged.path) {
    parts.push(`Path=${merged.path}`);
  }
  if (merged.sameSite) {
    parts.push(`SameSite=${merged.sameSite}`);
  }
  if (merged.httpOnly) {
    parts.push("HttpOnly");
  }
  if (merged.secure) {
    parts.push("Secure");
  }

  return parts.join("; ");
};

const parseCookieHeader = (cookieHeader) => {
  const raw = (cookieHeader || "").toString();
  if (!raw) return {};

  return raw.split(";").reduce((acc, chunk) => {
    const [keyPart, ...valueParts] = chunk.trim().split("=");
    if (!keyPart) return acc;
    const value = valueParts.join("=");
    acc[keyPart] = decodeURIComponent(value || "");
    return acc;
  }, {});
};

export const setRefreshTokenCookie = (res, token) => {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(REFRESH_TOKEN_COOKIE_NAME, token, {
      maxAge: REFRESH_TOKEN_TTL_SECONDS,
    })
  );
};

export const clearRefreshTokenCookie = (res) => {
  res.setHeader(
    "Set-Cookie",
    serializeCookie(REFRESH_TOKEN_COOKIE_NAME, "", {
      maxAge: 0,
    })
  );
};

export const readRefreshTokenFromRequest = (req) => {
  const cookies = parseCookieHeader(req.headers.cookie);
  return cookies[REFRESH_TOKEN_COOKIE_NAME] || "";
};
