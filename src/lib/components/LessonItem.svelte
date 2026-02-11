
<script>
	let {number= "", href = "", title = "", description = "" } = $props();
</script>

	<a {href} class="lessonitem py-2 pl-10 text-secondary-700  bg-secondary-100 font-semibold flex flex-row gap-6 rounded-2xl w-full">
		<div class="text-8xl">{number}</div>
	<div class="py-2 ">
		<div class="text-2xl">{title}</div>
		<div>{description}</div>
		</div>
	</a>

<style>

.lessonitem{
		filter:  drop-shadow(2px 2px 2px rgba(0,0,0,0.1 ));
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
