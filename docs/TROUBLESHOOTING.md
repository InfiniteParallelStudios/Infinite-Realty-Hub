# Development Environment Setup - Troubleshooting Guide

## Common Issues and Solutions

### 🍎 iOS Setup Freezing (CocoaPods Issue)

**Problem**: Setup scripts freeze when installing CocoaPods or iOS dependencies.

**Solutions**:

1. **Manual iOS Setup (Recommended)**:
   ```bash
   # Install Xcode from Mac App Store first
   
   # Install CocoaPods via Homebrew (more reliable than gem)
   brew install cocoapods
   
   # Accept Xcode license
   sudo xcodebuild -license accept
   
   # Set Xcode command line tools
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```

2. **Alternative CocoaPods Installation**:
   ```bash
   # If Homebrew fails, try with specific Ruby version
   sudo gem install cocoapods
   
   # Or use bundler
   bundle install
   pod setup
   ```

3. **Skip iOS for Now**:
   ```bash
   # Use the Android-only setup script
   ./setup-android-only.sh
   ```

### 🤖 Android Setup Issues

**Problem**: Android SDK not detected or emulator offline.

**Solutions**:

1. **Environment Variables**:
   ```bash
   # Add to ~/.zshrc (or ~/.bash_profile)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
   
   # Reload shell
   source ~/.zshrc
   ```

2. **Android Studio Manual Setup**:
   ```bash
   # Open Android Studio
   open "/Applications/Android Studio.app"
   
   # Follow the setup wizard:
   # 1. Install Android SDK (API 34+)
   # 2. Create Virtual Device (AVD)
   # 3. Accept all licenses
   ```

3. **Emulator Issues**:
   ```bash
   # List available emulators
   emulator -list-avds
   
   # Start specific emulator
   emulator -avd Medium_Phone_API_36.0
   
   # Check device status
   adb devices
   
   # Restart ADB if offline
   adb kill-server
   adb start-server
   ```

### ☕ Java Version Issues

**Problem**: Java version incompatibility (React Native requires JDK 17-20).

**Solution**:
```bash
# Install Java 17
brew install --cask temurin@17

# Set JAVA_HOME
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home

# Verify version
java -version
```

### 📦 NPM Issues

**Problem**: Package installation failures or vulnerabilities.

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Fix vulnerabilities
npm audit fix

# If breaking changes needed
npm audit fix --force
```

### 🔧 Metro Bundler Issues

**Problem**: Metro bundler fails to start or connect.

**Solutions**:
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or with Expo
npx expo start --clear

# Clear all caches
npm run clean
```

### 📱 Device Connection Issues

**Problem**: Physical device not detected.

**Solutions**:

For iOS:
```bash
# Install ios-deploy
npm install -g ios-deploy

# Trust developer on device
# Settings > General > Device Management > Trust
```

For Android:
```bash
# Enable Developer Options and USB Debugging on device
# Allow USB debugging when prompted

# Check device connection
adb devices
```

## Environment Verification

Run these commands to verify your setup:

```bash
# Node.js
node --version  # Should be 18+

# Java
java -version   # Should be 17-20

# Android
echo $ANDROID_HOME
adb version
emulator -version

# iOS (if installed)
xcode-select -p
pod --version

# React Native
npx react-native doctor
```

## Quick Setup (Android Only)

If you're experiencing iOS issues, use this minimal setup:

```bash
# 1. Install Android Studio manually
brew install --cask android-studio

# 2. Install Java 17
brew install --cask temurin@17

# 3. Run Android-only setup
./setup-android-only.sh

# 4. Open Android Studio and complete SDK setup

# 5. Test app
npm run android
```

## Emergency Reset

If everything fails:

```bash
# 1. Kill all processes
killall node
killall adb
killall emulator

# 2. Clean project
npm run clean
rm -rf node_modules package-lock.json

# 3. Reinstall dependencies
npm install

# 4. Restart development
npm start
```
