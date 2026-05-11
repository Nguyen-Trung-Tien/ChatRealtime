import { pool } from "./common.js";

export const initDatabase = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT");
  await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT");
  await pool.query(
    "CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users(LOWER(email)) WHERE email IS NOT NULL"
  );
  await pool.query(
    "CREATE UNIQUE INDEX IF NOT EXISTS users_phone_unique_idx ON users(phone) WHERE phone IS NOT NULL"
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      jti TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      revoked_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_refresh_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      session_jti TEXT REFERENCES user_sessions(jti) ON DELETE CASCADE,
      replaced_by TEXT,
      revoked_at TIMESTAMPTZ,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON user_refresh_tokens(user_id, expires_at DESC)"
  );
  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_refresh_tokens_session ON user_refresh_tokens(session_jti, expires_at DESC)"
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_members (
      room_id TEXT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      last_joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (room_id, user_id)
    )
  `);

  await pool.query("ALTER TABLE room_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member'");
  await pool.query(
    "ALTER TABLE room_members ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()"
  );

  await pool.query(
    `UPDATE room_members rm
     SET role = 'owner'
     FROM rooms r
     WHERE rm.room_id = r.room_id
       AND rm.user_id = r.created_by
       AND rm.role <> 'owner'`
  );

  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_room_members_user_active ON room_members(user_id, last_active_at DESC)"
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(
    "CREATE INDEX IF NOT EXISTS idx_password_resets_lookup ON password_resets(user_id, token_hash, used_at, expires_at)"
  );

  await pool.query(
    `ALTER TABLE IF EXISTS "Message"
     ADD COLUMN IF NOT EXISTS "replyToId" INTEGER,
     ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMPTZ,
     ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMPTZ`
  );

  await pool.query(
    'CREATE INDEX IF NOT EXISTS "Message_replyToId_idx" ON "Message"("replyToId")'
  );

  await pool.query(`
    DO $$
    BEGIN
      IF to_regclass('"Message"') IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'Message_replyToId_fkey'
      ) THEN
        ALTER TABLE "Message"
        ADD CONSTRAINT "Message_replyToId_fkey"
        FOREIGN KEY ("replyToId") REFERENCES "Message"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
      END IF;
    END $$;
  `);
};
