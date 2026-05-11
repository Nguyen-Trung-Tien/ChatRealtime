import { Router } from "express";
import { mountAuthV1Routes } from "./mount/auth.js";
import { mountRoomV1Routes } from "./mount/rooms.js";

const v1Routes = Router();

mountAuthV1Routes(v1Routes);
mountRoomV1Routes(v1Routes);

export default v1Routes;
