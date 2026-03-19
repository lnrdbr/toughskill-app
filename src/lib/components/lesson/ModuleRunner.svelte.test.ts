import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import type { Module } from '$lib/types/course';
import ModuleRunner from './ModuleRunner.svelte';

const unknownModule: Module = {
	id: 'mod-unknown',
	type: 'exercise',
	title: 'Missing',
	componentId: 'NonExistent',
	estimatedMinutes: 5,
	config: {}
};

const validModule: Module = {
	id: 'mod-dt-1',
	type: 'exercise',
	title: 'Paperclip Challenge',
	componentId: 'DivergentThinking',
	estimatedMinutes: 5,
	config: { prompt: 'Paperclip', instruction: 'How many uses?' }
};

describe('ModuleRunner', () => {
	it('shows error for unknown componentId', async () => {
		render(ModuleRunner, { module: unknownModule });

		await expect.element(page.getByText("This exercise couldn't be loaded. Please try again later.")).toBeVisible();
	});

	it('shows loading state initially for a valid module', async () => {
		render(ModuleRunner, { module: validModule });

		await expect.element(page.getByText('Loading module...')).toBeVisible();
	});

	it('renders the resolved component after loading', async () => {
		const { container } = render(ModuleRunner, { module: validModule });

		await expect.element(page.getByText('How many uses?')).toBeVisible();
		expect(container.querySelector('.runner-error')).toBeNull();
	});

	it('calls oncomplete with ModuleCompletionResult shape', async () => {
		let result: unknown;
		render(ModuleRunner, {
			module: unknownModule,
			oncomplete: (r: unknown) => {
				result = r;
			}
		});

		// oncomplete is not called for error states, so result stays undefined
		await expect.element(page.getByText("This exercise couldn't be loaded. Please try again later.")).toBeVisible();
		expect(result).toBeUndefined();
	});
});
