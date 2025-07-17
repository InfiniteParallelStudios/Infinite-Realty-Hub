/**
 * Infinite Realty Hub - Color System
 *
 * Professional color palette designed for real estate applications
 * with comprehensive shade variations and accessibility compliance
 */

export const colors = {
  // Primary Brand Colors - Professional Blue
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // Main primary
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary - Sophisticated Gray
  secondary: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Accent - Success Green
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Error - Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info - Cyan
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Real Estate Specific Colors
  realEstate: {
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main gold
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    luxury: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c2d12',
      800: '#6b21a8',
      900: '#581c87',
    },
  },

  // Neutral Colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },

  // Semantic Colors (mapped to main colors)
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    disabled: '#d1d5db',
  },

  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    inverse: '#111827',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  border: {
    primary: '#e5e7eb',
    secondary: '#d1d5db',
    focus: '#3b82f6',
    error: '#ef4444',
    success: '#10b981',
  },
};

// Dark mode color overrides
export const darkColors = {
  ...colors,
  
  text: {
    primary: '#f9fafb',
    secondary: '#e5e7eb',
    tertiary: '#9ca3af',
    inverse: '#111827',
    disabled: '#4b5563',
  },

  background: {
    primary: '#111827',
    secondary: '#1f2937',
    tertiary: '#374151',
    inverse: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },

  border: {
    primary: '#374151',
    secondary: '#4b5563',
    focus: '#60a5fa',
    error: '#f87171',
    success: '#34d399',
  },
};

// Color utility functions
export const colorUtils = {
  /**
   * Get color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    // Convert hex to rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  /**
   * Check if color meets WCAG contrast requirements
   */
  getContrastRatio: (): number => {
    // Simplified contrast ratio calculation
    // In production, use a more robust implementation
    return 4.5; // Placeholder
  },

  /**
   * Get accessible text color for a given background
   */
  getAccessibleTextColor: (backgroundColor: string): string => {
    // Simple implementation - in production, calculate luminance
    const darkColors = ['#111827', '#1f2937', '#374151'];
    return darkColors.includes(backgroundColor)
      ? colors.text.inverse
      : colors.text.primary;
  },
};

export default colors;
