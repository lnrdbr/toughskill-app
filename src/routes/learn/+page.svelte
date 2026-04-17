<script lang="ts">
	import Icon from '@iconify/svelte';
	import ListItem from '$lib/components/ListItem.svelte';
	import bulb from '$lib/assets/bulb.svg';
	import type { Lesson } from '$lib/types/course';
	import DotPath from './DotPath.svelte';
	import ProgressPanel from './ProgressPanel.svelte';
	import JourneyFinisher from './JourneyFinisher.svelte';

	let { data } = $props();

	let sidebarOpen = $state(false);
	let selectedLesson: Lesson | null = $state(null);

	let pathColEl: HTMLDivElement | undefined = $state();
	let progressColEl: HTMLDivElement | undefined = $state();

	// The DotPath's sticky act headings pin at the very top of the scroll
	// container; their own top padding provides the visible offset, and their
	// opaque background extends up to the scroll edge to hide dots behind them.
	const pathStickyTop = '0';

	function startLesson(lesson: Lesson) {
		if (!data.course) return;
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '/lesson';
		form.style.display = 'none';

		const courseInput = document.createElement('input');
		courseInput.type = 'hidden';
		courseInput.name = 'courseId';
		courseInput.value = data.course.id;
		form.appendChild(courseInput);

		const slugInput = document.createElement('input');
		slugInput.type = 'hidden';
		slugInput.name = 'lessonSlug';
		slugInput.value = lesson.slug;
		form.appendChild(slugInput);

		document.body.appendChild(form);
		form.submit();
	}

	// Outside-click: clicking anywhere that isn't inside the DotPath or the ProgressPanel
	// deselects the currently-selected lesson.
	$effect(() => {
		const handler = (e: MouseEvent) => {
			if (!selectedLesson) return;
			const target = e.target as Node | null;
			if (!target) return;
			if (pathColEl?.contains(target)) return;
			if (progressColEl?.contains(target)) return;
			selectedLesson = null;
		};
		document.addEventListener('click', handler);
		return () => document.removeEventListener('click', handler);
	});
</script>

<svelte:head>
	<title>toughskill | {data.course?.title ?? 'Learn'}</title>
</svelte:head>

