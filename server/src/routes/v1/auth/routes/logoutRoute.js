import { logout } from "../../../../controllers/auth/logout.js";

export const applyLogoutRoute = (router) => {
  router.post("/logout", logout);
};
