# Shrine-Parity Migration — Completion Status @ 5fd3a4d — 2026-06-13

## 1. Headline verdict

**NO — this is not finished.** Of 60 tasks, **12 are done, 39 partial, 9 not-started, 0 awaiting live QA.** On a weighted basis (partials credited at roughly one-third), real completion sits near **38–42%** — call it **~40%**. The token foundation, QA-audit harness, and W2 shared primitives are genuinely solid, but the headline architectural goals of "Shrine parity" remain unmet: stock Dawn header/footer were never restored (they were inverted into custom gs-scope sections), the `.gs-scope` model is still live in 53 liquid files, `theme-overrides.css` is a 368-line live stylesheet that was never triaged, the PDP block library (W3) is almost entirely the wrong deliverable (standalone sections, not registered blocks), the cart drawer is still stock Dawn with no block host, and large swaths of W5/W6 sections are missing or stock. This is a **multi-week, full-theme rebuild**, not a finishing pass. Treat the "partial" count as work-in-progress, not near-done — most partials are missing their core acceptance criteria, not edge cases.

## 2. Per-workstream summary

| Workstream | Done | Partial | Not-started | Needs-QA | State |
|---|---|---|---|---|---|
| W0 Repair | 2 | 2 | 1 | 0 | Mixed; T01 header/footer effectively inverted, no baseline captured |
| W1 E1–E3 (tokens/skins/spacing) | 2 | 9 | 0 | 0 | Token foundation strong; skins live only on dev styleguide |
| W1 E4–E6 (CSS split/scope/CI) | 1 | 4 | 2 | 0 | Presets done; .gs-scope + overrides retirement not started |
| W2 Shared primitives | 5 | 4 | 0 | 0 | Strongest workstream; toast + carousel under-wired |
| W3 PDP block library | 0 | 7 | 3 | 0 | Almost entirely wrong deliverable (sections, not blocks) |
| W4 Cart system | 0 | 5 | 1 | 0 | Standalone sections built; drawer block-host architecture absent |
| W5 Section library | 1 | 5 | 0 | 0 | Core singles landed; many named sub-deliverables missing |
| W6 Nav/Overlays/Hardening | 1 | 3 | 2 | 0 | Security panel done; mega-menu + RTL not started |
| **Total** | **12** | **39** | **9** | **0** | **~40% weighted — not parity** |

## 3. Full task matrix

### W0 Repair

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W0.T01 Restore Dawn header/footer; park gs; menu+localization+sticky | not-started | Custom `gs-scope` header.liquid (177L) / footer.liquid (172L) shipped instead of Dawn 15.4.1 (~900L); no `enable_country/language_selector`, no predictive-search, no localization-form | Stock Dawn header/footer NOT restored — inverted into custom gs versions; no localization controls; no parked gs-header/gs-footer files |
| W0.T02 Rebuild product.json on main-product; move funnel to product.landing.json | done | product.json main-product with stock Dawn block_order + related-products; product.landing.json hosts gs funnel | — |
| W0.T03 LF normalize + .gitattributes; zero CRLF | partial | No `.gitattributes`; `git grep -lI CR` = 85 files; allowlist audit qa/ct-crlf-audit-allowlist.json baselines them | Core AC unmet: no .gitattributes, 85 CRLF files remain; built a fail-on-new allowlist that ACCEPTS existing CRLF instead of normalizing |
| W0.T04 Rename gardenstudio_benefits→benefits_checklist; sweep gs strings; grep→0 | done | main-product.liquid block type `benefits_checklist`; `git grep gardenstudio` over shippable dirs = 0 | — |
| W0.T05 Baseline capture (Lighthouse + 6 viewports + token report) to /qa/baseline/ | not-started | No `qa/baseline/` dir; only qa/design-audit/ (gainssteel, out of scope) + docs/ct-theme-check-baseline.md | No baseline dir, no Lighthouse report, no screenshots, no token report committed |

