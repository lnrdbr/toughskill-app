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

	// Which of this session's modules have an evaluation waiting on the client.
	// `pendingEvaluations` is a plain object, so we can't read its mutations
	// reactively — we snapshot the promises here and await them per-item in
	// the template via {#await}, which gives us the loading + resolved states.
	type Pending = { moduleId: string; promise: Promise<string | null> };

	let pending: Pending[] = $derived(
		completionResults
			.map((r) => {
				const entry = pendingEvaluations[r.moduleId];
				if (!entry) return null;
				const promise = entry.promise
					.then((data) => data?.evaluation?.feedback ?? null)
					.catch(() => null);
				return { moduleId: r.moduleId, promise };
			})
			.filter((p): p is Pending => p !== null)
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

	{#if pending.length > 0}
		<div class="highlights">
			<h2 class="highlights-heading">From your responses</h2>
			<ul class="highlights-list">
				{#each pending as p (p.moduleId)}
					<li class="highlight">
						{#await p.promise}
							<span class="highlight-loading">
								<span class="highlight-spinner" aria-hidden="true"></span>
								Reading your answer…
							</span>
						{:then feedback}
							{#if feedback}
								{feedback}
							{:else}
								<span class="highlight-muted">
									Couldn't generate feedback this time — your answer is saved.
								</span>
							{/if}
						{:catch}
							<span class="highlight-muted">
								Couldn't generate feedback this time — your answer is saved.
							</span>
						{/await}
					</li>
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

	.highlight-loading {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--color-muted-foreground);
		font-style: italic;
	}

	.highlight-spinner {
		width: 12px;
		height: 12px;
		border: 2px solid var(--color-primary-200);
		border-top-color: var(--color-primary-500);
		border-radius: 50%;
		animation: highlight-spin 0.8s linear infinite;
	}

	@keyframes highlight-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.highlight-muted {
		color: var(--color-muted-foreground);
		font-style: italic;
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
