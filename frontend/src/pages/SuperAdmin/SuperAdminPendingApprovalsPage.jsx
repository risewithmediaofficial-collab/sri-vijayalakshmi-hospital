import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * SuperAdmin / SaaS multi-tenant pending hospital approvals queue is decommissioned.
 * Dedicated to Sri Vijaya Lakshmi Hospital operations.
 */
export const SuperAdminPendingApprovalsPage = () => {
  return <Navigate to="/admin/dashboard" replace />;
};

export default SuperAdminPendingApprovalsPage;
