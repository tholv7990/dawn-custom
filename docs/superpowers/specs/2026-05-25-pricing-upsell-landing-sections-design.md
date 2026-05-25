# Dawn × Minimals — Pricing, Cart Upsell & Remaining Landing Sections

**Date:** 2026-05-25
**Status:** Approved (write plan next)
**Source artifact:** `dawn-sample-landing.html` (GainsSteel® campaign landing, same Minimals tokens as `dawn-design-system.html`).
**Builds on:** P2 homepage + landing `ct-*` sections (`feat/minimals-foundation`, HEAD `84e9a10`), and the landing gap backlog in `docs/superpowers/specs/2026-05-25-landing-page-design.md`.

## Goal

Close the landing-page gap to ~95–100% by building the four missing content sections (`ct-pricing`, `ct-pillars`, `ct-journey`, `ct-final-cta`) and the Shrine-style cart-drawer upsell, then rewiring `templates/page.landing.json` to match the demo's section order. The headline change from the earlier landing pass: **pricing CTAs become real add-to-cart** (one product, three variants) instead of editable URLs — this supersedes the earlier "pricing = URL only, commerce frozen" decision.

This round does **not** include the Tier-1 variant-gap polish on existing sections (hero subtitle/badge, stat sub-lines, use-case CTA/numbering, A+ tag pill, reviews big-number header) — that stays backlog.

## Decisions (locked)

- **Pricing = 3 variants of one product.** One "GainsSteel" product with three variants (Trainer / System / Full Setup); each card adds its variant to the cart and opens the drawer.
- **Native commerce only.** Add-to-cart uses Dawn's own `<product-form>` element + existing `product-form.js`. No new commerce JS, no edits to Dawn cart logic. The only cart-snippet change is filling the pre-existing `data-ct-upsell` slot.
- **Upsell source = `settings.cart_drawer_collection`** (the native setting already gating the slot), first product not already in cart. No new setting, no recommendations API this pass.
- **Graceful fallback.** If no product is selected on `ct-pricing` (fresh theme editor), cards render a typed-price + link instead of add-to-cart, so the section never errors.
- **Branch:** all work stays on `feat/minimals-foundation`. **Theme-check invariant: stays at 14 offenses** (2 errors, 12 warnings, all pre-existing Dawn). Investigate any increase.
- **Per-section conventions** (unchanged from P2): each `ct-*` section loads `ct-sections.css` + its own `section-ct-*.css`, uses the Dawn per-section padding pattern + `color_scheme`, emits only P1 JS hooks (`data-reveal`), and uses the `.ct-btn` pill family. `disabled_on` header/footer groups.

## Deliverables

1. `sections/ct-pricing.liquid` + `assets/section-ct-pricing.css`
2. `sections/ct-pillars.liquid` + `assets/section-ct-pillars.css`
3. `sections/ct-journey.liquid` + `assets/section-ct-journey.css`
4. `sections/ct-final-cta.liquid` + `assets/section-ct-final-cta.css`
5. Edit `snippets/cart-drawer.liquid` (fill the `data-ct-upsell` slot) + upsell CSS appended to `assets/theme-overrides.css`, next to the existing `.ct-cart__upsell` stub rule (no new file, no new drawer asset load).
6. Edit `templates/page.landing.json` — insert the four sections in demo order, seeded with GainsSteel copy.
7. This spec.

---

## 1. `ct-pricing`

Mirrors the demo's `.pricing` block: optional "vs gym" compare strip → grid of plan cards → trailing trust-chip row.

