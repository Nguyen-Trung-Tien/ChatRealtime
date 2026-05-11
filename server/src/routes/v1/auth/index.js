import { Router } from "express";
import { applyChangePasswordRoute } from "./routes/changePasswordRoute.js";
import { applyForgotPasswordRequestRoute } from "./routes/forgotPasswordRequestRoute.js";
import { applyForgotPasswordResetRoute } from "./routes/forgotPasswordResetRoute.js";
import { applyLoginRoute } from "./routes/loginRoute.js";
import { applyLogoutRoute } from "./routes/logoutRoute.js";
import { applyMeRoute } from "./routes/meRoute.js";
import { applyRefreshRoute } from "./routes/refreshRoute.js";
import { applyRegisterRoute } from "./routes/registerRoute.js";

const authV1Routes = Router();

applyRegisterRoute(authV1Routes);
applyLoginRoute(authV1Routes);
applyRefreshRoute(authV1Routes);
applyMeRoute(authV1Routes);
applyLogoutRoute(authV1Routes);
applyForgotPasswordRequestRoute(authV1Routes);
applyForgotPasswordResetRoute(authV1Routes);
applyChangePasswordRoute(authV1Routes);

export default authV1Routes;
