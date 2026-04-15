import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { exerciseSubmission } from '$lib/server/db/schema';
import { anthropic } from '$lib/server/llm';
import { eq, ne, and } from 'drizzle-orm';
import type { ScamperEvaluation } from '$lib/components/exercises/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();
	const { ideasByLens, reflections, timeSpentSeconds, prompt } = body as {
		ideasByLens: Record<string, string[]>;
		reflections: { mostProductiveLens: string; surprises: string };
		timeSpentSeconds: number;
		prompt: string;
	};

	const allIdeas = Object.values(ideasByLens).flat();
	if (!allIdeas.length || !prompt) {
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
			exerciseType: 'scamper',
			prompt,
			ideas: ideasByLens,
			reflections,
			timeSpentSeconds
		})
		.returning({ id: exerciseSubmission.id });

	// LLM evaluation
	const evaluation = await evaluateWithLLM(prompt, ideasByLens);

	// Update submission with evaluation
	await db
		.update(exerciseSubmission)
		.set({ evaluation: evaluation as unknown as Record<string, unknown> })
		.where(eq(exerciseSubmission.id, submissionId));

	// Fetch community ideas
	const others = await db
		.select({ ideas: exerciseSubmission.ideas })
		.from(exerciseSubmission)
		.where(
			and(
				eq(exerciseSubmission.prompt, prompt),
				eq(exerciseSubmission.exerciseType, 'scamper'),
				ne(exerciseSubmission.userId, userId)
			)
		);

	const userIdeasLower = new Set(allIdeas.map((i) => i.toLowerCase().trim()));
	const allOtherIdeas = others
		.flatMap((r) => {
			const ideas = r.ideas;
			if (Array.isArray(ideas)) return ideas;
			return Object.values(ideas as Record<string, string[]>).flat();
		})
		.filter((idea) => !userIdeasLower.has(idea.toLowerCase().trim()));

	const unique = [...new Set(allOtherIdeas.map((i) => i.trim()))];
	const communityIdeas = shuffle(unique).slice(0, 10);

	return json({ evaluation, communityIdeas });
};

async function evaluateWithLLM(
	prompt: string,
	ideasByLens: Record<string, string[]>
): Promise<ScamperEvaluation> {
	const engagedLenses = Object.entries(ideasByLens).filter(([, ideas]) => ideas.length > 0);
	const breadth = engagedLenses.length;
	const depth =
		engagedLenses.length > 0
			? Math.round(
					(engagedLenses.reduce((sum, [, ideas]) => sum + ideas.length, 0) / engagedLenses.length) *
						10
				) / 10
			: 0;

	const lensText = Object.entries(ideasByLens)
		.filter(([, ideas]) => ideas.length > 0)
		.map(([lens, ideas]) => `${lens}:\n${ideas.map((i, n) => `  ${n + 1}. ${i}`).join('\n')}`)
		.join('\n\n');

	const message = await anthropic.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 768,
		system: `You evaluate SCAMPER creativity exercises. Given a prompt and ideas grouped by SCAMPER lens, provide:
- originality (1-10): How unusual and creative are the ideas?
- practicality (1-10): How actionable and feasible are the ideas?
- lensAgility (1-10): How well did the thinker shift perspective between lenses? Low if ideas repeat themes across lenses; high if each lens produced distinct thinking.
- lensHighlights: For each lens that has ideas, write one brief encouraging sentence highlighting what went well.
- feedback: 2-3 sentences of overall constructive, positive feedback focused on growth and strengths.

Respond in JSON only: {"originality": number, "practicality": number, "lensAgility": number, "lensHighlights": {"substitute": "...", ...}, "feedback": "..."}`,
		messages: [
			{
				role: 'user',
				content: `Prompt: "${prompt}"\n\n${lensText}`
			}
		]
	});

	const raw = message.content[0].type === 'text' ? message.content[0].text : '';
	const text = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
	const parsed = JSON.parse(text);

	return {
		breadth,
		depth,
		originality: clamp(parsed.originality, 1, 10),
		practicality: clamp(parsed.practicality, 1, 10),
		lensAgility: clamp(parsed.lensAgility, 1, 10),
		feedback: parsed.feedback,
		lensHighlights: parsed.lensHighlights ?? {}
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
