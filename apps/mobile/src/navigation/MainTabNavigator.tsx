/**
 * Main Tab Navigator
 * 
 * Bottom tab navigation for the main app screens
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { MainTabParamList } from './types';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import MarketplaceScreen from '../screens/main/MarketplaceScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Placeholder screens for development
const SearchScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Search Screen</Text>
    <Text style={styles.placeholderText}>Coming Soon!</Text>
  </View>
);

const MessagesScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Messages Screen</Text>
    <Text style={styles.placeholderText}>Coming Soon!</Text>
  </View>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0D47A1',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Marketplace" 
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🏪</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default MainTabNavigator;
