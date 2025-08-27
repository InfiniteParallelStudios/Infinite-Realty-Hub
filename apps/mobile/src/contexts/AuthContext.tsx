import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeSupabase, getCurrentUser, signOut as supabaseSignOut } from '../../../shared/api/supabase';
import Constants from 'expo-constants';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Supabase
    const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
    const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

    if (supabaseUrl && supabaseAnonKey) {
      initializeSupabase(supabaseUrl, supabaseAnonKey);
    } else {
      console.error('Supabase credentials not found in config');
    }

    // Check for existing session
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser();
      if (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseSignOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setUser(null);
      await AsyncStorage.removeItem('supabase-session');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}