#!/bin/bash

# Infinite Realty Hub - Development Environment Setup Script for macOS (No iOS)
# This script sets up the React Native development environment but skips iOS to avoid CocoaPods freezing

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function print_step() {
    echo -e "${CYAN}🔧 $1${NC}"
}

function print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

function print_error() {
    echo -e "${RED}❌ $1${NC}"
}

function print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

function command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_step "Starting Android-only React Native Development Environment Setup..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Install project dependencies
print_step "Installing project dependencies..."
npm install
print_success "Project dependencies installed"

# Set up Android SDK environment variables if not already done
ANDROID_HOME_PATH="$HOME/Library/Android/sdk"
SHELL_PROFILE="$HOME/.zshrc"

if [ -f "$SHELL_PROFILE" ]; then
    if ! grep -q "ANDROID_HOME" "$SHELL_PROFILE"; then
        print_step "Adding Android SDK environment variables to $SHELL_PROFILE..."
        echo "" >> "$SHELL_PROFILE"
        echo "# Android SDK Configuration" >> "$SHELL_PROFILE"
        echo "export ANDROID_HOME=\$HOME/Library/Android/sdk" >> "$SHELL_PROFILE"
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_PROFILE"
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_PROFILE"
        print_success "Android environment variables added"
    else
        print_success "Android environment variables already configured"
    fi
fi

# Source the profile to make variables available
source "$SHELL_PROFILE"

# Check React Native Doctor
print_step "Running React Native Doctor to check environment..."
cd apps/mobile
npx react-native doctor || {
    print_warning "React Native Doctor found some issues. This is normal if you haven't set up Android Studio yet."
}

print_success "🎉 Android development environment setup completed!"
echo
print_warning "📱 Next Steps for Complete Setup:"
echo "1. Open Android Studio and complete the setup wizard"
echo "2. Install Android SDK Platform 34 (or latest)"
echo "3. Create an Android Virtual Device (AVD)"
echo "4. For iOS development, install Xcode from Mac App Store"
echo "5. Install CocoaPods manually: brew install cocoapods"
echo "6. Test your setup: npm run android"
echo
print_warning "🔧 Manual iOS Setup (to avoid freezing):"
echo "1. Install Xcode from Mac App Store"
echo "2. Run: sudo xcode-select --install"
echo "3. Run: brew install cocoapods"
echo "4. Accept Xcode license: sudo xcodebuild -license accept"
echo "5. Test iOS setup: npm run ios"
