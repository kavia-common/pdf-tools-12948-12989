import dayjs from 'dayjs';
import { query } from '../db/pool.js';

// PUBLIC_INTERFACE
export async function recordFileHistory(userId, fileName, operation, fileSize, downloadUrl, ttlHours) {
  /** Record a processed file in FileHistory with expiration. */
  const expiresAt = ttlHours ? dayjs().add(ttlHours, 'hour').toDate() : null;
  await query(
    'INSERT INTO "FileHistory"(user_id, file_name, operation, file_size, download_url, expires_at) VALUES ($1,$2,$3,$4,$5,$6)',
    [userId, fileName, operation, fileSize, downloadUrl, expiresAt]
  );
}

// PUBLIC_INTERFACE
export async function getUserHistory(userId, limit = 50) {
  /** Get latest file history for a user. */
  const r = await query(
    'SELECT id, file_name, operation, created_at, file_size, download_url, expires_at FROM "FileHistory" WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2',
    [userId, limit]
  );
  return r.rows;
}
