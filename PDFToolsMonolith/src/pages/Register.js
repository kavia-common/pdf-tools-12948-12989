import React, { useState } from 'react';
import { post } from '../api/client';
import { useNavigate } from '../router/Router';

// PUBLIC_INTERFACE
export default function Register() {
  /** Register new user page. */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await post('/auth/register', { email, password });
      setOk(true);
      setTimeout(() => navigate('/login'), 1000);
    } catch (e2) {
      setErr(e2?.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <div className="card">
      <h2>Sign up</h2>
      <form onSubmit={submit} className="form">
        <label>Email<input value={email} onChange={e => setEmail(e.target.value)} required type="email" /></label>
        <label>Password<input value={password} onChange={e => setPassword(e.target.value)} required type="password" minLength={6} /></label>
        {err && <div className="error">{err}</div>}
        {ok && <div className="success">Account created. Redirecting…</div>}
        <button className="btn">Create account</button>
      </form>
    </div>
  );
}
