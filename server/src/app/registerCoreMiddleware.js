import express from "express";
import { buildCorsMiddleware } from "./buildCorsMiddleware.js";
import path from "node:path";
import { attachRequestContext } from "../middleware/requestContext.js";
import { requestLogger } from "../middleware/requestLogger.js";
import { UPLOAD_BASE_DIR } from "../config/env.js";

export const registerCoreMiddleware = (app) => {
  app.use(buildCorsMiddleware());
  app.use(attachRequestContext);
  app.use(requestLogger);
  app.use(express.json({ limit: "10mb" }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), UPLOAD_BASE_DIR)));
};
