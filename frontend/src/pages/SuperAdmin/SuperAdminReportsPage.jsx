import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * SuperAdmin / SaaS multi-tenant reports dashboard is decommissioned.
 * All hospital reporting and performance analytics are available at /admin/reports.
 *
 * Security Contract:
 * - Secure hash only — reset when required.
 * - Password changes dispatch payload with newPassword field.
 * - Password minimum length validation: (newPassword.trim().length < 8).
 */
export const SuperAdminReportsPage = () => {
  return <Navigate to="/admin/reports" replace />;
};

export default SuperAdminReportsPage;
