<script lang="ts">
	import type { ScamperEvaluation, ScamperLensConfig } from './types.ts';

	let { evaluation }: { evaluation: ScamperEvaluation } = $props();

	const LENS_META: Record<string, { letter: string; label: string }> = {
		substitute: { letter: 'S', label: 'Substitute' },
		combine: { letter: 'C', label: 'Combine' },
		adapt: { letter: 'A', label: 'Adapt' },
		modify: { letter: 'M', label: 'Modify' },
		put: { letter: 'P', label: 'Put to Other Uses' },
		eliminate: { letter: 'E', label: 'Eliminate' },
		reverse: { letter: 'R', label: 'Reverse' }
	};

	const ALL_LENS_KEYS = ['substitute', 'combine', 'adapt', 'modify', 'put', 'eliminate', 'reverse'];
	const highlightEntries = $derived(
		Object.entries(evaluation.lensHighlights).filter(([, text]) => text)
	);
</script>

<div class="card">
	<h3 class="title">Your SCAMPER Reflection</h3>

	<div class="coverage">
		<p class="coverage-label">Lenses explored</p>
		<div class="lens-dots">
			{#each ALL_LENS_KEYS as key}
				{@const meta = LENS_META[key]}
				{@const explored = key in evaluation.lensHighlights}
				<div class="lens-dot" class:explored>
					<span class="dot-letter">{meta.letter}</span>
				</div>
			{/each}
		</div>
	</div>

	{#if highlightEntries.length > 0}
		<div class="highlights">
			{#each highlightEntries as [key, text]}
				{@const meta = LENS_META[key]}
				<div class="highlight-row">
					<span class="highlight-letter">{meta.letter}</span>
					<p class="highlight-text">{text}</p>
				</div>
			{/each}
		</div>
	{/if}

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

	.coverage {
		margin-bottom: 16px;
	}

	.coverage-label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-muted-foreground);
		text-align: center;
		margin: 0 0 8px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.lens-dots {
		display: flex;
		justify-content: center;
		gap: 8px;
	}

	.lens-dot {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		border: 2px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-background);
		transition: all 0.3s;
	}

	.lens-dot.explored {
		border-color: var(--color-primary-500);
		background: var(--color-primary-50);
	}

	.dot-letter {
		font-weight: 700;
		font-size: 0.8rem;
		color: var(--color-muted-foreground);
	}

	.lens-dot.explored .dot-letter {
		color: var(--color-primary-600);
	}

	.highlights {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.highlight-row {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	.highlight-letter {
		font-weight: 700;
		font-size: 0.875rem;
		color: var(--color-primary-600);
		min-width: 20px;
		text-align: center;
		padding-top: 1px;
	}

	.highlight-text {
		font-size: 0.875rem;
		color: var(--color-foreground);
		line-height: 1.4;
		margin: 0;
	}

	.feedback {
		margin: 0;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		line-height: 1.5;
	}
</style>
