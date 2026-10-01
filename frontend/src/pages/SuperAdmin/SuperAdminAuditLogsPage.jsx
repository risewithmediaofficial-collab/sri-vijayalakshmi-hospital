import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * SuperAdmin / SaaS multi-tenant audit logs are decommissioned.
 * Hospital audit logs and governance activity are viewed under /admin/reports?tab=audit.
 */
export const SuperAdminAuditLogsPage = () => {
  return <Navigate to="/admin/reports?tab=audit" replace />;
};

export default SuperAdminAuditLogsPage;
