import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { OUTPUTS_DIR, randomName, safeFileName } from '../utils/fsutil.js';

// PUBLIC_INTERFACE
export async function createPdfFromText({ title = 'Document', content = '', fontSize = 12 }) {
  /** Create a PDF from plain text with basic formatting. Returns { filePath, fileName, size } */
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();

  const margin = 50;
  const maxWidth = width - margin * 2;
  let cursorY = height - margin;

  // Title
  page.drawText(title, {
    x: margin,
    y: cursorY,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  cursorY -= 30;

  const paragraphs = content.split('\n');
  const lineHeight = fontSize + 4;

  for (const p of paragraphs) {
    const words = p.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = (line ? line + ' ' : '') + word;
      const w = font.widthOfTextAtSize(testLine, fontSize);
      if (w > maxWidth) {
        page.drawText(line, { x: margin, y: cursorY, size: fontSize, font, color: rgb(0,0,0) });
        cursorY -= lineHeight;
        line = word;
        if (cursorY < margin) {
          // new page
          const newPage = pdfDoc.addPage();
          cursorY = newPage.getSize().height - margin;
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      page.drawText(line, { x: margin, y: cursorY, size: fontSize, font, color: rgb(0,0,0) });
      cursorY -= lineHeight;
    }
    cursorY -= 8;
  }

  const bytes = await pdfDoc.save({ useObjectStreams: true });
  const fileName = safeFileName(`${title || 'document'}.pdf`);
  const filePath = path.join(OUTPUTS_DIR, `${randomName('')}_${fileName}`);
  await fs.writeFile(filePath, bytes);
  const stats = await fs.stat(filePath);
  return { filePath, fileName, size: stats.size };
}

// PUBLIC_INTERFACE
export async function compressPdf({ inputPath, level = 'medium' }) {
  /** "Compress" PDF by resaving; levels can tweak object streams flag. Returns { filePath, fileName, size } */
  const data = await fs.readFile(inputPath);
  const src = await PDFDocument.load(data);
  const useObjectStreams = level !== 'low';
  const bytes = await src.save({ useObjectStreams });

  const baseName = path.basename(inputPath).replace(/\.pdf$/i, '');
  const fileName = safeFileName(`${baseName}-compressed-${level}.pdf`);
  const filePath = path.join(OUTPUTS_DIR, `${randomName('')}_${fileName}`);
  await fs.writeFile(filePath, bytes);
  const stats = await fs.stat(filePath);
  return { filePath, fileName, size: stats.size };
}

// PUBLIC_INTERFACE
export async function mergePdfs({ inputPaths = [] }) {
  /** Merge PDFs in order. Returns { filePath, fileName, size } */
  const outputDoc = await PDFDocument.create();
  for (const p of inputPaths) {
    const bytes = await fs.readFile(p);
    const src = await PDFDocument.load(bytes);
    const pages = await outputDoc.copyPages(src, src.getPageIndices());
    pages.forEach(pg => outputDoc.addPage(pg));
  }
  const outBytes = await outputDoc.save({ useObjectStreams: true });
  const fileName = safeFileName(`merged-${Date.now()}.pdf`);
  const filePath = path.join(OUTPUTS_DIR, `${randomName('')}_${fileName}`);
  await fs.writeFile(filePath, outBytes);
  const stats = await fs.stat(filePath);
  return { filePath, fileName, size: stats.size };
}

// PUBLIC_INTERFACE
export async function splitPdf({ inputPath, ranges }) {
  /** Split PDF by page ranges. ranges format example: ["1-2", "3", "4-6"] Returns array of outputs */
  const bytes = await fs.readFile(inputPath);
  const src = await PDFDocument.load(bytes);
  const totalPages = src.getPageCount();
  const result = [];

  function parseRange(r) {
    if (r.includes('-')) {
      const [a, b] = r.split('-').map(n => parseInt(n, 10));
      return { start: Math.max(1, a), end: Math.min(totalPages, b) };
    }
    const v = Math.max(1, Math.min(totalPages, parseInt(r, 10)));
    return { start: v, end: v };
  }

  for (const r of ranges) {
    const { start, end } = parseRange(r);
    const newDoc = await PDFDocument.create();
    const pages = await newDoc.copyPages(src, Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i));
    pages.forEach(p => newDoc.addPage(p));
    const outBytes = await newDoc.save({ useObjectStreams: true });
    const baseName = path.basename(inputPath).replace(/\.pdf$/i, '');
    const fileName = safeFileName(`${baseName}-${start}-${end}.pdf`);
    const filePath = path.join(OUTPUTS_DIR, `${randomName('')}_${fileName}`);
    await fs.writeFile(filePath, outBytes);
    const stats = await fs.stat(filePath);
    result.push({ filePath, fileName, size: stats.size });
  }
  return result;
}
