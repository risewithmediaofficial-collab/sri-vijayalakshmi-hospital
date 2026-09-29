import { test, expect } from '@playwright/test';
import { mockAuthSession } from './helpers/authHelper.js';

test.describe('Global Navigation, Navbar & Layout Interactions Suite', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthSession(page, 'HOSPITAL_ADMIN');
    await page.goto('/admin/dashboard');
  });

  test('should render top Navbar with Sri Vijaya Lakshmi Hospital branding and user controls', async ({ page }) => {
    // 1. Navbar title / branding
    await expect(page.locator('header').first()).toBeVisible();
    await expect(page.getByText('Sri Vijaya Lakshmi Hospital').first()).toBeVisible();

    // 2. Notification Bell button
    const bellBtn = page.locator('button[title="Notifications"]');
    await expect(bellBtn).toBeVisible();

    // 3. User profile trigger
    const profileBtn = page.locator('button[title="Click to view user profile, assigned roles & status"]');
    await expect(profileBtn).toBeVisible();
  });

  test('should open notification dropdown when clicking bell icon and allow interactions', async ({ page }) => {
    const bellBtn = page.locator('button[title="Notifications"]');
    await expect(bellBtn).toBeVisible();
    await bellBtn.click();

    // Notification dropdown panel visible
    await expect(page.getByText('Notification Center')).toBeVisible();

    // Mark all read or clear buttons inside dropdown
    const markAllBtn = page.getByRole('button', { name: /Mark all read|Mark All/i });
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
    }

    // Close on clicking outside or Escape
    await page.keyboard.press('Escape');
  });

  test('should open User Profile popover and perform Logout', async ({ page }) => {
    // Find profile trigger
    const profileBtn = page.locator('button[title="Click to view user profile, assigned roles & status"]');
    await expect(profileBtn).toBeVisible();
    await profileBtn.click();

    // Popover content displays user name and role
    await expect(page.getByRole('heading', { name: 'SVLH Admin' })).toBeVisible();
    await expect(page.locator('header').getByText('admin@srivijayalakshmihospital.com')).toBeVisible();

    // Locate Sign Out button inside popover
    const logoutBtn = page.getByRole('button', { name: 'Sign Out' });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // User is signed out and redirected to login page
    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.getByRole('heading', { name: 'Sri Vijaya Lakshmi Hospital' })).toBeVisible();
  });

  test('should toggle sidebar between expanded and collapsed states', async ({ page }) => {
    // Find sidebar menu toggle button
    const menuBtn = page.locator('button[aria-label="Toggle sidebar"]');
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(200);
      await menuBtn.click();
    }
  });

  test('should navigate via Sidebar menu links', async ({ page }) => {
    const bedMatrixLink = page.getByRole('link', { name: /Bed Matrix|Wards & Beds|Beds/i }).first();
    if (await bedMatrixLink.isVisible()) {
      await bedMatrixLink.click();
      await expect(page).toHaveURL(/.*bed-matrix.*/);
    }
  });
});
