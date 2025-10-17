import { WebScanner, WebScraper } from '../src/index.js';
import { Storage } from '../src/utils/storage.js';

async function competitorAnalysis() {
  console.log('Competitor Website Analysis Example\n');

  const competitors = [
    'https://competitor1.com',
    'https://competitor2.com',
    'https://competitor3.com'
  ];

  const scanner = new WebScanner();
  const scraper = new WebScraper();
  const storage = new Storage('./competitor-reports');

  const reports = [];

  for (const url of competitors) {
    console.log(`\nAnalyzing: ${url}`);
    console.log('─'.repeat(50));

    try {
      const [scanReport, scrapeData] = await Promise.all([
        scanner.scan(url),
        scraper.scrape(url)
      ]);

      const analysis = {
        url,
        analyzedAt: new Date().toISOString(),
        
        basicInfo: {
          title: scrapeData.metadata?.title,
          description: scrapeData.metadata?.description,
          keywords: scrapeData.metadata?.keywords
        },
        
        technology: {
          cms: scanReport.technology.cms,
          frameworks: scanReport.technology.frameworks,
          server: scanReport.technology.server,
          analytics: scanReport.technology.analytics,
          advertising: scanReport.technology.advertising,
          cdn: scanReport.technology.cdn
        },
        
        scores: {
          security: scanReport.security.score,
          seo: scanReport.seo.score,
          performance: scanReport.performance.score,
          accessibility: scanReport.accessibility.score
        },
        
        seo: {
          wordCount: scanReport.seo.wordCount,
          h1Count: scanReport.seo.headingsStructure.h1.length,
          hasStructuredData: scanReport.seo.hasStructuredData,
          structuredDataTypes: scanReport.seo.structuredDataTypes,
          issues: scanReport.seo.issues
        },
        
        content: {
          totalLinks: scrapeData.links?.length || 0,
          externalLinks: scrapeData.links?.filter(l => l.isExternal).length || 0,
          totalImages: scrapeData.images?.length || 0,
          imagesWithAlt: scrapeData.images?.filter(img => img.alt).length || 0,
          totalForms: scrapeData.forms?.length || 0
        },
        
        security: {
          vulnerabilities: scanReport.security.vulnerabilities.length,
          criticalIssues: scanReport.security.vulnerabilities.filter(v => v.severity === 'high'),
          hasHSTS: scanReport.security.securityHeaders['Strict-Transport-Security'].present,
          hasCSP: scanReport.security.securityHeaders['Content-Security-Policy'].present
        },
        
        performance: {
          htmlSize: scanReport.performance.htmlSizeFormatted,
          totalResources: scanReport.performance.totalResources,
          issues: scanReport.performance.issues
        }
      };

      reports.push(analysis);

      console.log('✓ Basic Info:');
      console.log(`  Title: ${analysis.basicInfo.title || 'N/A'}`);
      console.log(`  Description: ${(analysis.basicInfo.description || 'N/A').substring(0, 80)}...`);

      console.log('\n✓ Technology Stack:');
      console.log(`  CMS: ${analysis.technology.cms.join(', ') || 'None detected'}`);
      console.log(`  Frameworks: ${analysis.technology.frameworks.join(', ') || 'None detected'}`);
      console.log(`  Analytics: ${analysis.technology.analytics.join(', ') || 'None detected'}`);

      console.log('\n✓ Quality Scores:');
      console.log(`  Security: ${analysis.scores.security}/100`);
      console.log(`  SEO: ${analysis.scores.seo}/100`);
      console.log(`  Performance: ${analysis.scores.performance}/100`);
      console.log(`  Accessibility: ${analysis.scores.accessibility}/100`);

      console.log('\n✓ SEO Metrics:');
      console.log(`  Word Count: ${analysis.seo.wordCount}`);
      console.log(`  H1 Tags: ${analysis.seo.h1Count}`);
      console.log(`  Structured Data: ${analysis.seo.hasStructuredData ? 'Yes' : 'No'}`);

      console.log('\n✓ Content:');
      console.log(`  Total Links: ${analysis.content.totalLinks}`);
      console.log(`  External Links: ${analysis.content.externalLinks}`);
      console.log(`  Images: ${analysis.content.totalImages} (${analysis.content.imagesWithAlt} with alt text)`);

      const filename = `${new URL(url).hostname.replace(/\./g, '-')}_${Date.now()}.json`;
      await storage.saveJson(filename, analysis);
      console.log(`\n💾 Report saved: ${filename}`);

    } catch (error) {
      console.error(`✗ Error analyzing ${url}:`, error.message);
      reports.push({
        url,
        error: error.message,
        analyzedAt: new Date().toISOString()
      });
    }
  }

  console.log('\n\n📊 Comparative Analysis');
  console.log('═'.repeat(50));

  const successfulReports = reports.filter(r => !r.error);

  if (successfulReports.length > 0) {
    console.log('\nAverage Scores:');
    const avgSecurity = successfulReports.reduce((sum, r) => sum + r.scores.security, 0) / successfulReports.length;
    const avgSEO = successfulReports.reduce((sum, r) => sum + r.scores.seo, 0) / successfulReports.length;
    const avgPerformance = successfulReports.reduce((sum, r) => sum + r.scores.performance, 0) / successfulReports.length;
    const avgAccessibility = successfulReports.reduce((sum, r) => sum + r.scores.accessibility, 0) / successfulReports.length;

    console.log(`  Security: ${avgSecurity.toFixed(1)}/100`);
    console.log(`  SEO: ${avgSEO.toFixed(1)}/100`);
    console.log(`  Performance: ${avgPerformance.toFixed(1)}/100`);
    console.log(`  Accessibility: ${avgAccessibility.toFixed(1)}/100`);

    console.log('\nMost Common Technologies:');
    const allCMS = successfulReports.flatMap(r => r.technology.cms);
    const allFrameworks = successfulReports.flatMap(r => r.technology.frameworks);
    const allAnalytics = successfulReports.flatMap(r => r.technology.analytics);

    const cmsCount = allCMS.reduce((acc, cms) => {
      acc[cms] = (acc[cms] || 0) + 1;
      return acc;
    }, {});

    if (Object.keys(cmsCount).length > 0) {
      console.log('  CMS:', Object.entries(cmsCount).map(([k, v]) => `${k} (${v})`).join(', '));
    }

    console.log('\nTop Performer by Security:', 
      successfulReports.sort((a, b) => b.scores.security - a.scores.security)[0]?.url || 'N/A');
    console.log('Top Performer by SEO:', 
      successfulReports.sort((a, b) => b.scores.seo - a.scores.seo)[0]?.url || 'N/A');
  }

  const summaryFile = `competitor-summary_${Date.now()}.json`;
  await storage.saveJson(summaryFile, {
    analyzedAt: new Date().toISOString(),
    totalCompetitors: competitors.length,
    successfulAnalysis: successfulReports.length,
    reports
  });

  console.log(`\n💾 Summary saved: ${summaryFile}`);
  console.log('\n✓ Analysis complete!\n');

  await scraper.close();
}

competitorAnalysis().catch(console.error);
