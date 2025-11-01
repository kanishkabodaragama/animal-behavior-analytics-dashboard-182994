# Animal Behavior Analytics Dashboard - Frontend

A React frontend implementing authentication, protected routes, and a classic analytics dashboard with videos and reports pages.

## Features

- Routing with protected routes (react-router-dom v6)
- Auth pages: Login, Register, Forgot Password
- Optional Supabase authentication (email/password) or mock auth for local development
- Main layout with Sidebar (left), Topbar (fixed), and Content
- Pages: Dashboard, Videos (upload/list), Analytics (reports/export)
- Global contexts: AuthContext (login/register/logout/reset), UIContext (theme + sidebar)
- API layer with mock mode toggle via environment variable
- Clean, professional "Classic" styling with custom theme

## Getting Started

1. Install dependencies
   - npm install

2. Configure env
   - Copy `.env.example` to `.env` and adjust values. Choose your auth mode:

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
   # Preferred variable name:
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
   # Alias accepted if your environment uses this name:
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
   - Supabase authentication is enabled only when both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are provided.
   - Set `REACT_APP_AUTH_PROVIDER=supabase` to enable Supabase-based signup and password reset flows.
   - You can use Supabase for auth while keeping mock data for the rest of the app (`REACT_APP_USE_MOCK=true`).

3. Run
   - npm start
   - Open http://localhost:3000

## Authentication Modes

The app supports two authentication modes:

- Mock (default)
  - No external services required.
  - Login and register return demo users.
  - Forgot password is intentionally disabled.

- Supabase
  - Provide `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`.
  - Set `REACT_APP_AUTH_PROVIDER=supabase`.
  - Optionally set `REACT_APP_SITE_URL` for email link redirects during signup confirmation and password reset.

How the app decides:
- If a Supabase client can be created from env vars, the Login page uses Supabase email/password sign-in.
- `AuthContext.register()` and `AuthContext.resetPassword()` use Supabase only when `REACT_APP_AUTH_PROVIDER=supabase` and the client is configured. Otherwise they fall back to mock (register) or are disabled (reset).

## Signup, Login, and Reset Flows

- Signup
  - Supabase: `supabase.auth.signUp` is called; if email confirmation is required, no session is returned and the app asks the user to check their email. If confirmation is disabled, a session is returned and the user is logged in automatically.
  - Mock: returns a demo user and logs in immediately.

- Login
  - Supabase: `supabase.auth.signInWithPassword` is used. The access token and a normalized user are stored via `loginWithSession(user, token)`.
  - Mock/API: handled by the API layer (`api.auth.login`).

- Password Reset
  - Supabase: `supabase.auth.resetPasswordForEmail` is called using `REACT_APP_SITE_URL` for redirects when provided. The UI shows a non-committal success message.
  - Mock: not available.

## Mock API Mode

- When `REACT_APP_USE_MOCK=true`, the app uses in-browser mock data for:
  - Auth (login/register returns a demo user)
  - Dashboard summary and activity
  - Videos list and upload (simulated)
  - Analytics reports
- Set `REACT_APP_USE_MOCK=false` to connect to a real backend at `REACT_APP_API_BASE_URL`.

## Project Structure (key parts)

- src/contexts
  - AuthContext.js: user state, login/register/logout/reset and Supabase integration
  - UIContext.js: theme + sidebar state
- src/layout
  - Sidebar.js, Topbar.js, MainLayout.js
- src/pages
  - auth/Login.js, auth/Register.js, auth/ForgotPassword.js
  - Dashboard.js, Videos.js, Analytics.js
- src/services
  - api.js: API wrapper, reads env, switches to mock
  - mock.js: mock data and responses
  - supabaseClient.js: initializes Supabase client if configured
- src/utils
  - env.js, storage.js, random.js
- src/App.js: Routes and protected route definitions
- src/App.css: Theme + layout + components

## Theming

- Toggle theme from the topbar. Theme persists across sessions.
- Colors and layout are defined in src/App.css with CSS variables.

## Testing Notes

- Unit tests run with `REACT_APP_USE_MOCK=true` by default (see `src/setupTests.js`) to avoid real network calls.
- Tests exercise protected routes and mock login flows. Supabase interactions are not part of the default unit test suite.
- For manual verification of Supabase flows, configure the Supabase env vars and test sign-up/login/reset in a running dev server.

## Troubleshooting Signup "Failed to fetch"

If you see "Failed to fetch" when registering:
- Verify environment variables:
  - REACT_APP_SUPABASE_URL
  - REACT_APP_SUPABASE_ANON_KEY (or the accepted alias REACT_APP_SUPABASE_KEY)
  - REACT_APP_AUTH_PROVIDER=supabase
  - REACT_APP_SITE_URL matches your frontend origin (e.g., http://localhost:3000)
- Supabase dashboard (Auth → URL Configuration):
  - Site URL: set to your frontend origin (http://localhost:3000 in dev)
  - Allowed Redirect URLs: include your frontend origin (http://localhost:3000) and any deployed origins
- Network/HTTPS/CSP:
  - Ensure your browser can reach https://<project-id>.supabase.co
  - Disable ad-blockers or privacy extensions for the site during testing
  - Avoid mixed content (serve the frontend over HTTPS if the Supabase project URL is HTTPS)
- Provider switching:
  - The app will use Supabase for signup/reset when the client is configured.
  - Login already auto-detects Supabase; for consistency set REACT_APP_AUTH_PROVIDER=supabase.

An .env.example is provided in this folder for reference.

## Notes

- For production builds, ensure `REACT_APP_USE_MOCK=false` and `REACT_APP_API_BASE_URL` points to your API if you are not using mocks for data.
- Authentication tokens and user info are stored in localStorage (token + user).

## Scripts

- npm start: Development server
- npm run build: Production build
- npm test: CRA test runner
