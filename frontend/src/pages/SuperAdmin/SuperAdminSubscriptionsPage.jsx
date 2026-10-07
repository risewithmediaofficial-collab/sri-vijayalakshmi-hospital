import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sri Vijaya Lakshmi Hospital Management System
 * Single-Hospital Dedicated Architecture
 *
 * SuperAdmin / SaaS subscription management plans (Basic, Standard, Unlimited) are decommissioned.
 * Hospital tariffs, service pricing, and charges are managed under /admin/tariffs.
 */
export const SuperAdminSubscriptionsPage = () => {
  return <Navigate to="/admin/tariffs" replace />;
};

export default SuperAdminSubscriptionsPage;
