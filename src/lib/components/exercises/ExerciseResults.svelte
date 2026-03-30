<script lang="ts">
	import GuilfordCard from './GuilfordCard.svelte';
	import ScamperCard from './ScamperCard.svelte';
	// TODO: Restore BubbleCloud by saving bubble positions from the exercise phase
	// and displaying a static snapshot here instead of re-running the D3 simulation.
	// import BubbleCloud from './BubbleCloud.svelte';
	import type { SubmissionResponse, ScamperSubmissionResponse, ScamperEvaluation } from './types.ts';
	import { pendingEvaluations } from './types.ts';

	let {
		sourceExerciseId = '',
		oncomplete = undefined as ((data: Record<string, unknown>) => void) | undefined
	} = $props();

	const entry = pendingEvaluations[sourceExerciseId];

	function isScamperEvaluation(evaluation: unknown): evaluation is ScamperEvaluation {
		return typeof evaluation === 'object' && evaluation !== null && 'lensAgility' in evaluation;
	}

	// Signal completion from $effect (not template) to avoid state_unsafe_mutation
	$effect(() => {
		if (!entry) {
			oncomplete?.({});
			return;
		}
		entry.promise
			.then(() => oncomplete?.({}))
			.catch(() => oncomplete?.({}));
	});
</script>

<div class="exercise-results">
	{#if !entry}
		<p class="error">No evaluation data available.</p>
	{:else}
		{#await entry.promise}
			<div class="loading">
				<div class="spinner"></div>
				<p class="loading-text">Preparing your results...</p>
			</div>
		{:then data}
			{#if isScamperEvaluation(data.evaluation)}
				<ScamperCard evaluation={data.evaluation} />
			{:else}
				<GuilfordCard evaluation={data.evaluation} />
			{/if}
		{:catch}
			<p class="error">Could not evaluate your ideas. Your responses have been saved.</p>
		{/await}
	{/if}
</div>

<style>
	.exercise-results {
		max-width: 1080px;
		width: 100%;
		margin: 0 auto;
		padding: 24px;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 0;
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

	.error {
		text-align: center;
		color: var(--color-error);
		font-size: 0.875rem;
		padding: 32px 0;
	}
</style>
