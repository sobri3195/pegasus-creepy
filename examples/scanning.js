import { WebScanner } from '../src/index.js';

async function scanWebsite() {
  console.log('Web Scanning Example\n');

  const scanner = new WebScanner();

  try {
    const result = await scanner.scan('https://example.com');

    console.log('URL:', result.url);
    console.log('Status Code:', result.statusCode);
    console.log('\n--- Technology Stack ---');
    console.log('CMS:', result.technology.cms.join(', ') || 'None detected');
    console.log('Frameworks:', result.technology.frameworks.join(', ') || 'None detected');
    console.log('Server:', result.technology.server.join(', ') || 'Unknown');
    console.log('Analytics:', result.technology.analytics.join(', ') || 'None detected');

    console.log('\n--- Security Analysis ---');
    console.log('Security Score:', result.security.score + '/100');
    console.log('Vulnerabilities:', result.security.vulnerabilities.length);
    if (result.security.vulnerabilities.length > 0) {
      console.log('\nIssues:');
      result.security.vulnerabilities.forEach(vuln => {
        console.log(`  [${vuln.severity.toUpperCase()}] ${vuln.issue}`);
      });
    }

    console.log('\n--- SEO Analysis ---');
    console.log('SEO Score:', result.seo.score + '/100');
    console.log('Word Count:', result.seo.wordCount);
    console.log('H1 Tags:', result.seo.headingsStructure.h1.length);
    console.log('Structured Data:', result.seo.hasStructuredData ? 'Yes' : 'No');

    console.log('\n--- Performance ---');
    console.log('Performance Score:', result.performance.score + '/100');
    console.log('HTML Size:', result.performance.htmlSizeFormatted);
    console.log('Total Resources:', result.performance.totalResources);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

scanWebsite();
