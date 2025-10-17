import { HttpClient, isValidUrl, isSameDomain } from '../utils/http.js';
import { ContentExtractor } from './ContentExtractor.js';
import { PageNavigator } from './PageNavigator.js';

export class WebScraper {
  constructor(options = {}) {
    this.httpClient = new HttpClient(options.http);
    this.options = {
      maxDepth: options.maxDepth || 1,
      maxPages: options.maxPages || 50,
      useJavaScript: options.useJavaScript || false,
      followLinks: options.followLinks !== false,
      respectRobots: options.respectRobots !== false,
      delay: options.delay || 1000,
      sameOrigin: options.sameOrigin !== false,
      ...options
    };
    this.navigator = null;
    this.visited = new Set();
    this.queue = [];
  }

  async scrape(url, options = {}) {
    if (!isValidUrl(url)) {
      throw new Error('Invalid URL provided');
    }

    const mergedOptions = { ...this.options, ...options };
    
    if (mergedOptions.useJavaScript) {
      return await this.scrapeWithJavaScript(url, mergedOptions);
    } else {
      return await this.scrapeStatic(url, mergedOptions);
    }
  }

  async scrapeStatic(url, options = {}) {
    try {
      const response = await this.httpClient.get(url);
      
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = response.data;
      const extractor = new ContentExtractor(html, url);
      const data = extractor.extractAll();

      data.statusCode = response.status;
      data.headers = response.headers;
      data.scrapedAt = new Date().toISOString();

      if (options.customSelectors) {
        data.custom = extractor.extractCustomData(options.customSelectors);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
  }

  async scrapeWithJavaScript(url, options = {}) {
    if (!this.navigator) {
      this.navigator = new PageNavigator({
        headless: options.headless,
        timeout: options.timeout
      });
    }

    try {
      const html = await this.navigator.getRenderedHtml(url);
      const extractor = new ContentExtractor(html, url);
      const data = extractor.extractAll();

      data.scrapedAt = new Date().toISOString();
      data.renderedWithJavaScript = true;

      if (options.takeScreenshot) {
        data.screenshot = await this.navigator.takeScreenshot(url);
      }

      if (options.getMetrics) {
        data.metrics = await this.navigator.getMetrics(url);
      }

      if (options.customSelectors) {
        data.custom = extractor.extractCustomData(options.customSelectors);
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to scrape with JavaScript ${url}: ${error.message}`);
    }
  }

  async scrapeDeep(startUrl, options = {}) {
    const mergedOptions = { ...this.options, ...options };
    const results = [];
    
    this.queue = [{ url: startUrl, depth: 0 }];
    this.visited.clear();

    while (this.queue.length > 0 && results.length < mergedOptions.maxPages) {
      const { url, depth } = this.queue.shift();

      if (this.visited.has(url) || depth > mergedOptions.maxDepth) {
        continue;
      }

      console.log(`Scraping [depth ${depth}]: ${url}`);
      this.visited.add(url);

      try {
        const data = await this.scrape(url, mergedOptions);
        results.push(data);

        if (mergedOptions.followLinks && depth < mergedOptions.maxDepth) {
          const internalLinks = data.links
            .filter(link => link.href && !link.isExternal)
            .map(link => link.href)
            .filter(href => {
              if (!isValidUrl(href)) return false;
              if (this.visited.has(href)) return false;
              if (mergedOptions.sameOrigin && !isSameDomain(href, startUrl)) return false;
              return true;
            });

          for (const link of internalLinks) {
            this.queue.push({ url: link, depth: depth + 1 });
          }
        }

        if (mergedOptions.delay > 0) {
          await this.sleep(mergedOptions.delay);
        }
      } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        results.push({
          url,
          error: error.message,
          scrapedAt: new Date().toISOString()
        });
      }
    }

    return {
      startUrl,
      totalPages: results.length,
      scrapedAt: new Date().toISOString(),
      pages: results
    };
  }

  async scrapeSitemap(sitemapUrl) {
    try {
      const response = await this.httpClient.get(sitemapUrl);
      const html = response.data;
      
      const urlRegex = /<loc>(.*?)<\/loc>/g;
      const urls = [];
      let match;
      
      while ((match = urlRegex.exec(html)) !== null) {
        urls.push(match[1]);
      }

      return urls;
    } catch (error) {
      throw new Error(`Failed to scrape sitemap: ${error.message}`);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.navigator) {
      await this.navigator.close();
    }
  }
}
