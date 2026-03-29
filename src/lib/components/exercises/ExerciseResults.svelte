<script lang="ts">
	import BubbleCloud from './BubbleCloud.svelte';
	import GuilfordCard from './GuilfordCard.svelte';
	import type { BubbleData, SubmissionResponse } from './types.ts';
	import { pendingEvaluations } from './types.ts';

	const COLORS = [
		'var(--color-primary-100)',
		'var(--color-primary-200)',
		'var(--color-primary-300)',
		'var(--color-primary-50)'
	];

	const COMMUNITY_COLORS = [
		'var(--color-secondary-200)',
		'var(--color-secondary-300)',
		'var(--color-secondary-100)'
	];

	let {
		sourceExerciseId = '',
		oncomplete = undefined as ((data: Record<string, unknown>) => void) | undefined
	} = $props();

	const entry = pendingEvaluations[sourceExerciseId];

	function buildBubbles(userIdeas: string[], communityIdeas: string[] = []): BubbleData[] {
		const items: BubbleData[] = [];
		for (let i = 0; i < userIdeas.length; i++) {
			items.push({ id: `user-${i}`, text: userIdeas[i], color: COLORS[i % COLORS.length] });
		}
		for (let i = 0; i < communityIdeas.length; i++) {
			items.push({
				id: `community-${i}`,
				text: communityIdeas[i],
				color: COMMUNITY_COLORS[i % COMMUNITY_COLORS.length]
			});
		}
		return items;
	}

	let completeCalled = false;
	function signalComplete() {
		if (completeCalled) return '';
		completeCalled = true;
		oncomplete?.({});
		return '';
	}
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
			{@const bubbles = buildBubbles(entry.userIdeas, data.communityIdeas)}
			{signalComplete()}

			<BubbleCloud prompt={entry.prompt} {bubbles} settled={true} />
			<GuilfordCard evaluation={data.evaluation} />

			<div class="legend">
				<span class="legend-item">
					<span class="dot dot-user"></span> Your ideas
				</span>
				<span class="legend-item">
					<span class="dot dot-community"></span> Community ideas
				</span>
			</div>
		{:catch}
			{signalComplete()}
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

	.legend {
		display: flex;
		gap: 16px;
		justify-content: center;
		font-size: 0.8rem;
		color: var(--color-muted-foreground);
		margin-top: 16px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.dot-user {
		background: var(--color-primary-200);
	}

	.dot-community {
		background: var(--color-secondary-200);
	}

	.error {
		text-align: center;
		color: var(--color-error);
		font-size: 0.875rem;
		padding: 32px 0;
	}
</style>
