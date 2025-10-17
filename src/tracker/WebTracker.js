import { WebScraper } from '../scraper/WebScraper.js';
import { ChangeDetector } from './ChangeDetector.js';
import { HistoryManager } from './HistoryManager.js';

export class WebTracker {
  constructor(options = {}) {
    this.scraper = new WebScraper(options.scraper);
    this.changeDetector = new ChangeDetector();
    this.historyManager = new HistoryManager(options.history);
    this.intervals = new Map();
    this.options = options;
  }

  async track(url, options = {}) {
    const mergedOptions = { ...this.options, ...options };

    const currentData = await this.scraper.scrape(url, {
      useJavaScript: mergedOptions.useJavaScript,
      takeScreenshot: mergedOptions.takeScreenshot
    });

    const previousSnapshot = await this.historyManager.loadLatestSnapshot(url);

    let changes = null;
    if (previousSnapshot) {
      changes = this.changeDetector.detectChanges(
        previousSnapshot.data,
        currentData
      );

      if (mergedOptions.takeScreenshot && previousSnapshot.data.screenshot && currentData.screenshot) {
        const screenshotComparison = this.changeDetector.compareScreenshots(
          Buffer.from(previousSnapshot.data.screenshot),
          Buffer.from(currentData.screenshot)
        );
        changes.screenshotComparison = screenshotComparison;
      }
    }

    const filename = await this.historyManager.saveSnapshot(url, currentData);

    const result = {
      url,
      timestamp: new Date().toISOString(),
      filename,
      isFirstSnapshot: !previousSnapshot,
      changes: changes || { detected: false, message: 'First snapshot' }
    };

    if (changes && changes.detected && mergedOptions.onChange) {
      await mergedOptions.onChange(changes, currentData);
    }

    return result;
  }

  async startTracking(url, options = {}) {
    const interval = options.interval || 3600000;
    const trackingId = `${url}_${Date.now()}`;

    const intervalId = setInterval(async () => {
      try {
        console.log(`[${new Date().toISOString()}] Tracking: ${url}`);
        const result = await this.track(url, options);
        
        if (result.changes.detected) {
          console.log(`Changes detected for ${url}:`);
          console.log(JSON.stringify(result.changes.summary, null, 2));
        }
      } catch (error) {
        console.error(`Error tracking ${url}:`, error.message);
        
        if (options.onError) {
          await options.onError(error);
        }
      }
    }, interval);

    this.intervals.set(trackingId, intervalId);

    await this.track(url, options);

    return {
      trackingId,
      url,
      interval,
      startedAt: new Date().toISOString()
    };
  }

  stopTracking(trackingId) {
    const intervalId = this.intervals.get(trackingId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(trackingId);
      return true;
    }
    return false;
  }

  stopAllTracking() {
    for (const [trackingId, intervalId] of this.intervals.entries()) {
      clearInterval(intervalId);
    }
    this.intervals.clear();
  }

  getActiveTracking() {
    return Array.from(this.intervals.keys());
  }

  async getHistory(url) {
    return await this.historyManager.getHistory(url);
  }

  async getTrackedUrls() {
    return await this.historyManager.getAllTrackedUrls();
  }

  async compareSnapshots(url, timestamp1, timestamp2) {
    const comparison = await this.historyManager.compareSnapshots(url, timestamp1, timestamp2);
    const changes = this.changeDetector.detectChanges(
      comparison.snapshot1,
      comparison.snapshot2
    );

    return {
      ...comparison,
      changes
    };
  }

  async exportHistory(url, format = 'json') {
    return await this.historyManager.exportHistory(url, format);
  }

  async cleanupHistory(url, keepCount = 10) {
    return await this.historyManager.deleteOldSnapshots(url, keepCount);
  }

  async clearHistory(url) {
    return await this.historyManager.clearHistory(url);
  }

  async generateReport(url) {
    const history = await this.getHistory(url);
    const snapshots = await this.historyManager.loadAllSnapshots(url);

    if (snapshots.length < 2) {
      return {
        url,
        message: 'Not enough data for report (need at least 2 snapshots)',
        history
      };
    }

    const changes = [];
    for (let i = 1; i < snapshots.length; i++) {
      const change = this.changeDetector.detectChanges(
        snapshots[i - 1].data,
        snapshots[i].data
      );
      
      if (change.detected) {
        changes.push({
          from: snapshots[i - 1].timestamp,
          to: snapshots[i].timestamp,
          changes: change
        });
      }
    }

    return {
      url,
      history,
      totalChanges: changes.length,
      changes,
      generatedAt: new Date().toISOString()
    };
  }

  async close() {
    this.stopAllTracking();
    await this.scraper.close();
  }
}
