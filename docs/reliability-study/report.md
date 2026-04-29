# §5.3.2 Evaluator Reliability Study

> Drop-in subsection for the dissertation, to follow the accessibility paragraph in §5.3. Figures referenced below are embedded at the end; the SVG sources live in `figures/`.

## 5.3.2 Test–retest reliability and criterion validity of the LLM-based evaluator

The preceding discussion treats the `mistral-small-latest` evaluator as if its scores were deterministic, which they are not. An evaluator whose scores drift across runs, or whose scores fail to track real differences in submission quality, undermines every downstream claim the system makes about learner progress. This subsection quantifies both properties for the deployed prompt.

### Design

Two exercise types were chosen to span the rubric-complexity space available in the system: **divergent thinking**, which uses a three-dimensional rubric (flexibility, originality, elaboration) drawn from Guilford (1967), and **reflection**, which uses a single-dimension rubric (depth). Twelve author-generated submissions were produced per exercise type, four each in a pre-registered _poor / mid / excellent_ tier. Tiers were committed to `submissions.json` before any Mistral call was issued, with written criteria defining each tier (see `submissions.json` `_meta`). A second "naive" prompt (P2) was written for each exercise type, identical in JSON schema to the production rubric-referenced prompt (P1) but stripped of all rubric definitions. The rubric-versus-naive comparison is therefore a clean ablation of rubric content: the output format is held constant, so any difference in scoring behaviour is attributable to the rubric language itself. Three runs were conducted per (submission, prompt) pair at the production model and default temperature, yielding 2 × 12 × 2 × 3 = **144 Mistral calls**. All calls used `response_format: {type: "json_object"}` to match production. Transient HTTP 5xx responses were retried with exponential backoff; parse failures were not retried and were recorded as data.

### Metrics

Three quantities were derived from the 144 logged responses. **Test–retest reliability** is the mean absolute deviation (MAD) of each submission's three scores on each rubric dimension, reported as median and 95th percentile across the twelve submissions in each cell. **Criterion validity** is the Spearman rank correlation (ρ) between the LLM's mean score and the pre-registered tier rank (poor = 1, mid = 2, excellent = 3); significance is reported against a t-approximation with df = 10. **Tier separation** is the Kruskal–Wallis H statistic across the three tier groups, testing whether the LLM produces distinguishable score distributions for poor, mid, and excellent submissions. **Parse failure rate** is the proportion of calls whose JSON could not be decoded or whose decoded object lacked the required numeric fields.

### Results

**Reliability.** Median MAD across the eight (exercise × dimension × prompt) cells ranged from 0.00 to 0.44 on a 1–10 scale, well inside the 0.5 "acceptable" band. The 95th-percentile MAD peaked at 1.33 for divergent-thinking elaboration under P1 and 1.11 for reflection depth under P1; both are in the 0.5–1.5 "borderline" band, neither crosses the 1.5 "poor" threshold. Elaboration was the noisiest dimension, consistent with its less externally verifiable definition. See Figure 5.6.

**Validity.** All eight cells produced Spearman ρ between **0.835 and 0.967**, every one significant at p < 0.001. The evaluator discriminates the pre-registered quality tiers in the correct order for every dimension and both prompts. Kruskal–Wallis confirms this at the group level: H ≥ 8.0 in all cells (p < 0.05 minimum; p < 0.01 in seven of the eight cells). See Figure 5.7 for the tier scatter and Figure 5.8 for the ρ comparison.

**Parse failures.** Zero of 144 calls (0.0%) produced malformed JSON or missing score fields. The conservative fallback path in the production evaluator (which substitutes a neutral score of 5 when parsing fails) was therefore not exercised during the study. Seven HTTP 503 responses occurred during the run and resolved on the first backoff; the runner logs these. No model response contained extraneous fields beyond the requested schema.

**Rubric versus naive prompt (ablation).** The rubric-referenced prompt did **not** produce meaningfully lower MAD or higher ρ than the naive prompt. Median MAD differences ranged from −0.22 (rubric _worse_ on divergent originality) to 0.00 (tied on three of four dimensions). Spearman ρ differences ranged from −0.014 to +0.083. The most visible difference is in absolute score calibration: the naive prompt compresses the score range upward (mean score for _poor_ divergent flexibility is 5.50 under P2 versus 2.50 under P1), while the rubric prompt uses the lower half of the scale more freely. Rank ordering is preserved in both cases, which is why ρ is equivalent. The rubric's value therefore lies in score calibration and — in production — in the qualitative feedback channel it enables, not in scoring accuracy per se.