### W1 E1–E3 (token foundation, skin panels, spacing)

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W1.T01 token-audit.mjs (hex/px/--gs-/!important, CI fail-on-new) | done | qa/ct-token-audit.mjs scanners + compareToAllowlist + --ci exit 1; wired in ct-qa.mjs + ct-qa.yml | — |
| W1.T02 Restructure css-variables L1→L3; scales; rename accent→action w/ aliases | partial | L1/L2/L3 comment layers; --ct-action aliases; rhythm/type/motion/focus tokens present | Rhythm pair hardcoded clamp() not 2 range settings; **space scale DOUBLE-DEFINED** (--ct-space-1..12 then re-declared 1..8 with different px — later wins) |
| W1.T03 Scheme bridge + light-lock SETTING; remove body{!important} | done | [class*=color-scheme-] maps --ct surfaces→--color-*; ct_force_light_mode checkbox; no body{!important} | — |
| W1.T04 Move --gs- shim to deprecated-aliases.css; audit blocks new consumers | partial | Audit blocks new --gs- (no gs bucket in allowlist); 0 --gs- refs anywhere | `assets/deprecated-aliases.css` does NOT exist; consumers eliminated outright so named artifact is absent |
| W1.T05 Extended Typography panel (ratio/weight/letter-spacing/uppercase) | partial | Tokens consume Dawn heading_scale + body_scale | Panel is STOCK Dawn; NO scale-ratio, weight, letter-spacing, or uppercase toggle — "extended" panel not built |
| W1.T06 Buttons panel ext (radius/border/shadow/hover/min-height)→--ct-btn-* | partial | --ct-btn-* cluster defined; Dawn .button skinned globally | Panel is stock Dawn; global .button does NOT consume --ct-btn-* cluster (consumed only in dev styleguide); no soft/hard-lift shadow choice |
| W1.T07 Control-skin panels ×5 (pills/dropdowns/qty/swatches/slider) | partial | Token clusters + color dictionary + styleguide proof exist | No merchant skin PANELS beyond stock; NO component-*.css applies clusters to real Dawn controls — skins render only on dev proof sheet |
| W1.T08 Animations panel + --ct-reveal-* tokens + body data-flags | partial | --ct-reveal-* tokens consumed by ct-reveal.js; reveal gate in theme.liquid | Animations panel is stock Dawn; body carries Dawn animate--hover-* class, not bespoke --ct-reveal data-flags |
| W1.T09 section-padding partial (4 ranges) + section-shell.liquid + doc | partial | ct-section-padding.liquid + docs/ct-section-authoring.md exist | Only 2 ranges + 0.75 mobile multiplier (not 4 independent); **section-shell.liquid MISSING**; doc misnamed |
| W1.T10 Retrofit 13 gs sections; unify breakpoints 560/750/880/990; 0 px-literals | partial | 0 --gs- refs; gs→ct rename complete (49 ct sections) | Breakpoints NOT unified (750/990 absent; ~22 ad-hoc remain); 192 px-literal paddings allowlisted not removed |
| W1.T11 Typography retrofit→L1 steps; remove font-size literals; shared heading group | partial | L1 type steps exist; base headings use tokens | 61 hardcoded `font-size: NNpx` in section-ct-components.css, ZERO var() font-sizes; no shared heading schema-group snippet |

