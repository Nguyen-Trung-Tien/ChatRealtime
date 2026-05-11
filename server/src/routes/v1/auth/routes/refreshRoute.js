import { refresh } from "../../../../controllers/auth/refresh.js";
import { AUTH_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_WINDOW_MS } from "../../../../config/env.js";
import { createRateLimitMiddleware } from "../../../../middleware/rateLimit.js";

const refreshRateLimit = createRateLimitMiddleware({
  keyPrefix: "auth:refresh",
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: "Too many refresh attempts, please try again later.",
});

export const applyRefreshRoute = (router) => {
  router.post("/refresh", refreshRateLimit, refresh);
};
