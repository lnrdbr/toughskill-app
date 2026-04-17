<script lang="ts">
	import type { StoryBuilderSubmissionResponse } from './types.ts';
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft, draftKey } from '$lib/client/draft';

	let {
		moduleId = '',
		prompt = '',
		instruction = '',
		minWords = 80,
		maxWords = 200,
		oncomplete = undefined as ((result: Record<string, unknown>) => void) | undefined
	} = $props();

	type Draft = {
		story: string;
		phase: 'input' | 'reflecting' | 'submitted';
		reflection: string;
	};

	const storageKey = moduleId ? draftKey(moduleId) : '';
	const initial: Draft | null = storageKey
		? readDraft<Draft | null>(storageKey, null)
		: null;

	let phase: 'input' | 'reflecting' | 'submitted' = $state(initial?.phase ?? 'input');
	let story = $state(initial?.story ?? '');
	let startTime = $state(Date.now());
	let reflection = $state(initial?.reflection ?? '');

	$effect(() => {
		if (!storageKey) return;
		if (phase === 'submitted') {
			clearDraft(storageKey);
			return;
		}
		writeDraft<Draft>(storageKey, {
			story,
			phase,
			reflection
		});
	});

	let wordCount = $derived(
		story
			.trim()
			.split(/\s+/)
			.filter((w) => w.length > 0).length
	);
	let withinRange = $derived(wordCount >= minWords && wordCount <= maxWords);
	let overLimit = $derived(wordCount > maxWords);

	function finish() {
		phase = 'reflecting';
	}

	function submitReflection() {
		const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
		const reflections = { approach: reflection };

		phase = 'submitted';

		const evaluationPromise = fetch('/api/exercises/story-builder', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ story, reflections, timeSpentSeconds, prompt })
		}).then(async (res) => {
			if (!res.ok) throw new Error('Evaluation failed');
			return res.json() as Promise<StoryBuilderSubmissionResponse>;
		});

		oncomplete?.({
			story,
			wordCount,
			timeSpentSeconds,
			reflections,
			_evaluationPromise: evaluationPromise,
			_userBubbles: [story],
			_prompt: prompt
		});
	}
</script>

<div class="exercise">
	{#if phase === 'input'}
		<div class="seed">
			<p class="seed-text">{prompt}</p>
		</div>
		<p class="instruction">{instruction}</p>

		<div class="editor">
			<textarea
				class="story-input"
				bind:value={story}
				rows="8"
				placeholder="Start writing..."
			></textarea>
			<div class="word-count" class:valid={withinRange} class:over={overLimit}>
				{wordCount} / {minWords}–{maxWords} words
			</div>
		</div>

		<div class="actions">
			<Button onclick={finish} disabled={!withinRange}>I'm Done</Button>
		</div>
	{:else if phase === 'reflecting'}
		<div class="done-screen">
			<div class="summary">
				<span class="count">{wordCount}</span> words written
			</div>

			<div class="story-preview">
				<p>{story}</p>
			</div>

			<div class="reflection">
				<label class="reflection-label">
					What made your approach unique?
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
				<span class="count">{wordCount}</span> words submitted
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

	.seed {
		background: var(--color-primary-50);
		border: 2px solid var(--color-primary-200);
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 12px;
		filter: drop-shadow(3px 3px 0px var(--color-primary-200));
	}

	.seed-text {
		font-size: 1.1rem;
		font-style: italic;
		color: var(--color-foreground);
		line-height: 1.5;
		margin: 0;
		text-align: center;
	}

	.instruction {
		text-align: center;
		color: var(--color-muted-foreground);
		font-size: 0.95rem;
		margin-bottom: 16px;
	}

	.editor {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.story-input {
		width: 100%;
		padding: 16px;
		border: 2px solid var(--color-foreground);
		border-radius: 12px;
		background: var(--color-background);
		color: var(--color-foreground);
		font-size: 0.95rem;
		line-height: 1.6;
		resize: vertical;
		outline: none;
		filter: drop-shadow(3px 3px 0px var(--color-foreground));
		font-family: inherit;
	}

	.story-input:focus {
		border-color: var(--color-primary-400);
		filter: drop-shadow(3px 3px 0px var(--color-primary-400));
	}

	.word-count {
		text-align: right;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-muted-foreground);
	}

	.word-count.valid {
		color: var(--color-success);
	}

	.word-count.over {
		color: var(--color-error);
	}

	.actions {
		display: flex;
		justify-content: center;
		margin-top: 12px;
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

	.story-preview {
		background: var(--color-primary-50);
		border-radius: 8px;
		padding: 16px;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--color-foreground);
	}

	.story-preview p {
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
