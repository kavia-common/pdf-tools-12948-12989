import React, { useState } from 'react';
import { post } from '../api/client';

// PUBLIC_INTERFACE
export default function CreatePdf() {
  /** Create PDF from text with basic live preview. */
  const [title, setTitle] = useState('My Document');
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await post('/pdf/create', { title, content: text, fontSize });
      setResult(r);
    } catch (e2) {
      setResult({ error: e2?.response?.data?.error || 'Failed to create PDF' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid two">
      <div>
        <h2>Create PDF</h2>
        <form onSubmit={submit} className="form">
          <label>Title<input value={title} onChange={e => setTitle(e.target.value)} /></label>
          <label>Font size<input type="number" min={8} max={24} value={fontSize} onChange={e => setFontSize(parseInt(e.target.value, 10))} /></label>
          <label>Content<textarea rows={12} value={text} onChange={e => setText(e.target.value)} placeholder="Type or paste text here" /></label>
          <button className="btn" disabled={loading}>{loading ? 'Creating…' : 'Create PDF'}</button>
        </form>
        {result && !result.error && (
          <div className="card">
            <div>File: {result.fileName} ({Math.round(result.size/1024)} KB)</div>
            <a className="btn" href={result.downloadUrl}>Download</a>
          </div>
        )}
        {result && result.error && <div className="error">{result.error}</div>}
      </div>
      <div>
        <h3>Live Preview</h3>
        <div className="preview">
          <div className="preview-title">{title}</div>
          <div className="preview-content" style={{ fontSize: `${fontSize}px` }}>
            {text.split('\n').map((l, i) => <p key={i}>{l}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}
