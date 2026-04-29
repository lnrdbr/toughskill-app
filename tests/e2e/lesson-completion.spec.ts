import { expect, test } from '@playwright/test';

/**
 * End-to-end: a brand-new user registers, opens the first lesson of the
 * Creativity course, and completes its single intro module. Proves that
 * sign-up, session cookies, the /learn → /lesson transition, and the
 * progress write-path all work together.
 */
test('new user signs up and completes their first lesson', async ({ page }) => {
	const email = `e2e-${Date.now()}@test.local`;
	const password = 'super-secret-pw-123';
	const name = 'E2E Tester';

	// --- Sign up ----------------------------------------------------------
	await page.goto('/auth/login');
	await page.getByRole('tab', { name: 'Register' }).click();
	await page.locator('input[name="name"]').fill(name);
	await page.locator('input[name="email"]').fill(email);
	await page.locator('input[name="password"]').fill(password);
	await page.getByRole('button', { name: 'Create account' }).click();

	// Better Auth redirects the signed-up user to /auth.
	await expect(page).toHaveURL(/\/auth$/);
	await expect(page.getByRole('heading', { name: `Hi, ${name}!` })).toBeVisible();

	// --- Open the first lesson -------------------------------------------
	await page.goto('/learn');
	const firstLesson = page.getByRole('button', { name: /what is creativity/i }).first();
	await expect(firstLesson).toBeVisible();
	// DotPath starts a lesson on double-click; single-click only selects it.
	await firstLesson.dblclick();

	await expect(page).toHaveURL(/\/lesson\?course=creativity&slug=what-is-creativity/);

	// --- Complete the intro module ---------------------------------------
	// IntroBeat auto-submits on mount, so "Finish session" appears without
	// any user action inside the module.
	const finishButton = page.getByRole('button', { name: 'Finish session' });
	await expect(finishButton).toBeVisible();
	await finishButton.click();

	// --- Verify completion ------------------------------------------------
	await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
});
