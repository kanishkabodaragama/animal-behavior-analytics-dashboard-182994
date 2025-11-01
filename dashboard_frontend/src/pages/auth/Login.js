import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// PUBLIC_INTERFACE
export default function Login() {
  /** Sign-in page with email/password form. */
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await login(form.email, form.password);
      navigate('/', { replace: true });
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-title">Welcome back</div>
      <div className="auth-subtitle">Sign in to access your dashboard.</div>
      {err && <div className="pill error" style={{ marginBottom: 12 }}>{err}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="col-12">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
          </div>
          <div className="col-12">
            <label>Password</label>
            <input className="input" type="password" required value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </div>
      </form>
      <div className="separator" />
      <div className="muted">No account? <Link to="/register">Create one</Link></div>
    </div>
  );
}
