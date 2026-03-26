<script lang="ts">
	import Icon from '@iconify/svelte';
	import DotPath from './DotPath.svelte';

	let { data } = $props();
</script>

<div class="mx-auto max-w-lg px-6 py-12">
	<div class="flex">
	<div class="flex items-center gap-2 mb-2">
		{#if data.course?.icon}
			<Icon icon={data.course.icon} width="32" height="32" />
		{/if}
		<div>
			<h1 class="mb-2 text-left text-3xl font-bold">{data.course?.title ?? 'Course'}</h1>
			<p class="mb-12 text-left text-gray-500">{data.course?.description ?? ''}</p>
		</div>
	</div>
			<p class="mb-12 text-left text-gray-500">{data.course?.description ?? ''}</p>
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
