#!/usr/bin/env node
/**
 * Quick scan and improve runner
 */

import SystemScanner from './system-scanner.js';
import AutoImprover from './auto-improver.js';
import chalk from 'chalk';

async function runQuickScan() {
  console.log(chalk.red.bold('🔥 QUICK SCAN & IMPROVE 🔥'));
  console.log(chalk.cyan('═══════════════════════════════════'));

  try {
    // Run system scan
    console.log(chalk.yellow('🔍 Scanning project...'));
    const scanner = new SystemScanner();
    const analysis = await scanner.scanProject();
    const scanReport = scanner.generateReport(analysis);

    console.log(chalk.green('📊 Scan Complete:'));
    console.log(`  Files: ${scanReport.summary.files}`);
    console.log(`  Maintainability: ${scanReport.summary.maintainabilityIndex}%`);
    console.log(`  Security Risk: ${scanReport.summary.securityRisk}`);
    console.log(`  Performance Score: ${scanReport.summary.performanceScore}`);

    // Run auto improvements
    console.log(chalk.yellow('\n🔧 Applying improvements...'));
    const improver = new AutoImprover();
    const improveReport = await improver.improveProject();

    console.log(chalk.green('✅ Improvements Applied:'));
    improveReport.applied_improvements.forEach(improvement => {
      console.log(`  • ${improvement}`);
    });

    console.log(chalk.blue('\n📄 Reports generated:'));
    console.log('  • system-scan-report.json');
    console.log('  • improvement-report.json');

    console.log(chalk.green.bold('\n🎯 SCAN & IMPROVE COMPLETE'));

  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
  }
}

runQuickScan();