export interface ModuleBase {
	id: string;
	title: string;
	estimatedMinutes: number;
}

// ─── Component-backed modules (rendered via ModuleRunner + module-registry) ───

export interface ExerciseModule extends ModuleBase {
	type: 'exercise';
	componentId: string;
	config: Record<string, unknown>;
}

export interface LearningModule extends ModuleBase {
	type: 'learning';
	componentId: string;
	config: Record<string, unknown>;
}

export interface ResultsModule extends ModuleBase {
	type: 'results';
	componentId: string;
	config: Record<string, unknown>;
	sourceExerciseId: string;
}

// ─── Journey modules (rendered by dedicated per-type components) ───

export interface ReflectionModule extends ModuleBase {
	type: 'reflection';
	prompt: string;
	minLength?: number;
}

export interface RealLifeTaskModule extends ModuleBase {
	type: 'real_life_task';
	instruction: string;
	/** Minutes user must wait after starting before they can submit feedback. 0 = immediate. */
	returnAfterMinutes?: number;
	feedbackPrompt: string;
}

export interface MeditationModule extends ModuleBase {
	type: 'meditation';
	durationSeconds: number;
	style: 'breathing' | 'silence';
}

export interface PhoneFreeModule extends ModuleBase {
	type: 'phone_free';
	durationSeconds: number;
}

export interface PhotoModule extends ModuleBase {
	type: 'photo';
	prompt: string;
	captionPrompt?: string;
}

export type ChoiceOption = { id: string; label: string; body?: string };

export interface ChoiceModule extends ModuleBase {
	type: 'choice';
	prompt: string;
	options: ChoiceOption[];
	allowMultiple?: boolean;
}

export type RecallMode = 'finish-quote' | 'open-recall' | 'multi-check';

export interface RecallModule extends ModuleBase {
	type: 'recall';
	prompt: string;
	referenceLessonSlug?: string;
	mode: RecallMode;
	/** For 'finish-quote': the expected completion. For 'open-recall': optional hint. */
	expected?: string;
	/** For 'multi-check': selectable options. */
	options?: string[];
}

export interface IntroModule extends ModuleBase {
	type: 'intro';
	body: string;
}

// ─── Unions + guards ───

export type ComponentModule = ExerciseModule | LearningModule | ResultsModule;

export type JourneyModule =
	| ReflectionModule
	| RealLifeTaskModule
	| MeditationModule
	| PhoneFreeModule
	| PhotoModule
	| ChoiceModule
	| RecallModule
	| IntroModule;

export type Module = ComponentModule | JourneyModule;

/** True for modules rendered via the component registry (carry `componentId` + `config`). */
export function isComponentModule(module: Module): module is ComponentModule {
	return module.type === 'exercise' || module.type === 'learning' || module.type === 'results';
}

// Back-compat alias — older code imported `BaseModule`.
export type BaseModule = ModuleBase;

// ─── Lesson / Course ───

export interface Lesson {
	id: string;
	title: string;
	slug: string;
	description: string;
	icon: string;
	modules: Module[];
	estimatedMinutes: number;
}

export interface Act {
	title: string;
	/** Slug of the lesson that opens this act; used by DotPath to render the act header. */
	startLessonSlug: string;
}

export interface Course {
	id: string;
	title: string;
	slug: string;
	description: string;
	icon: string;
	color: string;
	lessons: Lesson[];
	/** Optional narrative acts, in order. Each entry points at the lesson that starts the act. */
	acts?: Act[];
}

export interface ModuleCompletionResult {
	moduleId: string;
	completedAt: string;
	data: Record<string, unknown>;
}
