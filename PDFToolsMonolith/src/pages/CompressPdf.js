import React, { useState } from 'react';
import { post } from '../api/client';

// PUBLIC_INTERFACE
export default function CompressPdf() {
  /** Compress uploaded PDF with level selection. */
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState('medium');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('level', level);
      const r = await post('/pdf/compress', fd);
      setResult(r);
    } catch (e2) {
      setResult({ error: e2.message || 'Compression failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Compress PDF</h2>
      <form onSubmit={submit} className="form">
        <label>PDF File<input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} /></label>
        <label>Compression Level
          <select value={level} onChange={e => setLevel(e.target.value)}>
            <option value="low">Low (fastest)</option>
            <option value="medium">Medium</option>
            <option value="high">High (best)</option>
          </select>
        </label>
        <button className="btn" disabled={loading || !file}>{loading ? 'Compressing…' : 'Compress'}</button>
      </form>
      {result && !result.error && (
        <div className="card">
          {result.beforeSize && <div>Before: {Math.round(result.beforeSize/1024)} KB</div>}
          <div>After: {Math.round(result.size/1024)} KB</div>
          <a className="btn" href={result.downloadUrl}>Download</a>
        </div>
      )}
      {result && result.error && <div className="error">{result.error}</div>}
    </div>
  );
}
