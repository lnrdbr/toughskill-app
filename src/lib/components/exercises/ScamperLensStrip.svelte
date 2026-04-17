<script lang="ts">
	import type { ScamperLensConfig } from './types.ts';

	let {
		lenses,
		currentIndex,
		ideasByLens = {}
	}: {
		lenses: ScamperLensConfig[];
		currentIndex: number;
		ideasByLens: Record<string, string[]>;
	} = $props();
</script>

<div class="strip">
	{#each lenses as lens, i (lens.key)}
		<div
			class="lens-step"
			class:active={i === currentIndex}
			class:has-ideas={(ideasByLens[lens.key]?.length ?? 0) > 0}
			class:past={i < currentIndex}
		>
			<span class="letter">{lens.letter}</span>
		</div>
	{/each}
</div>

<style>
	.strip {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 16px;
	}

	.lens-step {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 2px solid var(--color-border);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s;
		background: var(--color-background);
	}

	.letter {
		font-weight: 700;
		font-size: 0.875rem;
		color: var(--color-muted-foreground);
		transition: color 0.3s;
	}

	.lens-step.active {
		border-color: var(--color-primary-500);
		background: var(--color-primary-500);
		filter: drop-shadow(2px 2px 0px var(--color-primary-700));
	}

	.lens-step.active .letter {
		color: white;
	}

	.lens-step.has-ideas:not(.active) {
		border-color: var(--color-primary-300);
		background: var(--color-primary-50);
	}

	.lens-step.has-ideas:not(.active) .letter {
		color: var(--color-primary-600);
	}

	.lens-step.past:not(.has-ideas) {
		border-color: var(--color-border);
		background: var(--color-background);
	}
</style>