### W1 E4–E6 (CSS split, scope retire, debrand, presets, CI)

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W1.T12 Split section-gs-page.css per-component/section; delete it | partial | section-gs-page.css deleted; replaced by 3 global ct CSS files | Split is 3 monolithic buckets not per-component; named component-*.css files absent; loaded globally not per-section |
| W1.T13 theme-overrides.css triaged to ZERO + overrides-ledger.md | not-started | theme-overrides.css still 368L w/ 113 --ct- usages, still loaded; no ledger | File not triaged or deleted; still styling storefront; no ledger; zero progress |
| W1.T14 Retire .gs-scope (grep→0); de-scope to 0-2-0 | not-started | grep gs-scope = 53 liquid files + base CSS descendant selectors | Target was 0; 53 files + base CSS still scoped; selectors not de-scoped; specificity goal unmet |
| W1.T15 Brand/IP purge: gs-brandmark→logo; press SVGs removed; seed replaced; grep→0 | partial | Seed/press content clean; brand-audit passes at zero; ct-brandmark uses shop.name | gs-brandmark NOT renamed to logo settings (still `<span class="gs-brandmark">`); .gs-brandmark CSS persists |
| W1.T16 Preset & sync system (Studio Neutral default, Terracotta, Forge); settings-sync | done | Default/Studio Neutral/Terracotta/Forge presets (Default ≡ Studio Neutral); ct-settings-sync.mjs verifies + wired to CI | — (script renamed ct-settings-sync.mjs, functionally equivalent) |
| W1.T17 schema-color-scheme + overrides partial (L4); reference on reviews + image-banner | partial | ct-color-scheme.liquid implements L4 select + custom bg/text/accent re-declares | Reference targets NOT wired: ct-reviews + image-banner don't use it; rendered only in dev styleguide |
| W1.T18 CI hardening (token/sync/theme-check/Lighthouse/CRLF/screenshot baseline) | partial | ct-qa.yml orchestrates token/sync/brand/content/schema/CRLF; theme-check + Lighthouse in ci.yml; lighthouserc.json budgets | Screenshot/visual-regression baseline absent; no playwright/puppeteer in qa or workflows |

### W2 Shared primitives

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W2.T01 Dynamic price-token formatter (7 tokens, re-resolve on variant/qty) | partial | ct-price-tokens.liquid resolves all 7 server-side; ct-price-tokens.js exposes resolvePriceTokens + auto-wire | Nothing in production dispatches `ct:price:refresh` on real variant/qty change; only emitter is dev styleguide |
| W2.T02 Upsell card snippet + component-upsell-card.css + ATC via product-form | partial | ct-upsell-card.liquid uses Dawn product-form + name="add"; styles in component-ct-carousel.css | Named `component-upsell-card.css` does not exist (folded into carousel CSS); only invoked in styleguide |
| W2.T03 Star-rating pair (half-star, tokens, metafield bind, no fake default) | done | ct-rating-stars.liquid renders nothing when rating≤0; half-star via clip; trustpilot style param; metafield bind demoed | — (one snippet w/ style param vs two snippets — functionally equivalent) |
| W2.T04 `<copy-button>` (payload, copied state, insecure-context fallback) | done | ct-copy-button.js: clipboard when secure else execCommand fallback; copied state; aria-live; keyboard | — |
| W2.T05 `<countdown-timer>` (fixed/daily/evergreen, expiry, SSR-safe no-CLS) | done | ct-countdown-timer.js: 3 modes; expiry hide/zero/restart; SSR-safe keeps markup until first tick | — |
| W2.T06 Reveal engine v2 (W1.T08 tokens, stagger, repeat, RM, editor-safe) | done | ct-reveal.js consumes all --ct-reveal-* tokens; stagger/repeat; prefers-reduced-motion; section:load re-init; idempotent | — |
| W2.T07 Slider extends Dawn slider-component (loop/peek/autoplay/per-bp widths) | partial | Standalone `<ct-carousel>` w/ scroll-snap, arrows, dots, keyboard, autoplay | Does NOT extend Dawn slider-component (from-scratch); no loop, no peek, no per-breakpoint widths (hardcoded 100%); only autoplay of 4; styleguide-only |
| W2.T08 Icon system (name param, ~60 icons, image-upload fallback, currentColor) | done | ct-icon.liquid maps 72 aliases→25 SVGs; image-upload override; unknown→empty; inherits currentColor | — (nit: 25 distinct glyphs; color inherited not explicit fill) |
| W2.T09 Toast service unification (single aria-live host, queue); all ATC paths reuse | partial | ct-toast.js single host + queue + hover pause + window.CT.toast; loaded globally | "All ATC paths reuse it" UNMET — only ct-security.js + styleguide call it; cart.js/product-form.js call = 0 |

