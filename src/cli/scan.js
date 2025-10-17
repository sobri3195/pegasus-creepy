#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { WebScanner } from '../scanner/WebScanner.js';
import { Storage, generateFilename } from '../utils/storage.js';

const program = new Command();

program
  .name('scan')
  .description('Deep web scanning tool')
  .requiredOption('-u, --url <url>', 'URL to scan')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --full', 'Include full HTML and headers in output')
  .parse(process.argv);

const options = program.opts();

async function main() {
  console.log(chalk.cyan.bold('\n🔍 Deep Web Scanner\n'));

  const spinner = ora('Initializing scanner...').start();

  try {
    const scanner = new WebScanner();

    spinner.text = `Scanning ${options.url}...`;

    const result = await scanner.scan(options.url, {
      full: options.full
    });

    spinner.succeed('Scanning completed!');

    console.log(chalk.green('\n✓ Scan Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(chalk.white(`\n${chalk.bold('Basic Info:')}`));
    console.log(chalk.white(`  URL: ${result.url}`));
    console.log(chalk.white(`  Status: ${result.statusCode}`));
    console.log(chalk.white(`  Title: ${result.metadata?.title || 'N/A'}`));

    console.log(chalk.white(`\n${chalk.bold('Technology Stack:')}`));
    if (result.technology.cms.length > 0) {
      console.log(chalk.white(`  CMS: ${result.technology.cms.join(', ')}`));
    }
    if (result.technology.frameworks.length > 0) {
      console.log(chalk.white(`  Frameworks: ${result.technology.frameworks.join(', ')}`));
    }
    if (result.technology.server.length > 0) {
      console.log(chalk.white(`  Server: ${result.technology.server.join(', ')}`));
    }
    if (result.technology.analytics.length > 0) {
      console.log(chalk.white(`  Analytics: ${result.technology.analytics.join(', ')}`));
    }

    console.log(chalk.white(`\n${chalk.bold('Security Analysis:')}`));
    const secScore = result.security.score;
    const secColor = secScore >= 80 ? 'green' : secScore >= 60 ? 'yellow' : 'red';
    console.log(chalk[secColor](`  Security Score: ${secScore}/100`));
    console.log(chalk.white(`  Vulnerabilities: ${result.security.vulnerabilities.length}`));
    
    if (result.security.vulnerabilities.length > 0) {
      console.log(chalk.white(`\n  ${chalk.bold('Issues:')}`));
      result.security.vulnerabilities.forEach(vuln => {
        const severityColor = vuln.severity === 'high' ? 'red' : vuln.severity === 'medium' ? 'yellow' : 'gray';
        console.log(chalk[severityColor](`    [${vuln.severity.toUpperCase()}] ${vuln.issue}`));
      });
    }

    console.log(chalk.white(`\n${chalk.bold('SEO Analysis:')}`));
    const seoScore = result.seo.score;
    const seoColor = seoScore >= 80 ? 'green' : seoScore >= 60 ? 'yellow' : 'red';
    console.log(chalk[seoColor](`  SEO Score: ${seoScore}/100`));
    console.log(chalk.white(`  Word Count: ${result.seo.wordCount}`));
    console.log(chalk.white(`  H1 Tags: ${result.seo.headingsStructure.h1.length}`));
    console.log(chalk.white(`  Structured Data: ${result.seo.hasStructuredData ? 'Yes' : 'No'}`));
    
    if (result.seo.issues.length > 0) {
      console.log(chalk.red(`\n  ${chalk.bold('Issues:')} ${result.seo.issues.join(', ')}`));
    }

    console.log(chalk.white(`\n${chalk.bold('Performance:')}`));
    const perfScore = result.performance.score;
    const perfColor = perfScore >= 80 ? 'green' : perfScore >= 60 ? 'yellow' : 'red';
    console.log(chalk[perfColor](`  Performance Score: ${perfScore}/100`));
    console.log(chalk.white(`  HTML Size: ${result.performance.htmlSizeFormatted}`));
    console.log(chalk.white(`  Total Resources: ${result.performance.totalResources}`));

    console.log(chalk.white(`\n${chalk.bold('Accessibility:')}`));
    const a11yScore = result.accessibility.score;
    const a11yColor = a11yScore >= 80 ? 'green' : a11yScore >= 60 ? 'yellow' : 'red';
    console.log(chalk[a11yColor](`  Accessibility Score: ${a11yScore}/100`));
    console.log(chalk.white(`  Issues: ${result.accessibility.issues.length}`));

    if (options.output || !options.output) {
      const storage = new Storage('./data');
      const filename = options.output || await generateFilename(options.url, 'json');
      const filepath = await storage.saveJson(filename, result);
      console.log(chalk.white(`\n💾 Saved to: ${chalk.bold(filepath)}`));
    }

    console.log(chalk.green('\n✓ Done!\n'));
    process.exit(0);

  } catch (error) {
    spinner.fail('Scanning failed');
    console.error(chalk.red('\n✗ Error:'), error.message);
    process.exit(1);
  }
}

main();
