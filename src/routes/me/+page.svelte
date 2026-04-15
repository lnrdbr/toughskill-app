<script>
	import LessonItem from '$lib/components/LessonItem.svelte';
	import Cloudy from '$lib/assets/cloudy.png';
</script>

<h1 class="drop-shadow-lg drop-shadow-black/20">Creativity</h1>
<div class="grid columns-2 grid-cols-[1fr_1.3fr] gap-3">
	<div class="w-full rounded-2xl bg-secondary-100 p-10">
		<div class="flex">
			<div class="relative">
				<div class="relative size-52">
					<svg
						class="size-full -rotate-90 drop-shadow-lg"
						viewBox="0 0 36 36"
						xmlns="http://www.w3.org/2000/svg"
					>
						<!-- Background Circle -->
						<circle
							cx="18"
							cy="18"
							r="16"
							fill="none"
							class="stroke-current text-foreground/10"
							stroke-width="2"
						></circle>
						<!-- Progress Circle -->
						<circle
							cx="18"
							cy="18"
							r="16"
							fill="none"
							class="stroke-current text-primary-500"
							stroke-width="2"
							stroke-dasharray="100"
							stroke-dashoffset="65"
							stroke-linecap="round"
						></circle>
					</svg>

					<!-- Percentage Text -->
					<div class="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
						<span class="text-primary text-center text-4xl font-bold">35%</span>
					</div>
				</div>
			</div>
			<img src={Cloudy} alt="Cloudy" class="w-full object-contain drop-shadow-md" />
		</div>
		<div class="pt-5 font-light italic">
			"I'am proude of you! Keep doing What you do :) &#127882;"
		</div>
	</div>

	<div class="col-start-2 flex h-10 flex-col gap-10">
		<LessonItem
			number="1"
			href="/lesson"
			title="Preparation"
			description="You will lean how to bring your mind into the right setting, to have creative ideas!"
		/>
	</div>
</div>
