// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  teamId?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'agent' | 'team_leader' | 'broker' | 'admin';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface DashboardSettings {
  layout: 'grid' | 'list';
  widgets: string[];
  pinnedApps: string[];
}

// Authentication Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

// App Store Types
export interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AppCategory;
  price: number;
  rating: number;
  downloads: number;
  screenshots: string[];
  features: string[];
  requirements: string[];
  developer: Developer;
  version: string;
  size: string;
  createdAt: string;
  updatedAt: string;
}

export type AppCategory = 
  | 'crm'
  | 'marketing'
  | 'finance'
  | 'productivity'
  | 'communication'
  | 'analytics'
  | 'utilities';

export interface Developer {
  id: string;
  name: string;
  website?: string;
  email: string;
}

export interface InstalledApp {
  appId: string;
  userId: string;
  installedAt: string;
  isActive: boolean;
  settings: Record<string, any>;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AppDetail: { appId: string };
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Marketplace: undefined;
  MyApps: undefined;
  Profile: undefined;
};

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
