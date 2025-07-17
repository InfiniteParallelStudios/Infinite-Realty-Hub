/**
 * Main App Index
 * 
 * Export barrel for the main app structure
 */

export { AuthProvider, useAuth } from './context/AuthContext';
export { RootNavigator } from './navigation';

// Screen exports
export { default as SplashScreen } from './screens/auth/SplashScreen';
export { default as OnboardingScreen } from './screens/auth/OnboardingScreen';
export { default as LoginScreen } from './screens/auth/LoginScreen';
export { default as DashboardScreen } from './screens/main/DashboardScreen';
export { default as MarketplaceScreen } from './screens/main/MarketplaceScreen';
export { default as ProfileScreen } from './screens/main/ProfileScreen';

// Type exports
export * from './navigation/types';
