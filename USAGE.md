# Panduan Penggunaan Lengkap

## Daftar Isi

1. [Web Scraping](#web-scraping)
2. [Web Scanning](#web-scanning)
3. [Web Tracking](#web-tracking)
4. [Contoh Kode](#contoh-kode)

---

## Web Scraping

### Scraping Dasar

```javascript
import { WebScraper } from './src/index.js';

const scraper = new WebScraper();
const data = await scraper.scrape('https://example.com');
console.log(data);
```

### Scraping dengan JavaScript Rendering

```javascript
const scraper = new WebScraper({
  useJavaScript: true
});

const data = await scraper.scrape('https://example.com', {
  takeScreenshot: true,
  getMetrics: true
});
```

### Deep Crawling

```javascript
const scraper = new WebScraper({
  maxDepth: 3,
  maxPages: 100,
  delay: 2000,
  sameOrigin: true
});

const result = await scraper.scrapeDeep('https://example.com');
console.log(`Scraped ${result.totalPages} pages`);
```

### Custom Selectors

```javascript
const data = await scraper.scrape('https://example.com', {
  customSelectors: {
    products: '.product-item',
    prices: '.price',
    titles: 'h2.product-title'
  }
});

console.log(data.custom.products);
```

### CLI Usage

```bash
# Scrape single page
npm run scrape -- --url https://example.com --output data.json

# Deep scraping dengan JavaScript
npm run scrape -- --url https://example.com --deep --depth 2 --javascript --screenshot

# Custom selectors
npm run scrape -- --url https://example.com --selectors '{"title":"h1","content":"article"}'
```

---

## Web Scanning

### Scan Dasar

```javascript
import { WebScanner } from './src/index.js';

const scanner = new WebScanner();
const report = await scanner.scan('https://example.com');

console.log('Security Score:', report.security.score);
console.log('SEO Score:', report.seo.score);
console.log('Technologies:', report.technology);
```

### Full Scan

```javascript
const report = await scanner.scan('https://example.com', {
  full: true
});

console.log('Full HTML:', report.fullHtml);
console.log('Raw Headers:', report.rawHeaders);
```

### CLI Usage

```bash
# Scan website
npm run scan -- --url https://example.com

# Full scan dengan semua data
npm run scan -- --url https://example.com --full --output scan-report.json
```

### Informasi yang Dikumpulkan

- **Teknologi:** CMS, framework, library, server, CDN
- **Keamanan:** Security headers, SSL/TLS, vulnerabilities
- **SEO:** Metadata, headings, structured data, score
- **Performance:** HTML size, resource count, optimization issues
- **Accessibility:** Alt text, ARIA labels, language attributes

---

## Web Tracking

### Track Once

```javascript
import { WebTracker } from './src/index.js';

const tracker = new WebTracker();
const result = await tracker.track('https://example.com');

if (result.changes.detected) {
  console.log('Changes detected!');
  console.log(result.changes);
}
```

### Continuous Tracking

```javascript
const tracker = new WebTracker();

const trackingInfo = await tracker.startTracking('https://example.com', {
  interval: 3600000, // 1 hour
  useJavaScript: true,
  takeScreenshot: true,
  onChange: (changes, data) => {
    console.log('Website changed!');
    console.log('Changes:', changes.summary);
  },
  onError: (error) => {
    console.error('Tracking error:', error);
  }
});

// Stop tracking nanti
tracker.stopTracking(trackingInfo.trackingId);
```

### View History

```javascript
const history = await tracker.getHistory('https://example.com');
console.log('Total snapshots:', history.totalSnapshots);
console.log('First snapshot:', history.firstSnapshot);
console.log('Last snapshot:', history.lastSnapshot);
```

### Generate Report

```javascript
const report = await tracker.generateReport('https://example.com');
console.log('Total changes:', report.totalChanges);
console.log('Changes:', report.changes);
```

### Compare Snapshots

```javascript
const comparison = await tracker.compareSnapshots(
  'https://example.com',
  '2024-01-01T00:00:00.000Z',
  '2024-01-02T00:00:00.000Z'
);

console.log('Changes detected:', comparison.changes.detected);
console.log('Change details:', comparison.changes.changes);
```

### CLI Usage

```bash
# Track once
npm run track -- --url https://example.com --once

# Continuous tracking (setiap 1 jam)
npm run track -- --url https://example.com --interval 3600

# Dengan screenshot
npm run track -- --url https://example.com --once --screenshot --javascript

# View history
npm run track -- --url https://example.com --history

# Generate report
npm run track -- --url https://example.com --report

# List all tracked URLs
npm run track -- --list

# Cleanup old snapshots (keep 10 latest)
npm run track -- --url https://example.com --cleanup 10

# Clear all history
npm run track -- --url https://example.com --clear
```

---

## Contoh Kode

### Scraping Product Data

```javascript
const scraper = new WebScraper();

const products = await scraper.scrape('https://shop.example.com', {
  customSelectors: {
    productName: '.product-name',
    price: '.product-price',
    image: '.product-image',
    description: '.product-description'
  }
});

console.log('Products found:', products.custom.productName.length);
```

### Monitor Harga Produk

```javascript
const tracker = new WebTracker();

await tracker.startTracking('https://shop.example.com/product/123', {
  interval: 3600000,
  onChange: async (changes, data) => {
    const priceChange = changes.changes.find(c => 
      c.type === 'content' && c.field === 'price'
    );
    
    if (priceChange) {
      console.log('Price changed!');
      console.log('Old price:', priceChange.old);
      console.log('New price:', priceChange.new);
    }
  }
});
```

### Comprehensive Website Audit

```javascript
const scanner = new WebScanner();
const report = await scanner.scan('https://example.com', { full: true });

const audit = {
  url: report.url,
  scores: {
    security: report.security.score,
    seo: report.seo.score,
    performance: report.performance.score,
    accessibility: report.accessibility.score
  },
  technologies: report.technology,
  issues: [
    ...report.security.vulnerabilities,
    ...report.seo.issues.map(i => ({ type: 'SEO', issue: i })),
    ...report.performance.issues.map(i => ({ type: 'Performance', issue: i }))
  ]
};

console.log('Overall audit:', audit);
```

### Parallel Scraping

```javascript
const scraper = new WebScraper();
const urls = [
  'https://example1.com',
  'https://example2.com',
  'https://example3.com'
];

const results = await Promise.all(
  urls.map(url => scraper.scrape(url).catch(e => ({ url, error: e.message })))
);

console.log('Scraped pages:', results.length);
```

---

## Tips & Best Practices

### Rate Limiting

Selalu gunakan delay untuk menghindari overload server:

```javascript
const scraper = new WebScraper({
  delay: 2000, // 2 detik antara request
  maxRetries: 3
});
```

### Respect robots.txt

```javascript
const scraper = new WebScraper({
  respectRobots: true
});
```

### Error Handling

```javascript
try {
  const data = await scraper.scrape(url);
} catch (error) {
  if (error.message.includes('HTTP 404')) {
    console.log('Page not found');
  } else if (error.message.includes('timeout')) {
    console.log('Request timeout');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Memory Management

Untuk scraping besar, close scraper setelah selesai:

```javascript
const scraper = new WebScraper();
try {
  // ... scraping operations
} finally {
  await scraper.close();
}
```

### Storage Management

Cleanup old data secara berkala:

```javascript
const tracker = new WebTracker();

// Hapus snapshot lama, keep 20 terbaru
await tracker.cleanupHistory(url, 20);
```

---

## Troubleshooting

### Puppeteer Issues

Jika ada masalah dengan Puppeteer:

```bash
# Install dependencies
sudo apt-get install -y \
  gconf-service libasound2 libatk1.0-0 libcups2 \
  libdbus-1-3 libgconf-2-4 libgtk-3-0 libnspr4 \
  libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxrandr2 libxss1 libxtst6 fonts-liberation \
  libnss3 libgbm1
```

### Memory Issues

Untuk website besar:

```javascript
const scraper = new WebScraper({
  maxPages: 50, // Batasi jumlah halaman
  timeout: 30000 // Timeout lebih pendek
});
```

### Network Issues

Tambahkan retry logic:

```javascript
const scraper = new WebScraper({
  http: {
    maxRetries: 5,
    retryDelay: 2000
  }
});
```
