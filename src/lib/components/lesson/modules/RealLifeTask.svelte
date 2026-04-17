<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft } from '$lib/client/draft';

	let {
		moduleId,
		instruction,
		feedbackPrompt,
		returnAfterMinutes,
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		instruction: string;
		feedbackPrompt: string;
		returnAfterMinutes?: number;
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	type Phase = 'idle' | 'assigned' | 'feedback';
	type DraftShape = { startedAt: number };

	const draftKey = `ts:real_life_task:${courseId}:${lessonSlug}:${moduleId}`;
	const savedDraft = readDraft<DraftShape | null>(draftKey, null);

	let phase = $state<Phase>(savedDraft ? 'assigned' : 'idle');
	let startedAt = $state<number>(savedDraft?.startedAt ?? 0);
	let feedbackText = $state('');
	let starting = $state(false);
	let startError: string | null = $state(null);
	let submitting = $state(false);
	let submitted = $state(false);
	let submitError: string | null = $state(null);

	async function postSubmission(payload: Record<string, unknown>): Promise<void> {
		if (!courseId || !lessonSlug) return;
		const res = await fetch('/api/submissions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				moduleId,
				moduleType: 'real_life_task',
				courseId,
				lessonSlug,
				payload
			})
		});
		if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
	}

	async function startTask() {
		if (starting) return;
		starting = true;
		startError = null;
		try {
			await postSubmission({ state: 'started' });
			const now = Date.now();
			startedAt = now;
			writeDraft<DraftShape>(draftKey, { startedAt: now });
			phase = 'assigned';
		} catch (err) {
			startError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			starting = false;
		}
	}

	function openFeedback() {
		phase = 'feedback';
	}

	function cancelAssigned() {
		clearDraft(draftKey);
		startedAt = 0;
		feedbackText = '';
		phase = 'idle';
	}

	let trimmedFeedback = $derived(feedbackText.trim());
	let canSubmitFeedback = $derived(trimmedFeedback.length > 0 && !submitting);

	async function submitFeedback() {
		if (!canSubmitFeedback) return;
		submitting = true;
		submitError = null;
		const feedback = trimmedFeedback;
		const timeSpentSeconds =
			startedAt > 0 ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : 0;
		try {
			await postSubmission({
				state: 'completed',
				feedback,
				timeSpentSeconds
			});
			clearDraft(draftKey);
			submitted = true;

			// Background LLM feedback — surfaces on the lesson-complete screen.
			// Skipped in preview mode (no course/lesson) so Storybook and tests
			// don't hit a real LLM endpoint.
			const evaluationPromise =
				courseId && lessonSlug
					? fetch('/api/feedback/real-life-task', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								instruction,
								feedbackPrompt,
								feedbackText: feedback
							})
						}).then(async (res) => {
							if (!res.ok) throw new Error('Feedback failed');
							return res.json();
						})
					: null;

			oncomplete?.({
				feedback,
				charCount: feedback.length,
				timeSpentSeconds,
				...(evaluationPromise
					? {
							_evaluationPromise: evaluationPromise,
							_userBubbles: [feedback],
							_prompt: instruction
						}
					: {})
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="task" aria-labelledby="task-title">
	{#if phase === 'idle'}
		<div class="idle">
			<span class="badge">A real-life task</span>
			<h2 id="task-title" class="title">Your assignment</h2>
			<p class="instruction" data-testid="task-instruction">{instruction}</p>
			{#if typeof returnAfterMinutes === 'number' && returnAfterMinutes > 0}
				<p class="hint">Come back in about {returnAfterMinutes} minute{returnAfterMinutes === 1 ? '' : 's'} to share how it went.</p>
			{:else}
				<p class="hint">Come back when you've done it to share how it went.</p>
			{/if}
			{#if startError}
				<p class="error" role="alert">{startError}</p>
			{/if}
			<Button
				variant="primary"
				rounded="default"
				disabled={starting}
				onclick={startTask}
				data-testid="task-start"
			>
				{starting ? 'Starting…' : 'Start this task'}
			</Button>
		</div>
	{:else if phase === 'assigned'}
		<div class="assigned">
			<span class="badge">In progress</span>
			<h2 id="task-title" class="title">You're on it.</h2>
			<p class="instruction" data-testid="task-instruction">{instruction}</p>
			<p class="hint">When you're done, come back here and tell us how it went.</p>
			<Button
				variant="primary"
				rounded="default"
				onclick={openFeedback}
				data-testid="task-done"
			>
				I've done it
			</Button>
			<button
				type="button"
				class="cancel-link"
				onclick={cancelAssigned}
				data-testid="task-cancel"
			>
				Actually, cancel this task
			</button>
		</div>
	{:else}
		<div class="feedback">
			<h2 id="task-title" class="title">How did it go?</h2>
			<p class="prompt">{feedbackPrompt}</p>
			<textarea
				class="field"
				bind:value={feedbackText}
				placeholder="Write whatever comes to mind…"
				aria-label="Your feedback"
				rows="6"
				data-testid="task-feedback"
				disabled={submitting}
			></textarea>
			{#if submitError}
				<p class="error" role="alert">{submitError}</p>
			{/if}
			{#if !submitted}
				<div class="actions">
					<Button
						variant="primary"
						rounded="default"
						disabled={!canSubmitFeedback}
						onclick={submitFeedback}
						data-testid="task-submit"
					>
						{submitting ? 'Saving…' : 'Save feedback'}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style>
	.task {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		max-width: 32rem;
		margin: 0 auto;
		text-align: center;
	}

	.idle,
	.assigned,
	.feedback {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		width: 100%;
	}

	.badge {
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-primary-700);
		background: var(--color-primary-50);
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
	}

	.title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
		color: var(--color-foreground);
	}

	.instruction {
		margin: 0;
		font-size: 1.15rem;
		line-height: 1.5;
		color: var(--color-foreground);
		padding: 1rem 1.25rem;
		border: 2px solid var(--color-foreground);
		border-radius: 0.75rem;
		background: var(--color-background);
		filter: drop-shadow(3px 3px 0 var(--color-foreground));
	}

	.hint {
		margin: 0;
		font-size: 0.95rem;
		color: var(--color-muted-foreground);
	}

	.prompt {
		margin: 0;
		font-size: 1.1rem;
		line-height: 1.4;
		color: var(--color-foreground);
	}

	.field {
		width: 100%;
		min-height: 8rem;
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

	.field:focus {
		outline: none;
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0 var(--color-foreground));
	}

	.field:disabled {
		opacity: 0.6;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		width: 100%;
	}

	.cancel-link {
		background: none;
		border: none;
		color: var(--color-muted-foreground);
		font-size: 0.85rem;
		text-decoration: underline;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
	}

	.cancel-link:hover {
		color: var(--color-foreground);
	}

	.error {
		color: var(--color-error);
		font-weight: 600;
		margin: 0;
	}
</style>
