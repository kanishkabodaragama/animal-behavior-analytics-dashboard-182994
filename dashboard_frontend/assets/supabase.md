# Supabase Integration - Frontend

This app can optionally use Supabase for authentication. When Supabase vars are not provided, the app continues to work in mock mode (no breaking changes).

## Environment Variables

Add these to `animal-behavior-analytics-dashboard-182994/dashboard_frontend/.env` (or use `.env.example` as a template):

- REACT_APP_API_BASE_URL: Base URL for your REST API (used when not in mock mode)
- REACT_APP_USE_MOCK: "true" or "false" for using mock API data
- REACT_APP_SUPABASE_URL: Your Supabase project URL (from Settings -> API)
- REACT_APP_SUPABASE_ANON_KEY: Supabase anonymous key
- REACT_APP_AUTH_PROVIDER: Either "mock" or "supabase"
  - Defaults to "mock" if omitted

Example:
```
REACT_APP_API_BASE_URL=http://localhost:4000
REACT_APP_USE_MOCK=true

# Supabase (optional)
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_AUTH_PROVIDER=supabase
```

Notes:
- Supabase is used only if both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are provided AND `REACT_APP_AUTH_PROVIDER` is set to `supabase`.
- If any of the required Supabase variables are missing, the app falls back to mock mode seamlessly.

## Code Overview

- `src/services/supabaseClient.js` initializes a client when both env vars exist. Exposes:
  - `supabase`: Supabase client or `null` if not configured
  - `isSupabaseEnabled()`: boolean helper

- `src/utils/env.js` adds helpers:
  - `getEnv(name, defaultValue)` reads an env var
  - `getAuthProvider()` returns `"supabase"` or `"mock"` (default)
  - `isSupabaseConfigured()` checks Supabase env presence

- `src/pages/auth/Login.js`:
  - If provider is `supabase` and client exists, uses `supabase.auth.signInWithPassword`
  - Otherwise uses existing mock/API login
  - On successful Supabase login, uses `loginWithSession(user, token)` from `AuthContext` to set user/token

- `src/contexts/AuthContext.js`:
  - Adds `loginWithSession(user, token)` to complete login using an external provider

## Signup Considerations

If implementing Supabase signup flows with email confirmation, make sure to set `emailRedirectTo` with your site URL, which should be provided as an environment variable (e.g., `REACT_APP_SITE_URL`). Example:
```js
await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: process.env.REACT_APP_SITE_URL }
});
```
Update this documentation if signup is added.

## Security

- Do NOT commit actual keys to source control. Use `.env` files for local development and CI/CD secrets for deployments.
- The Supabase anon key is intended for public usage but should still be managed via environment variables.
