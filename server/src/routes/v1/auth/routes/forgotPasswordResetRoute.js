import { resetForgotPassword } from "../../../../controllers/auth/resetForgotPassword.js";
import {
  FORGOT_PASSWORD_RATE_LIMIT_MAX,
  FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
} from "../../../../config/env.js";
import { createRateLimitMiddleware } from "../../../../middleware/rateLimit.js";

const forgotPasswordResetRateLimit = createRateLimitMiddleware({
  keyPrefix: "auth:forgot-password-reset",
  windowMs: FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
  max: FORGOT_PASSWORD_RATE_LIMIT_MAX,
  message: "Too many password reset attempts, please try again later.",
});

export const applyForgotPasswordResetRoute = (router) => {
  router.post("/forgot-password/reset", forgotPasswordResetRateLimit, resetForgotPassword);
};
