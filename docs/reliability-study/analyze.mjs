#!/usr/bin/env node
// Analysis of reliability-study results.
// Reads results.jsonl, computes:
//   - Test-retest reliability (MAD across 3 runs), per (exercise, dimension, prompt)
//   - Criterion validity (Spearman rho between LLM mean score and pre-registered tier rank)
//   - Tier separation (Kruskal-Wallis H, non-parametric ANOVA across tiers)
//   - Parse failure rate and failure-mode taxonomy
//   - Emits a machine-readable metrics.json and three SVG figures
//
// Usage: node analyze.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RESULTS = resolve(__dirname, 'results.jsonl');
const PROMPTS = JSON.parse(readFileSync(resolve(__dirname, 'prompts.json'), 'utf-8'));
const METRICS_OUT = resolve(__dirname, 'metrics.json');

const rows = readFileSync(RESULTS, 'utf-8')
	.split('\n')
	.filter((l) => l.trim())
	.map((l) => JSON.parse(l));

// ─── helpers ──────────────────────────────────────────────────────────────────
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const median = (xs) => {
	const s = [...xs].sort((a, b) => a - b);
	const n = s.length;
	if (n === 0) return NaN;
	return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const percentile = (xs, p) => {
	const s = [...xs].sort((a, b) => a - b);
	if (s.length === 0) return NaN;
	const idx = Math.ceil((p / 100) * s.length) - 1;
	return s[Math.max(0, Math.min(s.length - 1, idx))];
};
const mad = (xs) => {
	const m = mean(xs);
	return mean(xs.map((x) => Math.abs(x - m)));
};

// Fractional ranks (average method) for Spearman/Kruskal-Wallis.
function ranks(xs) {
	const indexed = xs.map((v, i) => ({ v, i }));
	indexed.sort((a, b) => a.v - b.v);
	const r = new Array(xs.length);
	let i = 0;
	while (i < indexed.length) {
		let j = i;
		while (j + 1 < indexed.length && indexed[j + 1].v === indexed[i].v) j++;
		const avg = (i + j + 2) / 2; // 1-indexed rank average
		for (let k = i; k <= j; k++) r[indexed[k].i] = avg;
		i = j + 1;
	}
	return r;
}

function pearson(xs, ys) {
	const mx = mean(xs);
	const my = mean(ys);
	let num = 0;
	let dx2 = 0;
	let dy2 = 0;
	for (let i = 0; i < xs.length; i++) {
		const dx = xs[i] - mx;
		const dy = ys[i] - my;
		num += dx * dy;
		dx2 += dx * dx;
		dy2 += dy * dy;
	}
	if (dx2 === 0 || dy2 === 0) return NaN;
	return num / Math.sqrt(dx2 * dy2);
}

function spearman(xs, ys) {
	return pearson(ranks(xs), ranks(ys));
}

// Kruskal-Wallis H for k groups.
function kruskalWallis(groups) {
	const all = [];
	const groupOf = [];
	groups.forEach((g, gi) =>
		g.forEach((v) => {
			all.push(v);
			groupOf.push(gi);
		})
	);
	const rs = ranks(all);
	const N = all.length;
	const sums = new Array(groups.length).fill(0);
	for (let i = 0; i < rs.length; i++) sums[groupOf[i]] += rs[i];
	let H = 0;
	for (let g = 0; g < groups.length; g++) H += (sums[g] * sums[g]) / groups[g].length;
	H = (12 / (N * (N + 1))) * H - 3 * (N + 1);
	// Rough p-value via chi-squared critical thresholds (df = k-1)
	return { H, df: groups.length - 1 };
}

// Chi-squared critical thresholds for df=2 (our case: 3 tiers).
const CHI2_THRESH_DF2 = [
	{ alpha: 0.001, crit: 13.816 },
	{ alpha: 0.01, crit: 9.21 },
	{ alpha: 0.05, crit: 5.991 }
];
function pApproxChi2Df2(H) {
	for (const { alpha, crit } of CHI2_THRESH_DF2) {
		if (H >= crit) return `< ${alpha}`;
	}
	return '>= 0.05';
}

// t critical for df=10 (n=12) used in Spearman significance approximation.
const T_THRESH_DF10 = [
	{ alpha: 0.001, crit: 4.587 },
	{ alpha: 0.01, crit: 3.169 },
	{ alpha: 0.05, crit: 2.228 }
];
function pApproxTDf10(t) {
	const abs = Math.abs(t);
	for (const { alpha, crit } of T_THRESH_DF10) {
		if (abs >= crit) return `< ${alpha}`;
	}
	return '>= 0.05';
}

// ─── build keyed view ─────────────────────────────────────────────────────────
// key: exerciseType -> promptVariant -> submissionId -> { tier, runs: [{scores}] }
const byKey = {};
for (const r of rows) {
	byKey[r.exerciseType] ??= {};
	byKey[r.exerciseType][r.promptVariant] ??= {};
	const s = (byKey[r.exerciseType][r.promptVariant][r.submissionId] ??= {
		tier: r.tier,
		runs: [],
		parseStatuses: []
	});
	s.runs.push(r.scores ?? {});
	s.parseStatuses.push(r.parseStatus);
}

const tierRank = { poor: 1, mid: 2, excellent: 3 };

// ─── parse-failure taxonomy ───────────────────────────────────────────────────
const failureTaxonomy = { ok: 0, http_error: 0, json_parse_error: 0, schema_incomplete: 0 };
const extraFieldCounts = {};
for (const r of rows) {
	failureTaxonomy[r.parseStatus] = (failureTaxonomy[r.parseStatus] ?? 0) + 1;
	for (const ef of r.extraFields ?? []) extraFieldCounts[ef] = (extraFieldCounts[ef] ?? 0) + 1;
}

// ─── reliability (MAD) and validity (Spearman) per (exercise, prompt, dimension) ──
const reliability = []; // rows for table
const validity = []; // rows for table
const tierSeparation = []; // rows for table
const perDimensionScores = {}; // for figures

for (const exerciseType of Object.keys(byKey)) {
	const dims = PROMPTS[exerciseType].schema_fields;
	for (const promptVariant of ['P1_rubric', 'P2_naive']) {
		const submissions = byKey[exerciseType][promptVariant];
		for (const dim of dims) {
			const madsPerSub = [];
			const meanScoresPerSub = [];
			const tierRanksPerSub = [];
			const byTier = { poor: [], mid: [], excellent: [] };
			for (const [subId, sub] of Object.entries(submissions)) {
				const scores = sub.runs.map((r) => r[dim]).filter((v) => typeof v === 'number');
				if (scores.length === 0) continue;
				const m = mean(scores);
				const d = mad(scores);
				madsPerSub.push(d);
				meanScoresPerSub.push(m);
				tierRanksPerSub.push(tierRank[sub.tier]);
				byTier[sub.tier].push(m);
				(perDimensionScores[`${exerciseType}/${promptVariant}/${dim}`] ??= []).push({
					subId,
					tier: sub.tier,
					runScores: scores,
					mean: m,
					mad: d
				});
			}
			reliability.push({
				exerciseType,
				promptVariant,
				dimension: dim,
				medianMAD: +median(madsPerSub).toFixed(3),
				meanMAD: +mean(madsPerSub).toFixed(3),
				p95MAD: +percentile(madsPerSub, 95).toFixed(3),
				maxMAD: +Math.max(...madsPerSub).toFixed(3),
				n: madsPerSub.length
			});
			const rho = spearman(meanScoresPerSub, tierRanksPerSub);
			const n = meanScoresPerSub.length;
			const tStat = rho * Math.sqrt((n - 2) / (1 - rho * rho));
			validity.push({
				exerciseType,
				promptVariant,
				dimension: dim,
				spearmanRho: +rho.toFixed(3),
				n,
				tStat: +tStat.toFixed(3),
				pApprox: pApproxTDf10(tStat)
			});
			const kw = kruskalWallis([byTier.poor, byTier.mid, byTier.excellent]);
			tierSeparation.push({
				exerciseType,
				promptVariant,
				dimension: dim,
				kruskalWallisH: +kw.H.toFixed(3),
				df: kw.df,
				pApprox: pApproxChi2Df2(kw.H),
				groupMeans: {
					poor: +mean(byTier.poor).toFixed(2),
					mid: +mean(byTier.mid).toFixed(2),
					excellent: +mean(byTier.excellent).toFixed(2)
				}
			});
		}
	}
}

// ─── rubric-vs-naive ablation delta table ─────────────────────────────────────
// For each (exercise, dimension), delta = (P1 metric) - (P2 metric) for MAD and rho.
const ablation = [];
for (const r of reliability) {
	if (r.promptVariant !== 'P1_rubric') continue;
	const p2 = reliability.find(
		(x) =>
			x.exerciseType === r.exerciseType &&
			x.dimension === r.dimension &&
			x.promptVariant === 'P2_naive'
	);
	const v1 = validity.find(
		(x) =>
			x.exerciseType === r.exerciseType &&
			x.dimension === r.dimension &&
			x.promptVariant === 'P1_rubric'
	);
	const v2 = validity.find(
		(x) =>
			x.exerciseType === r.exerciseType &&
			x.dimension === r.dimension &&
			x.promptVariant === 'P2_naive'
	);
	ablation.push({
		exerciseType: r.exerciseType,
		dimension: r.dimension,
		p1MedianMAD: r.medianMAD,
		p2MedianMAD: p2.medianMAD,
		madDelta: +(r.medianMAD - p2.medianMAD).toFixed(3), // negative = rubric better (lower MAD)
		p1Rho: v1.spearmanRho,
		p2Rho: v2.spearmanRho,
		rhoDelta: +(v1.spearmanRho - v2.spearmanRho).toFixed(3) // positive = rubric better (higher rho)
	});
}

// ─── write metrics.json ───────────────────────────────────────────────────────
const metrics = {
	generatedAt: new Date().toISOString(),
	nSubmissions: 24,
	nExerciseTypes: 2,
	nPromptVariants: 2,
	nRunsPerPair: 3,
	nTotalCalls: rows.length,
	failureTaxonomy,
	extraFieldCounts,
	reliability,
	validity,
	tierSeparation,
	ablation
};
writeFileSync(METRICS_OUT, JSON.stringify(metrics, null, 2));

// ─── console summary ──────────────────────────────────────────────────────────
console.log('Failure taxonomy:', failureTaxonomy);
console.log('\nReliability (median MAD / p95 MAD):');
console.table(reliability);
console.log('\nValidity (Spearman rho):');
console.table(validity);
console.log('\nTier separation (Kruskal-Wallis H):');
console.table(tierSeparation);
console.log('\nAblation (P1 rubric - P2 naive):');
console.table(ablation);

// ─── SVG figures ──────────────────────────────────────────────────────────────
// Design tokens taken from src/routes/layout.css (TOUGHSKILL theme).
// Aesthetic: flat fills, hard 5px drop-shadow, 2px foreground borders, rounded corners.
const T = {
	bg: '#fafaf9', // secondary-50 — outer page
	card: '#ffffff', // card fill
	ink: '#18181b', // foreground
	inkMute: '#57534e', // secondary-700 — axis
	inkSoft: '#78716c', // secondary-500 — subtitle
	grid: '#e7e5e4', // secondary-200
	p1: '#0f766e', // primary-700 — rubric
	p1Soft: '#ccfbf1', // primary-100
	p2: '#57534e', // secondary-700 — naive
	p2Soft: '#e7e5e4', // secondary-200
	success: '#22c55e',
	successSoft: '#dcfce7',
	warning: '#f59e0b',
	warningSoft: '#fef3c7',
	error: '#dc2626',
	errorSoft: '#fee2e2',
	info: '#1d4ed8'
};

// Global SVG boilerplate: load Gurajada for display type, system-ui for data labels.
function svgHeader(w, h) {
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="system-ui, -apple-system, 'Segoe UI', sans-serif" font-size="12">` +
		`<defs>` +
		`<style>@import url('https://fonts.googleapis.com/css2?family=Gurajada&amp;display=swap');` +
		`.title{font-family:'Gurajada',Georgia,serif;font-weight:400;}` +
		`.label{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;}` +
		`</style>` +
		`<filter id="hardShadow" x="-10%" y="-10%" width="130%" height="130%">` +
		`<feOffset dx="5" dy="5"/>` +
		`<feFlood flood-color="${T.ink}"/>` +
		`<feComposite in2="SourceAlpha" operator="in"/>` +
		`<feComposite in="SourceGraphic" operator="over"/>` +
		`</filter>` +
		`<filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">` +
		`<feOffset dx="3" dy="3"/>` +
		`<feFlood flood-color="${T.ink}"/>` +
		`<feComposite in2="SourceAlpha" operator="in"/>` +
		`<feComposite in="SourceGraphic" operator="over"/>` +
		`</filter>` +
		`<filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">` +
		`<feOffset dx="1.5" dy="1.5"/>` +
		`<feFlood flood-color="${T.ink}"/>` +
		`<feComposite in2="SourceAlpha" operator="in"/>` +
		`<feComposite in="SourceGraphic" operator="over"/>` +
		`</filter>` +
		`</defs>`
	);
}

