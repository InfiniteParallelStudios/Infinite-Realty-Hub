#!/bin/bash

# Infinite Realty Hub - Development Environment Setup Script for macOS
# This script automates the setup of the complete React Native development environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Flags
SKIP_IOS=false
SKIP_ANDROID=false
SKIP_VSCODE=false
VERBOSE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-ios)
      SKIP_IOS=true
      shift
      ;;
    --skip-android)
      SKIP_ANDROID=true
      shift
      ;;
    --skip-vscode)
      SKIP_VSCODE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --help)
      show_help
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      show_help
      exit 1
      ;;
  esac
done

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

function install_homebrew() {
    if ! command_exists brew; then
        print_step "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        # Add Homebrew to PATH for Apple Silicon Macs
        if [[ $(uname -m) == 'arm64' ]]; then
            echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/opt/homebrew/bin/brew shellenv)"
        else
            echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
            eval "$(/usr/local/bin/brew shellenv)"
        fi
        
        if command_exists brew; then
            print_success "Homebrew installed successfully"
        else
            print_error "Failed to install Homebrew"
            exit 1
        fi
    else
        print_success "Homebrew is already installed"
        brew update
    fi
}

function install_xcode_command_line_tools() {
    print_step "Checking Xcode Command Line Tools..."
    
    if ! xcode-select -p >/dev/null 2>&1; then
        print_step "Installing Xcode Command Line Tools..."
        xcode-select --install
        
        print_warning "Please complete the Xcode Command Line Tools installation in the dialog that appeared."
        print_warning "Press any key after the installation is complete..."
        read -n 1 -s
        
        if xcode-select -p >/dev/null 2>&1; then
            print_success "Xcode Command Line Tools installed successfully"
        else
            print_error "Failed to install Xcode Command Line Tools"
            exit 1
        fi
    else
        print_success "Xcode Command Line Tools are already installed"
    fi
}

function install_nodejs() {
    print_step "Checking Node.js installation..."
    
    if command_exists node; then
        NODE_VERSION=$(node --version | sed 's/v//')
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1)
        
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js v$NODE_VERSION is already installed and meets requirements (v18+)"
            return
        else
            print_warning "Node.js v$NODE_VERSION is installed but version 18+ is required"
        fi
    fi
    
    print_step "Installing Node.js LTS..."
    brew install node@18
    
    # Link the installed version
    brew link node@18 --force --overwrite
    
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION installed successfully"
    else
        print_error "Failed to install Node.js"
        exit 1
    fi
}

function install_git() {
    print_step "Checking Git installation..."
    
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_success "Git is already installed: $GIT_VERSION"
        return
    fi
    
    print_step "Installing Git..."
    brew install git
    
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_success "Git installed successfully: $GIT_VERSION"
    else
        print_error "Failed to install Git"
        exit 1
    fi
}

function install_react_native_cli() {
    print_step "Installing React Native CLI and Expo CLI..."
    
    # Install React Native CLI globally
    npm install -g @react-native-community/cli
    
    # Install Expo CLI globally
    npm install -g @expo/cli
    
    if command_exists npx; then
        print_success "React Native CLI and Expo CLI installed successfully"
    else
        print_error "Failed to install React Native CLI"
        exit 1
    fi
}

function install_watchman() {
    print_step "Installing Watchman (Facebook's file watching service)..."
    
    if command_exists watchman; then
        print_success "Watchman is already installed"
        return
    fi
    
    brew install watchman
    
    if command_exists watchman; then
        print_success "Watchman installed successfully"
    else
        print_error "Failed to install Watchman"
        exit 1
    fi
}

function install_ios_dependencies() {
    if [ "$SKIP_IOS" = true ]; then
        print_warning "Skipping iOS dependencies installation (--skip-ios flag provided)"
        return
    fi
    
    print_step "Installing iOS dependencies..."
    
    # Install CocoaPods
    if ! command_exists pod; then
        print_step "Installing CocoaPods..."
        sudo gem install cocoapods
        
        if command_exists pod; then
            print_success "CocoaPods installed successfully"
        else
            print_error "Failed to install CocoaPods"
            exit 1
        fi
    else
        print_success "CocoaPods is already installed"
    fi
    
    # Check for Xcode
    if ! [ -d "/Applications/Xcode.app" ]; then
        print_warning "Xcode is not installed. Please install Xcode from the Mac App Store for iOS development."
        print_warning "After installing Xcode, run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    else
        print_success "Xcode is installed"
        
        # Ensure Xcode is properly selected
        sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
        
        # Install iOS Simulator if not already installed
        print_step "Setting up iOS Simulator..."
        xcrun simctl list devices | grep -q "iPhone" && print_success "iOS Simulator is available" || print_warning "iOS Simulator may need additional setup"
    fi
}

