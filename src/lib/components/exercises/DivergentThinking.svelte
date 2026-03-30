<script lang="ts">
	import { untrack } from 'svelte';
	import BubbleCloud from './BubbleCloud.svelte';
	import ExerciseTimer from './ExerciseTimer.svelte';
	import type { BubbleData, SubmissionResponse } from './types.ts';
	import enterSoundUrl from '$lib/assets/enterSound.wav';

	const enterSound = typeof Audio !== 'undefined' ? new Audio(enterSoundUrl) : null;

	let {
		prompt = 'Paperclip',
		instruction = 'How many uses can you think of?',
		timerDuration = 0,
		initialIdeas = [] as string[],
		oncomplete = undefined as ((result: Record<string, unknown>) => void) | undefined
	} = $props();

	const COLORS = [
		'var(--color-primary-100)',
		'var(--color-primary-200)',
		'var(--color-primary-300)',
		'var(--color-primary-50)'
	];

	let bubbles: BubbleData[] = $state(
		untrack(() => initialIdeas).map((text, i) => ({
			id: crypto.randomUUID(),
			text,
			color: COLORS[i % COLORS.length]
		}))
	);

	let phase: 'input' | 'reflecting' | 'submitted' = $state('input');
	let inputText = $state('');
	let startTime = $state(Date.now());
	let surprisingIdea = $state('');
	let patterns = $state('');

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
				<button class="add-btn" onclick={addIdea}>Add</button>
			</div>

			<div class="actions">
				{#if timerDuration > 0}
					<ExerciseTimer duration={timerDuration} onexpire={handleTimerExpire} />
				{/if}
				<button class="done-btn" onclick={finish} disabled={bubbles.length === 0}>
					I'm Done
				</button>
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
				<button class="submit-btn" onclick={submitReflection}>Submit</button>
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

	.add-btn,
	.done-btn,
	.submit-btn {
		padding: 8px 20px;
		border: 2px solid var(--color-foreground);
		border-radius: var(--radius-button);
		background: var(--color-background);
		color: var(--color-foreground);
		font-weight: 600;
		font-size: 0.875rem;
		cursor: pointer;
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
		transition: all 0.3s;
	}

	.add-btn:hover,
	.done-btn:hover,
	.submit-btn:hover {
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0px var(--color-primary-300));
		border-color: var(--color-primary-300);
		background-color: var(--color-primary-50);
		color: var(--color-primary-900);
	}

	.add-btn:active,
	.done-btn:active,
	.submit-btn:active {
		transform: translate(2px, 2px);
		filter: drop-shadow(0px 0px 0px var(--color-primary-400));
		background-color: var(--color-primary-200);
		border-color: var(--color-primary-400);
	}

	.done-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		filter: none;
		transform: none;
	}

	.done-btn:disabled:hover {
		background: var(--color-background);
		border-color: var(--color-foreground);
		color: var(--color-foreground);
		transform: none;
		filter: none;
	}

	.submit-btn {
		background: var(--color-primary-500);
		color: white;
		border-color: var(--color-primary-700);
		filter: drop-shadow(2px 2px 0px var(--color-primary-700));
	}

	.submit-btn:hover {
		background: var(--color-primary-400);
		border-color: var(--color-primary-600);
		color: white;
		filter: drop-shadow(1px 1px 0px var(--color-primary-600));
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
