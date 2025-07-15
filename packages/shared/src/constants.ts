// Shared constants for the Infinite Realty Hub platform
export const APP_CONFIG = {
  APP_NAME: 'Infinite Realty Hub',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export const COLORS = {
  primary: '#007AFF',
  secondary: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONTS = {
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 24,
  title: 28,
} as const;

export const BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
} as const;
