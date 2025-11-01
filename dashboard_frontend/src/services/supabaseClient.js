import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 * The client is created only if both REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
 * are provided via environment variables. Otherwise, it remains null and the app falls back to mock mode.
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

const hasConfig =
  typeof SUPABASE_URL === 'string' &&
  SUPABASE_URL.trim().length > 0 &&
  typeof SUPABASE_ANON_KEY === 'string' &&
  SUPABASE_ANON_KEY.trim().length > 0;

export const supabase = hasConfig
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      // We manage our own localStorage for token/user, so we can avoid session persistence here if desired.
      auth: { persistSession: false },
    })
  : null;

// PUBLIC_INTERFACE
export function isSupabaseEnabled() {
  /** Returns true when both Supabase env vars are present and a client is available. */
  return !!supabase;
}
