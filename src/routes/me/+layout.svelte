<script>
	import ListItem from "$lib/components/ListItem.svelte";
	import bulb from '$lib/assets/bulb.svg'
let {children} = $props();
</script>

<div class="h-full flex flex-row">
<ul class="w-[20%] h-full p-6 bg-gray-50 flex flex-col gap-2  border-r-4 border-gray-400 drop-shadow-lg ">
		<ListItem icon={bulb}>Creativity</ListItem>
		<ListItem href="">+</ListItem>

</ul>
<div class="p-20 w-full h-full">
{@render children()}
</div>
</div>
