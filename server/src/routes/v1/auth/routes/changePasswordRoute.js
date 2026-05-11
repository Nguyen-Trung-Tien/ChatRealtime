import { changePassword } from "../../../../controllers/auth/changePassword.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyChangePasswordRoute = (router) => {
  router.post("/change-password", authMiddleware, changePassword);
};
