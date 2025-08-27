import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
}

const lightColors = {
  background: '#ffffff',
  surface: '#f9fafb',
  primary: '#00d4ff',
  secondary: '#3b82f6',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

const darkColors = {
  background: '#000811',
  surface: '#1f2937',
  primary: '#00d4ff',
  secondary: '#3b82f6',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: 'rgba(255, 255, 255, 0.2)',
  error: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Load saved theme on mount
  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };
    loadTheme();
  }, []);

  const colors = theme === 'light' ? lightColors : darkColors;

  const value = {
    theme,
    toggleTheme,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}