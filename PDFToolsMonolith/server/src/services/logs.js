import { query } from '../db/pool.js';

// PUBLIC_INTERFACE
export async function addLog(level, message, userId = null) {
  /** Add a log entry to Log table. */
  await query('INSERT INTO "Log"(level, message, user_id) VALUES ($1,$2,$3)', [level, message, userId]);
}
