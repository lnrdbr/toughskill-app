<script lang="ts">
	import Button from './Button.svelte';
	import Icon from '@iconify/svelte';
	import { resolve } from '$app/paths';
	import logo from '$lib/assets/LogoCloudy.png';

	type NavUser = {
		id: string;
		name?: string | null;
		email?: string | null;
		isAnonymous?: boolean;
	} | null;

	let { user }: { user: NavUser } = $props();

	let isLoggedIn = $derived(!!user);
	let isAnonymous = $derived(!!user?.isAnonymous);
	let initial = $derived(
		((user?.name ?? user?.email ?? '?').trim().charAt(0) || '?').toUpperCase()
	);
</script>

<nav class="navbar" aria-label="Primary">
	<a href={resolve('/')} class="brand" aria-label="TOUGHSKILL home">
		<img src={logo} alt="" class="brand-logo" />
		<span class="brand-text">TOUGHSKILL</span>
	</a>

	<div class="nav-links">
		{#if !isLoggedIn}
			<a href={resolve('/')} class="nav-link">
				<Button rounded="default" silent>
					<span class="row">
						<Icon icon="mdi:home-outline" width="18" height="18" />
						Home
					</span>
				</Button>
			</a>
			<a href={resolve('/auth/login')} class="nav-link">
				<Button variant="primary" rounded="default" silent>
					<span class="row">
						<Icon icon="mdi:login" width="18" height="18" />
						Log in
					</span>
				</Button>
			</a>
		{:else}
			<a href={resolve('/learn')} class="nav-link">
				<Button rounded="default" silent>
					<span class="row">
						<Icon icon="mdi:book-open-variant" width="18" height="18" />
						Learn
					</span>
				</Button>
			</a>

			{#if isAnonymous}
				<a href={resolve('/auth/login')} class="nav-link" data-testid="signup-cta">
					<Button variant="primary" rounded="default" silent>
						<span class="row">
							<Icon icon="mdi:content-save-outline" width="18" height="18" />
							Sign up to save progress
						</span>
					</Button>
				</a>
			{:else}
				<a
					href={resolve('/auth')}
					class="avatar-link"
					aria-label="Profile"
					data-testid="profile-link"
				>
					<span class="avatar">{initial}</span>
				</a>
			{/if}
		{/if}
	</div>
</nav>

<style>
	.navbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		width: 100%;
		padding: 0.75rem 1.25rem;
		background: var(--color-background);
		border-bottom: 2px solid var(--color-foreground);
		filter: drop-shadow(0 2px 0 var(--color-foreground));
		/* Paint above subsequent siblings (e.g. scrollable .content and the sticky
		   headings inside it) so the navbar border + drop-shadow render on top. */
		position: relative;
		z-index: 20;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		color: var(--color-foreground);
		font-family: var(--font-display), serif;
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		line-height: 1;
	}

	.brand-logo {
		width: 2.25rem;
		height: 2.25rem;
		object-fit: contain;
	}

	.brand:hover {
		color: var(--color-primary-600);
	}

	.brand-text {
		display: inline-block;
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.nav-link {
		text-decoration: none;
		display: inline-flex;
	}

	.row {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.avatar-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		text-decoration: none;
	}

	.avatar {
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 50%;
		background: var(--color-primary-500);
		color: white;
		font-size: 1rem;
		font-weight: bold;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-foreground);
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
		transition: transform 0.2s;
	}

	.avatar-link:hover .avatar {
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0px var(--color-foreground));
	}

	.avatar-link:active .avatar {
		transform: translate(2px, 2px);
		filter: drop-shadow(0 0 0 var(--color-foreground));
	}
</style>
