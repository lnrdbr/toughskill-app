import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { exerciseSubmission } from '$lib/server/db/schema';
import { mistral } from '$lib/server/llm';
import { eq } from 'drizzle-orm';
import type { StoryBuilderEvaluation } from '$lib/components/exercises/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();
	const { story, reflections, timeSpentSeconds, prompt } = body as {
		story: string;
		reflections: { approach: string };
		timeSpentSeconds: number;
		prompt: string;
	};

	if (!story?.trim() || !prompt) {
		throw error(400, 'Missing required fields');
	}

	const userId = locals.user?.id;
	if (!userId) {
		throw error(401, 'Not authenticated');
	}

	const [{ id: submissionId }] = await db
		.insert(exerciseSubmission)
		.values({
			userId,
			exerciseType: 'story_builder',
			prompt,
			ideas: [story],
			reflections,
			timeSpentSeconds
		})
		.returning({ id: exerciseSubmission.id });

	const evaluation = await evaluateWithLLM(prompt, story);

	await db
		.update(exerciseSubmission)
		.set({ evaluation: evaluation as unknown as Record<string, unknown> })
		.where(eq(exerciseSubmission.id, submissionId));

	return json({ evaluation });
};

async function evaluateWithLLM(prompt: string, story: string): Promise<StoryBuilderEvaluation> {
	const response = await mistral.chat.complete({
		model: 'mistral-small-latest',
		maxTokens: 512,
		messages: [
			{
				role: 'system',
				content: `You evaluate creative writing exercises. Given a scenario seed and a written response, score on three dimensions (1-10 each):
- originality: How unexpected or novel is the response?
- detail: How vivid and specific is the writing?
- coherence: Does the response hold together logically?
Also provide 2-3 sentences of constructive, encouraging feedback focused on strengths and one area to develop. Also provide 3-5 "suggestions" — alternative angles, details, or directions the writer could have explored.
Respond in JSON only: {"originality": number, "detail": number, "coherence": number, "feedback": "string", "suggestions": ["idea1", ...]}`
			},
			{
				role: 'user',
				content: `Scenario seed: "${prompt}"\n\nResponse:\n${story}`
			}
		],
		responseFormat: { type: 'json_object' }
	});

	const content = response.choices?.[0]?.message?.content;
	const raw = typeof content === 'string' ? content : '';
	const text = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');

	let parsed: StoryBuilderEvaluation;
	try {
		parsed = JSON.parse(text);
	} catch {
		return {
			originality: 5,
			detail: 5,
			coherence: 5,
			feedback:
				'Great effort with your creative writing! Keep experimenting with vivid details and unexpected angles.',
			suggestions: []
		};
	}

	return {
		originality: clamp(parsed.originality, 1, 10),
		detail: clamp(parsed.detail, 1, 10),
		coherence: clamp(parsed.coherence, 1, 10),
		feedback: parsed.feedback,
		suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : []
	};
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}
