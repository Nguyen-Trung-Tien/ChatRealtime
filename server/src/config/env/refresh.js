const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isProduction = process.env.NODE_ENV === "production";

export const ACCESS_TOKEN_TTL_SECONDS = parsePositiveInt(
  process.env.ACCESS_TOKEN_TTL_SECONDS,
  15 * 60
);
export const REFRESH_TOKEN_TTL_SECONDS = parsePositiveInt(
  process.env.REFRESH_TOKEN_TTL_SECONDS,
  30 * 24 * 60 * 60
);
export const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || "chat_refresh_token";
export const REFRESH_TOKEN_COOKIE_SECURE = isProduction;
