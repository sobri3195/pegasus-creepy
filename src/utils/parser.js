import * as cheerio from 'cheerio';
import { parse } from 'node-html-parser';

export class HtmlParser {
  constructor(html) {
    this.html = html;
    this.$ = cheerio.load(html);
    this.root = parse(html);
  }

  getText(selector) {
    return this.$(selector).text().trim();
  }

  getAttr(selector, attr) {
    return this.$(selector).attr(attr);
  }

  getAll(selector) {
    const elements = [];
    this.$(selector).each((i, el) => {
      elements.push(this.$(el));
    });
    return elements;
  }

  extractMetadata() {
    const metadata = {
      title: this.getText('title'),
      description: this.getAttr('meta[name="description"]', 'content') || 
                   this.getAttr('meta[property="og:description"]', 'content'),
      keywords: this.getAttr('meta[name="keywords"]', 'content'),
      author: this.getAttr('meta[name="author"]', 'content'),
      robots: this.getAttr('meta[name="robots"]', 'content'),
      viewport: this.getAttr('meta[name="viewport"]', 'content'),
      charset: this.getAttr('meta[charset]', 'charset') || 
               this.getAttr('meta[http-equiv="Content-Type"]', 'content'),
      canonical: this.getAttr('link[rel="canonical"]', 'href'),
      ogTitle: this.getAttr('meta[property="og:title"]', 'content'),
      ogType: this.getAttr('meta[property="og:type"]', 'content'),
      ogImage: this.getAttr('meta[property="og:image"]', 'content'),
      ogUrl: this.getAttr('meta[property="og:url"]', 'content'),
      twitterCard: this.getAttr('meta[name="twitter:card"]', 'content'),
      twitterSite: this.getAttr('meta[name="twitter:site"]', 'content')
    };

    return metadata;
  }

  extractLinks() {
    const links = [];
    this.$('a[href]').each((i, el) => {
      const $el = this.$(el);
      links.push({
        href: $el.attr('href'),
        text: $el.text().trim(),
        title: $el.attr('title'),
        rel: $el.attr('rel'),
        target: $el.attr('target')
      });
    });
    return links;
  }

  extractImages() {
    const images = [];
    this.$('img').each((i, el) => {
      const $el = this.$(el);
      images.push({
        src: $el.attr('src'),
        alt: $el.attr('alt'),
        title: $el.attr('title'),
        width: $el.attr('width'),
        height: $el.attr('height'),
        loading: $el.attr('loading')
      });
    });
    return images;
  }

  extractScripts() {
    const scripts = [];
    this.$('script').each((i, el) => {
      const $el = this.$(el);
      scripts.push({
        src: $el.attr('src'),
        type: $el.attr('type'),
        async: $el.attr('async') !== undefined,
        defer: $el.attr('defer') !== undefined,
        inline: !$el.attr('src')
      });
    });
    return scripts;
  }

  extractStyles() {
    const styles = [];
    this.$('link[rel="stylesheet"]').each((i, el) => {
      const $el = this.$(el);
      styles.push({
        href: $el.attr('href'),
        media: $el.attr('media')
      });
    });
    return styles;
  }

  extractStructuredData() {
    const structuredData = [];
    
    this.$('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse(this.$(el).html());
        structuredData.push(data);
      } catch (e) {
        console.error('Failed to parse JSON-LD:', e.message);
      }
    });

    return structuredData;
  }

  extractHeadings() {
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };

    for (let i = 1; i <= 6; i++) {
      this.$(`h${i}`).each((idx, el) => {
        headings[`h${i}`].push(this.$(el).text().trim());
      });
    }

    return headings;
  }

  extractForms() {
    const forms = [];
    this.$('form').each((i, el) => {
      const $form = this.$(el);
      const inputs = [];
      
      $form.find('input, textarea, select').each((idx, input) => {
        const $input = this.$(input);
        inputs.push({
          name: $input.attr('name'),
          type: $input.attr('type') || input.tagName.toLowerCase(),
          id: $input.attr('id'),
          required: $input.attr('required') !== undefined,
          placeholder: $input.attr('placeholder')
        });
      });

      forms.push({
        action: $form.attr('action'),
        method: $form.attr('method') || 'GET',
        id: $form.attr('id'),
        name: $form.attr('name'),
        inputs
      });
    });

    return forms;
  }

  extractTables() {
    const tables = [];
    this.$('table').each((i, el) => {
      const $table = this.$(el);
      const headers = [];
      const rows = [];

      $table.find('thead th, thead td').each((idx, th) => {
        headers.push(this.$(th).text().trim());
      });

      $table.find('tbody tr').each((idx, tr) => {
        const row = [];
        this.$(tr).find('td').each((cellIdx, td) => {
          row.push(this.$(td).text().trim());
        });
        if (row.length > 0) {
          rows.push(row);
        }
      });

      tables.push({ headers, rows });
    });

    return tables;
  }

  getWordCount() {
    const text = this.$('body').text();
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  getTextContent() {
    return this.$('body').text().replace(/\s+/g, ' ').trim();
  }
}

export function cleanText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

export function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
}

export function extractPhones(text) {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
  return text.match(phoneRegex) || [];
}
