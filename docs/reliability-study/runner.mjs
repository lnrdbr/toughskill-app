#!/usr/bin/env node
// Reliability study runner.
// Iterates (submission, prompt-variant, run) tuples against Mistral
// and appends one JSONL row per call to results.jsonl.
//
// Usage: node --env-file=../../.env runner.mjs
// Expects MISTRAL_API_KEY to be set in the process environment.

import { readFileSync, appendFileSync, existsSync, renameSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUBMISSIONS_PATH = resolve(__dirname, 'submissions.json');
const PROMPTS_PATH = resolve(__dirname, 'prompts.json');
const RESULTS_PATH = resolve(__dirname, 'results.jsonl');

const MODEL = 'mistral-small-latest';
const MAX_TOKENS = 256;
const RUNS_PER_PAIR = 3;
const API_URL = 'https://api.mistral.ai/v1/chat/completions';
const INTER_CALL_DELAY_MS = 400; // soft rate-limit buffer
const MAX_NETWORK_RETRIES = 3;

const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
	console.error('MISTRAL_API_KEY missing. Run with: node --env-file=../../.env runner.mjs');
	process.exit(1);
}

// Back up any existing results file before appending, so re-runs do not mix generations.
if (existsSync(RESULTS_PATH)) {
	const stamp = new Date().toISOString().replace(/[:.]/g, '-');
	const backup = RESULTS_PATH.replace(/\.jsonl$/, `.${stamp}.jsonl`);
	renameSync(RESULTS_PATH, backup);
	console.log(`Backed up existing results to ${backup}`);
}

const submissions = JSON.parse(readFileSync(SUBMISSIONS_PATH, 'utf-8'));
const prompts = JSON.parse(readFileSync(PROMPTS_PATH, 'utf-8'));

function buildUserContent(exerciseType, submission) {
	const cfg = prompts[exerciseType];
	const sharedPrompt = submissions[exerciseType].shared_prompt;
	if (exerciseType === 'divergent_thinking') {
		const numbered = submission.ideas.map((i, n) => `${n + 1}. ${i}`).join('\n');
		return cfg.P1_rubric.user_template
			.replace('{prompt}', sharedPrompt)
			.replace('{count}', submission.ideas.length)
			.replace('{numbered_ideas}', numbered);
	}
	return cfg.P1_rubric.user_template.replace('{prompt}', sharedPrompt).replace('{text}', submission.text);
}

function extractScores(exerciseType, parsed) {
	const fields = prompts[exerciseType].schema_fields;
	const out = {};
	let missing = [];
	for (const f of fields) {
		const v = parsed?.[f];
		if (typeof v !== 'number' || Number.isNaN(v)) {
			missing.push(f);
		} else {
			out[f] = v;
		}
	}
	return { scores: out, missing };
}

function stripFences(raw) {
	return String(raw ?? '')
		.replace(/^```(?:json)?\s*\n?/i, '')
		.replace(/\n?```\s*$/i, '')
		.trim();
}

async function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

async function callMistralOnce({ systemContent, userContent }) {
	const start = Date.now();
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			model: MODEL,
			max_tokens: MAX_TOKENS,
			messages: [
				{ role: 'system', content: systemContent },
				{ role: 'user', content: userContent }
			],
			response_format: { type: 'json_object' }
		}),
		signal: AbortSignal.timeout(30000)
	});
	const latencyMs = Date.now() - start;
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		return { ok: false, status: res.status, body, latencyMs };
	}
	const json = await res.json();
	return { ok: true, status: res.status, json, latencyMs };
}

async function callMistralWithRetries(args) {
	let lastErr = null;
	for (let attempt = 0; attempt < MAX_NETWORK_RETRIES; attempt++) {
		try {
			const r = await callMistralOnce(args);
			// Retry only on transient server/network responses; do NOT retry 4xx (including 400 bad JSON schema etc).
			if (r.ok) return r;
			if (r.status === 429 || (r.status >= 500 && r.status < 600)) {
				const wait = 800 * Math.pow(2, attempt);
				console.log(`  transient ${r.status}, backoff ${wait}ms`);
				await sleep(wait);
				lastErr = r;
				continue;
			}
			return r; // 4xx etc — return as-is, no retry
		} catch (e) {
			lastErr = { ok: false, status: 0, body: String(e?.message ?? e), latencyMs: 0 };
			const wait = 800 * Math.pow(2, attempt);
			console.log(`  network error, backoff ${wait}ms: ${lastErr.body}`);
			await sleep(wait);
		}
	}
	return lastErr;
}

async function runOne(exerciseType, submission, promptVariant, runIndex) {
	const cfg = prompts[exerciseType];
	const systemContent = cfg[promptVariant].system;
	const userContent = buildUserContent(exerciseType, submission);

	const row = {
		exerciseType,
		submissionId: submission.id,
		tier: submission.tier,
		promptVariant,
		runIndex,
		timestamp: new Date().toISOString(),
		model: MODEL
	};

	const r = await callMistralWithRetries({ systemContent, userContent });
	row.latencyMs = r?.latencyMs ?? 0;
	row.httpStatus = r?.status ?? 0;

	if (!r?.ok) {
		row.parseStatus = 'http_error';
		row.httpBody = (r?.body ?? '').slice(0, 500);
		return row;
	}

	const rawContent = r.json?.choices?.[0]?.message?.content ?? '';
	row.rawContent = rawContent;
	const stripped = stripFences(rawContent);
	let parsed;
	try {
		parsed = JSON.parse(stripped);
	} catch (e) {
		row.parseStatus = 'json_parse_error';
		row.parseError = String(e?.message ?? e);
		return row;
	}

	const { scores, missing } = extractScores(exerciseType, parsed);
	row.scores = scores;
	row.missingFields = missing;
	row.extraFields = Object.keys(parsed).filter((k) => !prompts[exerciseType].schema_fields.includes(k));
	if (missing.length > 0) {
		row.parseStatus = 'schema_incomplete';
	} else {
		row.parseStatus = 'ok';
	}
	return row;
}

async function main() {
	const tasks = [];
	for (const exerciseType of ['divergent_thinking', 'reflection']) {
		for (const submission of submissions[exerciseType].submissions) {
			for (const promptVariant of ['P1_rubric', 'P2_naive']) {
				for (let run = 1; run <= RUNS_PER_PAIR; run++) {
					tasks.push({ exerciseType, submission, promptVariant, run });
				}
			}
		}
	}

	console.log(`Total calls: ${tasks.length}`);
	let ok = 0;
	let fail = 0;
	for (let i = 0; i < tasks.length; i++) {
		const t = tasks[i];
		const label = `[${i + 1}/${tasks.length}] ${t.exerciseType}/${t.submission.id}/${t.promptVariant}/run${t.run}`;
		process.stdout.write(label + ' ... ');
		const row = await runOne(t.exerciseType, t.submission, t.promptVariant, t.run);
		appendFileSync(RESULTS_PATH, JSON.stringify(row) + '\n');
		if (row.parseStatus === 'ok') {
			ok++;
			process.stdout.write(`ok (${row.latencyMs}ms)\n`);
		} else {
			fail++;
			process.stdout.write(`${row.parseStatus} (${row.latencyMs}ms)\n`);
		}
		await sleep(INTER_CALL_DELAY_MS);
	}

	console.log(`\nDone. ok=${ok} fail=${fail} total=${tasks.length}`);
	console.log(`Results written to ${RESULTS_PATH}`);
}

main().catch((e) => {
	console.error('Fatal:', e);
	process.exit(2);
});
