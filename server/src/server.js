import "dotenv/config";
import { startServer } from "./bootstrap/startServer.js";

startServer().catch((error) => {
  console.error("Database initialization failed:", error);
  process.exit(1);
});
