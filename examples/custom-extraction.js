import { WebScraper } from '../src/index.js';

async function customExtraction() {
  console.log('Custom Data Extraction Example\n');

  const scraper = new WebScraper();

  try {
    const result = await scraper.scrape('https://example.com', {
      customSelectors: {
        mainHeading: 'h1',
        paragraphs: 'p',
        navigationLinks: 'nav a',
        articleTitles: 'article h2'
      }
    });

    console.log('Custom extracted data:');
    console.log('\nMain Heading:');
    result.custom.mainHeading.forEach(el => {
      console.log('  -', el.text);
    });

    console.log('\nFirst 3 Paragraphs:');
    result.custom.paragraphs.slice(0, 3).forEach((el, i) => {
      console.log(`  ${i + 1}.`, el.text.substring(0, 100) + '...');
    });

    console.log('\nNavigation Links:');
    result.custom.navigationLinks.forEach((el, i) => {
      console.log(`  ${i + 1}.`, el.text, '-', el.attributes.href);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await scraper.close();
  }
}

customExtraction();
