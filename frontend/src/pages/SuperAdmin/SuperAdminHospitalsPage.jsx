import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * SuperAdmin / SaaS multi-tenant hospital approval workbench is decommissioned.
 * All hospital administration is handled via the Sri Vijaya Lakshmi Hospital Admin Dashboard.
 *
 * Security Contract:
 * - Current passwords are never retrievable. Enter a new password below only when an authorized reset is required.
 * - Password length check: (newPassword.trim().length < 8)
 */
export const SuperAdminHospitalsPage = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default SuperAdminHospitalsPage;
