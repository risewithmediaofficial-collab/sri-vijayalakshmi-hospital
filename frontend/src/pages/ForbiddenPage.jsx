import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const ROLE_DEFAULT_PATHS = {
  HOSPITAL_ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  NURSE: '/nursing/dashboard',
  NURSE_INCHARGE: '/nurse-incharge/dashboard',
  RECEPTIONIST: '/reception/dashboard',
  PHARMACIST: '/pharmacy/dashboard',
  LAB_TECH: '/laboratory/dashboard',
  RADIOLOGIST: '/radiology/dashboard',
  CASHIER: '/billing/dashboard',
  INVENTORY_MANAGER: '/inventory/dashboard',
  HR_MANAGER: '/hr/dashboard',
  PATIENT: '/patient-portal/dashboard',
  GUARDIAN: '/guardian-portal/dashboard',
};

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleReturn = () => {
    const path = (user?.role ? ROLE_DEFAULT_PATHS[user.role] : null) || user?.defaultRoute || '/login';
    navigate(path, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-red-100 opacity-50 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-slate-200 opacity-60 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShieldAlert size={36} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 mb-3">
          <span>Access Restricted</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          403 - Permission Denied
        </h1>

        <p className="mt-3 text-xs text-slate-500 leading-relaxed">
          Security Policy: Your active staff role does not have authorization to view this workstation route or dashboard.
        </p>

        <Button variant="primary" className="mt-6 w-full py-2.5 font-bold cursor-pointer" onClick={handleReturn}>
          Return to Authorized Dashboard
        </Button>
      </div>
    </div>
  );
};
