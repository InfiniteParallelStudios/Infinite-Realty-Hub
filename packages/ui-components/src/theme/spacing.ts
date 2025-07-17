/**
 * Infinite Realty Hub - Spacing System
 *
 * Consistent spacing scale for margins, padding, and layout
 * following 8px grid system for visual harmony
 */

// Base spacing unit (8px)
const BASE_UNIT = 8;

// Spacing scale based on 8px grid
export const spacing = {
  0: 0,
  1: BASE_UNIT * 0.25, // 2px
  2: BASE_UNIT * 0.5, // 4px
  3: BASE_UNIT * 0.75, // 6px
  4: BASE_UNIT * 1, // 8px
  5: BASE_UNIT * 1.25, // 10px
  6: BASE_UNIT * 1.5, // 12px
  8: BASE_UNIT * 2, // 16px
  10: BASE_UNIT * 2.5, // 20px
  12: BASE_UNIT * 3, // 24px
  16: BASE_UNIT * 4, // 32px
  20: BASE_UNIT * 5, // 40px
  24: BASE_UNIT * 6, // 48px
  32: BASE_UNIT * 8, // 64px
  40: BASE_UNIT * 10, // 80px
  48: BASE_UNIT * 12, // 96px
  56: BASE_UNIT * 14, // 112px
  64: BASE_UNIT * 16, // 128px
  80: BASE_UNIT * 20, // 160px
  96: BASE_UNIT * 24, // 192px
  112: BASE_UNIT * 28, // 224px
  128: BASE_UNIT * 32, // 256px
};

// Semantic spacing for common UI patterns
export const semanticSpacing = {
  // Component internal spacing
  componentPadding: {
    small: spacing[8], // 16px
    medium: spacing[12], // 24px
    large: spacing[16], // 32px
  },

  // Margins between components
  componentMargin: {
    small: spacing[4], // 8px
    medium: spacing[8], // 16px
    large: spacing[12], // 24px
    extraLarge: spacing[16], // 32px
  },

  // Screen-level padding
  screenPadding: {
    horizontal: spacing[16], // 32px
    vertical: spacing[20], // 40px
  },

  // Card and container spacing
  cardPadding: {
    small: spacing[12], // 24px
    medium: spacing[16], // 32px
    large: spacing[20], // 40px
  },

  // List item spacing
  listItemPadding: {
    vertical: spacing[12], // 24px
    horizontal: spacing[16], // 32px
  },

  // Button spacing
  buttonPadding: {
    small: {
      horizontal: spacing[12], // 24px
      vertical: spacing[6], // 12px
    },
    medium: {
      horizontal: spacing[16], // 32px
      vertical: spacing[8], // 16px
    },
    large: {
      horizontal: spacing[20], // 40px
      vertical: spacing[12], // 24px
    },
  },

  // Input field spacing
  inputPadding: {
    horizontal: spacing[12], // 24px
    vertical: spacing[8], // 16px
  },

  // Modal and sheet spacing
  modalPadding: {
    horizontal: spacing[20], // 40px
    vertical: spacing[24], // 48px
  },

  // Section spacing
  sectionSpacing: {
    small: spacing[16], // 32px
    medium: spacing[24], // 48px
    large: spacing[32], // 64px
    extraLarge: spacing[48], // 96px
  },
};

// Layout utilities
export const layout = {
  // Container max widths
  maxWidths: {
    small: 320,
    medium: 768,
    large: 1024,
    extraLarge: 1280,
  },

  // Breakpoints
  breakpoints: {
    small: 375,
    medium: 768,
    large: 1024,
    extraLarge: 1280,
  },

  // Safe area insets (will be replaced with actual values at runtime)
  safeArea: {
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  },

  // Minimum touch target size for accessibility
  minTouchTarget: 44,

  // Header heights
  headerHeight: {
    small: 56,
    medium: 64,
    large: 72,
  },

  // Tab bar height
  tabBarHeight: 60,

  // Bottom sheet heights
  bottomSheetHeight: {
    small: 200,
    medium: 400,
    large: 600,
  },
};

// Border radius scale
export const borderRadius = {
  none: 0,
  small: 4,
  medium: 8,
  large: 12,
  extraLarge: 16,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// Shadow/elevation system
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.0,
    elevation: 5,
  },
  extraLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 8.0,
    elevation: 10,
  },
};

// Spacing utilities
export const spacingUtils = {
  /**
   * Get responsive spacing based on screen size
   */
  getResponsiveSpacing: (baseSpacing: number, screenWidth: number): number => {
    if (screenWidth < layout.breakpoints.small) return baseSpacing * 0.8;
    if (screenWidth > layout.breakpoints.large) return baseSpacing * 1.2;
    return baseSpacing;
  },

  /**
   * Get safe area spacing
   */
  getSafeAreaSpacing: (basePadding: number, safeAreaInset: number): number => {
    return basePadding + safeAreaInset;
  },

  /**
   * Calculate component spacing based on hierarchy
   */
  getHierarchicalSpacing: (level: number): number => {
    return spacing[4] * (level + 1);
  },
};

export default {
  spacing,
  semanticSpacing,
  layout,
  borderRadius,
  shadows,
  spacingUtils,
};
