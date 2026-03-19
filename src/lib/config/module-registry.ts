import type { Component } from 'svelte';

const registry = {
	DivergentThinking: () => import('$lib/components/exercises/DivergentThinking.svelte')
} satisfies Record<string, () => Promise<{ default: Component }>>;

export type RegisteredModuleId = keyof typeof registry;

export function getModuleComponent(
	componentId: RegisteredModuleId
): (() => Promise<{ default: Component }>) | undefined {
	return registry[componentId];
}

export function getRegisteredIds(): RegisteredModuleId[] {
	return Object.keys(registry) as RegisteredModuleId[];
}
