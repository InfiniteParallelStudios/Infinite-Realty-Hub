/**
 * Infinite Realty Hub - Main Theme
 *
 * Central theme configuration combining colors, typography, spacing,
 * and other design tokens for consistent styling across the app
 */

import { colors, darkColors } from './colors';
import typography from './typography';
import spacing from './spacing';

// Animation/timing configuration
const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Theme interface for type safety
interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  animations: typeof animations;
  mode: 'light' | 'dark';
}

// Light theme
export const lightTheme: Theme = {
  colors,
  typography,
  spacing,
  animations,
  mode: 'light',
};

// Dark theme
export const darkTheme: Theme = {
  colors: darkColors,
  typography,
  spacing,
  animations,
  mode: 'dark',
};

// Default theme
export const defaultTheme = lightTheme;

// Theme utilities
export const themeUtils = {
  /**
   * Get theme value with fallback
   */
  getThemeValue: <T>(theme: Theme, path: string, fallback: T): T => {
    const keys = path.split('.');
    let value: unknown = theme;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return fallback;
      }
    }
    
    return value as T;
  },

  /**
   * Create responsive styles based on theme
   */
  createResponsiveStyles: (theme: Theme, styles: Record<string, unknown>) => {
    // Implementation for responsive styles
    return styles;
  },

  /**
   * Get accessible color pair
   */
  getAccessibleColors: (theme: Theme, backgroundColor: string) => {
    const isDark = theme.mode === 'dark';
    return {
      background: backgroundColor,
      text: isDark ? theme.colors.text.primary : theme.colors.text.primary,
      border: isDark
        ? theme.colors.border.primary
        : theme.colors.border.primary,
    };
  },
};

// Export individual theme tokens for direct use
export { colors, darkColors, typography, spacing };
export { animations };

// Export theme types
export type { Theme };

// Export default theme
export default defaultTheme;