### W3 PDP block library

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W3.T01 Quantity Breaks tier engine (≤4 tiers, 3 layouts, badge, compare, live price) | partial | ct-product-buy.liquid has tier loop + badge + tier_compare + per-unit selects + qty 1–4 | Standalone section, NOT a PDP block in main/featured-product; no 3-layout switch; no max_blocks cap; selects not JS-wired; no W2.T01 live-price integration |
| W3.T02 Sticky ATC block (show-matrix, button function, IO trigger, bidirectional sync) | partial | ct-sticky-atc.liquid sticky bar + ATC + one-way price; toggle in ct-page.js | Standalone section not block; no show-matrix; no button-function option; scroll listener not IntersectionObserver; no bidirectional variant sync |
| W3.T03 Bundle offer block (main + ≤2, per-product variant/qty, combined price, multi-add) | partial | ct-bundle.liquid main+2 addons, combined total, single multi-add CTA | Standalone section not block; NO per-product variant selector (hidden first-variant id); qty hard-coded to 1 |
| W3.T04 Gifts on quantity (threshold ladder, auto add/remove, one-per-cart, locked) | partial | ct-gift-auto.liquid auto add/remove via _ct_gift property; one-per-cart; locked/unlocked | Standalone section not block; single threshold only (no ladder); runtime add/remove unverified without live cart QA |
| W3.T05 Product upsells block (W2.T02 host, manual/recs, exclude-in-cart, list/slider) | partial | ct-product-upsells.liquid renders ct-upsell-card over product_list | Standalone section not block; manual list only — no recommendations mode, no exclude-in-cart, no list/slider toggle |
| W3.T06 Shipping estimate + checkpoints pair (shared date engine, tz, locale, 3-step) | partial | ct-shipping-estimate.liquid computes window; ct-cart-checkpoints.liquid progress bar | Not a block; NO shared date engine; no tz/excluded-weekday/locale handling; checkpoints is a free-ship progress bar not a 3-step delivery timeline |
| W3.T07 Trust set (7 blocks: payment/urgency/benefits/text-with-icon/icon-grid/divider/link) | partial | main-product registers 6 of 7 trust blocks | 7th block text-with-icon absent (only icon-with-text); **authoring rule unmet** — featured-product registers only icon-with-text |
| W3.T08 Clickable discount + Sizing modal + Custom fields (line-item props, validation) | not-started | No clickable discount block; ct-size-chart has no modal; only Dawn gift-card props exist | All three absent as PDP blocks: no discount block, no sizing modal, no custom-fields block; none registered |
| W3.T09 Reviews showcase block + upgraded price/variant/buy/collapsible (Dawn-parity off) | not-started | PDP price/variant/buy all call stock Dawn renders; reviews only as standalone ct-reviews | No PDP Reviews showcase block; no savings line / swatch dictionary / price-in-button; pickers remain stock Dawn |
| W3.T10 Media gallery (slide-width, video group, badge slot, hide-variant) + featured mirror ALL blocks | partial | hide_variants + enable_video_looping (both stock Dawn) | Only hide-variant met (stock Dawn); no mobile slide-width, video-autoplay group, or badge slot; **featured-product mirror of ALL blocks essentially unmet** (2 vs ~17) |

