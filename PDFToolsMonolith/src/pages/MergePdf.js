import React, { useState } from 'react';
import { post } from '../api/client';

// PUBLIC_INTERFACE
export default function MergePdf() {
  /** Merge multiple PDFs with simple order controls. */
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFiles(e) {
    const list = Array.from(e.target.files || []);
    setFiles(list);
  }

  function move(idx, dir) {
    const arr = [...files];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    const tmp = arr[idx];
    arr[idx] = arr[j];
    arr[j] = tmp;
    setFiles(arr);
  }

  async function submit(e) {
    e.preventDefault();
    if (!files.length) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      fd.append('order', files.map((_, i) => i).join(','));
      const r = await post('/pdf/merge', fd);
      setResult(r);
    } catch (e2) {
      setResult({ error: e2.message || 'Merge failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid two">
      <div>
        <h2>Merge PDFs</h2>
        <form onSubmit={submit} className="form">
          <label>PDF Files<input type="file" accept="application/pdf" multiple onChange={handleFiles} /></label>
          <button className="btn" disabled={loading || !files.length}>{loading ? 'Merging…' : 'Merge'}</button>
        </form>
        {result && !result.error && (
          <div className="card">
            <div>Output size: {Math.round(result.size/1024)} KB</div>
            <a className="btn" href={result.downloadUrl}>Download</a>
          </div>
        )}
        {result && result.error && <div className="error">{result.error}</div>}
      </div>
      <div>
        <h3>Order</h3>
        <ol>
          {files.map((f, i) => (
            <li key={i}>
              {f.name}
              <div style={{ display: 'inline-flex', gap: 8, marginLeft: 12 }}>
                <button className="btn small" type="button" onClick={() => move(i, -1)}>↑</button>
                <button className="btn small" type="button" onClick={() => move(i, 1)}>↓</button>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
