import { register } from "./auth/register.js";
import { login } from "./auth/login.js";
import { me } from "./auth/me.js";
import { logout } from "./auth/logout.js";
import { requestForgotPassword } from "./auth/requestForgotPassword.js";
import { resetForgotPassword } from "./auth/resetForgotPassword.js";
import { changePassword } from "./auth/changePassword.js";

export {
  register,
  login,
  me,
  logout,
  requestForgotPassword,
  resetForgotPassword,
  changePassword,
};
