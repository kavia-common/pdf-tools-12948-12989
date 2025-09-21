import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { UPLOADS_DIR, OUTPUTS_DIR, randomName, safeFileName } from '../utils/fsutil.js';
import { createPdfFromText, compressPdf, mergePdfs, splitPdf } from '../services/pdfService.js';
import { recordFileHistory } from '../services/history.js';
import { addLog } from '../services/logs.js';

const router = express.Router();
export { router };

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: (parseInt(process.env.MAX_UPLOAD_MB || '50', 10)) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new Error('Only PDF files are allowed'));
    }
    return cb(null, true);
  }
});

// In-memory map of signed download tokens -> file path + expiry
const downloadTokens = new Map();

function signDownload(filePath, ttlHours = 24) {
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = dayjs().add(ttlHours, 'hour').toDate();
  downloadTokens.set(token, { filePath, expiresAt });
  return token;
}

// PUBLIC_INTERFACE
router.post('/create', async (req, res, next) => {
  /** Create PDF from text.
   * Body: { title, content, fontSize }
   * Returns: { downloadUrl, fileName, size }
   */
  try {
    const ttlHours = parseInt(process.env.PUBLIC_DOWNLOAD_TTL_HOURS || '24', 10);
    const { title, content, fontSize } = req.body || {};
    const out = await createPdfFromText({ title, content, fontSize });
    const token = signDownload(out.filePath, ttlHours);
    const dl = `/api/pdf/download?token=${token}`;
    if (req.auth?.uid) {
      await recordFileHistory(req.auth.uid, out.fileName, 'create', out.size, dl, ttlHours);
    }
    await addLog('info', `PDF created: ${out.fileName}`, req.auth?.uid || null);
    return res.json({ downloadUrl: dl, fileName: out.fileName, size: out.size });
  } catch (err) {
    next(err);
  }
});

// PUBLIC_INTERFACE
router.post('/compress', upload.single('file'), async (req, res, next) => {
  /** Compress uploaded PDF.
   * FormData: file (pdf), level (low|medium|high)
   * Returns: { downloadUrl, fileName, size, beforeSize }
   */
  try {
    const ttlHours = parseInt(process.env.PUBLIC_DOWNLOAD_TTL_HOURS || '24', 10);
    const level = req.body?.level || 'medium';
    const uploaded = req.file;
    if (!uploaded) return res.status(400).json({ error: 'No file uploaded' });

    const out = await compressPdf({ inputPath: uploaded.path, level });
    const token = signDownload(out.filePath, ttlHours);
    const dl = `/api/pdf/download?token=${token}`;
    if (req.auth?.uid) {
      await recordFileHistory(req.auth.uid, out.fileName, 'compress', out.size, dl, ttlHours);
    }
    await addLog('info', `PDF compressed: ${out.fileName} (${level})`, req.auth?.uid || null);
    const beforeStats = await fs.stat(uploaded.path);
    return res.json({ downloadUrl: dl, fileName: out.fileName, size: out.size, beforeSize: beforeStats.size });
  } catch (err) {
    next(err);
  }
});

// PUBLIC_INTERFACE
router.post('/merge', upload.array('files', 10), async (req, res, next) => {
  /** Merge uploaded PDFs in provided order.
   * FormData: files[], order (optional comma-separated indices), 
   * Returns: { downloadUrl, fileName, size }
   */
  try {
    const ttlHours = parseInt(process.env.PUBLIC_DOWNLOAD_TTL_HOURS || '24', 10);
    let files = req.files || [];
    const order = req.body?.order;
    if (!files.length) return res.status(400).json({ error: 'No files uploaded' });

    if (order) {
      const indices = order.split(',').map(n => parseInt(n, 10));
      files = indices.map(i => files[i]).filter(Boolean);
    }
    const paths = files.map(f => f.path);
    const out = await mergePdfs({ inputPaths: paths });

    const token = signDownload(out.filePath, ttlHours);
    const dl = `/api/pdf/download?token=${token}`;
    if (req.auth?.uid) {
      await recordFileHistory(req.auth.uid, out.fileName, 'merge', out.size, dl, ttlHours);
    }
    await addLog('info', `PDF merged: ${out.fileName}`, req.auth?.uid || null);
    return res.json({ downloadUrl: dl, fileName: out.fileName, size: out.size });
  } catch (err) {
    next(err);
  }
});

// PUBLIC_INTERFACE
router.post('/split', upload.single('file'), async (req, res, next) => {
  /** Split uploaded PDF by ranges.
   * FormData: file (pdf), ranges (e.g., "1-2,3,4-5")
   * Returns: { outputs: [{ downloadUrl, fileName, size }]}
   */
  try {
    const ttlHours = parseInt(process.env.PUBLIC_DOWNLOAD_TTL_HOURS || '24', 10);
    const uploaded = req.file;
    if (!uploaded) return res.status(400).json({ error: 'No file uploaded' });
    const ranges_str = req.body?.ranges || '';
    const ranges = ranges_str.split(',').map(s => s.trim()).filter(Boolean);
    if (!ranges.length) return res.status(400).json({ error: 'No ranges specified' });

    const outputs = await splitPdf({ inputPath: uploaded.path, ranges });
    const payloads = [];
    for (const out of outputs) {
      const token = signDownload(out.filePath, ttlHours);
      const dl = `/api/pdf/download?token=${token}`;
      if (req.auth?.uid) {
        await recordFileHistory(req.auth.uid, out.fileName, 'split', out.size, dl, ttlHours);
      }
      payloads.push({ downloadUrl: dl, fileName: out.fileName, size: out.size });
    }
    await addLog('info', `PDF split into ${outputs.length} parts`, req.auth?.uid || null);
    return res.json({ outputs: payloads });
  } catch (err) {
    next(err);
  }
});

// PUBLIC_INTERFACE
router.get('/download', async (req, res, next) => {
  /** Serve file by signed token query parameter. */
  try {
    const token = req.query?.token;
    if (!token || !downloadTokens.has(token)) {
      return res.status(404).json({ error: 'Invalid link' });
    }
    const { filePath, expiresAt } = downloadTokens.get(token);
    if (dayjs().isAfter(expiresAt)) {
      downloadTokens.delete(token);
      return res.status(410).json({ error: 'Link expired' });
    }
    const fileName = safeFileName(path.basename(filePath).replace(/^[a-f0-9]+_/, ''));
    res.download(filePath, fileName);
  } catch (err) {
    next(err);
  }
});

export default router;
