import 'dotenv/config';
import { createApp } from './app.js';
import { config, validateConfig, initializeDatabase } from './config/index.js';
import { errorHandler, notFound } from './middlewares/auth.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// ==========================================
// Server Startup
// ==========================================
async function startServer() {
  try {
    // 1. Validate environment variables
    validateConfig();
    console.log('✅ Environment variables validated');

    // 2. Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // 3. Create Express app
    const app = createApp();
    console.log('✅ Express app created');

    // 4. Mount routes
    app.use('/api/auth', authRoutes);
    app.use('/api', userRoutes);
    app.use('/api/owner', ownerRoutes);
    app.use('/api/admin', adminRoutes);
    console.log('✅ Routes mounted');

    // 5. Add error handling middleware (AFTER routes)
    app.use(notFound);
    app.use(errorHandler);
    console.log('✅ Error handlers configured');

    // 6. Start server
    const PORT = config.PORT;
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════╗');
      console.log('║  🚀 BACKEND SERVER STARTED SUCCESSFULLY  ║');
      console.log('╠════════════════════════════════════════════╣');
      console.log(`║  🔥 Port:       ${PORT}${' '.repeat(33 - PORT.toString().length)}║`);
      console.log(`║  🌍 URL:        http://localhost:${PORT}${' '.repeat(28 - PORT.toString().length)}║`);
      console.log(`║  📊 Environment: ${config.NODE_ENV}${' '.repeat(27 - config.NODE_ENV.length)}║`);
      console.log('╚════════════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();