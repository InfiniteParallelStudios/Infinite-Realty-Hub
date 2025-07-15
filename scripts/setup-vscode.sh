#!/bin/bash

# VS Code Setup Script for Infinite Realty Hub
# Automatically installs all required VS Code extensions

set -e

echo "🚀 Setting up VS Code for Infinite Realty Hub development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo -e "${RED}❌ VS Code is not installed or not in PATH${NC}"
    echo -e "${YELLOW}Please install VS Code and ensure 'code' command is available${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Installing VS Code extensions...${NC}"

# Essential extensions for React Native development
extensions=(
    "msjsdiag.vscode-react-native"
    "dsznajder.es7-react-js-snippets"
    "esbenp.prettier-vscode"
    "ms-vscode.vscode-eslint"
    "pmneo.tsimporter"
    "eamodio.gitlens"
    "rangav.vscode-thunder-client"
)

# Install each extension
for extension in "${extensions[@]}"; do
    echo -e "${BLUE}Installing ${extension}...${NC}"
    if code --install-extension "$extension" --force; then
        echo -e "${GREEN}✅ ${extension} installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install ${extension}${NC}"
    fi
done

echo -e "${GREEN}🎉 VS Code setup complete!${NC}"
echo -e "${BLUE}📖 Please review docs/VS_CODE_SETUP.md for configuration details${NC}"

# Check if workspace is open in VS Code
if [[ "$1" == "--open" ]]; then
    echo -e "${BLUE}🚀 Opening workspace in VS Code...${NC}"
    code .
fi

echo -e "${YELLOW}💡 Tips:${NC}"
echo -e "  • Restart VS Code to ensure all extensions are loaded"
echo -e "  • Review .vscode/settings.json for workspace-specific settings"
echo -e "  • Use Cmd+Shift+P to access VS Code command palette"
echo -e "  • Check docs/VS_CODE_SETUP.md for keyboard shortcuts and tips"
