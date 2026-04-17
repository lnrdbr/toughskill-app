<script lang="ts">
	import type { ConstraintEvaluation } from './types.ts';

	let { evaluation }: { evaluation: ConstraintEvaluation } = $props();
</script>

<div class="card">
	<h3 class="title">Your Constraint Challenge Profile</h3>

	<div class="scores">
		<div class="score-row">
			<div class="label">
				<span class="name">Adaptability</span>
				<span class="desc">How solutions evolved across constraints</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.adaptability * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.adaptability}/10</span>
		</div>

		<div class="score-row">
			<div class="label">
				<span class="name">Originality</span>
				<span class="desc">Creativity under limitation</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.originality * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.originality}/10</span>
		</div>

		<div class="score-row">
			<div class="label">
				<span class="name">Feasibility</span>
				<span class="desc">Practicality of solutions</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.feasibility * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.feasibility}/10</span>
		</div>
	</div>

	<p class="feedback">{evaluation.feedback}</p>

	{#if evaluation.suggestions?.length}
		<div class="suggestions">
			<h4 class="suggestions-title">Approaches you might not have considered</h4>
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

	.feedback {
		margin: 16px 0 0;
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
