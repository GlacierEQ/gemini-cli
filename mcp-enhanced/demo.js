#!/usr/bin/env node
/**
 * Enhanced MCP Library Demo
 * Showcases military-grade capabilities
 */

import EnhancedMCP, { quickGitHub, quickSlack, quickWorkflow } from './index.js';
import chalk from 'chalk';

async function runDemo() {
  console.log(chalk.red.bold('🔥 ENHANCED MCP DEMO 🔥'));
  console.log(chalk.cyan('═══════════════════════════════════'));

  // Initialize MCP
  const mcp = new EnhancedMCP({
    maxConnections: 100,
    timeout: 60000
  });

  try {
    // Demo 1: Basic tool execution
    console.log(chalk.yellow('\n📁 Demo 1: File System Operations'));
    const fileResult = await mcp.executeTool('filesystem', {
      operation: 'analyze',
      path: './package.json'
    });
    console.log(chalk.green('✅ File analysis:'), fileResult);

    // Demo 2: Workflow execution
    console.log(chalk.yellow('\n🔄 Demo 2: Security Audit Workflow'));
    const auditResult = await mcp.executeWorkflow('security_audit', {
      target: './src',
      outputPath: './security-report.json'
    });
    console.log(chalk.green('✅ Security audit completed:'), auditResult.id);

    // Demo 3: Parallel execution
    console.log(chalk.yellow('\n⚡ Demo 3: Parallel Task Execution'));
    const parallelTasks = [
      { tool: 'filesystem', args: { operation: 'exists', path: './README.md' } },
      { tool: 'web', args: { operation: 'monitor', url: 'https://api.github.com' } },
      { tool: 'security', args: { operation: 'scan', target: './package.json' } }
    ];

    const parallelResults = await mcp.parallel(parallelTasks);
    console.log(chalk.green('✅ Parallel execution results:'));
    parallelResults.forEach((result, i) => {
      console.log(`  Task ${i + 1}: ${result.status}`);
    });

    // Demo 4: Custom workflow creation
    console.log(chalk.yellow('\n🛠️ Demo 4: Custom Workflow Creation'));
    await mcp.createWorkflow('custom_deploy', [
      { tool: 'git', operation: 'status' },
      { tool: 'filesystem', operation: 'analyze', args: { path: './dist' } },
      { server: 'aws', tool: 's3_upload', args: { bucket: 'my-app' } },
      { server: 'slack', tool: 'send_message', args: { channel: '#deployments' } }
    ]);
    console.log(chalk.green('✅ Custom workflow created: custom_deploy'));

    // Demo 5: Quick operations
    console.log(chalk.yellow('\n🚀 Demo 5: Quick Operations'));
    
    // Quick GitHub operation (if token available)
    if (process.env.GITHUB_TOKEN) {
      const repos = await quickGitHub('list_repos', { user: 'octocat' });
      console.log(chalk.green('✅ GitHub repos fetched:'), repos.length || 'Demo mode');
    }

    // Quick Slack operation (if token available)
    if (process.env.SLACK_TOKEN) {
      const channels = await quickSlack('list_channels', {});
      console.log(chalk.green('✅ Slack channels fetched:'), channels.length || 'Demo mode');
    }

    // Demo 6: Status and monitoring
    console.log(chalk.yellow('\n📊 Demo 6: System Status'));
    const status = mcp.getStatus();
    console.log(chalk.green('✅ MCP Status:'));
    console.log(`  Initialized: ${status.initialized}`);
    console.log(`  Active Jobs: ${status.activeJobs.length}`);
    console.log(`  Workflows: ${status.workflows.length}`);
    console.log(`  Uptime: ${Math.round(status.uptime)}s`);

    // Demo 7: Report generation
    console.log(chalk.yellow('\n📋 Demo 7: Report Generation'));
    const report = await mcp.orchestrator.generateReport();
    console.log(chalk.green('✅ System Report:'));
    console.log(`  Success Rate: ${report.statistics.success_rate.toFixed(1)}%`);
    console.log(`  Available Tools: ${report.tools.length}`);
    console.log(`  Connected Servers: ${report.servers.length}`);

    console.log(chalk.green.bold('\n🎯 DEMO COMPLETED SUCCESSFULLY'));

  } catch (error) {
    console.error(chalk.red('❌ Demo failed:'), error.message);
  }
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export default runDemo;