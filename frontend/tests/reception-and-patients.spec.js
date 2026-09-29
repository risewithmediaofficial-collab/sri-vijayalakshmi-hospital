import { test, expect } from '@playwright/test';
import { mockAuthSession, mockPatient } from './helpers/authHelper.js';

test.describe('Reception & Patient Registration Operations Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page, 'RECEPTIONIST');
  });

  test('should render Reception Dashboard workspace with clinic status and action buttons', async ({ page }) => {
    await page.goto('/reception/dashboard');
    await expect(page).toHaveURL('/reception/dashboard');

    // Clinic Front Desk branding & live badge
    await expect(page.getByRole('heading', { name: /Clinic Front Desk/i })).toBeVisible();
    await expect(page.getByText(/Live OPD Desk/i)).toBeVisible();

    // Action buttons & Workspace tabs
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Open Billing Desk/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Patient Intake & OPD Queue/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Follow-Up Visits/i })).toBeVisible();

    // Mode Toggle (New Walk-in vs Returning)
    await expect(page.getByRole('button', { name: /\+ New Walk-In Registration/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Returning Patient/i })).toBeVisible();
  });

  test('should interact with Patient Intake corner form and toggle guardian details', async ({ page }) => {
    await page.goto('/reception/dashboard');

    // First Name input
    const firstNameInput = page.getByPlaceholder(/Your Name/i).first();
    await expect(firstNameInput).toBeVisible();
    await firstNameInput.fill('Anand');

    // Last Name input
    const lastNameInput = page.getByPlaceholder(/Last Name/i).first();
    await expect(lastNameInput).toBeVisible();
    await lastNameInput.fill('Kumar');

    // Mobile Phone input
    const phoneInput = page.getByPlaceholder(/10-digit mobile number/i);
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill('9443322110');

    // Guardian details toggle
    const guardianToggle = page.getByRole('button', { name: /Guardian Details/i });
    await expect(guardianToggle).toBeVisible();
    await guardianToggle.click();

    // Verify guardian fields opened
    await expect(page.getByRole('button', { name: /Hide Guardian Details/i })).toBeVisible();

    // Verify Issue Token button exists
    const issueTokenBtn = page.getByRole('button', { name: /Issue OPD Token/i }).first();
    await expect(issueTokenBtn).toBeVisible();
  });

  test('should open full Dedicated Patient Registration Page and fill form', async ({ page }) => {
    await page.goto('/reception/register-patient');
    await expect(page).toHaveURL('/reception/register-patient');

    // Verify Dedicated Intake Form Header
    await expect(page.getByText(/New Patient Intake & Registration Form/i)).toBeVisible();

    // 1. Demographics
    await page.getByPlaceholder(/Your Name/i).first().fill('Suresh');
    await page.getByPlaceholder(/Enter last name/i).first().fill('Venkatesh');
    await page.getByPlaceholder(/35/i).first().fill('29');
    await page.getByPlaceholder(/Enter residential address/i).fill('12 Green Park, Salem');

    // 2. Action buttons
    const registerBtn = page.getByRole('button', { name: /Register Patient/i });
    await expect(registerBtn).toBeVisible();

    const saveAndTokenBtn = page.getByRole('button', { name: /Save & Issue OPD Token/i });
    await expect(saveAndTokenBtn).toBeVisible();
  });

  test('should search and filter Registered Patients Directory in Reception Workspace', async ({ page }) => {
    await page.goto('/reception/registered-patients');
    await expect(page).toHaveURL('/reception/registered-patients');

    // Search bar in directory table
    const searchInput = page.getByPlaceholder(/Search by UHID, Name, or Mobile/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Ramesh');

    // Patient record row
    await expect(page.getByText('Ramesh Kumar').first()).toBeVisible();
    await expect(page.getByText(mockPatient.uhid).first()).toBeVisible();

    // Directory Action buttons (Issue Token, View Profile/Details)
    await expect(page.getByRole('button', { name: /Issue Token/i }).first()).toBeVisible();
  });
});
