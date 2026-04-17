<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft } from '$lib/client/draft';
	import type { RecallMode } from '$lib/types/course';

	let {
		moduleId,
		prompt,
		mode,
		expected,
		options = [],
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		prompt: string;
		mode: RecallMode;
		expected?: string;
		options?: string[];
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	type DraftShape = string | string[];

	const draftKey = `ts:recall:${courseId}:${lessonSlug}:${moduleId}`;

	const savedDraft = readDraft<DraftShape | null>(draftKey, null);

	let textAnswer = $state<string>(
		typeof savedDraft === 'string' ? savedDraft : ''
	);
	let selected = $state<string[]>(Array.isArray(savedDraft) ? savedDraft : []);
	let submitted = $state(false);
	let matched = $state<boolean | null>(null);
	let submitting = $state(false);
	let submitError: string | null = $state(null);
	let startedAt = $state(Date.now());

	$effect(() => {
		if (mode === 'multi-check') {
			if (selected.length === 0) clearDraft(draftKey);
			else writeDraft<DraftShape>(draftKey, selected);
		} else {
			if (textAnswer.length === 0) clearDraft(draftKey);
			else writeDraft<DraftShape>(draftKey, textAnswer);
		}
	});

	function normalize(s: string): string {
		return s
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, '')
			.replace(/\s+/g, ' ')
			.trim();
	}

	function compareToExpected(userAnswer: string, exp: string): boolean {
		const a = normalize(userAnswer);
		const b = normalize(exp);
		if (a.length === 0) return false;
		return a === b;
	}

	function toggleOption(opt: string) {
		if (submitting || submitted) return;
		selected = selected.includes(opt)
			? selected.filter((s) => s !== opt)
			: [...selected, opt];
	}

	let trimmedAnswer = $derived(textAnswer.trim());
	let canSubmit = $derived(
		!submitting &&
			!submitted &&
			(mode === 'multi-check' ? selected.length > 0 : trimmedAnswer.length > 0)
	);

	async function handleSubmit() {
		if (!canSubmit) return;
		submitting = true;
		submitError = null;
		const timeSpentSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

		let payload: Record<string, unknown>;
		let completionData: Record<string, unknown>;

		if (mode === 'finish-quote') {
			const userAnswer = trimmedAnswer;
			const didMatch = expected ? compareToExpected(userAnswer, expected) : false;
			matched = didMatch;
			payload = {
				mode,
				userAnswer,
				matched: didMatch,
				expected: expected ?? null
			};
			completionData = {
				mode,
				userAnswer,
				matched: didMatch,
				timeSpentSeconds
			};
		} else if (mode === 'open-recall') {
			const userAnswer = trimmedAnswer;
			payload = {
				mode,
				userAnswer
			};
			completionData = {
				mode,
				userAnswer,
				charCount: userAnswer.length,
				timeSpentSeconds
			};
		} else {
			const picked = [...selected];
			payload = {
				mode,
				selected: picked
			};
			completionData = {
				mode,
				selected: picked,
				timeSpentSeconds
			};
		}

		try {
			if (courseId && lessonSlug) {
				const res = await fetch('/api/submissions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						moduleId,
						moduleType: 'recall',
						courseId,
						lessonSlug,
						payload
					})
				});
				if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
			}
			submitted = true;
			clearDraft(draftKey);
			oncomplete?.(completionData);
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="recall" aria-labelledby="recall-prompt">
	<p id="recall-prompt" class="prompt">{prompt}</p>

	{#if mode === 'finish-quote'}
		<input
			class="field single"
			type="text"
			bind:value={textAnswer}
			placeholder="Finish the line…"
			aria-label="Your answer"
			data-testid="recall-input"
			disabled={submitting || submitted}
		/>
	{:else if mode === 'open-recall'}
		<textarea
			class="field"
			bind:value={textAnswer}
			placeholder="Whatever you remember…"
			aria-label="Your answer"
			rows="4"
			data-testid="recall-input"
			disabled={submitting || submitted}
		></textarea>
	{:else}
		<ul class="options">
			{#each options as opt (opt)}
				{@const picked = selected.includes(opt)}
				<li>
					<button
						type="button"
						class="option"
						class:picked
						onclick={() => toggleOption(opt)}
						role="checkbox"
						aria-checked={picked}
						data-testid="recall-option"
						disabled={submitting || submitted}
					>
						{opt}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if submitted && mode === 'finish-quote'}
		<div class="feedback" data-testid="recall-feedback">
			{#if matched}
				<p class="match">You remembered it.</p>
			{:else if expected}
				<p class="miss">Close. We had: <strong>{expected}</strong></p>
			{:else}
				<p class="match">Saved.</p>
			{/if}
		</div>
	{:else if submitted && mode === 'open-recall' && expected}
		<div class="feedback" data-testid="recall-feedback">
			<p class="hint-label">What we said:</p>
			<p class="hint-body">{expected}</p>
		</div>
	{:else if submitted && mode === 'multi-check'}
		<div class="feedback" data-testid="recall-feedback">
			<p class="match">Nice — {selected.length} checked.</p>
		</div>
	{/if}

	{#if submitError}
		<p class="error" role="alert">{submitError}</p>
	{/if}

	{#if !submitted}
		<div class="actions">
			<Button
				variant="primary"
				rounded="default"
				disabled={!canSubmit}
				onclick={handleSubmit}
				data-testid="recall-submit"
			>
				{submitting ? 'Saving…' : 'Save'}
			</Button>
		</div>
	{/if}
</section>

<style>
	.recall {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 36rem;
		margin: 0 auto;
	}

	.prompt {
		font-size: 1.2rem;
		line-height: 1.4;
		color: var(--color-foreground);
		margin: 0;
	}

	.field {
		width: 100%;
		padding: 0.75rem 1rem;
		font: inherit;
		color: var(--color-foreground);
		background: var(--color-background);
		border: 2px solid var(--color-foreground);
		border-radius: 0.75rem;
		filter: drop-shadow(2px 2px 0 var(--color-foreground));
		resize: vertical;
		transition:
			transform 0.15s ease,
			filter 0.15s ease;
	}

	.field.single {
		resize: none;
	}

	.field:focus {
		outline: none;
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0 var(--color-foreground));
	}

	.field:disabled {
		opacity: 0.6;
	}

	.options {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.option {
		width: 100%;
		padding: 0.7rem 1rem;
		font: inherit;
		text-align: left;
		color: var(--color-foreground);
		background: var(--color-background);
		border: 2px solid var(--color-foreground);
		border-radius: 0.75rem;
		cursor: pointer;
		filter: drop-shadow(2px 2px 0 var(--color-foreground));
		transition:
			transform 0.15s ease,
			filter 0.15s ease,
			background-color 0.15s ease;
	}

	.option:hover:not(:disabled) {
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0 var(--color-foreground));
	}

	.option.picked {
		background: var(--color-primary-100);
		transform: translate(2px, 2px);
		filter: drop-shadow(0 0 0 var(--color-foreground));
	}

	.option:disabled {
		cursor: default;
	}

	.feedback {
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--color-primary-500) 10%, transparent);
		border: 1px solid var(--color-primary-500);
	}

	.feedback p {
		margin: 0;
	}

	.match {
		color: var(--color-primary-700);
		font-weight: 600;
	}

	.miss {
		color: var(--color-foreground);
	}

	.hint-label {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-muted-foreground);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 0.25rem !important;
	}

	.hint-body {
		color: var(--color-foreground);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}

	.error {
		color: var(--color-error);
		font-weight: 600;
		margin: 0;
	}
</style>
