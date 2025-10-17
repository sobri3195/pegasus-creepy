# Contoh Penggunaan

## Scraping

### 1. Scraping Halaman Tunggal

```bash
npm run scrape -- --url https://example.com --output result.json
```

### 2. Deep Scraping (Multi-Level)

```bash
npm run scrape -- --url https://example.com --deep --depth 3 --max-pages 100
```

### 3. Scraping dengan JavaScript Rendering

```bash
npm run scrape -- --url https://spa-website.com --javascript --screenshot
```

### 4. Custom Selectors

```bash
npm run scrape -- --url https://example.com --selectors '{"title":"h1","price":".price","desc":".description"}'
```

### 5. Scraping dengan Delay

```bash
npm run scrape -- --url https://example.com --deep --delay 3000
```

## Scanning

### 1. Scan Dasar

```bash
npm run scan -- --url https://example.com
```

### 2. Full Scan dengan Output

```bash
npm run scan -- --url https://example.com --full --output scan-result.json
```

### 3. Scan Multiple Sites (Script)

```javascript
import { WebScanner } from './src/index.js';

const scanner = new WebScanner();
const sites = ['https://site1.com', 'https://site2.com', 'https://site3.com'];

for (const site of sites) {
  const report = await scanner.scan(site);
  console.log(`${site}: Security ${report.security.score}, SEO ${report.seo.score}`);
}
```

## Tracking

### 1. Track Once (Single Snapshot)

```bash
npm run track -- --url https://example.com --once
```

### 2. Continuous Tracking (Every Hour)

```bash
npm run track -- --url https://example.com --interval 3600
```

### 3. Tracking dengan Screenshot

```bash
npm run track -- --url https://example.com --once --screenshot --javascript
```

### 4. View History

```bash
npm run track -- --url https://example.com --history
```

### 5. Generate Report

```bash
npm run track -- --url https://example.com --report
```

### 6. List Tracked URLs

```bash
npm run track -- --list
```

### 7. Cleanup Old Snapshots

```bash
npm run track -- --url https://example.com --cleanup 20
```

### 8. Clear History

```bash
npm run track -- --url https://example.com --clear
```

## Use Cases

### E-commerce Price Monitoring

```javascript
import { WebTracker } from './src/index.js';

const tracker = new WebTracker();

await tracker.startTracking('https://shop.com/product/123', {
  interval: 1800000, // 30 menit
  onChange: (changes) => {
    const priceChanged = changes.changes.some(c => 
      JSON.stringify(c).toLowerCase().includes('price')
    );
    
    if (priceChanged) {
      // Kirim notifikasi
      console.log('Price changed! Send alert...');
    }
  }
});
```

### Competitor Technology Stack Analysis

```javascript
import { WebScanner } from './src/index.js';

const scanner = new WebScanner();
const competitors = [
  'https://competitor1.com',
  'https://competitor2.com'
];

for (const url of competitors) {
  const report = await scanner.scan(url);
  console.log(`\n${url}:`);
  console.log('CMS:', report.technology.cms);
  console.log('Frameworks:', report.technology.frameworks);
  console.log('Analytics:', report.technology.analytics);
  console.log('Security Score:', report.security.score);
}
```

### Content Change Monitoring

```javascript
import { WebTracker } from './src/index.js';

const tracker = new WebTracker();

await tracker.startTracking('https://news-site.com', {
  interval: 300000, // 5 menit
  onChange: (changes, data) => {
    if (changes.changes.some(c => c.type === 'content')) {
      console.log('New content published!');
      console.log('Title:', data.metadata.title);
      console.log('Word count:', data.content.wordCount);
    }
  }
});
```

### SEO Audit

