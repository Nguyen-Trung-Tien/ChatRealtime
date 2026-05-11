import { uploadRoomFile } from "../../../../controllers/rooms/uploadRoomFile.js";
import { authMiddleware } from "../../../../middleware/authMiddleware.js";

export const applyUploadRoomFileRoute = (router) => {
  router.post("/:roomId/uploads", authMiddleware, uploadRoomFile);
};
