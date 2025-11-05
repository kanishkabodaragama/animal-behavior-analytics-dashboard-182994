// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import { getAuthProvider, isSupabaseConfigured } from '../../utils/env';

// // PUBLIC_INTERFACE
// export default function Register() {
//   /** Registration page with name/email/password form. */
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: '', email: '', password: '' });
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState('');
//   const [info, setInfo] = useState('');

//   const submit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErr('');
//     setInfo('');
//     try {
//       if (form.password.length < 6) {
//         throw new Error('Password must be at least 6 characters long.');
//       }
//       const result = await register(form.name, form.email, form.password);

//       // If Supabase email confirmation is enabled, we get a signal back
//       if (result && result.needsConfirmation) {
//         setInfo('Success! Please check your email to confirm your account.');
//         // Optionally redirect to Login after a short delay
//         setTimeout(() => navigate('/login', { replace: true }), 1500);
//         return;
//       }

//       // Otherwise we are logged in (mock/API or Supabase with direct session)
//       navigate('/', { replace: true });
//     } catch (e) {
//       let message = e?.message || 'Registration failed';
//       const provider = getAuthProvider();
//       const supaConfigured = isSupabaseConfigured();

//       if (/failed to fetch/i.test(message) || /network/i.test(message)) {
//         message =
//           'We could not reach the authentication service. Please check your internet connection, disable ad-blockers for this site, and verify Supabase settings:\n' +
//           '• Environment variables REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY)\n' +
//           '• Supabase Auth → URL Configuration: set "Site URL" and include your frontend origin in "Allowed Redirect URLs".';
//       }
//       if (supaConfigured && provider !== 'supabase') {
//         message +=
//           '\nTip: Supabase appears configured. Set REACT_APP_AUTH_PROVIDER=supabase to explicitly use Supabase-based signup.';
//       }
//       setErr(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="auth-title">Create your account</div>
//       <div className="auth-subtitle">Join to start analyzing animal behaviors.</div>
//       {err && <div className="pill error" style={{ whiteSpace: 'pre-line', marginBottom: 12 }}>{err}</div>}
//       {info && <div className="pill success" style={{ marginBottom: 12 }}>{info}</div>}
//       <form onSubmit={submit}>
//         <div className="form-row">
//           <div className="col-12">
//             <label>Name</label>
//             <input className="input" type="text" required value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
//           </div>
//           <div className="col-12">
//             <label>Email</label>
//             <input className="input" type="email" required value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
//           </div>
//           <div className="col-12">
//             <label>Password</label>
//             <input className="input" type="password" required minLength={6} value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
//           </div>
//         </div>
//         <div className="form-actions" style={{ marginTop: 16 }}>
//           <button className="btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
//         </div>
//       </form>
//       <div className="separator" />
//       <div className="muted" style={{ marginBottom: 8 }}>
//         Already have an account? <Link to="/login">Sign in</Link>
//       </div>
//       <div className="muted">
//         Having trouble? See the Supabase setup guide in README and the dashboard_frontend/assets/supabase.md.
//       </div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png'; // ✅ match your login logo

export default function Register() {
  const { loginWithSession } = useAuth(); // ✅ use mock login to be consistent
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

      // ✅ Mock registration — automatically log in
      const normalizedUser = {
        id: Date.now().toString(),
        name: form.name || 'User',
        email: form.email,
      };
      const mockToken = 'mock_token_' + Math.random().toString(36).substring(2, 15);
      loginWithSession(normalizedUser, mockToken);

      setInfo('Account created successfully!');
      setTimeout(() => navigate('/', { replace: true }), 1000);
    } catch (error) {
      setErr(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#F9FAFB',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          padding: '32px 28px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          textAlign: 'center',
        }}
      >
        {/* ✅ Logo */}
        <img
          src={logo}
          alt="App Logo"
          style={{
            width: 80,
            height: 'auto',
            marginBottom: 16,
          }}
        />

        <h2 style={{ marginBottom: 6, fontSize: 20, color: '#111827' }}>Create your account</h2>
        <p style={{ marginBottom: 16, color: '#6B7280', fontSize: 14 }}>
          Join to start analyzing animal behaviors.
        </p>

        {err && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {err}
          </div>
        )}

        {info && (
          <div
            style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            {info}
          </div>
        )}

        <form onSubmit={submit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: 12 }}>
            <label>Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                marginTop: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                marginTop: '4px',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                marginTop: '4px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#008C8C',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              width: '100%',
              transition: 'background-color 0.2s ease',
            }}
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div
          style={{
            marginTop: 16,
            fontSize: 14,
            color: '#6B7280',
          }}
        >
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
