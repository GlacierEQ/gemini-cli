# Maximize Gemini CLI Setup
Write-Host "Setting up Gemini CLI for maximum performance..."

# Install dependencies
npm ci

# Build the project
npm run build:all

# Set up environment variables
$env:GEMINI_API_KEY = Read-Host "Enter your Gemini API key (from https://aistudio.google.com/apikey)"
[Environment]::SetEnvironmentVariable("GEMINI_API_KEY", $env:GEMINI_API_KEY, "User")

# Test the CLI
Write-Host "Testing Gemini CLI..."
npm start

Write-Host "Setup complete! Use 'npm start' to run Gemini CLI"