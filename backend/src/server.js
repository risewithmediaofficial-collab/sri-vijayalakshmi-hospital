import http from 'http';
import app from './app.js';
import { env, validateProductionEnvironment } from './config/env.js';
import { connectDB } from './config/database.js';
import { socketManager } from './events/socketManager.js';

const server = http.createServer(app);

try {
  validateProductionEnvironment();
} catch (error) {
  console.warn(`\n[Production Advisory] ${error.message}`);
  console.warn(`[Production Advisory] Continuing server startup with available configurations.\n`);
}

// Global process error handlers to prevent silent crashes
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

// Initialize Socket.IO Server
socketManager.init(server);

// Handle server errors (such as EADDRINUSE port conflict)
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n[ERROR] Port ${env.PORT} is already in use by another process.`);
    console.error(`Please stop the process using port ${env.PORT} or change PORT in your .env file.\n`);
    process.exit(1);
  } else {
    console.error('[Server Error]', error);
  }
});

import { autoEnsureSystemCredentials } from './config/autoSeed.js';

// Connect to MongoDB and start HTTP Server
connectDB().then(async () => {
  await autoEnsureSystemCredentials();
  server.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(` HPMBS Backend Server Running on Port ${env.PORT}`);
    console.log(` Environment: ${env.NODE_ENV}`);
    console.log(` API Base URL: http://localhost:${env.PORT}/api/v1`);
    console.log(`====================================================`);
  });
});

