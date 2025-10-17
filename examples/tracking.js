import { WebTracker } from '../src/index.js';

async function trackWebsite() {
  console.log('Web Tracking Example\n');

  const tracker = new WebTracker();

  try {
    console.log('Taking first snapshot...');
    const result1 = await tracker.track('https://example.com');
    console.log('First snapshot taken:', result1.timestamp);
    console.log('Is first snapshot:', result1.isFirstSnapshot);

    console.log('\nWaiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('Taking second snapshot...');
    const result2 = await tracker.track('https://example.com');
    console.log('Second snapshot taken:', result2.timestamp);

    if (result2.changes.detected) {
      console.log('\n⚠ Changes detected!');
      console.log('Total changes:', result2.changes.summary.total);
      console.log('Changes by type:', result2.changes.summary.byType);
      
      console.log('\nChange details:');
      result2.changes.changes.forEach((change, i) => {
        console.log(`${i + 1}. [${change.type}] ${change.field || ''}`);
      });
    } else {
      console.log('\n✓ No changes detected');
    }

    console.log('\nGetting tracking history...');
    const history = await tracker.getHistory('https://example.com');
    console.log('Total snapshots:', history.totalSnapshots);
    console.log('First snapshot:', history.firstSnapshot);
    console.log('Last snapshot:', history.lastSnapshot);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await tracker.close();
  }
}

trackWebsite();
