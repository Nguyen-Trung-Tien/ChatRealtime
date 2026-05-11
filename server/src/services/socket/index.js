import { Server } from "socket.io";
import { isAllowedOrigin } from "../../config/domain.js";
import { attachSocketAuth } from "./auth.js";
import { registerSocketHandlers } from "./registerHandlers.js";

export const createSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }
        return callback(new Error("CORS blocked by domain config"));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // socket.id -> { socketId, userId, username, roomId }
  const users = new Map();

  attachSocketAuth(io);

  io.on("connection", (socket) => {
    registerSocketHandlers({ io, users, socket });
  });

  return { io, users };
};
