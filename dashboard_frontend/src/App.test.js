import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders login title when not authenticated', () => {
  render(
    <MemoryRouter initialEntries={['/login']}>
      <App />
    </MemoryRouter>
  );
  const title = screen.getByText(/Welcome back/i);
  expect(title).toBeInTheDocument();
});
