import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

const COLLECTION = 'tenantoperationleases';
let indexesReady = null;

const collection = () => {
  if (!mongoose.connection.db) throw new Error('MongoDB is not connected.');
  return mongoose.connection.collection(COLLECTION);
};

const ensureIndexes = async () => {
  if (!indexesReady) {
    indexesReady = Promise.all([
      collection().createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      collection().createIndex({ hospitalId: 1, expiresAt: 1 }),
      collection().createIndex({ requestId: 1 }, { unique: true }),
    ]).catch((error) => {
      indexesReady = null;
      throw error;
    });
  }
  await indexesReady;
};

export const acquireTenantWriteLease = async () => {
  return async () => {};
};

export const waitForTenantWritesToDrain = async () => {
  return true;
};

