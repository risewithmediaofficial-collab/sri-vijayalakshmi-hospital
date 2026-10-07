import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PROD_URI = process.env.PROD_MONGO_URI || 'mongodb://82.29.166.169:27027/svlh_hospital_db?directConnection=true';
const LOCAL_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/svlh_hospital_db';

async function syncProductionToLocal() {
  console.log('\n===============================================================');
  console.log('🔄 Sri Vijaya Lakshmi Hospital — Production Data Sync to Local');
  console.log('===============================================================');
  console.log(`Source (Production): ${PROD_URI.replace(/\/\/[^@]+@/, '//***@')}`);
  console.log(`Target (Local DB):   ${LOCAL_URI}`);
  console.log('---------------------------------------------------------------\n');

  let prodConn = null;
  let localConn = null;

  try {
    console.log('[1/4] Connecting to Production database...');
    prodConn = await mongoose.createConnection(PROD_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    }).asPromise();
    console.log('  ✓ Connected to Production MongoDB successfully.');

    console.log('[2/4] Connecting to Local database...');
    localConn = await mongoose.createConnection(LOCAL_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).asPromise();
    console.log('  ✓ Connected to Local MongoDB successfully.');

    console.log('[3/4] Pulling production collections into local database...');
    const prodCollections = await prodConn.db.listCollections().toArray();

    const ignoredCollections = new Set(['system.indexes', 'system.profile']);
    const syncSummary = [];

    for (const collInfo of prodCollections) {
      const collName = collInfo.name;
      if (ignoredCollections.has(collName)) continue;

      const prodColl = prodConn.collection(collName);
      const localColl = localConn.collection(collName);

      const count = await prodColl.countDocuments();
      if (count === 0) {
        // Drop local if exists to keep exact parity
        await localColl.drop().catch(() => {});
        syncSummary.push({ collection: collName, count: 0, status: 'Empty' });
        continue;
      }

      // Fetch all docs from production
      const docs = await prodColl.find({}).toArray();

      // Clear local collection
      await localColl.drop().catch(() => {});

      // Insert all production docs into local
      if (docs.length > 0) {
        // Insert in batches of 500 to handle large collections smoothly
        const batchSize = 500;
        for (let i = 0; i < docs.length; i += batchSize) {
          const batch = docs.slice(i, i + batchSize);
          await localColl.insertMany(batch, { ordered: false });
        }
      }

      // Sync indexes
      try {
        const indexes = await prodColl.indexes();
        for (const idx of indexes) {
          if (idx.name === '_id_') continue;
          const { key, name, unique, sparse, expireAfterSeconds } = idx;
          const options = { name };
          if (unique) options.unique = true;
          if (sparse) options.sparse = true;
          if (expireAfterSeconds !== undefined) options.expireAfterSeconds = expireAfterSeconds;
          await localColl.createIndex(key, options).catch(() => {});
        }
      } catch (idxErr) {
        // Index recreation is best-effort
      }

      syncSummary.push({ collection: collName, count: docs.length, status: 'Synced' });
      process.stdout.write(`  • ${collName.padEnd(30)} : ${docs.length} document(s)\n`);
    }

    console.log('\n[4/4] Removing placeholder seed accounts...');
    // Remove default placeholder seed user if real production admin exists
    const removedSeed = await localConn.collection('users').deleteMany({
      email: 'admin@srivijayalakshmihospital.com',
    });
    if (removedSeed.deletedCount > 0) {
      console.log(`  ✓ Removed ${removedSeed.deletedCount} placeholder seed admin account(s).`);
    }

    // List available staff accounts in local DB for reference
    const staffList = await localConn.collection('users')
      .find({ role: { $ne: 'PATIENT' } })
      .project({ name: 1, email: 1, role: 1, phone: 1 })
      .toArray();

    console.log('\n===============================================================');
    console.log('✅ SYNC COMPLETE! Your local environment now has production data.');
    console.log('===============================================================');
    console.log('Active Local Staff Accounts (Exact Production Credentials):');
    staffList.forEach((s) => {
      console.log(`  - [${s.role}] ${s.name} | Login: ${s.email} | Phone: ${s.phone}`);
    });
    console.log('\n🛡️ Safe Isolation Notice:');
    console.log('  • All operations/testing you do locally stay strictly on your local machine.');
    console.log('  • NO data entered locally will ever be sent or pushed to production.');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n❌ Data sync failed:', err.message);
    process.exit(1);
  } finally {
    if (prodConn) await prodConn.close().catch(() => {});
    if (localConn) await localConn.close().catch(() => {});
    process.exit(0);
  }
}

syncProductionToLocal();
