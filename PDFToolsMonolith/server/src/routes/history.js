import express from 'express';
import { authRequired } from '../middleware/auth.js';
import { getUserHistory } from '../services/history.js';

export const router = express.Router();

// PUBLIC_INTERFACE
router.get('/', authRequired, async (req, res, next) => {
  /** Get current user's file history. Returns array of history records. */
  try {
    const items = await getUserHistory(req.auth.uid, 100);
    res.json({ items });
  } catch (err) {
    next(err);
  }
});
