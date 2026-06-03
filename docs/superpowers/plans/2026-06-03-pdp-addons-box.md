# Dawn × Minimals — PDP Cross-sell Add-ons Box

**Date:** 2026-06-03
**Status:** Approved → executing inline.
**Source artifact:** competitor "buying box" screenshot (bundle tiers + limited-time add-on discount cards with per-card variant pickers).

## Goal
Implement the cross-sell add-ons box on the PDP. Customers see 1–4 add-on product cards inside the buy-box; tapping a card toggles it (no checkbox / no radio input); on Add-to-Cart, the main product **and** every pressed add-on are added in a single `/cart/add.js` call. Per-card "Save X" is computed automatically from each add-on variant's `compare_at_price`. Bundle tier picker (`ct-bundle-options`) stays as-is — only add-ons are new.

## Locked decisions
- **Selection UI = whole-card button toggle** (no `<input type="checkbox/radio">`). Card is a `<div>` with `role="button"`, `tabindex="0"`, `aria-pressed`. The pill in the corner ("Add" / "Added ✓") is rendered by CSS `::after` from `aria-pressed`. Keyboard: Enter / Space.
- **Per-card variant select** — only rendered if the add-on product has >1 variant. Click events on the `<select>` are excluded from the card toggle. Changing the select updates the card's `data-variant-id` and refreshes the displayed price / "Save X" line.
- **Savings** — auto: `compare_at_price − price` of the currently-selected variant. Merchant override per block via `savings_override` text.
- **Merchant config** — new schema block of type `addon` on `sections/main-product.liquid`, `"limit": 4`. Settings: `product` (product picker), `badge` (text, optional), `savings_override` (text, optional).
- **Placement** — `ct-addons` snippet rendered immediately after the existing `buy_buttons` render call in `main-product.liquid`, so the box sits **inside** the buy-box, right under Add-to-Cart's container.
- **Cart mechanics** — `ct-addons.js` listens to `submit` on `document` with `capture: true`. It intercepts only when the submit target is `form[data-type="add-to-cart-form"]` **and** at least one `.ct-addon[aria-pressed="true"]` exists. It then `preventDefault + stopImmediatePropagation`, builds `items: [main + addons...]`, plus `sections` / `sections_url` to mirror Dawn's section-rendering flow, POSTs JSON to `window.routes.cart_add_url`, and on success calls `cartTarget.renderContents(parsed)` (Dawn's cart-notification or cart-drawer). When no add-ons are pressed, the listener is inert and Dawn's normal product-form flow runs untouched.
- **A11y** — `role="button"`, `aria-pressed`, `tabindex="0"`, keyboard activation, focus-visible ring; variant `<select>` carries a `visually-hidden` label.
- **Out of scope** — quantity steppers on add-ons (1 each), Shopify-Functions / app-driven discounts (we rely on `compare_at_price`), bundle-tier rework.

## Files
- New: `snippets/ct-addons.liquid`, `assets/ct-addons.js`, `assets/section-ct-addons.css`.
- Modified: `sections/main-product.liquid` — add the `addon` block schema between `buy_buttons` and `scarcity`; in the `case block.type` loop, render `ct-addons` immediately after the `buy_buttons` render and add an empty `{%- when 'addon' -%}` case so per-block iteration is a no-op (the snippet renders all addon blocks as a group).

## Steps
- [x] **1. Plan doc** — this file.
- [ ] **2. Snippet** — `snippets/ct-addons.liquid`. Filters `section.blocks | where: 'type', 'addon'`, emits `<link>` to `section-ct-addons.css`, defers `ct-addons.js`. For each block: card with media · title · variant select (if multi) · "Save X" · price / compare · pill placeholder.
- [ ] **3. JS** — `assets/ct-addons.js`. Self-guard against double load. `init()` wires click+keydown on every `.ct-addon`, change on every `.ct-addon__variant`, and a `document`-level capture-phase `submit` interceptor that performs the multi-item add when add-ons are pressed.
- [ ] **4. CSS** — `assets/section-ct-addons.css`. Card grid, hover / focus / pressed states, pill `::after` text swap, badge ribbon, mobile breakpoint.
- [ ] **5. Section integration** — `sections/main-product.liquid`:
  - In the block-rendering `case`, insert `{%- render 'ct-addons', section: section, product: product, product_form_id: product_form_id -%}` after the `buy_buttons` render and add an empty `{%- when 'addon' -%}` case before `{%- when 'scarcity' -%}`.
  - In the schema's `blocks` array, insert an `addon` block definition between the existing `buy_buttons` and `scarcity` blocks. `limit: 4`. Settings: paragraph note, product picker, badge text, savings_override text.
- [ ] **6. Theme check** — must stay at **11 offenses** (no new). Confirm `Invalid block` / `tham chiếu` errors do not return.
- [ ] **7. Restart dev server** — `shopify theme dev`. Clean upload (no schema errors). Wait for the success banner.
- [ ] **8. Commit** — `feat(pdp): cross-sell add-ons box (whole-card toggle, multi /cart/add.js)`.

## Verification (user-side, on live preview)
1. In the theme editor on a product page, add 2–3 **Add-on (bundle box)** blocks to the main product section, each pointing at a real product (with `compare_at_price > price` on the chosen variant so "Save X" auto-renders).
2. On the PDP:
   - Tap an add-on card → border turns accent green, pill switches to **Added ✓**. Tap again → reverts.
   - Tap "Add to cart" with 1+ add-ons pressed → cart drawer/notification opens with the main product **and** every pressed add-on as separate line items. The add-on prices reflect the variant `price` (not compare). Pressed states reset.
   - Tap "Add to cart" with **zero** add-ons pressed → Dawn's normal flow runs (one item added, no intercept).
3. Multi-variant add-on: changing the per-card `<select>` updates the displayed price + "Save X" inline; the next add adds the newly-selected variant ID.
4. Keyboard: Tab to a card → focus ring is visible. Space / Enter toggles. Tabbing into the `<select>` and selecting an option does **not** toggle the card.
5. Mobile (<480px): card layout collapses to two rows with the pill on its own row spanning the card width.
6. Reduced-motion: no animations rely on motion; transitions are instant and inoffensive.

## Notes for later phases
- Section-level title for the box ("LIMITED-TIME ADD-ON DISCOUNT") is currently hardcoded in the snippet; promote to a section setting on `main-product.liquid` if merchants want to customize.
- Add-on quantity steppers (e.g. 2× Easy Hair Glove) would replace `quantity: 1` with a per-card stepper UI and `data-qty`. Out of scope here.
- App-driven dynamic bundle discounts (Shopify Functions / Bundles app) — out of scope; we use `compare_at_price` only.
