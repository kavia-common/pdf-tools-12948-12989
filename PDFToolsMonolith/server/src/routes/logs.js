import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { query } from '../db/pool.js';

export const router = express.Router();

// PUBLIC_INTERFACE
router.get('/', authRequired, async (req, res, next) => {
  /** Get recent logs (for personal visibility – only shows user-specific logs and global info). */
  try {
    const { uid } = req.auth;
    const r = await query(
      `SELECT id, level, message, created_at, user_id
       FROM "Log"
       WHERE user_id IS NULL OR user_id=$1
       ORDER BY created_at DESC
       LIMIT 200`,
      [uid]
    );
    res.json({ items: r.rows });
  } catch (err) {
    next(err);
  }
});
