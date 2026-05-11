import { me } from "../../../../controllers/auth/me.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyMeRoute = (router) => {
  router.get("/me", authMiddleware, me);
};
