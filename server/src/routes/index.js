import { Router } from "express";
import { mountV1Routes } from "./mount/v1.js";

const apiRoutes = Router();

mountV1Routes(apiRoutes);

export default apiRoutes;
