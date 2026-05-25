# PDP Enhancement — Design Spec

**Date:** 2026-05-25
**Branch:** `feat/minimals-foundation`
**Status:** Approved (ready for implementation plan)

## Goal

Turn Dawn's native product page into the Minimals "Full Buybox" PDP (per `dawn-design-system.html` T3.1) by **skinning and extending** the native `main-product` section — never replacing it. Commerce logic (the `{% form 'product' %}`, the hidden variant `id` input, `product-form.js`, `product-info.js`, cart) stays 100% Dawn-native. The result must be reusable theme-grade (works for any product, every enhancement merchant-toggleable), with GainsSteel seeded as the worked example.

## Why this approach (vs. a from-scratch `ct-pdp` section)

Dawn's PDP is already a robust, block-based, accessible, Section-Rendering-API-wired buybox. Rebuilding it would mean re-implementing variant→price/media/availability updates in JS — exactly the fragile commerce logic we must not touch. Instead we:

1. **Skin** the native markup with one CSS file.
2. **Add** four merchant-toggleable enhancements as *additive* blocks/sections — markup + schema only.

Everything degrades open: with all enhancements off and the skin removed, the page is still a working Dawn PDP.

## Fidelity expectations (recorded honestly)

- **~1:1 with the mockup** (we own markup + CSS): bundle-card picker, scarcity bar, payment badges + secure line, PDP tabs, trust chips, price hierarchy (now / struck-was / save badge), title, descriptor, type/color/spacing (same `--ct-*` tokens).
- **Close, data/gallery-dependent:** the gallery skins Dawn's native `product-media-gallery` (exact thumb crop depends on real images + `gallery_layout`); the rating `4.8 · 52` shows only when review data exists (seeded for GainsSteel); the "Add to cart · $price" label needs a small enhancement (native button omits price).
- **Platform-owned, NOT pixel-customizable:** the dynamic-checkout / Shop Pay button (`{{ form | payment_button }}`) — Shopify controls its look. We keep it but do not promise custom styling; merchant may hide it. Payment icons render Shopify's official `payment_type_svg_tag` SVGs.
- **Constraint:** rich per-card price/diff in the bundle picker is exact only for **single-option** products (the bundle case — one option, N values, each mapping to one variant). For multi-option products the card degrades to name + tagline (no per-card price). Documented, acceptable for bundle PDPs.

## Scope

**In scope (the four approved enhancements + skin):**
1. CSS skin of the native PDP.
2. Bundle-card variant picker.
3. Real-inventory scarcity block.
4. Payment-reassurance block.
5. PDP tabs section (below buybox).

**Out of scope (deferred, flagged future):** product-bound sticky ATC, lightbox/zoom upgrade, A+ content on PDP.

---

## Architecture

Two additive mechanisms.

### Mechanism A — CSS skin: `assets/section-ct-pdp.css`

One `{{ 'section-ct-pdp.css' | asset_url | stylesheet_tag }}` line added near the top of `sections/main-product.liquid` (alongside the existing per-section CSS includes). It restyles **existing native markup** into Minimals:

- `.product__title h1` → Minimals H1 scale/weight; the `text` subtitle block → `.descriptor`.
- `.price` / `.price--large`, `.price__sale`, compare-at → now / struck-was / red save badge hierarchy using `--ct-price*` / `--ct-badge-sale`.
- `.rating`, `.rating-star`, `.rating-count` → Minimals rating row.
- `.product-form__input--pill` (native button picker) base styling — but bundle skin lives in Mechanism B's `bundle` branch.
- `.product__inventory` → restyled inline; full bar is Mechanism B's scarcity block.
- `.product-form__submit` (native ATC) → `.ct-btn .ct-btn--primary .ct-btn--lg .ct-btn--full` look (background, radius, weight). We restyle by selector — we do NOT change the button's classes in `buy-buttons.liquid` markup, so `product-form.js` (which targets `.product-form__submit`) is untouched.

