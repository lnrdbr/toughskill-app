<script lang="ts">
	import Icon from '@iconify/svelte';
	import { resolve } from '$app/paths';
	import type { ModuleCompletionResult } from '$lib/types/course';
	import { pendingEvaluations } from '$lib/components/exercises/types';

	let {
		completionResults = [] as ModuleCompletionResult[],
		courseTitle = '',
		lessonTitle = ''
	} = $props();

	let totalSeconds = $derived(
		completionResults.reduce((sum, r) => {
			const t = r.data?.timeSpentSeconds;
			return sum + (typeof t === 'number' && t > 0 ? t : 0);
		}, 0)
	);

	function formatTime(seconds: number): string {
		if (seconds < 60) return `${seconds} sec`;
		const mins = Math.round(seconds / 60);
		if (mins < 60) return `${mins} min`;
		const hours = Math.floor(mins / 60);
		const rest = mins % 60;
		return rest === 0 ? `${hours} h` : `${hours} h ${rest} m`;
	}

	// Collect any evaluation feedback that landed on the client this session
	let highlights = $derived(
		completionResults
			.map((r) => {
				const entry = pendingEvaluations[r.moduleId];
				const feedback = entry?.result?.evaluation?.feedback;
				return feedback ? { moduleId: r.moduleId, feedback } : null;
			})
			.filter((h): h is { moduleId: string; feedback: string } => h !== null)
	);
</script>

<div class="lesson-complete">
	<div class="trophy">
		<Icon icon="mdi:check-decagram-outline" width="56" height="56" />
	</div>

	<h1 class="heading">Lesson complete</h1>
	<p class="subtitle">
		<strong>{lessonTitle}</strong>
		{#if courseTitle}<span class="course"> · {courseTitle}</span>{/if}
	</p>

	<div class="stats">
		<div class="stat">
			<span class="stat-value">{completionResults.length}</span>
			<span class="stat-label">module{completionResults.length === 1 ? '' : 's'}</span>
		</div>
		{#if totalSeconds > 0}
			<div class="stat">
				<span class="stat-value">{formatTime(totalSeconds)}</span>
				<span class="stat-label">practice time</span>
			</div>
		{/if}
	</div>

	{#if highlights.length > 0}
		<div class="highlights">
			<h2 class="highlights-heading">From your responses</h2>
			<ul class="highlights-list">
				{#each highlights as h (h.moduleId)}
					<li class="highlight">{h.feedback}</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="actions">
		<a href={resolve('/learn')} class="back-link">Back to the learning path</a>
	</div>
</div>

<style>
	.lesson-complete {
		max-width: 640px;
		margin: 0 auto;
		padding: 24px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
	}

	.trophy {
		color: var(--color-primary-600);
		filter: drop-shadow(4px 4px 0px var(--color-primary-200));
	}

	.heading {
		font-family: var(--font-display);
		font-size: 1.6rem;
		color: var(--color-foreground);
		margin: 0;
		letter-spacing: 0.04em;
	}

	.subtitle {
		color: var(--color-muted-foreground);
		font-size: 1rem;
		margin: 0;
	}

	.course {
		color: var(--color-muted-foreground);
	}

	.stats {
		display: flex;
		gap: 32px;
		margin-top: 4px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.stat-value {
		font-size: 1.3rem;
		font-weight: 700;
		color: var(--color-primary-600);
	}

	.stat-label {
		font-size: 0.8rem;
		color: var(--color-muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.highlights {
		width: 100%;
		margin-top: 8px;
		padding: 14px 16px;
		background: var(--color-primary-50);
		border: 2px solid var(--color-primary-200);
		border-radius: 12px;
		text-align: left;
	}

	.highlights-heading {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-primary-600);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0 0 10px;
	}

	.highlights-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.highlight {
		font-size: 0.95rem;
		line-height: 1.5;
		color: var(--color-foreground);
		padding-left: 12px;
		border-left: 3px solid var(--color-primary-400);
	}

	.actions {
		margin-top: 4px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.back-link {
		color: var(--color-primary-600);
		font-weight: 600;
		text-decoration: underline;
		font-size: 0.9rem;
	}
</style>
