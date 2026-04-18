<script lang="ts">
	import type { ConstraintSubmissionResponse } from './types.ts';
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft, draftKey } from '$lib/client/draft';

	let {
		moduleId = '',
		prompt = '',
		constraints = [] as string[],
		instruction = '',
		compact = false,
		oncomplete = undefined as ((result: Record<string, unknown>) => void) | undefined
	} = $props();

	// Compact mode only exposes the first constraint as a single round.
	const effectiveConstraints = $derived(compact ? constraints.slice(0, 1) : constraints);

	type Draft = {
		responses: string[];
		currentRound: number;
		phase: 'rounds' | 'reflecting' | 'submitted';
		reflection: string;
	};

	const storageKey = moduleId ? draftKey(moduleId) : '';
	const initial: Draft | null = storageKey ? readDraft<Draft | null>(storageKey, null) : null;

	let currentRound = $state(initial?.currentRound ?? 0);
	let phase: 'rounds' | 'reflecting' | 'submitted' = $state(initial?.phase ?? 'rounds');
	let responses: string[] = $state(
		initial?.responses ?? (compact ? constraints.slice(0, 1) : constraints).map(() => '')
	);
	let startTime = $state(Date.now());
	let reflection = $state(initial?.reflection ?? '');

	$effect(() => {
		if (!storageKey) return;
		if (phase === 'submitted') {
			clearDraft(storageKey);
			return;
		}
		writeDraft<Draft>(storageKey, {
			responses: $state.snapshot(responses) as string[],
			currentRound,
			phase,
			reflection
		});
	});

	let totalRounds = $derived(effectiveConstraints.length);
	let currentResponse = $derived(responses[currentRound] ?? '');
	let canAdvance = $derived(currentResponse.trim().length > 0);

	function updateResponse(value: string) {
		responses[currentRound] = value;
	}

	function nextRound() {
		if (currentRound < totalRounds - 1) {
			currentRound++;
		} else if (compact) {
			submitReflection();
		} else {
			phase = 'reflecting';
		}
	}

	function submitReflection() {
		const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
		const reflections = { constraintImpact: reflection };

		phase = 'submitted';

		const evaluationPromise = fetch('/api/exercises/constraint-challenge', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				responses,
				constraints: effectiveConstraints,
				reflections,
				timeSpentSeconds,
				prompt
			})
		}).then(async (res) => {
			if (!res.ok) throw new Error('Evaluation failed');
			return res.json() as Promise<ConstraintSubmissionResponse>;
		});

		oncomplete?.({
			responses,
			timeSpentSeconds,
			reflections,
			_evaluationPromise: evaluationPromise,
			_userBubbles: responses,
			_prompt: prompt
		});
	}
</script>

<div class="exercise">
	{#if phase === 'rounds'}
		<p class="prompt-text">{prompt}</p>
		<p class="instruction">{instruction}</p>

		<div class="round-header">
			<span class="round-badge">Round {currentRound + 1} of {totalRounds}</span>
		</div>

		<div class="constraints-stack">
			{#each effectiveConstraints.slice(0, currentRound + 1) as constraint, i (i)}
				<div class="constraint-pill" class:active={i === currentRound}>
					{constraint}
				</div>
			{/each}
		</div>

		<div class="response-area">
			<textarea
				class="response-input"
				value={currentResponse}
				oninput={(e) => updateResponse(e.currentTarget.value)}
				rows="5"
				placeholder="Write your solution..."
			></textarea>
		</div>

		<div class="actions">
			<Button onclick={nextRound} disabled={!canAdvance}>
				{currentRound < totalRounds - 1 ? 'Next Round' : "I'm Done"}
			</Button>
		</div>
	{:else if phase === 'reflecting'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{totalRounds}</span> rounds completed
			</div>

			<div class="responses-review">
				{#each responses as response, i (i)}
					<div class="review-item">
						<span class="review-round">Round {i + 1}</span>
						<span class="review-constraint">{constraints[i]}</span>
						<p class="review-text">{response}</p>
					</div>
				{/each}
			</div>

			<div class="reflection">
				<label class="reflection-label">
					How did the constraints change your thinking?
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
				<span class="count">{totalRounds}</span> rounds submitted
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

	.prompt-text {
		text-align: center;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-foreground);
		margin-bottom: 4px;
	}

	.instruction {
		text-align: center;
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
		margin-bottom: 16px;
	}

	.round-header {
		display: flex;
		justify-content: center;
		margin-bottom: 12px;
	}

	.round-badge {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-primary-600);
		background: var(--color-primary-50);
		padding: 4px 14px;
		border-radius: 12px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.constraints-stack {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 16px;
	}

	.constraint-pill {
		padding: 10px 16px;
		border: 2px solid var(--color-border);
		border-radius: 10px;
		font-size: 0.9rem;
		color: var(--color-muted-foreground);
		background: var(--color-background);
		transition: all 0.2s;
	}

	.constraint-pill.active {
		border-color: var(--color-primary-400);
		background: var(--color-primary-50);
		color: var(--color-foreground);
		font-weight: 600;
		filter: drop-shadow(2px 2px 0px var(--color-primary-200));
	}

	.response-area {
		margin-bottom: 12px;
	}

	.response-input {
		width: 100%;
		padding: 14px;
		border: 2px solid var(--color-foreground);
		border-radius: 12px;
		background: var(--color-background);
		color: var(--color-foreground);
		font-size: 0.95rem;
		line-height: 1.5;
		resize: vertical;
		outline: none;
		filter: drop-shadow(3px 3px 0px var(--color-foreground));
		font-family: inherit;
	}

	.response-input:focus {
		border-color: var(--color-primary-400);
		filter: drop-shadow(3px 3px 0px var(--color-primary-400));
	}

	.actions {
		display: flex;
		justify-content: center;
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

	.responses-review {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.review-item {
		background: var(--color-primary-50);
		border-radius: 8px;
		padding: 12px 16px;
	}

	.review-round {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-primary-600);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.review-constraint {
		display: block;
		font-size: 0.8rem;
		color: var(--color-muted-foreground);
		margin-bottom: 4px;
		font-style: italic;
	}

	.review-text {
		font-size: 0.9rem;
		color: var(--color-foreground);
		line-height: 1.5;
		margin: 0;
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
