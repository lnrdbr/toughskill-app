<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReadingBlock from './ReadingBlock.svelte';

	const { Story } = defineMeta({
		title: 'Components/ReadingBlock',
		component: ReadingBlock,
		tags: ['autodocs']
	});
</script>

<Story
	name="Default"
	args={{
		content:
			"**Active listening** is the foundation of effective communication. Rather than waiting for your turn to speak, it requires full attention to the speaker's words, tone, and body language.\n\nKey practices include:\n\n- **Paraphrasing** what you heard back to the speaker\n- Asking **open-ended questions** to deepen understanding\n- Avoiding interruptions, even when you disagree\n\nResearch by [Rogers (1957)](https://en.wikipedia.org/wiki/Carl_Rogers) showed that empathic listening builds trust and reduces defensiveness in conversations."
	}}
/>

<Story
	name="Short Content"
	args={{
		content:
			'Creativity is not a talent reserved for artists. It is a **cognitive skill** that can be practised and developed through deliberate effort.'
	}}
/>
