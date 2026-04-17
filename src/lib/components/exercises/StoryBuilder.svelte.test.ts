import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import StoryBuilder from './StoryBuilder.svelte';

describe('StoryBuilder', () => {
	const defaultProps = {
		prompt: 'A city where everyone can hear thoughts.',
		instruction: 'Continue the story.',
		minWords: 5,
		maxWords: 50
	};

	it('renders the scenario seed', async () => {
		render(StoryBuilder, defaultProps);

		await expect
			.element(page.getByText('A city where everyone can hear thoughts.'))
			.toBeVisible();
	});

	it('renders the instruction', async () => {
		render(StoryBuilder, defaultProps);

		await expect.element(page.getByText('Continue the story.')).toBeVisible();
	});

	it('disables submit when under minimum word count', async () => {
		render(StoryBuilder, defaultProps);

		const button = page.getByRole('button', { name: "I'm Done" });
		await expect.element(button).toBeDisabled();
	});

	it('enables submit when word count is within range', async () => {
		render(StoryBuilder, defaultProps);

		const textarea = page.getByPlaceholder('Start writing...');
		await textarea.fill('one two three four five six');

		const button = page.getByRole('button', { name: "I'm Done" });
		await expect.element(button).toBeEnabled();
	});

	it('shows word count indicator', async () => {
		render(StoryBuilder, defaultProps);

		await expect.element(page.getByText(/0 \/ 5–50 words/)).toBeVisible();
	});

	it('transitions to reflecting phase on finish', async () => {
		render(StoryBuilder, defaultProps);

		const textarea = page.getByPlaceholder('Start writing...');
		await textarea.fill('one two three four five six');

		const doneButton = page.getByRole('button', { name: "I'm Done" });
		await doneButton.click();

		await expect.element(page.getByText('words written')).toBeVisible();
	});
});
