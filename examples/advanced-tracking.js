import { WebTracker } from '../src/index.js';
import { Storage } from '../src/utils/storage.js';

async function advancedTracking() {
  console.log('Advanced Website Tracking Example\n');

  const tracker = new WebTracker();
  const storage = new Storage('./alerts');

  const urlsToTrack = [
    'https://example.com',
    'https://example.com/products',
    'https://example.com/about'
  ];

  console.log(`Starting tracking for ${urlsToTrack.length} URLs...\n`);

  for (const url of urlsToTrack) {
    await tracker.startTracking(url, {
      interval: 300000,
      
      onChange: async (changes, data) => {
        console.log(`\n⚠️  CHANGES DETECTED: ${url}`);
        console.log(`Time: ${new Date().toISOString()}`);
        console.log(`Total changes: ${changes.summary.total}`);
        
        const alert = {
          url,
          timestamp: new Date().toISOString(),
          changes: changes.summary,
          details: changes.changes.slice(0, 5)
        };

        const alertFile = `alert_${Date.now()}.json`;
        await storage.saveJson(alertFile, alert);
        console.log(`Alert saved to: ${alertFile}`);

        if (changes.changes.some(c => c.type === 'metadata' && c.field === 'title')) {
          console.log('🔴 CRITICAL: Page title changed!');
        }
        
        if (changes.changes.some(c => c.type === 'content' && c.changePercentage > 50)) {
          console.log('🔴 CRITICAL: Major content change (>50%)!');
        }
      },
      
      onError: async (error) => {
        console.error(`\n❌ ERROR tracking ${url}:`, error.message);
        
        const errorLog = {
          url,
          timestamp: new Date().toISOString(),
          error: error.message,
          stack: error.stack
        };
        
        await storage.saveJson(`error_${Date.now()}.json`, errorLog);
      }
    });

    console.log(`✓ Tracking started for: ${url}`);
  }

  console.log('\n✓ All tracking sessions started');
  console.log('Press Ctrl+C to stop all tracking\n');

  process.on('SIGINT', async () => {
    console.log('\n\nStopping all tracking sessions...');
    tracker.stopAllTracking();
    
    console.log('\nGenerating final reports...');
    for (const url of urlsToTrack) {
      try {
        const report = await tracker.generateReport(url);
        if (report.totalChanges > 0) {
          console.log(`\n${url}:`);
          console.log(`  Total snapshots: ${report.history.totalSnapshots}`);
          console.log(`  Total changes: ${report.totalChanges}`);
        }
      } catch (e) {
        console.error(`  Error generating report for ${url}:`, e.message);
      }
    }
    
    await tracker.close();
    console.log('\n✓ All tracking stopped\n');
    process.exit(0);
  });
}

advancedTracking().catch(console.error);
