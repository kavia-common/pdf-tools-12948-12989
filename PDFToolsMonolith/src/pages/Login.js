import React, { useState } from 'react';
import { post } from '../api/client';
import { useNavigate } from '../router/Router';

// PUBLIC_INTERFACE
export default function Login({ onAuth }) {
  /** Login page with email/password. */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const r = await post('/auth/login', { email, password });
      onAuth(r.user);
      navigate('/');
    } catch (e2) {
      setErr(e2?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="card">
      <h2>Login</h2>
      <form onSubmit={submit} className="form">
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} required type="email" /></label>
        <label>Password<input value={password} onChange={e => setPassword(e.target.value)} required type="password" /></label>
        {err && <div className="error">{err}</div>}
        <button className="btn">Login</button>
      </form>
    </div>
  );
}
