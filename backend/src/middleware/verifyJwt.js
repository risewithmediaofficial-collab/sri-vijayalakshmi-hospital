import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';
import { Branch } from '../models/Branch.js';
import { Hospital } from '../models/Hospital.js';
import { User } from '../models/User.js';
import { hasOperationalRoleForModule, hasPermission } from '../config/permissions.js';
import { getTenantConnection } from '../config/tenantDatabase.js';
import { setTenantModelConnection } from '../config/tenantModelContext.js';
import { tenantRuntimeReadiness } from '../config/tenantAwareModel.js';
import { acquireTenantWriteLease } from '../config/tenantOperationLease.js';

const moduleForRequest = (url) => {
  const routes = [
    ['/patients', 'patients'],
    ['/appointments', 'appointments'],
    ['/emr', 'doctor'],
    ['/doctor-updates', 'doctor'],
    ['/beds', 'beds'],
    ['/requests', 'requests'],
    ['/billing', 'billing'],
    ['/diagnostics', 'diagnostics'],
    ['/admissions', 'ipd'],
    ['/emergency', 'emergency'],
    ['/pharmacy', 'pharmacy'],
    ['/inventory', 'pharmacy'],
  ];
  return routes.find(([prefix]) => url.startsWith(`/api/v1${prefix}`))?.[1];
};

const applyContextIfNeeded = async (req) => {
  if (req.user?.role !== 'SUPER_ADMIN') return;

  // Never divert Super Admin's identity profile, logout, or SaaS platform management to a tenant context
  if (
    req.originalUrl?.startsWith('/api/v1/auth/me') ||
    req.originalUrl?.startsWith('/api/v1/auth/logout') ||
    req.originalUrl?.startsWith('/api/v1/saas')
  ) {
    return;
  }

  const contextHospitalId = req.headers['x-hospital-context'] || req.query.hospitalId || req.query.hospitalDomain || req.query.hospital;
  if (!contextHospitalId) return;

  let hospitalDoc = null;
  if (mongoose.Types.ObjectId.isValid(String(contextHospitalId))) {
    hospitalDoc = await Hospital.findById(contextHospitalId);
  }
  if (!hospitalDoc) {
    hospitalDoc = await Hospital.findOne({
      $or: [
        { domain: String(contextHospitalId).toLowerCase() },
        { code: String(contextHospitalId).toUpperCase() },
        { name: String(contextHospitalId) },
      ],
    });
  }

  if (hospitalDoc) {
    req.user.hospitalId = hospitalDoc._id.toString();
    req.user._hospitalContextApplied = true;

    const branch =
      (await Branch.findOne({ hospitalId: hospitalDoc._id, isMainBranch: true })) ||
      (await Branch.findOne({ hospitalId: hospitalDoc._id }));
    if (branch) {
      req.user.branchId = branch._id.toString();
    }
  }
};

const extractId = (val) => {
  if (!val) return '';
  if (typeof val === 'object') {
    return val._id ? String(val._id) : (val.id ? String(val.id) : String(val));
  }
  return String(val);
};

export const activateVerifiedTenantConnection = async () => {
  return null;
};

export const verifyJwt = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return sendError(res, 401, 'Authentication token missing', null, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;


    // Always keep currentUser roles, status, hospitalId & permissions in sync with DB
    let currentUser = null;
    if (decoded.id && decoded.role !== 'SUPER_ADMIN') {
      currentUser = await User.findById(decoded.id)
        .select('hospitalId branchId role additionalRoles isAvailable adminDepartmentAvailability isActive status permissions revokedPermissions departmentId additionalDepartments phone uhid patientId email name')
        .lean();

      if (currentUser) {
        if (!currentUser.isActive || currentUser.status === 'INACTIVE') {
          return sendError(res, 403, 'Your account is inactive.', null, 'ACCOUNT_INACTIVE');
        }
        req.user.role = currentUser.role || decoded.role;
        const activeAdditionalRoles = new Set(currentUser.additionalRoles || []);
        if (currentUser.role === 'HOSPITAL_ADMIN' && currentUser.isAvailable !== false && currentUser.adminDepartmentAvailability) {
          const roleMap = {
            DOCTOR: ['DOCTOR'],
            RECEPTIONIST: ['RECEPTIONIST', 'OPD_STAFF'],
            CASHIER: ['CASHIER', 'BILLING_STAFF'],
            PHARMACIST: ['PHARMACIST', 'PHARMACY_STAFF'],
            LAB_TECH: ['LAB_TECH', 'LABORATORY_STAFF'],
            RADIOLOGIST: ['RADIOLOGIST', 'RADIOLOGY_STAFF'],
            NURSE: ['NURSE', 'NURSE_INCHARGE', 'IPD_STAFF'],
            EMERGENCY_STAFF: ['EMERGENCY_STAFF'],
          };
          for (const [dept, isEnabled] of Object.entries(currentUser.adminDepartmentAvailability)) {
            if (isEnabled && roleMap[dept]) {
              roleMap[dept].forEach((r) => activeAdditionalRoles.add(r));
            }
          }
        }
        req.user.additionalRoles = Array.from(activeAdditionalRoles);
        req.user.additionalDepartments = currentUser.additionalDepartments || [];
        req.user.permissions = currentUser.permissions || {};
        req.user.departmentId = currentUser.departmentId;
        req.user.phone = currentUser.phone || req.user.phone || '';
        req.user.uhid = currentUser.uhid || req.user.uhid || '';
        req.user.patientId = currentUser.patientId || req.user.patientId || null;
        req.user.name = currentUser.name || req.user.name || '';
        req.user.email = currentUser.email || req.user.email || '';
        if (currentUser.hospitalId) {
          req.user.hospitalId = currentUser.hospitalId.toString();
        }
        if (currentUser.branchId) {
          req.user.branchId = currentUser.branchId.toString();
        }
      }
    }

    // In a standalone hospital system, Hospital Admin has administrative authority
    // and staff access is governed by hospital permissions without SaaS plan expiry.
    req.user.subscriptionReadOnly = false;

    const module = moduleForRequest(req.originalUrl);
    if (module && currentUser) {
      if (req.user.role === 'HOSPITAL_ADMIN' || req.user.role === 'SUPER_ADMIN') {
        // Hospital Admin has full administrative and operational authority
      } else {
        const action = req.method === 'GET' ? 'view' : req.method === 'POST' ? 'create' : req.method === 'DELETE' ? 'delete' : 'edit';
        if (!hasPermission(currentUser, module, action)) {
          return sendError(res, 403, 'You do not have permission to perform this action.', null, 'FORBIDDEN');
        }
      }
    }

    delete req.user._preloadedHospital;
    next();
  } catch (error) {
    if (['TENANT_DATABASE_NOT_READY', 'TENANT_RUNTIME_NOT_READY', 'TENANT_WRITE_MAINTENANCE'].includes(error.code)) {
      return sendError(res, 503, error.message, null, error.code);
    }
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token expired', null, 'TOKEN_EXPIRED');
    }
    return sendError(res, 401, 'Invalid authentication token', null, 'INVALID_TOKEN');
  }
};
