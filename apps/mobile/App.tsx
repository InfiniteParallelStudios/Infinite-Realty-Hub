import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens (we'll create these next)
import DashboardScreen from './src/screens/DashboardScreen';
import PipelineScreen from './src/screens/PipelineScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import QRGeneratorScreen from './src/screens/QRGeneratorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';

// Import providers
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';

// Icons (using basic emoji for now, will use proper icons later)
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
        },
        headerStyle: {
          backgroundColor: '#1f2937',
        },
        headerTintColor: '#ffffff',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: () => '🏠'
        }}
      />
      <Tab.Screen 
        name="Pipeline" 
        component={PipelineScreen}
        options={{
          tabBarIcon: () => '📊'
        }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{
          tabBarIcon: () => '👥'
        }}
      />
      <Tab.Screen 
        name="QR Generator" 
        component={QRGeneratorScreen}
        options={{
          tabBarIcon: () => '📱'
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: () => '⚙️'
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Could add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
