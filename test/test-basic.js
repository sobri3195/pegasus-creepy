import { WebScraper, WebScanner, WebTracker } from '../src/index.js';

async function testBasicFunctionality() {
  console.log('🧪 Running basic functionality tests...\n');

  console.log('1. Testing WebScraper...');
  try {
    const scraper = new WebScraper();
    const data = await scraper.scrape('https://example.com');
    
    if (data.url && data.metadata && data.content) {
      console.log('   ✓ WebScraper works correctly');
      console.log('   Title:', data.metadata.title);
    } else {
      console.log('   ✗ WebScraper missing data');
    }
    
    await scraper.close();
  } catch (error) {
    console.log('   ✗ WebScraper failed:', error.message);
  }

  console.log('\n2. Testing WebScanner...');
  try {
    const scanner = new WebScanner();
    const report = await scanner.scan('https://example.com');
    
    if (report.url && report.security && report.seo && report.technology) {
      console.log('   ✓ WebScanner works correctly');
      console.log('   Security Score:', report.security.score);
      console.log('   SEO Score:', report.seo.score);
    } else {
      console.log('   ✗ WebScanner missing data');
    }
  } catch (error) {
    console.log('   ✗ WebScanner failed:', error.message);
  }

  console.log('\n3. Testing WebTracker...');
  try {
    const tracker = new WebTracker();
    const result = await tracker.track('https://example.com');
    
    if (result.url && result.timestamp) {
      console.log('   ✓ WebTracker works correctly');
      console.log('   Is first snapshot:', result.isFirstSnapshot);
    } else {
      console.log('   ✗ WebTracker missing data');
    }
    
    await tracker.close();
  } catch (error) {
    console.log('   ✗ WebTracker failed:', error.message);
  }

  console.log('\n✓ Basic tests completed!\n');
}

testBasicFunctionality().catch(console.error);
