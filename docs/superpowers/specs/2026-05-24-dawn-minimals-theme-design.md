# Dawn × Minimals — Theme Design Spec

**Date:** 2026-05-24
**Base:** Shopify Dawn 15.4.1 (present in repo) · **Design system:** Minimals (light-locked, Public Sans, green `#00A76F`)
**Reference:** Shrine Pro (patterns studied, never copied) · **Authoritative visual source:** `dawn-design-system.html` (3,848 lines, 40 component groups)

This spec reconciles three input documents into one buildable design:
- `dawn-theme-framework-v5.md` — the architecture + controlled Liquid-edit philosophy
- `dawn-implementation-plan.md` — the concrete file/task/phase breakdown
- `dawn-design-system.html` — the complete, authoritative component reference (source of truth for HTML structure, class names, tokens, states, motion)

---

## 1. Goal & principles

Turn the **completed** Minimals design system into a production Dawn theme by mechanical translation: demo HTML → Liquid sections + CSS. Because the design system is 100% complete (every component, state, and motion pattern is specified), **no creative/design decisions remain** — only faithful translation.

Non-negotiable principles (inherited from Dawn + framework v5):
- **Commerce is frozen.** Zero edits to Dawn's JS or to form/variant/price/cart **logic**.
- **Web-native, no dependencies.** Vanilla JS only (~260 lines across 8 files), all `defer`-loaded. No jQuery, no Slick, no build step.
- **Demo is source of truth.** Every class name and HTML structure comes from `dawn-design-system.html`. No invented class names.
- **Server-rendered.** All content via Liquid + schema; nothing hardcoded.

**Performance targets:** Lighthouse ≥70 mobile / ≥90 desktop on homepage, PDP, collection.

---

## 2. Locked decisions

| # | Decision | Choice |
|---|---|---|
| D1 | Reconciliation | Merge all three docs into this single spec |
| D2 | Namespace | `ct-` for classes/sections, `--ct-*` for tokens |
| D3 | Dawn Liquid edits | **Controlled additive edits** to 5 files — markup slots only, never logic |
| D4 | Scope | **Everything** — all 40 demo component groups (every extra is demo-backed) |
| D5 | Verification | Dawn store + Shopify CLI ready → live `shopify theme dev` preview + real commerce smoke-tests + Lighthouse after each phase |

**Correction to framework v5 (verified against the real Dawn 15.4.1 `card-product.liquid`):** Dawn already provides secondary-image-on-hover (`show_secondary_image`), a badge system, and quick-add. We **reuse those natives** and inject only what is genuinely missing (hover overlay + Quick-View trigger, %-off badge text). The framework's claim that these "do not exist in Dawn" is wrong for this version.

---

## 3. Architecture — three frozen layers

- **Layer 1 — Commerce engine (Dawn 15.4.1):** frozen. The "never-touch" list is law: `product-form`, `product-form__submit`, `name="add"`, `name="id"`, `name="quantity"`, `variant-selects`, `quantity-input`, `media-gallery`, `cart-drawer`/`cart-notification` JS, `data-section`, `data-product-id`, `data-update-url`, `data-media-id`.
- **Layer 2 — Design system:** `snippets/css-variables.liquid` (tokens) + `assets/theme-overrides.css` (all visual overrides) + 8 vanilla JS utilities + the 5 controlled Liquid edits.
- **Layer 3 — Component library:** `ct-*` Liquid sections, schema-driven, each with a `color_scheme` setting for independent per-section light/dark.

---

## 4. Token system

All custom tokens are emitted from **`snippets/css-variables.liquid`** — the only file that changes per brand. It reads Theme Editor settings (accent color, heading/body fonts, border radius, page width, glass opacity, free-shipping threshold) and emits `--ct-*` variables plus `font_face` declarations. Dawn's own `--color-*` variables are never overridden.

The light-mode lock is adapted from the demo. **⚠ Critical correction to framework v5:** the demo's standalone `html { font-size: 16px }` must **NOT** be applied to Dawn. Dawn uses `font-size: calc(var(--font-body-scale) * 62.5%)` (verified at `layout/theme.liquid:233`) so that `1rem = 10px`, and Dawn's entire sizing scale depends on it. Forcing `16px` would double every rem-based dimension. Our ported components are authored in **px** (root-independent), so we leave Dawn's root font-size untouched and only reset `body` letter-spacing:
```css
:root { color-scheme: only light }
html { color-scheme: only light; forced-color-adjust: none; }
body { background:#F4F6F8!important; color:#212B36!important; font-family:'Public Sans',system-ui,sans-serif; letter-spacing: normal !important; overflow-x: hidden; }
/* iOS no-zoom rule is handled in .ct-field (font-size:16px on inputs only), not on <html>. */
```

