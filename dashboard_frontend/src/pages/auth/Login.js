// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// /* env helper not required for Supabase auto-detection */
// import { supabase } from '../../services/supabaseClient';

// // PUBLIC_INTERFACE
// export default function Login() {
//   /** Sign-in page with email/password form. */
//   const { login, loginWithSession } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState('');

//   const submit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErr('');
//     try {
//       // Determine if we should use Supabase auth (auto-detect by client presence)
//       const useSupabase = !!supabase;

//       if (useSupabase) {
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email: form.email,
//           password: form.password,
//         });

//         if (error) throw error;
//         if (!data?.session) throw new Error('Login failed: no session returned.');

//         const token = data.session.access_token;
//         const spUser = data.user;

//         // Normalize user for app usage
//         const normalizedUser = {
//           id: spUser?.id,
//           name: spUser?.user_metadata?.name || (spUser?.email ? spUser.email.split('@')[0] : 'User'),
//           email: spUser?.email || form.email,
//         };

//         // Store in context and local storage
//         loginWithSession(normalizedUser, token);
//       } else {
//         // Fallback to existing login (mock or API depending on REACT_APP_USE_MOCK)
//         await login(form.email, form.password);
//       }

//       navigate('/', { replace: true });
//     } catch (e) {
//       setErr(e.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="auth-title">Welcome back</div>
//       <div className="auth-subtitle">Sign in to access your dashboard.</div>
//       {err && <div className="pill error" style={{ marginBottom: 12 }}>{err}</div>}
//       <form onSubmit={submit}>
//         <div className="form-row">
//           <div className="col-12">
//             <label>Email</label>
//             <input className="input" type="email" required value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
//           </div>
//           <div className="col-12">
//             <label>Password</label>
//             <input className="input" type="password" required value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})}/>
//           </div>
//         </div>
//         <div className="form-actions" style={{ marginTop: 16 }}>
//           <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
//         </div>
//       </form>
//       <div className="separator" />
//       <div className="muted" style={{ marginBottom: 8 }}>
//         Forgot your password? <Link to="/forgot-password">Reset it</Link>
//       </div>
//       <div className="muted">No account? <Link to="/register">Create one</Link></div>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png'; // ✅ Import logo

export default function Login() {
  const { loginWithSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');

    try {
      const normalizedUser = {
        id: Date.now().toString(),
        name: form.email ? form.email.split('@')[0] : 'User',
        email: form.email,
      };
      const mockToken = 'mock_token_' + Math.random().toString(36).substring(2, 15);
      loginWithSession(normalizedUser, mockToken);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Mock login error:', error);
      setErr('Login failed, please try again.');
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

        {/* ✅ Login Form */}
        <form onSubmit={submit} style={{ textAlign: 'left' }}>
          {err && (
            <div
              style={{
                background: '#fee2e2',
                color: '#b91c1c',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: 14,
                marginBottom: 12,
                textAlign: 'center',
              }}
            >
              {err}
            </div>
          )}

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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: 16,
            fontSize: 14,
            color: '#6B7280',
          }}
        >
          <div style={{ marginBottom: 6 }}>
            Forgot password? <Link to="/forgot-password">Reset</Link>
          </div>
          <div>
            No account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

