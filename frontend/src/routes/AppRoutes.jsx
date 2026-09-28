import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { GlobalCodeBlueModal } from '../components/emergency/GlobalCodeBlueModal';
import { GenericSubView } from '../components/common/GenericSubView';
import { ROLES, ROLE_NAVIGATION } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

import { LoginPage } from '../pages/LoginPage';
import { VerifyEmailPage } from '../pages/Auth/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/Auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/Auth/ResetPasswordPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { EmergencyBanner } from '../components/emergency/EmergencyBanner';
import { lazyRetry } from '../utils/lazyRetry';

// Route-based Code Splitting: Lazy-loaded pages with auto-chunk retry
const HospitalAdminDashboard = lazyRetry(() => import('../pages/Dashboards/HospitalAdminDashboard').then(m => ({ default: m.HospitalAdminDashboard })));
const HospitalAdminManagementViews = lazyRetry(() => import('../pages/Dashboards/HospitalAdminManagementViews').then(m => ({ default: m.HospitalAdminManagementViews })));
const DoctorDashboard = lazyRetry(() => import('../pages/Dashboards/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const NurseInchargeDashboard = lazyRetry(() => import('../pages/Dashboards/NurseInchargeDashboard').then(m => ({ default: m.NurseInchargeDashboard })));
const ReceptionDashboard = lazyRetry(() => import('../pages/Dashboards/ReceptionDashboard').then(m => ({ default: m.ReceptionDashboard })));
const PharmacistDashboard = lazyRetry(() => import('../pages/Dashboards/PharmacistDashboard').then(m => ({ default: m.PharmacistDashboard })));
const LabTechDashboard = lazyRetry(() => import('../pages/Dashboards/LabTechDashboard').then(m => ({ default: m.LabTechDashboard })));
const RadiologistDashboard = lazyRetry(() => import('../pages/Dashboards/RadiologistDashboard').then(m => ({ default: m.RadiologistDashboard })));
const CashierDashboard = lazyRetry(() => import('../pages/Dashboards/CashierDashboard').then(m => ({ default: m.CashierDashboard })));
const PatientDashboard = lazyRetry(() => import('../pages/Dashboards/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const GuardianDashboard = lazyRetry(() => import('../pages/Dashboards/GuardianDashboard').then(m => ({ default: m.GuardianDashboard })));
const InventoryDashboard = lazyRetry(() => import('../pages/Dashboards/InventoryDashboard').then(m => ({ default: m.InventoryDashboard })));
const HRDashboard = lazyRetry(() => import('../pages/Dashboards/HRDashboard').then(m => ({ default: m.HRDashboard })));
const RegisteredPatientsView = lazyRetry(() => import('../pages/Reception/RegisteredPatientsView').then(m => ({ default: m.RegisteredPatientsView })));
const PatientRegistrationPage = lazyRetry(() => import('../pages/Reception/PatientRegistrationPage').then(m => ({ default: m.PatientRegistrationPage })));
const EmergencyConsoleView = lazyRetry(() => import('../pages/Emergency/EmergencyConsoleView').then(m => ({ default: m.EmergencyConsoleView })));
const AdminExtraPage = lazyRetry(() => import('../pages/Dashboards/AdminExtraPage').then(m => ({ default: m.AdminExtraPage })));
const BedMatrixPage = lazyRetry(() => import('../pages/Dashboards/BedMatrixPage').then(m => ({ default: m.BedMatrixPage })));
const WorkflowTrackerPage = lazyRetry(() => import('../pages/Workflow/WorkflowTrackerPage').then(m => ({ default: m.WorkflowTrackerPage })));

const RouteLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[40vh] w-full p-8 animate-fade-in">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold text-slate-500 tracking-wide">Loading workspace...</p>
    </div>
  </div>
);

const MainLayout = ({ children, hideSidebar = false, noPadding = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname, location.search]);

  const menuItems = user?.role ? ROLE_NAVIGATION[user.role] || [] : [];
  const shouldHideSidebar = hideSidebar || menuItems.length === 0;

  return (
    <div className="h-screen max-h-screen flex bg-slate-100 text-slate-900 overflow-hidden">
      {!shouldHideSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onToggleSidebar={shouldHideSidebar ? null : () => setSidebarOpen(!sidebarOpen)} />
        <EmergencyBanner />
        <main ref={mainRef} className={`flex-1 min-h-0 overflow-y-auto ${noPadding ? 'p-0' : 'p-6'}`}>
          <div key={location.pathname + location.search} className="min-h-full">
            {children}
          </div>
        </main>
      </div>
      <GlobalCodeBlueModal />
    </div>
  );
};

const LegacyDomainRedirect = () => {
  const location = useLocation();
  const path = location.pathname;
  // If path starts with any domain slug (e.g. /sri-vijaya-lakshmi/doctor/dashboard),
  // strip the domain prefix and seamlessly redirect to the flat route
  const cleanedPath = path.replace(/^\/[^/]+(\/(admin|hospital-admin|doctor|nurse|nursing|nurse-incharge|reception|pharmacy|laboratory|radiology|billing|cashier|patient|patient-portal|guardian|guardian-portal|ipd|opd|workflow|emergency|beds|bed-matrix).*)$/, '$1');

  if (cleanedPath !== path) {
    return <Navigate to={`${cleanedPath}${location.search}${location.hash}`} replace />;
  }
  return <NotFoundPage />;
};

export const AppRoutes = () => {
  return (
    <React.Suspense fallback={<RouteLoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/403" element={<ForbiddenPage />} />

        {/* Shortcut redirects */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/hospital-admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="/nurse" element={<Navigate to="/nursing/dashboard" replace />} />
        <Route path="/nursing" element={<Navigate to="/nursing/dashboard" replace />} />
        <Route path="/nurse-incharge" element={<Navigate to="/nurse-incharge/dashboard" replace />} />
        <Route path="/reception" element={<Navigate to="/reception/dashboard" replace />} />
        <Route path="/pharmacy" element={<Navigate to="/pharmacy/dashboard" replace />} />
        <Route path="/laboratory" element={<Navigate to="/laboratory/dashboard" replace />} />
        <Route path="/radiology" element={<Navigate to="/radiology/dashboard" replace />} />
        <Route path="/billing" element={<Navigate to="/billing/dashboard" replace />} />
        <Route path="/cashier" element={<Navigate to="/billing/dashboard" replace />} />
        <Route path="/patient" element={<Navigate to="/patient-portal/dashboard" replace />} />
        <Route path="/patient-portal" element={<Navigate to="/patient-portal/dashboard" replace />} />
        <Route path="/guardian" element={<Navigate to="/guardian-portal/dashboard" replace />} />
        <Route path="/workflow" element={<Navigate to="/workflow/tracker" replace />} />
        <Route path="/ipd" element={<Navigate to="/admin/bed-matrix" replace />} />
        <Route path="/opd" element={<Navigate to="/reception/registered-patients" replace />} />

        {/* Ward & Bed Matrix — Admin, Doctors, Nurses and Ward Staff */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_MANAGER, ROLES.DOCTOR, ROLES.NURSE, ROLES.NURSE_INCHARGE, ROLES.IPD_STAFF]} />}>
          <Route path="/admin/bed-matrix" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/hospital-admin/bed-matrix" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/admin/beds" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/hospital-admin/beds" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/ipd/beds" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/ipd/bed-matrix" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/bed-matrix" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/beds" element={<MainLayout><BedMatrixPage /></MainLayout>} />
        </Route>

        {/* Hospital Admin Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.HOSPITAL_ADMIN, ROLES.DEPARTMENT_MANAGER]} />}>
          <Route path="/admin/dashboard" element={<MainLayout><HospitalAdminDashboard /></MainLayout>} />
          <Route path="/admin/staff" element={<MainLayout><HospitalAdminDashboard /></MainLayout>} />
          <Route path="/admin/departments" element={<MainLayout><GenericSubView title="Departments & Wards Setup" subtitle="Clinical and Diagnostic Departments" iconName="GitFork" /></MainLayout>} />
          <Route path="/admin/tariffs" element={<MainLayout><AdminExtraPage /></MainLayout>} />
          <Route path="/admin/reports" element={<MainLayout><AdminExtraPage /></MainLayout>} />
          <Route path="/admin/doctors-management" element={<MainLayout><HospitalAdminManagementViews viewType="doctors" /></MainLayout>} />
          <Route path="/admin/nurses-management" element={<MainLayout><HospitalAdminManagementViews viewType="nurses" /></MainLayout>} />
          <Route path="/admin/reception-management" element={<MainLayout><HospitalAdminManagementViews viewType="reception" /></MainLayout>} />
          <Route path="/admin/billing-management" element={<MainLayout><HospitalAdminManagementViews viewType="billing" /></MainLayout>} />
          <Route path="/admin/laboratory-management" element={<MainLayout><HospitalAdminManagementViews viewType="laboratory" /></MainLayout>} />
          <Route path="/admin/radiology-management" element={<MainLayout><HospitalAdminManagementViews viewType="radiology" /></MainLayout>} />
          <Route path="/admin/pharmacy-management" element={<MainLayout><HospitalAdminManagementViews viewType="pharmacy" /></MainLayout>} />
          <Route path="/admin/patients-management" element={<MainLayout><HospitalAdminManagementViews viewType="patients" /></MainLayout>} />
          <Route path="/admin/opd-management" element={<MainLayout><HospitalAdminManagementViews viewType="opd" /></MainLayout>} />
          <Route path="/admin/ipd-management" element={<MainLayout><HospitalAdminManagementViews viewType="ipd" /></MainLayout>} />
          <Route path="/admin/emergency-management" element={<MainLayout><HospitalAdminManagementViews viewType="emergency" /></MainLayout>} />
          {/* Legacy /hospital-admin/* aliases */}
          <Route path="/hospital-admin/dashboard" element={<MainLayout><HospitalAdminDashboard /></MainLayout>} />
          <Route path="/hospital-admin/staff" element={<MainLayout><HospitalAdminDashboard /></MainLayout>} />
          <Route path="/hospital-admin/departments" element={<MainLayout><GenericSubView title="Departments & Wards Setup" subtitle="Clinical and Diagnostic Departments" iconName="GitFork" /></MainLayout>} />
          <Route path="/hospital-admin/tariffs" element={<MainLayout><AdminExtraPage /></MainLayout>} />
          <Route path="/hospital-admin/reports" element={<MainLayout><AdminExtraPage /></MainLayout>} />
          <Route path="/hospital-admin/doctors-management" element={<MainLayout><HospitalAdminManagementViews viewType="doctors" /></MainLayout>} />
          <Route path="/hospital-admin/nurses-management" element={<MainLayout><HospitalAdminManagementViews viewType="nurses" /></MainLayout>} />
          <Route path="/hospital-admin/reception-management" element={<MainLayout><HospitalAdminManagementViews viewType="reception" /></MainLayout>} />
          <Route path="/hospital-admin/billing-management" element={<MainLayout><HospitalAdminManagementViews viewType="billing" /></MainLayout>} />
          <Route path="/hospital-admin/laboratory-management" element={<MainLayout><HospitalAdminManagementViews viewType="laboratory" /></MainLayout>} />
          <Route path="/hospital-admin/radiology-management" element={<MainLayout><HospitalAdminManagementViews viewType="radiology" /></MainLayout>} />
          <Route path="/hospital-admin/pharmacy-management" element={<MainLayout><HospitalAdminManagementViews viewType="pharmacy" /></MainLayout>} />
          <Route path="/hospital-admin/patients-management" element={<MainLayout><HospitalAdminManagementViews viewType="patients" /></MainLayout>} />
          <Route path="/hospital-admin/opd-management" element={<MainLayout><HospitalAdminManagementViews viewType="opd" /></MainLayout>} />
          <Route path="/hospital-admin/ipd-management" element={<MainLayout><HospitalAdminManagementViews viewType="ipd" /></MainLayout>} />
          <Route path="/hospital-admin/emergency-management" element={<MainLayout><HospitalAdminManagementViews viewType="emergency" /></MainLayout>} />
        </Route>

        {/* Doctor Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR]} />}>
          <Route path="/doctor/dashboard" element={<MainLayout noPadding><DoctorDashboard /></MainLayout>} />
          <Route path="/doctor/queue" element={<MainLayout noPadding><DoctorDashboard /></MainLayout>} />
          <Route path="/doctor/ipd-rounds" element={<MainLayout noPadding><DoctorDashboard /></MainLayout>} />
          <Route path="/doctor/prescriptions" element={<MainLayout noPadding><DoctorDashboard /></MainLayout>} />
          <Route path="/doctor/diagnostics" element={<MainLayout noPadding><DoctorDashboard /></MainLayout>} />
        </Route>

        {/* Nurse Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.NURSE, ROLES.NURSE_INCHARGE, ROLES.IPD_STAFF, ROLES.DOCTOR, ROLES.HOSPITAL_ADMIN]} />}>
          <Route path="/nurse/bed-matrix" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/nursing/dashboard" element={<MainLayout><NurseInchargeDashboard /></MainLayout>} />
          <Route path="/nursing/beds" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/nursing/requests" element={<MainLayout><NurseInchargeDashboard /></MainLayout>} />
          <Route path="/nursing/vitals" element={<MainLayout><NurseInchargeDashboard /></MainLayout>} />
          <Route path="/nurse-incharge/dashboard" element={<MainLayout><NurseInchargeDashboard /></MainLayout>} />
          <Route path="/nurse-incharge/bed-transfers" element={<MainLayout><BedMatrixPage /></MainLayout>} />
          <Route path="/nurse-incharge/overdue-requests" element={<MainLayout><NurseInchargeDashboard /></MainLayout>} />
          <Route path="/nurse-incharge/roster" element={<MainLayout><NurseInchargeDashboard /></MainLayout>} />
        </Route>

        {/* Patient Registration — Receptionist, OPD, Hospital Admin, Doctor */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.OPD_STAFF, ROLES.HOSPITAL_ADMIN, ROLES.DOCTOR]} />}>
          <Route path="/patient/register" element={<MainLayout><PatientRegistrationPage /></MainLayout>} />
          <Route path="/patient/register-patient" element={<MainLayout><PatientRegistrationPage /></MainLayout>} />
          <Route path="/patients/register" element={<MainLayout><PatientRegistrationPage /></MainLayout>} />
          <Route path="/patient-registration" element={<MainLayout><PatientRegistrationPage /></MainLayout>} />
          <Route path="/reception/register" element={<MainLayout><PatientRegistrationPage /></MainLayout>} />
        </Route>

        {/* Receptionist Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST, ROLES.OPD_STAFF]} />}>
          <Route path="/reception/dashboard" element={<MainLayout><ReceptionDashboard /></MainLayout>} />
          <Route path="/reception/registered-patients" element={<MainLayout><RegisteredPatientsView /></MainLayout>} />
          <Route path="/reception/register-patient" element={<MainLayout><PatientRegistrationPage /></MainLayout>} />
          <Route path="/reception/tokens" element={<MainLayout><ReceptionDashboard /></MainLayout>} />
          <Route path="/reception/visitors" element={<MainLayout><ReceptionDashboard /></MainLayout>} />
        </Route>

        {/* Pharmacist Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.PHARMACIST, ROLES.PHARMACY_STAFF]} />}>
          <Route path="/pharmacy/dashboard" element={<MainLayout><PharmacistDashboard /></MainLayout>} />
          <Route path="/pharmacy/dispense-queue" element={<MainLayout><PharmacistDashboard /></MainLayout>} />
          <Route path="/pharmacy/stock" element={<MainLayout><PharmacistDashboard /></MainLayout>} />
          <Route path="/pharmacy/expiry-alerts" element={<MainLayout><PharmacistDashboard /></MainLayout>} />
          <Route path="/pharmacy/audit" element={<MainLayout><PharmacistDashboard /></MainLayout>} />
        </Route>

        {/* Lab Tech Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.LAB_TECH, ROLES.LABORATORY_STAFF]} />}>
          <Route path="/laboratory/dashboard" element={<MainLayout><LabTechDashboard /></MainLayout>} />
          <Route path="/laboratory/samples" element={<MainLayout><LabTechDashboard /></MainLayout>} />
          <Route path="/laboratory/results" element={<MainLayout><LabTechDashboard /></MainLayout>} />
          <Route path="/laboratory/approvals" element={<MainLayout><LabTechDashboard /></MainLayout>} />
        </Route>

        {/* Radiologist Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.RADIOLOGIST, ROLES.RADIOLOGY_STAFF]} />}>
          <Route path="/radiology/dashboard" element={<MainLayout><RadiologistDashboard /></MainLayout>} />
          <Route path="/radiology/dicom" element={<MainLayout><RadiologistDashboard /></MainLayout>} />
          <Route path="/radiology/reports" element={<MainLayout><RadiologistDashboard /></MainLayout>} />
        </Route>

        {/* Cashier / Billing Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.CASHIER, ROLES.BILLING_STAFF]} />}>
          <Route path="/billing/dashboard" element={<MainLayout><CashierDashboard /></MainLayout>} />
          <Route path="/billing/create-invoice" element={<MainLayout><CashierDashboard /></MainLayout>} />
          <Route path="/billing/receipts" element={<MainLayout><CashierDashboard /></MainLayout>} />
          <Route path="/billing/shift-close" element={<MainLayout><CashierDashboard /></MainLayout>} />
        </Route>

        {/* Inventory Manager Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.INVENTORY_MANAGER]} />}>
          <Route path="/inventory/dashboard" element={<MainLayout><InventoryDashboard /></MainLayout>} />
          <Route path="/inventory/indents" element={<MainLayout><InventoryDashboard /></MainLayout>} />
          <Route path="/inventory/purchase-orders" element={<MainLayout><InventoryDashboard /></MainLayout>} />
          <Route path="/inventory/reorder-alerts" element={<MainLayout><InventoryDashboard /></MainLayout>} />
        </Route>

        {/* HR Manager Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.HR_MANAGER]} />}>
          <Route path="/hr/dashboard" element={<MainLayout><HRDashboard /></MainLayout>} />
          <Route path="/hr/roster" element={<MainLayout><HRDashboard /></MainLayout>} />
          <Route path="/hr/attendance" element={<MainLayout><HRDashboard /></MainLayout>} />
          <Route path="/hr/payroll" element={<MainLayout><HRDashboard /></MainLayout>} />
        </Route>

        {/* Patient Portal Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
          <Route path="/patient/dashboard" element={<Navigate to="/patient-portal/dashboard" replace />} />
          <Route path="/patient-portal/dashboard" element={<MainLayout><PatientDashboard activeTab="dashboard" /></MainLayout>} />
          <Route path="/patient-portal/profile" element={<MainLayout><PatientDashboard activeTab="profile" /></MainLayout>} />
          <Route path="/patient-portal/tokens" element={<MainLayout><PatientDashboard activeTab="tokens" /></MainLayout>} />
          <Route path="/patient-portal/treatment" element={<MainLayout><PatientDashboard activeTab="treatment" /></MainLayout>} />
          <Route path="/patient-portal/history" element={<MainLayout><PatientDashboard activeTab="history" /></MainLayout>} />
          <Route path="/patient-portal/doctor-instructions" element={<MainLayout><PatientDashboard activeTab="doctor-instructions" /></MainLayout>} />
          <Route path="/patient-portal/prescriptions" element={<MainLayout><PatientDashboard activeTab="prescriptions" /></MainLayout>} />
          <Route path="/patient-portal/lab-reports" element={<MainLayout><PatientDashboard activeTab="lab-reports" /></MainLayout>} />
          <Route path="/patient-portal/radiology-reports" element={<MainLayout><PatientDashboard activeTab="radiology-reports" /></MainLayout>} />
          <Route path="/patient-portal/admission" element={<MainLayout><PatientDashboard activeTab="admission" /></MainLayout>} />
          <Route path="/patient-portal/care-team" element={<MainLayout><PatientDashboard activeTab="care-team" /></MainLayout>} />
          <Route path="/patient-portal/requests" element={<MainLayout><PatientDashboard activeTab="requests" /></MainLayout>} />
          <Route path="/patient-portal/billing" element={<MainLayout><PatientDashboard activeTab="billing" /></MainLayout>} />
          <Route path="/patient-portal/discharge" element={<MainLayout><PatientDashboard activeTab="discharge" /></MainLayout>} />
          <Route path="/patient-portal/records" element={<MainLayout><PatientDashboard activeTab="prescriptions" /></MainLayout>} />
          <Route path="/patient-portal/bills" element={<MainLayout><PatientDashboard activeTab="billing" /></MainLayout>} />
          <Route path="/patient-portal/request-amenity" element={<MainLayout><PatientDashboard activeTab="requests" /></MainLayout>} />
        </Route>

        {/* Guardian Portal Sub-Routes */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.GUARDIAN]} />}>
          <Route path="/guardian/dashboard" element={<Navigate to="/guardian-portal/dashboard" replace />} />
          <Route path="/guardian-portal/dashboard" element={<MainLayout><GuardianDashboard activeTab="dashboard" /></MainLayout>} />
          <Route path="/guardian-portal/overview" element={<MainLayout><GuardianDashboard activeTab="overview" /></MainLayout>} />
          <Route path="/guardian-portal/treatment" element={<MainLayout><GuardianDashboard activeTab="treatment" /></MainLayout>} />
          <Route path="/guardian-portal/history" element={<MainLayout><GuardianDashboard activeTab="history" /></MainLayout>} />
          <Route path="/guardian-portal/doctor-updates" element={<MainLayout><GuardianDashboard activeTab="doctor-updates" /></MainLayout>} />
          <Route path="/guardian-portal/prescriptions" element={<MainLayout><GuardianDashboard activeTab="prescriptions" /></MainLayout>} />
          <Route path="/guardian-portal/reports" element={<MainLayout><GuardianDashboard activeTab="reports" /></MainLayout>} />
          <Route path="/guardian-portal/admission" element={<MainLayout><GuardianDashboard activeTab="admission" /></MainLayout>} />
          <Route path="/guardian-portal/care-team" element={<MainLayout><GuardianDashboard activeTab="care-team" /></MainLayout>} />
          <Route path="/guardian-portal/requests" element={<MainLayout><GuardianDashboard activeTab="requests" /></MainLayout>} />
          <Route path="/guardian-portal/billing" element={<MainLayout><GuardianDashboard activeTab="billing" /></MainLayout>} />
          <Route path="/guardian-portal/discharge" element={<MainLayout><GuardianDashboard activeTab="discharge" /></MainLayout>} />
          <Route path="/guardian-portal/updates" element={<MainLayout><GuardianDashboard activeTab="doctor-updates" /></MainLayout>} />
          <Route path="/guardian-portal/pay-online" element={<MainLayout><GuardianDashboard activeTab="billing" /></MainLayout>} />
        </Route>

        {/* Workflow Tracker — all authenticated users */}
        <Route element={<ProtectedRoute allowedRoles={Object.values(ROLES)} />}>
          <Route path="/workflow/tracker" element={<MainLayout><WorkflowTrackerPage /></MainLayout>} />
          <Route path="/workflow/data-tracking" element={<MainLayout><WorkflowTrackerPage /></MainLayout>} />
        </Route>

        {/* Emergency Console */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE, ROLES.NURSE_INCHARGE, ROLES.IPD_STAFF, ROLES.RECEPTIONIST, ROLES.OPD_STAFF, ROLES.HOSPITAL_ADMIN]} />}>
          <Route path="/emergency" element={<MainLayout><EmergencyConsoleView /></MainLayout>} />
        </Route>

        {/* 404 fallback with automatic legacy domain redirect */}
        <Route path="*" element={<LegacyDomainRedirect />} />
      </Routes>
    </React.Suspense>
  );
};