### 4.1 Token rename map (demo bare names → canonical `--ct-*`)

The demo CSS uses bare token names. The port does one mechanical find-replace using this map. (Demo bare names don't collide with Dawn's `--color-*`, so an optional transition alias `--brand: var(--ct-accent)` may be used to paste demo CSS verbatim, then renamed; final state is pure `--ct-*`.)

| Demo | `--ct-*` | | Demo | `--ct-*` |
|---|---|---|---|---|
| `--bg-base` | `--ct-bg` | | `--brand` | `--ct-accent` |
| `--bg-layer` | `--ct-bg-surface` | | `--brand-rest` | `--ct-accent-strong` |
| `--bg-elevated`/`--bg-card` | `--ct-bg-raised` | | `--brand-fg` | `--ct-accent-text` |
| `--bg-control` | `--ct-bg-control` | | `--brand-bg2` | `--ct-accent-subtle` |
| `--bg-overlay` | `--ct-bg-overlay` | | `--brand-str` | `--ct-accent-border` |
| `--tx1..tx4` | `--ct-text` / `-2` / `-3` / `-off` | | `--brand-glow` | `--ct-accent-glow` |
| `--str1..str4` | `--ct-border` / `-strong` / `-subtle` / `-faint` | | `--success-*`/`--warning-*`/`--error-*`/`--info-*` | `--ct-success-*` etc. |
| `--sh2..sh28` | `--ct-shadow-xs..2xl` | | `--r-s..r-pill` | `--ct-r-sm..pill` |
| `--font` | `--ct-font-body` | | `--mono` | `--ct-font-mono` |
| (new) | `--ct-font-heading` | | `--mw` | `--ct-mw` |
| `--focus` | `--ct-focus` | | `--px`/`--px-m` | `--ct-gutter` / `--ct-gutter-m` |

Already-namespaced ecommerce tokens (`--ct-price`, `--ct-price-was`, `--ct-price-save`, `--ct-badge-sale`, `--ct-badge-new`, `--ct-badge-best`, `--ct-stock-in/low/out`, `--ct-rating`, `--ct-touch`) are kept as-is.

---

## 5. Class-name standardization

All custom CSS classes use the **`ct-`** prefix. The demo is internally inconsistent: some components already use `ct-` (`.ct-field`, `.ct-hero`), others use bare names that **collide with Dawn's own classes** (`.card`, `.announce`, `.hdr`, `.cart-notif`). Bare-named components are renamed on port:

| Demo class | → | Reason |
|---|---|---|
| `.hdr*` | `.ct-header*` | clarity |
| `.announce*` | `.ct-announce*` | Dawn owns `announcement-bar` |
| `.card*` (demo product card) | `.ct-card*` | **Dawn owns `.card`** (collision) |
| `.cart-notif*` | `.ct-cart-notif*` | clarity |
| `.cart-drawer*` (demo) | `.ct-cart*` | Dawn owns `cart-drawer` |
| `.gal-*`, `.ep-*`, `.ty-*`, `.rev-*`, etc. | `.ct-gal-*`, `.ct-ep-*`, … | uniform namespace |

A complete rename map is produced in P0 so the demo remains the structural source of truth.

---

## 6. Controlled Liquid edit map (5 files — all additive)

These are the only Dawn files edited. Every edit **adds markup slots only**; none touches form/variant/price/cart logic. Exact insertion points are verified against the real file before editing (see P0).

| File | Additions | Notes / correction |
|---|---|---|
| `layout/theme.liquid` | Inside existing reset `{%- style -%}` block: `body{letter-spacing:normal!important}` + `{%- render 'css-variables' -%}` (**do NOT override `html` font-size** — see §4 ⚠). Then load `theme-overrides.css` and the 8 `ct-*.js` (defer). | No Liquid tags `{% %}`/`{{ }}` inside CSS comments in style blocks — fatal parse error. Test immediately. |
| `config/settings_schema.json` | New brand settings group: `color_accent`, `color_accent_hover`, `font_heading`, `font_body`, `border_radius` (0–24), `page_width` (1000–1400), `glass_opacity` (0–1), `free_shipping_threshold`, `enable_animations`. | Purely additive JSON; existing settings untouched. |
| `snippets/card-product.liquid` | Hover overlay + Quick-View trigger (`data-quickview`); %-off badge (Liquid calc). | **Reuse Dawn's native `show_secondary_image` + badges** instead of injecting a 2nd image. |
| `snippets/cart-drawer.liquid` | (1) Free-shipping progress bar (multi-checkpoint, `cart.total_price` vs threshold). (2) Upsell product slot (Dawn app block). (3) Trust badge row above checkout. | Edit the **snippet** (it exists). Cart form/line items/checkout button untouched. |
| `snippets/buy-buttons.liquid` | Trust-chip grid below ATC (schema-driven). | Buy-button form + dynamic checkout buttons untouched. |

