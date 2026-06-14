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
**W2 shared-primitive layer is complete (T01–T09)**. The **W3 PDP block library is complete and dual-host**
(quantity-breaks, sticky-ATC, bundle, gift, upsells, shipping, discount, size-chart, custom-fields,
reviews-showcase, savings-line — additive, no Dawn commerce-logic edits); the **W5 section library (14)**
and **W6 overlays** are built. The **W4 cart system is ~85% done** (drawer blockification, free-shipping bar,
upsell rail, TnC gate + discount field, cart-page parity — all shipped + adversarially reviewed; only the
low-value multi-tier checkpoints / cart-gift leftovers remain). What remains is the **preview-gated lane**:
**W6.T05 RTL sweep** (W3 buy-box polish + W6.T02 mega-menu + W3.T10 gallery are done/Dawn-native), and the
**W1 visual-regression lane** — these need a working `shopify theme dev` render + screenshot baselines. The
batched `--only theme push` workaround now reliably lands code on the preview theme despite the earlier
sustained-transfer `ECONNRESET`.

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
> - **Autonomous build push (23 net-new sections, all `node qa/ct-qa.mjs` + Theme Check 0-offenses clean):**
>   - **W5 section library COMPLETE (14):** ct-pricing-table, ct-steps, ct-stats, ct-icon-columns, ct-timeline, ct-tabs, ct-before-after, ct-cta-banner, ct-accordion, ct-quote, ct-hero, ct-hotspots, ct-divider, ct-gallery.
>   - **W3 support (3):** ct-trust-bar (native `payment_type_svg_tag`), ct-shipping-estimate (Liquid date-window), ct-size-chart.
>   - **W6 overlays (3):** ct-promo-popup (timed, `request.design_mode`-safe, localStorage cap), ct-scroll-to-top, ct-cookie-bar.
>   - **Commerce-display (3):** ct-product-upsells, ct-collection-grid, ct-featured-product-cta (add-to-cart via the existing ct-upsell-card / Dawn product-form; deferred scripts).
>   - **W1.T18 (partial):** `lighthouserc.json` budgets wired to the existing CI Lighthouse action.
>   - **Bug fixes:** button ghost-frame (`--buttons-radius` sync), cart-notification corner sync.
>   - All token-only CSS, neutral presets/defaults, 0 brand/proof; interactive sections use idempotent, section-scoped, reduced-motion-aware IIFE scripts.
> - **Commerce build (guard-clean; cart-AJAX follows Dawn's tested product-form pattern but is functionally UNVERIFIED — the dev preview is down on `read ECONNRESET` Shopify-connectivity errors):** ct-product-upsells, ct-collection-grid, ct-featured-product-cta, ct-free-shipping-bar (wires the dead `ct_free_shipping_threshold_cents` setting), ct-cart-upsells, ct-bundle (multi-add via `cart.getSectionsToRender()`/`renderContents()`), ct-bundle-card snippet, ct-cart-savings, ct-recently-viewed, ct-discount-banner (native discount-URL apply + copy), ct-gift-offer (threshold + manual add, no oscillation), W6.T01 header sticky modes. **44 `ct-*` sections total** (see `docs/ct-sections.md`).
> - **W3 PDP BLOCK LIBRARY — COMPLETE (dual-host, 2026-06-13, branch `custom-theme`):** the full Shrine-parity PDP block set is now registered as `{%- when -%}` cases **in BOTH `sections/main-product.liquid` AND `sections/featured-product.liquid`** (dual-host rule), each implemented as a shared `snippets/ct-*.liquid` + token-only CSS + idempotent section-scoped JS, all seeded into `templates/product.json`:
>   - **quantity_breaks** (per-unit variant selects, full AC), **sticky_atc**, **bundle** (FBT multi-add via Dawn `cart.getSectionsToRender()`/`renderContents()`), **product_upsells** (manual/recommendations), **shipping_estimate** (Liquid date-window + checkpoints), **discount_code** (native discount-URL apply via `routes.root_url` + copy), **size_chart** (Dawn `<modal-dialog>`), **custom_field** (line-item properties, capture-phase required-enforcement), **gift_offer** (threshold, no-oscillation engine), **reviews_showcase** (metafield-bound aggregate, G-05 no-fabrication), **savings_line** (variant-real savings, hidden off-sale, floor() parity with the Liquid render).
>   - Hardened by **two adversarial Workflow bug-hunts + one agent review → 29 real defects fixed** (filter-precedence ×4, image-alt escape ×2, missing `res.ok` ×2, double-click cart races, broken radiogroup, inert required-validation, i18n literal leaks, money-format gaps). Cart-functional smoke (headless, via `cart/*.js` round-trips) verified 6/6: qty-N add, multi-line aggregation, sold-out atomic reject, custom-field property lands, gift round-trip.
>   - Every block: `node qa/ct-qa.mjs` green + Theme Check 0 offenses + `node --check` clean. **G-07 Dawn-native cart pipeline** throughout (no bespoke cart mutation); **no Dawn commerce-logic edits** — purely additive `when`-cases + schema.
> - **W0.T03 — DONE:** `.gitattributes` (`* text=auto eol=lf` + explicit text/binary rules) committed; CRLF audit allowlist reset to `{}`; LF enforced on commit — ends the recurring CRLF-drift friction.
> - **Font — DONE (picker-driven):** `type_header_font` default → `poppins_n4` (heading), `--font-body-family: 'Inter'` retained; `--ct-font-display/-heading` wired to `var(--font-heading-family, …)` so the Dawn font-picker drives it with a safe fallback.
> - **WD.T03 — RESOLVED (keep cluster):** `ct_free_shipping_threshold_cents` is now wired (consumed by `ct-free-shipping-bar.liquid`); its two siblings `ct_reward_thresholds_by_currency` + `ct_discount_threshold_cents` are the same cart-threshold cluster reserved for the W4 rewards/discount bar — kept intact (deleting siblings of a wired setting makes a half-cluster + re-add churn), not dead garbage.
> - **Truly remaining (preview-gated — needs a working `shopify theme dev` render; the additive/headless lane is now exhausted):** browser/interaction QA of all the new PDP blocks + the restored Dawn header/footer; **Dawn-CORE buy-box edits** (price-in-button, variant-picker, buy-buttons upgrades) and **W3.T10 media gallery** (monolithic gallery → block) — these touch the live buy box, unsafe blind; **W4 cart-drawer blockification + rewards/checkpoints bar + TnC checkout gate** (rewrites the live cart / gates checkout — a bug breaks ALL purchases, hard 🔒); **W6.T02 mega-menu**; the **W1 visual lane** (T03 light-lock OFF verify, T10/T11 px+breakpoint retrofit, T13 `theme-overrides` triage, T14 `.gs-scope` retirement, W0.T05 screenshot baseline — prereq for all visual 🔒); **W6.T05 RTL** logical-property sweep. Blocker: sustained Shopify API transfers on this machine drop on `ECONNRESET`/`socket hang up` (dev preview + `theme push` both unreliable); resolves when the connection recovers or from a different network.
> - **2026-06-14 session (branch `custom-theme`, live-QA driven; every change `ct-qa` + Theme Check 0-offenses, pushed to preview `161500889343` + GitHub):**
>   - **Live-QA visual/UX fixes:** product-grid gap 8→20px (global `spacing_grid_*`); sign-up + thank-you popup celebratory success state (`ct-promo-popup`, wired site-wide via `footer-group`); coverage pass — **defined the missing `.ct-btn` component** (account-page buttons were inert), demo free-shipping threshold reset to `0` (the QA-banned seed), cookie-bar/search/404/page + blog-post token swaps; **footer Minimals dark skin** (new additive `assets/section-ct-footer.css` + `--ct-footer-*` tokens — implements the never-shipped P5 footer spec); **all gallery/card/thumbnail images now uncropped** (`object-fit:contain` + surface bg on `.media`/card/quick-add) + reduced-motion-safe video autoplay; **regular product page switched to the CT single-hero gallery** (`product.json` main → `ct-product-buy`: dots + desktop arrows, no thumbnail rail).
>   - **Cart fixes:** drawer now shows line items on **first add from an empty cart** (`CartDrawer.renderContents` cleared `is-empty` from the wrong node); drawer **overlay → fixed dark scrim** (`--ct-overlay-bg`) so the page stays visible behind the panel on desktop (Shrine-style, was a white wash).
>   - **Buy-box image lightbox → Dawn parity:** reuse the already-loaded gallery image (no separate 2200px fetch), **fixed-size visible card** (no size-jump between slides), lighter shadow + reused `<img>` node, reduced-motion autoplay gate.
>   - **W1.T13 (partial):** converted the 7 exact-match px-spacing literals in `theme-overrides.css` to `--ct-space-*` (14→7); token allowlist re-baselined tighter (`section-ct-components` 155→153, `section-ct-responsive` 20→19, `theme-overrides` 14→7). Remaining `theme-overrides` px are intentional (iOS-16px font guard, negative spinner-centering, 2/10/18px non-scale values); the 2 `!important` are justified Dawn overrides.
>   - **Matrix reconciliation (the status matrix BELOW lags reality — trust this log):** DONE but shown todo/partial — W0.T02 `product.landing.json`, W0.T03 `.gitattributes`/LF, **W1.T05–T08** token emission (present in `css-variables.liquid`), W1.T17 color-scheme partial, **W2** primitives T01–T09, **W5** 14-section library, **W6.T02** mega-menu (Dawn-native), **W3** PDP blocks + buy-box + gallery, **W4** cart (~95%).
>   - **Genuine remaining backlog:** W1 visual lane — T10 (px/breakpoint retrofit), T11 (type-clamp→tokens), T13 (remaining `theme-overrides` triage), T14 (`.gs-scope` retirement); W1.T18 (screenshot/Lighthouse CI artifacts); W0.T05 (baseline capture); W1.T03 (light-lock OFF verify); W6.T05 (RTL + a11y/perf); W4.T02b (multi-tier checkpoints bar, low value). All except T13 px-hygiene need live-preview/screenshot verification, which the live-QA pass is now exercising.

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
| W1.T10 Section token retrofit + unified breakpoints | 🟡 ⚙️ | 🔒 | **2026-06-14: exact-match spacing px → tokens in section-ct-* (38 font-size + 6 padding/margin), zero visual change**; remaining are non-scale px (9/11/13/14/18px) + legacy 620/760/780/820/1040 breakpoints (changing breakpoints shifts layout → needs live verify) |
| W1.T11 Typography retrofit | 🟡 ⚙️ | 🔒 | **2026-06-14: 38 exact-scale `font-size` px → `--ct-text-*` in section-ct-* (CT font-size px 97→59), zero visual change**; remaining are odd values (13.5/11.5px) + clamps (e.g. `.gs-section-heading`) whose mapping to the scale changes sizes → needs live verify |
| W1.T12 Split `section-ct-page.css` (2,510 lines) | ✅ | ⚙️ | Split into `section-ct-base/components/responsive.css`, loaded in order; byte-identical concat (no-op). Per-section loading deferred. |
| W1.T13 Triage `theme-overrides.css` → 0 | 🟡 ⚙️ | 🔒 | **2026-06-14: 14→7 px-literals** (exact-match spacing → `--ct-space-*`); remaining 7 are intentional (iOS-16px font, negative spinner-centering, 2/10/18px non-scale) + 2 justified `!important`. Allowlist re-baselined. |
| W1.T14 Retire `.gs-scope` | ⬜ | 🔒 | 27 occurrences (14 in CSS + 13 sections); needs full screenshot matrix |
| W1.T15 Brand/IP purge | ✅ | ⚙️ | 0 leakage; brand-strip image-only |
| W1.T16 Preset & sync system | ✅ | ⚙️ | 4 presets; `ct-settings-sync` green |
| W1.T17 `color-scheme + overrides` partial (L4) | ⬜ | ⚙️ | No section exposes `color_scheme`; partial not created |
| W1.T18 CI hardening | 🟡 | ⚙️ | `ct-qa` workflow runs; **no Lighthouse budgets / screenshot artifacts** |

### W2 — Shared primitives — **all ⬜ todo**
`price-tokens` (T01), `upsell-card` (T02), `rating-stars`/`trustpilot-stars` (T03), `<copy-button>` (T04),
`<countdown-timer>` (T05), reveal engine v2 (T06), `<ct-carousel>` (T07), `icon.liquid` system (T08),
toast service (T09). **None exist.** All ⚙️ headless-safe to build (net-new files; don't alter current rendering until adopted).

### W3 — PDP block library — **block set ✅ (dual-host); Dawn-core buy-box + media gallery 🔒**
**✅ Done (2026-06-13, additive `when`-cases in main-product **and** featured-product, seeded in `product.json`):**
T01 Quantity-breaks ✅ (`ct-quantity-breaks` block, per-unit variant selects) · T02 Sticky-ATC ✅ (`sticky_atc` block) · T03 Bundle/FBT ✅ · T04 Gift offer ✅ · T05 Product upsells ✅ · T06 Shipping+checkpoints ✅ · T07 Discount code ✅ · T08 Size-chart modal + custom fields ✅ · T09 Reviews-showcase ✅ + Savings-line ✅. All `ct-qa`+Theme-Check green, hardened by 29 adversarial-bug-hunt fixes, cart-smoke 6/6.
**✅ Buy-box polish (2026-06-13, QA-passed on the dev server):**
T09 **price-in-the-Add-to-cart-button** ✅ BUILT — `<ct-atc-price>` in the shared `buy-buttons.liquid` (both hosts), variant-reactive via variantChange, default-off, non-`<span>` so it can't collide with Dawn's `toggleSubmitButton`; cannot affect the form submit. ·
T09 **variant-picker swatches/picker-type** ✅ **Dawn-native** — set `picker_type: button` + `swatch_shape` on the variant_picker block + assign swatch colors in Admin → Settings → Variants (no build). ·
T10 **media-gallery layout** ✅ **Dawn-native** — `gallery_layout` (stacked / thumbnail / thumbnail-slider / columns) + `media_size` + `media_position` + `mobile_thumbnails` section settings (no build).
The full PDP (block library + buy box) renders cleanly on the preview after the `scale_max` schema fix. **W3 effectively complete.**

### W4 — Cart system — **~85% ✅ (5 features shipped, adversarially reviewed); leftovers low-value**
**✅ Done (2026-06-13, additive into the Dawn cart drawer + cart page; all default-off where they touch live flows):**
T01 **Drawer blockification** ✅ — `sections/cart-drawer.liquid` is now a `{% section %}` block host (footer = subtotal/discount/terms/checkout/custom_liquid blocks, reorderable, editor `test_mode`), with a **verbatim no-block fallback** so the storefront never regresses and **post-loop guards** keeping `.cart-drawer__footer` + `#CartDrawer-Checkout` un-droppable (3-lens review, 3 fixes) ·
T02 **Free-shipping progress bar** ✅ (server-rendered inside the refreshed region, no JS, drawer + page) ·
T03 **Cart upsell rail** ✅ (exclude-in-cart, G-07 `ct-upsell-card` add, self-prunes on add) ·
T04 **Cart-level automatic free gift** ✅ (global counterpart of the PDP `gift_offer`; reuses the oscillation-safe `<ct-gift-engine>` with a new singleton actor-guard so a global cart-gift + a PDP gift block can't fight; focused review, 3 fixes incl. a replaceWith re-mount actor dead-state and a sold-out-422 retry loop) ·
T05 **TnC checkout gate** ✅ (drawer + page + dynamic Shop Pay buttons; aria-disabled + capture guard, never touches native `disabled`; consent resets on empty cart; 3-lens review, 6 fixes incl. two false-open leaks) + **discount field** ✅ (native discount link) ·
T06 **Cart-page parity** ✅ (all four mirrored onto `main-cart-footer`/`main-cart-items`).
All `ct-qa` + Theme-Check 0-offenses green. QA steps in `docs/ct-cart-qa-checklist.md`. **W4 now ~95%.**
**Remaining (low value, optional):** T02b multi-tier checkpoints bar (the free-shipping bar already covers the core reward UX; the standalone `ct-cart-checkpoints` section exists but isn't drawer-integrated). Needs preview for interaction QA.

### W5 — Section library — **mostly ⬜; bases exist**
T01 social-proof 🟡 (`ct-reviews`, `ct-brand-strip`) · T02 tickers 🟡 (`ct-trust-marquee`, `ct-announcement-bars`) · T03 comparison 🟡 (`ct-comparison`) · T05 builders 🟡 (`ct-feature-blocks` + Dawn natives) · T06 forms 🟡 (`ct-email-signup`, `ct-faq`, `contact-form`) · T04 hotspots/heroes ⬜. All 🔒.

### W6 — Nav, overlays, hardening — **partial**
T01 header sticky modes ✅ · T03 promo-popup / scroll-to-top / cookie-bar ✅ · T04 security panel ✅ (⚙️, default-off) ·
**T02 mega-menu ✅ (Dawn-native)** — the restored Dawn 15.4.1 header already ships full mega-menu support: set `menu_type_desktop: 'mega'` in the header section + structure the nav linklist with nested children; `header.liquid` renders `header-mega-menu` + loads `component-mega-menu.css`. Per the "use native Shopify elements" principle, no custom build needed (Shrine's image/promo-panel mega-menu blocks would be the only DELTA, and that's an "extra" beyond the reference). ·
**🔒 Remaining:** T05 RTL sweep (logical-property conversion — LTR-safe but needs an RTL render to verify) · a11y/perf hardening pass. Need preview.

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
