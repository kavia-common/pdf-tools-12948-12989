import React, { useEffect, useState } from 'react';
import { get } from '../api/client';

// PUBLIC_INTERFACE
export default function Logs() {
  /** Show recent logs relevant to the user. */
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await get('/logs');
        setItems(r.items || []);
      } catch (_e) {
        setItems([]);
      }
    })();
  }, []);

  return (
    <div>
      <h2>Logs</h2>
      {!items.length && <div>No logs.</div>}
      <ul>
        {items.map((l) => (
          <li key={l.id}>
            <strong>[{l.level}]</strong> {l.message} <em>{new Date(l.created_at).toLocaleString()}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
