#!/usr/bin/env node
/**
 * Enhanced development workflow for Gemini CLI
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';

const commands = {
  setup: () => {
    console.log('🚀 Setting up Gemini CLI...');
    runCommand('npm', ['ci']);
    runCommand('npm', ['run', 'build:all']);
  },
  
  dev: () => {
    console.log('🔧 Starting development mode...');
    runCommand('npm', ['run', 'start'], { stdio: 'inherit' });
  },
  
  test: () => {
    console.log('🧪 Running tests...');
    runCommand('npm', ['run', 'test:ci']);
  },
  
  lint: () => {
    console.log('🔍 Linting code...');
    runCommand('npm', ['run', 'lint:fix']);
  }
};

function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe', ...options });
    
    child.stdout?.on('data', (data) => process.stdout.write(data));
    child.stderr?.on('data', (data) => process.stderr.write(data));
    
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

const command = process.argv[2];
if (commands[command]) {
  commands[command]().catch(console.error);
} else {
  console.log('Available commands: setup, dev, test, lint');
}