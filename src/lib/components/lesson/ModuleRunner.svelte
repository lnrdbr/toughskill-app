<script lang="ts">
	import type { Component } from 'svelte';
	import type { ComponentModule, Module, ModuleCompletionResult } from '$lib/types/course';
	import { isComponentModule } from '$lib/types/course';
	import { getModuleComponent } from '$lib/config/module-registry';
	import { readDraft, writeDraft, clearDraft } from '$lib/client/draft';
	import ReflectionPrompt from './modules/ReflectionPrompt.svelte';
	import MeditationTimer from './modules/MeditationTimer.svelte';
	import PhoneFreeChallenge from './modules/PhoneFreeChallenge.svelte';
	import RealLifeTask from './modules/RealLifeTask.svelte';
	import PhotoCapture from './modules/PhotoCapture.svelte';
	import ChoiceBranch from './modules/ChoiceBranch.svelte';
	import RecallPrompt from './modules/RecallPrompt.svelte';
	import IntroBeat from './modules/IntroBeat.svelte';

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

	// Default practice-time tracking lives here so every module gets a
	// consistent wall-clock measurement without re-implementing it. Persisted
	// to sessionStorage so a refresh mid-module doesn't reset the timer.
	// Modules with *semantic* time (meditation, phone-free, real-life-task)
	// override by providing their own `timeSpentSeconds` in the complete
	// payload — we only fill in when it's absent.
	const runnerDraftKey = `ts:runner:${courseId}:${lessonSlug}:${module.id}`;
	const startedAt: number = readDraft<number>(runnerDraftKey, Date.now());
	writeDraft<number>(runnerDraftKey, startedAt);

	function handleComplete(data: Record<string, unknown>) {
		const existing = data?.timeSpentSeconds;
		const enriched =
			typeof existing === 'number' && existing >= 0
				? data
				: { ...data, timeSpentSeconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)) };
		clearDraft(runnerDraftKey);
		oncomplete?.({
			moduleId: module.id,
			completedAt: new Date().toISOString(),
			data: enriched
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
				console.error(`[ModuleRunner] Failed to load module "${componentMod.componentId}":`, err);
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
{:else if module.type === 'meditation'}
	<MeditationTimer
		moduleId={module.id}
		durationSeconds={module.durationSeconds}
		style={module.style}
		{courseId}
		{lessonSlug}
		oncomplete={handleComplete}
	/>
{:else if module.type === 'phone_free'}
	<PhoneFreeChallenge
		moduleId={module.id}
		durationSeconds={module.durationSeconds}
		{courseId}
		{lessonSlug}
		oncomplete={handleComplete}
	/>
{:else if module.type === 'real_life_task'}
	<RealLifeTask
		moduleId={module.id}
		instruction={module.instruction}
		feedbackPrompt={module.feedbackPrompt}
		returnAfterMinutes={module.returnAfterMinutes}
		{courseId}
		{lessonSlug}
		oncomplete={handleComplete}
	/>
{:else if module.type === 'photo'}
	<PhotoCapture
		moduleId={module.id}
		prompt={module.prompt}
		captionPrompt={module.captionPrompt}
		{courseId}
		{lessonSlug}
		oncomplete={handleComplete}
	/>
{:else if module.type === 'choice'}
	<ChoiceBranch
		moduleId={module.id}
		prompt={module.prompt}
		options={module.options}
		allowMultiple={module.allowMultiple}
		{courseId}
		{lessonSlug}
		oncomplete={handleComplete}
	/>
{:else if module.type === 'recall'}
	<RecallPrompt
		moduleId={module.id}
		prompt={module.prompt}
		mode={module.mode}
		expected={module.expected}
		options={module.options}
		{courseId}
		{lessonSlug}
		oncomplete={handleComplete}
	/>
{:else if module.type === 'intro'}
	<IntroBeat
		moduleId={module.id}
		body={module.body}
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
