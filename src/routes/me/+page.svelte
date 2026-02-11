<script>
	import LessonItem from "$lib/components/LessonItem.svelte";

</script>
<h1 class="drop-shadow-lg drop-shadow-black/20">Creativity</h1>
<div class="grid columns-2 grid-cols-[1fr_1.3fr] gap-3">
<div class="w-full bg-secondary-100 rounded-2xl p-10 ">

<div class="relative size-52">
  <svg class="size-full -rotate-90 drop-shadow-lg" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
    <!-- Background Circle -->
    <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-foreground/10" stroke-width="2"></circle>
    <!-- Progress Circle -->
    <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-primary-500" stroke-width="2" stroke-dasharray="100" stroke-dashoffset="65" stroke-linecap="round"></circle>
  </svg>

  <!-- Percentage Text -->
  <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
    <span class="text-center text-4xl font-bold text-primary">35%</span>
  </div>
</div>

<div class="italic pt-5 font-light">"I'am proude of you! Keep doing What you do :) &#127882;"</div>
</div>


<div class="flex-col flex gap-10 h-10 col-start-2">

		<LessonItem number="1" title="Preparation" description="You will lean how to bring your mind into the right setting, to have creative ideas!"/>
</div>
</div>
