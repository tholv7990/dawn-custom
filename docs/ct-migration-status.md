# CT Migration Status — Shrine-Parity Plan vs. Actual Codebase

> Reconciles `technical-migration-doc-shrine-parity.md` (written against the old `gs-*` state)
> against the **actual** `ct-*` codebase as of 2026-06-12, branch `custom-theme`.
> Method: 4 parallel read-only assessors + direct `grep`/QA verification of every contested fact.
> Live baseline at audit time: `node qa/ct-qa.mjs` **passes**; token audit tracks 14 color-literal,
> 42 `!important`, 211 px-spacing-type-literal (192 in `section-ct-page.css`, 14 in `theme-overrides.css`);
> brand audit 0, content audit 0, settings-sync clean, 13/13 sections have presets, 11/13 shared padding.

## TL;DR

The foundation (W0 Repair + WD Data Reset) is **done**. W1 (token/CSS refactor): the emitter,
audit tooling, de-branding, presets, CI guards, **and the L3 component-token + typography +
reveal emission (W1.T05–T08)** are now in place; what remains is the **visual-regression lane** —
px/breakpoint retrofit (T10/T11), CSS file-split (T12), `theme-overrides.css` triage (T13),
`.gs-scope` retirement (T14), light-lock OFF-state verify (T03), override partial (T17). The
**W2 shared-primitive layer is complete (T01–T09)**. W3–W6 are not started.

