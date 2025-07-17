/**
 * Auth Context
 * 
 * Authentication context provider for managing user authentication state
 * throughout the Infinite Realty Hub mobile app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User, RegisterData } from '../navigation/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Context Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Storage Keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '@infinite_realty_hub:auth_token',
  USER_DATA: '@infinite_realty_hub:user_data',
  BIOMETRIC_ENABLED: '@infinite_realty_hub:biometric_enabled',
} as const;

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  // Initialize authentication state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
      ]);

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Validate token with backend (in a real app)
        // await validateToken(token);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear potentially corrupted data
      await clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API call (replace with actual API call)
      const response = await simulateLogin(email, password);
      
      if (response.success) {
        const { token, user: userData } = response.data;
        
        // Store auth data
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
          AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
        ]);
        
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API call (replace with actual API call)
      const response = await simulateRegister(userData);
      
      if (response.success) {
        const { token, user: newUser } = response.data;
        
        // Store auth data
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token),
          AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser)),
        ]);
        
        setUser(newUser);
        setIsAuthenticated(true);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Clear auth data
      await clearAuthData();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API call (replace with actual API call)
      const response = await simulateForgotPassword(email);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API call (replace with actual API call)
      const response = await simulateResetPassword(token, newPassword);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setupBiometrics = async (): Promise<void> => {
    try {
      // In a real app, this would integrate with expo-local-authentication
      // For now, just mark as enabled
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
    } catch (error) {
      console.error('Biometric setup error:', error);
      throw error;
    }
  };

  const clearAuthData = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    setupBiometrics,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simulate API calls (replace with actual API calls)
const simulateLogin = async (email: string, password: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock successful login
  if (email === 'demo@example.com' && password === 'password') {
    return {
      success: true,
      data: {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'User',
          phone: '+1234567890',
          avatar: null,
          role: 'agent' as const,
          preferences: {
            theme: 'light' as const,
            language: 'en',
            notifications: {
              push: true,
              email: true,
              sms: false,
              marketing: false,
            },
            privacy: {
              showOnlineStatus: true,
              allowLocationTracking: true,
            },
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    };
  }
  
  return {
    success: false,
    message: 'Invalid email or password',
  };
};

const simulateRegister = async (userData: RegisterData): Promise<{ success: boolean; data?: any; message?: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock successful registration
  return {
    success: true,
    data: {
      token: 'mock-jwt-token',
      user: {
        id: '2',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        avatar: null,
        role: userData.role,
        preferences: {
          theme: 'light' as const,
          language: 'en',
          notifications: {
            push: true,
            email: true,
            sms: false,
            marketing: false,
          },
          privacy: {
            showOnlineStatus: true,
            allowLocationTracking: true,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
  };
};

const simulateForgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: 'Password reset email sent',
  };
};

const simulateResetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: 'Password reset successfully',
  };
};

export default AuthContext;