### Markup (per demo `.pricing` / `.plan`)
- Section head: `.ct-eyebrow` kicker + `.ct-section-head__title` heading (reuse existing primitives).
- **vs strip** (optional): three section settings — `vs_label` ("Compare:"), `vs_gym` (struck, "Gym: $50/month"), `vs_brand` ("GainsSteel: one time · any room"). The whole strip is hidden if `vs_gym` is blank.
- **Plan cards** (blocks): for each card —
  - `plan-badge` if `featured` (e.g. "7 in 10 choose this").
  - `plan-tag` (mono kicker) · `plan-name` · italic `plan-tagline`.
  - `plan-price-row`: live price from the bound variant (`variant.price | money`) + optional static `price_diff` ("+$20").
  - `plan-price-note` (mono).
  - `plan-features`: one line per feature; a leading `-` or `~` marks a dimmed/struck row (`.plan-feature.dim`).
  - **CTA**: native `<product-form>` (see Commerce) styled as `.ct-btn` full-width; the demo's outlined / primary / soft button variants map to a per-block `button_style` select.
  - optional `plan-note` under the CTA.
- **Trust row**: section-level `show_trust` checkbox + `trust_chips` textarea (one chip per line), rendered with the existing trust-chip primitive. Default seed matches the demo: Free shipping / 90-day returns / 1-year warranty / Cancel in 1 hour. (Same `show_trust` + `trust_chips` pattern is reused by `ct-final-cta`.)

### Commerce (Approach A — native product-form)
- Section setting: `product` picker (the GainsSteel product).
- Per block: optional `variant_position` number (default = block order; 1-based). The bound variant = `product.variants[variant_position - 1]`.
- Render Dawn's `<product-form>` per card: a `{% form 'product', product %}` with a hidden `<input name="id" value="{{ variant.id }}">` (overriding the default selected variant) and a submit `<button name="add">` styled as the card CTA. Each product-form gets a unique `data-section-id` / form id derived from `section.id` + block id so multiple forms coexist.
- On submit, existing `product-form.js` AJAX-adds and calls `cart.renderContents()` → drawer opens. No new JS.
- **Fallback** (no product set, or variant unavailable/null): render the CTA as an `<a class="ct-btn">` to `button_link` (or the product URL) and show `price_fallback` text instead of the live price. Never render a broken/disabled form in the editor with no product.
- Sold-out variant: let Dawn's native disabled/sold-out button state apply (the form already handles `available == false`).

### Schema (sketch)
- Section: `kicker`, `heading`, `product`, `vs_label`, `vs_gym`, `vs_brand`, `show_trust`, `trust_chips`, `color_scheme`, `padding_top`, `padding_bottom`.
- Block `plan`: `featured` (checkbox), `tag`, `name`, `tagline`, `variant_position` (number), `price_diff`, `price_note`, `features` (textarea, one per line), `button_label`, `button_style` (select: primary/outlined/soft), `button_link` (fallback url), `price_fallback` (text), `note`. `max_blocks: 4`.

### CSS
`assets/section-ct-pricing.css` reproduces `.pricing*` / `.plan*` from the demo using `--ct-*` tokens; featured highlight = `--ct` brand border + ring; responsive `3→1` at ~720px with featured card margin-top. Reuse `.ct-btn`, `.ct-eyebrow`, `.ct-section-head`, trust-chip classes from `ct-sections.css`.

---

## 2. Cart-drawer upsell

Fills the existing stub in `snippets/cart-drawer.liquid`:
```liquid
{%- if cart != empty and settings.cart_drawer_collection != blank -%}
  <div class="ct-cart__upsell" data-ct-upsell></div>
{%- endif -%}
```

- **Logic:** pick the first product in `settings.cart_drawer_collection` whose id is not already in `cart.items` (loop `cart.items`, build a skip list). Render at most one upsell product (keep the drawer compact). If none qualifies, render nothing (slot stays empty, layout unaffected — preserves the `.is-empty + .drawer__footer` adjacency note already documented in the snippet).
- **Markup:** small horizontal card — thumbnail (`product.featured_image | image_url`), name, price (`product.price | money`), and a native `<product-form>` "Add" button (first available variant) styled compact. Same `product-form.js` flow → re-renders the drawer (which is in `getSectionsToRender`), so the upsell updates itself after add. No new JS.
- **CSS:** style the existing `.ct-cart__upsell` class (currently a bare stub). Place styles where the stub's existing rules live (`theme-overrides.css`) or a small dedicated file loaded by the drawer — implementer picks the lower-churn option; do not introduce a new global JS file.
- **Guard:** all new markup stays inside the existing `if cart != empty and settings.cart_drawer_collection != blank` guard so the empty-state footer rule is preserved.

