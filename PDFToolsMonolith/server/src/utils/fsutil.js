import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export const STORAGE_DIR = process.env.STORAGE_DIR || './storage';
export const UPLOADS_DIR = path.join(STORAGE_DIR, 'uploads');
export const OUTPUTS_DIR = path.join(STORAGE_DIR, 'outputs');
export const TEMP_DIR = path.join(STORAGE_DIR, 'temp');

export async function ensureDirs() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(OUTPUTS_DIR, { recursive: true });
  await fs.mkdir(TEMP_DIR, { recursive: true });
}

export function safeFileName(name) {
  return name.replace(/[^\w.\-]/g, '_').slice(0, 200);
}

export function randomName(ext = '') {
  const base = crypto.randomBytes(16).toString('hex');
  return `${base}${ext}`;
}