<div class="learn-layout" class:open={sidebarOpen}>
	<button
		type="button"
		class="toggle"
		aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
		aria-expanded={sidebarOpen}
		aria-controls="learn-sidebar"
		onclick={() => (sidebarOpen = !sidebarOpen)}
		data-testid="sidebar-toggle"
	>
		<Icon icon={sidebarOpen ? 'mdi:menu-open' : 'mdi:menu'} width="22" height="22" />
	</button>

	<aside
		id="learn-sidebar"
		class="sidebar"
		aria-hidden={!sidebarOpen}
		inert={!sidebarOpen}
		data-testid="sidebar"
	>
		<ul class="course-list">
			<li><ListItem href="/learn" icon={bulb}>Creativity</ListItem></li>
			<li><ListItem href="">+</ListItem></li>
		</ul>
	</aside>

	<div class="main">
		<div class="path-col" bind:this={pathColEl}>
			{#if data.course}
				<DotPath
					lessons={data.course.lessons}
					lessonProgress={data.lessonProgress}
					acts={data.course.acts ?? []}
					selectedSlug={selectedLesson?.slug ?? null}
					stickyTop={pathStickyTop}
					onSelect={(lesson) => (selectedLesson = lesson)}
					onStart={startLesson}
				/>
				{#if data.journeyStats}
					<JourneyFinisher stats={data.journeyStats} courseTitle={data.course.title} />
				{/if}
			{/if}
		</div>

		<div class="progress-col" bind:this={progressColEl}>
			<div class="course-header">
				<div class="mb-6 grid grid-cols-[min-content_1fr] items-center gap-2">
					<span class="course-icon inline-flex h-16 w-16 items-center justify-center">
						{#if data.course?.icon}
							<Icon icon={data.course.icon} width="64" height="64" />
						{/if}
					</span>
					<h1 class="text-left text-3xl font-bold">{data.course?.title ?? 'Course'}</h1>
				</div>
			</div>
			<ProgressPanel
				lessons={data.course?.lessons ?? []}
				lessonProgress={data.lessonProgress}
				{selectedLesson}
				courseId={data.course?.id}
				courseDescription={data.course?.description ?? ''}
				stickyTop="0"
			/>
		</div>
	</div>
</div>

<style>
	.learn-layout {
		display: grid;
		grid-template-columns: 0 minmax(0, 1fr);
		min-height: 100%;
		transition: grid-template-columns 0.3s ease;
		position: relative;
	}

	.learn-layout.open {
		grid-template-columns: 16rem minmax(0, 1fr);
	}

	.toggle {
		grid-column: 1 / -1;
		grid-row: 1;
		position: sticky;
		top: 0.75rem;
		z-index: 30;
		justify-self: start;
		align-self: start;
		margin: 0.75rem;
		width: 2.5rem;
		height: 2.5rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: var(--color-background);
		color: var(--color-foreground);
		border: 2px solid var(--color-foreground);
		border-radius: 0.5rem;
		cursor: pointer;
		filter: drop-shadow(2px 2px 0px var(--color-foreground));
		transition:
			transform 0.2s,
			filter 0.2s;
	}

	.toggle:hover {
		transform: translate(1px, 1px);
		filter: drop-shadow(1px 1px 0px var(--color-foreground));
		background: var(--color-primary-50);
	}

	.toggle:active {
		transform: translate(2px, 2px);
		filter: drop-shadow(0 0 0 var(--color-foreground));
	}

	.sidebar {
		grid-column: 1;
		grid-row: 1;
		position: sticky;
		top: 0;
		align-self: start;
		/* 4rem approximates the top navbar so the sidebar fills the remaining viewport exactly. */
		height: calc(100dvh - 4rem);
		overflow-y: auto;
		overflow-x: hidden;
		background: var(--color-secondary-50);
		transition: box-shadow 0.3s ease;
		box-shadow: none;
	}

	.learn-layout.open .sidebar {
		box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
	}

	.course-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 4rem 1rem 1rem; /* top padding clears the toggle button */
		min-width: 16rem;
		list-style: none;
		margin: 0;
	}

	.main {
		grid-column: 2;
		grid-row: 1;
		display: grid;
		/* Mirror column widths so the path column (center) sits dead-centered
		   in the viewport and the progress panel sits right next to it. */
		grid-template-columns: minmax(0, 14rem) minmax(0, 28rem) minmax(0, 24rem);
		justify-content: center;
		column-gap: 3rem;
		padding: 3rem 2rem 3rem 4rem; /* extra left padding to clear toggle when closed */
	}

	.path-col {
		grid-column: 2;
		min-width: 0;
		width: 100%;
	}

	.progress-col {
		grid-column: 3;
		min-width: 0;
		/* Pin the whole right-hand column (course header + progress panel) as a
		   single sticky block. align-self: start keeps progress-col at the
		   natural height of its content so sticky has room to travel through
		   the taller path column beside it. */
		position: sticky;
		top: 1.5rem;
		align-self: start;
		z-index: 6;
		background: var(--color-background);
	}

	.course-header {
		min-width: 0;
		width: 100%;
	}

	@media (max-width: 1200px) {
		.main {
			grid-template-columns: minmax(0, 28rem) minmax(0, 24rem);
		}
		.path-col {
			grid-column: 1;
		}
		.progress-col {
			grid-column: 2;
		}
	}

	@media (max-width: 960px) {
		.main {
			grid-template-columns: minmax(0, 28rem);
			grid-template-rows: auto auto;
			padding-left: 4rem;
		}
		.path-col,
		.progress-col {
			grid-column: 1;
		}
		.progress-col {
			grid-row: 1;
		}
		.path-col {
			grid-row: 2;
		}
	}
</style>
