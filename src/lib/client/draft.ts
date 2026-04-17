/**
 * Session-scoped draft storage for in-progress exercise input.
 *
 * Keyed by module id so a reload mid-task restores what the user was typing.
 * Drafts live in sessionStorage (per tab, cleared on tab close) — they are a
 * UX safety net, not a permanent store; persistent data still goes through
 * the /api/progress save path.
 */

function storage(): Storage | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

export function readDraft<T>(key: string, fallback: T): T {
	const s = storage();
	if (!s) return fallback;
	try {
		const raw = s.getItem(key);
		if (raw === null) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

export function writeDraft<T>(key: string, value: T): void {
	const s = storage();
	if (!s) return;
	try {
		s.setItem(key, JSON.stringify(value));
	} catch {
		// quota or serialization failure — silently drop
	}
}

export function clearDraft(key: string): void {
	const s = storage();
	if (!s) return;
	try {
		s.removeItem(key);
	} catch {
		// ignore
	}
}

export function draftKey(moduleId: string): string {
	return `ts:draft:${moduleId}`;
}