### W4 Cart system

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W4.T01 Drawer blockification (block host + test-mode + width/scheme overrides) | not-started | cart-drawer.liquid is 1-line render of stock-Dawn snippet; no schema/blocks/design_mode | No block host, no reorderable blocks, no request.design_mode, no width/scheme overrides — none exists |
| W4.T02 Free-ship progress bar + multi-tier checkpoints (≤3, icon, reached, gift link) | partial | ct-free-shipping-bar.liquid + ct-cart-checkpoints.liquid w/ icons, reached state, live cartUpdate JS; 3-milestone preset | No ≤3 enforcement; no optional gift-link setting; threshold defaults to 0 (hidden); reached/fill render owed to QA |
| W4.T03 Drawer upsells (W2.T02 host, exclude-in-cart, recs) + trust; add-from-drawer no reload | partial | CART-PAGE upsell rail excludes in-cart + product-form AJAX; footer trust row + payment badges | This is the cart PAGE not the DRAWER; drawer has no upsell/recs host; manual list not recommendations; no drawer trust blocks |
| W4.T04 Conditional gift engine (value/item trigger, auto add/remove, one-per-cart, oscillation-safe) | partial | ct-gift-auto.liquid value-trigger + auto add/remove + one-per-cart + busy guard + 350ms debounce | Only VALUE trigger; no ITEM trigger; live oscillation-under-bursts behavior needs browser QA |
| W4.T05 Discount field (AJAX apply, chips, errors) for drawer + footer block; TnC gate; countdown | partial | TnC gate solid (disables checkout until checked, fail-open); discount section exists | Discount is `/discount/CODE` full-page redirect, NOT AJAX apply; no chips/errors; standalone section not footer block; not in drawer; no countdown block |
| W4.T06 Cart-page parity + savings line + note block | partial | ct-cart-savings.liquid + ct-cart-note.liquid + footer trust/payment badges | Savings/note are standalone SECTIONS not footer/cart-items blocks; none wired into cart.json; main-cart-items unmodified; no two-column parity layout |

### W5 Section library

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W5.T01 Social proof (testimonials, logo-list, results, FB-style, Trustpilot wall) | partial | ct-reviews (testimonials), ct-brand-strip (logo-list), ct-stats (results) | No FB-style testimonials; no Trustpilot wall; carousel dots are non-focusable `<b>` click-only — "carousel keyboard ops" AC fails |
| W5.T02 Tickers (horizontal text/image/review + fill/watchdog + RM override, vertical, announcement blocks) | partial | ct-trust-marquee (text+icon), ct-announcement-bars | Ticker is text+icon only (no image/review types); fixed CSS 6× repeat, no JS fill/watchdog; no RM override setting; no vertical-ticker |
| W5.T03 Comparison & tabs (comparison us-vs-them, before/after, content-tabs, pricing) | done | ct-comparison (us-vs-them+highlight), ct-before-after (pointer+keyboard slider), ct-tabs (full ARIA+arrow keys), ct-pricing-table | — (minor: mobile comparison is horizontal-scroll not row-collapse) |
| W5.T04 Hotspots & heroes (shoppable, product-features, video-slider, slideshow-hero, parallax-hero) | partial | ct-hotspots (keyboard-reachable), ct-video-gallery (video-slider) | No product-features; no slideshow-hero (ct-hero is single-media); no parallax-hero (zero parallax anywhere) |
| W5.T05 Builders (custom-columns 14 types, icon-bar, icons-with-content, Dawn upgrades, divider, groups) | partial | ct-divider, ct-feature-blocks (icon-bar), ct-icon-columns, header/footer groups | No custom-columns (14 types); NO stars/ATC upgrades to Dawn multicolumn/multirow/rich-text/image-banner/image-with-text (all stock) |
| W5.T06 Forms & misc (contact builder, email upgrades, FAQ icons, quick-add, bundle, 17TRACK, templates) | partial | ct-bundle (real product binding), ct-email-signup, ct-faq | Contact-form stock Dawn (no builder blocks); FAQ no icon library; quick-add native (ct-collection-grid has no ATC); no 17TRACK/track-order; no page.faq.json/page.track-order.json |

### W6 Navigation, Overlays, Hardening

