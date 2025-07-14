# Infinite Realty Hub - Development Environment Setup Script for Windows
# This script automates the setup of the complete React Native development environment

param(
    [switch]$SkipAndroid = $false,
    [switch]$SkipVSCode = $false,
    [switch]$Verbose = $false
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-Step {
    param([string]$Message)
    Write-Host "🔧 $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor $SuccessColor
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor $ErrorColor
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor $WarningColor
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Install-ChocoIfNeeded {
    if (!(Test-Command "choco")) {
        Write-Step "Installing Chocolatey package manager..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
        # Refresh environment variables
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        
        if (Test-Command "choco") {
            Write-Success "Chocolatey installed successfully"
        } else {
            Write-Error "Failed to install Chocolatey. Please install manually and re-run this script."
            exit 1
        }
    } else {
        Write-Success "Chocolatey is already installed"
    }
}

function Install-NodeJS {
    Write-Step "Checking Node.js installation..."
    
    if (Test-Command "node") {
        $nodeVersion = node --version
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        
        if ($majorVersion -ge 18) {
            Write-Success "Node.js $nodeVersion is already installed and meets requirements (v18+)"
            return
        } else {
            Write-Warning "Node.js $nodeVersion is installed but version 18+ is required"
        }
    }
    
    Write-Step "Installing Node.js LTS..."
    choco install nodejs-lts -y
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Test-Command "node") {
        $nodeVersion = node --version
        Write-Success "Node.js $nodeVersion installed successfully"
    } else {
        Write-Error "Failed to install Node.js"
        exit 1
    }
}

function Install-Git {
    Write-Step "Checking Git installation..."
    
    if (Test-Command "git") {
        $gitVersion = git --version
        Write-Success "Git is already installed: $gitVersion"
        return
    }
    
    Write-Step "Installing Git..."
    choco install git -y
    
    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (Test-Command "git") {
        $gitVersion = git --version
        Write-Success "Git installed successfully: $gitVersion"
    } else {
        Write-Error "Failed to install Git"
        exit 1
    }
}

function Install-ReactNativeCLI {
    Write-Step "Installing React Native CLI and Expo CLI..."
    
    # Install React Native CLI globally
    npm install -g @react-native-community/cli
    
    # Install Expo CLI globally
    npm install -g @expo/cli
    
    if (Test-Command "npx") {
        Write-Success "React Native CLI and Expo CLI installed successfully"
    } else {
        Write-Error "Failed to install React Native CLI"
        exit 1
    }
}

function Install-AndroidStudio {
    if ($SkipAndroid) {
        Write-Warning "Skipping Android Studio installation (--SkipAndroid flag provided)"
        return
    }
    
    Write-Step "Checking Android Studio installation..."
    
    $androidStudioPath = "${env:ProgramFiles}\Android\Android Studio\bin\studio64.exe"
    $androidStudioPathAlt = "${env:ProgramFiles(x86)}\Android\Android Studio\bin\studio64.exe"
    
    if ((Test-Path $androidStudioPath) -or (Test-Path $androidStudioPathAlt)) {
        Write-Success "Android Studio is already installed"
        return
    }
    
    Write-Step "Installing Android Studio..."
    choco install androidstudio -y
    
    Write-Warning "Android Studio has been installed. Please complete the setup manually:"
    Write-Host "1. Open Android Studio"
    Write-Host "2. Follow the setup wizard"
    Write-Host "3. Install Android SDK (API 34+)"
    Write-Host "4. Create an Android Virtual Device (AVD)"
    Write-Host "5. Set up ANDROID_HOME environment variable"
}

function Install-VSCode {
    if ($SkipVSCode) {
        Write-Warning "Skipping VS Code installation (--SkipVSCode flag provided)"
        return
    }
    
    Write-Step "Checking VS Code installation..."
    
    if (Test-Command "code") {
        Write-Success "VS Code is already installed"
    } else {
        Write-Step "Installing Visual Studio Code..."
        choco install vscode -y
        
        # Refresh PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    }
    
    Write-Step "Installing VS Code extensions..."
    
    $extensions = @(
        "msjsdiag.vscode-react-native",
        "dsznajder.es7-react-js-snippets",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "ms-vscode.vscode-typescript-next",
        "eamodio.gitlens",
        "rangav.vscode-thunder-client"
    )
    
    foreach ($extension in $extensions) {
        Write-Step "Installing extension: $extension"
        code --install-extension $extension --force
    }
    
    Write-Success "VS Code extensions installed successfully"
}

function Setup-EnvironmentVariables {
    Write-Step "Setting up environment variables..."
    
    # Create .env.example file
    $envExample = @"
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
"@
    
    Set-Content -Path ".env.example" -Value $envExample
    Write-Success "Created .env.example file"
}

function Create-ProjectScripts {
    Write-Step "Creating package.json with development scripts..."
    
    $packageJson = @"
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
"@
    
    Set-Content -Path "package.json" -Value $packageJson
    Write-Success "Created package.json with development scripts"
}

function Test-Installation {
    Write-Step "Testing installation..."
    
    $success = $true
    
    # Test Node.js
    if (Test-Command "node") {
        $nodeVersion = node --version
        Write-Success "✓ Node.js: $nodeVersion"
    } else {
        Write-Error "✗ Node.js not found"
        $success = $false
    }
    
    # Test npm
    if (Test-Command "npm") {
        $npmVersion = npm --version
        Write-Success "✓ npm: v$npmVersion"
    } else {
        Write-Error "✗ npm not found"
        $success = $false
    }
    
    # Test Git
    if (Test-Command "git") {
        $gitVersion = git --version
        Write-Success "✓ Git: $gitVersion"
    } else {
        Write-Error "✗ Git not found"
        $success = $false
    }
    
    # Test React Native CLI
    try {
        $rnVersion = npx react-native --version 2>$null
        Write-Success "✓ React Native CLI available"
    } catch {
        Write-Error "✗ React Native CLI not found"
        $success = $false
    }
    
    # Test Expo CLI
    try {
        $expoVersion = npx expo --version 2>$null
        Write-Success "✓ Expo CLI available"
    } catch {
        Write-Error "✗ Expo CLI not found"
        $success = $false
    }
    
    if ($success) {
        Write-Success "🎉 All tools installed successfully!"
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor $InfoColor
        Write-Host "1. Complete Android Studio setup if not skipped"
        Write-Host "2. Run 'npx react-native doctor' to verify React Native setup"
        Write-Host "3. Create a test React Native project: 'npx react-native init TestApp'"
        Write-Host "4. Continue with Issue #3: Project Architecture & Monorepo Structure"
    } else {
        Write-Error "Some tools failed to install. Please check the errors above and try again."
        exit 1
    }
}

function Show-Help {
    Write-Host "Infinite Realty Hub - Development Environment Setup for Windows" -ForegroundColor $InfoColor
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor $InfoColor
    Write-Host "  .\setup-dev-env-windows.ps1 [options]"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $InfoColor
    Write-Host "  -SkipAndroid    Skip Android Studio installation"
    Write-Host "  -SkipVSCode     Skip VS Code installation"
    Write-Host "  -Verbose        Show verbose output"
    Write-Host "  -Help           Show this help message"
    Write-Host ""
    Write-Host "This script will install:" -ForegroundColor $InfoColor
    Write-Host "  • Chocolatey package manager"
    Write-Host "  • Node.js LTS (v18+)"
    Write-Host "  • Git"
    Write-Host "  • React Native CLI"
    Write-Host "  • Expo CLI"
    Write-Host "  • Android Studio (unless skipped)"
    Write-Host "  • VS Code with React Native extensions (unless skipped)"
    Write-Host ""
}

# Main execution
Clear-Host
Write-Host "🏡 Infinite Realty Hub - Development Environment Setup" -ForegroundColor $InfoColor
Write-Host "=================================================" -ForegroundColor $InfoColor
Write-Host ""

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script requires administrator privileges. Please run PowerShell as Administrator."
    exit 1
}

try {
    Install-ChocoIfNeeded
    Install-NodeJS
    Install-Git
    Install-ReactNativeCLI
    Install-AndroidStudio
    Install-VSCode
    Setup-EnvironmentVariables
    Create-ProjectScripts
    Test-Installation
}
catch {
    Write-Error "An error occurred during setup: $($_.Exception.Message)"
    exit 1
}

Write-Host ""
Write-Host "🎉 Development environment setup completed successfully!" -ForegroundColor $SuccessColor
Write-Host "You can now start developing Infinite Realty Hub!" -ForegroundColor $SuccessColor
