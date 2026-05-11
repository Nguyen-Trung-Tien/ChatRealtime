import apiRoutes from "../routes/index.js";

export const registerApiRoutes = (app) => {
  app.use("/api", apiRoutes);
};
