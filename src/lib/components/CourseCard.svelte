
<script>
	let { children } = $props();
</script>

<button class="coursecard py-2 px-4 border-2 grid columns-2  rounded-lg w-96 h-80">
		<div class="bg-amber-100 row-start-1 w-10 h-10"></div>

		<div class="row-start-1 col-start-2 bg-green-100">Title</div>
		<div class="row-start-2 col-start-2">{@render children()}</div>
</button>

<style>
.coursecard{
		filter:  drop-shadow(4px 4px 0px var(--color-foreground));
		transition: all 0.3s;
		background: var(--color-background);
		color: var(--color-foreground);
		border-color: var(--color-foreground);


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
