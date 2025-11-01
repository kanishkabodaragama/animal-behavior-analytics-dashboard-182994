/**
 * Boolean-ish env helper.
 */
export function isTrue(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  }
  return false;
}

// PUBLIC_INTERFACE
export function getEnv(name, defaultValue = undefined) {
  /**
   * Returns the process.env[name] string value if present and non-empty, otherwise defaultValue.
   * Note: CRA replaces process.env.* at build time.
   */
  const v = process.env?.[name];
  if (typeof v === 'string' && v.length > 0) return v;
  return defaultValue;
}

// PUBLIC_INTERFACE
export function getAuthProvider() {
  /**
   * Returns selected auth provider ("supabase" | "mock").
   * Defaults to "mock" if REACT_APP_AUTH_PROVIDER is not set or unrecognized.
   */
  const raw = getEnv('REACT_APP_AUTH_PROVIDER', 'mock');
  const normalized = String(raw || 'mock').toLowerCase();
  return normalized === 'supabase' ? 'supabase' : 'mock';
}

// PUBLIC_INTERFACE
export function isSupabaseConfigured() {
  /**
   * Returns true if both REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are provided.
   * Also accepts REACT_APP_SUPABASE_KEY as an alias for the anon key.
   */
  const url = getEnv('REACT_APP_SUPABASE_URL', '');
  const key =
    getEnv('REACT_APP_SUPABASE_ANON_KEY', '') ||
    getEnv('REACT_APP_SUPABASE_KEY', '');
  return Boolean(url && url.trim() && key && key.trim());
}
