import { WebScraper } from '../src/index.js';

async function basicScraping() {
  console.log('Basic Web Scraping Example\n');

  const scraper = new WebScraper();

  try {
    const result = await scraper.scrape('https://example.com');

    console.log('Title:', result.metadata.title);
    console.log('Description:', result.metadata.description);
    console.log('Word Count:', result.content.wordCount);
    console.log('Total Links:', result.links.length);
    console.log('Total Images:', result.images.length);
    console.log('\nFirst 5 links:');
    result.links.slice(0, 5).forEach((link, i) => {
      console.log(`${i + 1}. ${link.text} - ${link.href}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await scraper.close();
  }
}

basicScraping();
