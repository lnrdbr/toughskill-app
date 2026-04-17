<script lang="ts">
	import ExerciseTimer from './ExerciseTimer.svelte';
	import type { AnalogySubmissionResponse } from './types.ts';
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft, draftKey } from '$lib/client/draft';

	let {
		moduleId = '',
		concept = '',
		domains = [] as string[],
		instruction = '',
		timerDuration = 0,
		oncomplete = undefined as ((result: Record<string, unknown>) => void) | undefined
	} = $props();

	type Draft = {
		analogies: Record<string, { like: string; because: string }>;
		phase: 'input' | 'reflecting' | 'submitted';
		reflection: string;
	};

	const storageKey = moduleId ? draftKey(moduleId) : '';
	const initial: Draft | null = storageKey
		? readDraft<Draft | null>(storageKey, null)
		: null;

	let phase: 'input' | 'reflecting' | 'submitted' = $state(initial?.phase ?? 'input');
	let startTime = $state(Date.now());
	let reflection = $state(initial?.reflection ?? '');

	let analogies: Record<string, { like: string; because: string }> = $state(
		initial?.analogies ??
			Object.fromEntries(domains.map((d) => [d, { like: '', because: '' }]))
	);

	$effect(() => {
		if (!storageKey) return;
		if (phase === 'submitted') {
			clearDraft(storageKey);
			return;
		}
		writeDraft<Draft>(storageKey, {
			analogies: $state.snapshot(analogies) as Record<string, { like: string; because: string }>,
			phase,
			reflection
		});
	});

	let filledCount = $derived(
		Object.values(analogies).filter((a) => a.like.trim() && a.because.trim()).length
	);
	let canFinish = $derived(filledCount > 0);

	function finish() {
		phase = 'reflecting';
	}

	function handleTimerExpire() {
		finish();
	}

	function submitReflection() {
		const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
		const reflections = { surprising: reflection };

		phase = 'submitted';

		const evaluationPromise = fetch('/api/exercises/analogy-sprint', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ analogies, reflections, timeSpentSeconds, concept })
		}).then(async (res) => {
			if (!res.ok) throw new Error('Evaluation failed');
			return res.json() as Promise<AnalogySubmissionResponse>;
		});

		// Transform analogies to Record<string, string[]> for the pending evaluations store
		const ideasByDomain: Record<string, string[]> = {};
		for (const [domain, { like, because }] of Object.entries(analogies)) {
			if (like.trim() || because.trim()) {
				ideasByDomain[domain] = [`${like} because ${because}`];
			}
		}

		oncomplete?.({
			analogies,
			timeSpentSeconds,
			reflections,
			_evaluationPromise: evaluationPromise,
			_userBubbles: ideasByDomain,
			_prompt: concept
		});
	}
</script>

<div class="exercise">
	{#if phase === 'input'}
		<p class="concept">
			Create analogies for: <strong>{concept}</strong>
		</p>
		<p class="instruction">{instruction}</p>

		{#if timerDuration > 0}
			<div class="timer-row">
				<ExerciseTimer duration={timerDuration} onexpire={handleTimerExpire} />
			</div>
		{/if}

		<div class="domains">
			{#each domains as domain (domain)}
				<div class="domain-card">
					<span class="domain-label">{domain}</span>
					<div class="analogy-row">
						<span class="analogy-prefix">{concept} is like</span>
						<input
							class="analogy-input"
							type="text"
							placeholder="..."
							bind:value={analogies[domain].like}
						/>
					</div>
					<div class="analogy-row">
						<span class="analogy-prefix">because</span>
						<input
							class="analogy-input"
							type="text"
							placeholder="..."
							bind:value={analogies[domain].because}
						/>
					</div>
				</div>
			{/each}
		</div>

		<div class="actions">
			<span class="filled-count">{filledCount} / {domains.length} domains</span>
			<Button onclick={finish} disabled={!canFinish}>I'm Done</Button>
		</div>
	{:else if phase === 'reflecting'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{filledCount}</span> analogies created
			</div>

			<div class="analogies-review">
				{#each domains as domain (domain)}
					{@const a = analogies[domain]}
					{#if a.like.trim() || a.because.trim()}
						<div class="review-item">
							<span class="review-domain">{domain}</span>
							<p class="review-text">
								{concept} is like <strong>{a.like}</strong> because {a.because}
							</p>
						</div>
					{/if}
				{/each}
			</div>

			<div class="reflection">
				<label class="reflection-label">
					Which analogy surprised you most?
					<textarea class="reflection-input" bind:value={reflection} rows="2"></textarea>
				</label>
			</div>

			<div class="done-actions">
				<Button variant="primary" onclick={submitReflection}>Submit</Button>
			</div>
		</div>
	{:else if phase === 'submitted'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{filledCount}</span> analogies submitted
			</div>
		</div>
	{/if}
</div>

<style>
	.exercise {
		max-width: 1080px;
		width: 100%;
		margin: 0 auto;
		padding: 24px;
	}

	.concept {
		text-align: center;
		font-size: 1.1rem;
		color: var(--color-foreground);
		margin-bottom: 4px;
	}

	.instruction {
		text-align: center;
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
		margin-bottom: 16px;
	}

	.timer-row {
		display: flex;
		justify-content: center;
		margin-bottom: 16px;
	}

	.domains {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-bottom: 16px;
	}

	.domain-card {
		border: 2px solid var(--color-border);
		border-radius: 12px;
		padding: 14px 16px;
		background: var(--color-background);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.domain-label {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-primary-600);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.analogy-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.analogy-prefix {
		font-size: 0.9rem;
		color: var(--color-muted-foreground);
		white-space: nowrap;
		font-style: italic;
	}

	.analogy-input {
		flex: 1;
		padding: 6px 12px;
		border: 2px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-background);
		color: var(--color-foreground);
		font-size: 0.9rem;
		outline: none;
	}

	.analogy-input:focus {
		border-color: var(--color-primary-400);
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.filled-count {
		font-size: 0.85rem;
		color: var(--color-muted-foreground);
		font-weight: 600;
	}

	.done-screen {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.summary {
		text-align: center;
		font-size: 1.1rem;
		color: var(--color-foreground);
	}

	.count {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-primary-600);
	}

	.analogies-review {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.review-item {
		background: var(--color-primary-50);
		border-radius: 8px;
		padding: 10px 14px;
	}

	.review-domain {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-primary-600);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.review-text {
		font-size: 0.9rem;
		color: var(--color-foreground);
		line-height: 1.4;
		margin: 4px 0 0;
	}

	.reflection {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.reflection-label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-foreground);
	}

	.reflection-input {
		padding: 8px 12px;
		border: 2px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-background);
		color: var(--color-foreground);
		font-size: 0.875rem;
		resize: vertical;
		outline: none;
	}

	.reflection-input:focus {
		border-color: var(--color-primary-400);
	}

	.done-actions {
		display: flex;
		gap: 8px;
		justify-content: center;
	}
</style>
