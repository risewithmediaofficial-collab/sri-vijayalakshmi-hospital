import { test, expect } from '@playwright/test';
import { mockAuthSession, mockInvoice, mockReceipt, mockPatient } from './helpers/authHelper.js';

test.describe('Billing & Cashier Workstation Operations Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page, 'CASHIER');
  });

  test('should render Cash Counter & Billing Workstation with shift collection counters', async ({ page }) => {
    await page.goto('/billing/dashboard');
    await expect(page).toHaveURL('/billing/dashboard');

    // 1. Workstation Header
    await expect(page.getByRole('heading', { name: /Cash Counter & Billing Workstation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Refresh Data/i })).toBeVisible();

    // 2. Shift Collection Stat Cards
    await expect(page.getByText("Today's Shift Collection")).toBeVisible();
    await expect(page.getByText('Receipts Issued Today')).toBeVisible();
    await expect(page.getByText('Pending Bills', { exact: true })).toBeVisible();
    await expect(page.getByText('Shift Reconciliation')).toBeVisible();
  });

  test('should display Pending Bills Queue with patient UHID and UNPAID badge', async ({ page }) => {
    await page.goto('/billing/dashboard');

    // Queue item
    await expect(page.getByText(mockPatient.uhid).first()).toBeVisible();
    await expect(page.getByText('UNPAID').first()).toBeVisible();
    await expect(page.getByText(/Pending Bills Queue/i)).toBeVisible();
  });

  test('should render selected invoice line items and calculation breakdown', async ({ page }) => {
    await page.goto('/billing/dashboard');

    // Select invoice from queue if needed
    const invoiceCard = page.getByText(mockPatient.uhid).first();
    await invoiceCard.click();

    // Verify invoice items table
    await expect(page.getByText('Doctor Consultation Fee').first()).toBeVisible();
    await expect(page.getByText('Complete Blood Count (CBC)').first()).toBeVisible();

    // Verify totals
    await expect(page.getByText('Subtotal')).toBeVisible();
    await expect(page.getByText('Balance Due')).toBeVisible();

    // Collect payment button
    await expect(page.getByRole('button', { name: /Collect .* & Print Receipt/i })).toBeVisible();
  });

  test('should open Process Payment modal, verify payment modes, and close it', async ({ page }) => {
    await page.goto('/billing/dashboard');

    // Click Collect Payment button
    await page.getByRole('button', { name: /Collect .* & Print Receipt/i }).click();

    // Verify Modal
    await expect(page.getByRole('heading', { name: /Collect Payment & Issue Receipt/i })).toBeVisible();

    // Verify invoice reference in modal
    await expect(page.getByText(mockInvoice.invoiceNo).first()).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: 'Close' });
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('should display Permanent Receipts & Payment Records history table', async ({ page }) => {
    await page.goto('/billing/receipts');
    await expect(page).toHaveURL(/.*billing\/receipts.*/);

    // Header & Subtabs
    await expect(page.getByRole('heading', { name: /Permanent Receipts & Payment Records/i }).first()).toBeVisible();

    // Verify receipt in list
    await expect(page.getByText(mockReceipt.receiptNo).first()).toBeVisible();
    await expect(page.getByText(mockPatient.uhid).first()).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole('button', { name: /WhatsApp/i }).first()).toBeVisible();
  });
});
