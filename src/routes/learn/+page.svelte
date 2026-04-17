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
	let courseHeaderEl: HTMLDivElement | undefined = $state();

	// Sticky offset for the progress panel — its initial distance from the top of
	// the scroll container, so it sticks at the same height as the start of the
	// DotPath instead of floating near the viewport top.
	let panelStickyTop = $state('1.5rem');
	$effect(() => {
		if (!courseHeaderEl) return;
		const update = () => {
			if (!courseHeaderEl) return;
			// .main has padding-top: 3rem (48px); the course header sits immediately
			// below that padding. The panel should pin where the header ends.
			panelStickyTop = `${48 + courseHeaderEl.offsetHeight}px`;
		};
		update();
		const ro = new ResizeObserver(update);
		ro.observe(courseHeaderEl);
		return () => ro.disconnect();
	});

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
		<div class="course-header" bind:this={courseHeaderEl}>
			<div class="mb-12 grid grid-cols-[min-content_1fr] items-center gap-2">
				<span class="course-icon inline-flex h-16 w-16 items-center justify-center">
					{#if data.course?.icon}
						<Icon icon={data.course.icon} width="64" height="64" />
					{/if}
				</span>
				<h1 class="text-left text-3xl font-bold">{data.course?.title ?? 'Course'}</h1>
			</div>
		</div>

		<div class="path-col" bind:this={pathColEl}>
			{#if data.course}
				<DotPath
					lessons={data.course.lessons}
					lessonProgress={data.lessonProgress}
					acts={data.course.acts ?? []}
					selectedSlug={selectedLesson?.slug ?? null}
					stickyTop={panelStickyTop}
					onSelect={(lesson) => (selectedLesson = lesson)}
					onStart={startLesson}
				/>
				{#if data.journeyStats}
					<JourneyFinisher stats={data.journeyStats} courseTitle={data.course.title} />
				{/if}
			{/if}
		</div>

		<div class="progress-col" bind:this={progressColEl}>
			<ProgressPanel
				lessons={data.course?.lessons ?? []}
				lessonProgress={data.lessonProgress}
				{selectedLesson}
				courseId={data.course?.id}
				courseDescription={data.course?.description ?? ''}
				stickyTop={panelStickyTop}
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
		grid-template-rows: auto 1fr;
		justify-content: center;
		column-gap: 3rem;
		padding: 3rem 2rem 3rem 4rem; /* extra left padding to clear toggle when closed */
	}

	.course-header {
		grid-column: 2;
		grid-row: 1;
		min-width: 0;
		width: 100%;
	}

	.path-col {
		grid-column: 2;
		grid-row: 2;
		min-width: 0;
		width: 100%;
	}

	.progress-col {
		grid-column: 3;
		grid-row: 2;
		min-width: 0;
	}

	@media (max-width: 1200px) {
		.main {
			grid-template-columns: minmax(0, 28rem) minmax(0, 24rem);
		}
		.course-header,
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
			grid-template-rows: auto auto auto;
			padding-left: 4rem;
		}
		.course-header,
		.path-col,
		.progress-col {
			grid-column: 1;
		}
		.course-header {
			grid-row: 1;
		}
		.path-col {
			grid-row: 2;
		}
		.progress-col {
			grid-row: 3;
		}
	}
</style>
