/**
 * DuDucks Theme Configuration
 * Centralized theme system for the entire application
 */

export const theme = {
  colors: {
    primary: '#edd9c6',
    background: '#edd9c6',
    surface: '#e8d0b8', // Slightly darker surface for contrast
    accent: '#ec9137', // Orange accent (Zero Knowledge, buttons)
    text: {
      primary: '#000000', // Black content on light background
      secondary: '#ec9137', // Accent-colored text
      muted: '#404040', // Muted text
    },
    border: '#444444',
    success: '#4ade80',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Fira Code', monospace",
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  transitions: {
    fast: '150ms',
    base: '250ms',
    slow: '350ms',
  },
}

export type Theme = typeof theme
