import '@testing-library/jest-dom';

// Ensure tests use mock API by default to avoid network calls.
// CRA injects process.env at build; for tests we can set this at runtime too.
if (typeof process !== 'undefined' && process.env) {
  if (!process.env.REACT_APP_USE_MOCK) {
    process.env.REACT_APP_USE_MOCK = 'true';
  }
}
