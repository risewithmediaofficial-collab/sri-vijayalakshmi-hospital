import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * SuperAdmin / SaaS multi-tenant platform dashboard has been decommissioned.
 * All administrative controls are consolidated in the Sri Vijaya Lakshmi Hospital Admin Dashboard (/admin/dashboard).
 */
export const SuperAdminDashboardPage = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default SuperAdminDashboardPage;
