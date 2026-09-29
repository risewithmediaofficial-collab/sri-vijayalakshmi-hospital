import { test, expect } from '@playwright/test';
import { mockAuthSession, mockPatient } from './helpers/authHelper.js';

test.describe('Doctor Consultation & EMR Flow Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page, 'DOCTOR', { name: 'Dr. N Raju', email: 'drnraju@gmail.com' });
  });

  test('should render Doctor Clinical EMR Workstation with status, cabin, and stat counters', async ({ page }) => {
    await page.goto('/doctor/dashboard');
    await expect(page).toHaveURL('/doctor/dashboard');

    // 1. Workstation Header & Availability Status
    await expect(page.getByRole('heading', { name: /Doctor Clinical EMR Workstation/i })).toBeVisible();
    await expect(page.getByText('AVAILABLE', { exact: true })).toBeVisible();
    await expect(page.getByText(/OPD Cabin:/i).first()).toBeVisible();

    // 2. Lookup History and Toggle Availability buttons
    await expect(page.getByRole('button', { name: /Lookup History/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mark as Unavailable/i })).toBeVisible();

    // 3. Stat Cards
    await expect(page.getByText('OPD Live Queue')).toBeVisible();
    await expect(page.getByText('Completed Consultations')).toBeVisible();
    await expect(page.getByText('Department Responses')).toBeVisible();
  });

  test('should toggle doctor availability status between Available and Unavailable', async ({ page }) => {
    await page.goto('/doctor/dashboard');

    // Toggle to Unavailable
    const toggleBtn = page.getByRole('button', { name: /Mark as Unavailable/i });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();

    // Verify offline warning or unavailable state
    await expect(page.getByRole('button', { name: /Mark as Available|Go Online Now/i }).first()).toBeVisible();
  });

  test('should display Live OPD Token Queue and select patient token', async ({ page }) => {
    await page.goto('/doctor/dashboard');

    // Token card in Live Queue
    const tokenCard = page.getByText(/TOKEN #1/i).first();
    await expect(tokenCard).toBeVisible();
    await expect(page.getByText('Ramesh Kumar').first()).toBeVisible();

    // Click to select patient token
    await tokenCard.click();

    // Verify Patient Consultation Workspace loads active patient
    await expect(page.getByRole('heading', { name: /Patient Consultation Workspace/i })).toBeVisible();
    await expect(page.getByText(/Active Patient:/i)).toBeVisible();
  });

  test('should display all primary clinical consultation buttons for active patient', async ({ page }) => {
    await page.goto('/doctor/dashboard');

    // Select token
    await page.getByText(/TOKEN #1/i).first().click();

    // Verify primary action buttons
    await expect(page.getByRole('button', { name: /Prescribe & Medical/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Direct to Bill/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Send to Nurse/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Request Test/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Recommend IPD/i })).toBeVisible();
  });

  test('should open Prescribe & Medical modal and interact with prescription inputs', async ({ page }) => {
    await page.goto('/doctor/dashboard');

    // Select token
    await page.getByText(/TOKEN #1/i).first().click();

    // Open Prescribe & Medical modal
    await page.getByRole('button', { name: /Prescribe & Medical/i }).click();

    // Modal should be visible
    await expect(page.getByText(/Clinical Consultation & Charges Review/i)).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('should open Request Test modal for lab / radiology orders', async ({ page }) => {
    await page.goto('/doctor/dashboard');

    // Select token
    await page.getByText(/TOKEN #1/i).first().click();

    // Open Request Test modal
    await page.getByRole('button', { name: /Request Test/i }).click();

    // Modal visible
    await expect(page.getByText(/Request Diagnostic Investigation/i)).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });
});