**Button styling policy (per user instruction):** only the **primary Add-to-cart** button is skinned. The **dynamic-checkout / Shop Pay button** (`{{ form | payment_button }}`) and any other Shopify-rendered buttons are **left fully native — not restyled.** No CSS targets `.shopify-payment-button` beyond layout spacing.
- `.product__accordion` / `details > summary` → Minimals accordion styling (used by collapsible rows that aren't moved into tabs).
- Gallery: `.product__media-wrapper`, thumbnail rail → Minimals radii/borders/active ring. Requires the section's `gallery_layout` set to `thumbnail` in the seed template.

Pure presentation. Zero markup/JS risk; fail-open.

### Mechanism B — additive blocks in `sections/main-product.liquid`

Add new `case` branches + schema block definitions. **Markup/schema only — the `variant_picker`/`buy_buttons` form internals are never edited.**

#### B1 — Bundle-card picker (`picker_type: "bundle"`)

- Add a third option `{ "value": "bundle", "label": "Bundle cards" }` to the existing `variant_picker` block's `picker_type` select in the schema.
- In `snippets/product-variant-picker.liquid`, route `picker_type == 'bundle'` to a **new snippet** `snippets/ct-bundle-options.liquid` (instead of `product-variant-options`).
- `ct-bundle-options.liquid` renders, per option value, the **same native control** Dawn uses for the button picker:
  ```liquid
  <input type="radio" id="{{ input_id }}" name="{{ input_name }}" value="{{ escaped_value }}"
         form="{{ product_form_id }}" {% if value.selected %}checked{% endif %}
         data-product-url="{{ value.product_url }}" data-option-value-id="{{ value.id }}">
  <label for="{{ input_id }}" class="ct-bundle"> … rich card … </label>
  ```
  So variant selection stays 100% native (`product-info.js` `variant-selects` logic and price/media/availability updates are unchanged). The radios are visually hidden; the `<label>` is the fat card, styled with `input:checked + label` patterns.
- **Card content** comes from optional **variant metafields** (reusability mechanism), with graceful fallback:
  - `variant.metafields.ct.tagline` (single_line_text) → italic tagline; fallback: omit.
  - `variant.metafields.ct.includes` (single_line_text) → "what's included" line; fallback: omit.
  - `variant.metafields.ct.badge` (single_line_text) → ribbon text (e.g. "7 in 10 choose this"); fallback: omit ribbon.
  - `variant.metafields.ct.best` (boolean) → adds `.ct-bundle--best` (green ring emphasis); fallback: false.
  - **Price per card:** for single-option products, the option value maps to exactly one variant → look it up and render `variant.price | money` plus a diff vs the lowest-priced variant (e.g. `+$20`). Match by `option.position == 1` and `product.variants | where: "option1", value | first` (single-option case). Compute the base for diffs as `product.variants | sort: "price" | first`. For multi-option products (`product.options.size > 1`), skip price/diff (degrade to name + tagline). Always-present fallback: the option value name + the live native price.
- No new JS. The selected-state ring, ribbon, and diff are CSS + Liquid.

#### B2 — Scarcity block (`type: "scarcity"`)

- New block. Renders **only** when:
  `product.selected_or_first_available_variant.inventory_management == 'shopify'`
  **and** `0 < inventory_quantity <= block.settings.threshold`.
  Otherwise renders nothing (well-stocked = hidden; no fake urgency). This mirrors the native `inventory` block's data, presented as a bar.
- Markup: amber panel with "Only N left" (uses real `inventory_quantity`), a progress bar whose fill = `inventory_quantity / threshold * 100`%, and an optional merchant **social-proof line** (`block.settings.social_line`, static editorial text — clearly merchant-authored, never a fake "live" counter).
- Schema: `threshold` (range, default 10), `social_line` (text, optional), `selling_fast_label` (text, default "Selling fast"), `color_scheme` not needed (inherits section).
- The block re-renders correctly on variant change because Dawn re-renders `ProductInfo` HTML via the Section Rendering API on variant change (the block markup is inside `<product-info>`).

#### B3 — Payment-reassurance block (`type: "payment_reassurance"`)

- New block, placed after `buy_buttons` in the seed template.
- Markup: a row of `{% for type in shop.enabled_payment_types %}{{ type | payment_type_svg_tag }}{% endfor %}` (real, official icons) + a "Secure checkout · SSL encrypted" line (`block.settings.secure_line`, default localized-ish text) with a lock icon (`icon-padlock`-style inline SVG or Unicode).
- Schema: `show_icons` (checkbox, default true), `secure_line` (text), `color_scheme` inherits.

#### B4 — PDP tabs section: `sections/ct-product-tabs.liquid`

- A **new section** (not a buybox block) added to `templates/product.json` below `main-product`.
- Desktop: horizontal tab bar + panels. Mobile (`< 750px`): stacked accordion (reuses the existing `data-accordion` P1 hook so no duplicate logic).
- Tabs are merchant **blocks** (`type: "tab"`): each has `heading` (text), `content` (richtext) and/or `page` (page picker), so tabs are author-driven (Description / Specifications / Reviews / FAQ / Shipping). A reviews-app block can be dropped into a tab via `@app`.
- Tab switching needs a small new script: `assets/ct-tabs.js`, a guarded custom element `<ct-tabs>` (~25 lines) toggling `aria-selected` / `hidden` and `[role=tab]`/`[role=tabpanel]`. On mobile it does nothing (CSS shows accordion). Follows the project's custom-element guard pattern; loaded only by this section.
- CSS: `assets/section-ct-product-tabs.css`.
- Accessibility: proper `role="tablist"/"tab"/"tabpanel"`, `aria-controls`, keyboard arrow support in `ct-tabs.js`.

---

## File map

**New files:**
- `assets/section-ct-pdp.css` — the PDP skin.
- `snippets/ct-bundle-options.liquid` — the `bundle` picker branch (native radios + fat cards).
- `sections/ct-product-tabs.liquid` + `assets/section-ct-product-tabs.css` + `assets/ct-tabs.js` — tabs section.

**Modified (additive only):**
- `sections/main-product.liquid`:
  - add the `section-ct-pdp.css` stylesheet line;
  - add `picker_type: "bundle"` option to the `variant_picker` schema;
  - add `scarcity` and `payment_reassurance` block types (schema + `case` branches).
  - *(Title descriptor uses the existing `text` block — no change needed.)*
- `snippets/product-variant-picker.liquid`: route `picker_type == 'bundle'` → `ct-bundle-options`.
- `templates/product.json` (or a seeded `templates/product.gainssteel.json`): wire block order, enable enhancements, add `ct-product-tabs` section, set `gallery_layout: thumbnail`.

**Locales:** add any new merchant-facing labels to `locales/en.default.schema.json` (new schema settings) and storefront strings to `locales/en.default.json` ("Secure checkout · SSL encrypted", "Selling fast", "Only {{ count }} left"). `en.default.json` is source of truth.

## Data / metafield definitions (seed)

For GainsSteel: one product, one option "Bundle" with three values (The Trainer / The System / The Full Setup) → three variants. Variant metafields under namespace `ct`:
- `ct.tagline`, `ct.includes`, `ct.badge` (single_line_text_field)
- `ct.best` (boolean)

Metafield **definitions** must exist in the store (created via admin or Admin API). If absent, cards still render (name + price). The plan will note creating these definitions as a prerequisite seed step (can be done via the Shopify MCP `graphql_mutation` / admin).

## Guardrails (carried from cart/ATC work)

- `main-product.liquid` edits are **additive markup/schema**. Do NOT touch: `{% form 'product' %}`, the hidden `id` input, the submit button's classes/markup in `buy-buttons.liquid`, `product-form.js`, `product-info.js`, `variant-selects` JSON.
- The bundle picker renders the **identical native radio inputs** — only the visual wrapper changes.
- **theme-check must stay at the 14-offense baseline** (2 errors + 12 warnings). No leading-underscore variable names (triggers `VariableName`). New `.liquid` uses double quotes; JS single quotes (Prettier).
- No new global JS; `ct-tabs.js` is a guarded custom element loaded only by its section.
- Urgency uses **only real `inventory_quantity`** — never fabricated viewer/sales counts.
- Live `shopify theme dev` verification on the dev store is the user's gate before merge (dev store, interactive login).

## Accessibility

- Bundle cards: native radios remain the accessible control; labels associated via `for`; selected state conveyed by `:checked` (not color alone — also the ring + radio dot). Unavailable values keep Dawn's `label-unavailable` visually-hidden text.
- Scarcity: `role="status"` so screen readers announce stock changes (mirrors native inventory block).
- Tabs: ARIA tab pattern + keyboard arrows; mobile accordion uses `<details>`/`data-accordion`.
- Respects `prefers-reduced-motion` (tokens already zero out durations).

## Testing / verification

- **Automated:** `shopify theme check` stays at 14 offenses (no new). Run before each commit.
- **Manual (user, on `shopify theme dev`):**
  1. Variant selection via bundle cards updates price/media/availability (native behavior intact).
  2. Add to cart works; cart drawer opens (existing upsell unaffected).
  3. Scarcity bar shows only when a variant's real stock ≤ threshold; hidden otherwise; hidden when inventory not tracked.
  4. Payment icons match the store's enabled payment types.
  5. Tabs switch on desktop; collapse to accordion on mobile; keyboard accessible.
  6. With all enhancements toggled off + skin removed, page is a normal working Dawn PDP (fail-open).

## Open questions

None — resolved during brainstorming:
- Bundle copy → **variant metafields with graceful fallback**.
- Tabs → **new below-buybox section** (desktop tabs / mobile accordion).
- Reusable theme-grade + all four enhancements; urgency real-inventory only.
