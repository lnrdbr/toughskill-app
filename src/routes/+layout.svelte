<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';

	let { data, children } = $props();

	$effect(() => {
		if (!data.user) {
			authClient.signIn.anonymous().then(() => invalidateAll());
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>


<div class="layout">
		<div class="w-full border-b-2 p-5 bg-white drop-shadow-md border-gray-400">5🔥</div>
		<main class="content">
			{@render children()}
		</main>
</div>

<style>
	.layout {
		height: 100dvh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.content {
		flex: 1;
		overflow-y: auto;
	}
</style>
