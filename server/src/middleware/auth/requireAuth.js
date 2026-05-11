import { verifyTokenAndSession } from "../../services/chatService.js";
import { parseBearerToken } from "./parseBearerToken.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = parseBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const authUser = await verifyTokenAndSession(token);
    req.authUser = authUser;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
