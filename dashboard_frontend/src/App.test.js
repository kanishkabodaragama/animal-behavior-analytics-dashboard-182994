import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login title when not authenticated', () => {
  render(<App />);
  const title = screen.getByText(/Welcome back/i);
  expect(title).toBeInTheDocument();
});
