# PROMPT — Design-Coverage Audit: any HTML design(s) in this repo vs the Theme Codebase

> Copy everything below into Claude Code / Cursor as the task instruction. No paths to configure — the agent discovers the design HTML and docs inside the repo it runs in. Works for any design: homepage, PDP, landing page, cart, collection — one file or several.
> Re-run after every workstream merge (or whenever a new design is dropped in) to track coverage over time.

---

You are a **senior Shopify theme architect performing a read-only design-coverage audit**. One or more HTML design mockups are committed somewhere in this repo. For each one, determine — with evidence — **what percentage of that design a merchant could assemble today using only the Theme Editor** (drag/drop sections, add blocks, edit settings, switch presets), and map every gap to the migration-roadmap task that closes it, or propose a new task when none exists.

## 0. Inputs — discover them in this repo (STOP and report only if discovery fails)

Record every resolved path + a content hash (`shasum`) of each design file in the report header so runs are comparable.

1. **`REPO_ROOT`** = the current repo (theme root containing `sections/ snippets/ assets/ config/ templates/ locales/`).
2. **Design mockups (≥1 required).** A Shopify theme has no standalone `.html` files of its own, so any `.html` in the tree (root, `design/`, `docs/`, `mockups/`, …) is a design artifact. A mockup's signature: full `<head>` + substantial inline `<style>` (and usually inline `<script>`). Collect **all** of them.
3. **Classify each design's page type** from content, not filename (filename is a hint only): `pdp` (add-to-cart form / variant or bundle selector / single-product price block) · `homepage` (multi-band marketing, plan/offer or category entries) · `landing/funnel` (single product narrative + buy box on one page) · `cart` (line items + order summary) · `collection` (product grid + filters) · `other` (describe). Audit **every** discovered design; if more than 5, audit the 5 most recently modified and list the rest as deferred.
4. **Optional docs (use if present, skip silently if not):** any `*design-system*.md` (intent cross-check for that design's tokens/rules) · any `*migration*` / roadmap `.md` (task IDs — Appendix A below is the fallback map).
5. **`OUTPUT_REPORT`** = `qa/design-audit/{YYYY-MM-DD}-{design-slug(s)}-coverage.md` — create the folder; this is the one write permitted by rule 1.

## 1. Hard rules

1. **Read-only.** Modify nothing except writing `OUTPUT_REPORT`.
2. **Evidence or it didn't happen.** Every capability claim cites `file:line` or a schema path (`sections/x.liquid › blocks[type=y].settings.z`). Read the actual `{% schema %}` JSON — never infer a setting from a section's name.
3. **Editor-only counting.** Coverage counts only what's achievable via section/block/settings UI. `custom-liquid`, hand-written CSS, or code edits = **not covered** (cap the unit at 25 and list the workaround separately).
4. **Theme settings & presets count as capability.** If a treatment is reachable by changing global settings or authoring/switching a preset using *existing* setting surface, it is covered — cite the setting ids.
5. **Deterministic scoring.** Use only §4's rubric; show per-dimension subscores for every unit.
6. **No fake completeness.** Behavior you can't verify end-to-end in code (markup hook **and** JS handler) is `unverified` → counts ×0.5, with a manual-check note.
7. **The HTML files are truth** for what each design contains; a design-system doc, if found, cross-checks intent only.

## 2. Phase 1 — Theme capability inventory

1. Enumerate `sections/`, `snippets/`, `assets/`, `config/`.
2. Per section: schema `name`, settings (ids+types), block types (+settings, limits), `presets`. Keep this working table outside the repo (memory or `/tmp`).
3. `config/settings_schema.json`: every panel + setting id (global capabilities: schemes, typography, buttons, control skins…).
4. JS surface: `customElements.define`, `data-*` bindings, observers — an interaction exists only if wired end-to-end.
5. Token surface: which CSS custom properties exist and which are settings-driven (read the token emitter snippet + settings schema together).

## 3. Phase 2 — Decompose each design into units

Parse each design file **top-to-bottom** into ordered **Design Units** (visual bands plus persistent/overlay elements: header, footer, sticky bars, toasts, modals, tickers). For every unit record: purpose · **content slots** (each text/media/price/icon a merchant must edit) · layout shape (grid/columns/sticky/snap/overlay) · styling devices (special type treatments, shadows, bands, tints) · **interactions** (loops, reveals, hover states, lightbox, selector↔price sync, countdowns, sticky triggers, deep-links, toasts).

Use this taxonomy as recognition **vocabulary** (not a checklist — the file wins): announcement/ticker · header/nav · hero (incl. composite/bento grids) · USP/icon bar · buy box (gallery + purchase panel) · tier/bundle/plan selector · price block · trust badges/payment marks · proof strip/stats · feature storytelling · steps/how-it-works · timeline/journey · comparison table · reviews/testimonials · UGC/video wall · FAQ · offer/pricing cards · newsletter/email capture · CTA band · footer · sticky ATC · cart line items · order summary · upsell/cross-sell · empty states. Units that match nothing get a descriptive name — never force-fit.

## 4. Phase 3 — Score every unit (the rubric)

| Dim | Weight | 1.00 | 0.75 | 0.50 | 0.25 | 0.00 |
|---|---|---|---|---|---|---|
| **Structure** — an existing section/block combo produces this DOM/layout via its options | 0.35 | exact incl. responsive behavior | achievable, minor arrangement differs | section exists, layout option missing | only loosely related section | no candidate |
| **Content** — fraction of the unit's content slots editable in the editor | 0.25 | all | — proportional: editable ÷ total — | | | none |
| **Style** — fraction of visual treatments reachable via tokens/settings/preset (no custom CSS) | 0.20 | all | — proportional — | | | none |
| **Behavior** — fraction of interactions implemented end-to-end | 0.20 | all | — proportional; `unverified` ×0.5 — | | | none |

`UnitScore = 100 × (0.35·S + 0.25·C + 0.20·St + 0.20·B)` → ✅ ≥90 · 🟢 70–89 · 🟡 40–69 · 🔴 10–39 · ❌ <10.
**Caps:** needs custom code → ≤25 (rule 3). Candidate section's default/preset renders broken or empty on a bare store → ≤60, flagged.

**Importance tiers (assign per unit, justify in one phrase):**
- **×3 Critical** — units on the click-path to checkout *for that page type*: buy box, ATC/buy buttons, price block, tier/plan/bundle selector, sticky ATC, cart line items & summary, checkout CTA, header cart access.
- **×2 High** — persuasion & navigation load-bearers: hero, reviews/proof, comparison, FAQ, guarantees/trust, header, footer, primary CTA bands.
- **×1 Standard** — everything else.

**Per design file** report: `Coverage-Now % = Σ(UnitScore×tier)/Σ(tier)` and **Coverage-After-Roadmap %** (re-score assuming mapped tasks' acceptance criteria delivered; attribute the jump per workstream, e.g. "PDP 41% → 78% after W3"). If multiple designs were audited, also give a simple per-page summary list — do not blend pages into one number.

## 5. Phase 4 — Gap register & roadmap mapping

One row per dimension scored < 1.00 anywhere:

`GAP-id | Design › Unit | What's missing (precise: "no per-tier compare-at slot", "no outline-text type option") | Nearest existing capability (evidence) | Roadmap task(s) (Appendix A / roadmap doc) | If none: NEW — one-line task proposal (section/block/setting to add + suggested workstream) | Effort S/M/L`

Prefer the **smallest** closing task (a missing setting maps to that section's upgrade task, not a whole workstream). Design-specific units with no roadmap home are the audit's most valuable output — propose them as NEW, never force-fit.

## 6. Phase 5 — Two cross-cutting checks (reported separately from the %)

**A. Token/style fit.** Extract the design's own token system from its CSS (`:root` custom properties, or recurring literals if none): palette **and the roles colors play** (action/trust/rating/urgency/surfaces), type faces + scale + treatments (uppercase, tracking, outline/stroke text), radii, shadow styles, spacing rhythm, focus styles, color-mode behavior. Map each to the theme mechanism that reproduces it (scheme, semantic setting, skin panel, preset) → status table. Conclude: *could this design ship as a settings preset with zero custom CSS?* If not, list the blocking token/setting gaps.
**B. Universal commerce-compliance readiness** (pass/fail + evidence): compare-at strike/badge/savings **auto-hide** when `compare_at_price` is empty/≤price · no hardcoded ratings/sold-counts/urgency numbers in rendered defaults · exactly one Product JSON-LD on PDP-type pages, without hardcoded `aggregateRating` · `prefers-reduced-motion` honored (any always-moving element only via an explicit merchant setting).

## 7. Phase 6 — Self-verification pass (mandatory)

Re-open every 🔴/❌ unit and every `Content < 0.5` and re-grep the schemas for missed capability (false negatives are the classic audit failure). Spot-check three ✅/🟢 units against rule 2. Note corrections in the report changelog line.

## 8. Output — write `OUTPUT_REPORT` with exactly this structure

```
# Design Coverage Audit — <design file(s)> vs <theme name> @ <git short-sha> — <date>
0. Inputs resolved      (paths, hashes, page-type classification, rejected/deferred candidates)
1. Executive summary    (per design: N% now → N'% post-roadmap · top 5 blockers · top 3 NEW-task proposals)
2. Scoring method note  (one paragraph + tier assignments)
3. Per design file: unit table (Unit | Tier | S/C/St/B | Score | Status | Evidence | Gap ids)
4. Gap register         (§5 format; Critical-tier gaps first)
5. Roadmap projection   (per workstream: which units move, page % after)
6. Token/style fit      (§6A, incl. the preset verdict)
7. Compliance readiness (§6B)
8. Assumptions, unverified items, audit changelog
```

Factual and terse; no praise, no filler. If parsing confidence is low anywhere (minified HTML, ambiguous page type), say so at the top.

---

## Appendix A — Roadmap task map (fallback when no roadmap doc is found; prefer the doc when present)

| Task | Closes gaps about |
|---|---|
| W0.T01/T02 | Real header/footer restoration; PDP on `main-product`; landing template |
| WD.T02–T09 | Neutral defaults, locales for chrome strings, metafield fallbacks, data-audit |
| W1.T02/T03 | Token layers L1–L3; scheme bridge; light-lock as setting |
| W1.T05 | Extended typography (sizes/weights/tracking/uppercase display option) |
| W1.T06 | Button skins incl. hard-lift shadow, hover behavior, min-height |
| W1.T07a–e | Variant pills / dropdowns / qty picker / swatch dictionary / slider arrow+dot chrome |
| W1.T08 + W2.T06 | Scroll-reveal animation engine + settings |
| W1.T09/T10 | Section padding controls everywhere; rhythm tokens (tight/loud) |
| W1.T16 | Preset system (brand palettes/typography shipped as data) |
| W1.T17 | Per-section scheme + custom-color overrides |
| W2.T01 | Dynamic price tokens ([price], [amount_saved]…) |
| W2.T02 / T03 | Upsell card / star-rating + Trustpilot-style snippets (rating chips) |
| W2.T04 / T05 | Copy-to-clipboard / countdown element |
| W2.T07 | Carousel wrapper (loop, peek, autoplay, per-breakpoint widths) |
| W2.T08 / T09 | Icon system / unified toast |
| W3.T01 | Quantity-break tier selector (layouts, badges, per-tier variants, live price sync) |
| W3.T02 | Sticky ATC block (show-matrix, variant select, button function) |
| W3.T03 / T04 / T05 | Bundle offer / gifts-on-quantity / PDP upsell blocks |
| W3.T06 | Estimated shipping + checkpoints (dates) |
| W3.T07 | Trust set: payment badges, urgency, benefits, text-with-icon, icon grid, divider, link button |
| W3.T08 | Clickable discount, sizing chart modal, custom product fields |
| W3.T09 | Price savings line, swatch variant picker, price-in-button, reviews showcase block |
| W3.T10 | Media gallery controls (mobile widths, zoom/lightbox group, trust-badge slot) + featured-product mirror |
| W4.T01–T06 | Cart drawer blocks: progress/checkpoint bars, upsells, gift, discount field, TnC, countdown |
| W5.T01 | Testimonials / logo list / results / FB- & Trustpilot-style walls |
| W5.T02 | Tickers/marquees (text+image+review items, speed, fill+watchdog) & announcement blocks |
| W5.T03 | Comparison table (us-vs-them) · before/after · content tabs · pricing/plan table |
| W5.T04 | Hotspots, image/video slider, slideshow-hero, parallax hero |
| W5.T05 | Custom-columns builder · icon bar · icons-with-content · banner/image-text upgrades (stars/ATC blocks) · divider · sections-group |
| W5.T06 | Forms, email-signup, FAQ upgrade, featured-collection quick-add, bundle-deals, track-order, extra templates |
| W6.T01/T02 | Header deltas (sticky modes, highlight) · commerce mega-menu |
| W6.T03–T06 | Promo popup, scroll-top · security · RTL · a11y/perf hardening |

*Units matching no row above → `NEW —` proposals (§5).*
