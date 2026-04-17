<script lang="ts">
	import type { Component } from 'svelte';
	import type { ComponentModule, Module, ModuleCompletionResult } from '$lib/types/course';
	import { isComponentModule } from '$lib/types/course';
	import { getModuleComponent } from '$lib/config/module-registry';
	import ReflectionPrompt from './modules/ReflectionPrompt.svelte';

	let {
		module,
		courseId = '',
		lessonSlug = '',
		oncomplete = undefined as ((result: ModuleCompletionResult) => void) | undefined
	} = $props<{
		module: Module;
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (result: ModuleCompletionResult) => void;
	}>();

	let resolved: Component | null = $state(null);
	let error: string | null = $state(null);
	let loading = $state(true);

	function handleComplete(data: Record<string, unknown>) {
		oncomplete?.({
			moduleId: module.id,
			completedAt: new Date().toISOString(),
			data
		});
	}

	// When `resolved` is set we know the guard passed — expose the config for the template.
	let componentConfig = $derived(
		isComponentModule(module) ? module.config : ({} as Record<string, unknown>)
	);

	$effect(() => {
		let cancelled = false;

		async function load(mod: Module) {
			resolved = null;
			error = null;
			loading = true;

			// Journey modules are rendered directly by this component — no async load needed.
			if (!isComponentModule(mod)) {
				if (!cancelled) {
					error = null;
					loading = false;
				}
				return;
			}

			const componentMod: ComponentModule = mod;
			const loader = getModuleComponent(componentMod.componentId);
			if (!loader) {
				if (!cancelled) {
					console.error(`[ModuleRunner] Unknown module: "${componentMod.componentId}"`);
					error = "This exercise couldn't be loaded. Please try again later.";
					loading = false;
				}
				return;
			}

			try {
				const imported = await loader();
				if (!cancelled) resolved = imported.default;
			} catch (err) {
				console.error(
					`[ModuleRunner] Failed to load module "${componentMod.componentId}":`,
					err
				);
				if (!cancelled) error = "This exercise couldn't be loaded. Please try again later.";
			}
			if (!cancelled) loading = false;
		}

		load(module);
		return () => {
			cancelled = true;
			resolved = null;
			error = null;
		};
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
{:else if module.type === 'reflection'}
	<ReflectionPrompt
		moduleId={module.id}
		prompt={module.prompt}
		minLength={module.minLength}
		{courseId}
		{lessonSlug}
		oncomplete={handleComplete}
	/>
{:else if resolved}
	{@const Mod = resolved}
	<Mod {...componentConfig} moduleId={module.id} oncomplete={handleComplete} />
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
