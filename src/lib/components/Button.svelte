<script>
	let { children } = $props();
</script>

<button class="button py-2 px-4 border-2 rounded-lg ">
		{@render children()}
</button>


<style>
.button{
		filter:  drop-shadow(4px 4px 0px var(--color-foreground));
		transition: all 0.3s;
		background: var(--color-background);
		color: var(--color-foreground);
		border-color: var(--color-foreground);


}
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

</style>
