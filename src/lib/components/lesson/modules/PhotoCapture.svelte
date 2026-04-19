<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { readDraft, writeDraft, clearDraft } from '$lib/client/draft';

	let {
		moduleId,
		prompt,
		captionPrompt = 'Give it a caption.',
		courseId = '',
		lessonSlug = '',
		oncomplete
	}: {
		moduleId: string;
		prompt: string;
		captionPrompt?: string;
		courseId?: string;
		lessonSlug?: string;
		oncomplete?: (data: Record<string, unknown>) => void;
	} = $props();

	type DraftShape = {
		photoDataUrl: string;
		width: number;
		height: number;
		caption: string;
	};

	const draftKey = `ts:photo:${courseId}:${lessonSlug}:${moduleId}`;
	const savedDraft = readDraft<DraftShape | null>(draftKey, null);

	let photoDataUrl = $state<string | null>(savedDraft?.photoDataUrl ?? null);
	let photoWidth = $state<number>(savedDraft?.width ?? 0);
	let photoHeight = $state<number>(savedDraft?.height ?? 0);
	let caption = $state<string>(savedDraft?.caption ?? '');
	let processing = $state(false);
	let processError: string | null = $state(null);
	let submitting = $state(false);
	let submitted = $state(false);
	let submitError: string | null = $state(null);

	const MAX_DIMENSION = 512;
	const JPEG_QUALITY = 0.85;

	async function resizeToDataUrl(
		file: File
	): Promise<{ dataUrl: string; width: number; height: number }> {
		const url = URL.createObjectURL(file);
		try {
			const img = await new Promise<HTMLImageElement>((resolve, reject) => {
				const el = new Image();
				el.onload = () => resolve(el);
				el.onerror = () => reject(new Error("We couldn't read that image."));
				el.src = url;
			});
			let w = img.naturalWidth || img.width;
			let h = img.naturalHeight || img.height;
			if (w === 0 || h === 0) throw new Error("We couldn't read that image.");
			if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
				if (w >= h) {
					h = Math.round((h * MAX_DIMENSION) / w);
					w = MAX_DIMENSION;
				} else {
					w = Math.round((w * MAX_DIMENSION) / h);
					h = MAX_DIMENSION;
				}
			}
			const canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error("We couldn't process that image.");
			ctx.drawImage(img, 0, 0, w, h);
			const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
			return { dataUrl, width: w, height: h };
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		processing = true;
		processError = null;
		try {
			const { dataUrl, width, height } = await resizeToDataUrl(file);
			photoDataUrl = dataUrl;
			photoWidth = width;
			photoHeight = height;
			persistDraft();
		} catch (err) {
			processError = err instanceof Error ? err.message : "We couldn't read that image.";
		} finally {
			processing = false;
			// Reset so the same file can trigger change again.
			input.value = '';
		}
	}

	function persistDraft() {
		if (!photoDataUrl) return;
		writeDraft<DraftShape>(draftKey, {
			photoDataUrl,
			width: photoWidth,
			height: photoHeight,
			caption
		});
	}

	$effect(() => {
		// Keep draft in sync with caption edits while a photo exists.
		if (photoDataUrl) persistDraft();
	});

	function retake() {
		photoDataUrl = null;
		photoWidth = 0;
		photoHeight = 0;
		caption = '';
		clearDraft(draftKey);
	}

	let trimmedCaption = $derived(caption.trim());
	let canSubmit = $derived(
		photoDataUrl !== null && trimmedCaption.length > 0 && !submitting && !processing
	);

	async function handleSubmit() {
		if (!canSubmit || !photoDataUrl) return;
		submitting = true;
		submitError = null;
		const captionText = trimmedCaption;
		try {
			if (courseId && lessonSlug) {
				const res = await fetch('/api/submissions', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						moduleId,
						moduleType: 'photo',
						courseId,
						lessonSlug,
						payload: {
							prompt,
							caption: captionText,
							photoDataUrl,
							width: photoWidth,
							height: photoHeight
						}
					})
				});
				if (!res.ok) throw new Error(`Submission failed: ${res.status}`);
			}
			clearDraft(draftKey);
			submitted = true;

			// Background LLM feedback on the caption — the photo isn't sent
			// to the LLM, the caption is the creative act we reflect on.
			// Skipped in preview mode (no course/lesson) so Storybook and tests
			// don't hit a real LLM endpoint.
			const evaluationPromise =
				courseId && lessonSlug
					? fetch('/api/feedback/photo', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ prompt, caption: captionText })
						}).then(async (res) => {
							if (!res.ok) throw new Error('Feedback failed');
							return res.json();
						})
					: null;

			oncomplete?.({
				caption: captionText,
				charCount: captionText.length,
				width: photoWidth,
				height: photoHeight,
				...(evaluationPromise
					? {
							_evaluationPromise: evaluationPromise,
							_userBubbles: [captionText],
							_prompt: prompt
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

<section class="photo" aria-labelledby="photo-title">
	<h2 id="photo-title" class="title">A photo task</h2>
	<p class="prompt" data-testid="photo-prompt">{prompt}</p>

	{#if !photoDataUrl}
		<label class="file-btn" data-testid="photo-pick">
			<input
				type="file"
				accept="image/*"
				capture="environment"
				onchange={handleFileChange}
				disabled={processing}
				data-testid="photo-input"
			/>
			<span>{processing ? 'Processing…' : 'Take or choose a photo'}</span>
		</label>
	{:else}
		<div class="preview">
			<img src={photoDataUrl} alt="" data-testid="photo-preview" />
		</div>
		<button type="button" class="retake-link" onclick={retake} data-testid="photo-retake">
			Use a different photo
		</button>

		<label class="caption-label" for="photo-caption">{captionPrompt}</label>
		<textarea
			id="photo-caption"
			class="field"
			bind:value={caption}
			placeholder="A line or two…"
			rows="3"
			data-testid="photo-caption"
			disabled={submitting}
		></textarea>
	{/if}

	{#if processError}
		<p class="error" role="alert">{processError}</p>
	{/if}
	{#if submitError}
		<p class="error" role="alert">{submitError}</p>
	{/if}

	{#if photoDataUrl && !submitted}
		<div class="actions">
			<Button
				variant="primary"
				rounded="default"
				disabled={!canSubmit}
				onclick={handleSubmit}
				data-testid="photo-submit"
			>
				{submitting ? 'Saving…' : 'Save photo'}
			</Button>
		</div>
	{/if}
</section>

<style>
	.photo {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		max-width: 32rem;
		margin: 0 auto;
		text-align: center;
	}

	.title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0;
		color: var(--color-foreground);
	}

	.prompt {
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

	.file-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.5rem;
		border: 2px solid var(--color-foreground);
		border-radius: var(--radius-button);
		/* primary-700 on white text → 4.84:1, passes WCAG AA; primary-500 was 2.48:1. */
		background: var(--color-primary-700);
		color: var(--color-background);
		font-weight: 700;
		cursor: pointer;
		filter: drop-shadow(4px 4px 0 var(--color-foreground));
		transition:
			transform 0.15s ease,
			filter 0.15s ease;
	}

	.file-btn:hover {
		transform: translate(1px, 1px);
		filter: drop-shadow(3px 3px 0 var(--color-foreground));
	}

	.file-btn input {
		display: none;
	}

	.preview {
		width: 100%;
		display: flex;
		justify-content: center;
		border: 2px solid var(--color-foreground);
		border-radius: 0.75rem;
		overflow: hidden;
		filter: drop-shadow(3px 3px 0 var(--color-foreground));
		background: var(--color-background);
	}

	.preview img {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.retake-link {
		background: none;
		border: none;
		color: var(--color-muted-foreground);
		font-size: 0.9rem;
		text-decoration: underline;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
	}

	.retake-link:hover {
		color: var(--color-foreground);
	}

	.caption-label {
		align-self: flex-start;
		font-size: 0.95rem;
		color: var(--color-foreground);
		font-weight: 600;
	}

	.field {
		width: 100%;
		min-height: 4rem;
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

	.error {
		color: var(--color-error);
		font-weight: 600;
		margin: 0;
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		width: 100%;
	}
</style>
