import axios from 'axios';
import UserAgent from 'user-agents';

export class HttpClient {
  constructor(options = {}) {
    this.timeout = options.timeout || 30000;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.headers = options.headers || {};
  }

  async get(url, options = {}) {
    const userAgent = new UserAgent();
    const config = {
      url,
      method: 'GET',
      timeout: this.timeout,
      headers: {
        'User-Agent': userAgent.toString(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...this.headers,
        ...options.headers
      },
      validateStatus: () => true,
      ...options
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(config);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }
    throw lastError;
  }

  async post(url, data, options = {}) {
    const userAgent = new UserAgent();
    const config = {
      url,
      method: 'POST',
      data,
      timeout: this.timeout,
      headers: {
        'User-Agent': userAgent.toString(),
        'Content-Type': 'application/json',
        ...this.headers,
        ...options.headers
      },
      validateStatus: () => true,
      ...options
    };

    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios(config);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }
    throw lastError;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(url, baseUrl) {
  try {
    if (url.startsWith('//')) {
      return new URL('https:' + url).href;
    }
    if (url.startsWith('/')) {
      const base = new URL(baseUrl);
      return new URL(url, base.origin).href;
    }
    if (!url.startsWith('http')) {
      return new URL(url, baseUrl).href;
    }
    return new URL(url).href;
  } catch {
    return url;
  }
}

export function getDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

export function isSameDomain(url1, url2) {
  return getDomain(url1) === getDomain(url2);
}
