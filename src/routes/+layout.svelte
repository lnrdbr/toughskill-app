<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import Navbar from '$lib/components/Navbar.svelte';

	let { data, children } = $props();

	$effect(() => {
		if (!data.user) {
			authClient.signIn.anonymous().then(() => invalidateAll());
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="layout">
	<Navbar user={data.user} />
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
