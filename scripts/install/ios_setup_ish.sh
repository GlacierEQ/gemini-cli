#!/bin/sh
# 🍏 iOS iSh Setup Script for Gemini CLI
# This script automates the installation of Gemini CLI in the iSh (Alpine Linux) environment.

echo "🍏 [iOS] Initializing Gemini CLI Setup for iSh..."

# 1. Update package manager
echo "📦 [1/4] Updating package index..."
apk update

# 2. Install core dependencies
echo "📦 [2/4] Installing nodejs, npm, python3, git, and build tools..."
apk add --no-cache nodejs npm python3 git curl bash make g++ py3-pip

# 3. Setup Project Environment
echo "🧬 [3/4] Scaffolding environment..."
mkdir -p ~/powerhouse/logs
mkdir -p ~/apex/mastermind/.shadow/cortex

# 4. Clone and Build (Optional if already cloned)
if [ ! -d "~/gemini-cli" ]; then
    echo "🛰️  Cloning repository..."
    # User will need to provide credentials or use SSH
    # git clone https://github.com/GlacierEQ/gemini-cli.git ~/gemini-cli
else
    cd ~/gemini-cli
    echo "🏗️  Installing NPM dependencies..."
    npm install --silent
    echo "🏗️  Building project..."
    npm run build
fi

echo "💎 [4/4] Installation Complete."
echo "🚀 Run 'npm start' to launch Gemini CLI."
echo "🌀 Note: iSh is an emulated environment. Performance may be slower than Termux."
