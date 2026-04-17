import { describe, it, expect, beforeEach } from 'vitest';
import { readDraft, writeDraft, clearDraft, draftKey } from './draft';

describe('draft storage', () => {
	beforeEach(() => {
		// sessionStorage is provided by happy-dom / jsdom / node in vitest's default
		// server environment; wipe between tests.
		if (typeof window !== 'undefined') window.sessionStorage?.clear();
	});

	it('returns the fallback when no draft is stored', () => {
		expect(readDraft('missing', { a: 1 })).toEqual({ a: 1 });
	});

	it('round-trips a draft through write/read', () => {
		writeDraft('k', { text: 'hello', count: 3 });
		expect(readDraft('k', null)).toEqual({ text: 'hello', count: 3 });
	});

	it('returns the fallback after clear', () => {
		writeDraft('k', { gone: true });
		clearDraft('k');
		expect(readDraft('k', { gone: false })).toEqual({ gone: false });
	});

	it('builds a namespaced key for a module', () => {
		expect(draftKey('paperclip-challenge')).toBe('ts:draft:paperclip-challenge');
	});

	it('falls back gracefully when the value is corrupt JSON', () => {
		if (typeof window !== 'undefined') {
			window.sessionStorage.setItem('corrupt', '{{not json');
		}
		expect(readDraft('corrupt', 'fallback')).toBe('fallback');
	});
});
