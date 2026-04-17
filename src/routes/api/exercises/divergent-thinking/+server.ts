import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { exerciseSubmission } from '$lib/server/db/schema';
import { mistral } from '$lib/server/llm';
import { eq, ne, and } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();
	const { ideas, reflections, timeSpentSeconds, prompt } = body as {
		ideas: string[];
		reflections: { surprisingIdea: string; patterns: string };
		timeSpentSeconds: number;
		prompt: string;
	};

	if (!ideas?.length || !prompt) {
		error(400, 'Missing required fields');
	}

	const userId = locals.user?.id;
	if (!userId) {
		error(401, 'Not authenticated');
	}

	// Save to DB
	const [{ id: submissionId }] = await db
		.insert(exerciseSubmission)
		.values({
			userId,
			exerciseType: 'divergent_thinking',
			prompt,
			ideas,
			reflections,
			timeSpentSeconds
		})
		.returning({ id: exerciseSubmission.id });

	// LLM evaluation
	const evaluation = await evaluateWithLLM(prompt, ideas);

	// Update submission with evaluation
	await db
		.update(exerciseSubmission)
		.set({ evaluation })
		.where(eq(exerciseSubmission.id, submissionId));

	// Fetch community ideas
	const others = await db
		.select({ ideas: exerciseSubmission.ideas })
		.from(exerciseSubmission)
		.where(
			and(
				eq(exerciseSubmission.prompt, prompt),
				eq(exerciseSubmission.exerciseType, 'divergent_thinking'),
				ne(exerciseSubmission.userId, userId)
			)
		);

	const userIdeasLower = new Set(ideas.map((i) => i.toLowerCase().trim()));
	const allOtherIdeas = others
		.flatMap((r) => r.ideas as string[])
		.filter((idea) => !userIdeasLower.has(idea.toLowerCase().trim()));

	// Deduplicate and sample ~10
	const unique = [...new Set(allOtherIdeas.map((i) => i.trim()))];
	const communityIdeas = shuffle(unique).slice(0, 10);

	return json({ evaluation, communityIdeas });
};

async function evaluateWithLLM(
	prompt: string,
	ideas: string[]
): Promise<{
	fluency: number;
	flexibility: number;
	originality: number;
	elaboration: number;
	feedback: string;
	suggestions: string[];
}> {
	const response = await mistral.chat.complete({
		model: 'mistral-small-latest',
		maxTokens: 768,
		messages: [
			{
				role: 'system',
				content: `You evaluate divergent thinking exercises based on Guilford's model. Given a prompt and a list of ideas, score them on three dimensions (1-10 each): flexibility (variety of categories), originality (uncommonness/creativity), elaboration (detail/development). Also provide 2-3 sentences of constructive, encouraging feedback. Also provide 3-5 "suggestions" — creative ideas the user did NOT think of, to inspire them. Respond in JSON only with this exact shape: {"flexibility": number, "originality": number, "elaboration": number, "feedback": "string", "suggestions": ["idea1", "idea2", ...]}`
			},
			{
				role: 'user',
				content: `Prompt: "${prompt}"\n\nIdeas (${ideas.length} total):\n${ideas.map((i, n) => `${n + 1}. ${i}`).join('\n')}`
			}
		],
		responseFormat: { type: 'json_object' }
	});

	const content = response.choices?.[0]?.message?.content;
	const raw = typeof content === 'string' ? content : '';
	const text = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
	const parsed = JSON.parse(text);

	return {
		fluency: ideas.length,
		flexibility: clamp(parsed.flexibility, 1, 10),
		originality: clamp(parsed.originality, 1, 10),
		elaboration: clamp(parsed.elaboration, 1, 10),
		feedback: parsed.feedback,
		suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : []
	};
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n));
}

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
