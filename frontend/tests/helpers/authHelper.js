/**
 * Helper to mock authenticated sessions for Playwright tests in Sri Vijaya Lakshmi Hospital.
 * Sets localStorage token/user and intercepts /api/v1 API calls with rich mock data.
 */

/** Return the home path for a role in standalone mode */
export function getHomePath(role) {
  const routes = {
    HOSPITAL_ADMIN: '/admin/dashboard',
    SUPER_ADMIN: '/admin/dashboard',
    DOCTOR: '/doctor/dashboard',
    NURSE: '/nursing/dashboard',
    NURSE_INCHARGE: '/nurse-incharge/dashboard',
    IPD_STAFF: '/nurse-incharge/dashboard',
    RECEPTIONIST: '/reception/dashboard',
    OPD_STAFF: '/reception/dashboard',
    PHARMACIST: '/pharmacy/dashboard',
    PHARMACY_STAFF: '/pharmacy/dashboard',
    LAB_TECH: '/laboratory/dashboard',
    LABORATORY_STAFF: '/laboratory/dashboard',
    RADIOLOGIST: '/radiology/dashboard',
    RADIOLOGY_STAFF: '/radiology/dashboard',
    CASHIER: '/billing/dashboard',
    BILLING_STAFF: '/billing/dashboard',
    INVENTORY_MANAGER: '/inventory/dashboard',
    HR_MANAGER: '/hr/dashboard',
    PATIENT: '/patient-portal/dashboard',
    GUARDIAN: '/guardian-portal/dashboard',
  };
  return routes[role] || '/admin/dashboard';
}

export const mockHospital = {
  _id: '6a7ec018e5270e251cbed162',
  id: '6a7ec018e5270e251cbed162',
  name: 'Sri Vijaya Lakshmi Hospital',
  code: 'SVLH',
  domain: 'svlh',
  subdomain: 'svlh',
  status: 'APPROVED',
  isActive: true,
  enabledModules: {
    dashboard: true,
    patients: true,
    appointments: true,
    doctors: true,
    reception: true,
    nursing: true,
    laboratory: true,
    radiology: true,
    pharmacy: true,
    billing: true,
    opd: true,
    ipd: true,
    emergency: true,
    staffManagement: true,
    hospitalSettings: true,
    patientPortal: true,
    guardianPortal: true,
  },
};

export const mockBranch = {
  _id: '6a7ec018e5270e251cbed16e',
  id: '6a7ec018e5270e251cbed16e',
  name: 'Main Branch',
  code: 'SVLH-MAIN',
  isMainBranch: true,
  isActive: true,
};

export const mockPatient = {
  _id: '6a8fd5dba51efb312329b6a1',
  id: '6a8fd5dba51efb312329b6a1',
  firstName: 'Ramesh',
  lastName: 'Kumar',
  fullName: 'Ramesh Kumar',
  uhid: 'SVLH-2026-00042',
  phone: '9876543210',
  email: 'ramesh.kumar@example.com',
  gender: 'MALE',
  age: 42,
  category: 'GENERAL',
  bloodGroup: 'O+',
  address: '12 Temple Street, Salem',
  city: 'Salem',
  admissionStatus: 'ADMITTED',
  activeAdmissionId: 'adm-001',
  createdAt: '2026-09-01T10:00:00.000Z',
};

export const mockBed = {
  _id: 'bed-101',
  bedNumber: 'BED-101',
  bedType: 'STANDARD',
  status: 'AVAILABLE',
  dailyRate: 1500,
  wardId: 'ward-01',
  wardName: 'Male General Ward',
  roomId: 'room-01',
  roomNumber: 'Room 101',
  floorId: 'floor-01',
  floorName: '1st Floor',
  blockId: 'block-01',
  blockName: 'Main Clinical Block',
};

export const mockInvoice = {
  _id: 'inv-001',
  invoiceNumber: 'INV-2026-0001',
  invoiceNo: 'INV-2026-0001',
  patientId: mockPatient,
  patient: mockPatient,
  patientUhid: mockPatient.uhid,
  status: 'UNPAID',
  items: [
    { description: 'Doctor Consultation Fee', name: 'Doctor Consultation Fee', category: 'CONSULTATION', unitPrice: 500, qty: 1, quantity: 1, totalPrice: 500, total: 500 },
    { description: 'Complete Blood Count (CBC)', name: 'Complete Blood Count (CBC)', category: 'LAB', unitPrice: 350, qty: 1, quantity: 1, totalPrice: 350, total: 350 },
    { description: 'Paracetamol 650mg (10 tabs)', name: 'Paracetamol 650mg (10 tabs)', category: 'PHARMACY', unitPrice: 50, qty: 1, quantity: 1, totalPrice: 50, total: 50 },
  ],
  subtotal: 900,
  tax: 0,
  discount: 0,
  discountAmount: 0,
  totalAmount: 900,
  grandTotal: 900,
  amountPaid: 0,
  paidAmount: 0,
  balanceDue: 900,
  balanceAmount: 900,
  createdAt: '2026-09-28T09:00:00.000Z',
};

