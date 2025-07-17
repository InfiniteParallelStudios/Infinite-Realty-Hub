/**
 * Button Component
 * 
 * A flexible, accessible button component with multiple variants,
 * sizes, and states for the Infinite Realty Hub design system
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

// Temporary theme imports until theme is properly set up
const colors = {
  primary: { 500: '#3b82f6' },
  secondary: { 100: '#f3f4f6', 200: '#e5e7eb' },
  error: { 500: '#ef4444' },
  text: { primary: '#111827', inverse: '#ffffff', disabled: '#d1d5db' },
};

const typography = {
  fontSizes: { sm: 14, base: 16, lg: 18 },
  lineHeights: { sm: 20, base: 24, lg: 28 },
  fontWeights: { medium: '500' as const },
};

const spacing = {
  borderRadius: { medium: 8 },
  semanticSpacing: {
    buttonPadding: {
      small: { horizontal: 12, vertical: 6 },
      medium: { horizontal: 16, vertical: 8 },
      large: { horizontal: 20, vertical: 12 },
    },
  },
  spacing: { 4: 4 },
  layout: { minTouchTarget: 44 },
};

const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
};

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

// Button sizes
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props interface
export interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
  accessibilityLabel?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Button component
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  testID,
  accessibilityLabel,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  // Get button styles based on variant and size
  const buttonStyles = getButtonStyles(variant, size, disabled, fullWidth);
  const textStyles = getTextStyles(variant, size, disabled);

  // Handle press event
  const handlePress = (event: GestureResponderEvent) => {
    if (!disabled && !loading && onPress) {
      onPress(event);
    }
  };

  // Render loading indicator
  const renderLoadingIndicator = () => {
    if (!loading) return null;
    
    const indicatorColor = getLoadingIndicatorColor(variant, disabled);
    return (
      <ActivityIndicator
        size="small"
        color={indicatorColor}
        style={styles.loadingIndicator}
      />
    );
  };

  // Render button content
  const renderContent = () => {
    if (loading) {
      return renderLoadingIndicator();
    }

    return (
      <>
        {leftIcon && <>{leftIcon}</>}
        <Text style={[textStyles, textStyle]} numberOfLines={1}>
          {title}
        </Text>
        {rightIcon && <>{rightIcon}</>}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[buttonStyles, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Helper function to get button styles
const getButtonStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  fullWidth: boolean
): ViewStyle => {
  const baseStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    minHeight: spacing.layout.minTouchTarget,
  };

  // Size-specific styles
  const sizeStyles = getSizeStyles(size);

  // Variant-specific styles
  const variantStyles = getVariantStyles(variant);

  return {
    ...baseStyles,
    ...sizeStyles,
    ...variantStyles,
    ...(variant !== 'ghost' && shadows.small),
  };
};

// Helper function to get size styles
const getSizeStyles = (size: ButtonSize): ViewStyle => {
  switch (size) {
    case 'small':
      return {
        paddingHorizontal: spacing.semanticSpacing.buttonPadding.small.horizontal,
        paddingVertical: spacing.semanticSpacing.buttonPadding.small.vertical,
      };
    case 'large':
      return {
        paddingHorizontal: spacing.semanticSpacing.buttonPadding.large.horizontal,
        paddingVertical: spacing.semanticSpacing.buttonPadding.large.vertical,
      };
    default: // medium
      return {
        paddingHorizontal: spacing.semanticSpacing.buttonPadding.medium.horizontal,
        paddingVertical: spacing.semanticSpacing.buttonPadding.medium.vertical,
      };
  }
};

// Helper function to get variant styles
const getVariantStyles = (variant: ButtonVariant): ViewStyle => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
      };
    case 'secondary':
      return {
        backgroundColor: colors.secondary[100],
        borderColor: colors.secondary[200],
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.primary[500],
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      };
    case 'danger':
      return {
        backgroundColor: colors.error[500],
        borderColor: colors.error[500],
      };
    default:
      return {
        backgroundColor: colors.primary[500],
        borderColor: colors.primary[500],
      };
  }
};

// Helper function to get text styles
const getTextStyles = (
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean
): TextStyle => {
  const baseStyles: TextStyle = {
    textAlign: 'center',
    fontWeight: typography.fontWeights.medium,
  };

  // Size-specific text styles
  const sizeStyles = getTextSizeStyles(size);

  // Variant-specific text styles
  const variantStyles = getTextVariantStyles(variant);

  return {
    ...baseStyles,
    ...sizeStyles,
    ...variantStyles,
    opacity: disabled ? 0.6 : 1,
  };
};

// Helper function to get text size styles
const getTextSizeStyles = (size: ButtonSize): TextStyle => {
  switch (size) {
    case 'small':
      return {
        fontSize: typography.fontSizes.sm,
        lineHeight: typography.lineHeights.sm,
      };
    case 'large':
      return {
        fontSize: typography.fontSizes.lg,
        lineHeight: typography.lineHeights.lg,
      };
    default: // medium
      return {
        fontSize: typography.fontSizes.base,
        lineHeight: typography.lineHeights.base,
      };
  }
};

// Helper function to get text variant styles
const getTextVariantStyles = (variant: ButtonVariant): TextStyle => {
  switch (variant) {
    case 'primary':
    case 'danger':
      return {
        color: colors.text.inverse,
      };
    case 'secondary':
      return {
        color: colors.text.primary,
      };
    case 'outline':
    case 'ghost':
      return {
        color: colors.primary[500],
      };
    default:
      return {
        color: colors.text.inverse,
      };
  }
};

// Helper function to get loading indicator color
const getLoadingIndicatorColor = (variant: ButtonVariant, disabled: boolean): string => {
  if (disabled) return colors.text.disabled;

  switch (variant) {
    case 'primary':
    case 'danger':
      return colors.text.inverse;
    case 'secondary':
      return colors.text.primary;
    case 'outline':
    case 'ghost':
      return colors.primary[500];
    default:
      return colors.text.inverse;
  }
};

// Styles
const styles = StyleSheet.create({
  loadingIndicator: {
    marginRight: spacing.spacing[4],
  },
});

export default Button;