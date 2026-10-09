import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db.js';
import { createApp } from './app.js';
import { User } from './models/User.js';
import { seedDatabase } from './seeds/seed.js';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Connect to Database (MongoDB or embedded fallback)
    await connectDB();

    // 2. Auto-seed if database has no users (e.g. fresh in-memory or new database)
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[LifeLink Server] No records detected in database. Auto-seeding initial data...');
      await seedDatabase();
    }

    // 3. Create Express App & Listen
    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 LifeLink Backend Server running on port ${PORT}`);
      console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });

    const shutdown = async () => {
      console.log('[LifeLink Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[LifeLink Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[LifeLink Server] Startup failure:', error);
    process.exit(1);
  }
};

startServer();
