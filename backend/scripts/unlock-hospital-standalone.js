/**
 * Sri Vijaya Lakshmi Hospital — Standalone System Database Unlock & Migration Script
 * 
 * Run this on your server or locally to permanently unlock the hospital:
 *   node scripts/unlock-hospital-standalone.js
 */

import mongoose from 'mongoose';
import { connectDB } from '../src/config/database.js';
import { Hospital } from '../src/models/Hospital.js';
import { User } from '../src/models/User.js';

async function unlockHospital() {
  try {
    console.log('\n🏥  Sri Vijaya Lakshmi Hospital — Standalone Database Unfreeze');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await connectDB();

    console.log('[1/3] Unfreezing hospital records from SaaS restrictions...');
    const hospResult = await Hospital.updateMany(
      {},
      {
        $set: {
          status: 'APPROVED',
          isActive: true,
          isTrial: false,
          trialStatus: 'SUBSCRIPTION_ACTIVE',
          trialEndDate: null,
          subscriptionEndDate: null,
          databaseWriteLocked: false,
          databaseWriteLockReason: '',
          databaseWriteLockedAt: null,
          storageMode: 'SHARED',
          databaseMigrationStatus: 'NOT_STARTED',
        },
      }
    );
    console.log(`      ✓ Unlocked ${hospResult.modifiedCount} hospital record(s) (perpetual access, 0 write locks)`);

    console.log('[2/3] Removing SaaS platform owner / superadmin accounts...');
    const userDel = await User.deleteMany({ email: 'superadmin@gmail.com' });
    const hospDel = await Hospital.deleteMany({ code: 'PLATFORM' });
    console.log(`      ✓ Removed ${userDel.deletedCount} SuperAdmin account(s) and ${hospDel.deletedCount} platform hospital(s)`);

    console.log('[3/3] Checking active Hospital Admins...');
    const admins = await User.find({ role: 'HOSPITAL_ADMIN', isActive: true }).select('name email phone');
    if (admins.length > 0) {
      console.log(`      ✓ Found ${admins.length} Hospital Administrator(s):`);
      admins.forEach((a) => console.log(`        • ${a.name} (${a.email})`));
    } else {
      console.log('      ⚠️  No Hospital Admin found. The auto-seeder will create a default admin on backend startup.');
    }

    console.log('\n✅  Sri Vijaya Lakshmi Hospital is now 100% standalone!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  • No SaaS subscription expiry (402 blocked writes eliminated)');
    console.log('  • No cutover write lock (503 password reset blocked eliminated)');
    console.log('  • Top authority is Hospital Administrator and Hospital Staff\n');
  } catch (err) {
    console.error('\n❌  Unlock script failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

unlockHospital();
