# Infinite Realty Hub - Universal Development Environment Setup Script
# This script automatically detects the platform and runs the appropriate setup

param(
    [switch]$SkipAndroid = $false,
    [switch]$SkipVSCode = $false,
    [switch]$Verbose = $false,
    [switch]$Help = $false
)

function Show-Help {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host " Infinite Realty Hub - Development Environment Setup" -ForegroundColor Magenta
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "DESCRIPTION:" -ForegroundColor Cyan
    Write-Host "  Automatically sets up the complete React Native development environment"
    Write-Host "  for the Infinite Realty Hub project. Detects your platform and installs"
    Write-Host "  all required tools, dependencies, and configurations."
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Cyan
    Write-Host "  PowerShell (Windows/Cross-platform):"
    Write-Host "    .\setup-dev-env.ps1 [options]"
    Write-Host ""
    Write-Host "  Bash (macOS/Linux):"
    Write-Host "    chmod +x setup-dev-env.sh"
    Write-Host "    ./setup-dev-env.sh [options]"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Cyan
    Write-Host "  -SkipAndroid    Skip Android development tools installation"
    Write-Host "  -SkipVSCode     Skip VS Code and extensions installation"
    Write-Host "  -Verbose        Show detailed output during installation"
    Write-Host "  -Help           Show this help message"
    Write-Host ""
    Write-Host "WHAT GETS INSTALLED:" -ForegroundColor Cyan
    Write-Host "  • Node.js (via Node Version Manager)"
    Write-Host "  • React Native CLI and Expo CLI"
    Write-Host "  • Git (if not already installed)"
    Write-Host "  • VS Code with recommended extensions"
    Write-Host "  • Android Studio and SDK (unless -SkipAndroid)"
    Write-Host "  • Java Development Kit (JDK 17)"
    Write-Host "  • Platform-specific package managers (Chocolatey/Homebrew)"
    Write-Host "  • Docker Desktop"
    Write-Host "  • AWS CLI and Terraform"
    Write-Host ""
    Write-Host "REQUIREMENTS:" -ForegroundColor Yellow
    Write-Host "  • Administrator/sudo privileges for installations"
    Write-Host "  • Active internet connection"
    Write-Host "  • Windows 10+ / macOS 10.15+ / Ubuntu 18.04+"
    Write-Host ""
    Write-Host "For more information, visit:" -ForegroundColor Cyan
    Write-Host "  https://github.com/InfiniteParallelStudios/infinite-realty-hub"
    Write-Host ""
}

function Get-Platform {
    if ($IsWindows -or $env:OS -eq "Windows_NT") {
        return "Windows"
    }
    elseif ($IsMacOS) {
        return "macOS"
    }
    elseif ($IsLinux) {
        return "Linux"
    }
    else {
        return "Windows"  # Default assumption for older PowerShell versions
    }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

try {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Magenta
    Write-Host " Infinite Realty Hub - Development Environment Setup" -ForegroundColor Magenta
    Write-Host "============================================================" -ForegroundColor Magenta
    
    # Detect platform
    $platform = Get-Platform
    Write-Host "🔧 Detected platform: $platform" -ForegroundColor Cyan
    
    # Check for admin privileges on Windows
    if ($platform -eq "Windows") {
        $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
        $isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if (-not $isAdmin) {
            Write-Host "⚠️ This script requires Administrator privileges on Windows." -ForegroundColor Yellow
            Write-Host "Please restart PowerShell as Administrator and run this script again." -ForegroundColor Yellow
            Write-Host "Right-click PowerShell -> 'Run as Administrator'" -ForegroundColor Cyan
            exit 1
        }
    }
    
    # Run platform-specific setup
    $scriptPath = Join-Path $PSScriptRoot "scripts"
    
    if ($platform -eq "Windows") {
        $setupScript = Join-Path $scriptPath "setup-dev-env-windows.ps1"
        Write-Host "🔧 Running Windows setup script..." -ForegroundColor Cyan
        
        if (Test-Path $setupScript) {
            & $setupScript -SkipAndroid:$SkipAndroid -SkipVSCode:$SkipVSCode -Verbose:$Verbose
        } else {
            Write-Host "❌ Windows setup script not found at: $setupScript" -ForegroundColor Red
            Write-Host "Please ensure all setup files are present." -ForegroundColor Yellow
            exit 1
        }
    } else {
        $setupScript = Join-Path $scriptPath "setup-dev-env-macos.sh"
        Write-Host "🔧 Running $platform setup script..." -ForegroundColor Cyan
        
        if (Test-Path $setupScript) {
            chmod +x $setupScript 2>$null
            if ($SkipAndroid) { $env:SKIP_ANDROID = "true" }
            if ($SkipVSCode) { $env:SKIP_VSCODE = "true" }
            if ($Verbose) { $env:VERBOSE = "true" }
            & bash $setupScript
        } else {
            Write-Host "❌ Setup script not found at: $setupScript" -ForegroundColor Red
            Write-Host "Please ensure all setup files are present." -ForegroundColor Yellow
            exit 1
        }
    }
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " Setup Complete!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Restart your terminal/IDE to pick up environment changes"
    Write-Host "2. Clone the project repository if you haven't already"
    Write-Host "3. Run 'npm install' in the project root"
    Write-Host "4. Follow the README.md for project-specific setup"
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "❌ An unexpected error occurred: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please report this issue on the project's GitHub repository." -ForegroundColor Yellow
    exit 1
}
