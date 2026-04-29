# Reliability study — artefacts

Pre-registered empirical study of the LLM-based evaluator used in the TOUGHSKILL platform. Answers three questions for two exercise types:

1. **Test–retest reliability** — how much does the same submission drift across runs?
2. **Criterion validity** — does the evaluator discriminate pre-registered quality tiers in the expected order?
3. **Prompting ablation** — does the rubric-referenced prompt outperform a naive prompt at matched output schema?

## Files

| File | Purpose |
| --- | --- |
| `submissions.json` | Pre-registered submissions with tier assignments (committed before any API call) |
| `prompts.json` | P1 rubric-referenced and P2 naive prompt pairs, one per exercise type |
| `runner.mjs` | Node script that issues 144 Mistral calls and writes `results.jsonl` |
| `results.jsonl` | One JSON row per API call: raw response, scores, parse status, latency |
| `analyze.mjs` | Computes MAD, Spearman ρ, Kruskal–Wallis H, emits `metrics.json` and three SVGs |
| `metrics.json` | Machine-readable metrics output |
| `report.md` | Dissertation-ready subsection (§5.3.2) with numbers and touch-point updates |
| `figures/` | SVG figures referenced from `report.md` |
| `runner.log` | Console output from the Mistral run, retained for audit |

## Reproduce

```sh
# From docs/reliability-study/
node --env-file=../../.env runner.mjs   # writes results.jsonl (144 calls, ~2 min wall-clock)
node analyze.mjs                        # writes metrics.json + figures/*.svg
```

`MISTRAL_API_KEY` must be present in `../../.env`. Any existing `results.jsonl` is renamed to a timestamped backup before the runner appends.

## Scope decisions (what this study is NOT)

- Not a human-rater study. Ground truth is single-rater, pre-registered.
- Not a multi-model comparison. Only `mistral-small-latest`.
- Not a temperature sweep. Uses the production default.
- Not a coverage study of all five exercise types. Two were chosen to span the rubric-complexity space (multi-dimensional vs single-dimensional).
- Not a study of the production schema. Both prompts output scores only; the `feedback` and `suggestions` fields used in production are excluded so the ablation isolates rubric content from output-format differences.
