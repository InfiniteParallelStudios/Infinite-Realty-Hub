# Development Environment Setup Guide

This guide will help you set up your development environment for the Infinite Realty Hub project. We provide automated setup scripts that work across Windows, macOS, and Linux.

## Quick Start

### Prerequisites

- **Administrative/sudo privileges** for software installation
- **Active internet connection**
- **Supported OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+

### One-Command Setup

Choose the appropriate command for your platform:

#### Windows (PowerShell - Recommended)
```powershell
# Run as Administrator
.\setup-dev-env.ps1
```

#### macOS/Linux (Bash)
```bash
# Make executable and run
chmod +x setup-dev-env.sh
./setup-dev-env.sh
```

#### Cross-Platform (PowerShell Core)
```powershell
# Works on any platform with PowerShell Core installed
.\setup-dev-env.ps1
```

## What Gets Installed

Our setup scripts automatically install and configure:

### Core Development Tools
- **Node.js** (via Node Version Manager)
  - Latest LTS version
  - npm and npx
- **Git** (if not already installed)
- **React Native CLI**
- **Expo CLI**

### Mobile Development
- **Android Studio** (unless `--skip-android`)
  - Android SDK
  - Android Build Tools
  - Android Emulator
- **Java Development Kit (JDK 17)**

### Code Editor & Extensions
- **Visual Studio Code** (unless `--skip-vscode`)
- **Essential VS Code Extensions**:
  - React Native Tools
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Bracket Pair Colorizer
  - GitLens
  - Auto Rename Tag
  - Thunder Client (API testing)

### Cloud & Infrastructure
- **Docker Desktop**
- **AWS CLI v2**
- **Terraform**

### Package Managers
- **Windows**: Chocolatey
- **macOS**: Homebrew
- **Linux**: Native package managers (apt, yum, etc.)

## Setup Options

### Command Line Options

| Option | Description |
|--------|-------------|
| `--skip-android` | Skip Android development tools installation |
| `--skip-vscode` | Skip VS Code and extensions installation |
| `--verbose` | Show detailed output during installation |
| `--help` | Display help information |

### Examples

```bash
# Skip Android tools (iOS development only)
./setup-dev-env.sh --skip-android

# Skip VS Code (using different editor)
./setup-dev-env.sh --skip-vscode

# Verbose output for troubleshooting
./setup-dev-env.sh --verbose

# Combine options
./setup-dev-env.sh --skip-android --verbose
```

## Platform-Specific Notes

### Windows
- **Run PowerShell as Administrator**
- Uses Chocolatey for package management
- Installs Windows Subsystem for Linux (WSL2) for better compatibility
- Configures Windows Terminal with PowerShell Core

### macOS
- Uses Homebrew for package management
- Installs Xcode Command Line Tools
- Configures Zsh shell with useful aliases
- Sets up proper PATH for all tools

### Linux (Ubuntu/Debian)
- Uses apt package manager
- Installs snap packages where appropriate
- Configures bash/zsh shell
- Sets up proper permissions for Android development

## Manual Setup (Alternative)

If you prefer to set up manually or encounter issues with the automated scripts:

### 1. Install Node.js
```bash
# Using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

### 2. Install React Native CLI
```bash
npm install -g @react-native-community/cli
npm install -g @expo/cli
```

### 3. Install Android Studio
1. Download from [developer.android.com](https://developer.android.com/studio)
2. Install Android SDK (API level 33+)
3. Configure environment variables:
   - `ANDROID_HOME`
   - `ANDROID_SDK_ROOT`
   - Add platform-tools to PATH

### 4. Install Development Tools
```bash
# Install VS Code
# Download from code.visualstudio.com

# Install essential extensions
code --install-extension msjsdiag.vscode-react-native
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension esbenp.prettier-vscode
```

## Post-Setup Verification

After running the setup script, verify your installation:

### 1. Check Node.js
```bash
node --version
npm --version
```

### 2. Check React Native
```bash
npx react-native --version
expo --version
```

### 3. Check Android Tools (if installed)
```bash
# Check Java
java --version

# Check Android SDK
adb version
```

### 4. Check Cloud Tools
```bash
# Check Docker
docker --version

# Check AWS CLI
aws --version

# Check Terraform
terraform --version
```

## Troubleshooting

### Common Issues

#### Windows: PowerShell Execution Policy
```powershell
# If you get execution policy errors
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### macOS: Command Line Tools
```bash
# If Xcode Command Line Tools installation fails
xcode-select --install
```

#### Android SDK Issues
1. Open Android Studio
2. Go to SDK Manager
3. Install latest SDK Platform and Build Tools
4. Accept all licenses

#### Environment Variables Not Set
- **Restart your terminal/IDE** after setup
- Check your shell configuration file:
  - Windows: PowerShell profile
  - macOS/Linux: `~/.bashrc`, `~/.zshrc`

### Getting Help

1. **Check the logs**: Setup scripts provide detailed output
2. **Search existing issues**: [GitHub Issues](https://github.com/InfiniteParallelStudios/infinite-realty-hub/issues)
3. **Create a new issue**: Include your OS, error messages, and logs
4. **Join our Discord**: [Development Community](link-to-discord)

## Next Steps

After successful setup:

1. **Restart your terminal/IDE**
2. **Clone the project repository**:
   ```bash
   git clone https://github.com/InfiniteParallelStudios/infinite-realty-hub.git
   cd infinite-realty-hub
   ```
3. **Install project dependencies**:
   ```bash
   npm install
   ```
4. **Run the development server**:
   ```bash
   npm start
   ```
5. **Follow the main README.md** for project-specific instructions

## Contributing to Setup Scripts

The setup scripts are located in the `scripts/` directory:
- `scripts/setup-dev-env-windows.ps1` - Windows PowerShell script
- `scripts/setup-dev-env-macos.sh` - macOS/Linux Bash script
- `setup-dev-env.ps1` - Universal PowerShell entry point
- `setup-dev-env.sh` - Universal Bash entry point

To contribute improvements:
1. Test on multiple platforms
2. Ensure idempotent operations (safe to run multiple times)
3. Add proper error handling and logging
4. Update this documentation
