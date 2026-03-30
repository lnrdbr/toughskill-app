<script lang="ts">
	import { untrack } from 'svelte';
	import BubbleCloud from './BubbleCloud.svelte';
	import ExerciseTimer from './ExerciseTimer.svelte';
	import ScamperLensStrip from './ScamperLensStrip.svelte';
	import type { BubbleData, ScamperLensConfig, ScamperSubmissionResponse } from './types.ts';
	import enterSoundUrl from '$lib/assets/enterSound.wav';
	import Button from '$lib/components/Button.svelte';

	const enterSound = typeof Audio !== 'undefined' ? new Audio(enterSoundUrl) : null;

	const DEFAULT_LENSES: ScamperLensConfig[] = [
		{
			key: 'substitute',
			letter: 'S',
			label: 'Substitute',
			question: 'What components, materials, or processes could you substitute?'
		},
		{
			key: 'combine',
			letter: 'C',
			label: 'Combine',
			question: 'What ideas, elements, or functions could you combine?'
		},
		{
			key: 'adapt',
			letter: 'A',
			label: 'Adapt',
			question: 'What could you adapt or borrow from elsewhere?'
		},
		{
			key: 'modify',
			letter: 'M',
			label: 'Modify',
			question: 'What could you magnify, minify, or otherwise modify?'
		},
		{
			key: 'put',
			letter: 'P',
			label: 'Put to Other Uses',
			question: 'What other uses could this serve?'
		},
		{
			key: 'eliminate',
			letter: 'E',
			label: 'Eliminate',
			question: 'What could you remove or simplify?'
		},
		{
			key: 'reverse',
			letter: 'R',
			label: 'Reverse',
			question: 'What could you reverse, rearrange, or flip?'
		}
	];

	const COLORS = [
		'var(--color-primary-100)',
		'var(--color-primary-200)',
		'var(--color-primary-300)',
		'var(--color-primary-50)'
	];

	let {
		prompt = 'Paperclip',
		instruction = 'Apply SCAMPER thinking to generate creative ideas.',
		timerDuration = 0,
		showIntro = true,
		lensDescriptions = undefined as ScamperLensConfig[] | undefined,
		initialIdeasByLens = {} as Record<string, string[]>,
		oncomplete = undefined as ((result: Record<string, unknown>) => void) | undefined
	} = $props();

	const lenses = lensDescriptions ?? DEFAULT_LENSES;

	let phase: 'intro' | 'lensing' | 'reflecting' | 'submitted' = $state(
		showIntro ? 'intro' : 'lensing'
	);
	let currentLensIndex = $state(0);
	let inputText = $state('');
	let startTime = $state(Date.now());
	let mostProductiveLens = $state('');
	let surprises = $state('');

	// Bubbles per lens
	let bubblesByLens: Record<string, BubbleData[]> = $state(
		Object.fromEntries(
			lenses.map((l) => [
				l.key,
				untrack(() => initialIdeasByLens[l.key] ?? []).map((text, i) => ({
					id: crypto.randomUUID(),
					text,
					color: COLORS[i % COLORS.length]
				}))
			])
		)
	);

	let currentLens = $derived(lenses[currentLensIndex]);
	let currentBubbles = $derived(bubblesByLens[currentLens.key] ?? []);
	let totalIdeas = $derived(Object.values(bubblesByLens).reduce((sum, b) => sum + b.length, 0));

	// Plain string arrays for API submission
	let ideasByLens = $derived(
		Object.fromEntries(
			Object.entries(bubblesByLens).map(([key, bubbles]) => [key, bubbles.map((b) => b.text)])
		)
	);

	function addIdea() {
		const text = inputText.trim();
		if (!text) return;
		inputText = '';

		if (enterSound) {
			enterSound.currentTime = 0;
			enterSound.play().catch(() => {});
		}

		const lensBubbles = bubblesByLens[currentLens.key];
		lensBubbles.push({
			id: crypto.randomUUID(),
			text,
			color: COLORS[lensBubbles.length % COLORS.length]
		});
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			addIdea();
		}
	}

	function nextLens() {
		if (currentLensIndex < lenses.length - 1) {
			currentLensIndex++;
			inputText = '';
		} else {
			phase = 'reflecting';
		}
	}

	function prevLens() {
		if (phase === 'reflecting') {
			phase = 'lensing';
			return;
		}
		if (currentLensIndex > 0) {
			currentLensIndex--;
			inputText = '';
		}
	}

	function beginExercise() {
		phase = 'lensing';
		startTime = Date.now();
	}

	function handleTimerExpire() {
		phase = 'reflecting';
	}

	function submitReflection() {
		const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
		const reflections = { mostProductiveLens, surprises };

		phase = 'submitted';

		const evaluationPromise = fetch('/api/exercises/scamper', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ ideasByLens, reflections, timeSpentSeconds, prompt })
		}).then(async (res) => {
			if (!res.ok) throw new Error('Evaluation failed');
			return res.json() as Promise<ScamperSubmissionResponse>;
		});

		oncomplete?.({
			ideasByLens,
			timeSpentSeconds,
			reflections,
			_evaluationPromise: evaluationPromise,
			_userBubbles: Object.values(ideasByLens).flat(),
			_prompt: prompt
		});
	}
