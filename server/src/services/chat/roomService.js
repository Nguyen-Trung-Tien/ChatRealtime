import { pool } from "./common.js";

const ROOM_ROLES = new Set(["owner", "admin", "member"]);

export const ensureRoomAndMembership = async ({ userId, roomId, createdBy, roomName }) => {
  const createdRoom = await pool.query(
    `INSERT INTO rooms (room_id, name, created_by)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id) DO NOTHING
     RETURNING room_id`,
    [roomId, roomName || roomId, createdBy]
  );

  const membershipRole = createdRoom.rowCount > 0 && userId === createdBy ? "owner" : "member";

  await pool.query(
    `INSERT INTO room_members (room_id, user_id, role, last_joined_at, last_active_at, last_seen_at)
     VALUES ($1, $2, $3, NOW(), NOW(), NOW())
     ON CONFLICT (room_id, user_id)
     DO UPDATE SET last_joined_at = NOW(), last_active_at = NOW(), last_seen_at = NOW()`,
    [roomId, userId, membershipRole]
  );
};

export const updateRoomActivity = async ({ roomId, userId }) => {
  await pool.query("UPDATE rooms SET updated_at = NOW() WHERE room_id = $1", [roomId]);
  if (userId) {
    await pool.query(
      `UPDATE room_members
       SET last_active_at = NOW()
       WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );
  }
};

export const touchMemberLastSeen = async ({ roomId, userId }) => {
  await pool.query(
    `UPDATE room_members
     SET last_seen_at = NOW(), last_active_at = NOW()
     WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );
};

export const ensureUserIsMember = async ({ userId, roomId }) => {
  const result = await pool.query(
    "SELECT 1 FROM room_members WHERE user_id = $1 AND room_id = $2 LIMIT 1",
    [userId, roomId]
  );
  return result.rowCount > 0;
};

export const getUserRoomRole = async ({ userId, roomId }) => {
  const result = await pool.query(
    "SELECT role FROM room_members WHERE user_id = $1 AND room_id = $2 LIMIT 1",
    [userId, roomId]
  );
  return result.rowCount === 0 ? null : result.rows[0].role;
};

export const listRoomMembers = async ({ roomId, users }) => {
  const result = await pool.query(
    `SELECT rm.user_id, rm.role, rm.last_seen_at, u.username
     FROM room_members rm
     INNER JOIN users u ON u.id = rm.user_id
     WHERE rm.room_id = $1
     ORDER BY
       CASE rm.role
         WHEN 'owner' THEN 1
         WHEN 'admin' THEN 2
         ELSE 3
       END,
       u.username ASC`,
    [roomId]
  );

  const onlineByUserId = new Map();
  const activeUsers = users ? Array.from(users.values()) : [];
  activeUsers
    .filter((u) => u.roomId === roomId)
    .forEach((u) => {
      if (!onlineByUserId.has(u.userId)) {
        onlineByUserId.set(u.userId, u.id);
      }
    });

  return result.rows.map((row) => {
    const socketId = onlineByUserId.get(row.user_id);
    return {
      userId: row.user_id,
      username: row.username,
      role: row.role,
      isOnline: Boolean(socketId),
      socketId: socketId || null,
      lastSeenAt: row.last_seen_at ? new Date(row.last_seen_at).getTime() : null,
    };
  });
};

export const leaveRoomMembership = async ({ roomId, userId }) => {
  const role = await getUserRoomRole({ roomId, userId });
  if (!role) {
    return { ok: false, reason: "NOT_MEMBER" };
  }

  if (role === "owner") {
    return { ok: false, reason: "OWNER_CANNOT_LEAVE" };
  }

  await pool.query("DELETE FROM room_members WHERE room_id = $1 AND user_id = $2", [roomId, userId]);
  return { ok: true };
};

export const updateMemberRole = async ({ roomId, actorUserId, targetUserId, role }) => {
  if (!ROOM_ROLES.has(role) || role === "owner") {
    return { ok: false, reason: "INVALID_ROLE" };
  }

  const actorRole = await getUserRoomRole({ roomId, userId: actorUserId });
  if (actorRole !== "owner") {
    return { ok: false, reason: "FORBIDDEN" };
  }

  const targetRole = await getUserRoomRole({ roomId, userId: targetUserId });
  if (!targetRole) {
    return { ok: false, reason: "TARGET_NOT_MEMBER" };
  }
  if (targetRole === "owner") {
    return { ok: false, reason: "CANNOT_CHANGE_OWNER" };
  }

  await pool.query(
    `UPDATE room_members
     SET role = $3, last_active_at = NOW()
     WHERE room_id = $1 AND user_id = $2`,
    [roomId, targetUserId, role]
  );

  return { ok: true };
};
