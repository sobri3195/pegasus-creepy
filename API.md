# API Documentation

## WebScraper

### Constructor

```javascript
new WebScraper(options)
```

**Options:**
- `maxDepth` (number): Maximum crawl depth for deep scraping (default: 1)
- `maxPages` (number): Maximum pages to scrape (default: 50)
- `useJavaScript` (boolean): Use JavaScript rendering (default: false)
- `followLinks` (boolean): Follow links during deep scraping (default: true)
- `respectRobots` (boolean): Respect robots.txt (default: true)
- `delay` (number): Delay between requests in ms (default: 1000)
- `sameOrigin` (boolean): Only scrape same domain (default: true)

### Methods

#### scrape(url, options)

Scrape a single page.

```javascript
const data = await scraper.scrape('https://example.com', {
  useJavaScript: false,
  takeScreenshot: false,
  getMetrics: false,
  customSelectors: {
    title: 'h1',
    content: 'article'
  }
});
```

**Returns:** Object with scraped data including metadata, content, links, images, etc.

#### scrapeDeep(startUrl, options)

Scrape multiple pages starting from a URL.

```javascript
const result = await scraper.scrapeDeep('https://example.com', {
  maxDepth: 2,
  maxPages: 50
});
```

**Returns:** Object with `startUrl`, `totalPages`, `scrapedAt`, and `pages` array.

#### scrapeSitemap(sitemapUrl)

Extract URLs from a sitemap.

```javascript
const urls = await scraper.scrapeSitemap('https://example.com/sitemap.xml');
```

**Returns:** Array of URLs.

#### close()

Close the browser and clean up resources.

```javascript
await scraper.close();
```

---

## WebScanner

### Constructor

```javascript
new WebScanner(options)
```

**Options:**
- `http` (object): HTTP client options

### Methods

#### scan(url, options)

Scan a website for technology, security, SEO, and performance.

```javascript
const report = await scanner.scan('https://example.com', {
  full: false  // Include full HTML and headers
});
```

**Returns:** Object with:
- `url`: Scanned URL
- `statusCode`: HTTP status code
- `metadata`: Meta tags and SEO data
- `technology`: Detected technologies (CMS, frameworks, libraries, etc.)
- `security`: Security analysis (headers, vulnerabilities, score)
- `seo`: SEO analysis (score, issues, recommendations)
- `performance`: Performance metrics
- `accessibility`: Accessibility analysis
- `structure`: HTML structure analysis
- `headers`: Categorized HTTP headers

---

## WebTracker

### Constructor

```javascript
new WebTracker(options)
```

**Options:**
- `scraper` (object): WebScraper options
- `history` (object): HistoryManager options

### Methods

#### track(url, options)

Take a snapshot and detect changes.

```javascript
const result = await tracker.track('https://example.com', {
  useJavaScript: false,
  takeScreenshot: false,
  onChange: (changes, data) => {
    console.log('Changes detected!', changes);
  }
});
```

**Returns:** Object with:
- `url`: Tracked URL
- `timestamp`: Snapshot timestamp
- `filename`: Saved snapshot filename
- `isFirstSnapshot`: Boolean indicating if this is the first snapshot
- `changes`: Detected changes (if not first snapshot)

#### startTracking(url, options)

Start continuous tracking.

```javascript
const trackingInfo = await tracker.startTracking('https://example.com', {
  interval: 3600000,  // 1 hour in ms
  useJavaScript: false,
  takeScreenshot: false,
  onChange: (changes, data) => {},
  onError: (error) => {}
});
```

**Returns:** Object with `trackingId`, `url`, `interval`, `startedAt`.

#### stopTracking(trackingId)

Stop a tracking session.

```javascript
tracker.stopTracking(trackingId);
```

**Returns:** Boolean indicating success.

#### stopAllTracking()

Stop all active tracking sessions.

```javascript
tracker.stopAllTracking();
```