export const mockReceipt = {
  _id: 'rcp-001',
  receiptNumber: 'RCP-2026-0001',
  receiptNo: 'RCP-2026-0001',
  invoiceId: mockInvoice,
  patientId: mockPatient,
  patient: mockPatient,
  amount: 900,
  amountPaid: 900,
  paymentMethod: 'CASH',
  paymentMode: 'CASH',
  status: 'ACTIVE',
  cashierName: 'Accounts Cashier',
  createdAt: '2026-09-28T09:30:00.000Z',
};

export async function mockAuthSession(page, role = 'HOSPITAL_ADMIN', options = {}) {
  const user = {
    id: 'user-svlh-admin',
    _id: 'user-svlh-admin',
    name: options.name || (role === 'DOCTOR' ? 'Dr. N Raju' : 'SVLH Admin'),
    email: options.email || (role === 'DOCTOR' ? 'drnraju@gmail.com' : 'admin@srivijayalakshmihospital.com'),
    phone: '9488969682',
    role,
    hospitalId: mockHospital._id,
    hospitalName: mockHospital.name,
    hospitalDomain: mockHospital.domain,
    branchId: mockBranch._id,
    branchName: mockBranch.name,
    status: 'ACTIVE',
    isActive: true,
    isAvailable: true,
    cabinNo: 'Cabin 101',
    permissions: { '*': ['*'] },
    enabledModules: mockHospital.enabledModules,
  };

  // Intercept all API calls under /api/v1/
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    // 1. Auth & Current Profile
    if (url.includes('/auth/me')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: user, user }) });
    }
    if (url.includes('/auth/login')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            user,
            tokens: { accessToken: 'mock-jwt-token-123', refreshToken: 'mock-refresh-token-123' }
          }
        })
      });
    }

    // 2. Patients
    if (url.includes('/patients') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [mockPatient], total: 1 })
      });
    }
    if (url.includes('/patients') && method === 'POST') {
      const postData = req.postDataJSON() || {};
      const newPatient = {
        _id: `patient-${Date.now()}`,
        uhid: `SVLH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        ...postData,
        fullName: `${postData.firstName || ''} ${postData.lastName || ''}`.trim(),
        createdAt: new Date().toISOString()
      };
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: newPatient }) });
    }

    // 3. Beds, Hierarchy & Matrix
    if (url.includes('/beds/summary')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { total: 10, available: 6, occupied: 3, reserved: 1, cleaning: 0, maintenance: 0, occupancyRate: 30 }
        })
      });
    }
    if (url.includes('/beds/hierarchy') || url.includes('/beds/structure')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            blocks: [{ _id: 'block-01', name: 'Main Clinical Block', code: 'MCB' }],
            floors: [{ _id: 'floor-01', name: '1st Floor', blockId: 'block-01' }],
            wards: [{ _id: 'ward-01', name: 'Male General Ward', floorId: 'floor-01', blockId: 'block-01' }],
            rooms: [{ _id: 'room-01', roomNumber: '101', wardId: 'ward-01' }],
            beds: [mockBed],
          }
        })
      });
    }
    if (url.includes('/beds') && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            mockBed,
            { ...mockBed, _id: 'bed-102', bedNumber: 'BED-102', status: 'OCCUPIED', patientName: 'Ramesh Kumar' },
            { ...mockBed, _id: 'bed-103', bedNumber: 'BED-103', status: 'MAINTENANCE' }
          ]
        })
      });
    }

    // 4. Billing & Cashier
    if (url.includes('/billing/unpaid-invoices')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [mockInvoice] }) });
    }
    if (url.includes('/billing/receipts')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [mockReceipt] }) });
    }
    if (url.includes('/billing/collect-payment') || url.includes('/billing/payments')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: mockReceipt, message: 'Payment recorded successfully' })
      });
    }

    // 5. Clinical & Doctor Queue
    if (url.includes('/availability')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { isAvailable: false, cabinNo: 'Cabin 101' } })
      });
    }
    if (url.includes('/doctor/queue') || url.includes('/appointments') || url.includes('/tokens')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'tok-001',
              tokenNumber: '1',
              patientId: mockPatient,
              patient: mockPatient,
              doctorName: 'Dr. N Raju',
              status: 'WAITING',
              chiefComplaints: 'Fever and cold',
              department: 'General Medicine',
              visitType: 'OPD',
              queuePosition: 1,
            }
          ]
        })
      });
    }
    if (url.includes('/prescriptions')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'rx-001',
              prescriptionNo: 'RX-2026-0001',
              patient: mockPatient,
              doctorName: 'Dr. N Raju',
              medicines: [{ name: 'Amoxicillin 500mg', dosage: '1-0-1', duration: '5 days' }],
              dispenseStatus: 'PENDING',
              createdAt: new Date().toISOString()
            }
          ]
        })
      });
    }

    // 6. Pharmacy & Inventory
    if (url.includes('/pharmacy/alerts')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { lowStock: [], outOfStock: [], nearExpiry: [], expired: [] } })
      });
    }
    if (url.includes('/pharmacy/medicines') || url.includes('/pharmacy/inventory')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'med-01', name: 'Paracetamol 650mg', batchNo: 'BATCH-2026A', stock: 500, expiryDate: '2028-12-31', unitPrice: 2.5 }
          ]
        })
      });
    }

    // 7. Diagnostics (Lab & Radiology)
    if (url.includes('/diagnostics') || url.includes('/laboratory') || url.includes('/radiology')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'diag-001',
              testName: 'Complete Blood Count (CBC)',
              patient: mockPatient,
              status: 'SAMPLE_COLLECTED',
              orderedAt: new Date().toISOString(),
              priority: 'NORMAL'
            }
          ]
        })
      });
    }

    // 8. Emergency & Code Blue
    if (url.includes('/emergency')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            {
              _id: 'er-001',
              patientName: 'Emergency Trauma Patient',
              triagePriority: 'RED',
              vitals: { bp: '80/50', pulse: 125, spo2: 89 },
              status: 'IMMEDIATE_CARE'
            }
          ]
        })
      });
    }

    // 9. Notifications
    if (url.includes('/notifications/unread-count')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, count: 2, data: { count: 2 } }) });
    }
    if (url.includes('/notifications')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: 'notif-01', title: 'New OPD Patient Checked In', message: 'Token T-01 is waiting in OPD Queue', isRead: false, createdAt: new Date().toISOString() },
            { _id: 'notif-02', title: 'Lab Results Ready', message: 'CBC report approved for Ramesh Kumar', isRead: false, createdAt: new Date().toISOString() }
          ]
        })
      });
    }

    // 10. Staff & Departments
    if (url.includes('/staff') || url.includes('/hospital/staff')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            user,
            { _id: 'user-02', name: 'Dr. Sarah Jenkins', email: 'sarah@hospital.com', role: 'DOCTOR', phone: '9443780118', isActive: true },
            { _id: 'user-03', name: 'Nurse Tanazzum', email: 'tanazzum56@gmail.com', role: 'NURSE_INCHARGE', phone: '9597140848', isActive: true },
            { _id: 'user-04', name: 'Monika Receptionist', email: 'monikapmppm@gmail.com', role: 'RECEPTIONIST', phone: '7867945751', isActive: true }
          ]
        })
      });
    }

    // 11. Patient / Guardian Portal
    if (url.includes('/patient-portal/active-context') || url.includes('/patient-portal/dashboard') || url.includes('/patient-portal/hospitals')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            hospitalId: mockHospital._id,
            localUhid: mockPatient.uhid,
            admission: { status: 'ADMITTED', targetWardName: 'General Ward', bedNumber: 'BED-101' },
            careTeam: [{ role: 'ATTENDING_DOCTOR', userName: 'Dr. N Raju' }],
            patient: mockPatient,
            tokens: [],
            prescriptions: [],
            labReports: [],
            radiologyReports: [],
            invoices: [mockInvoice],
          }
        })
      });
    }
    if (url.includes('/guardian-portal/linked-patients')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [{ linkId: 'link-01', relationship: 'SON', patient: mockPatient, liveAccessActive: true }]
        })
      });
    }
    if (url.includes('/guardian-portal/dashboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            patient: mockPatient,
            patientSummary: { currentStatus: 'ADMITTED', wardName: 'General Ward', bedNumber: 'BED-101' },
            admission: { status: 'ADMITTED', wardName: 'General Ward', bedNumber: 'BED-101' },
            vitals: { bp: '120/80', pulse: 74, temperature: '98.6' },
            doctorNotes: [],
            prescriptions: [],
            reports: [],
            bills: [mockInvoice]
          }
        })
      });
    }

    // Default Fallback
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });

  // Inject token and user into localStorage before page load
  await page.addInitScript(({ mockUser, hospital, branch }) => {
    window.localStorage.setItem('hpmbs_access_token', 'mock-jwt-token-svlh-2026');
    window.localStorage.setItem('hpmbs_user', JSON.stringify(mockUser));
    window.localStorage.setItem('hpmbs_active_branch_id', branch._id);
    window.localStorage.setItem('hpmbs_active_branch_name', branch.name);
  }, { mockUser: user, hospital: mockHospital, branch: mockBranch });
}
