<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft } from '$lib/client/draft';
	import type { ChoiceOption } from '$lib/types/course';

	let {
		moduleId,
		prompt,
		options,
		allowMultiple = false,
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		prompt: string;
		options: ChoiceOption[];
		allowMultiple?: boolean;
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	const draftKey = `ts:choice:${courseId}:${lessonSlug}:${moduleId}`;
	let selected = $state<string[]>(readDraft<string[]>(draftKey, []));
	let submitting = $state(false);
	let submitted = $state(false);
	let submitError: string | null = $state(null);

	// Persist selection on every change.
	$effect(() => {
		if (selected.length === 0) clearDraft(draftKey);
		else writeDraft<string[]>(draftKey, selected);
	});

	function toggle(id: string) {
		if (submitting || submitted) return;
		if (allowMultiple) {
			selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
		} else {
			selected = selected[0] === id ? [] : [id];
			// Single-select: a pick is the submit. No separate Continue click.
			if (selected.length > 0) {
				handleSubmit();
			}
		}
	}

	function isSelected(id: string): boolean {
		return selected.includes(id);
	}

	let canSubmit = $derived(selected.length > 0 && !submitting);

	async function handleSubmit() {
		if (!canSubmit) return;
		submitting = true;
		submitError = null;
		const selectedIds = [...selected];
		const selectedLabels = selectedIds
			.map((id) => options.find((o) => o.id === id)?.label ?? id)
			.filter((l): l is string => typeof l === 'string');
		try {
			if (courseId && lessonSlug) {
				const res = await fetch('/api/submissions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						moduleId,
						moduleType: 'choice',
						courseId,
						lessonSlug,
						payload: {
							prompt,
							selectedIds,
							selectedLabels
						}
					})
				});
				if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
			}
			clearDraft(draftKey);
			submitted = true;
			oncomplete?.({
				selectedIds,
				selectedLabels
			});
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Something went wrong.';
		} finally {
			submitting = false;
		}
	}
</script>

<section class="choice" aria-labelledby="choice-prompt">
	<p id="choice-prompt" class="prompt">{prompt}</p>

	<div
		class="options"
		role={allowMultiple ? 'group' : 'radiogroup'}
		aria-labelledby="choice-prompt"
	>
		{#each options as option (option.id)}
			{@const picked = isSelected(option.id)}
			<button
				type="button"
				class="option"
				class:picked
				onclick={() => toggle(option.id)}
				role={allowMultiple ? 'checkbox' : 'radio'}
				aria-checked={picked}
				data-testid="choice-option-{option.id}"
				disabled={submitting}
			>
				<span class="label">{option.label}</span>
				{#if option.body && picked}
					<span class="body" data-testid="choice-body-{option.id}">{option.body}</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if submitError}
		<p class="error" role="alert">{submitError}</p>
	{/if}

	{#if !submitted && allowMultiple}
		<div class="actions">
			<Button
				variant="primary"
				rounded="default"
				disabled={!canSubmit}
				onclick={handleSubmit}
				data-testid="choice-submit"
			>
				{submitting ? 'Saving…' : 'Continue'}
			</Button>
		</div>
	{/if}
</section>

<style>
	.choice {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 36rem;
		margin: 0 auto;
	}

	.prompt {
		font-size: 1.25rem;
		line-height: 1.4;
		color: var(--color-foreground);
		margin: 0;
		text-align: center;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.option {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		padding: 0.9rem 1.1rem;
		font: inherit;
		text-align: left;
		color: var(--color-foreground);
		background: var(--color-background);
		border: 2px solid var(--color-foreground);
		border-radius: 0.75rem;
		cursor: pointer;
		filter: drop-shadow(3px 3px 0 var(--color-foreground));
		transition:
			transform 0.15s ease,
			filter 0.15s ease,
			background-color 0.15s ease;
	}

	.option:hover:not(:disabled) {
		transform: translate(1px, 1px);
		filter: drop-shadow(2px 2px 0 var(--color-foreground));
	}

	.option.picked {
		background: var(--color-primary-100);
		transform: translate(2px, 2px);
		filter: drop-shadow(1px 1px 0 var(--color-foreground));
	}

	.option:disabled {
		opacity: 0.6;
		cursor: default;
	}

	.label {
		font-weight: 600;
		font-size: 1rem;
	}

	.body {
		font-size: 0.9rem;
		color: var(--color-muted-foreground);
		line-height: 1.4;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}

	.error {
		color: var(--color-error);
		font-weight: 600;
		margin: 0;
		text-align: center;
	}
</style>
