import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {
  ensureUserIsMember,
  GLOBAL_ROOM_FALLBACK,
  isValidRoomId,
  normalizeRoomId,
  prisma,
  toMessagePayload,
  UPLOAD_BASE_DIR,
  UPLOAD_MAX_BYTES,
  updateRoomActivity,
} from "../../services/chatService.js";

const sanitizeFileName = (fileName) =>
  (fileName || "file")
    .toString()
    .replace(/[^\w.\-]/g, "_")
    .slice(0, 120);

const decodeBase64File = (value) => {
  try {
    return Buffer.from(value, "base64");
  } catch {
    return null;
  }
};

export const uploadRoomFile = async (req, res) => {
  try {
    const roomId = normalizeRoomId(req.params.roomId || GLOBAL_ROOM_FALLBACK);
    if (!isValidRoomId(roomId)) {
      return res.status(400).json({ message: "Invalid room ID" });
    }

    const member = await ensureUserIsMember({ userId: req.authUser.id, roomId });
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this room" });
    }

    const fileName = sanitizeFileName(req.body?.fileName);
    const mimeType = (req.body?.mimeType || "application/octet-stream").toString().slice(0, 120);
    const base64Data = (req.body?.base64Data || "").toString();
    if (!fileName || !base64Data) {
      return res.status(400).json({ message: "Missing file payload" });
    }

    const fileBuffer = decodeBase64File(base64Data);
    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({ message: "Invalid file payload" });
    }
    if (fileBuffer.length > UPLOAD_MAX_BYTES) {
      return res.status(400).json({ message: `File too large. Max ${UPLOAD_MAX_BYTES} bytes` });
    }

    const roomDir = path.resolve(process.cwd(), UPLOAD_BASE_DIR, roomId);
    await fs.mkdir(roomDir, { recursive: true });

    const uniqueFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${fileName}`;
    const absoluteFilePath = path.join(roomDir, uniqueFileName);
    await fs.writeFile(absoluteFilePath, fileBuffer);

    const fileUrl = `/uploads/${encodeURIComponent(roomId)}/${encodeURIComponent(uniqueFileName)}`;
    const metadata = {
      fileName,
      mimeType,
      size: fileBuffer.length,
      url: fileUrl,
    };

    const created = await prisma.message.create({
      data: {
        roomId,
        senderId: req.authUser.id,
        senderName: req.authUser.username,
        type: "file",
        text: JSON.stringify(metadata),
      },
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

    await updateRoomActivity({ roomId, userId: req.authUser.id });
    req.app.locals.io?.to(roomId).emit("receive_message", { message: toMessagePayload(created) });

    return res.status(201).json({
      ok: true,
      file: metadata,
      message: toMessagePayload(created),
    });
  } catch (error) {
    console.error("upload room file error:", error);
    return res.status(500).json({ message: "Cannot upload file" });
  }
};
