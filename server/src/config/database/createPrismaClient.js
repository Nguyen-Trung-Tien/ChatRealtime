import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const createPrismaClient = (pool) => {
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};
