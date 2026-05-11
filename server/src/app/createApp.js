import express from "express";
import { registerApiRoutes } from "./registerApiRoutes.js";
import { registerCoreMiddleware } from "./registerCoreMiddleware.js";
import { registerHealthRoute } from "./registerHealthRoute.js";

export const createApp = () => {
  const app = express();

  registerCoreMiddleware(app);
  registerHealthRoute(app);
  registerApiRoutes(app);

  return app;
};
