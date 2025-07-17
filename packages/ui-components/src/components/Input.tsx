/**
 * Input Component
 *
 * A flexible input component with validation, error states,
 * and consistent styling for the Infinite Realty Hub design system
 */

import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
// Import Text component directly
const TextComponent = require('./Text').Text || require('./Text').default;
const Text = TextComponent;

// Temporary theme imports until theme is properly set up
const colors = {
  primary: { 500: '#3b82f6' },
  error: { 500: '#ef4444' },
  text: { primary: '#111827', secondary: '#4b5563', disabled: '#d1d5db' },
  border: { primary: '#e5e7eb', focus: '#3b82f6', error: '#ef4444' },
  background: { primary: '#ffffff', secondary: '#f9fafb' },
};

const spacing = {
  borderRadius: { medium: 8 },
  semanticSpacing: {
    inputPadding: { horizontal: 12, vertical: 8 },
    componentMargin: { small: 4, medium: 8 },
  },
  layout: { minTouchTarget: 44 },
};

const typography = {
  fontSizes: { sm: 14, base: 16 },
  lineHeights: { sm: 20, base: 24 },
  fontWeights: { normal: '400' as const, medium: '500' as const },
};

// Input size types
export type InputSize = 'small' | 'medium' | 'large';

// Input props interface
export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: InputSize;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

// Input component
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  size = 'medium',
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handle focus events
  const handleFocus = (
    e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]
  ) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (
    e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]
  ) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  // Get input styles based on state
  const inputContainerStyles = getInputContainerStyles(
    size,
    isFocused,
    error,
    disabled
  );
  const inputTextStyles = getInputTextStyles(size, disabled);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text
          variant="labelMedium"
          color={disabled ? 'disabled' : 'primary'}
          style={labelStyle ? [styles.label, labelStyle] : styles.label}
        >
          {label}
          {required && <Text color="error"> *</Text>}
        </Text>
      )}

      {/* Input container */}
      <View style={[inputContainerStyles, styles.inputContainer]}>
        {/* Left icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text input */}
        <TextInput
          style={[inputTextStyles, inputStyle]}
          placeholderTextColor={colors.text.secondary}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {/* Error message */}
      {error && (
        <Text variant="caption" color="error" style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <Text variant="caption" color="secondary" style={styles.helperText}>
          {helperText}
        </Text>
      )}
    </View>
  );
};

// Helper function to get input container styles
const getInputContainerStyles = (
  size: InputSize,
  isFocused: boolean,
  error?: string,
  disabled?: boolean
): ViewStyle => {
  const baseStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: disabled
      ? colors.background.secondary
      : colors.background.primary,
    borderRadius: spacing.borderRadius.medium,
    borderWidth: 1,
    minHeight: getInputHeight(size),
  };

  // Border color based on state
  let borderColor = colors.border.primary;
  if (error) {
    borderColor = colors.border.error;
  } else if (isFocused) {
    borderColor = colors.border.focus;
  }

  return {
    ...baseStyles,
    borderColor,
    opacity: disabled ? 0.6 : 1,
  };
};

// Helper function to get input text styles
const getInputTextStyles = (size: InputSize, disabled?: boolean): TextStyle => {
  const baseStyles: TextStyle = {
    flex: 1,
    paddingHorizontal: spacing.semanticSpacing.inputPadding.horizontal,
    paddingVertical: spacing.semanticSpacing.inputPadding.vertical,
    color: disabled ? colors.text.disabled : colors.text.primary,
    fontWeight: typography.fontWeights.normal,
  };

  // Size-specific styles
  const sizeStyles = getInputSizeStyles(size);

  return {
    ...baseStyles,
    ...sizeStyles,
  };
};

// Helper function to get input size styles
const getInputSizeStyles = (size: InputSize): TextStyle => {
  switch (size) {
    case 'small':
      return {
        fontSize: typography.fontSizes.sm,
        lineHeight: typography.lineHeights.sm,
      };
    case 'large':
      return {
        fontSize: typography.fontSizes.base,
        lineHeight: typography.lineHeights.base,
        paddingVertical: spacing.semanticSpacing.inputPadding.vertical + 4,
      };
    default: // medium
      return {
        fontSize: typography.fontSizes.base,
        lineHeight: typography.lineHeights.base,
      };
  }
};

// Helper function to get input height
const getInputHeight = (size: InputSize): number => {
  switch (size) {
    case 'small':
      return 36;
    case 'large':
      return 52;
    default: // medium
      return spacing.layout.minTouchTarget;
  }
};

// Styles
const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.semanticSpacing.componentMargin.medium,
  },
  label: {
    marginBottom: spacing.semanticSpacing.componentMargin.small,
  },
  inputContainer: {
    // Base styles applied via helper function
  },
  leftIcon: {
    marginLeft: spacing.semanticSpacing.inputPadding.horizontal,
    marginRight: spacing.semanticSpacing.componentMargin.small,
  },
  rightIcon: {
    marginLeft: spacing.semanticSpacing.componentMargin.small,
    marginRight: spacing.semanticSpacing.inputPadding.horizontal,
  },
  errorText: {
    marginTop: spacing.semanticSpacing.componentMargin.small,
  },
  helperText: {
    marginTop: spacing.semanticSpacing.componentMargin.small,
  },
});

export default Input;
