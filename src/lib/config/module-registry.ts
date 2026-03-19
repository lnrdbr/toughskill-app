import type { Component } from 'svelte';

const registry = {
	DivergentThinking: () => import('$lib/components/exercises/DivergentThinking.svelte')
} satisfies Record<string, () => Promise<{ default: Component }>>;

export type RegisteredModuleId = keyof typeof registry;

export function getModuleComponent(
	componentId: string
export function getModuleComponent(
	componentId: string
): (() => Promise<{ default: Component }>) | undefined {
	if (!Object.hasOwn(registry, componentId)) return undefined;
	return registry[componentId as RegisteredModuleId];
}
}

export function getRegisteredIds(): RegisteredModuleId[] {
	return Object.keys(registry) as RegisteredModuleId[];
}
