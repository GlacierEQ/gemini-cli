# Script to set up a self-hosted GitHub Actions runner
# Run this script with administrator privileges

param (
    [string]$RunnerName = "$($env:COMPUTERNAME)-runner",
    [string]$RunnerGroup = "Default",
    [string]$RunnerLabels = "self-hosted,Windows,X64",
    [string]$RunnerWorkFolder = "_work",
    [switch]$ConfigureOnly = $false,
    [switch]$Uninstall = $false
)

# Configuration
$GitHubRepo = "GlacierEQ/gemini-cli"
$RunnerVersion = "2.326.0"
$RunnerUrl = "https://github.com/$GitHubRepo"
$RunnerDir = "C:\\actions-runner"
$ServiceName = "GitHubActionsRunner"

# Function to check if running as administrator
function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if running as administrator
if (-not (Test-Administrator)) {
    Write-Error "This script must be run as an administrator"
    exit 1
}

if ($Uninstall) {
    Write-Host "Uninstalling GitHub Actions Runner..." -ForegroundColor Yellow
    
    # Stop and remove service if it exists
    if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        sc.exe delete $ServiceName | Out-Null
        Write-Host "Removed service $ServiceName" -ForegroundColor Green
    }
    
    # Remove runner directory if it exists
    if (Test-Path $RunnerDir) {
        Remove-Item -Path $RunnerDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "Removed runner directory: $RunnerDir" -ForegroundColor Green
    }
    
    Write-Host "GitHub Actions Runner has been uninstalled." -ForegroundColor Green
    exit 0
}

# Create runner directory if it doesn't exist
if (-not (Test-Path $RunnerDir)) {
    New-Item -ItemType Directory -Path $RunnerDir | Out-Null
    Write-Host "Created runner directory: $RunnerDir" -ForegroundColor Green
}

# Download and extract the runner
if (-not $ConfigureOnly) {
    Write-Host "Downloading GitHub Actions Runner..." -ForegroundColor Cyan
    $zipPath = "$env:TEMP\actions-runner-win-x64-$RunnerVersion.zip"
    $downloadUrl = "https://github.com/actions/runner/releases/download/v$RunnerVersion/actions-runner-win-x64-$RunnerVersion.zip"
    
    # Download the runner
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath
    
    # Verify checksum
    $expectedHash = "539d48815f8ecda6903755025d5b578f919a32692b731d85a9a24419fe4dbd9e"
    $actualHash = (Get-FileHash -Path $zipPath -Algorithm SHA256).Hash
    
    if ($actualHash -ne $expectedHash) {
        Write-Error "Checksum verification failed. Expected: $expectedHash, Actual: $actualHash"
        exit 1
    }
    
    Write-Host "Extracting GitHub Actions Runner..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $RunnerDir -Force
    Remove-Item -Path $zipPath -Force
    
    Write-Host "GitHub Actions Runner downloaded and extracted successfully." -ForegroundColor Green
}

# Configure the runner
Write-Host "Configuring GitHub Actions Runner..." -ForegroundColor Cyan

# Get the registration token from GitHub API
$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "token $env:GITHUB_PAT"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$registrationUrl = "https://api.github.com/repos/$GitHubRepo/actions/runners/registration-token"
$response = Invoke-RestMethod -Uri $registrationUrl -Method Post -Headers $headers
$token = $response.token

# Run the configuration
Push-Location $RunnerDir

# Configure the runner
$configArgs = @(
    ".\config.cmd",
    "--url", $RunnerUrl,
    "--token", $token,
    "--name", $RunnerName,
    "--work", $RunnerWorkFolder,
    "--labels", $RunnerLabels,
    "--unattended",
    "--replace"
)

if ($RunnerGroup) {
    $configArgs += @("--runnergroup", $RunnerGroup)
}

Start-Process -FilePath "cmd.exe" -ArgumentList "/c", ($configArgs -join " ") -NoNewWindow -Wait

# Install the service
Write-Host "Installing GitHub Actions Runner as a service..." -ForegroundColor Cyan
.\svc install $env:USERNAME
.\svc start

Pop-Location

Write-Host "`nGitHub Actions Runner setup completed successfully!" -ForegroundColor Green
Write-Host "Runner Name: $RunnerName" -ForegroundColor Cyan
Write-Host "Runner Group: $RunnerGroup" -ForegroundColor Cyan
Write-Host "Runner Labels: $RunnerLabels" -ForegroundColor Cyan
Write-Host "Working Directory: $RunnerDir\$RunnerWorkFolder" -ForegroundColor Cyan
Write-Host "`nTo uninstall the runner, run this script with the -Uninstall parameter" -ForegroundColor Yellow
