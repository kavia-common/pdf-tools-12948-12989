import React, { useEffect, useState } from 'react';
import { get } from '../api/client';

// PUBLIC_INTERFACE
export default function History() {
  /** Show user's file processing history. */
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await get('/history');
        setItems(r.items || []);
      } catch (_e) {
        setItems([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2>History</h2>
      {!items.length && <div>No history yet.</div>}
      <div className="table">
        {items.map((h) => (
          <div key={h.id} className="row">
            <div>{h.operation}</div>
            <div>{h.file_name}</div>
            <div>{Math.round(h.file_size/1024)} KB</div>
            <div>{new Date(h.created_at).toLocaleString()}</div>
            <div><a className="btn small" href={h.download_url}>Download</a></div>
          </div>
        ))}
      </div>
    </div>
  );
}