### Failure-mode taxonomy

Because every response parsed cleanly and no schema-incomplete responses occurred, the taxonomy reduces to a single finding: the mistral-small-latest model reliably honours the `response_format` JSON constraint on short, score-only prompts. This is a narrower result than claims made in the broader LLM-as-a-judge literature (e.g. Liu et al., 2023) where parse failure rates of 1–5 % are routinely reported, and should not be generalised to longer or freeform prompts. The production evaluator's richer schema (which includes `feedback` and `suggestions` string fields) is not covered by this study and may behave differently; this is flagged as future work.

### Limitations of this study

Three limitations bound the strength of the conclusions. First, ground-truth tier assignments were made by a single rater (the author) without an inter-rater reliability check; this is mitigated by the pre-registration of criteria and tiers before any model call, but a second blinded rater would be a stronger control. Second, the twelve-submission cells yield 12 data points per correlation, so confidence intervals on ρ are wide even when point estimates are above 0.9. Third, a single model (`mistral-small-latest`) was tested; conclusions about rubric-versus-naive prompting may not transfer to larger or reasoning-tuned models. Extending this study across models, raters, and prompt sizes is an immediate avenue for follow-up work.

### Headline numbers (for abstract and introduction §1.7)

| Claim                                                               | Number                                  |
| ------------------------------------------------------------------- | --------------------------------------- |
| Test–retest reliability, median MAD (aggregate across dims/prompts) | **0.28** on a 0–10 scale                |
| Test–retest reliability, p95 MAD (worst cell: DT elaboration P1)    | **1.33**                                |
| Criterion validity, Spearman ρ range                                | **0.835 – 0.967** (all p < 0.001)       |
| Parse failure rate                                                  | **0 / 144 (0.0%)**                      |
| Rubric-vs-naive Δρ (max)                                            | **+0.083** (DT elaboration, negligible) |

---

## Figures

- `figures/fig_reliability.svg` — median MAD per dimension per prompt, with p95 whiskers (Figure 5.6)
- `figures/fig_tier_separation.svg` — per-submission mean score by tier, per prompt, for a representative dimension of each exercise (Figure 5.7)
- `figures/fig_validity.svg` — Spearman ρ per dimension per prompt (Figure 5.8)

---

## Touch-point updates

These are the minimal edits elsewhere in the dissertation required to absorb the study.

### Abstract — add one clause

> "…the platform additionally characterises its automated evaluator's test–retest reliability (median MAD 0.28 on a 0–10 scale across 144 calls) and criterion validity (Spearman ρ = 0.84–0.97 against pre-registered quality tiers; all p < 0.001)."

### Introduction §1.7, contribution 2 — strengthen

From "demonstrates a method" to:

> "…demonstrates and empirically characterises a rubric-referenced LLM evaluator, reporting its test–retest reliability (median MAD 0.28 across three runs of 24 pre-registered submissions), its discrimination of pre-registered quality tiers (Spearman ρ ≥ 0.83, p < 0.001), and the null effect of rubric content on score reliability relative to a naive prompt at matched output schema."

### Discussion §6.1 — add one paragraph

> A rubric-versus-naive ablation produced a clear negative result worth stating: holding the JSON output schema constant, the rubric-referenced prompt did not reduce score variance or improve rank correlation with pre-registered tiers. The rubric _did_ shift absolute score calibration — poor divergent submissions scored 2.5 under the rubric prompt and 5.5 under the naive prompt on the same 0–10 scale — but rank ordering was preserved by both. This is consistent with the view that rubric language primarily shapes the _feedback_ a model generates, not its scoring precision. In a production system whose value proposition is formative feedback, the rubric earns its place through the qualitative channel; in a system whose value is pure scoring, a much shorter prompt would have sufficed.

### Discussion §6.2, fourth limitation — rewrite

From "unmeasured variance" to:

> "Score variance across runs was measured rather than left as a residual concern. Across 144 calls (two exercise types × 12 pre-registered submissions × two prompts × three runs), median MAD was 0.28 on a 0–10 scale, with a 95th-percentile MAD of 1.33 in the worst cell (divergent-thinking elaboration under the rubric prompt). The residual limitations are narrower: single-rater ground truth, a single model (`mistral-small-latest`), and a score-only schema that may not generalise to the production schema with `feedback` and `suggestions` string fields. These are the specific directions follow-up work should address."
