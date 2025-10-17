import { WebScraper, WebTracker } from '../src/index.js';

async function monitorEcommerce() {
  console.log('E-commerce Product Monitoring Example\n');

  const productUrls = [
    'https://example.com/product/1',
    'https://example.com/product/2',
    'https://example.com/product/3'
  ];

  const scraper = new WebScraper();
  const tracker = new WebTracker();

  console.log('1. Initial scraping to extract product data...\n');

  for (const url of productUrls) {
    try {
      const data = await scraper.scrape(url, {
        customSelectors: {
          productName: '.product-title, h1.product-name',
          price: '.price, .product-price',
          availability: '.availability, .stock-status',
          description: '.description, .product-description',
          images: '.product-image img'
        }
      });

      console.log(`Product: ${url}`);
      console.log(`  Title: ${data.metadata?.title || 'N/A'}`);
      console.log(`  Images: ${data.images?.length || 0}`);
      console.log(`  Links: ${data.links?.length || 0}`);

      if (data.custom?.price && data.custom.price.length > 0) {
        console.log(`  Price element: ${data.custom.price[0]?.text || 'N/A'}`);
      }

    } catch (error) {
      console.error(`  Error: ${error.message}`);
    }
  }

  console.log('\n2. Starting price monitoring...\n');

  const priceChanges = [];

  for (const url of productUrls) {
    await tracker.startTracking(url, {
      interval: 600000,
      
      onChange: (changes, data) => {
        const hasPriceChange = changes.changes.some(change => {
          return change.type === 'content' || 
                 (change.field && change.field.includes('price'));
        });

        if (hasPriceChange) {
          console.log(`\n💰 Potential price change detected: ${url}`);
          console.log(`   Time: ${new Date().toISOString()}`);
          
          priceChanges.push({
            url,
            timestamp: new Date().toISOString(),
            changes: changes.changes.filter(c => 
              c.type === 'content' || 
              (c.field && c.field.includes('price'))
            )
          });
        }

        const hasAvailabilityChange = changes.changes.some(change => {
          const text = JSON.stringify(change).toLowerCase();
          return text.includes('stock') || 
                 text.includes('availability') ||
                 text.includes('out of stock') ||
                 text.includes('in stock');
        });

        if (hasAvailabilityChange) {
          console.log(`\n📦 Availability change detected: ${url}`);
        }
      }
    });

    console.log(`✓ Monitoring: ${url}`);
  }

  console.log('\n✓ All products are being monitored');
  console.log('Press Ctrl+C to see summary and stop\n');

  process.on('SIGINT', async () => {
    console.log('\n\nStopping monitoring...');
    tracker.stopAllTracking();
    
    console.log('\n📊 Price Change Summary:');
    console.log(`Total price changes detected: ${priceChanges.length}`);
    
    if (priceChanges.length > 0) {
      console.log('\nDetails:');
      priceChanges.forEach((change, index) => {
        console.log(`\n${index + 1}. ${change.url}`);
        console.log(`   Time: ${change.timestamp}`);
        console.log(`   Changes: ${change.changes.length}`);
      });
    }
    
    await scraper.close();
    await tracker.close();
    console.log('\n✓ Monitoring stopped\n');
    process.exit(0);
  });
}

monitorEcommerce().catch(console.error);
