import dotenv from 'dotenv';
import { prisma } from './db.js';

dotenv.config();

async function testDatabaseConnection() {
  console.log('⚡ Initializing Prisma connection pool test...');

  try {
    // Execute a simple connection check query
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now;`;
    console.log('✅ Connection pool test successful!');
    console.log('🕒 PostgreSQL Server Time:', result[0]?.now);

    // Count records across models
    const [userCount, placeCount, shareLogCount] = await Promise.all([
      prisma.user.count(),
      prisma.place.count(),
      prisma.shareLog.count(),
    ]);

    console.log('📊 Current Database Record Summary:');
    console.log(` - Users: ${userCount}`);
    console.log(` - Places: ${placeCount}`);
    console.log(` - Share Logs: ${shareLogCount}`);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
