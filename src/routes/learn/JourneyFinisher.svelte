<script lang="ts">
	import cloudy from '$lib/assets/cloudy.png';
	import type { JourneyStats } from './+page.server';

	let { stats, courseTitle }: { stats: JourneyStats; courseTitle: string } = $props();

	function formatTime(seconds: number): string {
		if (seconds < 60) return `${seconds} sec`;
		const mins = Math.round(seconds / 60);
		if (mins < 60) return `${mins} min`;
		const hours = Math.floor(mins / 60);
		const rest = mins % 60;
		return rest === 0 ? `${hours} h` : `${hours} h ${rest} m`;
	}
</script>

<section class="finisher" class:locked={!stats.allDone} aria-live="polite">
	<img src={cloudy} alt="Cloudy, the TOUGHSKILL mascot" class="cloudy" />

	{#if stats.allDone}
		<h2 class="headline">You finished {courseTitle}.</h2>
		<p class="body">
			If you actually applied these in real life — noticing what others walked past, trying the
			constraints, showing up for the tasks — you see the world a little differently now than when
			you started. That's the whole thing.
		</p>
	{:else}
		<h2 class="headline">Keep going. I'll be here.</h2>
		<p class="body">
			Finish every lesson to unlock the end of the journey. The real reward isn't this card — it's
			what you notice in your life along the way.
		</p>
	{/if}

	<dl class="stats" data-testid="finisher-stats">
		<div class="stat">
			<dt class="stat-label">Lessons</dt>
			<dd class="stat-value">{stats.completedLessons} / {stats.totalLessons}</dd>
		</div>
		<div class="stat">
			<dt class="stat-label">Practice time</dt>
			<dd class="stat-value">{formatTime(stats.totalPracticeSeconds)}</dd>
		</div>
		<div class="stat">
			<dt class="stat-label">Real-life tasks</dt>
			<dd class="stat-value">{stats.realLifeTasksCompleted}</dd>
		</div>
	</dl>
</section>

<style>
	.finisher {
		margin-top: 48px;
		padding: 32px 24px;
		border-radius: 20px;
		border: 2px solid var(--color-primary-300);
		background: var(--color-primary-50);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
		filter: drop-shadow(5px 5px 0px var(--color-primary-200));
		transition:
			filter 0.3s ease,
			border-color 0.3s ease,
			opacity 0.3s ease;
	}

	.finisher.locked {
		border-color: var(--color-border);
		background: var(--color-background);
		filter: none;
		opacity: 0.75;
	}

	.cloudy {
		width: 120px;
		height: auto;
	}

	.finisher.locked .cloudy {
		filter: grayscale(0.6);
	}

	.headline {
		font-family: var(--font-display), serif;
		font-size: 1.6rem;
		color: var(--color-foreground);
		margin: 0;
	}

	.body {
		max-width: 40ch;
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--color-muted-foreground);
		margin: 0;
	}

	.stats {
		display: flex;
		gap: 24px;
		margin: 12px 0 0;
		padding: 0;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-label {
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--color-muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.stat-value {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--color-primary-600);
		margin: 0;
	}

	.finisher.locked .stat-value {
		color: var(--color-muted-foreground);
	}
</style>
