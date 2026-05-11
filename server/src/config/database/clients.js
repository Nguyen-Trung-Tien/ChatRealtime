import { createPool } from "./createPool.js";
import { createPrismaClient } from "./createPrismaClient.js";

export const pool = createPool();
export const prisma = createPrismaClient(pool);
