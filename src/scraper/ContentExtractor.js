import { HtmlParser, extractEmails, extractPhones } from '../utils/parser.js';
import { normalizeUrl } from '../utils/http.js';

export class ContentExtractor {
  constructor(html, url) {
    this.parser = new HtmlParser(html);
    this.url = url;
  }

  extractAll() {
    return {
      url: this.url,
      timestamp: new Date().toISOString(),
      metadata: this.parser.extractMetadata(),
      content: {
        text: this.parser.getTextContent(),
        wordCount: this.parser.getWordCount(),
        headings: this.parser.extractHeadings()
      },
      links: this.extractNormalizedLinks(),
      images: this.extractNormalizedImages(),
      media: this.extractMedia(),
      scripts: this.parser.extractScripts(),
      styles: this.parser.extractStyles(),
      forms: this.parser.extractForms(),
      tables: this.parser.extractTables(),
      structuredData: this.parser.extractStructuredData(),
      contact: this.extractContactInfo()
    };
  }

  extractNormalizedLinks() {
    const links = this.parser.extractLinks();
    return links.map(link => ({
      ...link,
      href: link.href ? normalizeUrl(link.href, this.url) : null,
      isExternal: link.href ? this.isExternalLink(link.href) : false
    }));
  }

  extractNormalizedImages() {
    const images = this.parser.extractImages();
    return images.map(img => ({
      ...img,
      src: img.src ? normalizeUrl(img.src, this.url) : null
    }));
  }

  extractMedia() {
    const media = {
      videos: [],
      audios: [],
      iframes: []
    };

    this.parser.$('video').each((i, el) => {
      const $el = this.parser.$(el);
      media.videos.push({
        src: $el.attr('src'),
        poster: $el.attr('poster'),
        controls: $el.attr('controls') !== undefined,
        autoplay: $el.attr('autoplay') !== undefined
      });
    });

    this.parser.$('audio').each((i, el) => {
      const $el = this.parser.$(el);
      media.audios.push({
        src: $el.attr('src'),
        controls: $el.attr('controls') !== undefined,
        autoplay: $el.attr('autoplay') !== undefined
      });
    });

    this.parser.$('iframe').each((i, el) => {
      const $el = this.parser.$(el);
      media.iframes.push({
        src: $el.attr('src'),
        width: $el.attr('width'),
        height: $el.attr('height'),
        title: $el.attr('title')
      });
    });

    return media;
  }

  extractContactInfo() {
    const text = this.parser.getTextContent();
    return {
      emails: extractEmails(text),
      phones: extractPhones(text)
    };
  }

  isExternalLink(href) {
    try {
      const linkUrl = normalizeUrl(href, this.url);
      const baseUrl = new URL(this.url);
      const targetUrl = new URL(linkUrl);
      return baseUrl.hostname !== targetUrl.hostname;
    } catch {
      return false;
    }
  }

  extractBySelector(selector) {
    const elements = [];
    this.parser.$(selector).each((i, el) => {
      const $el = this.parser.$(el);
      elements.push({
        html: $el.html(),
        text: $el.text().trim(),
        attributes: el.attribs
      });
    });
    return elements;
  }

  extractCustomData(selectors) {
    const data = {};
    for (const [key, selector] of Object.entries(selectors)) {
      data[key] = this.extractBySelector(selector);
    }
    return data;
  }
}
