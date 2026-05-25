# P4b Cart Page — Minimals Skin Design Spec

**Date:** 2026-05-25
**Branch:** `feat/minimals-foundation`
**Status:** Approved (ready for implementation plan)

## Goal

Restyle Dawn's native cart page into the Minimals "Cart Page — Desktop 2-col + Mobile sticky footer" (design-system ~line 2694): items in a left column, a sticky order-summary card on the right, with trust chips + payment badges under checkout — all without touching `cart.js` or the checkout form.

## Scope (per approval)

**In:** desktop 2-col (items + sticky summary), mobile stacked + sticky checkout; skin line items, empty state, totals/summary card, cart note, checkout button; add a **trust-row + payment-badges** block under checkout.

**Out (deferred):** free-shipping progress bar, frequently-bought-together / upsell row, discount-code input, save-for-later, countdown. (Checkout itself always native.)

## Architecture

Dawn renders the cart as **two separate stacked sections** inside `<main id="MainContent">`: `main-cart-items` (`<cart-items>` → `form#cart` → `table.cart-items`, driven by `cart.js`) and `main-cart-footer` (`#main-cart-footer` → cart-note + `.cart__blocks` subtotal/`.totals` + `.cart__ctas` checkout), then a `featured-collection`.

### Mechanism A — one skin file: `assets/section-ct-cart.css`

Loaded by both cart sections. `--ct-*` tokens are global. Restyles native classes (no logic edits):

- **2-col layout (CSS-only, scoped):** `#MainContent:has(cart-items)` becomes a grid at ≥990px — `grid-template-columns: minmax(0,1fr) 360px`, `align-items:start`, centered with `--ct-mw`. The cart-items section → left, the `.cart__footer-wrapper` section → right (`position: sticky`), the trailing `featured-collection` section → `grid-column: 1 / -1`. Inner `.page-width` of the cart sections is neutralized within this grid. **Fails open**: browsers without `:has()` → Dawn's normal stacked layout. (Live-tweak item #1.)
- **Page title / empty state:** `.title--primary`; `.cart__warnings` / `.cart__empty-text` centered Minimals empty state + continue-shopping `.button` → `.ct-btn`.
- **Line items:** `.cart-items` table → Minimals rows; `.cart-item` laid out (image / details / qty / price); `.cart-item__image`/`__media` rounded; `.cart-item__name` weight; `.cart-item__discounted-prices`/`__old-price` (struck) + final; `.product-option` (variant/options) muted; quantity `.quantity.cart-quantity` stepper bordered pill; `cart-remove-button .button--tertiary` → subtle remove. Hide the `<thead>` column headers (Minimals rows don't need them). (Live-tweak item #2 — the row grid.)
- **Summary:** `.cart__footer` → card; `.totals` / `.totals__total` / `.totals__total-value`; `.tax-note` muted; `.cart__checkout-button.button` → green full-width `.ct-btn` look; `cart-note .field__input` textarea Minimals; `.cart__dynamic-checkout-buttons` (Shop Pay etc.) left native, spacing only.
- **Mobile (<990px):** stacked; checkout button container sticks to the bottom (`position: sticky; bottom: 0`) with a raised background.

### Mechanism B — trust + payment block (small markup add)

In `main-cart-footer.liquid`, inside the buttons block after the checkout CTAs, add:
```liquid
<div class="ct-cart-reassurance">
  <div class="ct-trust-row">
    <span class="ct-trust-chip">Free returns</span>
    <span class="ct-trust-chip">SSL secure checkout</span>
    <span class="ct-trust-chip">1-year warranty</span>
  </div>
  {%- if shop.enabled_payment_types.size > 0 -%}
    <div class="ct-cart-pay">
      {%- for type in shop.enabled_payment_types -%}{{ type | payment_type_svg_tag }}{%- endfor -%}
    </div>
  {%- endif -%}
</div>
```
Reuses the existing `.ct-trust-row` / `.ct-trust-chip` primitive (in `ct-sections.css`), so `main-cart-footer.liquid` also loads `ct-sections.css`. `.ct-cart-reassurance` / `.ct-cart-pay` styled in `section-ct-cart.css`.

## File map

**New:** `assets/section-ct-cart.css`
**Modify:**
- `sections/main-cart-items.liquid` — +1 stylesheet load (`section-ct-cart.css`).
- `sections/main-cart-footer.liquid` — +2 stylesheet loads (`ct-sections.css` + `section-ct-cart.css`) + the trust/badges markup block.

## Guardrails

- Do NOT touch `assets/cart.js`, `form#cart`, `<cart-items>`, `quantity-input`, `cart-remove-button`, the checkout `<button name="checkout" form="cart">`, `content_for_additional_checkout_buttons`, or `cart.note`/`updates[]` names. Presentation + one additive markup block only.
- Keep Dawn's `component-cart*.css` / `component-totals.css` loaded (baseline); our file layers after.
- theme-check stays **14**. No new JS. `--ct-*` tokens only.
- Fail-open: remove the skin → working Dawn cart; `:has()` unsupported → stacked.

## Accessibility

- Quantity inputs, remove buttons, live regions (`#cart-live-region-text`, `#shopping-cart-line-item-status`) untouched.
- Hiding `<thead>` uses `visually-hidden`-equivalent (keep it accessible: use `position:absolute`/clip, not `display:none`, so screen readers keep column context) — OR leave thead but visually compact. Decision: keep headers screen-reader-available.
- Sticky mobile checkout doesn't trap focus; it's the same native button.
- Respects `prefers-reduced-motion`.

## Testing / verification

- **Automated:** `shopify theme check` stays 14.
- **Manual (user, live `theme dev`):**
  1. Desktop: items left, summary sticky right; changing quantity updates totals (cart.js intact); remove works.
  2. Mobile: stacked; checkout sticks to bottom; totals update.
  3. Empty cart state styled.
  4. Trust chips + real payment badges show under checkout; checkout + Shop Pay work.
  5. Cart note persists.
  6. Remove skin / old browser → working Dawn stacked cart (fail-open).

## Open questions

None — resolved: 2-col via `:has()` grid (fail-open), trust + payment badges only, checkout native, other extras deferred.
