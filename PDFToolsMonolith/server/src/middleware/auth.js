import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';

// PUBLIC_INTERFACE
export async function authRequired(req, res, next) {
  /** Require valid auth cookie token and active session. Sets req.auth = { uid, sid }. */
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { uid, sid } = payload;

    const sessionRes = await query(
      'SELECT id FROM "Session" WHERE session_token=$1 AND user_id=$2 AND expires_at>NOW()',
      [sid, uid]
    );
    if (sessionRes.rowCount === 0) return res.status(401).json({ error: 'Session expired' });

    req.auth = { uid, sid };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// PUBLIC_INTERFACE
export async function authOptional(req, res, next) {
  /** Optionally set req.auth when token is present and valid, otherwise continue. */
  try {
    const token = req.cookies?.token;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { uid, sid } = payload;
    const sessionRes = await query(
      'SELECT id FROM "Session" WHERE session_token=$1 AND user_id=$2 AND expires_at>NOW()',
      [sid, uid]
    );
    if (sessionRes.rowCount === 0) return next();
    req.auth = { uid, sid };
    next();
  } catch (_e) {
    return next();
  }
}
