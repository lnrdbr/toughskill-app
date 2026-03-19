<script lang="ts">
	import type { Component } from 'svelte';
	import type { Module, ModuleCompletionResult } from '$lib/types/course';
	import { getModuleComponent } from '$lib/config/module-registry';

	let { module, oncomplete = undefined as ((result: ModuleCompletionResult) => void) | undefined } =
		$props<{ module: Module; oncomplete?: (result: ModuleCompletionResult) => void }>();

	let resolved: Component | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(true);

	async function loadComponent(mod: Module) {
		resolved = null;
		error = null;
		loading = true;

		const loader = getModuleComponent(mod.componentId);
		if (!loader) {
			error = `Unknown module: "${mod.componentId}"`;
			loading = false;
			return;
		}

		try {
			const imported = await loader();
			resolved = imported.default;
		} catch (err) {
			console.error('Failed to load module component', mod.componentId, err);
			error = `Failed to load module: "${mod.componentId}"`;
		}
		loading = false;
	}

	function handleComplete(data: Record<string, unknown>) {
		oncomplete?.({
			moduleId: module.id,
			completedAt: new Date().toISOString(),
			data
		});
	}
		let cancelled = false;

		async function load(mod: Module) {
			resolved = null;
			error = null;
			loading = true;

			const loader = getModuleComponent(mod.componentId);
			if (!loader) {
				if (!cancelled) {
					error = `Unknown module: "${mod.componentId}"`;
					loading = false;
				}
				return;
			}

			try {
				const imported = await loader();
				if (!cancelled) resolved = imported.default;
			} catch {
				if (!cancelled) error = `Failed to load module: "${mod.componentId}"`;
			}
			if (!cancelled) loading = false;
		}

		load(module);
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		loadComponent(module);
	});
</script>

{#if loading}
	<div class="runner-loading">
		<div class="spinner"></div>
		<p class="loading-text">Loading module...</p>
	</div>
{:else if error}
	<div class="runner-error">
		<p class="error-text">{error}</p>
	</div>
{:else if resolved}
	{@const Mod = resolved}
	<Mod {...module.config} oncomplete={handleComplete} />
{/if}

<style>
	.runner-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 48px 0;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary-500);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		color: var(--color-muted-foreground);
		font-size: 0.9rem;
	}

	.runner-error {
		display: flex;
		justify-content: center;
		padding: 48px 0;
	}

	.error-text {
		color: var(--color-error);
		font-size: 0.9rem;
		font-weight: 600;
	}
</style>
