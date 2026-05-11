import { pool } from "../../services/chatService.js";

export const me = async (req, res) => {
  const userResult = await pool.query(
    "SELECT id, username, email, phone FROM users WHERE id = $1 LIMIT 1",
    [req.authUser.id]
  );

  if (userResult.rowCount === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  const user = userResult.rows[0];
  return res.json({
    user: { id: user.id, username: user.username, email: user.email, phone: user.phone },
  });
};