#### getActiveTracking()

Get list of active tracking session IDs.

```javascript
const trackingIds = tracker.getActiveTracking();
```

**Returns:** Array of tracking IDs.

#### getHistory(url)

Get tracking history for a URL.

```javascript
const history = await tracker.getHistory('https://example.com');
```

**Returns:** Object with:
- `url`: Tracked URL
- `totalSnapshots`: Number of snapshots
- `firstSnapshot`: Timestamp of first snapshot
- `lastSnapshot`: Timestamp of last snapshot
- `snapshots`: Array of snapshot metadata

#### getTrackedUrls()

Get all tracked URLs.

```javascript
const urls = await tracker.getTrackedUrls();
```

**Returns:** Array of objects with `url`, `totalSnapshots`, `lastSnapshot`.

#### compareSnapshots(url, timestamp1, timestamp2)

Compare two snapshots.

```javascript
const comparison = await tracker.compareSnapshots(
  'https://example.com',
  '2024-01-01T00:00:00.000Z',
  '2024-01-02T00:00:00.000Z'
);
```

**Returns:** Object with comparison data and detected changes.

#### exportHistory(url, format)

Export tracking history.

```javascript
const json = await tracker.exportHistory('https://example.com', 'json');
```

**Returns:** Exported data as string or object.

#### cleanupHistory(url, keepCount)

Delete old snapshots, keeping N most recent.

```javascript
const deleted = await tracker.cleanupHistory('https://example.com', 10);
```

**Returns:** Number of deleted snapshots.

#### clearHistory(url)

Clear all tracking history for a URL.

```javascript
const deleted = await tracker.clearHistory('https://example.com');
```

**Returns:** Number of deleted snapshots.

#### generateReport(url)

Generate a tracking report with all changes.

```javascript
const report = await tracker.generateReport('https://example.com');
```

**Returns:** Object with history and all detected changes.

#### close()

Close tracker and clean up resources.

```javascript
await tracker.close();
```

---

## ContentExtractor

### Constructor

```javascript
new ContentExtractor(html, url)
```

### Methods

#### extractAll()

Extract all available data from HTML.

**Returns:** Object with all extracted data.

#### extractNormalizedLinks()

Extract all links with normalized URLs.

**Returns:** Array of link objects.

#### extractNormalizedImages()

Extract all images with normalized URLs.

**Returns:** Array of image objects.

#### extractMedia()

Extract videos, audios, and iframes.

**Returns:** Object with `videos`, `audios`, `iframes` arrays.

#### extractContactInfo()

Extract emails and phone numbers.

**Returns:** Object with `emails` and `phones` arrays.

#### extractBySelector(selector)

Extract elements by CSS selector.

```javascript
const elements = extractor.extractBySelector('.product-item');
```

**Returns:** Array of element objects with `html`, `text`, `attributes`.

#### extractCustomData(selectors)

Extract custom data using selector map.

```javascript
const data = extractor.extractCustomData({
  title: 'h1',
  price: '.price',
  description: '.description'
});
```

**Returns:** Object with custom extracted data.

---

## PageNavigator

### Constructor

```javascript
new PageNavigator(options)
```

**Options:**
- `headless` (boolean|string): Headless mode (default: 'new')
- `timeout` (number): Navigation timeout (default: 30000)
- `waitUntil` (string): Wait condition (default: 'networkidle2')

### Methods

#### navigate(url)

Navigate to URL and return page object.

```javascript
const page = await navigator.navigate('https://example.com');
```

**Returns:** Puppeteer page object.

#### getRenderedHtml(url)

Get rendered HTML after JavaScript execution.

```javascript
const html = await navigator.getRenderedHtml('https://example.com');
```

**Returns:** HTML string.

#### takeScreenshot(url, options)

Take a screenshot of the page.

```javascript
const screenshot = await navigator.takeScreenshot('https://example.com', {
  fullPage: true,
  type: 'png'
});
```

