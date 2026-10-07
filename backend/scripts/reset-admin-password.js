#!/usr/bin/env node
/**
 * Sri Vijaya Lakshmi Hospital — Admin ID Recovery & Password Reset Utility
 *
 * Usage:
 *   1. List all active admin accounts & login IDs:
 *      node scripts/reset-admin-password.js
 *
 *   2. Reset password & unlock account for an admin:
 *      node scripts/reset-admin-password.js <email_or_phone> <new_password>
 *
 * Example:
 *   node scripts/reset-admin-password.js drnraju@gmail.com NewAdminPass@2026
 */

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const targetIdentifier = process.argv[2]?.trim();
const newPassword = process.argv[3]?.trim();

async function run() {
  const { connectDB } = await import('../src/config/database.js');
  const { User } = await import('../src/models/User.js');

  console.log('\n===============================================================');
  console.log('🔐 Sri Vijaya Lakshmi Hospital — Admin Credential Recovery');
  console.log('===============================================================\n');

  await connectDB();

  // If no arguments provided, list all Hospital Administrators
  if (!targetIdentifier) {
    console.log('📋 Listing all Hospital Administrators in database:\n');
    const admins = await User.find({ role: 'HOSPITAL_ADMIN' }).select('+passwordHash');

    if (admins.length === 0) {
      console.log('⚠️  No Hospital Administrator accounts found in this database.');
    } else {
      admins.forEach((a, idx) => {
        const isLocked = a.lockUntil && a.lockUntil > new Date();
        console.log(`  [${idx + 1}] Name:     ${a.name}`);
        console.log(`      Email:    ${a.email || '(None)'}`);
        console.log(`      Phone:    ${a.phone || '(None)'}`);
        console.log(`      Login IDs: ${(a.loginIds || []).join(', ') || a.email}`);
        console.log(`      Status:   ${a.status} (Active: ${a.isActive})`);
        console.log(`      Lockout:  ${isLocked ? '⚠️ TEMPORARILY LOCKED' : '✓ Unlocked (0 failed attempts)'}\n`);
      });
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('To reset the password for any admin account, run:');
    console.log('  node scripts/reset-admin-password.js <email> <new_password>');
    console.log('Example:');
    console.log('  node scripts/reset-admin-password.js drnraju@gmail.com MyNewPassword@123\n');
    process.exit(0);
  }

  // If identifier is provided but no new password
  if (!newPassword) {
    console.error('❌ Error: Please specify a new password.');
    console.error('Usage: node scripts/reset-admin-password.js <email> <new_password>');
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error('❌ Error: New password must be at least 8 characters long.');
    process.exit(1);
  }

  const cleanId = targetIdentifier.toLowerCase();
  const user = await User.findOne({
    $or: [
      { email: cleanId },
      { phone: targetIdentifier },
      { loginIds: cleanId },
      { loginIds: targetIdentifier },
    ],
  }).select('+passwordHash');

  if (!user) {
    console.error(`❌ Error: No user account found with identifier '${targetIdentifier}'.`);
    console.log('Run `node scripts/reset-admin-password.js` without arguments to see available admins.');
    process.exit(1);
  }

  console.log(`Found account: ${user.name} (${user.role}) - ${user.email}`);
  console.log('Hashing new password and resetting security lockouts...');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordHash = passwordHash;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.status = 'ACTIVE';
  user.isActive = true;

  await user.save();

  console.log('\n✅ Password reset successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  • Account:      ${user.name}`);
  console.log(`  • Login ID:     ${user.email}`);
  console.log(`  • Role:         ${user.role}`);
  console.log(`  • Status:       Active & Unlocked`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
