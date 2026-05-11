import { createPool } from "./database/createPool.js";
import { createPrismaClient } from "./database/createPrismaClient.js";

export const pool = createPool();
export const prisma = createPrismaClient(pool);
