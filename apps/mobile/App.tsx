import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, RootNavigator } from './src';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
