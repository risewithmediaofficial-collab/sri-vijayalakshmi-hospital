import { test, expect } from '@playwright/test';
import { mockAuthSession, mockPatient } from './helpers/authHelper.js';

test.describe('Patient & Guardian Self-Service Portals Suite', () => {
  test('should render Patient Portal Dashboard with active admission and demographics', async ({ page }) => {
    await mockAuthSession(page, 'PATIENT', { name: 'Ramesh Kumar', email: 'ramesh.kumar@example.com' });
    await page.goto('/patient-portal/dashboard');
    await expect(page).toHaveURL(/.*patient-portal\/dashboard.*/);

    // Patient visible heading & UHID
    await expect(page.getByRole('heading', { level: 2, name: 'Ramesh Kumar' })).toBeVisible();
    await expect(page.getByText(mockPatient.uhid).first()).toBeVisible();

    // Active Admission banner
    await expect(page.getByText(/Currently Admitted – IPD/i)).toBeVisible();
    await expect(page.getByText(/General Ward/i).first()).toBeVisible();
  });

  test('should navigate across Patient Portal tabs (Prescriptions, Billing)', async ({ page }) => {
    await mockAuthSession(page, 'PATIENT', { name: 'Ramesh Kumar', email: 'ramesh.kumar@example.com' });
    await page.goto('/patient-portal/prescriptions');
    await expect(page).toHaveURL(/.*patient-portal\/prescriptions.*/);

    await page.goto('/patient-portal/billing');
    await expect(page).toHaveURL(/.*patient-portal\/billing.*/);
  });

  test('should render Guardian Portal Dashboard with linked patient context and status', async ({ page }) => {
    await mockAuthSession(page, 'GUARDIAN', { name: 'Murugan (Guardian)', email: 'guardian@example.com' });
    await page.goto('/guardian-portal/dashboard');
    await expect(page).toHaveURL(/.*guardian-portal\/dashboard.*/);

    // Patient status stat card
    await expect(page.getByText('Patient Status', { exact: true })).toBeVisible();
    await expect(page.getByText('Live Clinical Care').first()).toBeVisible();

    // Verify patient selector combobox
    const patientSelect = page.locator('select').first();
    await expect(patientSelect).toBeVisible();
  });

  test('should open Link Another Patient modal in Guardian Portal and close it', async ({ page }) => {
    await mockAuthSession(page, 'GUARDIAN', { name: 'Murugan (Guardian)', email: 'guardian@example.com' });
    await page.goto('/guardian-portal/dashboard');

    // Click Link Another Patient button
    const linkBtn = page.getByRole('button', { name: /\+ Link Another Patient|Link Patient/i }).first();
    await expect(linkBtn).toBeVisible();
    await linkBtn.click();

    // Verify Modal
    await expect(page.getByText(/Link Patient to Guardian Account|Request Patient Link/i).first()).toBeVisible();

    // Close Modal
    await page.keyboard.press('Escape');
  });
});
