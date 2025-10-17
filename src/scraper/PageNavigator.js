import puppeteer from 'puppeteer';

export class PageNavigator {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false ? 'new' : false,
      timeout: options.timeout || 30000,
      waitUntil: options.waitUntil || 'networkidle2',
      ...options
    };
    this.browser = null;
  }

  async launch() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async navigate(url) {
    const browser = await this.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(url, {
      waitUntil: this.options.waitUntil,
      timeout: this.options.timeout
    });

    return page;
  }

  async getRenderedHtml(url) {
    const page = await this.navigate(url);
    
    await page.waitForTimeout(2000);

    const html = await page.content();
    await page.close();
    
    return html;
  }

  async takeScreenshot(url, options = {}) {
    const page = await this.navigate(url);
    
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot({
      fullPage: options.fullPage !== false,
      type: options.type || 'png',
      ...options
    });

    await page.close();
    return screenshot;
  }

  async extractWithJavaScript(url, extractFn) {
    const page = await this.navigate(url);
    
    await page.waitForTimeout(2000);

    const data = await page.evaluate(extractFn);
    await page.close();
    
    return data;
  }

  async waitForSelector(url, selector, timeout = 30000) {
    const page = await this.navigate(url);
    
    try {
      await page.waitForSelector(selector, { timeout });
      const html = await page.content();
      await page.close();
      return html;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  async clickAndWait(url, selector, waitTime = 2000) {
    const page = await this.navigate(url);
    
    await page.click(selector);
    await page.waitForTimeout(waitTime);
    
    const html = await page.content();
    await page.close();
    
    return html;
  }

  async scrollToBottom(url) {
    const page = await this.navigate(url);
    
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    const html = await page.content();
    await page.close();
    
    return html;
  }

  async getMetrics(url) {
    const page = await this.navigate(url);
    
    const metrics = await page.metrics();
    const performance = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        responseTime: perfData.responseEnd - perfData.requestStart
      };
    });

    await page.close();
    
    return {
      ...metrics,
      ...performance
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