**Returns:** Screenshot buffer.

#### extractWithJavaScript(url, extractFn)

Extract data using custom JavaScript function.

```javascript
const data = await navigator.extractWithJavaScript('https://example.com', () => {
  return {
    title: document.title,
    links: Array.from(document.querySelectorAll('a')).map(a => a.href)
  };
});
```

**Returns:** Extracted data.

#### waitForSelector(url, selector, timeout)

Wait for selector to appear.

```javascript
const html = await navigator.waitForSelector('https://example.com', '.content', 5000);
```

**Returns:** HTML string.

#### scrollToBottom(url)

Scroll page to bottom (useful for lazy loading).

```javascript
const html = await navigator.scrollToBottom('https://example.com');
```

**Returns:** HTML string.

#### getMetrics(url)

Get performance metrics.

```javascript
const metrics = await navigator.getMetrics('https://example.com');
```

**Returns:** Performance metrics object.

#### close()

Close browser.

```javascript
await navigator.close();
```

---

## ChangeDetector

### Constructor

```javascript
new ChangeDetector()
```

### Methods

#### detectChanges(oldData, newData)

Detect changes between two data snapshots.

```javascript
const changes = detector.detectChanges(oldSnapshot, newSnapshot);
```

**Returns:** Object with:
- `detected`: Boolean
- `timestamp`: ISO timestamp
- `changes`: Array of change objects
- `summary`: Changes summary

#### compareScreenshots(oldScreenshot, newScreenshot)

Compare two screenshots.

```javascript
const comparison = detector.compareScreenshots(buffer1, buffer2);
```

**Returns:** Comparison result with hashes.

---

## HistoryManager

### Constructor

```javascript
new HistoryManager(options)
```

**Options:**
- `storagePath` (string): Storage directory path (default: './data/history')

### Methods

#### saveSnapshot(url, data)

Save a snapshot.

```javascript
const filename = await manager.saveSnapshot(url, data);
```

**Returns:** Saved filename.

#### loadLatestSnapshot(url)

Load the most recent snapshot.

```javascript
const snapshot = await manager.loadLatestSnapshot(url);
```

**Returns:** Snapshot object or null.

#### loadAllSnapshots(url)

Load all snapshots for a URL.

```javascript
const snapshots = await manager.loadAllSnapshots(url);
```

**Returns:** Array of snapshot objects.

#### getHistory(url)

Get history metadata.

```javascript
const history = await manager.getHistory(url);
```

**Returns:** History object.

#### deleteOldSnapshots(url, keepCount)

Delete old snapshots.

```javascript
const deleted = await manager.deleteOldSnapshots(url, 10);
```

**Returns:** Number of deleted snapshots.

#### clearHistory(url)

Clear all history for a URL.

```javascript
const deleted = await manager.clearHistory(url);
```

**Returns:** Number of deleted items.

---

## Utility Functions

### HTTP Utils

```javascript
import { isValidUrl, normalizeUrl, getDomain, isSameDomain } from './src/utils/http.js';

isValidUrl('https://example.com');  // true
normalizeUrl('/path', 'https://example.com');  // 'https://example.com/path'
getDomain('https://example.com/path');  // 'example.com'
isSameDomain('https://example.com', 'https://example.com/path');  // true
```

### Parser Utils

```javascript
import { cleanText, extractEmails, extractPhones } from './src/utils/parser.js';

cleanText('  Hello   World  ');  // 'Hello World'
extractEmails('Contact: john@example.com');  // ['john@example.com']
extractPhones('Call: 123-456-7890');  // ['123-456-7890']
```

### Storage Utils

```javascript
import { Storage, saveScreenshot, generateFilename } from './src/utils/storage.js';

const storage = new Storage('./data');
await storage.saveJson('data.json', { foo: 'bar' });
const data = await storage.loadJson('data.json');
```
