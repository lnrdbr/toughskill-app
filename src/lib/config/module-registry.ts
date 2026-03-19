import type { Component } from 'svelte';

const registry: Record<string, () => Promise<{ default: Component }>> = {
	DivergentThinking: () => import('$lib/components/exercises/DivergentThinking.svelte')
};

export function getModuleComponent(
	componentId: string
): (() => Promise<{ default: Component }>) | undefined {
	return registry[componentId];
}

export function getRegisteredIds(): string[] {
	return Object.keys(registry);
}
