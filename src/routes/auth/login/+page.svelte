<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Icon from '@iconify/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let mode: 'signin' | 'signup' = $state('signin');
</script>

<div class="page">
	<div class="card">
		<h1 class="title">{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
		<p class="subtitle">
			{mode === 'signin'
				? 'Sign in to keep growing your skills.'
				: 'Start your journey with a free account.'}
		</p>

		<div class="tabs" role="tablist">
			<button
				type="button"
				role="tab"
				aria-selected={mode === 'signin'}
				class="tab"
				class:active={mode === 'signin'}
				onclick={() => (mode = 'signin')}>Sign in</button
			>
			<button
				type="button"
				role="tab"
				aria-selected={mode === 'signup'}
				class="tab"
				class:active={mode === 'signup'}
				onclick={() => (mode = 'signup')}>Register</button
			>
		</div>

		<form
			method="post"
			action={mode === 'signin' ? '?/signInEmail' : '?/signUpEmail'}
			use:enhance
			class="form"
		>
			{#if mode === 'signup'}
				<label class="field">
					<span class="label">Name</span>
					<input class="input" name="name" type="text" autocomplete="name" required />
				</label>
			{/if}

			<label class="field">
				<span class="label">Email</span>
				<input
					class="input"
					name="email"
					type="email"
					autocomplete="email"
					required
				/>
			</label>

			<label class="field">
				<span class="label">Password</span>
				<input
					class="input"
					name="password"
					type="password"
					autocomplete={mode === 'signin' ? 'current-password' : 'new-password'}
					required
					minlength={8}
				/>
			</label>

			{#if form?.message}
				<p class="error" role="alert">{form.message}</p>
			{/if}

			<Button type="submit" variant="primary" rounded="default">
				{mode === 'signin' ? 'Sign in' : 'Create account'}
			</Button>
		</form>

		<div class="divider"><span>or</span></div>

		<form method="post" action="?/signInSocial" use:enhance class="social">
			<input type="hidden" name="provider" value="github" />
			<input type="hidden" name="callbackURL" value="/auth" />
			<Button type="submit" rounded="default">
				<span class="github">
					<Icon icon="mdi:github" width="20" height="20" />
					Continue with GitHub
				</span>
			</Button>
		</form>
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
		filter: drop-shadow(var(--main-drop-shadow) var(--color-foreground));
	}

	.title {
		font-size: 2.25rem;
		line-height: 1.1;
		font-weight: bold;
		margin: 0;
		color: var(--color-foreground);
	}

	.subtitle {
		margin-top: 0.5rem;
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
	}

	.tabs {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin-top: 1.5rem;
		padding: 0.25rem;
		background: var(--color-secondary-100);
		border-radius: 0.75rem;
	}

	.tab {
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		border-radius: 0.5rem;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-secondary-600);
		cursor: pointer;
		transition: all 0.2s;
	}

	.tab:hover {
		color: var(--color-foreground);
	}

	.tab.active {
		background: var(--color-background);
		color: var(--color-foreground);
		filter: drop-shadow(1px 1px 0px var(--color-foreground));
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-secondary-700);
		letter-spacing: 0.02em;
	}

	.input {
		padding: 0.65rem 0.85rem;
		border: 2px solid var(--color-foreground);
		border-radius: 0.5rem;
		background: var(--color-background);
		color: var(--color-foreground);
		font-size: 0.95rem;
		transition: all 0.2s;
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 2px 2px 0px var(--color-primary-500);
	}

	.error {
		margin: 0;
		padding: 0.5rem 0.75rem;
		background: #fef2f2;
		border: 1px solid var(--color-error);
		border-radius: 0.5rem;
		color: var(--color-error);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.divider {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin: 1.5rem 0;
		color: var(--color-muted-foreground);
		font-size: 0.8rem;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}

	.social :global(.button) {
		width: 100%;
	}

	.github {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.form :global(.button) {
		width: 100%;
		margin-top: 0.25rem;
	}
</style>
