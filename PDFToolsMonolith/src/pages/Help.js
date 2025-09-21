import React from 'react';

// PUBLIC_INTERFACE
export default function Help() {
  /** Help and resources page describing features and privacy. */
  return (
    <div className="card">
      <h2>Help & Resources</h2>
      <p>Welcome to PDF Tools. This application lets you create, compress, merge, and split PDF files securely.</p>
      <ul>
        <li>We store processed files temporarily for download. Links expire automatically.</li>
        <li>Upload size is limited (configurable). Only PDF files are processed.</li>
        <li>Login to view your history and access logs. Some features may be gated as premium.</li>
      </ul>
      <h3>Privacy</h3>
      <p>We log minimal operational events. Personal logs are only visible to you. Temporary files are cleaned up regularly.</p>
      <h3>Contact</h3>
      <p>For support, contact your administrator.</p>
    </div>
  );
}
