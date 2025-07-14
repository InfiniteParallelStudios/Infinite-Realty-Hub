# Infinite Realty Hub - Windows Development Environment Setup Script
param([switch]$SkipAndroid, [switch]$SkipVSCode, [switch]$Verbose)

function Write-Step { param([string]$Message); Write-Host " $Message" -ForegroundColor Cyan }
function Write-Success { param([string]$Message); Write-Host " $Message" -ForegroundColor Green }
function Write-Error { param([string]$Message); Write-Host " $Message" -ForegroundColor Red }
function Write-Warning { param([string]$Message); Write-Host " $Message" -ForegroundColor Yellow }

function Test-Command {
    param([string]$Command)
    try { Get-Command $Command -ErrorAction Stop | Out-Null; return $true }
    catch { return $false }
}

Write-Host "============================================================" -ForegroundColor Magenta
Write-Host " Infinite Realty Hub - Development Environment Setup" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta

Write-Step "Starting development environment setup for Windows..."

# Check admin privileges
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Warning "This script requires Administrator privileges."
    Write-Host "Please restart PowerShell as Administrator and run this script again." -ForegroundColor Yellow
    exit 1
}

# Install Chocolatey if needed
Write-Step "Checking Chocolatey package manager..."
if (!(Test-Command "choco")) {
    Write-Step "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString("https://community.chocolatey.org/install.ps1"))
    
    $machPath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = "$machPath;$userPath"
    
    if (Test-Command "choco") { Write-Success "Chocolatey installed successfully" }
    else { Write-Error "Failed to install Chocolatey"; exit 1 }
} else {
    Write-Success "Chocolatey already installed"
}

# Install Node.js
Write-Step "Checking Node.js installation..."
if (!(Test-Command "node")) {
    Write-Step "Installing Node.js..."
    choco install nodejs -y
    
    $machPath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = "$machPath;$userPath"
    
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
    
    $machPath = [System.Environment]::GetEnvironmentVariable("Path","Machine")
    $userPath = [System.Environment]::GetEnvironmentVariable("Path","User")
    $env:Path = "$machPath;$userPath"
    
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

# Install React Native CLI
Write-Step "Installing React Native CLI..."
if (Test-Command "npm") {
    npm install -g "@react-native-community/cli"
    npm install -g "@expo/cli"
    Write-Success "React Native CLI and Expo CLI installed"
} else {
    Write-Error "npm not available - Node.js installation may have failed"
}

Write-Host "============================================================" -ForegroundColor Green
Write-Host " Core Development Environment Setup Complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your terminal to pick up environment changes"
Write-Host "2. Clone the project repository"
Write-Host "3. Run npm install in the project directory"

Write-Host "Installed tools versions:" -ForegroundColor Cyan
if (Test-Command "node") { Write-Host "Node.js: $(node --version)" }
if (Test-Command "npm") { Write-Host "npm: $(npm --version)" }
if (Test-Command "git") { Write-Host "Git: $(git --version)" }
