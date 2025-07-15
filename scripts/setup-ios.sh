#!/bin/bash

# Infinite Realty Hub - iOS Development Setup Script
# Run this script AFTER installing Xcode from the Mac App Store

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

echo -e "${CYAN}🍎 iOS Development Environment Setup${NC}"
echo "======================================="

# Check if Xcode is installed
print_step "Checking Xcode installation..."
if [ ! -d "/Applications/Xcode.app" ]; then
    print_error "Xcode not found. Please install Xcode from the Mac App Store first:"
    echo "  1. Open Mac App Store"
    echo "  2. Search for 'Xcode'"
    echo "  3. Click 'Install' (free, ~15GB download)"
    echo "  4. Wait for installation to complete"
    echo "  5. Run this script again"
    exit 1
fi

print_success "Xcode is installed"

# Accept Xcode license
print_step "Accepting Xcode license..."
if sudo xcodebuild -license accept; then
    print_success "Xcode license accepted"
else
    print_error "Failed to accept Xcode license"
    echo "Please run manually: sudo xcodebuild -license accept"
    exit 1
fi

# Set Xcode developer directory
print_step "Setting Xcode developer directory..."
if sudo xcode-select -s /Applications/Xcode.app/Contents/Developer; then
    print_success "Xcode developer directory set"
else
    print_error "Failed to set Xcode developer directory"
    exit 1
fi

# Verify xcodebuild is working
print_step "Verifying xcodebuild..."
if xcodebuild -version; then
    print_success "xcodebuild is working"
else
    print_error "xcodebuild is not working properly"
    exit 1
fi

# Install additional Xcode components
print_step "Installing additional Xcode components..."
if xcodebuild -downloadPlatform iOS; then
    print_success "iOS platform downloaded"
else
    print_warning "iOS platform download may have failed (might already be installed)"
fi

# Verify CocoaPods (should already be installed)
print_step "Verifying CocoaPods installation..."
if command_exists pod; then
    POD_VERSION=$(pod --version)
    print_success "CocoaPods v$POD_VERSION is installed"
else
    print_step "Installing CocoaPods..."
    if brew install cocoapods; then
        print_success "CocoaPods installed via Homebrew"
    else
        print_error "Failed to install CocoaPods"
        exit 1
    fi
fi

# Install ios-deploy for physical device deployment
print_step "Installing ios-deploy..."
if npm install -g ios-deploy; then
    print_success "ios-deploy installed"
else
    print_warning "ios-deploy installation failed (you can install it later if needed)"
fi

# Create iOS simulators (if needed)
print_step "Checking iOS Simulators..."
if command_exists xcrun; then
    SIMULATORS=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | wc -l)
    if [ "$SIMULATORS" -gt 0 ]; then
        print_success "iOS Simulators available: $SIMULATORS"
        echo "Available iPhone simulators:"
        xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -5
    else
        print_warning "No iOS Simulators found. They should be installed with Xcode."
    fi
else
    print_error "xcrun not available"
fi

# Test iOS setup with React Native Doctor
print_step "Testing iOS setup with React Native Doctor..."
cd apps/mobile 2>/dev/null || {
    print_error "Please run this script from the project root directory"
    exit 1
}

echo "Running React Native Doctor to verify iOS setup..."
npx react-native doctor || print_warning "React Native Doctor found some issues (this is normal if you haven't started development yet)"

print_success "🎉 iOS Development Environment Setup Complete!"
echo
print_warning "📱 Next Steps:"
echo "1. Test iOS development: npm run ios"
echo "2. If you encounter issues, check docs/TROUBLESHOOTING.md"
echo "3. For physical device testing, ensure your Apple ID is configured in Xcode"
echo
echo "💡 Tips:"
echo "- Open Xcode and go through the welcome wizard if this is your first time"
echo "- Sign in with your Apple ID in Xcode > Preferences > Accounts"
echo "- For physical device testing, you'll need to trust your developer profile on the device"
