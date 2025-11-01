import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// PUBLIC_INTERFACE
export default function Register() {
  /** Registration page with name/email/password form. */
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setInfo('');
    try {
      if (form.password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }
      const result = await register(form.name, form.email, form.password);

      // If Supabase email confirmation is enabled, we get a signal back
      if (result && result.needsConfirmation) {
        setInfo('Success! Please check your email to confirm your account.');
        // Optionally redirect to Login after a short delay
        setTimeout(() => navigate('/login', { replace: true }), 1500);
        return;
      }

      // Otherwise we are logged in (mock/API or Supabase with direct session)
      navigate('/', { replace: true });
    } catch (e) {
      const message = e?.message || 'Registration failed';
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-title">Create your account</div>
      <div className="auth-subtitle">Join to start analyzing animal behaviors.</div>
      {err && <div className="pill error" style={{ marginBottom: 12 }}>{err}</div>}
      {info && <div className="pill success" style={{ marginBottom: 12 }}>{info}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="col-12">
            <label>Name</label>
            <input className="input" type="text" required value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
          </div>
          <div className="col-12">
            <label>Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
          </div>
          <div className="col-12">
            <label>Password</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </div>
      </form>
      <div className="separator" />
      <div className="muted">Already have an account? <Link to="/login">Sign in</Link></div>
    </div>
  );
}
