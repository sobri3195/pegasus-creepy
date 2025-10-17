export class TechDetector {
  constructor(html, headers = {}) {
    this.html = html;
    this.headers = headers;
  }

  detectAll() {
    return {
      cms: this.detectCMS(),
      frameworks: this.detectFrameworks(),
      libraries: this.detectLibraries(),
      analytics: this.detectAnalytics(),
      advertising: this.detectAdvertising(),
      server: this.detectServer(),
      language: this.detectLanguage(),
      cdn: this.detectCDN()
    };
  }

  detectCMS() {
    const cms = [];

    const patterns = {
      'WordPress': [
        /wp-content/i,
        /wp-includes/i,
        /<meta name="generator" content="WordPress/i
      ],
      'Joomla': [
        /\/components\/com_/i,
        /<meta name="generator" content="Joomla/i
      ],
      'Drupal': [
        /sites\/all\/modules/i,
        /<meta name="Generator" content="Drupal/i
      ],
      'Magento': [
        /\/skin\/frontend\//i,
        /Mage\.Cookies/i
      ],
      'Shopify': [
        /cdn\.shopify\.com/i,
        /\/assets\/shopify_pay/i
      ],
      'Wix': [
        /static\.wixstatic\.com/i,
        /parastorage\.com/i
      ],
      'Squarespace': [
        /static\.squarespace\.com/i
      ],
      'Ghost': [
        /ghost\.min\.js/i,
        /<meta name="generator" content="Ghost/i
      ],
      'Blogger': [
        /\.blogger\.com/i,
        /<meta content='blogger'/i
      ],
      'PrestaShop': [
        /\/modules\/prestashop/i
      ]
    };

    for (const [name, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(this.html)) {
          cms.push(name);
          break;
        }
      }
    }

    return [...new Set(cms)];
  }

  detectFrameworks() {
    const frameworks = [];

    const patterns = {
      'React': [
        /__REACT/i,
        /react\.production\.min\.js/i,
        /react-dom/i
      ],
      'Vue.js': [
        /vue\.js/i,
        /vue\.min\.js/i,
        /__VUE__/i
      ],
      'Angular': [
        /ng-version/i,
        /angular\.js/i,
        /angular\.min\.js/i
      ],
      'Next.js': [
        /_next\/static/i,
        /__NEXT_DATA__/i
      ],
      'Nuxt.js': [
        /__NUXT__/i,
        /_nuxt\//i
      ],
      'Svelte': [
        /svelte\.js/i
      ],
      'Bootstrap': [
        /bootstrap\.min\.css/i,
        /bootstrap\.min\.js/i
      ],
      'Tailwind CSS': [
        /tailwindcss/i
      ],
      'jQuery': [
        /jquery\.min\.js/i,
        /jquery-[0-9]/i
      ],
      'Gatsby': [
        /gatsby-/i
      ],
      'Ember.js': [
        /ember\.js/i
      ]
    };

    for (const [name, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(this.html)) {
          frameworks.push(name);
          break;
        }
      }
    }

    return [...new Set(frameworks)];
  }

  detectLibraries() {
    const libraries = [];

    const patterns = {
      'Lodash': [/lodash\.min\.js/i],
      'Moment.js': [/moment\.js/i],
      'Chart.js': [/chart\.js/i],
      'D3.js': [/d3\.js/i, /d3\.min\.js/i],
      'Three.js': [/three\.js/i],
      'Socket.io': [/socket\.io/i],
      'Axios': [/axios\.min\.js/i],
      'Swiper': [/swiper/i],
      'AOS': [/aos\.js/i],
      'GSAP': [/gsap/i]
    };

    for (const [name, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(this.html)) {
          libraries.push(name);
          break;
        }
      }
    }

    return [...new Set(libraries)];
  }

  detectAnalytics() {
    const analytics = [];

    const patterns = {
      'Google Analytics': [
        /google-analytics\.com\/analytics\.js/i,
        /googletagmanager\.com\/gtag/i,
        /ga\(/
      ],
      'Google Tag Manager': [
        /googletagmanager\.com\/gtm\.js/i
      ],
      'Facebook Pixel': [
        /connect\.facebook\.net\/.*\/fbevents\.js/i,
        /fbq\(/
      ],
      'Hotjar': [
        /static\.hotjar\.com/i
      ],
      'Matomo': [
        /matomo\.js/i,
        /piwik\.js/i
      ],
      'Mixpanel': [
        /mixpanel/i
      ],
      'Segment': [
        /segment\.com/i,
        /analytics\.js/i
      ],
      'Amplitude': [
        /amplitude/i
      ]
    };

    for (const [name, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(this.html)) {
          analytics.push(name);
          break;
        }
      }
    }

    return [...new Set(analytics)];
  }

  detectAdvertising() {
    const advertising = [];

    const patterns = {
      'Google AdSense': [/googlesyndication\.com/i],
      'Google AdWords': [/googleadservices\.com/i],
      'Criteo': [/criteo/i],
      'DoubleClick': [/doubleclick\.net/i],
      'Media.net': [/media\.net/i]
    };

    for (const [name, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(this.html)) {
          advertising.push(name);
          break;
        }
      }
    }

    return [...new Set(advertising)];
  }

  detectServer() {
    const serverHeader = this.headers['server'] || this.headers['Server'] || '';
    const poweredBy = this.headers['x-powered-by'] || this.headers['X-Powered-By'] || '';

    const servers = [];

    if (serverHeader) {
      if (/nginx/i.test(serverHeader)) servers.push('Nginx');
      if (/apache/i.test(serverHeader)) servers.push('Apache');
      if (/iis/i.test(serverHeader)) servers.push('IIS');
      if (/cloudflare/i.test(serverHeader)) servers.push('Cloudflare');
    }

    if (poweredBy) {
      if (/express/i.test(poweredBy)) servers.push('Express.js');
      if (/asp\.net/i.test(poweredBy)) servers.push('ASP.NET');
      if (/php/i.test(poweredBy)) servers.push('PHP');
    }

    return [...new Set(servers)];
  }

  detectLanguage() {
    const languages = [];

    if (/\.php/i.test(this.html) || this.headers['x-powered-by']?.includes('PHP')) {
      languages.push('PHP');
    }
    if (/\.jsp/i.test(this.html) || /java/i.test(this.headers['x-powered-by'] || '')) {
      languages.push('Java');
    }
    if (/\.aspx/i.test(this.html) || /asp\.net/i.test(this.headers['x-powered-by'] || '')) {
      languages.push('ASP.NET');
    }
    if (/\.py/i.test(this.html)) {
      languages.push('Python');
    }
    if (/\.rb/i.test(this.html)) {
      languages.push('Ruby');
    }

    return [...new Set(languages)];
  }

  detectCDN() {
    const cdns = [];

    const patterns = {
      'Cloudflare': [/cloudflare/i],
      'CloudFront': [/cloudfront\.net/i],
      'Akamai': [/akamai/i],
      'Fastly': [/fastly/i],
      'jsDelivr': [/jsdelivr\.net/i],
      'unpkg': [/unpkg\.com/i],
      'cdnjs': [/cdnjs\.cloudflare\.com/i],
      'Google CDN': [/ajax\.googleapis\.com/i]
    };

    for (const [name, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        if (regex.test(this.html) || regex.test(JSON.stringify(this.headers))) {
          cdns.push(name);
          break;
        }
      }
    }

    return [...new Set(cdns)];
  }
}
