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

export interface ScamperLensConfig {
	key: string;
	letter: string;
	label: string;
	question: string;
}

export interface ScamperEvaluation {
	breadth: number;
	depth: number;
	originality: number;
	practicality: number;
	lensAgility: number;
	feedback: string;
	lensHighlights: Record<string, string>;
}

export interface ScamperSubmissionResponse {
	evaluation: ScamperEvaluation;
	communityIdeas: string[];
}

export interface PendingEvaluation {
	promise: Promise<SubmissionResponse | ScamperSubmissionResponse>;
	result?: SubmissionResponse | ScamperSubmissionResponse;
	error?: string;
	userIdeas: string[] | Record<string, string[]>;
	prompt: string;
}

/** Shared evaluation store — plain object, no proxy, no context */
export const pendingEvaluations: Record<string, PendingEvaluation> = {};
