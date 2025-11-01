import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
/* env helper not required for Supabase auto-detection */
import { supabase } from '../../services/supabaseClient';

// PUBLIC_INTERFACE
export default function Login() {
  /** Sign-in page with email/password form. */
  const { login, loginWithSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      // Determine if we should use Supabase auth (auto-detect by client presence)
      const useSupabase = !!supabase;

      if (useSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });

        if (error) throw error;
        if (!data?.session) throw new Error('Login failed: no session returned.');

        const token = data.session.access_token;
        const spUser = data.user;

        // Normalize user for app usage
        const normalizedUser = {
          id: spUser?.id,
          name: spUser?.user_metadata?.name || (spUser?.email ? spUser.email.split('@')[0] : 'User'),
          email: spUser?.email || form.email,
        };

        // Store in context and local storage
        loginWithSession(normalizedUser, token);
      } else {
        // Fallback to existing login (mock or API depending on REACT_APP_USE_MOCK)
        await login(form.email, form.password);
      }

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
      <div className="muted" style={{ marginBottom: 8 }}>
        Forgot your password? <Link to="/forgot-password">Reset it</Link>
      </div>
      <div className="muted">No account? <Link to="/register">Create one</Link></div>
    </div>
  );
}
