import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access authentication context including user and helpers. */
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides authentication state and actions.
   * Initializes from localStorage token when available.
   */
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const token = storage.get('token');
    const userData = storage.get('user');
    if (token && userData) {
      setUser(userData);
      api.setToken(token);
    }
    setInitializing(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    storage.set('token', res.token);
    storage.set('user', res.user);
    api.setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register({ name, email, password });
    storage.set('token', res.token);
    storage.set('user', res.user);
    api.setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    storage.remove('token');
    storage.remove('user');
    api.setToken(null);
    setUser(null);
  };

  // PUBLIC_INTERFACE
  const loginWithSession = (sessionUser, token) => {
    /**
     * Completes login using externally authenticated session (e.g., Supabase).
     * Persists token + user and updates context state.
     */
    if (!sessionUser || !token) {
      throw new Error('Missing user or token for session login');
    }
    storage.set('token', token);
    storage.set('user', sessionUser);
    api.setToken(token);
    setUser(sessionUser);
    return sessionUser;
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    initializing,
    login,
    register,
    logout,
    loginWithSession,
  }), [user, initializing]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
