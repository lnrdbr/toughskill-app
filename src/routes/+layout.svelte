<script lang="ts">
	import './layout.css';
	import '$lib/icons';
	import favicon from '$lib/assets/CloudyFavicon.png';
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

<svelte:head>
	<title>toughskill</title>
	<link rel="icon" type="image/png" href={favicon} />
</svelte:head>

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
		overscroll-behavior: none;
	}
</style>
