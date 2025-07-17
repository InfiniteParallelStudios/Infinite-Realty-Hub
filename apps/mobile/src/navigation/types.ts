/**
 * Navigation Types
 * 
 * TypeScript type definitions for React Navigation structure
 * in the Infinite Realty Hub mobile app
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Navigation Types
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  BiometricSetup: undefined;
};

// Main Tab Navigation Types
export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Marketplace: NavigatorScreenParams<MarketplaceStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
  Search: NavigatorScreenParams<SearchStackParamList>;
  Messages: NavigatorScreenParams<MessagesStackParamList>;
};

// Dashboard Stack Navigation Types
export type DashboardStackParamList = {
  DashboardHome: undefined;
  PropertyDetails: { propertyId: string };
  ClientDetails: { clientId: string };
  TaskDetails: { taskId: string };
  Analytics: undefined;
};

// Marketplace Stack Navigation Types
export type MarketplaceStackParamList = {
  MarketplaceHome: undefined;
  PropertyListing: { propertyId: string };
  PropertySearch: { filters?: any };
  PropertyComparison: { propertyIds: string[] };
  SavedProperties: undefined;
};

// Profile Stack Navigation Types
export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Preferences: undefined;
  Security: undefined;
  Support: undefined;
  About: undefined;
};

// Search Stack Navigation Types
export type SearchStackParamList = {
  SearchHome: undefined;
  SearchResults: { query: string; filters?: any };
  MapView: { properties?: any[] };
  SavedSearches: undefined;
};

// Messages Stack Navigation Types
export type MessagesStackParamList = {
  MessagesList: undefined;
  ChatRoom: { chatId: string; recipientName: string };
  NewMessage: undefined;
};

// Modal Stack Navigation Types
export type ModalStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  PropertyImageViewer: { images: string[]; initialIndex?: number };
  DocumentViewer: { documentUrl: string; title?: string };
  CameraCapture: { onCapture: (uri: string) => void };
  LocationPicker: { onLocationSelect: (location: any) => void };
  NotificationSettings: undefined;
  LanguageSettings: undefined;
  ThemeSettings: undefined;
};

// Root Stack Navigation Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<ModalStackParamList>;
};

// Navigation Props Types
export type NavigationProps = {
  navigation: any;
  route: any;
};

// Screen Component Props
export type ScreenProps<T extends keyof any> = {
  navigation: any;
  route: {
    key: string;
    name: T;
    params?: any;
  };
};

// Auth Context Types
export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  setupBiometrics: () => Promise<void>;
};

// User Types
export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string | null;
  role: 'agent' | 'broker' | 'admin';
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
};

export type RegisterData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'agent' | 'broker';
  agencyCode?: string;
};

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    allowLocationTracking: boolean;
  };
};

// Navigation State Types
export type NavigationState = {
  currentRoute: string;
  previousRoute?: string;
  params?: any;
  timestamp: number;
};

// Deep Linking Types
export type DeepLinkConfig = {
  screens: {
    Auth: {
      screens: {
        Login: 'login';
        Register: 'register';
        ForgotPassword: 'forgot-password';
        ResetPassword: 'reset-password/:token';
      };
    };
    Main: {
      screens: {
        Dashboard: {
          screens: {
            DashboardHome: 'dashboard';
            PropertyDetails: 'property/:propertyId';
            ClientDetails: 'client/:clientId';
            TaskDetails: 'task/:taskId';
            Analytics: 'analytics';
          };
        };
        Marketplace: {
          screens: {
            MarketplaceHome: 'marketplace';
            PropertyListing: 'listing/:propertyId';
            PropertySearch: 'search';
            PropertyComparison: 'compare';
            SavedProperties: 'saved';
          };
        };
        Profile: {
          screens: {
            ProfileHome: 'profile';
            EditProfile: 'profile/edit';
            Settings: 'settings';
            Preferences: 'preferences';
            Security: 'security';
            Support: 'support';
            About: 'about';
          };
        };
        Search: {
          screens: {
            SearchHome: 'search';
            SearchResults: 'search/results';
            MapView: 'map';
            SavedSearches: 'search/saved';
          };
        };
        Messages: {
          screens: {
            MessagesList: 'messages';
            ChatRoom: 'chat/:chatId';
            NewMessage: 'messages/new';
          };
        };
      };
    };
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
