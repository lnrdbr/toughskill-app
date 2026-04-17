<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Icon from '@iconify/svelte';
	import type { PageServerData } from './$types';

	let { data }: { data: PageServerData } = $props();

	const initial = (data.user.name ?? data.user.email ?? '?').trim().charAt(0).toUpperCase();
</script>

<div class="page">
	<div class="card">
		<div class="avatar" aria-hidden="true">{initial}</div>
		<h1 class="title">Hi, {data.user.name || 'there'}!</h1>
		<p class="email">{data.user.email}</p>

		<div class="meta">
			<div class="meta-row">
				<span class="meta-label">User ID</span>
				<code class="meta-value">{data.user.id}</code>
			</div>
		</div>

		<div class="actions">
			<a href="/learn" class="link">
				<Button rounded="default">
					<span class="row">
						<Icon icon="mdi:book-open-variant" width="18" height="18" />
						Continue learning
					</span>
				</Button>
			</a>

			<form method="post" action="?/signOut" use:enhance class="signout">
				<Button type="submit" variant="primary" rounded="default">
					<span class="row">
						<Icon icon="mdi:logout" width="18" height="18" />
						Sign out
					</span>
				</Button>
			</form>
		</div>
	</div>
</div>

<style>
	.page {
		min-height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 3rem 1rem;
		background: var(--color-secondary-50);
	}

	.card {
		width: 100%;
		max-width: 26rem;
		background: var(--color-background);
		border: 2px solid var(--color-foreground);
		border-radius: 1.25rem;
		padding: 2rem;
		text-align: center;
		filter: drop-shadow(var(--main-drop-shadow) var(--color-foreground));
	}

	.avatar {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		background: var(--color-primary-500);
		color: white;
		font-size: 2rem;
		font-weight: bold;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 1rem;
		border: 2px solid var(--color-foreground);
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
	}

	.title {
		font-size: 2rem;
		line-height: 1.1;
		font-weight: bold;
		margin: 0;
		color: var(--color-foreground);
	}

	.email {
		margin: 0.35rem 0 0;
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
	}

	.meta {
		margin-top: 1.5rem;
		padding: 1rem;
		background: var(--color-secondary-100);
		border-radius: 0.75rem;
	}

	.meta-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		text-align: left;
	}

	.meta-label {
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-secondary-600);
	}

	.meta-value {
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.8rem;
		color: var(--color-secondary-800);
		word-break: break-all;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.link {
		display: block;
		text-decoration: none;
	}

	.signout {
		margin: 0;
	}

	.row {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.link :global(.button),
	.signout :global(.button) {
		width: 100%;
	}
</style>