Each edit ships with a documented before/after so it can be re-applied or reverted on a Dawn upgrade.

---

## 7. Complete component inventory (40 demo groups → build units)

Grouped by theme surface. "Edit" = controlled Liquid edit (§6); "Skin" = CSS-only over Dawn; "New" = new `ct-*` section/snippet.

### Global / sitewide (foundation + atoms)
- **T1.1 Tokens** → `css-variables.liquid` (foundation)
- **T1.2 Buttons, T1.3 ct-field inputs, T1.6 Skeleton, T1.7 Focus/A11y** → `theme-overrides.css` global patterns
- **T2.4 Price + Trust + Rating** → price/rating CSS + `ct-trust-bar` section
- **T+ Payment Badges** → `ct-payment-icons` snippet (footer/cart/popup)
- **T+ Breadcrumb + atoms** → breadcrumb snippet + badge/tag/chip atoms (CSS)
- **T+ Urgency / Scarcity** → urgency atoms (low-stock, countdown) for PDP/cart
- **T+ Motion System** → realized by the 8 JS utils + CSS keyframes (reference, not a section)

### Header / nav / footer
- **T1.4 Header (4 states)** → `header.liquid` **Skin** (sticky glass via CSS) + mobile drawer
- **T1.5 Announce + Cart notification** → `ct-announce` **New** (rotation, dismiss, localStorage) + cart-notification **Skin**
- **T+ Wishlist + Announce** → announce rotation variant + wishlist heart on cards (**localStorage-based for v1, no app dependency**)
- **T+ Search Overlay** → `predictive-search.liquid` **Skin** (slide-down, recent searches)
- **T+ Footer** → `ct-footer` **New** section placed in Dawn's footer group: 5-col, social, payment icons, legal

### Homepage sections
- **T2.7 Hero** → `ct-hero` + `ct-hero-split` **New ×2**
- **T2.6 Marquee + Stats** → `ct-marquee` + `ct-stats` **New ×2**
- **T+ Use Case Cards** → `ct-use-cases` **New**
- **T3.3 A+ Banner** → `ct-aplus` **New** (also serves homepage "how it works")
- **T2.8 Reviews + FAQ** (+ **T+ Review Carousel**) → `ct-reviews` + `ct-faq` **New ×2**
- **T2.10 Compare + Before/After** → `ct-compare` + `ct-ba` **New ×2**
- **T2.9 Email** → `ct-email` **New**

### Product card / collection
- **T2.1 Product Card (6 states)** → `card-product.liquid` **Edit** + CSS
- **T2.2 Swatches** → CSS over Dawn variant radios
- **T2.5 Quick View** → `ct-quickview.js` + modal (Section Rendering API)
- **T3.6 Collection (grid/filter/sort)** → `main-collection-product-grid.liquid` **Skin** + grid toggle JS
- **T+ Qty Breaks** → Dawn volume-pricing **Skin**

### Cart
- **T2.3 Cart Drawer** → `cart-drawer.liquid` **Edit** + CSS
- **T+ Cart Upsell + Timer** → upsell slot + countdown (part of drawer edit)
- **T+ Multi-checkpoint bar** → free-ship progress (drawer + cart page)
- **T+ Cart Page** → `main-cart-items.liquid` + `main-cart-footer.liquid` **Skin** (2-col, sticky summary)

