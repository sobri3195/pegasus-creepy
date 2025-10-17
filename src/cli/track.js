#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { WebTracker } from '../tracker/WebTracker.js';

const program = new Command();

program
  .name('track')
  .description('Deep web tracking tool')
  .option('-u, --url <url>', 'URL to track')
  .option('-i, --interval <seconds>', 'Tracking interval in seconds', '3600')
  .option('-j, --javascript', 'Use JavaScript rendering')
  .option('-s, --screenshot', 'Take screenshots')
  .option('--once', 'Run tracking once and exit')
  .option('--history', 'Show tracking history')
  .option('--report', 'Generate tracking report')
  .option('--cleanup <keep>', 'Cleanup old snapshots, keep N latest')
  .option('--clear', 'Clear all tracking history')
  .option('--list', 'List all tracked URLs')
  .parse(process.argv);

const options = program.opts();

async function main() {
  console.log(chalk.cyan.bold('\n📊 Deep Web Tracker\n'));

  const tracker = new WebTracker();

  try {
    if (options.list) {
      const spinner = ora('Loading tracked URLs...').start();
      const urls = await tracker.getTrackedUrls();
      spinner.succeed('Tracked URLs loaded');

      if (urls.length === 0) {
        console.log(chalk.yellow('\nNo URLs are being tracked yet.'));
      } else {
        console.log(chalk.white(`\n${chalk.bold('Tracked URLs:')}`));
        console.log(chalk.gray('─'.repeat(50)));
        urls.forEach((item, index) => {
          console.log(chalk.white(`\n${index + 1}. ${item.url}`));
          console.log(chalk.gray(`   Snapshots: ${item.totalSnapshots}`));
          console.log(chalk.gray(`   Last snapshot: ${item.lastSnapshot}`));
        });
      }
      process.exit(0);
    }

    if (options.history) {
      if (!options.url) {
        console.error(chalk.red('Error: --url is required for --history'));
        process.exit(1);
      }
      const spinner = ora('Loading history...').start();
      const history = await tracker.getHistory(options.url);
      spinner.succeed('History loaded');

      console.log(chalk.white(`\n${chalk.bold('Tracking History:')}`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.white(`URL: ${history.url}`));
      console.log(chalk.white(`Total Snapshots: ${history.totalSnapshots}`));
      console.log(chalk.white(`First Snapshot: ${history.firstSnapshot || 'N/A'}`));
      console.log(chalk.white(`Last Snapshot: ${history.lastSnapshot || 'N/A'}`));

      if (history.snapshots.length > 0) {
        console.log(chalk.white(`\n${chalk.bold('Snapshots:')}`));
        history.snapshots.slice(-10).forEach((snapshot, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${snapshot.timestamp}`));
        });
      }

      process.exit(0);
    }

    if (options.report) {
      if (!options.url) {
        console.error(chalk.red('Error: --url is required for --report'));
        process.exit(1);
      }
      const spinner = ora('Generating report...').start();
      const report = await tracker.generateReport(options.url);
      spinner.succeed('Report generated');

      console.log(chalk.white(`\n${chalk.bold('Tracking Report:')}`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.white(`URL: ${report.url}`));
      console.log(chalk.white(`Total Snapshots: ${report.history.totalSnapshots}`));
      console.log(chalk.white(`Total Changes: ${report.totalChanges}`));

      if (report.changes && report.changes.length > 0) {
        console.log(chalk.white(`\n${chalk.bold('Recent Changes:')}`));
        report.changes.slice(-5).forEach((change, index) => {
          console.log(chalk.white(`\n${index + 1}. ${change.from} → ${change.to}`));
          if (change.changes.summary) {
            console.log(chalk.gray(`   Changes: ${JSON.stringify(change.changes.summary.byType)}`));
          }
        });
      }

      process.exit(0);
    }

    if (options.cleanup) {
      if (!options.url) {
        console.error(chalk.red('Error: --url is required for --cleanup'));
        process.exit(1);
      }
      const spinner = ora('Cleaning up old snapshots...').start();
      const keepCount = parseInt(options.cleanup) || 10;
      const deleted = await tracker.cleanupHistory(options.url, keepCount);
      spinner.succeed(`Cleaned up ${deleted} old snapshots`);
      process.exit(0);
    }

    if (options.clear) {
      if (!options.url) {
        console.error(chalk.red('Error: --url is required for --clear'));
        process.exit(1);
      }
      const spinner = ora('Clearing tracking history...').start();
      const deleted = await tracker.clearHistory(options.url);
      spinner.succeed(`Cleared ${deleted} snapshots`);
      process.exit(0);
    }

    if (options.once) {
      if (!options.url) {
        console.error(chalk.red('Error: --url is required for --once'));
        process.exit(1);
      }
      const spinner = ora(`Tracking ${options.url}...`).start();

      const result = await tracker.track(options.url, {
        useJavaScript: options.javascript,
        takeScreenshot: options.screenshot
      });

      spinner.succeed('Tracking completed');

      console.log(chalk.white(`\n${chalk.bold('Tracking Result:')}`));
      console.log(chalk.gray('─'.repeat(50)));
      console.log(chalk.white(`URL: ${result.url}`));
      console.log(chalk.white(`Timestamp: ${result.timestamp}`));
      console.log(chalk.white(`First Snapshot: ${result.isFirstSnapshot ? 'Yes' : 'No'}`));

      if (result.changes.detected) {
        console.log(chalk.yellow(`\n${chalk.bold('⚠ Changes Detected!')}`));
        console.log(chalk.white(`Total Changes: ${result.changes.summary.total}`));
        console.log(chalk.white(`By Type: ${JSON.stringify(result.changes.summary.byType, null, 2)}`));

        console.log(chalk.white(`\n${chalk.bold('Change Details:')}`));
        result.changes.changes.slice(0, 10).forEach((change, index) => {
          console.log(chalk.gray(`${index + 1}. [${change.type}] ${change.field || ''}`));
          if (change.old !== undefined && change.new !== undefined) {
            console.log(chalk.gray(`   Old: ${String(change.old).substring(0, 50)}`));
            console.log(chalk.gray(`   New: ${String(change.new).substring(0, 50)}`));
          }
        });
      } else {
        console.log(chalk.green(`\n✓ No changes detected`));
      }

      await tracker.close();
      process.exit(0);
    }

    if (!options.url) {
      console.error(chalk.red('Error: --url is required'));
      process.exit(1);
    }

    console.log(chalk.white(`Starting continuous tracking for: ${chalk.bold(options.url)}`));
    console.log(chalk.white(`Interval: ${chalk.bold(options.interval)} seconds`));
    console.log(chalk.gray(`Press Ctrl+C to stop\n`));

    const trackingInfo = await tracker.startTracking(options.url, {
      interval: parseInt(options.interval) * 1000,
      useJavaScript: options.javascript,
      takeScreenshot: options.screenshot,
      onChange: (changes) => {
        console.log(chalk.yellow(`\n⚠ Changes detected at ${new Date().toISOString()}`));
        console.log(chalk.white(`Total changes: ${changes.summary.total}`));
        console.log(chalk.white(`By type: ${JSON.stringify(changes.summary.byType)}`));
      },
      onError: (error) => {
        console.error(chalk.red(`\n✗ Tracking error: ${error.message}`));
      }
    });

    console.log(chalk.green(`✓ Tracking started (ID: ${trackingInfo.trackingId})\n`));

    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\nStopping tracker...'));
      tracker.stopAllTracking();
      await tracker.close();
      console.log(chalk.green('✓ Tracker stopped\n'));
      process.exit(0);
    });

  } catch (error) {
    console.error(chalk.red('\n✗ Error:'), error.message);
    await tracker.close();
    process.exit(1);
  }
}

main();
