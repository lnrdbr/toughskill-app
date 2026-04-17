<script lang="ts">
	import Icon from '@iconify/svelte';
	import ListItem from '$lib/components/ListItem.svelte';
	import bulb from '$lib/assets/bulb.svg';
	import type { Lesson } from '$lib/types/course';
	import DotPath from './DotPath.svelte';
	import ProgressPanel from './ProgressPanel.svelte';

	let { data } = $props();

	let sidebarOpen = $state(false);
	let selectedLesson: Lesson | null = $state(null);
</script>

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
		<div class="path-col">
			<div class="mb-2 grid grid-cols-[min-content_1fr] items-center gap-2">
				<span class="course-icon inline-flex h-16 w-16 items-center justify-center">
					{#if data.course?.icon}
						<Icon icon={data.course.icon} width="64" height="64" />
					{/if}
				</span>
				<h1 class="mb-2 text-left text-3xl font-bold">{data.course?.title ?? 'Course'}</h1>
				<p class="col-start-2 row-start-2 mb-12 text-left text-gray-500">
					{data.course?.description ?? ''}
				</p>
			</div>
			{#if data.course}
				<DotPath
					lessons={data.course.lessons}
					lessonProgress={data.lessonProgress}
					onSelect={(lesson) => (selectedLesson = lesson)}
				/>
			{/if}
		</div>

		<div class="progress-col">
			<ProgressPanel
				lessonProgress={data.lessonProgress}
				{selectedLesson}
				courseId={data.course?.id}
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
		border-right: 4px solid transparent;
		transition:
			border-color 0.3s ease,
			box-shadow 0.3s ease;
		box-shadow: none;
	}

	.learn-layout.open .sidebar {
		border-right-color: var(--color-secondary-300);
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
		grid-template-columns: minmax(0, 1fr) minmax(22rem, 28rem);
		gap: 3rem;
		padding: 3rem 2rem 3rem 4rem; /* extra left padding to clear toggle when closed */
	}

	.path-col {
		min-width: 0;
		max-width: 28rem;
		justify-self: end;
		width: 100%;
	}

	.progress-col {
		min-width: 0;
	}

	@media (max-width: 960px) {
		.main {
			grid-template-columns: 1fr;
			padding-left: 4rem;
		}
	}
</style>
