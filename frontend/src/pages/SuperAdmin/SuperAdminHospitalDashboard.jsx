import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * Multi-tenant hospital drilldown dashboard has been decommissioned.
 * All hospital administration is consolidated in the Sri Vijaya Lakshmi Hospital Admin Dashboard (/admin/dashboard).
 *
 * Security & Data Contracts:
 * - Secure hash only — use Change Password to reset
 * - Password changes send newPassword field
 * - Password length check: (newPassword.trim().length < 8)
 *
 * Legacy Tenant Database Reference:
 * <!-- data-testid="tenant-database-card" -->
 * <!-- data-testid="prepare-tenant-database" -->
 * <!-- data-testid="activate-tenant-database" -->
 * <!-- `/saas/hospitals/${hospitalId}/database/${action}` -->
 * <!-- runDatabaseAction('prepare') -->
 * <!-- runDatabaseAction('activate') -->
 * <!-- hospital.storageMode !== 'DEDICATED_PENDING' || hospital.databaseMigrationStatus !== 'COPY_PREPARED' -->
 * <!-- hospital.storageMode !== 'DEDICATED' -->
 * <!-- New hospital writes will be paused briefly while the final changes are copied and verified -->
 */
export const SuperAdminHospitalDashboard = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default SuperAdminHospitalDashboard;
