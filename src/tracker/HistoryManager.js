import { Storage } from '../utils/storage.js';
import crypto from 'crypto';

export class HistoryManager {
  constructor(options = {}) {
    this.storage = new Storage(options.storagePath || './data/history');
  }

  generateUrlKey(url) {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/\./g, '-');
    const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
    return `${domain}_${hash}`;
  }

  async saveSnapshot(url, data) {
    const urlKey = this.generateUrlKey(url);
    const timestamp = new Date().toISOString();
    const filename = `${urlKey}_${timestamp.replace(/[:.]/g, '-')}.json`;

    const snapshot = {
      url,
      timestamp,
      data
    };

    await this.storage.saveJson(filename, snapshot);
    
    await this.updateIndex(url, {
      timestamp,
      filename
    });

    return filename;
  }

  async loadLatestSnapshot(url) {
    const index = await this.loadIndex(url);
    if (!index || index.snapshots.length === 0) {
      return null;
    }

    const latest = index.snapshots[index.snapshots.length - 1];
    return await this.storage.loadJson(latest.filename);
  }

  async loadAllSnapshots(url) {
    const index = await this.loadIndex(url);
    if (!index || index.snapshots.length === 0) {
      return [];
    }

    const snapshots = [];
    for (const entry of index.snapshots) {
      const snapshot = await this.storage.loadJson(entry.filename);
      if (snapshot) {
        snapshots.push(snapshot);
      }
    }

    return snapshots;
  }

  async getHistory(url) {
    const index = await this.loadIndex(url);
    if (!index) {
      return {
        url,
        totalSnapshots: 0,
        firstSnapshot: null,
        lastSnapshot: null,
        snapshots: []
      };
    }

    return {
      url,
      totalSnapshots: index.snapshots.length,
      firstSnapshot: index.snapshots[0]?.timestamp || null,
      lastSnapshot: index.snapshots[index.snapshots.length - 1]?.timestamp || null,
      snapshots: index.snapshots
    };
  }

  async compareSnapshots(url, timestamp1, timestamp2) {
    const snapshots = await this.loadAllSnapshots(url);
    
    const snapshot1 = snapshots.find(s => s.timestamp === timestamp1);
    const snapshot2 = snapshots.find(s => s.timestamp === timestamp2);

    if (!snapshot1 || !snapshot2) {
      throw new Error('One or both snapshots not found');
    }

    return {
      url,
      timestamp1,
      timestamp2,
      snapshot1: snapshot1.data,
      snapshot2: snapshot2.data,
      timeDiff: new Date(timestamp2) - new Date(timestamp1)
    };
  }

  async deleteOldSnapshots(url, keepCount = 10) {
    const index = await this.loadIndex(url);
    if (!index || index.snapshots.length <= keepCount) {
      return 0;
    }

    const toDelete = index.snapshots.slice(0, -keepCount);
    let deleted = 0;

    for (const entry of toDelete) {
      const success = await this.storage.delete(entry.filename);
      if (success) deleted++;
    }

    index.snapshots = index.snapshots.slice(-keepCount);
    await this.saveIndex(url, index);

    return deleted;
  }

  async updateIndex(url, snapshot) {
    let index = await this.loadIndex(url);
    
    if (!index) {
      index = {
        url,
        snapshots: []
      };
    }

    index.snapshots.push(snapshot);
    await this.saveIndex(url, index);
  }

  async loadIndex(url) {
    const urlKey = this.generateUrlKey(url);
    const filename = `${urlKey}_index.json`;
    return await this.storage.loadJson(filename);
  }

  async saveIndex(url, index) {
    const urlKey = this.generateUrlKey(url);
    const filename = `${urlKey}_index.json`;
    await this.storage.saveJson(filename, index);
  }

  async getAllTrackedUrls() {
    const files = await this.storage.list('*_index.json');
    const urls = [];

    for (const file of files) {
      const index = await this.storage.loadJson(file);
      if (index && index.url) {
        urls.push({
          url: index.url,
          totalSnapshots: index.snapshots.length,
          lastSnapshot: index.snapshots[index.snapshots.length - 1]?.timestamp
        });
      }
    }

    return urls;
  }

  async exportHistory(url, format = 'json') {
    const history = await this.getHistory(url);
    const snapshots = await this.loadAllSnapshots(url);

    const exportData = {
      url,
      exportedAt: new Date().toISOString(),
      history,
      snapshots
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    }

    return exportData;
  }

  async clearHistory(url) {
    const index = await this.loadIndex(url);
    if (!index) return 0;

    let deleted = 0;
    for (const entry of index.snapshots) {
      const success = await this.storage.delete(entry.filename);
      if (success) deleted++;
    }

    const urlKey = this.generateUrlKey(url);
    await this.storage.delete(`${urlKey}_index.json`);

    return deleted;
  }
}
