import React from 'react';
import { Link } from '../router/Router';

// PUBLIC_INTERFACE
export default function Home() {
  /** Home page with quick access to tools. */
  return (
    <div>
      <h1>PDF Tools</h1>
      <p>Quick, secure PDF operations in your browser.</p>
      <div className="grid four">
        <Link className="card link" to="/create">Create PDF</Link>
        <Link className="card link" to="/compress">Compress PDF</Link>
        <Link className="card link" to="/merge">Merge PDFs</Link>
        <Link className="card link" to="/split">Split PDF</Link>
      </div>
    </div>
  );
}