</script>

<div class="exercise">
	{#if phase === 'intro'}
		<div class="intro">
			<h2 class="intro-title">SCAMPER</h2>
			<p class="intro-prompt">
				You'll apply 7 creative thinking lenses to: <strong>{prompt}</strong>
			</p>
			<p class="intro-desc">{instruction}</p>
			<Button variant="primary" onclick={beginExercise}>Begin</Button>
		</div>
	{:else if phase === 'lensing'}
		<ScamperLensStrip {lenses} currentIndex={currentLensIndex} {ideasByLens} />

		<div class="lens-header">
			<h3 class="lens-label">{currentLens.label}</h3>
			<p class="lens-question">{currentLens.question}</p>
			<p class="lens-context">
				Think about: <strong>{prompt}</strong>
			</p>
		</div>

		{#key currentLens.key}
			<BubbleCloud prompt={currentLens.letter} bubbles={currentBubbles} settled={false} />
		{/key}

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

				<div class="nav-buttons">
					{#if currentLensIndex > 0}
						<Button onclick={prevLens}>Back</Button>
					{/if}
					<Button variant="primary" onclick={nextLens}>
						{currentLensIndex < lenses.length - 1 ? 'Next Lens' : 'Finish'}
					</Button>
				</div>
			</div>
		</div>
	{:else if phase === 'reflecting'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{totalIdeas}</span> ideas across
				<span class="count"
					>{Object.values(ideasByLens).filter((ideas) => ideas.length > 0).length}</span
				> lenses
			</div>

			<div class="reflection">
				<label class="reflection-label">
					Which lens felt most productive for you?
					<textarea class="reflection-input" bind:value={mostProductiveLens} rows="2"></textarea>
				</label>

				<label class="reflection-label">
					Did any lens surprise you with unexpected ideas?
					<textarea class="reflection-input" bind:value={surprises} rows="2"></textarea>
				</label>
			</div>

			<div class="done-actions">
				<Button onclick={prevLens}>Back</Button>
				<Button variant="primary" onclick={submitReflection} disabled={totalIdeas === 0}>
					Submit
				</Button>
			</div>
		</div>
	{:else if phase === 'submitted'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{totalIdeas}</span> ideas submitted
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

	.intro {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 32px 0;
		text-align: center;
	}

	.intro-title {
		font-family: var(--font-display);
		font-size: 3rem;
		color: var(--color-foreground);
		letter-spacing: 0.15em;
	}

	.intro-prompt {
		font-size: 1.1rem;
		color: var(--color-foreground);
	}

	.intro-desc {
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
		max-width: 480px;
	}

	.lens-header {
		text-align: center;
		margin-bottom: 8px;
	}

	.lens-label {
		font-family: var(--font-display);
		font-size: 1.8rem;
		color: var(--color-foreground);
		margin: 0;
	}

	.lens-question {
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
		margin: 4px 0 0;
	}

	.lens-context {
		font-size: 0.85rem;
		color: var(--color-muted-foreground);
		margin: 4px 0 0;
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

	.nav-buttons {
		display: flex;
		gap: 8px;
		margin-left: auto;
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
