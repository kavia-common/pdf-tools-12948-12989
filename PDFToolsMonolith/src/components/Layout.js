import React from 'react';
import { Link } from '../router/Router';
import './layout.css';

// PUBLIC_INTERFACE
export default function Layout({ children, user, onLogout }) {
  /** App layout with navbar and footer. */
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand">PDF Tools</Link>
          <Link to="/create">Create</Link>
          <Link to="/compress">Compress</Link>
          <Link to="/merge">Merge</Link>
          <Link to="/split">Split</Link>
          <Link to="/help">Help</Link>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <Link to="/history">History</Link>
              <Link to="/logs">Logs</Link>
              <span className="user-pill">{user.email}{user.is_premium ? ' ⭐' : ''}</span>
              <button className="btn small" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn small">Sign up</Link>
            </>
          )}
        </div>
      </nav>
      <main className="content">{children}</main>
      <footer className="footer">© {new Date().getFullYear()} PDF Tools Monolith</footer>
    </div>
  );
}
