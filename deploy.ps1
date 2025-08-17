#!/usr/bin/env pwsh
# Gemini CLI Deployment Script
# This script helps integrate and deploy the Gemini CLI project

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("check", "setup", "deploy", "runner")]
    [string]$Action = "check",
    
    [Parameter(Mandatory=$false)]
    [string]$Environment = "staging",
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

# Configuration
$RepoOwner = "GlacierEQ"
$RepoName = "gemini-cli"
$RequiredSecrets = @("NPM_TOKEN", "SLACK_WEBHOOK_URL")
$RequiredEnvVars = @("GITHUB_PAT")

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    $color = switch ($Type) {
        "Success" { "Green" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        default { "Cyan" }
    }
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..." "Info"
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Status "Node.js version: $nodeVersion" "Success"
    } catch {
        Write-Status "Node.js is not installed or not in PATH" "Error"
        return $false
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version
        Write-Status "npm version: $npmVersion" "Success"
    } catch {
        Write-Status "npm is not installed or not in PATH" "Error"
        return $false
    }
    
    # Check if git is installed
    try {
        $gitVersion = git --version
        Write-Status "Git version: $gitVersion" "Success"
    } catch {
        Write-Status "Git is not installed or not in PATH" "Error"
        return $false
    }
    
    return $true
}

function Test-GitHubSecrets {
    Write-Status "Checking GitHub repository secrets..." "Info"
    
    if (-not $env:GITHUB_PAT) {
        Write-Status "GITHUB_PAT environment variable is not set" "Error"
        Write-Status "Please set your GitHub Personal Access Token:" "Warning"
        Write-Status "`$env:GITHUB_PAT = 'your_token_here'" "Warning"
        return $false
    }
    
    # Test GitHub API access
    try {
        $headers = @{
            "Authorization" = "token $env:GITHUB_PAT"
            "Accept" = "application/vnd.github+json"
        }
        
        $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$RepoOwner/$RepoName" -Headers $headers
        Write-Status "GitHub API access: OK" "Success"
        Write-Status "Repository: $($response.full_name)" "Info"
    } catch {
        Write-Status "Failed to access GitHub API: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

function Install-Dependencies {
    Write-Status "Installing dependencies..." "Info"
    
    try {
        npm ci
        Write-Status "Dependencies installed successfully" "Success"
    } catch {
        Write-Status "Failed to install dependencies: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

function Test-Build {
    Write-Status "Testing build process..." "Info"
    
    try {
        npm run build
        Write-Status "Build completed successfully" "Success"
    } catch {
        Write-Status "Build failed: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

function Test-Linting {
    Write-Status "Running linting checks..." "Info"
    
    try {
        npm run lint:ci
        Write-Status "Linting passed" "Success"
    } catch {
        Write-Status "Linting failed: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

function Test-TypeCheck {
    Write-Status "Running type checks..." "Info"
    
    try {
        npm run typecheck
        Write-Status "Type checking passed" "Success"
    } catch {
        Write-Status "Type checking failed: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

function Start-Deployment {
    param([string]$Environment)
    
    Write-Status "Starting deployment to $Environment..." "Info"
    
    # Create a new tag for deployment
    $version = (Get-Content package.json | ConvertFrom-Json).version
    $tagName = "v$version"
    
    Write-Status "Creating tag: $tagName" "Info"
    
    try {
        git tag $tagName
        git push origin $tagName
        Write-Status "Tag created and pushed successfully" "Success"
        Write-Status "GitHub Actions will handle the deployment automatically" "Info"
    } catch {
        Write-Status "Failed to create/push tag: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

function Setup-SelfHostedRunner {
    Write-Status "Setting up self-hosted runner..." "Info"
    
    if (-not (Test-Path "scripts/setup-self-hosted-runner.ps1")) {
        Write-Status "Self-hosted runner script not found" "Error"
        return $false
    }
    
    try {
        & "scripts/setup-self-hosted-runner.ps1" -RunnerName "$env:COMPUTERNAME-gemini-runner"
        Write-Status "Self-hosted runner setup completed" "Success"
    } catch {
        Write-Status "Failed to setup self-hosted runner: $($_.Exception.Message)" "Error"
        return $false
    }
    
    return $true
}

# Main execution
Write-Status "Gemini CLI Integration & Deployment Tool" "Info"
Write-Status "Action: $Action" "Info"

switch ($Action) {
    "check" {
        Write-Status "Running comprehensive checks..." "Info"
        
        $allPassed = $true
        
        if (-not (Test-Prerequisites)) { $allPassed = $false }
        if (-not (Test-GitHubSecrets)) { $allPassed = $false }
        if (-not (Install-Dependencies)) { $allPassed = $false }
        if (-not (Test-Linting)) { $allPassed = $false }
        if (-not (Test-TypeCheck)) { $allPassed = $false }
        if (-not (Test-Build)) { $allPassed = $false }
        
        if ($allPassed) {
            Write-Status "All checks passed! Ready for deployment." "Success"
            Write-Status "Next steps:" "Info"
            Write-Status "1. Run: .\deploy.ps1 -Action setup" "Info"
            Write-Status "2. Run: .\deploy.ps1 -Action deploy -Environment staging" "Info"
        } else {
            Write-Status "Some checks failed. Please fix the issues above." "Error"
        }
    }
    
    "setup" {
        Write-Status "Setting up deployment environment..." "Info"
        
        if (Test-Prerequisites -and Test-GitHubSecrets) {
            Write-Status "Environment setup completed successfully" "Success"
            Write-Status "You can now run deployments" "Info"
        } else {
            Write-Status "Setup failed. Please check the errors above." "Error"
        }
    }
    
    "deploy" {
        Write-Status "Deploying to $Environment..." "Info"
        
        if (Start-Deployment -Environment $Environment) {
            Write-Status "Deployment initiated successfully" "Success"
            Write-Status "Check GitHub Actions for deployment status" "Info"
        } else {
            Write-Status "Deployment failed" "Error"
        }
    }
    
    "runner" {
        if (Setup-SelfHostedRunner) {
            Write-Status "Self-hosted runner setup completed" "Success"
        } else {
            Write-Status "Self-hosted runner setup failed" "Error"
        }
    }
}