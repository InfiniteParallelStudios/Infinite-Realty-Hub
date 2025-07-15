#!/bin/bash

# Infinite Realty Hub - Environment Validation Script
# Run this script to verify your development environment setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function print_header() {
    echo -e "${CYAN}🔍 $1${NC}"
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

echo -e "${CYAN}🚀 Infinite Realty Hub - Environment Check${NC}"
echo "=================================================="

# Node.js Check
print_header "Checking Node.js..."
if command_exists node; then
    NODE_VERSION=$(node --version)
    MAJOR_VERSION=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        print_success "Node.js $NODE_VERSION (✓ >= 18)"
    else
        print_error "Node.js $NODE_VERSION (Need >= 18)"
    fi
else
    print_error "Node.js not installed"
fi

# npm Check
print_header "Checking npm..."
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm v$NPM_VERSION"
else
    print_error "npm not installed"
fi

# Git Check
print_header "Checking Git..."
if command_exists git; then
    GIT_VERSION=$(git --version)
    print_success "$GIT_VERSION"
else
    print_error "Git not installed"
fi

# Java Check
print_header "Checking Java..."
if command_exists java; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    JAVA_MAJOR=$(echo $JAVA_VERSION | cut -d. -f1)
    if [ "$JAVA_MAJOR" -ge 17 ] && [ "$JAVA_MAJOR" -le 20 ]; then
        print_success "Java $JAVA_VERSION (✓ 17-20)"
    else
        print_warning "Java $JAVA_VERSION (Recommended: 17-20)"
    fi
else
    print_error "Java not installed"
fi

# Android SDK Check
print_header "Checking Android SDK..."
if [ -n "$ANDROID_HOME" ]; then
    if [ -d "$ANDROID_HOME" ]; then
        print_success "ANDROID_HOME: $ANDROID_HOME"
        
        # Check ADB
        if command_exists adb; then
            ADB_VERSION=$(adb version | head -n 1)
            print_success "ADB: $ADB_VERSION"
            
            # Check devices
            DEVICES=$(adb devices | grep -v "List of devices" | grep -v "^$" | wc -l)
            if [ "$DEVICES" -gt 0 ]; then
                print_success "Android devices/emulators: $DEVICES connected"
            else
                print_warning "No Android devices/emulators connected"
            fi
        else
            print_error "ADB not found in PATH"
        fi
        
        # Check emulator
        if command_exists emulator; then
            AVDS=$(emulator -list-avds 2>/dev/null | wc -l)
            if [ "$AVDS" -gt 0 ]; then
                print_success "Android Virtual Devices: $AVDS available"
            else
                print_warning "No Android Virtual Devices found"
            fi
        else
            print_error "Android emulator not found in PATH"
        fi
    else
        print_error "ANDROID_HOME directory doesn't exist: $ANDROID_HOME"
    fi
else
    print_error "ANDROID_HOME not set"
fi

# Android Studio Check
print_header "Checking Android Studio..."
if [ -d "/Applications/Android Studio.app" ]; then
    print_success "Android Studio installed"
else
    print_error "Android Studio not found"
fi

# iOS Tools Check
print_header "Checking iOS tools..."
if [ -d "/Applications/Xcode.app" ]; then
    print_success "Xcode installed"
    
    # Check iOS Simulator
    if command_exists xcrun; then
        SIMULATORS=$(xcrun simctl list devices | grep "iPhone" | wc -l)
        if [ "$SIMULATORS" -gt 0 ]; then
            print_success "iOS Simulators: $SIMULATORS available"
        else
            print_warning "No iOS Simulators found"
        fi
    fi
else
    print_warning "Xcode not installed (required for iOS development)"
fi

# CocoaPods Check
print_header "Checking CocoaPods..."
if command_exists pod; then
    POD_VERSION=$(pod --version)
    print_success "CocoaPods v$POD_VERSION"
else
    print_error "CocoaPods not installed"
fi

# VS Code Check
print_header "Checking VS Code..."
if command_exists code || [ -d "/Applications/Visual Studio Code.app" ]; then
    print_success "VS Code installed"
else
    print_warning "VS Code not installed"
fi

# Expo CLI Check
print_header "Checking Expo CLI..."
if command_exists expo; then
    EXPO_VERSION=$(expo --version)
    print_success "Expo CLI v$EXPO_VERSION"
else
    print_error "Expo CLI not installed"
fi

# Watchman Check
print_header "Checking Watchman..."
if command_exists watchman; then
    WATCHMAN_VERSION=$(watchman --version)
    print_success "Watchman v$WATCHMAN_VERSION"
else
    print_warning "Watchman not installed (recommended for React Native)"
fi

# Project Dependencies Check
print_header "Checking project dependencies..."
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        print_success "Node modules installed"
    else
        print_error "Node modules not installed (run: npm install)"
    fi
    
    if [ -f "apps/mobile/package.json" ]; then
        print_success "Mobile app package.json found"
        cd apps/mobile
        if [ -d "node_modules" ]; then
            print_success "Mobile app dependencies installed"
        else
            print_error "Mobile app dependencies not installed"
        fi
        cd ../..
    else
        print_error "Mobile app package.json not found"
    fi
else
    print_error "Project package.json not found (run from project root)"
fi

echo
echo -e "${CYAN}📋 Summary${NC}"
echo "=================================================="
echo "Run 'npx react-native doctor' for detailed React Native environment check"
echo "Use 'npm run android' to test Android development"
echo "Use 'npm run ios' to test iOS development (requires Xcode)"
echo
echo "For troubleshooting, see: docs/TROUBLESHOOTING.md"
