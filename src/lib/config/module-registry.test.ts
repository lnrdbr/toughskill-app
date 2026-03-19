import { describe, it, expect } from 'vitest';
import { getModuleComponent, getRegisteredIds } from './module-registry';

describe('getModuleComponent', () => {
	it('returns a loader for a registered componentId', () => {
		const loader = getModuleComponent('DivergentThinking');
		expect(loader).toBeTypeOf('function');
	});

	it('returns undefined for an unknown componentId', () => {
		expect(getModuleComponent('NonExistent')).toBeUndefined();
	});
});

describe('getRegisteredIds', () => {
	it('includes DivergentThinking', () => {
		const ids = getRegisteredIds();
		expect(ids).toContain('DivergentThinking');
	});
});
