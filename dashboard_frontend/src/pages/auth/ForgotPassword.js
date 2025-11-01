import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// PUBLIC_INTERFACE
export default function ForgotPassword() {
  /** Password reset page; uses Supabase when selected as provider. */
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setInfo('');
    try {
      await resetPassword(email);
      setInfo('If an account exists for this email, a reset link has been sent.');
    } catch (e) {
      setErr(e.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-title">Reset your password</div>
      <div className="auth-subtitle">Enter your email to receive a reset link.</div>
      {err && <div className="pill error" style={{ marginBottom: 12 }}>{err}</div>}
      {info && <div className="pill success" style={{ marginBottom: 12 }}>{info}</div>}
      <form onSubmit={submit}>
        <div className="form-row">
          <div className="col-12">
            <label>Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>
      </form>
      <div className="separator" />
      <div className="muted">Remembered your password? <Link to="/login">Back to Sign in</Link></div>
    </div>
  );
}