| Task | Status | Evidence | What's missing |
|---|---|---|---|
| W6.T01 Header Shrine deltas (sticky ×4, logo positions, active-link, mobile secondary/title/scheme) | partial | sticky hook + 3 sticky modes; on-scroll-up JS; mobile menu exists | Only 3 sticky modes (AC wants 4); no logo-position; no active-link highlight (no aria-current); no documented focus trap; no mobile secondary menu/title/scheme — it's a minimal landing nav |
| W6.T02 Commerce mega-menu (collection products/child images, toggles, section-rendering) | not-started | Only stock Dawn link-only header-mega-menu.liquid, explicitly unreferenced by active header | No commerce mega-menu; no products/images, no desktop/mobile toggles, no Section Rendering path — none exists |
| W6.T03 Overlays (promo-popup, scroll-to-top, music players opt-in) | partial | promo-popup (delay/frequency/email-or-code, design-mode-safe) + scroll-to-top fully built; cookie-bar bonus | Music players (opt-in) entirely absent — no music/audio/player section anywhere |
| W6.T04 Security panel (copy-protect default OFF + client-side disclaimer notice) | done | ct_copy_protect default false, gated load, ct_security_notice + a11y disclaimer; ct-security.js documents limitation | — (country notice = client-side disclaimer per plan's parenthetical) |
| W6.T05 RTL stylesheet + logical-properties sweep; locale missing-key audit = 0 | not-started | No RTL stylesheet; single stray padding-inline; no locale audit in QA suite | No RTL stylesheet, no logical-properties sweep, no automated locale missing-key audit — none exists |
| W6.T06 Hardening (a11y pass, perf budgets, CLS audit, docs/styleguide, GA scorecard ≥95%) | partial | Dev styleguide + docs + lighthouserc + RM guards present | No a11y/axe pass, no CLS audit, no GA scorecard automation/evidence; audit legs need live browser/SR/Lighthouse QA |

## 4. Critical NOT-DONE blockers to "parity" (ranked)

1. **W3 PDP block library (T01–T10) — wrong deliverable, ~0 registered blocks.** The entire PDP feature set was built as standalone `ct-*` sections, not as blocks registered in BOTH `main-product.liquid` and `featured-product.liquid` (the explicit authoring rule). PDP price/variant-picker/buy-buttons remain stock Dawn. This is the single largest gap to parity and effectively un-started against its own acceptance bar.
2. **W0.T01 Dawn header/footer restoration — inverted.** Stock Dawn 15.4.1 header/footer were not restored; custom 177/172-line gs-scope sections replaced them and lack localization (country/language selectors) and predictive search. Everything in W6.T01/T02 (Shrine header deltas, commerce mega-menu) is built on a nonexistent foundation.
3. **W1.T14 Retire `.gs-scope` — not started (53 files).** The `.gs-scope` descendant model is intact across 53 liquid files + base CSS; the 0-2-0 specificity re-architecture and Dawn pixel-stability goal are unmet. This blocks clean cascade parity.
4. **W1.T13 `theme-overrides.css` triage to zero — not started.** Still a live 368-line stylesheet with 113 token usages, still loaded; no `overrides-ledger.md`. The override surface the plan wanted emptied is fully intact.
5. **W4.T01 Cart-drawer blockification — not started.** Drawer is a 1-line render of a stock-Dawn snippet: no block host, no test-mode, no width/scheme overrides, nothing reorderable. The cart architecture the plan centered on does not exist.
6. **W1.T12 CSS-file split — partial, wrong shape.** `section-gs-page.css` was deleted, but into 3 monolithic global buckets, not the per-component/per-section model; named `component-*.css` files (marquee/toast/sticky-bar/lightbox/media-slot/upsell-card) are absent.
7. **W6.T02 Commerce mega-menu — not started.** Only the stock Dawn link-only snippet exists and it isn't even wired to the active header.
8. **W0.T03 CRLF/`.gitattributes` — not normalized.** No `.gitattributes`; 85 tracked files still CRLF; the team built an allowlist that tolerates them rather than normalizing to LF.
9. **W6.T05 RTL + locale audit — not started.** No RTL stylesheet, no logical-properties sweep, no locale missing-key audit.
10. **W0.T05 Baseline capture — not started.** No `qa/baseline/`, no Lighthouse/screenshot/token baseline; regressions can't be measured against parity.

Cross-cutting: skin tokens (W1.T05–T08) and several primitives (W2.T01/T02/T07/T09) exist but are wired ONLY into the dev-only `ct-styleguide.liquid`, not live components — visually present in the proof sheet, absent on the real storefront.

## 5. What IS solidly done (accurate credit)

- **Token-audit + QA harness (W1.T01, W1.T16, partial W1.T18):** `ct-token-audit.mjs` (hex/px/--gs-/!important, fail-on-new) and `ct-settings-sync.mjs` (schema↔preset) wired into a real CI orchestrator (`ct-qa.yml` + `ci.yml` theme-check/Lighthouse). The Default/Studio Neutral/Terracotta/Forge preset system is complete and verified.
- **Token foundation (W1.T02 mostly, W1.T03):** L1→L3 layered `css-variables.liquid`, `--ct-action` aliases, working scheme bridge mapping `--ct` surfaces onto Dawn `--color-*`, and a real `ct_force_light_mode` setting; `body{…!important}` removed.
- **W2 shared primitives (T03, T04, T05, T06, T08):** half-star rating with no fake default, `<copy-button>` with insecure-context fallback, `<countdown-timer>` (3 modes, SSR-safe, no CLS), reveal engine v2, and the 72-alias icon system are all genuinely complete and meet core AC.
- **W0.T02 + W0.T04:** product.json rebuilt on `main-product` with stock Dawn block order (funnel relocated to product.landing.json), and the `benefits_checklist` rename with a clean `gardenstudio`/`pollinook` grep over shippable dirs.
- **W5.T03 Comparison & tabs:** comparison (us-vs-them + highlight), before/after (pointer + keyboard slider), content-tabs (full ARIA + arrow keys), and pricing-table all meet core AC.
- **W6.T04 Security panel:** copy-protect default OFF, gated script load, documented a11y limitation — done correctly and conservatively.
- **`--gs-` consumer elimination (W1.T04/T10 partial credit):** 0 `--gs-` references remain anywhere, and the audit blocks reintroduction.

## 6. Honest next-step recommendation

Do not represent this as near-complete; it is roughly 40% and the remaining 60% includes the highest-effort architectural work. Recommended sequencing:

1. **Decide the foundation first (W0.T01).** Either truly restore stock Dawn header/footer + localization, or formally re-baseline the plan to accept the custom gs header/footer and rewrite W6.T01/T02 acceptance criteria. Everything in nav/header depends on this call. This is a product decision, not an inference — surface it to the user.
2. **Re-architect W3 as actual PDP blocks.** Convert the standalone `ct-product-*` sections into snippet+schema blocks registered in BOTH `main-product.liquid` and `featured-product.liquid`. This is the largest single body of work and the core of "PDP parity."
3. **Pay down the cascade debt (W1.T12/T13/T14 together).** Retire `.gs-scope`, triage `theme-overrides.css` to zero with a ledger, and split CSS into real per-component files. These are interdependent and gate pixel-stability parity.
4. **Build W4.T01 drawer block host**, then re-home the existing cart sections (savings/note/discount/upsells/gift) as drawer + footer blocks wired into `cart.json`.
5. **Wire the skin tokens and primitives off the styleguide and onto live components** (W1.T05–T08, W2.T01/T02/T07/T09) — much of the work exists but isn't connected.
6. **Close the foundation hygiene items**: `.gitattributes` + LF normalization (W0.T03), `qa/baseline/` capture (W0.T05), RTL + locale audit (W6.T05), and a screenshot/visual-regression baseline (W1.T18).
7. **Defer the live-QA legs** (a11y/CLS/GA-scorecard, cart-event runtime behavior) until the structural work lands — there is no point auditing components that are about to be re-architected.

Realistic estimate: this is a **multi-week, multi-milestone full-theme rebuild**, not a finishing pass. Stage it by workstream with the foundation decision (step 1) unblocked first.