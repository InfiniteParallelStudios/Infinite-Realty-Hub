/**
 * Infinite Realty Hub - Typography System
 *
 * Professional typography scales and text styles for real estate applications
 * with responsive design and accessibility compliance
 */

import { Platform } from 'react-native';

// Font families
export const fontFamilies = {
  // Primary system fonts
  primary: Platform.select({
    ios: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
    android: {
      regular: 'Roboto',
      medium: 'Roboto-Medium',
      semibold: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
    default: {
      regular: 'System',
      medium: 'System',
      semibold: 'System',
      bold: 'System',
    },
  }),

  // Monospace for code/numbers
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Font sizes - using a modular scale
export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
  '7xl': 72,
};

// Line heights
export const lineHeights = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 36,
  '3xl': 40,
  '4xl': 44,
  '5xl': 56,
  '6xl': 72,
  '7xl': 88,
};

// Font weights
export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// Letter spacing
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 1.5,
};

// Text styles for common use cases
export const textStyles = {
  // Display styles for hero sections
  displayLarge: {
    fontSize: fontSizes['7xl'],
    lineHeight: lineHeights['7xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontSize: fontSizes['6xl'],
    lineHeight: lineHeights['6xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  displaySmall: {
    fontSize: fontSizes['5xl'],
    lineHeight: lineHeights['5xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },

  // Headings
  h1: {
    fontSize: fontSizes['4xl'],
    lineHeight: lineHeights['4xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontSize: fontSizes['3xl'],
    lineHeight: lineHeights['3xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  h3: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  h4: {
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  h5: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  h6: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },

  // Body text
  bodyLarge: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodyMedium: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  bodySmall: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },

  // Labels and UI text
  labelLarge: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
  },
  labelMedium: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
  },
  labelSmall: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.wide,
  },

  // Captions and helper text
  caption: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  overline: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },

  // Real estate specific styles
  priceDisplay: {
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacing.tight,
  },
  propertyTitle: {
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    fontWeight: fontWeights.semibold,
    letterSpacing: letterSpacing.normal,
  },
  propertyDetails: {
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },
  agentName: {
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    fontWeight: fontWeights.medium,
    letterSpacing: letterSpacing.normal,
  },
  mlsNumber: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.wide,
    fontFamily: fontFamilies.mono,
  },
};

// Responsive typography utilities
export const responsiveText = {
  /**
   * Get responsive font size based on screen size
   */
  getResponsiveSize: (baseSize: number, screenWidth: number): number => {
    if (screenWidth < 375) return baseSize * 0.9; // Small phones
    if (screenWidth > 768) return baseSize * 1.1; // Tablets
    return baseSize; // Default
  },

  /**
   * Get responsive line height based on font size
   */
  getResponsiveLineHeight: (fontSize: number): number => {
    return fontSize * 1.5; // 1.5x ratio for good readability
  },
};

// Accessibility utilities
export const accessibilityText = {
  /**
   * Get minimum touch target size for interactive text
   */
  minTouchTarget: 44,

  /**
   * Check if text meets accessibility contrast requirements
   */
  isAccessible: (): boolean => {
    // Simplified check - in production, calculate actual contrast ratio
    return true; // Placeholder
  },

  /**
   * Get accessible text size for users with visual impairments
   */
  getAccessibleSize: (baseSize: number, scaleFactor: number = 1): number => {
    return baseSize * scaleFactor;
  },
};

export default {
  fontFamilies,
  fontSizes,
  lineHeights,
  fontWeights,
  letterSpacing,
  textStyles,
  responsiveText,
  accessibilityText,
};
