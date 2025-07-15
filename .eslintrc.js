module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    'react-native/react-native': true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'prettier',
  ],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/prop-types': 'off',
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
  },
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
};
