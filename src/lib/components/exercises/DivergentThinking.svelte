<script lang="ts">
	import { untrack } from 'svelte';
	import BubbleCloud from './BubbleCloud.svelte';
	import ExerciseTimer from './ExerciseTimer.svelte';
	import GuilfordCard from './GuilfordCard.svelte';
	import type { BubbleData, ExerciseResult, GuilfordEvaluation, SubmissionResponse } from './types.ts';

	let {
		prompt = 'Paperclip',
		instruction = 'How many uses can you think of?',
		timerDuration = 0,
		initialIdeas = [] as string[],
		oncomplete = undefined as ((result: ExerciseResult) => void) | undefined
	} = $props();

	const COLORS = [
		'var(--color-primary-100)',
		'var(--color-primary-200)',
		'var(--color-primary-300)',
		'var(--color-primary-50)'
	];

	const COMMUNITY_COLORS = [
		'var(--color-secondary-200)',
		'var(--color-secondary-300)',
		'var(--color-secondary-100)'
	];

	let bubbles: BubbleData[] = $state(
		untrack(() => initialIdeas).map((text, i) => ({
			id: crypto.randomUUID(),
			text,
			color: COLORS[i % COLORS.length]
		}))
	);

	let phase: 'input' | 'reflecting' | 'evaluating' | 'results' = $state('input');
	let inputText = $state('');
	let startTime = $state(Date.now());
	let surprisingIdea = $state('');
	let patterns = $state('');
	let evaluation: GuilfordEvaluation | null = $state(null);
	let errorMessage = $state('');

	function addIdea() {
		const text = inputText.trim();
		if (!text) return;
		inputText = '';

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

	async function submitReflection() {
		const ideas = bubbles.map((b) => b.text);
		const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
		const reflections = { surprisingIdea, patterns };

		phase = 'evaluating';
		errorMessage = '';

		try {
			const res = await fetch('/api/exercises/divergent-thinking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ideas, reflections, timeSpentSeconds, prompt })
			});

			if (!res.ok) throw new Error('Evaluation failed');

			const data: SubmissionResponse = await res.json();
			evaluation = data.evaluation;

			// Add community ideas as secondary-colored bubbles
			if (data.communityIdeas.length > 0) {
				for (let i = 0; i < data.communityIdeas.length; i++) {
					bubbles.push({
						id: crypto.randomUUID(),
						text: data.communityIdeas[i],
						color: COMMUNITY_COLORS[i % COMMUNITY_COLORS.length]
					});
				}
			}

			phase = 'results';
			oncomplete?.({ ideas, timeSpentSeconds, reflections });
		} catch {
			errorMessage = 'Could not evaluate your ideas. You can still try again.';
			phase = 'results';
			oncomplete?.({
				ideas,
				timeSpentSeconds,
				reflections
			});
		}
	}

	function tryAgain() {
		phase = 'input';
		bubbles = [];
		inputText = '';
		surprisingIdea = '';
		patterns = '';
		evaluation = null;
		errorMessage = '';
		startTime = Date.now();
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
				<button class="retry-btn" onclick={tryAgain}>Try Again</button>
			</div>
		</div>
	{:else if phase === 'evaluating'}
		<div class="loading">
			<div class="spinner"></div>
			<p class="loading-text">Analysing your ideas...</p>
		</div>
	{:else if phase === 'results'}
		<div class="results">
			{#if evaluation}
				<GuilfordCard {evaluation} />

				<div class="legend">
					<span class="legend-item">
						<span class="dot dot-user"></span> Your ideas
					</span>
					<span class="legend-item">
						<span class="dot dot-community"></span> Community ideas
					</span>
				</div>
			{/if}

			{#if errorMessage}
				<p class="error">{errorMessage}</p>
			{/if}

			<div class="done-actions">
				<button class="retry-btn" onclick={tryAgain}>Try Again</button>
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
	.submit-btn,
	.retry-btn {
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
	.submit-btn:hover,
	.retry-btn:hover {
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0px var(--color-primary-300));
		border-color: var(--color-primary-300);
		background-color: var(--color-primary-50);
		color: var(--color-primary-900);
	}

	.add-btn:active,
	.done-btn:active,
	.submit-btn:active,
	.retry-btn:active {
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

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 0;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary-500);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		color: var(--color-muted-foreground);
		font-size: 0.9rem;
	}

	.results {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.legend {
		display: flex;
		gap: 16px;
		justify-content: center;
		font-size: 0.8rem;
		color: var(--color-muted-foreground);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
	}

	.dot-user {
		background: var(--color-primary-200);
	}

	.dot-community {
		background: var(--color-secondary-200);
	}

	.error {
		text-align: center;
		color: var(--color-error);
		font-size: 0.875rem;
	}
</style>
