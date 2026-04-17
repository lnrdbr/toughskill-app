import type { Component } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = Component<any>;

const registry = {
	DivergentThinking: () => import('$lib/components/exercises/DivergentThinking.svelte'),
	Scamper: () => import('$lib/components/exercises/Scamper.svelte'),
	StoryBuilder: () => import('$lib/components/exercises/StoryBuilder.svelte'),
	ConstraintChallenge: () => import('$lib/components/exercises/ConstraintChallenge.svelte'),
	AnalogySprint: () => import('$lib/components/exercises/AnalogySprint.svelte'),
	ReadingBlock: () => import('$lib/components/ReadingBlock.svelte'),
	ExerciseResults: () => import('$lib/components/exercises/ExerciseResults.svelte')
} satisfies Record<string, () => Promise<{ default: AnyComponent }>>;

export type RegisteredModuleId = keyof typeof registry;

export function getModuleComponent(
	componentId: string
): (() => Promise<{ default: AnyComponent }>) | undefined {
	if (!Object.hasOwn(registry, componentId)) return undefined;
	return registry[componentId as RegisteredModuleId];
}

export function getRegisteredIds(): RegisteredModuleId[] {
	return Object.keys(registry) as RegisteredModuleId[];
}
