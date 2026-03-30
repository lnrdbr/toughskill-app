export interface BubbleData {
	id: string;
	text: string;
	color: string;
}

export interface ExerciseResult {
	ideas: string[];
	timeSpentSeconds: number;
	reflections: {
		surprisingIdea: string;
		patterns: string;
	};
}

export interface GuilfordEvaluation {
	fluency: number;
	flexibility: number;
	originality: number;
	elaboration: number;
	feedback: string;
}

export interface SubmissionResponse {
	evaluation: GuilfordEvaluation;
	communityIdeas: string[];
}

export interface PendingEvaluation {
	promise: Promise<SubmissionResponse>;
	result?: SubmissionResponse;
	error?: string;
	userIdeas: string[];
	prompt: string;
}

/** Shared evaluation store — plain object, no proxy, no context */
export const pendingEvaluations: Record<string, PendingEvaluation> = {};
