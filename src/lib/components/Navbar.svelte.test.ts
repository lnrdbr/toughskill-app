import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import Navbar from './Navbar.svelte';

describe('Navbar', () => {
	it('renders brand link to home', async () => {
		render(Navbar, { user: null });

		const brand = page.getByRole('link', { name: /toughskill home/i });
		await expect.element(brand).toBeVisible();
		expect(brand.element().getAttribute('href')).toBe('/');
	});

	it('shows Home and Log in when logged out', async () => {
		render(Navbar, { user: null });

		await expect.element(page.getByRole('link', { name: 'Home', exact: true })).toBeVisible();
		const login = page.getByRole('link', { name: /log in/i });
		await expect.element(login).toBeVisible();
		expect(login.element().getAttribute('href')).toBe('/auth/login');
	});

	it('does not show Learn when logged out', async () => {
		const { container } = render(Navbar, { user: null });

		expect(container.querySelector('a[href="/learn"]')).toBeNull();
	});

	it('shows Learn when logged in', async () => {
		render(Navbar, {
			user: { id: 'u-1', name: 'Ada', email: 'ada@example.com' }
		});

		const learn = page.getByRole('link', { name: /learn/i });
		await expect.element(learn).toBeVisible();
		expect(learn.element().getAttribute('href')).toBe('/learn');
	});

	it('does not link to the removed /me dashboard', async () => {
		const { container } = render(Navbar, {
			user: { id: 'u-1', name: 'Ada', email: 'ada@example.com' }
		});

		expect(container.querySelector('a[href="/me"]')).toBeNull();
	});

	it('shows sign-up CTA for anonymous users and no profile avatar', async () => {
		const { container } = render(Navbar, {
			user: { id: 'anon-1', isAnonymous: true }
		});

		const cta = container.querySelector('[data-testid="signup-cta"]');
		expect(cta).not.toBeNull();
		expect(cta!.getAttribute('href')).toBe('/auth/login');
		expect(container.querySelector('[data-testid="profile-link"]')).toBeNull();
	});

	it('shows profile avatar link for authenticated users and no sign-up CTA', async () => {
		const { container } = render(Navbar, {
			user: { id: 'u-1', name: 'Ada', email: 'ada@example.com' }
		});

		const profile = container.querySelector('[data-testid="profile-link"]');
		expect(profile).not.toBeNull();
		expect(profile!.getAttribute('href')).toBe('/auth');
		expect(container.querySelector('[data-testid="signup-cta"]')).toBeNull();
	});

	it('derives avatar initial from name', async () => {
		const { container } = render(Navbar, {
			user: { id: 'u-1', name: 'ada lovelace', email: 'ada@example.com' }
		});

		const avatar = container.querySelector('.avatar');
		expect(avatar).not.toBeNull();
		expect(avatar!.textContent).toBe('A');
	});

	it('falls back to email initial when no name', async () => {
		const { container } = render(Navbar, {
			user: { id: 'u-2', email: 'bob@example.com' }
		});

		const avatar = container.querySelector('.avatar');
		expect(avatar).not.toBeNull();
		expect(avatar!.textContent).toBe('B');
	});

	it('does not render the old streak indicator', async () => {
		const { container } = render(Navbar, { user: null });

		expect(container.textContent).not.toContain('🔥');
	});
});
