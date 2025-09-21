import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { query } from '../db/pool.js';
import { addLog } from '../services/logs.js';
import { authRequired } from '../middleware/auth.js';

export const router = express.Router();

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required()
});

// PUBLIC_INTERFACE
router.post('/register', async (req, res, next) => {
  /** Register a new user.
   * Body: { email, password }
   * Returns: { id, email, is_premium }
   */
  try {
    const { error, value } = authSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'Invalid input' });

    const { email, password } = value;

    const existing = await query('SELECT id FROM "User" WHERE email=$1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO "User"(email, password_hash) VALUES ($1,$2) RETURNING id, email, is_premium, created_at',
      [email, password_hash]
    );

    await addLog('info', `User registered: ${email}`, result.rows[0].id);

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUBLIC_INTERFACE
router.post('/login', async (req, res, next) => {
  /** Login and set httpOnly cookie with JWT, and create Session row.
   * Body: { email, password }
   * Returns: { token, user: { id, email, is_premium } }
   */
  try {
    const { error, value } = authSchema.validate(req.body);
    if (error) return res.status(400).json({ error: 'Invalid input' });

    const { email, password } = value;
    const userRes = await query('SELECT * FROM "User" WHERE email=$1', [email]);
    if (userRes.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const ttlHours = parseInt(process.env.SESSION_TTL_HOURS || '24', 10);
    const expiresAt = dayjs().add(ttlHours, 'hour');
    const sessionToken = uuidv4();

    await query(
      'INSERT INTO "Session"(user_id, session_token, expires_at) VALUES ($1,$2,$3)',
      [user.id, sessionToken, expiresAt.toDate()]
    );
    await query('UPDATE "User" SET last_login=NOW() WHERE id=$1', [user.id]);

    const jwtToken = jwt.sign({ uid: user.id, sid: sessionToken }, process.env.JWT_SECRET, {
      expiresIn: `${ttlHours}h`
    });

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ttlHours * 60 * 60 * 1000
    });

    await addLog('info', `User logged in: ${email}`, user.id);

    return res.json({
      token: 'set-in-cookie',
      user: { id: user.id, email: user.email, is_premium: user.is_premium }
    });
  } catch (err) {
    next(err);
  }
});

// PUBLIC_INTERFACE
router.post('/logout', authRequired, async (req, res, next) => {
  /** Logout by invalidating current session and clearing cookie. */
  try {
    const { sid, uid } = req.auth;
    await query('DELETE FROM "Session" WHERE session_token=$1', [sid]);
    res.clearCookie('token');
    await addLog('info', 'User logged out', uid);
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PUBLIC_INTERFACE
router.get('/me', authRequired, async (req, res, next) => {
  /** Get current authenticated user profile. */
  try {
    const { uid } = req.auth;
    const r = await query('SELECT id, email, is_premium, created_at, last_login FROM "User" WHERE id=$1', [uid]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    return res.json(r.rows[0]);
  } catch (err) {
    next(err);
  }
});
