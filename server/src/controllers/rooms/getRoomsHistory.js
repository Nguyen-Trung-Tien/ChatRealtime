import { pool } from "../../services/chatService.js";

export const getRoomsHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        rm.room_id,
        r.name,
        rm.role,
        (r.created_by = $1) AS is_owner,
        (
          SELECT COUNT(*)::int
          FROM room_members rm2
          WHERE rm2.room_id = rm.room_id
        ) AS member_count,
        rm.last_joined_at,
        rm.last_active_at,
        (
          SELECT m."text"
          FROM "Message" m
          WHERE m."roomId" = rm.room_id
          ORDER BY m."createdAt" DESC
          LIMIT 1
        ) AS last_message,
        (
          SELECT m."createdAt"
          FROM "Message" m
          WHERE m."roomId" = rm.room_id
          ORDER BY m."createdAt" DESC
          LIMIT 1
        ) AS last_message_at
       FROM room_members rm
       INNER JOIN rooms r ON r.room_id = rm.room_id
       WHERE rm.user_id = $1
       ORDER BY COALESCE(rm.last_active_at, rm.last_joined_at) DESC
       LIMIT 50`,
      [req.authUser.id]
    );

    return res.json({ rooms: result.rows });
  } catch (error) {
    console.error("rooms history error:", error);
    return res.status(500).json({ message: "Cannot load room history" });
  }
};
