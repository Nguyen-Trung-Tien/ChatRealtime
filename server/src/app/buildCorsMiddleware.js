import cors from "cors";
import { isAllowedOrigin } from "../config/domain/originPolicy.js";

export const buildCorsMiddleware = () =>
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked by domain config"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  });
