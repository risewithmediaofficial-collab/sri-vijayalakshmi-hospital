import { test, expect } from '@playwright/test';
import { mockAuthSession } from './helpers/authHelper.js';

test.describe('Ancillary Departments Suite (Pharmacy, Lab, Radiology, Emergency)', () => {
  test('should render Pharmacy Dashboard with inventory tabs and open Add Medicine modal', async ({ page }) => {
    await mockAuthSession(page, 'PHARMACIST');
    await page.goto('/pharmacy/dashboard');
    await expect(page).toHaveURL('/pharmacy/dashboard');

    // Header
    await expect(page.getByRole('heading', { name: /Pharmacy & Medicine Inventory/i })).toBeVisible();

    // Add Medicine button
    const addMedBtn = page.getByRole('button', { name: /\+ Add Medicine|Add Medicine/i }).first();
    await expect(addMedBtn).toBeVisible();
    await addMedBtn.click();

    // Verify Add Medicine modal
    await expect(page.getByText(/Add New Medicine|Medicine Details/i).first()).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('should render Laboratory LIS Workstation with order queue and status counters', async ({ page }) => {
    await mockAuthSession(page, 'LAB_TECH');
    await page.goto('/laboratory/dashboard');
    await expect(page).toHaveURL('/laboratory/dashboard');

    // Workstation Header
    await expect(page.getByRole('heading', { name: /Pathology Laboratory & LIS Workstation/i })).toBeVisible();

    // Stat Cards
    await expect(page.getByText('Active Pathology Requests')).toBeVisible();
    await expect(page.getByText('Emergency Requests')).toBeVisible();

    // LIS Live Badge & Order Queue
    await expect(page.getByText('LIS LIVE')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order Queue' })).toBeVisible();
  });

  test('should render Radiology & PACS Workstation with scan queue and DICOM status', async ({ page }) => {
    await mockAuthSession(page, 'RADIOLOGIST');
    await page.goto('/radiology/dashboard');
    await expect(page).toHaveURL('/radiology/dashboard');

    // Header
    await expect(page.getByRole('heading', { name: /Radiology & PACS Imaging Workstation/i })).toBeVisible();

    // Stat Cards
    await expect(page.getByText('Active PACS Requests')).toBeVisible();
    await expect(page.getByText('STAT Emergency Scans')).toBeVisible();

    // DICOM PACS Badge & Scan Queue
    await expect(page.getByText('DICOM PACS')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Scan Queue' })).toBeVisible();
  });

  test('should trigger Global Emergency / Code Blue broadcast modal from navbar and close it', async ({ page }) => {
    await mockAuthSession(page, 'DOCTOR');
    await page.goto('/doctor/dashboard');

    // Emergency button in Navbar
    const emergencyBtn = page.locator('button[title*="Code Blue"], button[title*="Emergency"]').first();
    await expect(emergencyBtn).toBeVisible();
    await emergencyBtn.click();

    // Verify Emergency modal opens
    await expect(page.getByText(/Emergency Code Blue|Emergency Alert|Code Blue Broadcast/i).first()).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });
});
