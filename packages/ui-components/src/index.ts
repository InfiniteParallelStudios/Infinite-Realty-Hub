/**
 * UI Components Package
 * 
 * Central export file for all UI components and theme utilities
 * for the Infinite Realty Hub design system
 */

// Theme exports
export * from './theme';

// Component exports
export * from './components/Button';
export * from './components/Text';
export * from './components/Input';

// Re-export React Native components for consistency
export {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  ImageBackground,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
