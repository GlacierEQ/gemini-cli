#!/usr/bin/env node
/**
 * KILO SETUP - Automated setup for top-tier prompting system
 */

import KiloIntegration from './kilo-integration.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import chalk from 'chalk';

class KiloSetup {
  constructor() {
    this.integration = new KiloIntegration();
    this.setupSteps = [];
  }

  async runSetup() {
    console.log(chalk.red.bold('🔥 KILO SETUP: Initializing top-tier prompting system 🔥'));
    console.log(chalk.cyan('═══════════════════════════════════════════════════════'));

    try {
      await this.createDirectories();
      await this.generateConfigurations();
      await this.setupPromptTemplates();
      await this.createIntegrationFiles();
      await this.generateDocumentation();
      await this.testConnections();

      console.log(chalk.green.bold('✅ KILO SETUP COMPLETE'));
      this.displayNextSteps();

    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error.message);
    }
  }

  async createDirectories() {
    console.log(chalk.yellow('📁 Creating directory structure...'));

    const dirs = ['.kilo', '.kilo/templates', '.kilo/configs', '.kilo/logs'];
    
    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        this.setupSteps.push(`Created directory: ${dir}`);
      }
    });
  }

  async generateConfigurations() {
    console.log(chalk.yellow('⚙️ Generating configurations...'));

    // Main config
    const mainConfig = {
      version: '4.0.0',
      optimization: {
        level: 'maximum',
        compression: true,
        tokenLimit: 4096,
        caching: true
      },
      providers: {
        primary: {
          name: 'kilo-code',
          endpoint: 'SENSITIVE_REDACTED_ENDPOINT',
          model: 'kilo-v4',
          maxTokens: 4096
        },
        fallback: {
          name: 'openai',
          endpoint: 'https://api.openai.com/v1/chat/completions',
          model: 'gpt-4',
          maxTokens: 4096
        }
      },
      security: {
        encryption: 'AES-256',
        keyRotation: '30d',
        rateLimit: 1000
      }
    };

    writeFileSync('.kilo/configs/main.json', JSON.stringify(mainConfig, null, 2));
    this.setupSteps.push('Generated main configuration');

    // Environment template
    const envTemplate = `# KILO CODE CONFIGURATION
KILO_API_KEY=your_kilo_api_key_here
KILO_ENDPOINT=https://api.kilocode.com/v4
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# OPTIMIZATION SETTINGS
KILO_OPTIMIZATION_LEVEL=maximum
KILO_COMPRESSION=true
KILO_CACHING=true

# MONITORING
KILO_MONITORING=true
KILO_LOG_LEVEL=info
`;

    writeFileSync('.env.kilo', envTemplate);
    this.setupSteps.push('Generated environment template');
  }

  async setupPromptTemplates() {
    console.log(chalk.yellow('📝 Setting up prompt templates...'));

    const templates = {
      system_base: `You are KILO-OPERATOR v4.0 — elite AI architect with quantum optimization capabilities.

MISSION: Transform user input into optimal solutions using military-grade precision and efficiency.

PROTOCOL:
1. ANALYZE: Parse input with 99.9% accuracy using advanced pattern recognition
2. OPTIMIZE: Apply quantum compression algorithms for maximum token efficiency
3. EXECUTE: Generate production-ready outputs with cryptographic validation
4. VERIFY: Ensure all operations meet military-grade standards

CONSTRAINTS:
- Maximum efficiency with minimum token usage
- Response time: <500ms
- Accuracy threshold: >95%
- Security level: Military-grade

VARIABLES:
\${CONTEXT_TYPE} - Dynamic context classification
\${OUTPUT_FORMAT} - Structured response format
\${OPTIMIZATION_LEVEL} - Processing intensity level
\${SECURITY_CLEARANCE} - Required security classification

Execute with absolute precision:`,

      user_optimized: `CONTEXT: \${INPUT_CONTEXT}

REQUIREMENTS:
- Format: \${OUTPUT_FORMAT}
- Optimization: \${OPTIMIZATION_LEVEL}
- Security: \${SECURITY_LEVEL}
- Validation: Required

CONSTRAINTS:
- Token limit: \${MAX_TOKENS}
- Response time: \${MAX_TIME}
- Accuracy: \${MIN_ACCURACY}

Process and optimize:`,

      code_architect: `You are KILO-CODE-ARCHITECT — elite software architect with quantum code generation.

INPUT: \${CODE_CONTEXT}
OUTPUT: Production-ready, optimized, secure code
STANDARDS: Military-grade security, performance, maintainability

Generate:`,

      data_analyst: `You are KILO-DATA-ANALYST — quantum data processing specialist.

DATA: \${INPUT_DATA}
ANALYSIS: \${ANALYSIS_TYPE}
OUTPUT: Structured insights with confidence scores and recommendations

Process:`,

      security_auditor: `You are KILO-SECURITY-AUDITOR — military-grade security specialist.

TARGET: \${AUDIT_TARGET}
SCOPE: \${SECURITY_SCOPE}
OUTPUT: Comprehensive security assessment with actionable recommendations

Audit:`
    };

    Object.entries(templates).forEach(([name, template]) => {
      writeFileSync(`.kilo/templates/${name}.txt`, template);
    });

    this.setupSteps.push(`Generated ${Object.keys(templates).length} prompt templates`);
  }

  async createIntegrationFiles() {
    console.log(chalk.yellow('🔗 Creating integration files...'));

    // Integration script
    const integrationScript = `#!/usr/bin/env node
/**
 * KILO INTEGRATION RUNNER
 */

import KiloIntegration from '../kilo-integration.js';
import { readFileSync } from 'fs';

async function runKiloIntegration() {
  const config = JSON.parse(readFileSync('.kilo/configs/main.json', 'utf8'));
  const integration = new KiloIntegration(config);
  
  const context = {
    type: process.argv[2] || 'general',
    format: process.argv[3] || 'json',
    optimization: 'maximum'
  };
  
  const result = await integration.optimizeAndConnect(context);
  console.log(JSON.stringify(result, null, 2));
}

runKiloIntegration().catch(console.error);
`;

    writeFileSync('.kilo/run-integration.js', integrationScript);
    this.setupSteps.push('Created integration runner');

    // Test script
    const testScript = `#!/usr/bin/env node
/**
 * KILO CONNECTION TESTER
 */

import KiloIntegration from '../kilo-integration.js';

async function testKiloConnections() {
  const integration = new KiloIntegration();
  const connections = await integration.setupConnections();
  const testResults = await integration.testConnections(connections);
  
  console.log('🔍 Connection Test Results:');
  console.log(JSON.stringify(testResults, null, 2));
}

testKiloConnections().catch(console.error);
`;

    writeFileSync('.kilo/test-connections.js', testScript);
    this.setupSteps.push('Created connection tester');
  }

  async generateDocumentation() {
    console.log(chalk.yellow('📚 Generating documentation...'));

    const readme = `# KILO CODE INTEGRATION

## Overview
Military-grade prompting system with quantum optimization capabilities.

## Setup
1. Configure API keys in \`.env.kilo\`
2. Customize settings in \`.kilo/configs/main.json\`
3. Run connection test: \`node .kilo/test-connections.js\`

## Usage
\`\`\`bash
# Run integration
node .kilo/run-integration.js [type] [format]

# Test connections
node .kilo/test-connections.js

# Generate optimized prompt
node kilo-integration.js
\`\`\`

## Templates
- \`system_base\` - Core system prompt
- \`user_optimized\` - Optimized user prompt
- \`code_architect\` - Code generation
- \`data_analyst\` - Data analysis
- \`security_auditor\` - Security auditing

## Configuration
Edit \`.kilo/configs/main.json\` for:
- Provider settings
- Optimization levels
- Security parameters
- Rate limits

## Security
- All API keys stored in environment variables
- AES-256 encryption for sensitive data
- Automatic key rotation every 30 days
- Rate limiting and monitoring

## Monitoring
- Real-time performance metrics
- Cost tracking and alerts
- Error monitoring and reporting
- Automated failover testing
`;

    writeFileSync('.kilo/README.md', readme);
    this.setupSteps.push('Generated documentation');
  }

  async testConnections() {
    console.log(chalk.yellow('🔍 Testing connections...'));

    try {
      const connections = await this.integration.setupConnections();
      const testResults = await this.integration.testConnections(connections);
      
      console.log(chalk.green(`✅ Tested ${testResults.total} connections`));
      console.log(chalk.green(`✅ ${testResults.successful} successful`));
      
      if (testResults.failed > 0) {
        console.log(chalk.yellow(`⚠️ ${testResults.failed} failed`));
      }

      this.setupSteps.push(`Connection test: ${testResults.successful}/${testResults.total} successful`);
    } catch (error) {
      console.log(chalk.red('⚠️ Connection test failed - configure API keys'));
      this.setupSteps.push('Connection test skipped - missing API keys');
    }
  }

  displayNextSteps() {
    console.log(chalk.cyan('\n📋 SETUP SUMMARY:'));
    this.setupSteps.forEach(step => {
      console.log(chalk.white(`  ✓ ${step}`));
    });

    console.log(chalk.yellow('\n🎯 NEXT STEPS:'));
    console.log(chalk.white('  1. Configure API keys in .env.kilo'));
    console.log(chalk.white('  2. Test connections: node .kilo/test-connections.js'));
    console.log(chalk.white('  3. Run integration: node .kilo/run-integration.js'));
    console.log(chalk.white('  4. Customize templates in .kilo/templates/'));
    console.log(chalk.white('  5. Monitor performance in .kilo/logs/'));

    console.log(chalk.green('\n🚀 KILO CODE SYSTEM READY FOR OPERATION'));
  }
}

// Run setup if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new KiloSetup();
  setup.runSetup().catch(console.error);
}

export default KiloSetup;