import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization.
 * The client is created only if both REACT_APP_SUPABASE_URL and
 * REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY alias) are provided.
 * Otherwise, it remains null and the app falls back to mock/API mode as needed.
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = (process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_KEY)?.trim();

const hasConfig =
  typeof SUPABASE_URL === 'string' &&
  SUPABASE_URL.length > 0 &&
  typeof SUPABASE_ANON_KEY === 'string' &&
  SUPABASE_ANON_KEY.length > 0;

let supabase = null;

if (hasConfig) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      // We manage our own localStorage for token/user, so we can avoid session persistence here if desired.
      auth: { persistSession: false },
    });
    // Provide a helpful notice if the alias env var is being used.
    if (process.env.REACT_APP_SUPABASE_KEY && !process.env.REACT_APP_SUPABASE_ANON_KEY) {
      // eslint-disable-next-line no-console
      console.warn('[supabase] Using REACT_APP_SUPABASE_KEY as alias for REACT_APP_SUPABASE_ANON_KEY.');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[supabase] Failed to initialize client:', e);
    supabase = null;
  }
} else {
  // eslint-disable-next-line no-console
  console.info('[supabase] Not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or REACT_APP_SUPABASE_KEY).');
}

export { supabase };

// PUBLIC_INTERFACE
export function isSupabaseEnabled() {
  /** Returns true when both Supabase env vars are present and a client is available. */
  return !!supabase;
}
