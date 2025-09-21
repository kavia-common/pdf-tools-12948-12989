import React, { useState } from 'react';
import { post } from '../api/client';

// PUBLIC_INTERFACE
export default function SplitPdf() {
  /** Split a PDF by page ranges. */
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState('1-2,3');
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file || !ranges) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('ranges', ranges);
      const r = await post('/pdf/split', fd);
      setOutputs((r.outputs) || []);
    } catch (e2) {
      setOutputs([]);
      alert(e2.message || 'Split failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Split PDF</h2>
      <form onSubmit={submit} className="form">
        <label>PDF File<input type="file" accept="application/pdf" onChange={e => setFile(e.target.files[0])} /></label>
        <label>Ranges<input value={ranges} onChange={e => setRanges(e.target.value)} placeholder="e.g. 1-3,4,5-6" /></label>
        <button className="btn" disabled={loading || !file}>{loading ? 'Splitting…' : 'Split'}</button>
      </form>
      {!!outputs.length && (
        <div className="grid two">
          {outputs.map((o, i) => (
            <div key={i} className="card">
              <div>{o.fileName}</div>
              <div>{Math.round(o.size/1024)} KB</div>
              <a className="btn" href={o.downloadUrl}>Download</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
