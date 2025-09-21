import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import pinoHttp from 'pino-http';

import { router as authRouter } from './routes/auth.js';
import { router as pdfRouter } from './routes/pdf.js';
import { router as historyRouter } from './routes/history.js';
import { router as logsRouter } from './routes/logs.js';
import { ensureDirs } from './utils/fsutil.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { authOptional } from './middleware/auth.js';

const app = express();

// Logger
app.use(pinoHttp());

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" }
}));

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Rate limit
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120
});
app.use(limiter);

// Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Storage directories
await ensureDirs();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Docs endpoint for WebSocket usage note (no WS in this monolith)
app.get('/api/docs/websocket', (req, res) => {
  res.json({
    title: 'WebSocket Usage',
    description: 'This application does not currently expose WebSocket endpoints. All operations are HTTP-based.'
  });
});

// Public static serving of downloadable files via signed tokens handled in pdf routes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routers
app.use('/api/auth', authRouter);
app.use('/api/pdf', authOptional, pdfRouter);
app.use('/api/history', historyRouter);
app.use('/api/logs', logsRouter);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PDF Tools Monolith server running on port ${PORT}`);
});
