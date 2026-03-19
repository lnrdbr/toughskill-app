import type { Component } from 'svelte';

const registry = {
	DivergentThinking: () => import('$lib/components/exercises/DivergentThinking.svelte')
} satisfies Record<string, () => Promise<{ default: Component }>>;

export type RegisteredModuleId = keyof typeof registry;

export function getModuleComponent(
	componentId: string
): (() => Promise<{ default: Component }>) | undefined {
	return (registry as Record<string, () => Promise<{ default: Component }>>)[componentId];
}

export function getRegisteredIds(): RegisteredModuleId[] {
	return Object.keys(registry) as RegisteredModuleId[];
}
