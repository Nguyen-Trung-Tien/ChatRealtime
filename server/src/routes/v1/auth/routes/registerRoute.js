import { register } from "../../../../controllers/auth/register.js";
import { AUTH_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_WINDOW_MS } from "../../../../config/env.js";
import { createRateLimitMiddleware } from "../../../../middleware/rateLimit.js";

const registerRateLimit = createRateLimitMiddleware({
  keyPrefix: "auth:register",
  windowMs: AUTH_RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: "Too many register attempts, please try again later.",
});

export const applyRegisterRoute = (router) => {
  router.post("/register", registerRateLimit, register);
};