### PDP
- **T3.1 Buybox** → `main-product.liquid` **Skin** (`.ct-buybox`): gallery (main + thumbs + lightbox), swatch cards, qty, ATC states, trust chips (via buy-buttons edit)
- **T3.2 Mini Nav** → `ct-mini-nav` **New** + scrollspy
- **T+ PDP Tabs** → `ct-product-details` **New** (tab bar + panels)
- **T3.4 PDP Reviews + Policy** → `ct-pdp-reviews` **New** (grid + photo strip + policy cards)
- **T3.5 Sticky ATC** → `ct-sticky-atc` **New** (submits via Dawn's native `requestSubmit()`)
- **T+ Back In Stock** → `ct-back-in-stock` snippet **New** (replaces ATC when `variant.available == false`)

### Post-purchase / conversion
- **T+ Email Popup** → `ct-email-popup` **New** (6s delay + exit-intent + scroll 60%; 7-day localStorage suppress; mobile bottom-sheet)
- **T+ Thank You Page** → `templates/customers/order.liquid` **Skin** (confirmation hero, steps, summary, next-order discount, social share)

---

## 8. JS utilities (8 files · ~260 lines · all `defer`)

`ct-swipe.js` · `ct-reveal.js` · `ct-accordion.js` · `ct-countup.js` · `ct-ba.js` · `ct-scrollspy.js` · `ct-sticky-atc.js` · `ct-quickview.js`

Code is specified in framework v5 §09. Small per-feature behaviors (announce dismiss/rotation, grid toggle, email popup triggers, PDP tabs, gallery lightbox, wishlist) fold into these files or tiny scoped scripts. All respect `prefers-reduced-motion`. No file exceeds ~55 lines.

Component → JS dependency map (from framework v5 §10): hero/stats/trust-bar/aplus → reveal; stats → countup; reviews/pdp-reviews → swipe; faq/pdp-tabs → accordion; ba → ba; mini-nav → scrollspy; sticky-atc → sticky-atc; cards/collection → quickview.

---

## 9. Phases & gates

Each phase gates the next. After every phase: `shopify theme check` clean + live preview via `shopify theme dev` + commerce smoke-test (variant → ATC → cart drawer → checkout identical to stock Dawn) + no horizontal scroll at 375px.

- **P0 — Grounding (~1 day).** Design demo already exists ✓. Read Shrine Pro patterns; verify the 5 Liquid-edit insertion points against the real Dawn files; write the token rename map + class rename map + apply-plan (`docs/` artifacts).
- **P1 — Global layer.** `css-variables.liquid`; `settings_schema.json` additions; `theme.liquid` patch; `theme-overrides.css` base (tokens, typography, buttons, ct-field, focus, skeleton, badges); 8 JS utils; the 5 controlled Liquid edits; header skin; cart-notification skin. **Gate:** Dawn native sections look on-brand; commerce flow unchanged; cart drawer shows progress-bar slot.
- **P2 — Homepage sections.** All homepage `ct-*` sections + schemas + scoped CSS; wire into `templates/index.json`; `ct-announce` replaces Dawn announce bar. **Gate:** all section refs resolve; reveal/swipe/countup work; no 375px overflow.
- **P3 — PDP.** Buybox skin; mini-nav, product-details/tabs, A+, before/after, PDP reviews+policy, sticky ATC, back-in-stock; wire `templates/product.json`. **Gate:** sticky ATC submits via native form; PDP commerce untouched; swipe works on real mobile.
- **P4 — Collection + cart + remaining templates.** Card upgrade (uses P1 edit); quick-view on cards; grid toggle; cart drawer enhancements live; cart page 2-col; restyle blog/article/page/search/account/404/password. **Gate:** consistent across all templates.
- **P5 — Conversion extras + QA + ship.** Email popup; search overlay skin; thank-you page; wishlist; payment badges; urgency atoms. Full cross-device QA (375/768/1280/1440, real iOS + Android); Lighthouse; run framework v5 §13 audit checklist; package ZIP (verify full Dawn base incl. `assets/base.css`); write `INSTALL.md` + `BRAND_OVERRIDE.md`. **Gate:** all audit items pass; performance targets met.

---

## 10. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Buybox CSS conflicts with Dawn variant picker | HIGH | Inspect real Dawn output HTML first; scope all selectors under `.ct-buybox`; never touch `variant-selects`/radios |
| `theme.liquid` style-block syntax error breaks store | MED | Append inside existing block only; no Liquid in CSS comments; test immediately after edit |
| Cart-drawer JS breaks after edit | MED | Add wrapper markup + classes only; keep cart JS untouched; smoke-test ATC after every edit |
| Liquid edits drift on Dawn upgrade | MED | Keep edits additive + documented (before/after); maintain upstream-merge notes |
| Mobile horizontal overflow | LOW | `minmax(0,1fr)` grids; `min-width:0` on cards; `overflow-x:hidden`; test at 375px per section |
| Email popup fires too often | LOW | 7-day localStorage suppress; never on checkout/thank-you; test by clearing storage |

---

## 11. Prerequisites & assumptions

- Dawn 15.4.1 base present in repo ✓ (the "Dawn ZIP" prerequisite is satisfied).
- Shopify dev store + Shopify CLI available ✓ (used for live preview + QA gates).
- `dawn-design-system.html` is the authoritative, complete visual source (40 component groups, all states) ✓.
- Shrine Pro is reference-only; all Liquid written here is original.
</content>
</invoke>
