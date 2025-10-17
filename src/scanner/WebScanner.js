import { HttpClient } from '../utils/http.js';
import { HtmlParser } from '../utils/parser.js';
import { TechDetector } from './TechDetector.js';
import { SecurityAnalyzer } from './SecurityAnalyzer.js';

export class WebScanner {
  constructor(options = {}) {
    this.httpClient = new HttpClient(options.http);
    this.options = options;
  }

  async scan(url, options = {}) {
    const mergedOptions = { ...this.options, ...options };

    try {
      const response = await this.httpClient.get(url);
      const html = response.data;
      const headers = response.headers;

      const parser = new HtmlParser(html);
      const techDetector = new TechDetector(html, headers);
      const securityAnalyzer = new SecurityAnalyzer(headers, html);

      const scanResult = {
        url,
        scannedAt: new Date().toISOString(),
        statusCode: response.status,
        responseTime: response.headers['x-response-time'] || 'N/A',
        
        metadata: parser.extractMetadata(),
        
        technology: techDetector.detectAll(),
        
        security: securityAnalyzer.analyzeAll(),
        
        structure: this.analyzeStructure(parser),
        
        seo: this.analyzeSEO(parser, html),
        
        performance: this.analyzePerformance(html, parser),
        
        accessibility: this.analyzeAccessibility(parser),
        
        headers: this.categorizeHeaders(headers)
      };

      if (mergedOptions.full) {
        scanResult.fullHtml = html;
        scanResult.rawHeaders = headers;
      }

      return scanResult;
    } catch (error) {
      throw new Error(`Failed to scan ${url}: ${error.message}`);
    }
  }

  analyzeStructure(parser) {
    const scripts = parser.extractScripts();
    const styles = parser.extractStyles();
    const images = parser.extractImages();
    const links = parser.extractLinks();

    return {
      totalScripts: scripts.length,
      externalScripts: scripts.filter(s => s.src).length,
      inlineScripts: scripts.filter(s => s.inline).length,
      asyncScripts: scripts.filter(s => s.async).length,
      deferScripts: scripts.filter(s => s.defer).length,
      
      totalStyles: styles.length,
      externalStyles: styles.length,
      
      totalImages: images.length,
      imagesWithAlt: images.filter(img => img.alt).length,
      imagesWithoutAlt: images.filter(img => !img.alt).length,
      
      totalLinks: links.length,
      externalLinks: links.filter(link => {
        try {
          const href = link.href;
          return href && (href.startsWith('http') && !href.includes(window?.location?.hostname || ''));
        } catch {
          return false;
        }
      }).length,
      
      forms: parser.extractForms().length,
      tables: parser.extractTables().length
    };
  }

  analyzeSEO(parser, html) {
    const metadata = parser.extractMetadata();
    const headings = parser.extractHeadings();
    
    const issues = [];
    const recommendations = [];

    if (!metadata.title) {
      issues.push('Missing page title');
    } else if (metadata.title.length < 30) {
      recommendations.push('Page title is too short (< 30 characters)');
    } else if (metadata.title.length > 60) {
      recommendations.push('Page title is too long (> 60 characters)');
    }

    if (!metadata.description) {
      issues.push('Missing meta description');
    } else if (metadata.description.length < 120) {
      recommendations.push('Meta description is too short (< 120 characters)');
    } else if (metadata.description.length > 160) {
      recommendations.push('Meta description is too long (> 160 characters)');
    }

    if (headings.h1.length === 0) {
      issues.push('Missing H1 heading');
    } else if (headings.h1.length > 1) {
      recommendations.push('Multiple H1 headings found, should have only one');
    }

    if (!metadata.canonical) {
      recommendations.push('Missing canonical URL');
    }

    if (!metadata.ogTitle && !metadata.ogDescription) {
      recommendations.push('Missing Open Graph tags');
    }

    const hasStructuredData = parser.extractStructuredData().length > 0;

    return {
      score: this.calculateSEOScore(issues, recommendations),
      issues,
      recommendations,
      headingsStructure: headings,
      hasStructuredData,
      structuredDataTypes: parser.extractStructuredData().map(sd => sd['@type']).filter(Boolean),
      wordCount: parser.getWordCount()
    };
  }

  calculateSEOScore(issues, recommendations) {
    let score = 100;
    score -= issues.length * 15;
    score -= recommendations.length * 5;
    return Math.max(0, score);
  }

  analyzePerformance(html, parser) {
    const htmlSize = Buffer.byteLength(html, 'utf8');
    const scripts = parser.extractScripts();
    const styles = parser.extractStyles();
    const images = parser.extractImages();

    const issues = [];

    if (htmlSize > 100000) {
      issues.push('Large HTML size (> 100KB)');
    }

    if (scripts.filter(s => !s.async && !s.defer && s.src).length > 0) {
      issues.push('Render-blocking scripts detected');
    }

    if (images.filter(img => !img.loading || img.loading !== 'lazy').length > 5) {
      issues.push('Images without lazy loading');
    }

    return {
      htmlSize,
      htmlSizeFormatted: this.formatBytes(htmlSize),
      totalResources: scripts.length + styles.length + images.length,
      externalResources: scripts.filter(s => s.src).length + styles.length,
      issues,
      score: Math.max(0, 100 - (issues.length * 20))
    };
  }

  analyzeAccessibility(parser) {
    const images = parser.extractImages();
    const forms = parser.extractForms();
    
    const issues = [];

    const imagesWithoutAlt = images.filter(img => !img.alt);
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} images without alt text`);
    }

    const lang = parser.getAttr('html', 'lang');
    if (!lang) {
      issues.push('Missing lang attribute on html element');
    }

    let inputsWithoutLabels = 0;
    for (const form of forms) {
      for (const input of form.inputs) {
        if (!input.id && input.type !== 'hidden' && input.type !== 'submit') {
          inputsWithoutLabels++;
        }
      }
    }

    if (inputsWithoutLabels > 0) {
      issues.push(`${inputsWithoutLabels} form inputs may be missing labels`);
    }

    return {
      score: Math.max(0, 100 - (issues.length * 15)),
      issues,
      hasLangAttribute: !!lang,
      langValue: lang
    };
  }

  categorizeHeaders(headers) {
    return {
      security: this.filterHeaders(headers, [
        'strict-transport-security',
        'content-security-policy',
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ]),
      caching: this.filterHeaders(headers, [
        'cache-control',
        'expires',
        'etag',
        'last-modified'
      ]),
      cors: this.filterHeaders(headers, [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ]),
      server: this.filterHeaders(headers, [
        'server',
        'x-powered-by'
      ])
    };
  }

  filterHeaders(headers, names) {
    const filtered = {};
    for (const name of names) {
      for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === name.toLowerCase()) {
          filtered[key] = value;
        }
      }
    }
    return filtered;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
