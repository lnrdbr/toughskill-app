<script lang="ts">
	import type { AnalogyEvaluation } from './types.ts';

	let { evaluation }: { evaluation: AnalogyEvaluation } = $props();

	const highlightEntries = $derived(
		Object.entries(evaluation.domainHighlights).filter(([, text]) => text)
	);
</script>

<div class="card">
	<h3 class="title">Your Analogy Sprint Profile</h3>

	<div class="scores">
		<div class="score-row">
			<div class="label">
				<span class="name">Breadth</span>
				<span class="desc">Variety across domains</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.breadth * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.breadth}/10</span>
		</div>

		<div class="score-row">
			<div class="label">
				<span class="name">Depth</span>
				<span class="desc">Insight of connections</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.depth * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.depth}/10</span>
		</div>

		<div class="score-row">
			<div class="label">
				<span class="name">Surprise</span>
				<span class="desc">Unexpectedness of comparisons</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.surprise * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.surprise}/10</span>
		</div>
	</div>

	{#if highlightEntries.length > 0}
		<div class="highlights">
			{#each highlightEntries as [domain, text] (domain)}
				<div class="highlight-row">
					<span class="highlight-domain">{domain}</span>
					<p class="highlight-text">{text}</p>
				</div>
			{/each}
		</div>
	{/if}

	<p class="feedback">{evaluation.feedback}</p>

	{#if evaluation.suggestions?.length}
		<div class="suggestions">
			<h4 class="suggestions-title">Analogies you might not have considered</h4>
			<ul class="suggestions-list">
				{#each evaluation.suggestions as suggestion}
					<li>{suggestion}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.card {
		border: 2px solid var(--color-foreground);
		border-radius: 12px;
		padding: 20px;
		background: var(--color-background);
		filter: drop-shadow(4px 4px 0px var(--color-foreground));
	}

	.title {
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--color-foreground);
		margin: 0 0 16px;
		text-align: center;
	}

	.scores {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.score-row {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.label {
		min-width: 120px;
		display: flex;
		flex-direction: column;
	}

	.name {
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--color-foreground);
	}

	.desc {
		font-size: 0.75rem;
		color: var(--color-muted-foreground);
	}

	.bar-track {
		flex: 1;
		height: 12px;
		background: var(--color-primary-50);
		border-radius: 6px;
		border: 1px solid var(--color-border);
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: var(--color-primary-400);
		border-radius: 6px;
		transition: width 0.6s ease-out;
	}

	.score-num {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-foreground);
		min-width: 36px;
		text-align: right;
	}

	.highlights {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 16px;
	}

	.highlight-row {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	.highlight-domain {
		font-weight: 700;
		font-size: 0.8rem;
		color: var(--color-primary-600);
		min-width: 80px;
		text-transform: capitalize;
	}

	.highlight-text {
		font-size: 0.875rem;
		color: var(--color-foreground);
		line-height: 1.4;
		margin: 0;
	}

	.feedback {
		margin: 16px 0 0;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		line-height: 1.5;
	}

	.suggestions {
		margin-top: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
	}

	.suggestions-title {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-primary-600);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		margin: 0 0 8px;
	}

	.suggestions-list {
		margin: 0;
		padding-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.suggestions-list li {
		font-size: 0.875rem;
		color: var(--color-foreground);
		line-height: 1.4;
	}
</style>