```javascript
import { WebScanner } from './src/index.js';

const scanner = new WebScanner();
const report = await scanner.scan('https://mywebsite.com');

console.log('SEO Score:', report.seo.score);
console.log('Issues:', report.seo.issues);
console.log('Recommendations:', report.seo.recommendations);

if (report.seo.score < 70) {
  console.log('\n⚠️ SEO needs improvement:');
  report.seo.issues.forEach(issue => {
    console.log(`  - ${issue}`);
  });
}
```

### Website Availability Monitoring

```javascript
import { WebScraper } from './src/index.js';

const scraper = new WebScraper();

setInterval(async () => {
  try {
    const data = await scraper.scrape('https://mywebsite.com');
    console.log(`✓ [${new Date().toISOString()}] Site is up`);
  } catch (error) {
    console.error(`✗ [${new Date().toISOString()}] Site is down:`, error.message);
    // Send alert
  }
}, 60000); // Check every minute
```

### Extract Structured Data

```javascript
import { WebScraper } from './src/index.js';

const scraper = new WebScraper();
const data = await scraper.scrape('https://example.com');

console.log('Structured Data:');
data.structuredData.forEach(sd => {
  console.log('Type:', sd['@type']);
  console.log('Data:', JSON.stringify(sd, null, 2));
});
```

### Bulk URL Scraping

```javascript
import { WebScraper } from './src/index.js';
import { Storage } from './src/utils/storage.js';

const scraper = new WebScraper({ delay: 2000 });
const storage = new Storage('./bulk-results');

const urls = [
  'https://site1.com',
  'https://site2.com',
  'https://site3.com'
];

for (const url of urls) {
  try {
    const data = await scraper.scrape(url);
    const filename = new URL(url).hostname + '.json';
    await storage.saveJson(filename, data);
    console.log(`✓ Scraped: ${url}`);
  } catch (error) {
    console.error(`✗ Failed: ${url}`, error.message);
  }
}

await scraper.close();
```

### Security Audit

```javascript
import { WebScanner } from './src/index.js';

const scanner = new WebScanner();
const report = await scanner.scan('https://mywebsite.com');

console.log('Security Score:', report.security.score);
console.log('Vulnerabilities:', report.security.vulnerabilities.length);

if (report.security.vulnerabilities.length > 0) {
  console.log('\n🔐 Security Issues:');
  report.security.vulnerabilities.forEach(vuln => {
    console.log(`[${vuln.severity.toUpperCase()}] ${vuln.issue}`);
    console.log(`  → ${vuln.description}\n`);
  });
}
```

### Extract All Links

```javascript
import { WebScraper } from './src/index.js';

const scraper = new WebScraper();
const data = await scraper.scrape('https://example.com');

console.log('Internal Links:');
data.links.filter(l => !l.isExternal).forEach(link => {
  console.log(`  ${link.text} → ${link.href}`);
});

console.log('\nExternal Links:');
data.links.filter(l => l.isExternal).forEach(link => {
  console.log(`  ${link.text} → ${link.href}`);
});

await scraper.close();
```

### Performance Monitoring

```javascript
import { WebScanner } from './src/index.js';

const scanner = new WebScanner();
const report = await scanner.scan('https://mywebsite.com');

console.log('Performance Report:');
console.log('Score:', report.performance.score);
console.log('HTML Size:', report.performance.htmlSizeFormatted);
console.log('Total Resources:', report.performance.totalResources);
console.log('Issues:', report.performance.issues);

if (report.performance.score < 80) {
  console.log('\n⚠️ Performance needs improvement!');
}
```

## Tips

1. **Rate Limiting**: Selalu gunakan delay untuk menghormati server
2. **Error Handling**: Tangani error dengan try-catch
3. **Resource Management**: Tutup scraper/tracker setelah selesai
4. **Storage**: Bersihkan data lama secara berkala
5. **Monitoring**: Gunakan onChange callbacks untuk real-time alerts
6. **JavaScript Rendering**: Gunakan hanya jika diperlukan (lebih lambat)
7. **Batch Processing**: Process URLs dalam batch kecil untuk memory efficiency
