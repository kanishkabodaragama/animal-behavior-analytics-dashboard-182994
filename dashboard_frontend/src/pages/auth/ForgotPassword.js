import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAuthProvider, isSupabaseConfigured } from '../../utils/env';

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
      let message = e.message || 'Password reset failed.';
      const provider = getAuthProvider();
      const supaConfigured = isSupabaseConfigured();
      if (/failed to fetch/i.test(message) || /network/i.test(message)) {
        message =
          'We could not reach the authentication service. Please verify your Supabase configuration and network:\n' +
          '• Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY) are set\n' +
          '• Supabase Auth → URL Configuration: "Site URL" and "Allowed Redirect URLs" include your frontend origin';
      }
      if (supaConfigured && provider !== 'supabase') {
        message += '\nTip: Set REACT_APP_AUTH_PROVIDER=supabase to enable Supabase-based reset.';
      }
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="auth-title">Reset your password</div>
      <div className="auth-subtitle">Enter your email to receive a reset link.</div>
      {err && <div className="pill error" style={{ whiteSpace: 'pre-line', marginBottom: 12 }}>{err}</div>}
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
