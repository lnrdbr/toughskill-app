import { describe, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { expectNoA11yViolations } from '$lib/test-utils/axe';

const baseCards = [
	{
		id: 'creativity',
		title: 'Creativity',
		description: 'Pay attention differently.',
		icon: 'mdi:lightbulb',
		totalModules: 30,
		completedModules: 0,
		available: true
	},
	{
		id: 'communication',
		title: 'Communication',
		description: 'Say the true thing.',
		icon: 'mdi:message',
		totalModules: 0,
		completedModules: 0,
		available: false
	}
];

/**
 * Route-level a11y: exercises the composed page tree across the meaningful
 * CTA states (enroll, continue, coming soon) so branch-specific colour and
 * role combinations are all scanned.
 */
describe('/courses — courses page a11y', () => {
	it('renders clean with an enrollable active course', async () => {
		render(Page, { data: { user: null, cards: baseCards } });
		await expectNoA11yViolations();
	});

	it('renders clean with an in-progress active course', async () => {
		const cards = [{ ...baseCards[0], completedModules: 15 }, baseCards[1]];
		render(Page, { data: { user: null, cards } });
		await expectNoA11yViolations();
	});
});
