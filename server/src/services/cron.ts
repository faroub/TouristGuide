import cron from 'node-cron';
import { cleanupStaleScrapedPlaces } from '../scripts/cleanup-stale-places.js';

export function initializeDatabaseCronJobs() {
  console.log('⏰ Initializing native node-cron background schedulers...');

  // Schedule daily database maintenance at 03:00 AM UTC ('0 3 * * *')
  cron.schedule('0 3 * * *', async () => {
    console.log('⏰ Executing scheduled daily database maintenance (03:00 AM UTC)...');
    try {
      const purgedCount = await cleanupStaleScrapedPlaces();
      console.log(`⏰ Scheduled cleanup complete. Purged ${purgedCount} stale records.`);
    } catch (error) {
      console.error('⏰ Scheduled cleanup job failed:', error);
    }
  });

  console.log('✅ Cron scheduler active: "0 3 * * *" (Daily at 03:00 AM UTC)');
}
