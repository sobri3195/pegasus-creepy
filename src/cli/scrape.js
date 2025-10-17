#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { WebScraper } from '../scraper/WebScraper.js';
import { Storage, generateFilename } from '../utils/storage.js';

const program = new Command();

program
  .name('scrape')
  .description('Deep web scraping tool')
  .requiredOption('-u, --url <url>', 'URL to scrape')
  .option('-o, --output <file>', 'Output file path')
  .option('-d, --depth <number>', 'Crawl depth for deep scraping', '1')
  .option('-m, --max-pages <number>', 'Maximum pages to scrape', '50')
  .option('-j, --javascript', 'Use JavaScript rendering with Puppeteer')
  .option('-s, --screenshot', 'Take screenshot (requires --javascript)')
  .option('--metrics', 'Collect performance metrics (requires --javascript)')
  .option('--deep', 'Enable deep crawling')
  .option('--delay <ms>', 'Delay between requests in ms', '1000')
  .option('--selectors <json>', 'Custom selectors as JSON string')
  .parse(process.argv);

const options = program.opts();

async function main() {
  console.log(chalk.cyan.bold('\n🕷️  Deep Web Scraper\n'));

  const spinner = ora('Initializing scraper...').start();

  try {
    const scraper = new WebScraper({
      maxDepth: parseInt(options.depth),
      maxPages: parseInt(options.maxPages),
      useJavaScript: options.javascript,
      delay: parseInt(options.delay)
    });

    const scrapeOptions = {
      useJavaScript: options.javascript,
      takeScreenshot: options.screenshot,
      getMetrics: options.metrics
    };

    if (options.selectors) {
      try {
        scrapeOptions.customSelectors = JSON.parse(options.selectors);
      } catch (e) {
        spinner.fail('Invalid JSON for selectors');
        process.exit(1);
      }
    }

    spinner.text = `Scraping ${options.url}...`;

    let result;
    if (options.deep) {
      spinner.text = `Deep scraping starting from ${options.url}...`;
      result = await scraper.scrapeDeep(options.url, scrapeOptions);
    } else {
      result = await scraper.scrape(options.url, scrapeOptions);
    }

    spinner.succeed('Scraping completed!');

    console.log(chalk.green('\n✓ Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    if (options.deep) {
      console.log(chalk.white(`Total pages scraped: ${chalk.bold(result.totalPages)}`));
      console.log(chalk.white(`Start URL: ${chalk.bold(result.startUrl)}`));
    } else {
      console.log(chalk.white(`URL: ${chalk.bold(result.url)}`));
      console.log(chalk.white(`Title: ${chalk.bold(result.metadata?.title || 'N/A')}`));
      console.log(chalk.white(`Word count: ${chalk.bold(result.content?.wordCount || 'N/A')}`));
      console.log(chalk.white(`Links found: ${chalk.bold(result.links?.length || 0)}`));
      console.log(chalk.white(`Images found: ${chalk.bold(result.images?.length || 0)}`));
      console.log(chalk.white(`Scripts found: ${chalk.bold(result.scripts?.length || 0)}`));
    }

    if (options.output || !options.output) {
      const storage = new Storage('./data');
      const filename = options.output || await generateFilename(options.url, 'json');
      const filepath = await storage.saveJson(filename, result);
      console.log(chalk.white(`\n💾 Saved to: ${chalk.bold(filepath)}`));
    }

    await scraper.close();

    console.log(chalk.green('\n✓ Done!\n'));
    process.exit(0);

  } catch (error) {
    spinner.fail('Scraping failed');
    console.error(chalk.red('\n✗ Error:'), error.message);
    process.exit(1);
  }
}

main();
