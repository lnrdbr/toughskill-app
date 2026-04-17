import { describe, it, expect, beforeEach } from 'vitest';
import {
	saveEvaluationResult,
	saveEvaluationError,
	loadEvaluation,
	clearEvaluation,
	evaluationKey,
	listCachedEvaluationIds
} from './evaluation-cache';
import type { SubmissionResponse } from '$lib/components/exercises/types';

describe('evaluation cache', () => {
	beforeEach(() => {
		if (typeof window !== 'undefined') window.sessionStorage?.clear();
	});

	const sampleResult: SubmissionResponse = {
		evaluation: {
			fluency: 5,
			flexibility: 4,
			originality: 3,
			elaboration: 2,
			feedback: 'Good ideas',
			suggestions: ['try more']
		},
		communityIdeas: ['idea1', 'idea2']
	};

	it('returns null for a module with no cached evaluation', () => {
		expect(loadEvaluation('missing')).toBeNull();
	});

	it('round-trips a successful result', () => {
		saveEvaluationResult('m1', sampleResult, ['a', 'b'], 'Paperclip');
		const loaded = loadEvaluation('m1');
		expect(loaded).toEqual({
			kind: 'result',
			result: sampleResult,
			userIdeas: ['a', 'b'],
			prompt: 'Paperclip'
		});
	});

	it('round-trips a failure', () => {
		saveEvaluationError('m2', 'API down', ['x'], 'Brick');
		const loaded = loadEvaluation('m2');
		expect(loaded).toEqual({
			kind: 'error',
			error: 'API down',
			userIdeas: ['x'],
			prompt: 'Brick'
		});
	});

	it('clears a cached evaluation', () => {
		saveEvaluationResult('m3', sampleResult, [], '');
		clearEvaluation('m3');
		expect(loadEvaluation('m3')).toBeNull();
	});

	it('namespaces the storage key', () => {
		expect(evaluationKey('abc')).toBe('ts:evaluation:abc');
	});

	it('lists cached ids', () => {
		saveEvaluationResult('m4', sampleResult, [], '');
		saveEvaluationResult('m5', sampleResult, [], '');
		const ids = listCachedEvaluationIds().sort();
		expect(ids).toEqual(['m4', 'm5']);
	});
});
