# Infinite Realty Hub - Universal Setup Script
param([switch]$Help, [switch]$SkipAndroid, [switch]$SkipVSCode, [switch]$Verbose)

if ($Help) {
    Write-Host "Infinite Realty Hub - Development Environment Setup" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Cyan
    Write-Host "  .\setup-dev-env.ps1 [options]"
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Cyan
    Write-Host "  -SkipAndroid    Skip Android development tools"
    Write-Host "  -SkipVSCode     Skip VS Code installation"
    Write-Host "  -Verbose        Show detailed output"
    Write-Host "  -Help           Show this help"
    Write-Host ""
    Write-Host "INSTALLS:" -ForegroundColor Cyan
    Write-Host "   Node.js, React Native CLI, Expo CLI"
    Write-Host "   Git, VS Code with extensions"
    Write-Host "   Android Studio and SDK"
    Write-Host "   Docker, AWS CLI, Terraform"
    Write-Host ""
    exit 0
}

Write-Host " Detected platform: Windows" -ForegroundColor Cyan
Write-Host " Running Windows setup script..." -ForegroundColor Cyan

$setupScript = Join-Path $PSScriptRoot "scripts\setup-dev-env-windows-clean.ps1"
if (Test-Path $setupScript) {
    & $setupScript -SkipAndroid:$SkipAndroid -SkipVSCode:$SkipVSCode -Verbose:$Verbose
} else {
    Write-Host " Windows setup script not found at: $setupScript" -ForegroundColor Red
}
