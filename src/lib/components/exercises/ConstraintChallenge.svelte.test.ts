import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import ConstraintChallenge from './ConstraintChallenge.svelte';

describe('ConstraintChallenge', () => {
	const defaultProps = {
		prompt: 'Design a way to teach someone a new skill.',
		constraints: ['No screens', 'Only 10 minutes per day', 'Must work for any skill'],
		instruction: 'Write a concrete solution.'
	};

	it('renders the prompt', async () => {
		render(ConstraintChallenge, defaultProps);

		await expect
			.element(page.getByText('Design a way to teach someone a new skill.'))
			.toBeVisible();
	});

	it('shows round 1 of 3', async () => {
		render(ConstraintChallenge, defaultProps);

		await expect.element(page.getByText('Round 1 of 3')).toBeVisible();
	});

	it('shows the first constraint', async () => {
		render(ConstraintChallenge, defaultProps);

		await expect.element(page.getByText('No screens')).toBeVisible();
	});

	it('disables next when response is empty', async () => {
		render(ConstraintChallenge, defaultProps);

		const button = page.getByRole('button', { name: 'Next Round' });
		await expect.element(button).toBeDisabled();
	});

	it('advances to round 2 after entering text', async () => {
		render(ConstraintChallenge, defaultProps);

		const textarea = page.getByPlaceholder('Write your solution...');
		await textarea.fill('A physical card-based system');

		const button = page.getByRole('button', { name: 'Next Round' });
		await button.click();

		await expect.element(page.getByText('Round 2 of 3')).toBeVisible();
		await expect.element(page.getByText('Only 10 minutes per day')).toBeVisible();
	});

	it('shows "I\'m Done" on final round', async () => {
		render(ConstraintChallenge, defaultProps);

		// Round 1
		const textarea1 = page.getByPlaceholder('Write your solution...');
		await textarea1.fill('Solution 1');
		await page.getByRole('button', { name: 'Next Round' }).click();

		// Round 2
		const textarea2 = page.getByPlaceholder('Write your solution...');
		await textarea2.fill('Solution 2');
		await page.getByRole('button', { name: 'Next Round' }).click();

		// Round 3 should show "I'm Done"
		await expect.element(page.getByRole('button', { name: "I'm Done" })).toBeVisible();
	});
});
