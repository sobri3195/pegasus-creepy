import { WebScraper } from '../src/index.js';

async function deepScraping() {
  console.log('Deep Web Scraping Example\n');

  const scraper = new WebScraper({
    maxDepth: 2,
    maxPages: 10,
    delay: 2000,
    sameOrigin: true
  });

  try {
    const result = await scraper.scrapeDeep('https://example.com');

    console.log('Start URL:', result.startUrl);
    console.log('Total Pages Scraped:', result.totalPages);
    console.log('Scraped At:', result.scrapedAt);

    console.log('\nPages:');
    result.pages.forEach((page, i) => {
      if (!page.error) {
        console.log(`${i + 1}. ${page.url}`);
        console.log(`   Title: ${page.metadata?.title || 'N/A'}`);
        console.log(`   Links: ${page.links?.length || 0}`);
      } else {
        console.log(`${i + 1}. ${page.url} - ERROR: ${page.error}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await scraper.close();
  }
}

deepScraping();
