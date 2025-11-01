# Supabase Integration and Authentication Modes

This frontend supports two authentication modes: a built-in mock provider for local development, and Supabase for real email/password authentication. You can switch modes via environment variables without changing the code.

## Environment Variables

Add variables to `animal-behavior-analytics-dashboard-182994/dashboard_frontend/.env` (use `.env.example` if present). The following are recognized by the app:

### Required for Supabase authentication
- REACT_APP_SUPABASE_URL: Your Supabase project URL (from Settings → API)
- REACT_APP_SUPABASE_ANON_KEY: Your Supabase anonymous key

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
- Supabase authentication is available only when both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are provided.
- Set `REACT_APP_AUTH_PROVIDER=supabase` to enable Supabase-based signup and password reset flows in the app context.
- You can use Supabase for auth while keeping the rest of the app in mock data mode by leaving `REACT_APP_USE_MOCK=true`.

## Selecting an Authentication Mode

- Mock mode (default):
  - Omit all Supabase variables, or set `REACT_APP_AUTH_PROVIDER=mock`.
  - Login and register actions use in-browser mocks.
  - Forgot password is intentionally disabled.

- Supabase mode:
  - Provide `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.
  - Set `REACT_APP_AUTH_PROVIDER=supabase`.
  - Optionally set `REACT_APP_SITE_URL` for email link redirects.
  - The Login page auto-detects the Supabase client when those env vars exist. Register and Reset flows consult `REACT_APP_AUTH_PROVIDER` and require it to be `"supabase"`.

## How the Code Chooses a Provider

- `src/services/supabaseClient.js` creates a Supabase client only when both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are present. Otherwise, the exported `supabase` is `null`.
- `src/utils/env.js` provides:
  - `getAuthProvider()` which returns `"supabase"` or `"mock"` (default).
  - `isSupabaseConfigured()` which checks for the presence of Supabase env vars.
- `src/pages/auth/Login.js` uses Supabase login automatically when a Supabase client exists; otherwise it falls back to the mock/API login.
- `src/contexts/AuthContext.js`:
  - `register()` and `resetPassword()` use Supabase only when `getAuthProvider()` returns `"supabase"` and the client is configured.
  - Subscribes to `supabase.auth.onAuthStateChange` to persist session tokens and normalize the user object.

## Signup, Login, and Password Reset Flows

### Signup
- When `REACT_APP_AUTH_PROVIDER=supabase` and Supabase is configured, the app calls:
  ```
  await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.REACT_APP_SITE_URL, // optional
      data: { name },
    }
  });
  ```
- If your Supabase project requires email confirmation (recommended), no session is returned. The app shows a friendly message asking the user to check their email, and may navigate back to the Login page.
- If email confirmation is disabled, a session is returned and the app logs the user in immediately.
- In mock mode, signup returns a demo user and logs in immediately.

### Login
- When a Supabase client is available, the Login page uses:
  ```
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  ```
  The app stores the returned access token and a normalized user object via `loginWithSession(user, token)`.
- Otherwise, it uses the mock/API login via `api.auth.login`.

### Password Reset
- When `REACT_APP_AUTH_PROVIDER=supabase`:
  ```
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.REACT_APP_SITE_URL // optional
  });
  ```
  The app shows a non-committal success message: “If an account exists for this email, a reset link has been sent.”
- In mock mode, password reset is not available by design and `resetPassword()` will raise an error instructing you to switch to Supabase.

## Testing Notes

- Unit tests default to mock data mode to avoid real network calls. See `src/setupTests.js`, which sets `REACT_APP_USE_MOCK=true` if not already set.
- The tests render `<App />` under a router and exercise mock login and protected routes. Supabase interactions are intentionally not part of unit tests.
- For manual testing of Supabase flows locally:
  1. Create a `.env` with Supabase variables as shown above.
  2. Start the app (`npm start`) and test login/register/reset using real email addresses.
  3. Configure `REACT_APP_SITE_URL` to match your local or deployed frontend origin so email links return to the app correctly.

## Security

- Do not commit real keys to source control. Use `.env` for local development and CI/CD secrets for deployments.
- Supabase anon key is designed for public clients but still must be managed via environment variables and rotated if leaked.
- Tokens and user info are stored in `localStorage` for session persistence.
