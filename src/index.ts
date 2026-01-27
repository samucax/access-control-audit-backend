import { createApp } from './app';
import { config, validateConfig } from './infrastructure/config';
import { database } from './infrastructure/database/connection';

/**
 * Application Entry Point
 * Initializes database connection and starts the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Validate configuration
    validateConfig();

    // Connect to database
    await database.connect();

    // Create and start Express app
    const app = createApp();

    app.listen(config.port, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Access Control & Audit Logging System                 ║
║                                                            ║
║   Server running on port ${config.port}                            ║
║   Environment: ${config.env.padEnd(36)}     ║
║                                                            ║
║   API Base URL: http://localhost:${config.port}/api/v1              ║
║   Health Check: http://localhost:${config.port}/health              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      await database.disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
