import authV1Routes from "../auth/index.js";

export const mountAuthV1Routes = (router) => {
  router.use("/auth", authV1Routes);
};