function install_android_dependencies() {
    if [ "$SKIP_ANDROID" = true ]; then
        print_warning "Skipping Android dependencies installation (--skip-android flag provided)"
        return
    fi
    
    print_step "Installing Android dependencies..."
    
    # Install Java Development Kit
    if ! command_exists java; then
        print_step "Installing Java Development Kit..."
        brew install --cask temurin
    else
        print_success "Java is already installed"
    fi
    
    # Install Android Studio
    if ! [ -d "/Applications/Android Studio.app" ]; then
        print_step "Installing Android Studio..."
        brew install --cask android-studio
        
        print_warning "Android Studio has been installed. Please complete the setup manually:"
        echo "1. Open Android Studio"
        echo "2. Follow the setup wizard"
        echo "3. Install Android SDK (API 34+)"
        echo "4. Create an Android Virtual Device (AVD)"
        echo "5. Set up ANDROID_HOME environment variable in your shell profile"
    else
        print_success "Android Studio is already installed"
    fi
    
    # Set up ANDROID_HOME environment variable
    ANDROID_HOME_PATH="$HOME/Library/Android/sdk"
    
    if [ -d "$ANDROID_HOME_PATH" ]; then
        print_step "Setting up Android environment variables..."
        
        # Add to shell profile
        SHELL_PROFILE=""
        if [ -n "$ZSH_VERSION" ]; then
            SHELL_PROFILE="$HOME/.zshrc"
        elif [ -n "$BASH_VERSION" ]; then
            SHELL_PROFILE="$HOME/.bash_profile"
        fi
        
        if [ -n "$SHELL_PROFILE" ]; then
            if ! grep -q "ANDROID_HOME" "$SHELL_PROFILE"; then
                echo "" >> "$SHELL_PROFILE"
                echo "# Android Studio Environment Variables" >> "$SHELL_PROFILE"
                echo "export ANDROID_HOME=\$HOME/Library/Android/sdk" >> "$SHELL_PROFILE"
                echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_PROFILE"
                echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_PROFILE"
                
                print_success "Android environment variables added to $SHELL_PROFILE"
            else
                print_success "Android environment variables already configured"
            fi
        fi
        
        # Set for current session
        export ANDROID_HOME="$HOME/Library/Android/sdk"
        export PATH="$PATH:$ANDROID_HOME/emulator"
        export PATH="$PATH:$ANDROID_HOME/platform-tools"
    fi
}

function install_vscode() {
    if [ "$SKIP_VSCODE" = true ]; then
        print_warning "Skipping VS Code installation (--skip-vscode flag provided)"
        return
    fi
    
    print_step "Checking VS Code installation..."
    
    if ! [ -d "/Applications/Visual Studio Code.app" ] && ! command_exists code; then
        print_step "Installing Visual Studio Code..."
        brew install --cask visual-studio-code
    else
        print_success "VS Code is already installed"
    fi
    
    # Ensure code command is available
    if ! command_exists code; then
        print_step "Setting up VS Code command line tool..."
        # The installer usually sets this up, but let's make sure
        sudo ln -sf "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" /usr/local/bin/code
    fi
    
    print_step "Installing VS Code extensions..."
    
    extensions=(
        "msjsdiag.vscode-react-native"
        "dsznajder.es7-react-js-snippets"
        "esbenp.prettier-vscode"
        "ms-vscode.vscode-eslint"
        "ms-vscode.vscode-typescript-next"
        "eamodio.gitlens"
        "rangav.vscode-thunder-client"
    )
    
    for extension in "${extensions[@]}"; do
        print_step "Installing extension: $extension"
        code --install-extension "$extension" --force
    done
    
    print_success "VS Code extensions installed successfully"
}

function setup_environment_variables() {
    print_step "Setting up environment variables..."
    
    # Create .env.example file
    cat > .env.example << 'EOF'
# Development Environment Variables
NODE_ENV=development
API_BASE_URL=http://localhost:3000
APP_NAME=Infinite Realty Hub

# Database (for future use)
DATABASE_URL=postgresql://localhost:5432/infinite_realty_hub_dev

# AWS (for future use)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Authentication (for future use)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# External Services (for future use)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_here

# Mobile App Configuration
APP_SCHEME=infiniterealtyhub
APP_VERSION=1.0.0
EOF
    
    print_success "Created .env.example file"
}

