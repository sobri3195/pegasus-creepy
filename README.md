# Deep Web Scraper, Scanner & Tracker

Sistem lengkap untuk web scraping, scanning, dan tracking mendalam menggunakan Node.js.

## Fitur

### 🕷️ Deep Web Scraping
- Ekstraksi konten HTML dengan Cheerio
- Rendering JavaScript dengan Puppeteer
- Ekstraksi metadata (title, description, keywords)
- Ekstraksi gambar, link, dan media
- Ekstraksi structured data (JSON-LD, microdata)
- Support untuk pagination
- Rate limiting dan retry logic
- User-agent rotation

### 🔍 Deep Web Scanning
- Deteksi teknologi website (CMS, framework, library)
- Analisis struktur HTML
- Scan meta tags dan SEO
- Deteksi security headers
- Analisis performance metrics
- Ekstraksi cookies dan storage
- Network request analysis
- SSL/TLS information

### 📊 Deep Web Tracking
- Monitor perubahan konten website
- Track perubahan struktur HTML
- Deteksi perubahan visual (screenshot diff)
- Histori perubahan lengkap
- Alert system untuk perubahan signifikan
- Scheduled monitoring
- Comparison reports

## Instalasi

```bash
npm install
```

## Penggunaan

### Web Scraping

```bash
# Scrape single page
npm run scrape -- --url https://example.com

# Scrape dengan opsi lengkap
npm run scrape -- --url https://example.com --output data.json --depth 2 --javascript
```

### Web Scanning

```bash
# Scan website
npm run scan -- --url https://example.com

# Scan dengan report detail
npm run scan -- --url https://example.com --full --output report.json
```

### Web Tracking

```bash
# Track website
npm run track -- --url https://example.com --interval 3600

# Track dengan screenshot
npm run track -- --url https://example.com --interval 3600 --screenshot
```

### Programmatic Usage

```javascript
import { WebScraper, WebScanner, WebTracker } from './src/index.js';

// Scraping
const scraper = new WebScraper();
const data = await scraper.scrape('https://example.com');

// Scanning
const scanner = new WebScanner();
const report = await scanner.scan('https://example.com');

// Tracking
const tracker = new WebTracker();
await tracker.track('https://example.com', {
  interval: 3600,
  onChange: (changes) => console.log('Detected changes:', changes)
});
```

## Struktur Proyek

```
├── src/
│   ├── index.js                 # Main entry point
│   ├── scraper/
│   │   ├── WebScraper.js        # Core scraper
│   │   ├── ContentExtractor.js  # Content extraction
│   │   └── PageNavigator.js     # Page navigation
│   ├── scanner/
│   │   ├── WebScanner.js        # Core scanner
│   │   ├── TechDetector.js      # Technology detection
│   │   └── SecurityAnalyzer.js  # Security analysis
│   ├── tracker/
│   │   ├── WebTracker.js        # Core tracker
│   │   ├── ChangeDetector.js    # Change detection
│   │   └── HistoryManager.js    # History management
│   ├── utils/
│   │   ├── http.js              # HTTP utilities
│   │   ├── parser.js            # Parsing utilities
│   │   └── storage.js           # Storage utilities
│   └── cli/
│       ├── scrape.js            # Scraping CLI
│       ├── scan.js              # Scanning CLI
│       └── track.js             # Tracking CLI
├── package.json
└── README.md
```

## Lisensi

MIT
