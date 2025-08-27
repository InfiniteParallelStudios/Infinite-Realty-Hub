import 'dotenv/config';

export default {
  expo: {
    name: "Infinite Realty Hub",
    slug: "infinite-realty-hub",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000811"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.infiniterealtyhub.mobile",
      buildNumber: "1.0.0",
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#000811"
      },
      package: "com.infiniterealtyhub.mobile",
      versionCode: 1,
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "ACCESS_NETWORK_STATE",
        "INTERNET"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow Infinite Realty Hub to access your camera to scan QR codes and take photos."
        }
      ],
      [
        "expo-contacts",
        {
          contactsPermission: "Allow Infinite Realty Hub to access your contacts to sync and manage your real estate network."
        }
      ]
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    },
    owner: "infiniterealtyhub"
  }
};