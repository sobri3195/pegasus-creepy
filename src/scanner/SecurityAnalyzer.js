export class SecurityAnalyzer {
  constructor(headers = {}, html = '') {
    this.headers = headers;
    this.html = html;
  }

  analyzeAll() {
    return {
      securityHeaders: this.analyzeSecurityHeaders(),
      ssl: this.analyzeSSL(),
      cookies: this.analyzeCookies(),
      vulnerabilities: this.detectVulnerabilities(),
      score: this.calculateSecurityScore()
    };
  }

  analyzeSecurityHeaders() {
    const headers = {
      'Strict-Transport-Security': {
        present: this.hasHeader('strict-transport-security'),
        value: this.getHeader('strict-transport-security'),
        recommendation: 'Should be present to enforce HTTPS'
      },
      'Content-Security-Policy': {
        present: this.hasHeader('content-security-policy'),
        value: this.getHeader('content-security-policy'),
        recommendation: 'Should be present to prevent XSS attacks'
      },
      'X-Content-Type-Options': {
        present: this.hasHeader('x-content-type-options'),
        value: this.getHeader('x-content-type-options'),
        recommendation: 'Should be set to "nosniff"'
      },
      'X-Frame-Options': {
        present: this.hasHeader('x-frame-options'),
        value: this.getHeader('x-frame-options'),
        recommendation: 'Should be set to prevent clickjacking'
      },
      'X-XSS-Protection': {
        present: this.hasHeader('x-xss-protection'),
        value: this.getHeader('x-xss-protection'),
        recommendation: 'Should be set to "1; mode=block"'
      },
      'Referrer-Policy': {
        present: this.hasHeader('referrer-policy'),
        value: this.getHeader('referrer-policy'),
        recommendation: 'Should be set to control referrer information'
      },
      'Permissions-Policy': {
        present: this.hasHeader('permissions-policy'),
        value: this.getHeader('permissions-policy'),
        recommendation: 'Should be set to control browser features'
      }
    };

    return headers;
  }

  analyzeSSL() {
    const protocol = this.getHeader('x-forwarded-proto') || '';
    
    return {
      enabled: protocol === 'https',
      httpRedirect: this.hasHeader('strict-transport-security'),
      hstsEnabled: this.hasHeader('strict-transport-security'),
      hstsMaxAge: this.extractHSTSMaxAge()
    };
  }

  analyzeCookies() {
    const setCookie = this.getHeader('set-cookie') || '';
    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];

    return cookies.filter(c => c).map(cookie => {
      return {
        cookie: cookie.split(';')[0],
        secure: /secure/i.test(cookie),
        httpOnly: /httponly/i.test(cookie),
        sameSite: this.extractSameSite(cookie)
      };
    });
  }

  detectVulnerabilities() {
    const vulnerabilities = [];

    if (!this.hasHeader('strict-transport-security')) {
      vulnerabilities.push({
        severity: 'medium',
        issue: 'Missing HSTS header',
        description: 'The site does not enforce HTTPS connections'
      });
    }

    if (!this.hasHeader('content-security-policy')) {
      vulnerabilities.push({
        severity: 'high',
        issue: 'Missing CSP header',
        description: 'The site is vulnerable to XSS attacks'
      });
    }

    if (!this.hasHeader('x-frame-options')) {
      vulnerabilities.push({
        severity: 'medium',
        issue: 'Missing X-Frame-Options',
        description: 'The site may be vulnerable to clickjacking'
      });
    }

    if (!this.hasHeader('x-content-type-options')) {
      vulnerabilities.push({
        severity: 'low',
        issue: 'Missing X-Content-Type-Options',
        description: 'The site may be vulnerable to MIME type sniffing'
      });
    }

    if (this.getHeader('server')) {
      vulnerabilities.push({
        severity: 'low',
        issue: 'Server header exposed',
        description: 'Server information is publicly visible'
      });
    }

    if (this.getHeader('x-powered-by')) {
      vulnerabilities.push({
        severity: 'low',
        issue: 'X-Powered-By header exposed',
        description: 'Technology stack information is publicly visible'
      });
    }

    const inlineScripts = (this.html.match(/<script(?![^>]*src=)[^>]*>/gi) || []).length;
    if (inlineScripts > 0 && !this.hasHeader('content-security-policy')) {
      vulnerabilities.push({
        severity: 'medium',
        issue: 'Inline scripts without CSP',
        description: `Found ${inlineScripts} inline scripts without CSP protection`
      });
    }

    return vulnerabilities;
  }

  calculateSecurityScore() {
    let score = 100;
    const vulnerabilities = this.detectVulnerabilities();

    for (const vuln of vulnerabilities) {
      if (vuln.severity === 'high') score -= 20;
      else if (vuln.severity === 'medium') score -= 10;
      else if (vuln.severity === 'low') score -= 5;
    }

    return Math.max(0, score);
  }

  hasHeader(headerName) {
    const normalizedName = headerName.toLowerCase();
    for (const key of Object.keys(this.headers)) {
      if (key.toLowerCase() === normalizedName) {
        return true;
      }
    }
    return false;
  }

  getHeader(headerName) {
    const normalizedName = headerName.toLowerCase();
    for (const [key, value] of Object.entries(this.headers)) {
      if (key.toLowerCase() === normalizedName) {
        return value;
      }
    }
    return null;
  }

  extractHSTSMaxAge() {
    const hsts = this.getHeader('strict-transport-security');
    if (!hsts) return null;

    const match = /max-age=(\d+)/.exec(hsts);
    return match ? parseInt(match[1]) : null;
  }

  extractSameSite(cookie) {
    const match = /samesite=(strict|lax|none)/i.exec(cookie);
    return match ? match[1].toLowerCase() : null;
  }
}
