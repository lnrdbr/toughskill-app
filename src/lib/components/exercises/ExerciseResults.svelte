<script lang="ts">
	import GuilfordCard from './GuilfordCard.svelte';
	import ScamperCard from './ScamperCard.svelte';
	import StoryBuilderCard from './StoryBuilderCard.svelte';
	import ConstraintCard from './ConstraintCard.svelte';
	import AnalogyCard from './AnalogyCard.svelte';
	import type {
		ScamperEvaluation,
		StoryBuilderEvaluation,
		ConstraintEvaluation,
		AnalogyEvaluation
	} from './types.ts';
	import { pendingEvaluations } from './types.ts';

	let {
		sourceExerciseId = '',
		oncomplete = undefined as ((data: Record<string, unknown>) => void) | undefined
	} = $props();

	const entry = pendingEvaluations[sourceExerciseId];

	function isScamperEvaluation(evaluation: unknown): evaluation is ScamperEvaluation {
		return typeof evaluation === 'object' && evaluation !== null && 'lensAgility' in evaluation;
	}

	function isStoryBuilderEvaluation(evaluation: unknown): evaluation is StoryBuilderEvaluation {
		return typeof evaluation === 'object' && evaluation !== null && 'coherence' in evaluation;
	}

	function isConstraintEvaluation(evaluation: unknown): evaluation is ConstraintEvaluation {
		return typeof evaluation === 'object' && evaluation !== null && 'adaptability' in evaluation;
	}

	function isAnalogyEvaluation(evaluation: unknown): evaluation is AnalogyEvaluation {
		return (
			typeof evaluation === 'object' &&
			evaluation !== null &&
			'surprise' in evaluation &&
			'domainHighlights' in evaluation
		);
	}

	// Signal completion from $effect (not template) to avoid state_unsafe_mutation
	$effect(() => {
		if (!entry) {
			oncomplete?.({});
			return;
		}
		entry.promise.then(() => oncomplete?.({})).catch(() => oncomplete?.({}));
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
			{#if isAnalogyEvaluation(data.evaluation)}
				<AnalogyCard evaluation={data.evaluation} />
			{:else if isConstraintEvaluation(data.evaluation)}
				<ConstraintCard evaluation={data.evaluation} />
			{:else if isStoryBuilderEvaluation(data.evaluation)}
				<StoryBuilderCard evaluation={data.evaluation} />
			{:else if isScamperEvaluation(data.evaluation)}
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
