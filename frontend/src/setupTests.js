import 'whatwg-fetch';
import '@testing-library/jest-dom';

// ✅ Mock matchMedia for MUI (keep this as before)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    media: query,
    matches: false,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
