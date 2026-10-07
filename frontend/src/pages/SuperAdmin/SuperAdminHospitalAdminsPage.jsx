import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * SuperAdmin / SaaS multi-hospital admin switcher is decommissioned.
 * Staff and administrators are managed via the Sri Vijaya Lakshmi Hospital Staff Workbench (/admin/staff).
 */
export const SuperAdminHospitalAdminsPage = () => {
  return <Navigate to="/admin/staff" replace />;
};

export default SuperAdminHospitalAdminsPage;
