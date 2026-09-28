import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}:${conn.connection.port} (Connection Pool: 5-50)`);
    return conn;
  } catch (error) {
    if (env.NODE_ENV !== 'production' && env.MONGO_URI.includes('27027')) {
      const fallbackUri = env.MONGO_URI.replace('27027', '27017');
      try {
        const fallbackConn = await mongoose.connect(fallbackUri, {
          maxPoolSize: 50,
          minPoolSize: 5,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 10000,
        });
        console.log(`[MongoDB] Connected via local default port: ${fallbackConn.connection.host}:${fallbackConn.connection.port}`);
        return fallbackConn;
      } catch (fallbackError) {
        console.error(`[MongoDB Error] Fallback Connection Failed: ${fallbackError.message}`);
      }
    }
    console.error(`[MongoDB Error] Connection Failed: ${error.message}`);
    // Allow dev process to stay alive during temporary database restarts
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
