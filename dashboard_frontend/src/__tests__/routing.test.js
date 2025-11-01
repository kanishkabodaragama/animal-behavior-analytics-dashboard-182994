import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Helper to mock localStorage state for token/user
function setAuthStorage({ token, user }) {
  if (token) {
    localStorage.setItem('token', JSON.stringify(token));
  } else {
    localStorage.removeItem('token');
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

describe('Routing and protected routes', () => {
  afterEach(() => {
    // Clean storage between tests
    localStorage.clear();
  });

  test('unauthenticated user navigating to "/" is redirected to /login', async () => {
    // Ensure not authenticated
    setAuthStorage({ token: null, user: null });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Login page should be rendered
    const title = await screen.findByText(/Welcome back/i);
    expect(title).toBeInTheDocument();

    // Ensure dashboard content not present
    expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
  });

  test('authenticated user can access dashboard at "/"', async () => {
    // Seed storage to simulate authenticated user
    setAuthStorage({
      token: 'mock-token',
      user: { id: 'u_1', name: 'Tester', email: 't@example.com' }
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Topbar shows signed in name and dashboard heading appears
    await waitFor(() => {
      expect(screen.getByText(/Signed in as/i)).toBeInTheDocument();
    });

    // Dashboard heading present
    const heading = await screen.findByText(/^Dashboard$/i, {}, { timeout: 3000 });
    expect(heading).toBeInTheDocument();
  });
});
