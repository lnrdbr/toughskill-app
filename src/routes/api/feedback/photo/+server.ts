import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateJourneyFeedback } from '$lib/server/journey-feedback';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Not authenticated');
	}

	const body = (await request.json()) as { prompt?: string; caption?: string };
	const prompt = body.prompt?.trim() ?? '';
	const caption = body.caption?.trim() ?? '';

	if (!caption) {
		throw error(400, 'Missing caption');
	}

	// Photo data URL is not sent — Mistral doesn't see the image here. The
	// caption is the creative act we're reflecting on.
	const feedback = await generateJourneyFeedback({
		systemRole: `You read captions that a user wrote about an ordinary object they chose to photograph in their real environment. Celebrate what they noticed — the act of paying attention is the whole creative point. Reflect one specific word or observation from their caption back to them.`,
		userContent: `Prompt they were given: "${prompt}"\n\nTheir caption:\n${caption}`,
		fallback:
			'You stopped and looked at something most people would walk past. The caption shows that noticing — that is the whole exercise.'
	});

	return json({ evaluation: { feedback } });
};
