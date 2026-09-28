import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (retries = 5, delayMs = 2500) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
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
          // fallback failed, continue
        }
      }
      console.error(`[MongoDB Error] Connection Attempt ${attempt}/${retries} Failed: ${error.message}`);
      if (attempt < retries) {
        console.log(`[MongoDB] Retrying in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        if (env.NODE_ENV === 'production') {
          process.exit(1);
        }
      }
    }
  }
};
