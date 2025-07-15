# Infinite Realty Hub - Windows Development Environment Setup Script
# This script automates the setup of the complete React Native development environment

param(
    [switch]$SkipAndroid = $false,
    [switch]$SkipVSCode = $false,
    [switch]$Verbose = $false
)

function Write-Step {
    param([string]$Message)
    Write-Host "🔧 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️ $Message" -ForegroundColor Yellow
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

function Refresh-Environment {
    $machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = "$machinePath;$userPath"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host " Windows Development Environment Setup" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

Write-Step "Starting development environment setup for Windows..."

# Install Chocolatey if not present
Write-Step "Checking Chocolatey package manager..."
if (!(Test-Command "choco")) {
    Write-Step "Installing Chocolatey package manager..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    Refresh-Environment
    
    if (Test-Command "choco") {
        Write-Success "Chocolatey installed successfully"
    } else {
        Write-Error "Failed to install Chocolatey. Please install manually and re-run this script."
        exit 1
    }
} else {
    Write-Success "Chocolatey already installed"
}

# Install Node.js
Write-Step "Checking Node.js installation..."
if (!(Test-Command "node")) {
    Write-Step "Installing Node.js..."
    choco install nodejs -y
    Refresh-Environment
    
    if (Test-Command "node") {
        $nodeVersion = node --version
        Write-Success "Node.js installed: $nodeVersion"
    } else {
        Write-Error "Failed to install Node.js"
    }
} else {
    $nodeVersion = node --version
    Write-Success "Node.js already installed: $nodeVersion"
}

# Install Git
Write-Step "Checking Git installation..."
if (!(Test-Command "git")) {
    Write-Step "Installing Git..."
    choco install git -y
    Refresh-Environment
    
    if (Test-Command "git") {
        $gitVersion = git --version
        Write-Success "Git installed: $gitVersion"
    } else {
        Write-Error "Failed to install Git"
    }
} else {
    $gitVersion = git --version
    Write-Success "Git already installed: $gitVersion"
}

# Install React Native CLI and Expo CLI
Write-Step "Installing React Native CLI and Expo CLI..."
if (Test-Command "npm") {
    npm install -g @react-native-community/cli
    npm install -g @expo/cli
    Write-Success "React Native CLI and Expo CLI installed"
} else {
    Write-Error "npm not available - Node.js installation may have failed"
}

# Android development tools
if (-not $SkipAndroid) {
    Write-Step "Installing Java Development Kit..."
    choco install openjdk17 -y
    
    Write-Step "Installing Android Studio..."
    choco install androidstudio -y
    
    Write-Success "Android development tools installed"
    Write-Warning "Please open Android Studio and complete the setup wizard to install Android SDK"
} else {
    Write-Warning "Skipping Android development tools installation"
}

# VS Code installation
if (-not $SkipVSCode) {
    Write-Step "Checking VS Code installation..."
    if (!(Test-Command "code")) {
        Write-Step "Installing VS Code..."
        choco install vscode -y
        Refresh-Environment
        
        if (Test-Command "code") {
            Write-Success "VS Code installed successfully"
        } else {
            Write-Error "Failed to install VS Code"
        }
    } else {
        Write-Success "VS Code already installed"
    }
    
    # Install essential extensions
    Write-Step "Installing VS Code extensions..."
    $extensions = @(
        "msjsdiag.vscode-react-native",
        "dsznajder.es7-react-js-snippets",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-eslint",
        "eamodio.gitlens"
    )
    
    foreach ($extension in $extensions) {
        Write-Step "Installing extension: $extension"
        code --install-extension $extension
    }
    Write-Success "VS Code extensions installed"
} else {
    Write-Warning "Skipping VS Code installation"
}

# Docker
Write-Step "Installing Docker Desktop..."
choco install docker-desktop -y

# AWS CLI
Write-Step "Installing AWS CLI..."
choco install awscli -y

# Terraform
Write-Step "Installing Terraform..."
choco install terraform -y

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Windows Setup Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Installed tools versions:" -ForegroundColor Cyan
Refresh-Environment
if (Test-Command "node") { Write-Host "Node.js: $(node --version)" }
if (Test-Command "npm") { Write-Host "npm: $(npm --version)" }
if (Test-Command "git") { Write-Host "Git: $(git --version)" }
if (Test-Command "docker") { Write-Host "Docker: $(docker --version)" }
if (Test-Command "aws") { Write-Host "AWS CLI: $(aws --version)" }
if (Test-Command "terraform") { Write-Host "Terraform: $(terraform --version)" }

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your terminal to pick up environment changes"
Write-Host "2. If you installed Android Studio, open it and complete the setup wizard"
Write-Host "3. Clone the project repository: git clone https://github.com/InfiniteParallelStudios/infinite-realty-hub.git"
Write-Host "4. Run 'npm install' in the project directory"
Write-Host "5. Follow the project README for additional setup steps"
