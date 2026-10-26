import dotenv from 'dotenv';
import { prisma } from '../db.js';

dotenv.config();

export async function cleanupStaleScrapedPlaces(): Promise<number> {
  const startTime = Date.now();
  console.log('🧹 [DATABASE MAINTENANCE] Maintenance workflow started...');

  // 1. Calculate Date Threshold: Exactly 30 Days Ago
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  console.log(`📅 [THRESHOLD] Purging non-UGC scraped places created before: ${thirtyDaysAgo.toISOString()}`);

  try {
    // 2. Execute Isolated Prisma Delete Query
    // Strictly isolates places where createdAt < 30 days AND isUserGenerated = false
    const deleteResult = await prisma.place.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
        isUserGenerated: false, // Ensures user-contributed spots are preserved permanently
      },
    });

    const durationMs = Date.now() - startTime;
    console.log(
      `✅ [SUCCESS] Successfully purged ${deleteResult.count} stale scraped places in ${durationMs}ms.`
    );
    console.log('🛡️ [UGC PROTECTION] All user-generated community spots remain intact.');

    return deleteResult.count;
  } catch (error: any) {
    console.error('❌ [DATABASE MAINTENANCE ERROR] Failed to purge stale scraped places:');
    if (error?.code === 'P2003') {
      console.error('⚠️ [SQL CONSTRAINT ERROR] Foreign key constraint prevented deletion.');
    } else {
      console.error(error);
    }
    throw error;
  }
}

// Execute directly if run as CLI script
if (process.argv[1]?.endsWith('cleanup-stale-places.ts') || process.argv[1]?.endsWith('cleanup-stale-places.js')) {
  cleanupStaleScrapedPlaces()
    .then(() => {
      console.log('🎉 [DATABASE MAINTENANCE] Completed successfully.');
      process.exit(0);
    })
    .catch(() => {
      console.error('💥 [DATABASE MAINTENANCE] Execution failed.');
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
