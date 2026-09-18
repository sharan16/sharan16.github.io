import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';

// Mock window.scrollTo
window.scrollTo = jest.fn();
window.matchMedia = query => ({
  matches: query === '(prefers-reduced-motion: reduce)',
  media: query,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
});

test('renders homepage content', () => {
  render(
    <Router>
      <App />
    </Router>
  );
  
  expect(screen.getByRole('heading', { level: 1, name: /Storage systems by day/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'PRODUCTS' })).toHaveAttribute('href', '#products');
});
