import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Compass, Home, BedDouble, UserPlus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../utils/constants';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const [countdown, setCountdown] = useState(5);
  const [autoRedirectCancelled, setAutoRedirectCancelled] = useState(false);

  const getTargetDashboard = () => {
    if (!isAuthenticated || !user) {
      return '/login';
    }
    const routes = {
      [ROLES.HOSPITAL_ADMIN]: '/admin/dashboard',
      [ROLES.DOCTOR]: '/doctor/dashboard',
      [ROLES.NURSE]: '/nursing/dashboard',
      [ROLES.NURSE_INCHARGE]: '/nurse-incharge/dashboard',
      [ROLES.RECEPTIONIST]: '/reception/dashboard',
      [ROLES.PHARMACIST]: '/pharmacy/dashboard',
      [ROLES.LAB_TECH]: '/laboratory/dashboard',
      [ROLES.RADIOLOGIST]: '/radiology/dashboard',
      [ROLES.CASHIER]: '/billing/dashboard',
      [ROLES.PATIENT]: '/patient-portal/dashboard',
      [ROLES.GUARDIAN]: '/guardian-portal/dashboard',
    };
    return routes[user.role] || '/admin/dashboard';
  };

  const targetDashboard = getTargetDashboard();

  useEffect(() => {
    if (autoRedirectCancelled) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(targetDashboard);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirectCancelled, targetDashboard, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6 text-center select-none relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-100 opacity-60 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-slate-200 opacity-60 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Compass size={32} className="animate-spin-slow" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-3">
          <span>Sri Vijaya Lakshmi Hospital</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Page Relocated or Not Found
        </h1>

        <p className="mt-2 text-xs text-slate-500 font-mono break-all px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
          {location.pathname}
        </p>

        <p className="mt-4 text-xs text-slate-500">
          Auto-navigating back to your workstation in{' '}
          <span className="text-indigo-600 font-bold text-sm">{countdown}s</span>...
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            variant="primary"
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md cursor-pointer"
            onClick={() => navigate(targetDashboard)}
          >
            <Home size={18} />
            <span>Return to Workstation Dashboard</span>
            <ArrowRight size={16} />
          </Button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                setAutoRedirectCancelled(true);
                navigate('/admin/bed-matrix');
              }}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <BedDouble size={14} className="text-emerald-600" />
              <span>Bed Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoRedirectCancelled(true);
                navigate('/reception/registered-patients');
              }}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <UserPlus size={14} className="text-blue-600" />
              <span>Patient Directory</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoRedirectCancelled(true)}
            className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors underline underline-offset-4 cursor-pointer"
          >
            Cancel automatic redirection
          </button>
        </div>
      </div>
    </div>
  );
};
