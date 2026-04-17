import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

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

describe('Courses page CTA', () => {
	it('shows "Enroll" for an available course with no progress', () => {
		const { container } = render(Page, { data: { user: null, cards: baseCards } });
		const cta = container.querySelector('.cta button') as HTMLButtonElement;
		expect(cta.textContent?.trim()).toBe('Enroll');
		expect(cta.disabled).toBe(false);
	});

	it('shows "Continue" when the active course has progress', () => {
		const cards = [{ ...baseCards[0], completedModules: 5 }, baseCards[1]];
		const { container } = render(Page, { data: { user: null, cards } });
		const cta = container.querySelector('.cta button') as HTMLButtonElement;
		expect(cta.textContent?.trim()).toBe('Continue');
	});

	it('shows disabled "Coming soon" CTA for unavailable focused course', async () => {
		const { container } = render(Page, { data: { user: null, cards: baseCards } });

		// Click the second dot to focus the unavailable course.
		const dots = container.querySelectorAll('.dots .dot');
		(dots[1] as HTMLButtonElement).click();

		await expect
			.poll(() => (container.querySelector('.cta button') as HTMLButtonElement).textContent?.trim())
			.toBe('Coming soon');
		const cta = container.querySelector('.cta button') as HTMLButtonElement;
		expect(cta.disabled).toBe(true);
	});
});

describe('Courses page progress display', () => {
	it('renders the progress bar and label for available courses', () => {
		const cards = [{ ...baseCards[0], completedModules: 15, totalModules: 30 }];
		const { container } = render(Page, { data: { user: null, cards } });
		const label = container.querySelector('.progress-label') as HTMLElement;
		expect(label.textContent?.trim()).toBe('15 / 30 modules');
		const fill = container.querySelector('.progress-fill') as HTMLElement;
		expect(fill.style.width).toBe('50%');
	});

	it('shows a coming-soon badge on unavailable cards', () => {
		const { container } = render(Page, { data: { user: null, cards: baseCards } });
		const badge = container.querySelectorAll('.coming-soon-badge');
		expect(badge.length).toBe(1);
		expect(badge[0].textContent?.trim()).toBe('Coming soon');
	});
});
