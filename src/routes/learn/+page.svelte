<script lang="ts">
	import Icon from '@iconify/svelte';
	import DotPath from './DotPath.svelte';

	let { data } = $props();
</script>

<div class="mx-auto max-w-lg px-6 py-12">
	<div class="flex">
		<div class="mb-2 grid grid-cols-[min-content_1fr] items-center gap-2">
			{#if data.course?.icon}
				<Icon icon={data.course.icon} width="64" height="64" />
			{/if}
			<h1 class="mb-2 text-left text-3xl font-bold">{data.course?.title ?? 'Course'}</h1>
			<p class="mb-12 text-left text-gray-500 row-start-2 col-start-2">{data.course?.description ?? ''}</p>
		</div>
	</div>
	{#if data.course}
		<DotPath
			lessons={data.course.lessons}
			lessonProgress={data.lessonProgress}
			courseId={data.course.id}
		/>
	{/if}
</div>
