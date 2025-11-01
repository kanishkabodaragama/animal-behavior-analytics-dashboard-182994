import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Utility to control environment for mock API
const ORIGINAL_ENV = process.env;

beforeAll(() => {
  // Force mock API usage to avoid real network calls
  process.env = { ...ORIGINAL_ENV, REACT_APP_USE_MOCK: 'true' };
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

afterEach(() => {
  localStorage.clear();
});

describe('Auth - Login flow', () => {
  test('login form requires email and password (HTML5 validation)', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    // Form elements
    const email = screen.getByLabelText(/email/i);
    const password = screen.getByLabelText(/password/i);
    const submit = screen.getByRole('button', { name: /sign in/i });

    // Attempt submit with empty fields should not navigate away and keep required validity
    await userEvent.click(submit);

    // Since CRA/JSDOM doesn't show browser validation UI, we can assert still on page title
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();

    // Fill only email -> still should not navigate
    await userEvent.type(email, 'user@example.com');
    await userEvent.click(submit);
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();

    // Fill password as well -> ready for submission
    await userEvent.type(password, 'password123');
    await userEvent.click(submit);

    // On successful login, should navigate to dashboard and show Signed in as
    await waitFor(() => expect(screen.getByText(/Signed in as/i)).toBeInTheDocument(), { timeout: 4000 });
    expect(screen.getByText(/^Dashboard$/i)).toBeInTheDocument();
  });

  test('successful login stores token/user and redirects to "/"', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'demo@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for redirect and dashboard render
    await waitFor(() => {
      expect(screen.getByText(/Signed in as/i)).toBeInTheDocument();
      expect(screen.getByText(/^Dashboard$/i)).toBeInTheDocument();
    }, { timeout: 4000 });

    // Token and user persisted
    const token = JSON.parse(localStorage.getItem('token'));
    const user = JSON.parse(localStorage.getItem('user'));
    expect(token).toBeTruthy();
    expect(user).toBeTruthy();
    expect(user.email).toBeDefined();
  });
});
