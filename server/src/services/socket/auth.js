import { verifyTokenAndSession } from "../chatService.js";

export const attachSocketAuth = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("UNAUTHORIZED"));
      }

      const authUser = await verifyTokenAndSession(token);
      socket.data.authUser = authUser;
      return next();
    } catch {
      return next(new Error("UNAUTHORIZED"));
    }
  });
};
