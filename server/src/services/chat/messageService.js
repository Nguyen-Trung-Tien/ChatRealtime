import { prisma } from "./common.js";

export const fetchRoomMessages = async ({ roomId, beforeId, limit }) => {
  const where = beforeId
    ? {
        roomId,
        id: { lt: beforeId },
      }
    : { roomId };

  const result = await prisma.message.findMany({
    where,
    orderBy: { id: "desc" },
    take: limit,
    include: {
      replyTo: {
        select: {
          id: true,
          text: true,
          senderName: true,
          deletedAt: true,
        },
      },
    },
  });

  return result.reverse();
};

export const hasOlderMessages = async ({ roomId, oldestId }) => {
  if (!oldestId) return false;
  const older = await prisma.message.findFirst({
    where: {
      roomId,
      id: { lt: oldestId },
    },
    orderBy: { id: "desc" },
  });
  return Boolean(older);
};

export const searchRoomMessages = async ({ roomId, query, limit }) => {
  const result = await prisma.message.findMany({
    where: {
      roomId,
      deletedAt: null,
      text: {
        contains: query,
        mode: "insensitive",
      },
    },
    orderBy: { id: "desc" },
    take: limit,
    include: {
      replyTo: {
        select: {
          id: true,
          text: true,
          senderName: true,
          deletedAt: true,
        },
      },
    },
  });

  return result;
};
