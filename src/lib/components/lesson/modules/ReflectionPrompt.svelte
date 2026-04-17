<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft } from '$lib/client/draft';

	let {
		moduleId,
		prompt,
		minLength = 0,
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		prompt: string;
		minLength?: number;
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	const draftKey = `ts:reflection:${courseId}:${lessonSlug}:${moduleId}`;
	let text = $state(readDraft<string>(draftKey, ''));
	let submitting = $state(false);
	let submitError: string | null = $state(null);
	let startedAt = $state(Date.now());

	// Persist draft on every change so nothing is lost to reload.
	$effect(() => {
		writeDraft(draftKey, text);
	});

	let trimmedLength = $derived(text.trim().length);
	let canSubmit = $derived(trimmedLength >= Math.max(minLength, 1) && !submitting);

	async function handleSubmit() {
		if (!canSubmit) return;
		submitting = true;
		submitError = null;
		const trimmed = text.trim();
		try {
			if (courseId && lessonSlug) {
				const res = await fetch('/api/submissions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						moduleId,
						moduleType: 'reflection',
						courseId,
						lessonSlug,
						payload: { text: trimmed }
					})
				});
				if (!res.ok) {
					throw new Error(`Submission failed: ${res.status}`);
				}
			}
			clearDraft(draftKey);
			const timeSpentSeconds = Math.round((Date.now() - startedAt) / 1000);
			oncomplete?.({
				text: trimmed,
				charCount: trimmed.length,
				timeSpentSeconds
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="reflection" aria-labelledby="reflection-prompt">
	<p id="reflection-prompt" class="prompt">{prompt}</p>

	<textarea
		class="field"
		bind:value={text}
		placeholder="Write whatever comes to mind…"
		aria-label="Your reflection"
		rows="6"
		data-testid="reflection-input"
		disabled={submitting}
	></textarea>

	<div class="meta">
		{#if minLength > 0}
			<span class="count" class:met={trimmedLength >= minLength} data-testid="char-count">
				{trimmedLength} / {minLength} characters
			</span>
		{:else}
			<span class="count" data-testid="char-count">{trimmedLength} characters</span>
		{/if}
		{#if submitError}
			<span class="error" role="alert">{submitError}</span>
		{/if}
	</div>

	<div class="actions">
		<Button
			variant="primary"
			rounded="default"
			disabled={!canSubmit}
			onclick={handleSubmit}
			data-testid="reflection-submit"
		>
			{submitting ? 'Saving…' : 'Save reflection'}
		</Button>
	</div>
</section>

<style>
	.reflection {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 36rem;
		margin: 0 auto;
	}

	.prompt {
		font-size: 1.25rem;
		line-height: 1.4;
		color: var(--color-foreground);
		margin: 0;
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

	.meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.85rem;
		color: var(--color-muted-foreground);
	}

	.count.met {
		color: var(--color-primary-700);
		font-weight: 600;
	}

	.error {
		color: var(--color-error);
		font-weight: 600;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}
</style>
