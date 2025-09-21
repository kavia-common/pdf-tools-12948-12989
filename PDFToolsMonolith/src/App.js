import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import CreatePdf from './pages/CreatePdf';
import CompressPdf from './pages/CompressPdf';
import MergePdf from './pages/MergePdf';
import SplitPdf from './pages/SplitPdf';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Logs from './pages/Logs';
import Help from './pages/Help';
import { get, post } from './api/client';
import { Router, Routes, Route, Navigate } from './router/Router';

// PUBLIC_INTERFACE
function App() {
  /** Root application component with routing and theme toggle. */
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const me = await get('/auth/me');
        setUser(me);
      } catch (_e) {
        setUser(null);
      }
    })();
  }, []);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  const onAuth = (u) => setUser(u);
  async function onLogout() {
    try {
      await post('/auth/logout');
    } catch (_e) { /* ignore */ }
    setUser(null);
  }

  return (
    <Router>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <Layout user={user} onLogout={onLogout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePdf />} />
          <Route path="/compress" element={<CompressPdf />} />
          <Route path="/merge" element={<MergePdf />} />
          <Route path="/split" element={<SplitPdf />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onAuth={onAuth} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/history" element={user ? <History /> : <Navigate to="/login" />} />
          <Route path="/logs" element={user ? <Logs /> : <Navigate to="/login" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
