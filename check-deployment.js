#!/usr/bin/env node

/**
 * Deployment Status Checker
 * Checks the current deployment status and provides next steps
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getPackageInfo() {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
      repository: packageJson.repository?.url
    };
  } catch {
    return null;
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    return {
      clean: status.trim() === '',
      branch,
      hasUncommitted: status.trim() !== ''
    };
  } catch {
    return null;
  }
}

function checkEnvironmentVariables() {
  const required = ['GITHUB_PAT'];
  const optional = ['NPM_TOKEN', 'SLACK_WEBHOOK_URL'];
  
  const results = {
    required: {},
    optional: {}
  };
  
  required.forEach(env => {
    results.required[env] = !!process.env[env];
  });
  
  optional.forEach(env => {
    results.optional[env] = !!process.env[env];
  });
  
  return results;
}

async function main() {
  log('🚀 Gemini CLI Deployment Status Check', 'cyan');
  log('=====================================', 'cyan');
  
  // Check package info
  const packageInfo = getPackageInfo();
  if (packageInfo) {
    log(`📦 Package: ${packageInfo.name}`, 'blue');
    log(`📋 Version: ${packageInfo.version}`, 'blue');
    log(`🔗 Repository: ${packageInfo.repository || 'Not specified'}`, 'blue');
  } else {
    log('❌ Could not read package.json', 'red');
    return;
  }
  
  console.log();
  
  // Check prerequisites
  log('🔍 Checking Prerequisites...', 'yellow');
  
  const nodeInstalled = checkCommand('node --version');
  const npmInstalled = checkCommand('npm --version');
  const gitInstalled = checkCommand('git --version');
  
  log(`Node.js: ${nodeInstalled ? '✅' : '❌'}`, nodeInstalled ? 'green' : 'red');
  log(`npm: ${npmInstalled ? '✅' : '❌'}`, npmInstalled ? 'green' : 'red');
  log(`Git: ${gitInstalled ? '✅' : '❌'}`, gitInstalled ? 'green' : 'red');
  
  console.log();
  
  // Check Git status
  log('📊 Git Status...', 'yellow');
  const gitStatus = checkGitStatus();
  if (gitStatus) {
    log(`Branch: ${gitStatus.branch}`, 'blue');
    log(`Working directory: ${gitStatus.clean ? '✅ Clean' : '⚠️  Has uncommitted changes'}`, 
        gitStatus.clean ? 'green' : 'yellow');
  } else {
    log('❌ Not a Git repository or Git not available', 'red');
  }
  
  console.log();
  
  // Check environment variables
  log('🔐 Environment Variables...', 'yellow');
  const envVars = checkEnvironmentVariables();
  
  Object.entries(envVars.required).forEach(([key, value]) => {
    log(`${key}: ${value ? '✅' : '❌'}`, value ? 'green' : 'red');
  });
  
  Object.entries(envVars.optional).forEach(([key, value]) => {
    log(`${key}: ${value ? '✅' : '⚠️  Not set'}`, value ? 'green' : 'yellow');
  });
  
  console.log();
  
  // Check CI/CD files
  log('⚙️  CI/CD Configuration...', 'yellow');
  const ciFiles = [
    '.github/workflows/enhanced-ci.yml',
    'scripts/setup-self-hosted-runner.ps1',
    'deploy.ps1'
  ];
  
  ciFiles.forEach(file => {
    const exists = existsSync(file);
    log(`${file}: ${exists ? '✅' : '❌'}`, exists ? 'green' : 'red');
  });
  
  console.log();
  
  // Provide recommendations
  log('💡 Next Steps:', 'cyan');
  
  const allPrereqsMet = nodeInstalled && npmInstalled && gitInstalled;
  const hasRequiredEnvVars = Object.values(envVars.required).every(v => v);
  
  if (!allPrereqsMet) {
    log('1. Install missing prerequisites (Node.js, npm, Git)', 'yellow');
  }
  
  if (!hasRequiredEnvVars) {
    log('2. Set required environment variables:', 'yellow');
    log('   $env:GITHUB_PAT = "your_github_token"', 'blue');
  }
  
  if (gitStatus?.hasUncommitted) {
    log('3. Commit or stash uncommitted changes', 'yellow');
  }
  
  if (allPrereqsMet && hasRequiredEnvVars) {
    log('✅ Ready for deployment!', 'green');
    log('Run: .\\deploy.ps1 -Action check', 'blue');
  }
  
  console.log();
  log('📚 For detailed instructions, see DEPLOYMENT.md', 'cyan');
}

main().catch(console.error);