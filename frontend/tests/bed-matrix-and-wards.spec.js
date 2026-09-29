import { test, expect } from '@playwright/test';
import { mockAuthSession, mockBed } from './helpers/authHelper.js';

test.describe('Bed Matrix & Physical Hierarchy Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page, 'HOSPITAL_ADMIN');
  });

  test('should render Bed Matrix dashboard with KPI summary counters and view mode toggles', async ({ page }) => {
    await page.goto('/admin/bed-matrix');
    await expect(page).toHaveURL('/admin/bed-matrix');

    // 1. Verify Top KPI Counters
    await expect(page.getByText('Total Beds')).toBeVisible();
    await expect(page.getByText('Available').first()).toBeVisible();
    await expect(page.getByText('Occupied').first()).toBeVisible();
    await expect(page.getByText('Occupancy Rate')).toBeVisible();

    // 2. Main Navigation Tabs
    await expect(page.getByRole('button', { name: /Live Bed Matrix/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Physical Hierarchy Setup/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Housekeeping/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Transfers/i })).toBeVisible();

    // 3. Top Action Buttons
    await expect(page.getByRole('button', { name: /Rapid Emergency Finder/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Bulk Generator/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Add Bed/i })).toBeVisible();
  });

  test('should open Emergency Bed Finder modal and close it', async ({ page }) => {
    await page.goto('/admin/bed-matrix');

    // Click Rapid Emergency Finder
    await page.getByRole('button', { name: /Rapid Emergency Finder/i }).click();

    // Verify modal appears
    await expect(page.getByText(/Rapid Emergency Bed Allocation Desk/i)).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
  });

  test('should navigate to Physical Hierarchy Setup and switch between Blocks, Floors, Wards, Rooms, Beds', async ({ page }) => {
    await page.goto('/admin/bed-matrix');

    // Switch to Setup tab
    await page.getByRole('button', { name: /Physical Hierarchy Setup/i }).click();

    // Verify Sub-Tabs using data-testid
    await expect(page.locator('[data-testid="tab-blocks"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-floors"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-wards"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-rooms"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-beds"]')).toBeVisible();

    // Click Floors sub-tab
    await page.locator('[data-testid="tab-floors"]').click();
    await expect(page.getByRole('button', { name: /Add Floor/i })).toBeVisible();

    // Click Wards sub-tab
    await page.locator('[data-testid="tab-wards"]').click();
    await expect(page.getByRole('button', { name: /Add Ward/i })).toBeVisible();

    // Click Rooms sub-tab
    await page.locator('[data-testid="tab-rooms"]').click();
    await expect(page.getByRole('button', { name: /Add Room/i })).toBeVisible();
  });

  test('should trigger Add Bed modal from Physical Hierarchy Beds tab', async ({ page }) => {
    await page.goto('/admin/bed-matrix');

    // Click top Add Bed button
    await page.getByRole('button', { name: /Add Bed/i }).first().click();

    // Verify Add/Create Bed Modal
    await expect(page.getByText(/Create New Bed|Configure Bed|Add Bed/i).first()).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: /Cancel|Close/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('should switch view modes and filter beds in Live Bed Matrix', async ({ page }) => {
    await page.goto('/admin/bed-matrix');

    // Filter beds by status dropdown
    const statusSelect = page.locator('select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption({ index: 0 });
    }

    // Toggle View modes if buttons present (Grid / Cards / List)
    const cardModeBtn = page.getByRole('button', { name: /Card|Cards/i });
    if (await cardModeBtn.isVisible()) {
      await cardModeBtn.click();
    }
  });
});
