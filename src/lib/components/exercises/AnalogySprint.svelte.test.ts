import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import AnalogySprint from './AnalogySprint.svelte';

describe('AnalogySprint', () => {
	const defaultProps = {
		concept: 'Software testing',
		domains: ['cooking', 'nature', 'sports'],
		instruction: 'Complete the analogies.',
		timerDuration: 0
	};

	it('renders the concept', async () => {
		render(AnalogySprint, defaultProps);

		await expect.element(page.getByText('Create analogies for:')).toBeVisible();
		await expect.element(page.getByText('Software testing').first()).toBeVisible();
	});

	it('renders all domain cards', async () => {
		render(AnalogySprint, defaultProps);

		await expect.element(page.getByText('cooking')).toBeVisible();
		await expect.element(page.getByText('nature')).toBeVisible();
		await expect.element(page.getByText('sports')).toBeVisible();
	});

	it('shows domain count', async () => {
		render(AnalogySprint, defaultProps);

		await expect.element(page.getByText('0 / 3 domains')).toBeVisible();
	});

	it('disables submit when no analogies filled', async () => {
		render(AnalogySprint, defaultProps);

		const button = page.getByRole('button', { name: "I'm Done" });
		await expect.element(button).toBeDisabled();
	});

	it('renders analogy prefix text for each domain', async () => {
		render(AnalogySprint, defaultProps);

		const prefixes = page.getByText('Software testing is like');
		await expect.element(prefixes.first()).toBeVisible();
	});
});
