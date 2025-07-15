# 🍎 iOS Development Setup Guide

## Current Status ✅

**Good News**: The iOS development foundation is already in place!

- ✅ **CocoaPods v1.16.2** installed successfully (via Homebrew - no freezing!)
- ✅ **Xcode Command Line Tools** installed
- ✅ **Expo project** configured for iOS (app.json has iOS settings)
- ✅ **Environment variables** properly configured

## What You Need to Install

### 1. Xcode (Required) 📱

**Xcode is the only major component still needed for iOS development.**

#### Installation Steps:
```bash
# Open Mac App Store
open "macappstore://itunes.apple.com/app/xcode/id497799835"
```

**Or manually:**
1. Open **Mac App Store** (⌘+Space, type "App Store")
2. Search for **"Xcode"**
3. Click **"Install"** (Free, ~15GB download)
4. Wait for installation (30-60 minutes depending on internet speed)

#### After Xcode Installation:
```bash
# Run our automated iOS setup script
./setup-expo-ios.sh
```

### 2. Optional Tools

These will be installed automatically by the script after Xcode is ready:

- **ios-deploy**: For physical device deployment
- **iOS Simulators**: Included with Xcode
- **CocoaPods master repo**: For dependency management

## Quick Setup Commands

### Once Xcode is Installed:

```bash
# 1. Run the iOS setup script
cd /Users/joshuabray/Desktop/infinite-realty-hub
./setup-expo-ios.sh

# 2. Test iOS development
cd apps/mobile
npm run ios
```

## Development Workflow

### For iOS Simulator:
```bash
npm run ios
```

### For Physical iOS Device:
1. **Download Expo Go** from the App Store on your iOS device
2. **Start development server**:
   ```bash
   npm start
   ```
3. **Scan QR code** with Expo Go app

### For Custom Development Builds:
```bash
# Generate iOS project
expo run:ios

# This creates a native iOS project you can open in Xcode
```

## Verification Commands

After Xcode installation, verify your setup:

```bash
# Check Xcode
xcodebuild -version

# Check iOS Simulators
xcrun simctl list devices | grep iPhone

# Check CocoaPods
pod --version

# Check Expo
expo doctor

# Full environment check
./validate-environment.sh
```

## Troubleshooting

### If iOS Simulator Won't Start:
1. Open **Xcode**
2. Go to **Xcode > Open Developer Tool > Simulator**
3. Choose an iPhone simulator from the **Device** menu

### If Build Fails:
1. Check **docs/TROUBLESHOOTING.md**
2. Ensure you've accepted Xcode license: `sudo xcodebuild -license accept`
3. Verify Xcode path: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`

### Physical Device Issues:
1. **Trust this computer** when prompted on your iOS device
2. **Enable Developer Mode** in Settings > Privacy & Security (iOS 16+)
3. **Sign in to Xcode** with your Apple ID (Xcode > Settings > Accounts)

## Next Steps After Xcode Installation

1. **Run the setup script**: `./setup-expo-ios.sh`
2. **Test iOS simulator**: `npm run ios`
3. **Install Expo Go** on your physical device for testing
4. **Open Xcode** and sign in with your Apple ID
5. **Start developing!** 🚀

## Time Estimates

- **Xcode Download**: 30-60 minutes (15GB)
- **Xcode Installation**: 10-15 minutes
- **iOS Setup Script**: 2-3 minutes
- **First iOS Build**: 5-10 minutes

---

**🎯 Bottom Line**: Once Xcode is installed, you'll have a complete iOS development environment ready for the Infinite Realty Hub mobile app!
