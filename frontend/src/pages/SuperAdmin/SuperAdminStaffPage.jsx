import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * SuperAdmin / SaaS multi-tenant cross-hospital staff viewer is decommissioned.
 * All hospital staff and permissions are managed in Sri Vijaya Lakshmi Hospital Staff Workbench (/admin/staff).
 */
export const SuperAdminStaffPage = () => {
  return <Navigate to="/admin/staff" replace />;
};

export default SuperAdminStaffPage;
