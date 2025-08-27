import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
  });

  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: theme === 'dark',
    autoSync: true,
    offlineMode: false,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'darkMode') {
      toggleTheme();
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your contacts, leads, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'All data has been reset');
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile',
          subtitle: user?.email,
          icon: '👤',
          type: 'navigation' as const,
          onPress: () => setShowProfileModal(true),
        },
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive notifications for new leads',
          icon: '🔔',
          type: 'toggle' as const,
          value: settings.notifications,
          onPress: () => updateSetting('notifications', !settings.notifications),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'darkMode',
          title: 'Dark Mode',
          subtitle: 'Use dark theme throughout the app',
          icon: '🌙',
          type: 'toggle' as const,
          value: settings.darkMode,
          onPress: () => updateSetting('darkMode', !settings.darkMode),
        },
      ],
    },
    {
      title: 'Data & Sync',
      items: [
        {
          id: 'autoSync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data when connected',
          icon: '🔄',
          type: 'toggle' as const,
          value: settings.autoSync,
          onPress: () => updateSetting('autoSync', !settings.autoSync),
        },
        {
          id: 'offlineMode',
          title: 'Offline Mode',
          subtitle: 'Work without internet connection',
          icon: '📱',
          type: 'toggle' as const,
          value: settings.offlineMode,
          onPress: () => updateSetting('offlineMode', !settings.offlineMode),
        },
        {
          id: 'backup',
          title: 'Backup Data',
          subtitle: 'Export your data for safekeeping',
          icon: '💾',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Backup', 'Data backup feature coming soon'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          icon: '❓',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Support', 'Visit our help center at help.infiniterealtyhub.com'),
        },
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Help us improve the app',
          icon: '💬',
          type: 'navigation' as const,
          onPress: () => Alert.alert('Feedback', 'Thank you for your feedback!'),
        },
        {
          id: 'about',
          title: 'About',
          subtitle: 'Version 1.0.0 • Privacy Policy • Terms',
          icon: 'ℹ️',
          type: 'navigation' as const,
          onPress: () => Alert.alert('About', 'Infinite Realty Hub v1.0.0\n\nBuilt with React Native and Expo'),
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        {
          id: 'reset',
          title: 'Reset All Data',
          subtitle: 'Delete all contacts, leads, and settings',
          icon: '⚠️',
          type: 'action' as const,
          onPress: handleResetData,
        },
        {
          id: 'signout',
          title: 'Sign Out',
          subtitle: 'Sign out of your account',
          icon: '🚪',
          type: 'action' as const,
          onPress: handleSignOut,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={item.onPress}
      activeOpacity={item.type === 'toggle' ? 1 : 0.7}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{item.icon}</Text>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingRight}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={() => item.onPress?.()}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={item.value ? '#ffffff' : '#f4f3f4'}
          />
        )}
        {item.type === 'navigation' && (
          <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your experience
          </Text>
        </View>

        {/* User Info */}
        <View style={[styles.userSection, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.user_metadata?.full_name || 'Real Estate Professional'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <View style={styles.sectionItems}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => setShowProfileModal(false)}>
              <Text style={[styles.modalHeaderButton, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowProfileModal(false);
                Alert.alert('Success', 'Profile updated successfully');
              }}
            >
              <Text style={[styles.modalHeaderButton, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={profileData.fullName}
                onChangeText={(text) => setProfileData({ ...profileData, fullName: text })}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.textSecondary }]}
                value={profileData.email}
                editable={false}
                placeholder="Email cannot be changed"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.inputHint, { color: colors.textSecondary }]}>
                Email cannot be changed. Contact support if needed.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionItems: {
    paddingHorizontal: 20,
    gap: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingRight: {
    alignItems: 'center',
  },
  chevron: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputHint: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});