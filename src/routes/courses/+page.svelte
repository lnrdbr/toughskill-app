<script lang="ts">
	import Icon from '@iconify/svelte';
	import Button from '$lib/components/Button.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let cards = $derived(data.cards);
	let index = $state(0);

	function cta(completed: number, available: boolean): string {
		if (!available) return 'Coming soon';
		if (completed > 0) return 'Continue';
		return 'Enroll';
	}

	function go(i: number) {
		const max = cards.length - 1;
		index = Math.min(Math.max(i, 0), max);
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') go(index - 1);
		else if (e.key === 'ArrowRight') go(index + 1);
	}

	function startCourse(id: string) {
		window.location.assign(`${resolve('/learn')}?course=${encodeURIComponent(id)}`);
	}
</script>

<svelte:window onkeydown={onKey} />

<section class="wrap">
	<h1 class="heading">Pick a course</h1>

	<div class="carousel">
		{#each cards as card, i (card.id)}
			{@const offset = i - index}
			{@const absOffset = Math.min(Math.abs(offset), 2)}
			{@const isActive = i === index}
			<button
				type="button"
				class="card"
				class:active={isActive}
				class:coming-soon={!card.available}
				style="--offset: {offset}; --abs-offset: {absOffset}; --z: {10 - absOffset};"
				aria-hidden={!isActive}
				tabindex={isActive ? 0 : -1}
				onclick={() => go(i)}
			>
				<div class="card-head">
					<Icon icon={card.icon} width="56" height="56" />
					<h2 class="title">{card.title}</h2>
				</div>
				<p class="description">{card.description}</p>
				{#if card.available}
					<div class="progress">
						<div class="progress-bar">
							<div
								class="progress-fill"
								style="width: {card.totalModules === 0
									? 0
									: (card.completedModules / card.totalModules) * 100}%"
							></div>
						</div>
						<span class="progress-label">
							{card.completedModules} / {card.totalModules} modules
						</span>
					</div>
				{:else}
					<div class="coming-soon-badge">Coming soon</div>
				{/if}
			</button>
		{/each}
	</div>

	<div class="dots" role="tablist" aria-label="Course selector">
		{#each cards as card, i (card.id)}
			<button
				type="button"
				class="dot"
				class:active={i === index}
				aria-label="Show {card.title}"
				aria-selected={i === index}
				role="tab"
				onclick={() => go(i)}
			></button>
		{/each}
	</div>

	{#if cards[index]}
		<div class="cta">
			<Button
				variant="primary"
				disabled={!cards[index].available}
				onclick={() => startCourse(cards[index].id)}
			>
				{cta(cards[index].completedModules, cards[index].available)}
			</Button>
		</div>
	{/if}
</section>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 48px 24px 64px;
		max-width: 1100px;
		margin: 0 auto;
	}

	.heading {
		font-family: var(--font-display), serif;
		font-size: clamp(2rem, 5vw, 2.75rem);
		color: var(--color-foreground);
		margin: 0;
	}

	.carousel {
		position: relative;
		width: 100%;
		height: 420px;
		display: flex;
		align-items: center;
		justify-content: center;
		perspective: 1400px;
	}

	.card {
		position: absolute;
		left: 50%;
		top: 50%;
		width: min(520px, 82%);
		height: 380px;
		padding: 32px;
		border-radius: 24px;
		border: 2px solid var(--color-border);
		background: var(--color-background);
		color: var(--color-foreground);
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 16px;
		transform: translate(-50%, -50%) translateX(calc(var(--offset) * 58%))
			scale(calc(1 - var(--abs-offset) * 0.12));
		opacity: calc(1 - var(--abs-offset) * 0.4);
		transition:
			transform 0.35s ease,
			opacity 0.35s ease,
			border-color 0.2s ease,
			filter 0.2s ease;
		z-index: var(--z);
	}

	.card.active {
		border-color: var(--color-primary-500);
		filter: drop-shadow(5px 5px 0px var(--color-primary-200));
	}

	.card.coming-soon {
		filter: grayscale(0.4);
	}

	.card.coming-soon.active {
		filter: grayscale(0.4) drop-shadow(5px 5px 0px var(--color-border));
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: 16px;
		color: var(--color-foreground);
	}

	.title {
		font-family: var(--font-display), serif;
		font-size: clamp(1.8rem, 3.5vw, 2.4rem);
		margin: 0;
		letter-spacing: 0.02em;
	}

	.description {
		font-size: 1rem;
		color: var(--color-muted-foreground);
		line-height: 1.5;
		margin: 0;
		flex: 1;
	}

	.progress {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: var(--color-primary-50);
		border: 1px solid var(--color-primary-200);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary-500);
		transition: width 0.3s ease;
	}

	.progress-label {
		font-size: 0.8rem;
		color: var(--color-muted-foreground);
	}

	.coming-soon-badge {
		align-self: flex-start;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 4px 10px;
		border-radius: 999px;
		background: var(--color-muted);
		color: var(--color-muted-foreground);
	}

	.dots {
		display: flex;
		gap: 8px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border: none;
		border-radius: 999px;
		background: var(--color-border);
		cursor: pointer;
		padding: 0;
		transition:
			background 0.2s ease,
			width 0.2s ease;
	}

	.dot.active {
		background: var(--color-primary-500);
		width: 24px;
	}

	.cta {
		margin-top: 8px;
	}
</style>
