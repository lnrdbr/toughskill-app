<script lang="ts">
	import { untrack } from 'svelte';
	import BubbleCloud from './BubbleCloud.svelte';
	import ExerciseTimer from './ExerciseTimer.svelte';
	import type { BubbleData, SubmissionResponse } from './types.ts';
	import enterSoundUrl from '$lib/assets/enterSound.wav';
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft, draftKey } from '$lib/client/draft';

	const enterSound = typeof Audio !== 'undefined' ? new Audio(enterSoundUrl) : null;

	let {
		moduleId = '',
		prompt = 'Paperclip',
		instruction = 'How many uses can you think of?',
		timerDuration = 0,
		initialIdeas = [] as string[],
		oncomplete = undefined as ((result: Record<string, unknown>) => void) | undefined
	} = $props();

	type Draft = {
		bubbles: BubbleData[];
		phase: 'input' | 'reflecting' | 'submitted';
		inputText: string;
		surprisingIdea: string;
		patterns: string;
	};

	const storageKey = moduleId ? draftKey(moduleId) : '';
	const initial: Draft | null = storageKey
		? readDraft<Draft | null>(storageKey, null)
		: null;

	const COLORS = [
		'var(--color-primary-100)',
		'var(--color-primary-200)',
		'var(--color-primary-300)',
		'var(--color-primary-50)'
	];

	let bubbles: BubbleData[] = $state(
		initial?.bubbles ??
			untrack(() => initialIdeas).map((text, i) => ({
				id: crypto.randomUUID(),
				text,
				color: COLORS[i % COLORS.length]
			}))
	);

	let phase: 'input' | 'reflecting' | 'submitted' = $state(initial?.phase ?? 'input');
	let inputText = $state(initial?.inputText ?? '');
	let startTime = $state(Date.now());
	let surprisingIdea = $state(initial?.surprisingIdea ?? '');
	let patterns = $state(initial?.patterns ?? '');

	$effect(() => {
		if (!storageKey) return;
		if (phase === 'submitted') {
			clearDraft(storageKey);
			return;
		}
		writeDraft<Draft>(storageKey, {
			bubbles: $state.snapshot(bubbles) as BubbleData[],
			phase,
			inputText,
			surprisingIdea,
			patterns
		});
	});

	function addIdea() {
		const text = inputText.trim();
		if (!text) return;
		inputText = '';

		if (enterSound) {
			enterSound.currentTime = 0;
			enterSound.play().catch(() => {});
		}

		bubbles.push({
			id: crypto.randomUUID(),
			text,
			color: COLORS[bubbles.length % COLORS.length]
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addIdea();
		}
	}

	function finish() {
		phase = 'reflecting';
	}

	function handleTimerExpire() {
		finish();
	}

	function submitReflection() {
		const ideas = bubbles.map((b) => b.text);
		const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
		const reflections = { surprisingIdea, patterns };

		phase = 'submitted';

		// Fire evaluation in background — do not await
		const evaluationPromise = fetch('/api/exercises/divergent-thinking', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ideas, reflections, timeSpentSeconds, prompt })
		}).then(async (res) => {
			if (!res.ok) throw new Error('Evaluation failed');
			return res.json() as Promise<SubmissionResponse>;
		});

		// Complete immediately so user can advance
		oncomplete?.({
			ideas,
			timeSpentSeconds,
			reflections,
			_evaluationPromise: evaluationPromise,
			_userBubbles: ideas,
			_prompt: prompt
		});
	}
</script>

<div class="exercise">
	<p class="instruction">{instruction}</p>

	<BubbleCloud {prompt} {bubbles} settled={phase !== 'input'} />

	{#if phase === 'input'}
		<div class="controls">
			<div class="input-row">
				<input
					class="idea-input"
					type="text"
					placeholder="Type an idea and press Enter..."
					bind:value={inputText}
					onkeydown={handleKeydown}
				/>
				<Button silent onclick={addIdea}>Add</Button>
			</div>

			<div class="actions">
				{#if timerDuration > 0}
					<ExerciseTimer duration={timerDuration} onexpire={handleTimerExpire} />
				{/if}
				<Button onclick={finish} disabled={bubbles.length === 0}>I'm Done</Button>
			</div>
		</div>
	{:else if phase === 'reflecting'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{bubbles.length}</span> ideas generated
			</div>

			<div class="reflection">
				<label class="reflection-label">
					Which idea surprised you the most?
					<textarea class="reflection-input" bind:value={surprisingIdea} rows="2"></textarea>
				</label>

				<label class="reflection-label">
					Did you notice any patterns in your thinking?
					<textarea class="reflection-input" bind:value={patterns} rows="2"></textarea>
				</label>
			</div>

			<div class="done-actions">
				<Button variant="primary" onclick={submitReflection}>Submit</Button>
			</div>
		</div>
	{:else if phase === 'submitted'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{bubbles.length}</span> ideas submitted
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

	.instruction {
		text-align: center;
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
		margin-bottom: 8px;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 12px;
	}

	.input-row {
		display: flex;
		gap: 8px;
	}

	.idea-input {
		flex: 1;
		padding: 8px 16px;
		border: 2px solid var(--color-foreground);
		border-radius: var(--radius-button);
		background: var(--color-background);
		color: var(--color-foreground);
		font-size: 0.9rem;
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
		outline: none;
	}

	.idea-input:focus {
		border-color: var(--color-primary-400);
		filter: drop-shadow(2px 2px 0px var(--color-primary-400));
	}

	.actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
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