---

## 3. `ct-pillars` (system grid)

Pure content section (no commerce). Mirrors demo `.system` / `.pillar`.
- Section: `kicker`, `heading`, `color_scheme`, padding.
- Block `pillar`: `number` (mono "01 / 05"), `icon` (emoji/text), `name`, `desc`, `quote` (italic, brand color). `max_blocks: 6`.
- Grid responsive 5→2→1 (demo breakpoints 760px / 400px; last-child spans 2 cols at the 2-col stage). `data-reveal` grid stagger.

## 4. `ct-journey` (step timeline)

Mirrors demo `.journey` / `.journey-step`.
- Section: `kicker`, `heading`, `color_scheme`, padding.
- Block `step`: `week_range` (mono), `title`, `desc`, `badge`. `max_blocks: 6`.
- Connector line behind the dots (`::before` on the track), collapses/hides on mobile (demo: 640px → 2-col, hide connector; 380px → 1-col). Each step has a dot, `data-reveal` stagger.

## 5. `ct-final-cta` (gradient banner)

Mirrors demo `.final-cta`.
- Section: `eyebrow`, `heading` (richtext, multi-line), `subheading`, `button_label` + `button_link`, `button_label_2` + `button_link_2`, `show_trust` + `trust_chips` (same pattern as `ct-pricing`), `color_scheme`, padding.
- Centered layout on the demo's brand gradient background (`linear-gradient` from `--ct` brand-bg2 → base). Buttons use `.ct-btn` primary/outlined.

---

## 6. Landing template rewire (`templates/page.landing.json`)

Final section order (demo order):
`ct_hero → ct_stats → ct_who → ct_features → ct_when (use-cases) → ct_pillars → ct_journey → ct_compare → ct_reviews → ct_pricing → ct_email → ct_faq → ct_final_cta → ct_sticky_atc`

Seed each new section with GainsSteel copy from the demo:
- **Pillars:** Trainer / Program / Music / Nutrition / Coaching (5 cards, num + icon + name + desc + quote per demo lines 568–602).
- **Journey:** Week 1–2 Foundation / 3–5 Build / 6–9 Push / 10–12 Transform (demo lines 613–640).
- **Pricing:** Basic $149 (The Trainer, outlined) / Core Pro $169 featured (The System, primary, "+$20") / Pro Bundle $199 (The Full Setup, soft, "+$30"); vs strip "Gym: $50/month vs GainsSteel: one time"; feature lists with dimmed rows per demo lines 733–786. `product` picker left for the merchant to set; until then cards use `price_fallback` ($149/$169/$199) + link.
- **Final CTA:** "Your living room is ready. Are you?" + sub + two buttons + trust chips (demo lines 871–893).

The existing sticky-atc / hero / stats / etc. settings are unchanged.

---

## Verification

- `shopify theme check` clean — **stays at 14 offenses**; investigate any increase.
- Each new section renders inside theme chrome and reveals/animates via existing P1 hooks (`data-reveal`).
- `ct-pricing`: with the product + variants set, each card adds the correct variant and opens the drawer; live prices format correctly (currency); featured card highlighted; dimmed feature rows render; no-product fallback renders a safe link. With JS off, the form posts to `/cart`.
- Cart upsell: appears only when cart non-empty and `cart_drawer_collection` set; skips products already in cart; "Add" adds and the drawer (incl. upsell) re-renders; empty-state footer rule still intact; no console errors; no new global JS.
- No Dawn commerce logic modified (only the pre-stubbed upsell slot filled).
- **Prerequisite:** the GainsSteel product (3 variants) must exist in dev store `pwsirj-4x` and be selected on `ct-pricing` for live add-to-cart. Live `shopify theme dev` visual/commerce verify is deferred to the user (interactive login + dev-store password), consistent with P2.
