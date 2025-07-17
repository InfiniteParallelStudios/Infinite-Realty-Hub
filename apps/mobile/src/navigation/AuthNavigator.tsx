/**
 * Auth Stack Navigator
 * 
 * Navigation stack for authentication-related screens
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
// import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
// import BiometricSetupScreen from '../screens/auth/BiometricSetupScreen';

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{
          animationEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          gestureEnabled: true,
        }}
      />
      {/* TODO: Add more auth screens */}
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
      {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} /> */}
      {/* <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} /> */}
      {/* <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
