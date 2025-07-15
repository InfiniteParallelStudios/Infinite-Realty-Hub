#!/bin/bash

# Infinite Realty Hub - Universal Setup Script (Bash Entry Point)
# This script provides a unified entry point for Unix-based systems

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}============================================================${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}============================================================${NC}"
}

print_step() {
    echo -e "🔧 ${CYAN}$1${NC}"
}

print_success() {
    echo -e "✅ ${GREEN}$1${NC}"
}

print_error() {
    echo -e "❌ ${RED}$1${NC}"
}

print_warning() {
    echo -e "⚠️ ${YELLOW}$1${NC}"
}

show_help() {
    print_header "Infinite Realty Hub - Development Environment Setup"
    echo ""
    echo -e "${CYAN}DESCRIPTION:${NC}"
    echo "  Automatically sets up the complete React Native development environment"
    echo "  for the Infinite Realty Hub project. Detects your platform and installs"
    echo "  all required tools, dependencies, and configurations."
    echo ""
    echo -e "${CYAN}USAGE:${NC}"
    echo "  Bash (macOS/Linux):"
    echo "    ./setup-dev-env.sh [options]"
    echo ""
    echo "  PowerShell (Windows/Cross-platform):"
    echo "    .\\setup-dev-env.ps1 [options]"
    echo ""
    echo -e "${CYAN}OPTIONS:${NC}"
    echo "  --skip-android    Skip Android development tools installation"
    echo "  --skip-vscode     Skip VS Code and extensions installation"
    echo "  --verbose         Show detailed output during installation"
    echo "  --help            Show this help message"
    echo ""
    echo -e "${CYAN}WHAT GETS INSTALLED:${NC}"
    echo "  • Node.js (via Node Version Manager)"
    echo "  • React Native CLI and Expo CLI"
    echo "  • Git (if not already installed)"
    echo "  • VS Code with recommended extensions"
    echo "  • Android Studio and SDK (unless --skip-android)"
    echo "  • Java Development Kit (JDK 17)"
    echo "  • Platform-specific package managers (Chocolatey/Homebrew)"
    echo "  • Docker Desktop"
    echo "  • AWS CLI and Terraform"
    echo ""
    echo -e "${YELLOW}REQUIREMENTS:${NC}"
    echo "  • Administrator/sudo privileges for installations"
    echo "  • Active internet connection"
    echo "  • Windows 10+ / macOS 10.15+ / Ubuntu 18.04+"
    echo ""
    echo -e "${CYAN}For more information, visit:${NC}"
    echo "  https://github.com/InfiniteParallelStudios/infinite-realty-hub"
    echo ""
}

# Parse command line arguments
SKIP_ANDROID=false
SKIP_VSCODE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-android)
            SKIP_ANDROID=true
            export SKIP_ANDROID
            shift
            ;;
        --skip-vscode)
            SKIP_VSCODE=true
            export SKIP_VSCODE
            shift
            ;;
        --verbose)
            VERBOSE=true
            export VERBOSE
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information."
            exit 1
            ;;
    esac
done

# Detect platform
detect_platform() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macOS"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "Linux"
    else
        echo "Unknown"
    fi
}

# Main execution
main() {
    print_header "Infinite Realty Hub - Development Environment Setup"
    
    # Detect platform
    PLATFORM=$(detect_platform)
    print_step "Detected platform: $PLATFORM"
    
    if [[ "$PLATFORM" == "Unknown" ]]; then
        print_error "Unable to detect platform. This script supports macOS and Linux."
        exit 1
    fi
    
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Check for platform-specific script
    SETUP_SCRIPT="$SCRIPT_DIR/scripts/setup-dev-env-macos.sh"
    
    if [[ ! -f "$SETUP_SCRIPT" ]]; then
        print_error "Setup script not found at: $SETUP_SCRIPT"
        exit 1
    fi
    
    # Make script executable
    chmod +x "$SETUP_SCRIPT"
    
    # Run platform-specific setup
    print_step "Running $PLATFORM setup script..."
    
    if "$SETUP_SCRIPT"; then
        print_header "Setup Complete!"
        print_success "Development environment setup completed successfully!"
        echo ""
        echo -e "${CYAN}Next steps:${NC}"
        echo "1. Restart your terminal/IDE to pick up environment changes"
        echo "2. Clone the project repository if you haven't already"
        echo "3. Run 'npm install' in the project root"
        echo "4. Follow the README.md for project-specific setup"
        echo ""
        echo "For troubleshooting, check the project documentation or create an issue on GitHub."
    else
        print_header "Setup Failed"
        print_error "Development environment setup encountered errors."
        echo "Please check the output above for details and try again."
        exit 1
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
