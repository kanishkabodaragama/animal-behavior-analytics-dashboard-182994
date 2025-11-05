import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import MainLayout from './layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Videos from './pages/Videos';
import Analytics from './pages/Analytics';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// PUBLIC_INTERFACE
function App() {
  /** Root app wiring: providers + routes (Router is provided by index.js/tests) */
  return (
    <AuthProvider>
      <UIProvider>
        <Routes>
          <Route path="/login" element={<AuthShell><Login /></AuthShell>} />
          <Route path="/register" element={<AuthShell><Register /></AuthShell>} />
          <Route path="/forgot-password" element={<AuthShell><ForgotPassword /></AuthShell>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="videos" element={<Videos />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UIProvider>
    </AuthProvider>
  );
}

// function AuthShell({ children }) {
//   // Minimal centered container for auth pages using theme variables
//   return (
//     <div className="auth-shell">
//       <div className="auth-card">
//         <div className="brand">Animal Behavior Analytics</div>
//         {children}
//       </div>
//     </div>
//   );
// }

function AuthShell({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f6fa',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          padding: '2rem',
          borderRadius: '12px',
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default App;
