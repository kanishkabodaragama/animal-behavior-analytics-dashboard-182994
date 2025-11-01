import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import { supabase } from '../services/supabaseClient';
import { getAuthProvider, isSupabaseConfigured, getEnv } from '../utils/env';

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
   * Handles Supabase session changes when client is configured.
   */
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Rehydrate from local storage on boot
    const token = storage.get('token');
    const userData = storage.get('user');
    if (token && userData) {
      setUser(userData);
      api.setToken(token);
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    // Listen to Supabase auth state changes when client is configured
    const provider = getAuthProvider(); // still available for diagnostics
    const isReady = !!supabase && isSupabaseConfigured();
    if (!isReady) return;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const token = session?.access_token;
          const spUser = session?.user;
          if (token && spUser) {
            const normalizedUser = {
              id: spUser.id,
              name:
                spUser.user_metadata?.name ||
                (spUser.email ? spUser.email.split('@')[0] : 'User'),
              email: spUser.email || storage.get('user')?.email || undefined,
            };
            storage.set('token', token);
            storage.set('user', normalizedUser);
            api.setToken(token);
            setUser(normalizedUser);
          }
        } else if (event === 'SIGNED_OUT') {
          storage.remove('token');
          storage.remove('user');
          api.setToken(null);
          setUser(null);
        }
      } catch (err) {
        try { console.error('[auth] Error handling Supabase auth state change:', err); } catch {}
      }
    });

    return () => {
      try {
        data?.subscription?.unsubscribe?.();
      } catch {
        // ignore
      }
    };
  }, []);

  // PUBLIC_INTERFACE
  const login = async (email, password) => {
    /**
     * Logs user in using configured API (mock/real).
     * Note: Supabase sign-in is handled in Login page to normalize session.
     */
    const res = await api.auth.login({ email, password });
    storage.set('token', res.token);
    storage.set('user', res.user);
    api.setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  // PUBLIC_INTERFACE
  const register = async (name, email, password) => {
    /**
     * Registers a new user:
     * - When a Supabase client is configured, uses Supabase signUp with optional emailRedirectTo.
     *   If a session is returned (email confirmation disabled), completes login.
     *   Otherwise returns an indicator that email confirmation is required.
     * - Otherwise falls back to mock/API registration and logs user in.
     *
     * Returns:
     *   - user (if logged in immediately), or
     *   - { needsConfirmation: true } if email confirmation is required (Supabase)
     */
    const provider = getAuthProvider();
    const useSupabase = !!supabase && isSupabaseConfigured();

    if (useSupabase && provider !== 'supabase') {
      try { console.warn('[auth] Supabase client detected; using it for register flow even though REACT_APP_AUTH_PROVIDER is not "supabase".'); } catch {}
    }

    if (useSupabase) {
      const siteUrl = getEnv('REACT_APP_SITE_URL', '');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: siteUrl || undefined,
          data: { name },
        },
      });

      if (error) {
        const msg = String(error.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('registered') || msg.includes('duplicate')) {
          throw new Error(
            'An account with this email already exists. Try signing in or resetting your password.'
          );
        }
        throw new Error(error.message || 'Registration failed.');
      }

      if (data?.session?.access_token) {
        // Email confirmation disabled - complete login
        const token = data.session.access_token;
        const spUser = data.user;
        const normalizedUser = {
          id: spUser?.id,
          name:
            spUser?.user_metadata?.name ||
            (spUser?.email ? spUser.email.split('@')[0] : 'User'),
          email: spUser?.email || email,
        };
        loginWithSession(normalizedUser, token);
        return normalizedUser;
      }
      // Email confirmation enabled — no session returned
      return { needsConfirmation: true };
    }

    // Fallback to existing login (mock or real API)
    try {
      const res = await api.auth.register({ name, email, password });
      storage.set('token', res.token);
      storage.set('user', res.user);
      api.setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (e) {
      const raw = String(e?.message || '');
      if (/failed to fetch/i.test(raw) || /network/i.test(raw)) {
        try { console.error('[auth] Network error during register (fallback path):', e); } catch {}
        throw new Error(
          'Network error while reaching the API. If you intend to use Supabase for auth, ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY) are set, set REACT_APP_AUTH_PROVIDER=supabase, and verify Supabase Auth "Site URL" and "Allowed Redirect URLs" include your frontend origin.'
        );
      }
      throw e;
    }
  };

  // PUBLIC_INTERFACE
  const resetPassword = async (email) => {
    /**
     * Requests a password reset email when a Supabase client is configured.
     * Throws when provider is not Supabase (mock mode).
     */
    const provider = getAuthProvider();
    const useSupabase = !!supabase && isSupabaseConfigured();
    if (!useSupabase) {
      throw new Error(
        'Password reset is not available in mock mode. Please switch to Supabase provider.'
      );
    }
    if (useSupabase && provider !== 'supabase') {
      try { console.warn('[auth] Supabase client detected; processing password reset even though REACT_APP_AUTH_PROVIDER is not "supabase".'); } catch {}
    }

    const siteUrl = getEnv('REACT_APP_SITE_URL', '');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: siteUrl || undefined,
    });
    if (error) throw new Error(error.message || 'Password reset failed.');
    return true;
  };

  const logout = () => {
    storage.remove('token');
    storage.remove('user');
    api.setToken(null);
    setUser(null);
    // Also sign out of Supabase if selected provider is supabase
    const provider = getAuthProvider();
    if (provider === 'supabase' && supabase) {
      supabase.auth.signOut().catch(() => {});
    }
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

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      initializing,
      login,
      register,
      resetPassword,
      logout,
      loginWithSession,
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
