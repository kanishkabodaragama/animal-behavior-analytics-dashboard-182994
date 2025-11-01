# Supabase Integration and Authentication Modes

This frontend supports two authentication modes: a built-in mock provider for local development, and Supabase for real email/password authentication. You can switch modes via environment variables without changing the code.

## Environment Variables

Add variables to `animal-behavior-analytics-dashboard-182994/dashboard_frontend/.env` (use `.env.example` if present). The following are recognized by the app:

### Required for Supabase authentication
- REACT_APP_SUPABASE_URL: Your Supabase project URL (from Settings → API)
- REACT_APP_SUPABASE_ANON_KEY: Your Supabase anonymous key
  - Alias accepted: REACT_APP_SUPABASE_KEY (useful if your environment exposes only this name)

### Optional
- REACT_APP_AUTH_PROVIDER: "supabase" or "mock". Defaults to "mock" if omitted.
- REACT_APP_SITE_URL: Public site URL used for Supabase email redirects (signup confirmation, password reset). Example: http://localhost:3000
- REACT_APP_USE_MOCK: "true" or "false" to control whether the data API (dashboard/videos/analytics) uses in-browser mock data. This is independent from the authentication provider.

### Example configurations

Mock-only (no Supabase authentication):
```
REACT_APP_USE_MOCK=true
# Optional API base if you disable mocks for data
REACT_APP_API_BASE_URL=http://localhost:4000
# Leave Supabase vars unset to disable Supabase auth
```

Supabase auth + mock data API:
```
REACT_APP_USE_MOCK=true
REACT_APP_AUTH_PROVIDER=supabase
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
# Alternatively:
# REACT_APP_SUPABASE_KEY=your-anon-key
REACT_APP_SITE_URL=http://localhost:3000
```

Supabase auth + real data API:
```
REACT_APP_USE_MOCK=false
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_AUTH_PROVIDER=supabase
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_SITE_URL=https://your-frontend.example.com
```

Notes:
- Supabase authentication is available only when both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` (or `REACT_APP_SUPABASE_KEY`) are provided.
- The app will use Supabase for signup and reset when configured. Login auto-detects Supabase.
- You can use Supabase for auth while keeping the rest of the app in mock data mode by leaving `REACT_APP_USE_MOCK=true`.

## Selecting an Authentication Mode

- Mock mode (default):
  - Omit all Supabase variables, or set `REACT_APP_AUTH_PROVIDER=mock`.
  - Login and register actions use in-browser mocks.
  - Forgot password is intentionally disabled.

- Supabase mode:
  - Provide `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` (or `REACT_APP_SUPABASE_KEY`).
  - Set `REACT_APP_AUTH_PROVIDER=supabase` for consistency (Login auto-detects).
  - Optionally set `REACT_APP_SITE_URL` for email link redirects.

## Supabase Dashboard Configuration (CORS/Redirect URLs)

In your Supabase project:
1. Go to Auth → URL Configuration
2. Site URL: set your frontend origin (e.g., http://localhost:3000 for local dev)
3. Allowed Redirect URLs: include your frontend origin(s), e.g.:
   - http://localhost:3000
   - https://your-frontend.example.com
4. Save changes

These settings are used when you pass `emailRedirectTo` (signup) or `redirectTo` (password reset). If omitted, Supabase falls back to the Site URL.

## How the Code Chooses a Provider

- `src/services/supabaseClient.js` creates a Supabase client when both env vars are provided. It accepts `REACT_APP_SUPABASE_ANON_KEY` or the alias `REACT_APP_SUPABASE_KEY`.
- `src/utils/env.js` provides:
  - `getAuthProvider()` which returns `"supabase"` or `"mock"` (default).
  - `isSupabaseConfigured()` which checks for the presence of Supabase env vars (including the alias).
- `src/pages/auth/Login.js` uses Supabase login automatically when a Supabase client exists; otherwise it falls back to the mock/API login.
- `src/contexts/AuthContext.js`:
  - `register()` and `resetPassword()` will use Supabase whenever the client is configured; otherwise they fall back to mock/API or raise an informative error.
  - Subscribes to `supabase.auth.onAuthStateChange` to persist session tokens and normalize the user object.

## Common Errors and Fixes

- "Failed to fetch" on signup or password reset:
  - Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` (or `REACT_APP_SUPABASE_KEY`) are set.
  - Set `REACT_APP_AUTH_PROVIDER=supabase` for consistency.
  - In Supabase → Auth → URL Configuration:
    - Set "Site URL" to your frontend origin (http://localhost:3000 in dev)
    - Include your frontend origin in "Allowed Redirect URLs"
  - Check browser/network:
    - Disable ad-blockers and privacy extensions for the site
    - Avoid mixed content (serve the frontend over HTTPS if applicable)

## Security

- Do not commit real keys to source control. Use `.env` for local development and CI/CD secrets for deployments.
- Supabase anon key is designed for public clients but still must be managed via environment variables and rotated if leaked.
- Tokens and user info are stored in `localStorage` for session persistence.
