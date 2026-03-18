<script lang="ts">
	import type { GuilfordEvaluation } from './types.ts';

	let { evaluation }: { evaluation: GuilfordEvaluation } = $props();
</script>

<div class="card">
	<h3 class="title">Your Divergent Thinking Profile</h3>

	<div class="scores">
		<div class="score-row">
			<div class="label">
				<span class="name">Fluency</span>
				<span class="desc">Total ideas generated</span>
			</div>
			<span class="count">{evaluation.fluency}</span>
		</div>

		<div class="score-row">
			<div class="label">
				<span class="name">Flexibility</span>
				<span class="desc">Variety of categories</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.flexibility * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.flexibility}/10</span>
		</div>

		<div class="score-row">
			<div class="label">
				<span class="name">Originality</span>
				<span class="desc">Uniqueness of ideas</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.originality * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.originality}/10</span>
		</div>

		<div class="score-row">
			<div class="label">
				<span class="name">Elaboration</span>
				<span class="desc">Depth of detail</span>
			</div>
			<div class="bar-track">
				<div class="bar-fill" style="width: {evaluation.elaboration * 10}%"></div>
			</div>
			<span class="score-num">{evaluation.elaboration}/10</span>
		</div>
	</div>

	<p class="feedback">{evaluation.feedback}</p>
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

	.count {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary-600);
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
</style>
