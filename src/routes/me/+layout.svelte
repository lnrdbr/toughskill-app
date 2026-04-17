<script>
	import ListItem from '$lib/components/ListItem.svelte';
	import bulb from '$lib/assets/bulb.svg';
	let { children } = $props();
</script>

<div class="flex h-full flex-row">
	<ul
		class="flex h-full w-[20%] flex-col gap-2 border-r-4 border-gray-400 bg-gray-50 p-6 drop-shadow-lg"
	>
		<ListItem icon={bulb}>Creativity</ListItem>
		<ListItem href="">+</ListItem>
	</ul>
	<div class="h-full w-full p-20">
		{@render children()}
	</div>
</div>
