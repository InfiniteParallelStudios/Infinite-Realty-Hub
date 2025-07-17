/**
 * Text Component
 * 
 * A typography component that provides consistent text styling
 * based on the Infinite Realty Hub design system
 */

import React from 'react';
import { Text as RNText, TextStyle, TextProps as RNTextProps } from 'react-native';

// Temporary theme imports until theme is properly set up
const colors = {
  text: { 
    primary: '#111827', 
    secondary: '#4b5563', 
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    disabled: '#d1d5db',
  },
  error: {
    500: '#ef4444',
  },
};

const typography = {
  textStyles: {
    displayLarge: { fontSize: 72, lineHeight: 88, fontWeight: '700' as const },
    displayMedium: { fontSize: 60, lineHeight: 72, fontWeight: '700' as const },
    displaySmall: { fontSize: 48, lineHeight: 56, fontWeight: '700' as const },
    h1: { fontSize: 36, lineHeight: 44, fontWeight: '700' as const },
    h2: { fontSize: 30, lineHeight: 40, fontWeight: '700' as const },
    h3: { fontSize: 24, lineHeight: 36, fontWeight: '600' as const },
    h4: { fontSize: 20, lineHeight: 32, fontWeight: '600' as const },
    h5: { fontSize: 18, lineHeight: 28, fontWeight: '600' as const },
    h6: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: '400' as const },
    bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    labelLarge: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
    labelMedium: { fontSize: 14, lineHeight: 20, fontWeight: '500' as const },
    labelSmall: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
    caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    overline: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, textTransform: 'uppercase' as const },
    priceDisplay: { fontSize: 24, lineHeight: 36, fontWeight: '700' as const },
    propertyTitle: { fontSize: 18, lineHeight: 28, fontWeight: '600' as const },
    propertyDetails: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    agentName: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
    mlsNumber: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  },
};

// Text variant types
export type TextVariant = 
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'caption'
  | 'overline'
  | 'priceDisplay'
  | 'propertyTitle'
  | 'propertyDetails'
  | 'agentName'
  | 'mlsNumber';

// Text color types
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'disabled' | 'error';

// Text props interface
export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColor;
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
}

// Text component
const Text: React.FC<TextProps> = ({
  variant = 'bodyMedium',
  color = 'primary',
  children,
  style,
  ...props
}) => {
  // Get text styles based on variant and color
  const textStyles = getTextStyles(variant, color);

  return (
    <RNText style={[textStyles, style]} {...props}>
      {children}
    </RNText>
  );
};

// Helper function to get text styles
const getTextStyles = (variant: TextVariant, color: TextColor): TextStyle => {
  const variantStyles = typography.textStyles[variant];
  const colorStyles = getColorStyles(color);

  return {
    ...variantStyles,
    ...colorStyles,
  };
};

// Helper function to get color styles
const getColorStyles = (color: TextColor): TextStyle => {
  switch (color) {
    case 'primary':
      return { color: colors.text.primary };
    case 'secondary':
      return { color: colors.text.secondary };
    case 'tertiary':
      return { color: colors.text.tertiary };
    case 'inverse':
      return { color: colors.text.inverse };
    case 'disabled':
      return { color: colors.text.disabled };
    case 'error':
      return { color: colors.error[500] };
    default:
      return { color: colors.text.primary };
  }
};

export { Text };
export default Text;