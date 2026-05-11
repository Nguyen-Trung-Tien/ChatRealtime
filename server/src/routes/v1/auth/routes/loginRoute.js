import { login } from "../../../../controllers/auth/login.js";
import { AUTH_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_WINDOW_MS } from "../../../../config/env.js";
import { createRateLimitMiddleware } from "../../../../middleware/rateLimit.js";

const loginRateLimit = createRateLimitMiddleware({
  keyPrefix: "auth:login",
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: "Too many login attempts, please try again later.",
});

export const applyLoginRoute = (router) => {
  router.post("/login", loginRateLimit, login);
};