function rect(x, y, w, h, fill, opts = {}) {
	const stroke = opts.stroke ?? 'none';
	const sw = opts.sw ?? 0;
	const rx = opts.rx ?? 0;
	const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
	const op = opts.opacity != null ? ` fill-opacity="${opts.opacity}"` : '';
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${op}${filter}/>`;
}
function text(x, y, s, opts = {}) {
	const anchor = opts.anchor ?? 'start';
	const size = opts.size ?? 12;
	const weight = opts.weight ?? 400;
	const fill = opts.fill ?? T.ink;
	const cls = opts.cls ?? 'label';
	const transform = opts.transform ? ` transform="${opts.transform}"` : '';
	const letterSpacing = opts.letterSpacing != null ? ` letter-spacing="${opts.letterSpacing}"` : '';
	return `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${weight}" fill="${fill}"${letterSpacing}${transform}>${s}</text>`;
}
function line(x1, y1, x2, y2, stroke = T.ink, sw = 1, opts = {}) {
	const dash = opts.dash ? ` stroke-dasharray="${opts.dash}"` : '';
	const cap = opts.cap ? ` stroke-linecap="${opts.cap}"` : '';
	return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"${dash}${cap}/>`;
}
function circle(cx, cy, r, fill, opts = {}) {
	const stroke = opts.stroke ?? 'none';
	const sw = opts.sw ?? 0;
	const filter = opts.filter ? ` filter="url(#${opts.filter})"` : '';
	return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${filter}/>`;
}

// Card frame in the TOUGHSKILL house style: bg fill, off-white card, 2px ink border, 5px hard shadow.
function cardFrame(w, h, pad = 20) {
	const cx = pad,
		cy = pad;
	const cw = w - pad * 2,
		ch = h - pad * 2;
	let out = rect(0, 0, w, h, T.bg);
	out += rect(cx, cy, cw, ch, T.card, { stroke: T.ink, sw: 2, rx: 20, filter: 'hardShadow' });
	return out;
}

// Rounded bar with 2px ink border and hard shadow, matching the Button aesthetic.
function bar(x, y, w, h, fill, opts = {}) {
	const rx = opts.rx ?? Math.min(8, w / 2);
	const filter = opts.filter ?? (h > 6 ? 'softShadow' : null);
	return rect(x, y, w, h, fill, { stroke: T.ink, sw: 2, rx, filter });
}

// Chip pill (used in legend)
function chip(x, y, w, h, fill) {
	return rect(x, y, w, h, fill, { stroke: T.ink, sw: 1.5, rx: h / 2 });
}

const EX_LABEL = {
	divergent_thinking: 'Divergent thinking',
	reflection: 'Reflection'
};
const EX_SHORT = { divergent_thinking: 'DT', reflection: 'REF' };

// Figure 1 — Reliability: median MAD per (exercise, dimension, prompt), with p95 caps.
function figReliability() {
	const w = 860,
		h = 520;
	const ml = 96,
		mr = 44,
		mt = 110,
		mb = 120;
	const plotW = w - ml - mr;
	const plotH = h - mt - mb;
	// Group reliability rows into bars per (ex, dim). Two sub-bars per group (P1, P2).
	const groups = [];
	for (const r of reliability) {
		const key = `${r.exerciseType}/${r.dimension}`;
		let g = groups.find((x) => x.key === key);
		if (!g) {
			g = { key, ex: r.exerciseType, dim: r.dimension, items: [] };
			groups.push(g);
		}
		g.items.push(r);
	}
	const maxY = 2.0;
	const yOf = (v) => mt + plotH - Math.min(v / maxY, 1) * plotH;
	const groupW = plotW / groups.length;
	const barW = Math.min(44, groupW * 0.32);

	let svg = svgHeader(w, h);
	svg += cardFrame(w, h);

	// Title block
	svg += text(w / 2, 60, 'Test–retest reliability', {
		anchor: 'middle',
		cls: 'title',
		size: 34,
		fill: T.ink
	});
	svg += text(w / 2, 86, 'Mean absolute deviation across three runs · lower is better', {
		anchor: 'middle',
		size: 13,
		fill: T.inkSoft
	});

	// Acceptance bands as subtle background shading
	const bandAccept = yOf(0.5);
	const bandBorderline = yOf(1.5);
	svg += rect(ml, bandAccept, plotW, mt + plotH - bandAccept, T.successSoft, { opacity: 0.45 });
	svg += rect(ml, bandBorderline, plotW, bandAccept - bandBorderline, T.warningSoft, {
		opacity: 0.4
	});
	svg += rect(ml, mt, plotW, bandBorderline - mt, T.errorSoft, { opacity: 0.35 });

	// Inline threshold labels at the right of each band
	svg += text(ml + plotW - 8, bandAccept - 6, '≤ 0.5  acceptable', {
		anchor: 'end',
		size: 10,
		fill: '#166534',
		weight: 600
	});
	svg += text(ml + plotW - 8, bandBorderline - 6, '0.5–1.5  borderline', {
		anchor: 'end',
		size: 10,
		fill: '#92400e',
		weight: 600
	});
	svg += text(ml + plotW - 8, mt + 14, '> 1.5  poor', {
		anchor: 'end',
		size: 10,
		fill: '#991b1b',
		weight: 600
	});

	// Grid
	for (let v = 0; v <= 2; v += 0.5) {
		const y = yOf(v);
		svg += line(ml, y, ml + plotW, y, T.grid, 1, { dash: v === 0 ? undefined : '2 4' });
		svg += text(ml - 10, y + 4, v.toFixed(1), { anchor: 'end', fill: T.inkSoft, size: 11 });
	}

	// Axes (soft)
	svg += line(ml, mt, ml, mt + plotH, T.inkMute, 1.5);
	svg += line(ml, mt + plotH, ml + plotW, mt + plotH, T.inkMute, 1.5);
	svg += text(ml - 58, mt + plotH / 2, 'MAD  (0–10 scale)', {
		anchor: 'middle',
		size: 12,
		weight: 600,
		fill: T.inkMute,
		transform: `rotate(-90, ${ml - 58}, ${mt + plotH / 2})`
	});

	// Bars
	groups.forEach((g, gi) => {
		const cx = ml + (gi + 0.5) * groupW;
		const p1 = g.items.find((x) => x.promptVariant === 'P1_rubric');
		const p2 = g.items.find((x) => x.promptVariant === 'P2_naive');
		const drawBar = (metric, offset, colour) => {
			const yTop = yOf(metric.medianMAD);
			const yBase = mt + plotH;
			const vh = yBase - yTop;
			const x = cx + offset - barW / 2;
			if (vh > 2) svg += bar(x, yTop, barW, vh, colour);
			else svg += line(x, yBase - 1, x + barW, yBase - 1, colour, 3, { cap: 'round' });
			// p95 cap: small line with round caps
			const yP95 = yOf(metric.p95MAD);
			svg += line(x + barW / 2, yP95, x + barW / 2, yTop - 1, T.ink, 1.5, { cap: 'round' });
			svg += circle(x + barW / 2, yP95, 3.5, T.card, { stroke: T.ink, sw: 1.5 });
			// Median value label
			svg += text(x + barW / 2, yTop - 12, metric.medianMAD.toFixed(2), {
				anchor: 'middle',
				size: 11,
				weight: 700,
				fill: T.ink
			});
		};
		drawBar(p1, -barW * 0.75, T.p1);
		drawBar(p2, barW * 0.75, T.p2);

		// X labels: exercise short + dimension, spaced generously
		svg += text(cx, mt + plotH + 26, EX_SHORT[g.ex], {
			anchor: 'middle',
			size: 10,
			weight: 700,
			fill: T.inkSoft,
			letterSpacing: 1.5
		});
		svg += text(cx, mt + plotH + 46, g.dim, {
			anchor: 'middle',
			size: 13,
			weight: 600,
			fill: T.ink
		});
	});

	// Legend (bottom-centre pills)
	const legY = h - 44;
	const legItems = [
		{ x: w / 2 - 200, label: 'P1  rubric-referenced', fill: T.p1 },
		{ x: w / 2 + 10, label: 'P2  naive prompt', fill: T.p2 }
	];
	legItems.forEach((it) => {
		svg += chip(it.x, legY - 10, 20, 20, it.fill);
		svg += text(it.x + 28, legY + 5, it.label, { size: 12, weight: 600, fill: T.ink });
	});
	// p95 cap legend
	const capX = w / 2 + 220;
	svg += line(capX + 6, legY - 8, capX + 6, legY + 6, T.ink, 1.5, { cap: 'round' });
	svg += circle(capX + 6, legY - 8, 3.5, T.card, { stroke: T.ink, sw: 1.5 });
	svg += text(capX + 18, legY + 5, 'p95 MAD', { size: 12, weight: 600, fill: T.ink });

	// Footer note
	svg += text(ml, h - 44, 'n = 12 submissions per bar · 3 runs each', {
		size: 11,
		fill: T.inkSoft,
		anchor: 'start'
	});

	svg += '</svg>';
	return svg;
}

// Figure 2 — Tier separation: strip plot of LLM mean score vs tier, two panels.
function figTierSeparation() {
	const w = 980,
		h = 560;
	const panels = [
		{ ex: 'divergent_thinking', dim: 'originality', sub: 'rubric dimension: originality' },
		{ ex: 'reflection', dim: 'depth', sub: 'rubric dimension: depth' }
	];
	let svg = svgHeader(w, h);
	svg += cardFrame(w, h);

	svg += text(w / 2, 60, 'Tier separation', {
		anchor: 'middle',
		cls: 'title',
		size: 34,
		fill: T.ink
	});
	svg += text(w / 2, 86, 'Each dot is one submission (mean of 3 runs) · 12 submissions per panel', {
		anchor: 'middle',
		size: 13,
		fill: T.inkSoft
	});

	const panelPadL = 48;
	const panelGap = 36;
	const panelOuterW = (w - panelPadL * 2 - panelGap) / 2;
	const panelTop = 120;
	const panelBottom = h - 120;
	const panelH = panelBottom - panelTop;

	panels.forEach((p, pi) => {
		const pl = panelPadL + pi * (panelOuterW + panelGap);
		const pt = panelTop;

		// Panel card
		svg += rect(pl, pt, panelOuterW, panelH, T.card, {
			stroke: T.ink,
			sw: 2,
			rx: 16,
			filter: 'softShadow'
		});

		// Panel header
		svg += text(pl + 20, pt + 30, EX_LABEL[p.ex], {
			size: 16,
			weight: 700,
			fill: T.ink
		});
		svg += text(pl + 20, pt + 50, p.sub, { size: 12, fill: T.inkSoft });

		// Plot region inside panel
		const ml = pl + 56;
		const mr = 24;
		const mt = pt + 72;
		const mb = 64;
		const pw = panelOuterW - (ml - pl) - mr;
		const ph = panelH - (mt - pt) - mb;

		// Grid
		for (let v = 0; v <= 10; v += 2) {
			const y = mt + ph - (v / 10) * ph;
			svg += line(ml, y, ml + pw, y, T.grid, 1, { dash: v === 0 ? undefined : '2 4' });
			svg += text(ml - 10, y + 4, String(v), { anchor: 'end', size: 10, fill: T.inkSoft });
		}
		svg += line(ml, mt, ml, mt + ph, T.inkMute, 1.5);
		svg += line(ml, mt + ph, ml + pw, mt + ph, T.inkMute, 1.5);
		svg += text(ml - 34, mt + ph / 2, 'mean score', {
			anchor: 'middle',
			size: 11,
			weight: 600,
			fill: T.inkMute,
			transform: `rotate(-90, ${ml - 34}, ${mt + ph / 2})`
		});

		const tiers = ['poor', 'mid', 'excellent'];
		const tierTint = { poor: T.errorSoft, mid: T.warningSoft, excellent: T.successSoft };
		const tierInk = { poor: T.error, mid: T.warning, excellent: T.success };

		tiers.forEach((tier, ti) => {
			const colW = pw / tiers.length;
			const colL = ml + ti * colW;
			// tier background strip
			svg += rect(colL, mt, colW, ph, tierTint[tier], { opacity: 0.35 });

			const xc = colL + colW / 2;
			// tier label as pill under axis
			const lblW = 92;
			svg += chip(xc - lblW / 2, mt + ph + 14, lblW, 26, tierTint[tier]);
			svg += text(xc, mt + ph + 32, tier.toUpperCase(), {
				anchor: 'middle',
				size: 11,
				weight: 700,
				fill: tierInk[tier],
				letterSpacing: 1.2
			});

			// Two mini-columns: P1 left, P2 right
			['P1_rubric', 'P2_naive'].forEach((pv, pvi) => {
				const offset = (pvi === 0 ? -1 : 1) * (colW * 0.22);
				const data = perDimensionScores[`${p.ex}/${pv}/${p.dim}`] ?? [];
				const here = data.filter((d) => d.tier === tier);
				const colour = pv === 'P1_rubric' ? T.p1 : T.p2;
				// Compute mean of means for this cell
				const meanOfMeans = here.reduce((s, d) => s + d.mean, 0) / (here.length || 1);
				const mx = xc + offset;
				const my = mt + ph - (meanOfMeans / 10) * ph;
				// Draw a faint mean bar behind the dots
				svg += line(mx - 18, my, mx + 18, my, colour, 2, { cap: 'round' });
				here.forEach((d, di) => {
					const jitter = (di - (here.length - 1) / 2) * 4;
					const y = mt + ph - (d.mean / 10) * ph;
					svg += circle(mx + jitter, y, 5.5, colour, {
						stroke: T.ink,
						sw: 1.5,
						filter: 'dotShadow'
					});
				});
			});
		});

		// Inline panel legend (top-right of plot area)
		const legX = ml + pw - 168;
		const legY = mt + 4;
		svg += rect(legX, legY, 164, 42, T.card, { stroke: T.ink, sw: 1, rx: 10 });
		svg += circle(legX + 14, legY + 15, 5, T.p1, { stroke: T.ink, sw: 1 });
		svg += text(legX + 24, legY + 19, 'P1 rubric', { size: 11, weight: 600, fill: T.ink });
		svg += circle(legX + 14, legY + 31, 5, T.p2, { stroke: T.ink, sw: 1 });
		svg += text(legX + 24, legY + 35, 'P2 naive', { size: 11, weight: 600, fill: T.ink });
		svg += line(legX + 90, legY + 19, legX + 108, legY + 19, T.inkMute, 2, { cap: 'round' });
		svg += text(legX + 112, legY + 23, 'cell mean', { size: 10, fill: T.inkSoft });
	});

	svg += '</svg>';
	return svg;
}

// Figure 3 — Criterion validity: Spearman ρ per (exercise, dimension, prompt).
function figAblation() {
	const w = 860,
		h = 520;
	const ml = 96,
		mr = 44,
		mt = 110,
		mb = 120;
	const plotW = w - ml - mr;
	const plotH = h - mt - mb;
	const minY = 0.0,
		maxY = 1.0;
	const yOf = (v) => mt + plotH - ((v - minY) / (maxY - minY)) * plotH;
	const groups = ablation.map((a) => ({
		ex: a.exerciseType,
		dim: a.dimension,
		p1: a.p1Rho,
		p2: a.p2Rho
	}));
	const groupW = plotW / groups.length;
	const barW = Math.min(44, groupW * 0.32);

	let svg = svgHeader(w, h);
	svg += cardFrame(w, h);

	svg += text(w / 2, 60, 'Criterion validity', {
		anchor: 'middle',
		cls: 'title',
		size: 34,
		fill: T.ink
	});
	svg += text(
		w / 2,
		86,
		'Spearman ρ between LLM mean score and pre-registered tier rank · higher is better',
		{
			anchor: 'middle',
			size: 13,
			fill: T.inkSoft
		}
	);

	// Interpretation bands
	const yStrong = yOf(0.7);
	const yMod = yOf(0.4);
	svg += rect(ml, mt, plotW, yStrong - mt, T.successSoft, { opacity: 0.45 });
	svg += rect(ml, yStrong, plotW, yMod - yStrong, T.warningSoft, { opacity: 0.4 });
	svg += rect(ml, yMod, plotW, mt + plotH - yMod, T.errorSoft, { opacity: 0.35 });

	svg += text(ml + plotW - 8, yStrong + 14, 'ρ ≥ 0.7  strong', {
		anchor: 'end',
		size: 10,
		fill: '#166534',
		weight: 600
	});
	svg += text(ml + plotW - 8, yMod + 14, '0.4–0.7  moderate', {
		anchor: 'end',
		size: 10,
		fill: '#92400e',
		weight: 600
	});
	svg += text(ml + plotW - 8, mt + plotH - 6, '< 0.4  concerning', {
		anchor: 'end',
		size: 10,
		fill: '#991b1b',
		weight: 600
	});

	// Grid
	for (let v = 0; v <= 1; v += 0.2) {
		const y = yOf(v);
		svg += line(ml, y, ml + plotW, y, T.grid, 1, { dash: v === 0 ? undefined : '2 4' });
		svg += text(ml - 10, y + 4, v.toFixed(1), { anchor: 'end', fill: T.inkSoft, size: 11 });
	}
	svg += line(ml, mt, ml, mt + plotH, T.inkMute, 1.5);
	svg += line(ml, mt + plotH, ml + plotW, mt + plotH, T.inkMute, 1.5);
	svg += text(ml - 58, mt + plotH / 2, 'Spearman  ρ', {
		anchor: 'middle',
		size: 12,
		weight: 600,
		fill: T.inkMute,
		transform: `rotate(-90, ${ml - 58}, ${mt + plotH / 2})`
	});

	groups.forEach((g, gi) => {
		const cx = ml + (gi + 0.5) * groupW;
		const drawBar = (v, offset, colour) => {
			const yTop = yOf(v);
			const yBase = mt + plotH;
			const vh = yBase - yTop;
			const x = cx + offset - barW / 2;
			svg += bar(x, yTop, barW, vh, colour);
			svg += text(x + barW / 2, yTop - 10, v.toFixed(2), {
				anchor: 'middle',
				size: 11,
				weight: 700,
				fill: T.ink
			});
		};
		drawBar(g.p1, -barW * 0.75, T.p1);
		drawBar(g.p2, barW * 0.75, T.p2);

		svg += text(cx, mt + plotH + 26, EX_SHORT[g.ex], {
			anchor: 'middle',
			size: 10,
			weight: 700,
			fill: T.inkSoft,
			letterSpacing: 1.5
		});
		svg += text(cx, mt + plotH + 46, g.dim, {
			anchor: 'middle',
			size: 13,
			weight: 600,
			fill: T.ink
		});
	});

	// Legend (bottom)
	const legY = h - 44;
	const legItems = [
		{ x: w / 2 - 200, label: 'P1  rubric-referenced', fill: T.p1 },
		{ x: w / 2 + 10, label: 'P2  naive prompt', fill: T.p2 }
	];
	legItems.forEach((it) => {
		svg += chip(it.x, legY - 10, 20, 20, it.fill);
		svg += text(it.x + 28, legY + 5, it.label, { size: 12, weight: 600, fill: T.ink });
	});
	svg += text(ml, h - 44, 'all p < 0.001 · n = 12 submissions per correlation', {
		size: 11,
		fill: T.inkSoft,
		anchor: 'start'
	});

	svg += '</svg>';
	return svg;
}

writeFileSync(resolve(__dirname, 'figures/fig_reliability.svg'), figReliability());
writeFileSync(resolve(__dirname, 'figures/fig_tier_separation.svg'), figTierSeparation());
writeFileSync(resolve(__dirname, 'figures/fig_validity.svg'), figAblation());

console.log('\nWrote metrics.json and 3 SVG figures to figures/.');
