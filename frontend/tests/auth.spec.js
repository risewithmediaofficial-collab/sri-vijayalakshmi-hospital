import { test, expect } from '@playwright/test';

test.describe('Authentication & Access Suite — Sri Vijaya Lakshmi Hospital', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should render Sri Vijaya Lakshmi Hospital login workstation branding', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sri Vijaya Lakshmi Hospital' })).toBeVisible();
    await expect(page.getByText('Hospital Information & Management System')).toBeVisible();
    await expect(page.getByRole('button', { name: /Staff \/ Admin/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Patient/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Guardian/i })).toBeVisible();
  });

  test('should switch between Staff, Patient, and Guardian tabs seamlessly', async ({ page }) => {
    // 1. Staff Tab active by default
    await expect(page.getByText('Sign in to your Workstation')).toBeVisible();
    await expect(page.getByLabel('Account Email / Staff ID')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In to Workstation' })).toBeVisible();

    // 2. Click Patient tab
    await page.getByRole('button', { name: /Patient/i }).click();
    await expect(page.getByText('Patient Portal Access')).toBeVisible();
    await expect(page.getByLabel('Mobile Number')).toBeVisible();
    await expect(page.getByLabel('Date of Birth')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Access Patient Portal' })).toBeVisible();

    // 3. Click Guardian tab
    await page.getByRole('button', { name: /Guardian/i }).click();
    await expect(page.getByText('Guardian Portal Access')).toBeVisible();
    await expect(page.getByLabel('Guardian Mobile Number')).toBeVisible();
    await expect(page.getByLabel('Patient Mobile Number')).toBeVisible();
    await expect(page.getByLabel('Patient UHID / Number')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Access Guardian Portal' })).toBeVisible();

    // 4. Return to Staff tab
    await page.getByRole('button', { name: /Staff \/ Admin/i }).click();
    await expect(page.getByText('Sign in to your Workstation')).toBeVisible();
  });

  test('should support press-and-hold password reveal on Staff login', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('SecretHospitalPass123!');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Locate the press-and-hold reveal button
    const eyeBtn = page.getByRole('button', { name: /Hold to show password/i });
    await expect(eyeBtn).toBeVisible();

    // Hold down pointer
    await eyeBtn.dispatchEvent('pointerdown');
    await expect(page.locator('input[placeholder="••••••••"]')).toHaveAttribute('type', 'text');

    // Release pointer
    await eyeBtn.dispatchEvent('pointerup');
    await expect(page.locator('input[placeholder="••••••••"]')).toHaveAttribute('type', 'password');
  });

  test('should navigate to Forgot Password page and render reset request form', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /Forgot password\?/i });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    await expect(page).toHaveURL(/.*forgot-password.*/);
    await expect(page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
    await expect(page.getByPlaceholder('email@gmail.com')).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Password Reset Link/i })).toBeVisible();

    // Back to Login link
    const backBtn = page.getByRole('button', { name: /Back to Login/i });
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await expect(page).toHaveURL(/.*login.*/);
    }
  });

  test('should display validation and error message on invalid credentials', async ({ page }) => {
    // Intercept login with invalid response
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: { message: 'Incorrect password entered for this Staff ID / Account.' }
        })
      });
    });

    await page.getByLabel('Account Email / Staff ID').fill('drnraju@gmail.com');
    await page.locator('input[type="password"]').fill('WrongPassword123');
    await page.getByRole('button', { name: 'Sign In to Workstation' }).click();

    // Expect error alert banner
    await expect(page.getByText('Incorrect password entered for this Staff ID / Account.')).toBeVisible();
  });
});
