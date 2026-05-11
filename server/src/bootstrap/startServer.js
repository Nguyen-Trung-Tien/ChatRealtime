import http from "http";
import { createApp } from "../app/createApp.js";
import { PORT } from "../config/env/port.js";
import { initDatabase } from "../services/chat/databaseInitService.js";
import { createSocketServer } from "../services/socket/index.js";

export const startServer = async () => {
  const app = createApp();
  const httpServer = http.createServer(app);
  const { io, users } = createSocketServer(httpServer);

  app.locals.io = io;
  app.locals.users = users;

  await initDatabase();

  return new Promise((resolve) => {
    httpServer.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      resolve({ app, httpServer, io, users });
    });
  });
};
