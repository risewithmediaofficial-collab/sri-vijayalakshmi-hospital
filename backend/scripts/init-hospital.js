/**
 * Sri Vijaya Lakshmi Hospital — Initial Database Setup Script
 * 
 * This script initializes the database for Sri Vijaya Lakshmi Hospital.
 * It creates:
 *   1. The hospital record
 *   2. A main branch
 *   3. All system roles
 *   4. The Hospital Admin account
 *   5. An optional initial staff member (Doctor)
 * 
 * Run once on first deployment:
 *   node scripts/init-hospital.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/database.js';
import { Hospital } from '../src/models/Hospital.js';
import { Branch } from '../src/models/Branch.js';
import { Role } from '../src/models/Role.js';
import { User } from '../src/models/User.js';
import { ROLES } from '../src/config/constants.js';

// ============================================================
// CONFIGURATION — Modify before running
// ============================================================
const HOSPITAL_CONFIG = {
  name: 'Sri Vijaya Lakshmi Hospital',
  code: 'SVLH',
  subdomain: 'sri-vijaya-lakshmi',
  domain: 'sri-vijaya-lakshmi',
  status: 'APPROVED',
  plan: 'ENTERPRISE',
  contactName: 'Hospital Admin',
  contactEmail: 'admin@srivijayalakshmihospital.com',
  contactPhone: '+91 98765 43210',
  licenseNumber: 'TN-HOSP-2024-001',
  isActive: true,
  city: 'Chennai',
  state: 'Tamil Nadu',
  country: 'India',
  address: '123, Main Street, Chennai - 600001',
};

const BRANCH_CONFIG = {
  name: 'Sri Vijaya Lakshmi Hospital - Main Branch',
  branchCode: 'SVLH-MAIN',
  phone: '+91 98765 43210',
  email: 'main@srivijayalakshmihospital.com',
  address: '123, Main Street',
  city: 'Chennai',
  state: 'Tamil Nadu',
  postalCode: '600001',
  isMainBranch: true,
};

const ADMIN_CONFIG = {
  name: 'Hospital Administrator',
  email: 'admin@srivijayalakshmihospital.com',
  password: 'Admin@2024!',   // Change after first login
  role: 'HOSPITAL_ADMIN',
  phone: '+91 98765 43210',
};
// ============================================================

async function initHospital() {
  try {
    console.log('\n🏥  Sri Vijaya Lakshmi Hospital — Database Initialization');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('[1/5] Connecting to MongoDB...');
    await connectDB();

    // Check if hospital already exists
    let hospital = await Hospital.findOne({ code: HOSPITAL_CONFIG.code });
    let branch = null;

    if (hospital) {
      if (process.argv.includes('--force')) {
        console.log('[!] --force flag detected. Clearing existing hospital data...');
        await Hospital.deleteMany({ code: HOSPITAL_CONFIG.code });
        await Branch.deleteMany({ branchCode: BRANCH_CONFIG.branchCode });
        await User.deleteMany({ email: ADMIN_CONFIG.email });
        hospital = null;
      } else {
        console.log(`\nℹ️  Hospital "${HOSPITAL_CONFIG.name}" already exists (${hospital._id}). Ensuring roles and admin exist...`);
        branch = await Branch.findOne({ hospitalId: hospital._id });
      }
    }

    if (!hospital) {
      // Step 1: Create hospital record
      console.log(`[2/5] Creating hospital record: "${HOSPITAL_CONFIG.name}"...`);
      hospital = await Hospital.create({
        ...HOSPITAL_CONFIG,
        enabledModules: {
          doctors: true,
          nursing: true,
          reception: true,
          pharmacy: true,
          laboratory: true,
          radiology: true,
          billing: true,
          emergency: true,
          ipd: true,
          opd: true,
        },
      });
      console.log(`      ✓ Hospital created with ID: ${hospital._id}`);

      // Step 2: Create main branch
      console.log('[3/5] Creating main branch...');
      branch = await Branch.create({
        ...BRANCH_CONFIG,
        hospitalId: hospital._id,
      });
      console.log(`      ✓ Branch created with ID: ${branch._id}`);
    } else {
      if (!branch) {
        branch = await Branch.create({
          ...BRANCH_CONFIG,
          hospitalId: hospital._id,
        });
      }
      console.log(`[2/5] Hospital: "${hospital.name}" (${hospital._id})`);
      console.log(`[3/5] Main branch: "${branch.name}" (${branch._id})`);
    }

    // Step 3: Create system roles (if not already present)
    console.log('[4/5] Creating system roles...');
    const existingRolesCount = await Role.countDocuments({});
    if (existingRolesCount === 0) {
      const rolesToCreate = Object.values(ROLES)
        .filter(roleCode => roleCode !== 'SUPER_ADMIN')
        .map((roleCode) => {
          let defaultRoute = '/admin/dashboard';
          if (roleCode === ROLES.HOSPITAL_ADMIN) defaultRoute = '/admin/dashboard';
          else if (roleCode === ROLES.DOCTOR) defaultRoute = '/doctor/dashboard';
          else if (roleCode === ROLES.NURSE) defaultRoute = '/nursing/dashboard';
          else if (roleCode === ROLES.NURSE_INCHARGE) defaultRoute = '/nurse-incharge/dashboard';
          else if (roleCode === ROLES.RECEPTIONIST) defaultRoute = '/reception/dashboard';
          else if (roleCode === ROLES.PHARMACIST) defaultRoute = '/pharmacy/dashboard';
          else if (roleCode === ROLES.LAB_TECH) defaultRoute = '/laboratory/dashboard';
          else if (roleCode === ROLES.RADIOLOGIST) defaultRoute = '/radiology/dashboard';
          else if (roleCode === ROLES.CASHIER) defaultRoute = '/billing/dashboard';
          else if (roleCode === ROLES.INVENTORY_MANAGER) defaultRoute = '/inventory/dashboard';
          else if (roleCode === ROLES.HR_MANAGER) defaultRoute = '/hr/dashboard';
          else if (roleCode === ROLES.PATIENT) defaultRoute = '/patient-portal/dashboard';
          else if (roleCode === ROLES.GUARDIAN) defaultRoute = '/guardian-portal/dashboard';

          return {
            code: roleCode,
            name: roleCode.replace(/_/g, ' '),
            description: `${roleCode} Role Privileges`,
            permissions: ['ALL'],
            defaultRoute,
          };
        });
      await Role.insertMany(rolesToCreate);
      console.log(`      ✓ ${rolesToCreate.length} system roles created`);
    } else {
      console.log(`      ✓ ${existingRolesCount} system roles already exist — skipped`);
    }

    // Step 4: Create Hospital Admin account
    console.log('[5/5] Creating Hospital Admin account...');
    const existingAdmin = await User.findOne({ email: ADMIN_CONFIG.email });
    if (existingAdmin) {
      console.log(`      ✓ Admin account already exists for ${ADMIN_CONFIG.email}`);
    } else {
      const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 12);
      const adminUser = await User.create({
        name: ADMIN_CONFIG.name,
        email: ADMIN_CONFIG.email,
        loginIds: [ADMIN_CONFIG.email.toLowerCase()],
        passwordHash: hashedPassword,
        role: ADMIN_CONFIG.role,
        phone: ADMIN_CONFIG.phone,
        hospitalId: hospital._id,
        branchId: branch ? branch._id : undefined,
        isActive: true,
        isEmailVerified: true,
      });
      console.log(`      ✓ Admin account created: ${adminUser.email}`);
    }

    console.log('\n✅  Initialization Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Hospital  :', HOSPITAL_CONFIG.name);
    console.log('  Admin     :', ADMIN_CONFIG.email);
    console.log('  Password  :', ADMIN_CONFIG.password);
    console.log('  Login URL :', 'http://localhost:5173/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n  ⚠️  Please change the admin password after first login!\n');

  } catch (error) {
    console.error('\n❌  Initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

initHospital();
