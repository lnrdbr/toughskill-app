<script>
	let { children, icon = '', href = '' } = $props();
</script>

{#if icon}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- href is caller-resolved -->
	<a
		{href}
		class="listitem flex h-10 w-full flex-row gap-2 rounded-lg bg-secondary-100 py-2 pl-2 font-semibold text-secondary-700"
	>
		<div class="w-6"><img src={icon} alt="icon" /></div>
		<div>{@render children()}</div>
	</a>
{:else}
	<button
		class="listitem flex h-10 w-full flex-row justify-center gap-2 rounded-lg bg-secondary-100 py-2 pl-2 font-semibold text-secondary-700"
	>
		<div>{@render children()}</div>
	</button>
{/if}

<style>
	.listitem {
		filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.05));
	}
	/*
.button:hover{
		transform:translate(2px,2px);
		filter: drop-shadow(2px 2px 0px var(--color-primary-300));
		border-color: var(--color-primary-300);
		background-color: var(--color-primary-50);
		color: var(--color-primary-900);

}
.button:active{
		transform:translate(4px,4px);
		filter: drop-shadow(0px 0px 0px var(--color-primary-400));

		background-color: var(--color-primary-200);
		border-color: var(--color-primary-400);
}
*/
</style>
