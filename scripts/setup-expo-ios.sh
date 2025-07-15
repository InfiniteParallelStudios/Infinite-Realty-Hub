#!/bin/bash

# Infinite Realty Hub - Expo iOS Development Setup Script
# This script sets up iOS development for Expo projects

set -e

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

echo -e "${CYAN}🍎 Expo iOS Development Setup${NC}"
echo "================================="

# Check if we're in the right directory
if [ ! -f "app.json" ]; then
    print_error "app.json not found. Please run this script from the mobile app directory."
    print_warning "Expected path: /Users/joshuabray/Desktop/infinite-realty-hub/apps/mobile"
    exit 1
fi

print_success "Found Expo project (app.json detected)"

# Check if Xcode is installed
print_step "Checking Xcode installation..."
if [ ! -d "/Applications/Xcode.app" ]; then
    print_error "Xcode not found. Please install Xcode from the Mac App Store:"
    echo
    echo "📱 Xcode Installation Steps:"
    echo "  1. Open Mac App Store (⌘+Space, type 'App Store')"
    echo "  2. Search for 'Xcode'"
    echo "  3. Click 'Install' (free, ~15GB download)"
    echo "  4. Wait for installation (30-60 minutes depending on internet)"
    echo "  5. Run this script again: ./setup-expo-ios.sh"
    echo
    print_warning "💡 Tip: Start the Xcode download now and continue with other tasks while it downloads"
    exit 1
fi

print_success "Xcode is installed"

# Check Xcode version
XCODE_VERSION=$(xcodebuild -version | head -n 1 | cut -d ' ' -f2)
print_success "Xcode version: $XCODE_VERSION"

# Accept Xcode license
print_step "Checking Xcode license..."
if sudo xcodebuild -license accept 2>/dev/null; then
    print_success "Xcode license accepted"
else
    print_warning "You may need to accept the Xcode license manually"
    echo "Run: sudo xcodebuild -license accept"
fi

# Set Xcode developer directory
print_step "Setting Xcode developer directory..."
if sudo xcode-select -s /Applications/Xcode.app/Contents/Developer 2>/dev/null; then
    print_success "Xcode developer directory set"
else
    print_warning "Failed to set Xcode developer directory (may already be set)"
fi

# Verify CocoaPods
print_step "Verifying CocoaPods..."
if command_exists pod; then
    POD_VERSION=$(pod --version)
    print_success "CocoaPods v$POD_VERSION is installed"
    
    # Setup CocoaPods master repo if needed
    REPO_COUNT=$(pod repo list --count-only 2>/dev/null || echo "0")
    if [ "$REPO_COUNT" -eq 0 ]; then
        print_step "Setting up CocoaPods master repository..."
        if pod setup; then
            print_success "CocoaPods master repository setup complete"
        else
            print_warning "CocoaPods setup may have failed (this is often okay)"
        fi
    else
        print_success "CocoaPods repositories configured ($REPO_COUNT repos)"
    fi
else
    print_error "CocoaPods not found. It should be installed already."
    echo "Run: brew install cocoapods"
    exit 1
fi

# Check iOS Simulators
print_step "Checking iOS Simulators..."
if command_exists xcrun; then
    # List available simulators
    SIMULATORS=$(xcrun simctl list devices available | grep "iPhone" | wc -l)
    if [ "$SIMULATORS" -gt 0 ]; then
        print_success "iOS Simulators available: $SIMULATORS"
        echo
        echo "📱 Available iPhone Simulators:"
        xcrun simctl list devices available | grep "iPhone" | head -5 | sed 's/^/  /'
    else
        print_warning "No iOS Simulators found. Try opening Xcode to install them."
    fi
else
    print_error "xcrun not available"
fi

# Install Expo CLI globally if not present
print_step "Verifying Expo CLI..."
if command_exists expo; then
    EXPO_VERSION=$(expo --version)
    print_success "Expo CLI v$EXPO_VERSION"
else
    print_step "Installing Expo CLI..."
    if npm install -g @expo/cli; then
        print_success "Expo CLI installed"
    else
        print_error "Failed to install Expo CLI"
        exit 1
    fi
fi

# Install ios-deploy for physical devices (optional)
print_step "Installing ios-deploy for physical device deployment..."
if npm install -g ios-deploy 2>/dev/null; then
    print_success "ios-deploy installed"
else
    print_warning "ios-deploy installation skipped (install manually if you need physical device deployment)"
fi

# Test the setup
print_step "Testing iOS development setup..."
echo
echo "🧪 Running environment checks..."

# Check if we can start the Expo project
print_step "Validating Expo project configuration..."
if expo doctor 2>/dev/null; then
    print_success "Expo project configuration is valid"
else
    print_warning "Expo doctor found some issues (this may be normal)"
fi

print_success "🎉 Expo iOS Development Setup Complete!"
echo
print_warning "📱 Next Steps:"
echo "1. Test iOS Simulator: npm run ios"
echo "2. Open Xcode and sign in with your Apple ID (Xcode > Settings > Accounts)"
echo "3. For physical device testing:"
echo "   - Connect your iOS device via USB"
echo "   - Trust this computer on your device"
echo "   - Use Expo Go app or custom development build"
echo
print_warning "🔧 Development Workflow:"
echo "• Simulator: npm run ios"
echo "• Physical device: Download 'Expo Go' from App Store"
echo "• Custom builds: Use 'expo run:ios' for development builds"
echo
print_warning "💡 Troubleshooting:"
echo "• If simulator doesn't open: Open Xcode > Xcode > Open Developer Tool > Simulator"
echo "• For build issues: Check docs/TROUBLESHOOTING.md"
echo "• For Expo-specific issues: https://docs.expo.dev/troubleshooting/"
