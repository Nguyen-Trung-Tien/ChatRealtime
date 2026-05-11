const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const AUTH_RATE_LIMIT_WINDOW_MS = parsePositiveInt(
  process.env.AUTH_RATE_LIMIT_WINDOW_MS,
  60_000
);
export const AUTH_RATE_LIMIT_MAX = parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 10);

export const FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS = parsePositiveInt(
  process.env.FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
  15 * 60_000
);
export const FORGOT_PASSWORD_RATE_LIMIT_MAX = parsePositiveInt(
  process.env.FORGOT_PASSWORD_RATE_LIMIT_MAX,
  5
);

export const MESSAGE_RATE_LIMIT_WINDOW_MS = parsePositiveInt(
  process.env.MESSAGE_RATE_LIMIT_WINDOW_MS,
  10_000
);
export const MESSAGE_RATE_LIMIT_MAX = parsePositiveInt(process.env.MESSAGE_RATE_LIMIT_MAX, 20);
