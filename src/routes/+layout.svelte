<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>


<div class="h-screen">
		<div class="w-screen border-b-2 p-5 bg-white drop-shadow-md border-gray-400">5🔥</div>
		{@render children()}
</div>
