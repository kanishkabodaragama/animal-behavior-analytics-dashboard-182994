# Animal Behavior Analytics Dashboard - Frontend

A React frontend implementing authentication, protected routes, and a classic analytics dashboard with videos and reports pages.

## Features

- Routing with protected routes (react-router-dom v6)
- Auth pages: Login and Register
- Main layout with Sidebar (left), Topbar (fixed), and Content
- Pages: Dashboard, Videos (upload/list), Analytics (reports/export)
- Global contexts: AuthContext (login/register/logout), UIContext (theme + sidebar)
- API layer with mock mode toggle via environment variable
- Clean, professional "Classic" styling with custom theme

## Getting Started

1. Install dependencies
   - npm install

2. Configure env
   - Copy .env.example to .env and adjust values:
     - REACT_APP_API_BASE_URL (backend base URL)
     - REACT_APP_USE_MOCK (true/false)

3. Run
   - npm start
   - Open http://localhost:3000

## Mock API Mode

- When REACT_APP_USE_MOCK=true, the app uses in-browser mock data for:
  - Auth (login/register returns a demo user)
  - Dashboard summary and activity
  - Videos list and upload (simulated)
  - Analytics reports
- Set REACT_APP_USE_MOCK=false to connect to a real backend at REACT_APP_API_BASE_URL.

## Project Structure (key parts)

- src/contexts
  - AuthContext.js: user state, login/register/logout
  - UIContext.js: theme + sidebar state
- src/layout
  - Sidebar.js, Topbar.js, MainLayout.js
- src/pages
  - auth/Login.js, auth/Register.js
  - Dashboard.js, Videos.js, Analytics.js
- src/services
  - api.js: API wrapper, reads env, switches to mock
  - mock.js: mock data and responses
- src/utils
  - env.js, storage.js, random.js
- src/App.js: Router and route definitions
- src/App.css: Theme + layout + components

## Theming

- Toggle theme from the topbar. Theme persists across sessions.
- Colors and layout are defined in src/App.css with CSS variables.

## Notes

- For production builds, ensure REACT_APP_USE_MOCK=false and REACT_APP_API_BASE_URL points to your API.
- Authentication tokens are stored in localStorage (token + user).

## Scripts

- npm start: Development server
- npm run build: Production build
- npm test: CRA test runner