function create_project_scripts() {
    print_step "Creating package.json with development scripts..."
    
    cat > package.json << 'EOF'
{
  "name": "infinite-realty-hub",
  "version": "1.0.0",
  "description": "🏡 The ultimate mobile platform for real estate professionals",
  "main": "index.js",
  "scripts": {
    "start": "npm run start:mobile",
    "start:mobile": "cd apps/mobile && npm start",
    "start:api": "cd services/api && npm run dev",
    "build": "npm run build:mobile",
    "build:mobile": "cd apps/mobile && npm run build",
    "build:api": "cd services/api && npm run build",
    "test": "npm run test:mobile && npm run test:api",
    "test:mobile": "cd apps/mobile && npm test",
    "test:api": "cd services/api && npm test",
    "lint": "npm run lint:mobile && npm run lint:api",
    "lint:mobile": "cd apps/mobile && npm run lint",
    "lint:api": "cd services/api && npm run lint",
    "lint:fix": "npm run lint:mobile:fix && npm run lint:api:fix",
    "lint:mobile:fix": "cd apps/mobile && npm run lint:fix",
    "lint:api:fix": "cd services/api && npm run lint:fix",
    "type-check": "npm run type-check:mobile && npm run type-check:api",
    "type-check:mobile": "cd apps/mobile && npm run type-check",
    "type-check:api": "cd services/api && npm run type-check",
    "clean": "npm run clean:mobile && npm run clean:api",
    "clean:mobile": "cd apps/mobile && npm run clean",
    "clean:api": "cd services/api && npm run clean",
    "setup": "npm install && npm run setup:workspaces",
    "setup:workspaces": "npm run setup:mobile && npm run setup:api",
    "setup:mobile": "cd apps/mobile && npm install",
    "setup:api": "cd services/api && npm install",
    "doctor": "npx react-native doctor",
    "android": "cd apps/mobile && npm run android",
    "ios": "cd apps/mobile && npm run ios"
  },
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ],
  "keywords": [
    "react-native",
    "real-estate",
    "crm",
    "mobile-app",
    "typescript"
  ],
  "author": "Infinite Parallel Studios",
  "license": "MIT",
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.45.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^5.0.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-native": "^4.0.0",
    "husky": "^8.0.3",
    "lint-staged": "^13.2.3",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF
    
    print_success "Created package.json with development scripts"
}

function test_installation() {
    print_step "Testing installation..."
    
    success=true
    
    # Test Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "✓ Node.js: $NODE_VERSION"
    else
        print_error "✗ Node.js not found"
        success=false
    fi
    
    # Test npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "✓ npm: v$NPM_VERSION"
    else
        print_error "✗ npm not found"
        success=false
    fi
    
    # Test Git
    if command_exists git; then
        GIT_VERSION=$(git --version)
        print_success "✓ Git: $GIT_VERSION"
    else
        print_error "✗ Git not found"
        success=false
    fi
    
    # Test Watchman
    if command_exists watchman; then
        print_success "✓ Watchman installed"
    else
        print_error "✗ Watchman not found"
        success=false
    fi
    
    # Test React Native CLI
    if npx react-native --version >/dev/null 2>&1; then
        print_success "✓ React Native CLI available"
    else
        print_error "✗ React Native CLI not found"
        success=false
    fi
    
    # Test Expo CLI
    if npx expo --version >/dev/null 2>&1; then
        print_success "✓ Expo CLI available"
    else
        print_error "✗ Expo CLI not found"
        success=false
    fi
    
    # Test CocoaPods (if not skipping iOS)
    if [ "$SKIP_IOS" = false ]; then
        if command_exists pod; then
            print_success "✓ CocoaPods installed"
        else
            print_error "✗ CocoaPods not found"
            success=false
        fi
    fi
    
    if [ "$success" = true ]; then
        print_success "🎉 All tools installed successfully!"
        echo ""
        echo -e "${CYAN}Next steps:${NC}"
        echo "1. Complete Android Studio setup if not skipped"
        echo "2. Install Xcode from Mac App Store if not installed (for iOS development)"
        echo "3. Run 'npx react-native doctor' to verify React Native setup"
        echo "4. Create a test React Native project: 'npx react-native init TestApp'"
        echo "5. Continue with Issue #3: Project Architecture & Monorepo Structure"
        echo ""
        echo -e "${CYAN}Restart your terminal or run the following to reload your shell:${NC}"
        echo "source ~/.zshrc  # for zsh"
        echo "source ~/.bash_profile  # for bash"
    else
        print_error "Some tools failed to install. Please check the errors above and try again."
        exit 1
    fi
}

function show_help() {
    echo -e "${CYAN}Infinite Realty Hub - Development Environment Setup for macOS${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo "  ./setup-dev-env-macos.sh [options]"
    echo ""
    echo -e "${CYAN}Options:${NC}"
    echo "  --skip-ios        Skip iOS dependencies (Xcode, CocoaPods)"
    echo "  --skip-android    Skip Android dependencies (Android Studio)"
    echo "  --skip-vscode     Skip VS Code installation"
    echo "  --verbose         Show verbose output"
    echo "  --help            Show this help message"
    echo ""
    echo -e "${CYAN}This script will install:${NC}"
    echo "  • Homebrew package manager"
    echo "  • Xcode Command Line Tools"
    echo "  • Node.js LTS (v18+)"
    echo "  • Git"
    echo "  • Watchman"
    echo "  • React Native CLI"
    echo "  • Expo CLI"
    echo "  • CocoaPods (unless iOS skipped)"
    echo "  • Android Studio (unless Android skipped)"
    echo "  • VS Code with React Native extensions (unless skipped)"
    echo ""
}

# Main execution
clear
echo -e "${CYAN}🏡 Infinite Realty Hub - Development Environment Setup${NC}"
echo -e "${CYAN}=====================================================${NC}"
echo ""

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only."
    exit 1
fi

install_homebrew
install_xcode_command_line_tools
install_nodejs
install_git
install_watchman
install_react_native_cli
install_ios_dependencies
install_android_dependencies
install_vscode
setup_environment_variables
create_project_scripts
test_installation

echo ""
print_success "🎉 Development environment setup completed successfully!"
print_success "You can now start developing Infinite Realty Hub!"