> **Progress log (headless-safe lane, branch `custom-theme`):**
> - **Chunk A** `e1e3a09` — W1.E2 token emission (`--ct-btn/input/pill/dropdown/qty/swatch/arrow/dot/card/drawer/popup/badge-*`, `--ct-h1…h6`, `--ct-reveal-*`) + dev `ct-styleguide` section.
> - **Chunk B** — deferred: the valuable CSS split is a visual-regression task (distributed `@media` cascade), not headless-safe.
> - **Chunk C** `9adba31` — W2 primitives: `ct-icon`, `ct-rating-stars`, `ct-price-tokens` (+JS), `<ct-copy-button>`, `<ct-countdown-timer>`, `ct-reveal.js`, `ct-toast.js`.
> - **Chunk D** `9adf2e4` — W2 complete: `<ct-carousel>`, `ct-upsell-card` (Dawn `<product-form>` pipeline).
> - **Chunk E** — additive odds-and-ends: **W1.T17** `ct-color-scheme` partial (L4 per-section scheme + custom overrides) + styleguide demo + authoring fragment; **W6.T04** Security panel (copy-protect, **default OFF** — script + body flag gated so it's never loaded unless enabled); **WD.T08** closed as N/A (`ct-sticky-atc` reads no rating/sold metafields, so there is no fabricated-proof path to harden); **W1.T04** the `--gs-` freeze is documented (0 consumers; no alias file needed).
> - **Chunk F** — **W0.T02**: `templates/product.landing.json` — re-assembles the full `ct-*` funnel as an **opt-in product landing template** (12 sections, neutral schema-default content; tier ladder 1/2/3 and alternating feature sides as structural config, DR-compliant). Additive — a new template not referenced by default, so zero impact on the live storefront until a merchant assigns it; makes the entire `ct-*` library + W2 primitives usable again.
> - **Chunk G** — G-03: seeded neutral preset blocks for ct-product-buy / ct-reviews / ct-feature-blocks / ct-comparison (drag-in now shows a complete default).
> - **Chunk H** — **W1.T12**: split `section-ct-page.css` (2,510 lines) into `section-ct-base.css` + `section-ct-components.css` + `section-ct-responsive.css`, loaded in that order. Cut at depth-0 boundaries; **concat === original verified byte-for-byte** → guaranteed zero visual change. Token allowlist re-keyed (192 px → 17/155/20). Per-section/per-template loading (the payload-reduction optimization) is the visual-lane follow-up.
> - Every chunk verified: `node qa/ct-qa.mjs` green (no new token findings) + Theme Check 0 offenses. All additive — no live-template rendering changed (security feature is inert at its default; landing template is opt-in; CSS split is byte-identical).
> - **Remaining work** (W1 px/breakpoint retrofit, `theme-overrides.css` triage, `.gs-scope` retirement, per-section CSS loading; W3–W6 commerce) changes live rendering and should be visually verified on a Shopify dev store before merge.

**Two assessor claims were wrong and are corrected here:** (1) there is **no `!important`** in the
emitter — the old light-lock paint is already removed; (2) the typography/buttons/pills/inputs/cards/
drawers/popups/animations settings panels are **Dawn-native**, not custom skin panels — the `--ct-btn-*`/
`--ct-pill-*`/`--ct-reveal-*` token clusters those W1.E2 tasks require are **not emitted yet**.

---

## Status matrix

Legend: ✅ done · 🟡 partial · ⬜ todo · 🔒 needs-live-preview (visual/editor verification) · ⚙️ headless-safe

### W0 — Repair & re-baseline
| Task | Status | Notes |
|---|---|---|
| W0.T01 Restore Dawn header/footer | 🟡 | `header.liquid`/`footer.liquid` are **custom minimal** (`gs-scope`), not full Dawn restore; groups are clean shells |
| W0.T02 `product.json` on `main-product` + `product.landing.json` | 🟡 | `product.json` neutral ✅; **`product.landing.json` not created** |
| W0.T03 LF normalize + `.gitattributes` | 🟡 ⚙️ | CRLF **baselined** (31,669 across 86 files) but not normalized; no `.gitattributes` |
| W0.T04 Rename `gardenstudio_benefits`; string sweep | ✅ | 0 brand/niche strings; brand+content audits green |
| W0.T05 Baseline capture (Lighthouse/screenshots) | ⬜ 🔒 | No `qa/baseline/`; **needed before any visual-regression refactor** |

### WD — Data reset & neutral defaults
| Task | Status | Notes |
|---|---|---|
| WD.T01 Neutral templates (index/product/cart) | ✅ | Dawn starters, empty settings |
| WD.T02 No PII in group JSON | ✅ | header/footer groups carry empty settings |
| WD.T03 Dead `ct_*` thresholds + presets | 🟡 ⚙️ | Presets Default/Studio Neutral/Terracotta/Forge exist; 3 `ct_*` threshold keys still present (all `0`) — decide delete vs. wire (D-10) |
| WD.T04 `color_accent` neutral | ✅ | `#111827` |
| WD.T05 QA guard suite | ✅ | `ct-qa.mjs` orchestrates 6 guards, all pass |
| WD.T06 Decision docs | ✅ | guardrails / section-authoring / token-reference present |
| WD.T07 Theme-check baseline doc | ✅ | 0 errors / 0 warnings recorded |
| WD.T08 Metafield fallbacks (G-04) | 🟡 ⚙️ | `ct-product-buy` has rating fallback; **`ct-sticky-atc` lacks explicit fallback** |

### W1 — CSS architecture & token refactor (the critical path)
| Task | Status | Risk | Notes |
|---|---|---|---|
| W1.T01 Token audit tooling | ✅ | ⚙️ | `qa/ct-token-audit.mjs` + allowlist |
| W1.T02 Emitter L1→L3 restructure | ✅ | ⚙️ | **192 `--ct-*` tokens**, 0 `!important`, layered + commented |
| W1.T03 Scheme bridge + light-lock setting | 🟡 | 🔒 | Bridge present, `ct_force_light_mode` setting present, **0 `!important`** (AC met); needs live confirm of OFF-state repaint |
| W1.T04 `--gs-` freeze | 🟡 | ⚙️ | **0 `--gs-` consumers** (freeze effectively achieved); `deprecated-aliases.css` not created — likely unnecessary; just document |
| W1.T05 Typography token emission | ⬜ | ⚙️ | Dawn panel exists; **no settings-driven `--ct-text-*`/`--ct-heading-*` clamp emission** |
| W1.T06 Button token emission | ⬜ | ⚙️ | Dawn panel exists; **no `--ct-btn-*` cluster emitted/consumed** |
| W1.T07 Control-skin tokens ×5 (pills/dropdowns/qty/swatches/slider) | ⬜ | ⚙️ | Dawn panels exist; **no `--ct-pill-*`/`--ct-qty-*`/`--ct-swatch-*`/`--ct-arrow-*`/`--ct-dot-*` + no `component-*.css` + no styleguide** |
| W1.T08 Animation/reveal tokens | ⬜ | ⚙️ | Dawn panel exists; **0 `--ct-reveal-*` tokens, no data-flags** |
| W1.T09 `ct-section-padding` partial | ✅ | ⚙️ | In use by 11/13 sections |
| W1.T10 Section token retrofit + unified breakpoints | 🟡 | 🔒 | 192 px-literals + legacy 620/760/780/820/1040 breakpoints remain; 2 sections (announce, sticky) not on padding partial |
| W1.T11 Typography retrofit | 🟡 | 🔒 | Type tokens exist; `.gs-section-heading` still `clamp(22px,3vw,30px)` literal |
| W1.T12 Split `section-ct-page.css` (2,510 lines) | ✅ | ⚙️ | Split into `section-ct-base/components/responsive.css`, loaded in order; byte-identical concat (no-op). Per-section loading deferred. |
| W1.T13 Triage `theme-overrides.css` (358 lines) → 0 | ⬜ | 🔒 | All token-referenced, but 14 px-literals + 2 `!important`; touches Dawn-native pages |
| W1.T14 Retire `.gs-scope` | ⬜ | 🔒 | 27 occurrences (14 in CSS + 13 sections); needs full screenshot matrix |
| W1.T15 Brand/IP purge | ✅ | ⚙️ | 0 leakage; brand-strip image-only |
| W1.T16 Preset & sync system | ✅ | ⚙️ | 4 presets; `ct-settings-sync` green |
| W1.T17 `color-scheme + overrides` partial (L4) | ⬜ | ⚙️ | No section exposes `color_scheme`; partial not created |
| W1.T18 CI hardening | 🟡 | ⚙️ | `ct-qa` workflow runs; **no Lighthouse budgets / screenshot artifacts** |

### W2 — Shared primitives — **all ⬜ todo**
`price-tokens` (T01), `upsell-card` (T02), `rating-stars`/`trustpilot-stars` (T03), `<copy-button>` (T04),
`<countdown-timer>` (T05), reveal engine v2 (T06), `<ct-carousel>` (T07), `icon.liquid` system (T08),
toast service (T09). **None exist.** All ⚙️ headless-safe to build (net-new files; don't alter current rendering until adopted).

### W3 — PDP block library — **mostly ⬜; 3 partial bases exist**
T01 Quantity-breaks 🟡 (logic lives in `ct-product-buy` tiers — not yet a reusable block) · T02 Sticky-ATC 🟡 (`ct-sticky-atc` is a section, not a block) · T09 Reviews 🟡 (`ct-reviews` not registered as a `main-product` block) · T10 Media gallery 🟡 (monolithic in `ct-product-buy`) · T03/T04/T05/T06/T07/T08 ⬜. Almost all 🔒.

### W4 — Cart system — **all ⬜** (drawer blockification, progress/checkpoints bar, gift engine, discount/TnC, cart-page parity). All 🔒.

### W5 — Section library — **mostly ⬜; bases exist**
T01 social-proof 🟡 (`ct-reviews`, `ct-brand-strip`) · T02 tickers 🟡 (`ct-trust-marquee`, `ct-announcement-bars`) · T03 comparison 🟡 (`ct-comparison`) · T05 builders 🟡 (`ct-feature-blocks` + Dawn natives) · T06 forms 🟡 (`ct-email-signup`, `ct-faq`, `contact-form`) · T04 hotspots/heroes ⬜. All 🔒.

### W6 — Nav, overlays, hardening — **all ⬜** (header sticky modes, mega-menu, promo-popup, security panel, RTL sweep, a11y/perf hardening). Mostly 🔒 (T04 security panel ⚙️).

---

## Critical-path read

```
[DONE] W0 + WD foundation
         │
         ▼
[~55%]  W1  ── remaining splits into two lanes ──────────────────────────
         │
   ⚙️ HEADLESS-SAFE lane (no dev store needed)        🔒 NEEDS-LIVE-PREVIEW lane
   • T05–T08 token emission (btn/pill/qty/             • T03 light-lock OFF-state verify
     swatch/reveal) + consume in component CSS         • T10/T11 px-literal + breakpoint retrofit
   • T12 split section-ct-page.css                     • T13 theme-overrides triage
   • T17 color-scheme+overrides partial                • T14 .gs-scope retirement
   • T04 document --gs- freeze                          • W0.T05 baseline capture (prereq for all 🔒)
   • T18 add Lighthouse/screenshot CI
         │
         ▼
[TODO]  W2 shared primitives (⚙️ net-new, unlocks W3–W6)
         ▼
[TODO]  W3 PDP blocks · W4 cart · W5 sections · W6 nav/hardening   (mostly 🔒, commerce)
```

**Key constraint:** the 🔒 lane needs a Shopify dev store + screenshot baselines (W0.T05) to verify
without shipping regressions. The ⚙️ lane can be executed and verified entirely with `node qa/ct-qa.mjs`
+ `shopify theme check` + concatenation/diff checks — safe to do headlessly now.

---

## Recommended execution order (chunked, each gated by `ct-qa` + theme-check)

1. **Chunk A — finish W1.E2 token layer (⚙️):** emit `--ct-btn-*`, `--ct-pill-*`, `--ct-dropdown-*`,
   `--ct-qty-*`, `--ct-swatch-*`, `--ct-arrow-*`/`--ct-dot-*`, `--ct-reveal-*` from the existing Dawn
   panels; add a dev-only `ct-styleguide` section to prove them. Additive; no current-render change.
2. **Chunk B — W1.T12 CSS split (⚙️):** cut `section-ct-page.css` into `component-*.css` + per-section
   files, load per-section. Mechanical; verify by concatenated-selector diff + theme-check.
3. **Chunk C — W2 primitives (⚙️):** `icon.liquid`, `<copy-button>`, `<countdown-timer>`, `rating-stars`,
   `price-tokens`, toast service, `<ct-carousel>`. Net-new; unlocks W3–W6.
4. **Chunk D — 🔒 visual lane (requires dev store):** W0.T05 baseline → T10/T11 retrofit → T13 triage →
   T03 verify → T14 `.gs-scope` retirement, each behind a screenshot matrix.
5. **Chunks E+ — W3/W4/W5/W6** commerce blocks & sections (🔒).

Every chunk inherits the Definition of Done (§7.6 of the migration doc): AC met · static guards green ·
new strings in locales · docs touched · trace IDs in the commit.
