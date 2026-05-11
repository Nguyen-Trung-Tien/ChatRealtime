import { requestForgotPassword } from "../../../../controllers/auth/requestForgotPassword.js";
import {
  FORGOT_PASSWORD_RATE_LIMIT_MAX,
  FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
} from "../../../../config/env.js";
import { createRateLimitMiddleware } from "../../../../middleware/rateLimit.js";

const forgotPasswordRequestRateLimit = createRateLimitMiddleware({
  keyPrefix: "auth:forgot-password-request",
  windowMs: FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MS,
  max: FORGOT_PASSWORD_RATE_LIMIT_MAX,
  message: "Too many password reset requests, please try again later.",
});

export const applyForgotPasswordRequestRoute = (router) => {
  router.post("/forgot-password/request", forgotPasswordRequestRateLimit, requestForgotPassword);
};
