import v1Routes from "../v1/index.js";

export const mountV1Routes = (router) => {
  router.use("/v1", v1Routes);
};
