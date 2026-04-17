/**
 * Session-scoped cache for per-exercise evaluation responses.
 *
 * The lesson player fires a background /api/exercises/* request when a user
 * submits an exercise; the resulting evaluation is normally held only in the
 * in-memory `pendingEvaluations` store. If the user reloads before (or after)
 * the Results module renders, the promise is lost and the feedback card shows
 * "No evaluation data available."
 *
 * This module persists resolved/rejected evaluations to sessionStorage so the
 * lesson page can re-seed `pendingEvaluations` on mount. sessionStorage is
 * tab-scoped and clears on tab close, matching the draft lifetime.
 */

import type { AnySubmissionResponse } from '$lib/components/exercises/types';

const KEY_PREFIX = 'ts:evaluation:';

type CachedEvaluation =
	| { kind: 'result'; result: AnySubmissionResponse; userIdeas: unknown; prompt: string }
	| { kind: 'error'; error: string; userIdeas: unknown; prompt: string };

function storage(): Storage | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

export function evaluationKey(exerciseModuleId: string): string {
	return `${KEY_PREFIX}${exerciseModuleId}`;
}

export function saveEvaluationResult(
	exerciseModuleId: string,
	result: AnySubmissionResponse,
	userIdeas: unknown,
	prompt: string
): void {
	const s = storage();
	if (!s) return;
	try {
		const payload: CachedEvaluation = { kind: 'result', result, userIdeas, prompt };
		s.setItem(evaluationKey(exerciseModuleId), JSON.stringify(payload));
	} catch {
		// quota or serialization failure — silently drop
	}
}

export function saveEvaluationError(
	exerciseModuleId: string,
	error: string,
	userIdeas: unknown,
	prompt: string
): void {
	const s = storage();
	if (!s) return;
	try {
		const payload: CachedEvaluation = { kind: 'error', error, userIdeas, prompt };
		s.setItem(evaluationKey(exerciseModuleId), JSON.stringify(payload));
	} catch {
		// ignore
	}
}

export function loadEvaluation(exerciseModuleId: string): CachedEvaluation | null {
	const s = storage();
	if (!s) return null;
	try {
		const raw = s.getItem(evaluationKey(exerciseModuleId));
		if (raw === null) return null;
		return JSON.parse(raw) as CachedEvaluation;
	} catch {
		return null;
	}
}

export function clearEvaluation(exerciseModuleId: string): void {
	const s = storage();
	if (!s) return;
	try {
		s.removeItem(evaluationKey(exerciseModuleId));
	} catch {
		// ignore
	}
}

/** Return every cached evaluation id currently in sessionStorage. */
export function listCachedEvaluationIds(): string[] {
	const s = storage();
	if (!s) return [];
	const ids: string[] = [];
	try {
		for (let i = 0; i < s.length; i++) {
			const k = s.key(i);
			if (k && k.startsWith(KEY_PREFIX)) {
				ids.push(k.slice(KEY_PREFIX.length));
			}
		}
	} catch {
		// ignore
	}
	return ids;
}
