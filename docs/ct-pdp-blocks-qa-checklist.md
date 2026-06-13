# CT PDP Block Library — Browser/Interaction QA Checklist

> The owed live-preview QA for the W3 PDP block library (branch `custom-theme`).
> Static guards (`node qa/ct-qa.mjs`, `shopify theme check`, `node --check`) and a
> headless cart-AJAX smoke (6/6) are already green; this checklist covers the
> **interaction/visual** verification that needs a real `shopify theme dev` render.
>
> All 11 blocks are dual-host — registered as `{%- when -%}` cases in BOTH
> `sections/main-product.liquid` and `sections/featured-product.liquid` and seeded
> into `templates/product.json`. Test them on a **product page** (main-product) and,
> for a spot-check, inside a **Featured product** section and a **quick-add modal**
> (the quickadd path rewrites the section id to `quickadd-<id>` — the JS matches it).
>
> Use a product with: (a) at least one variant **on sale** (compare-at > price),
> (b) **multiple variants**, and (c) a **sold-out** variant, so every branch renders.

## How to run

```sh
shopify theme dev --store 6x007a-35
# open the product page, then the theme editor to confirm each block renders in design mode too
```

If `theme dev` throws a phantom-asset / `.tmp.NNN illegal characters` upload error
that survives a restart, the remote development theme is corrupted — delete the
`Development (...)` theme in **Online Store → Themes** and let the CLI recreate it
fresh, or push to a clean unpublished theme and preview that.

---

## Per-block checklist

### 1. Savings line (`savings_line`)
- [ ] On a **sale** variant: shows "You save $X (Y%)"; the % matches `floor(saved×100 / compare_at)` (server render).
- [ ] Switch to a **non-sale** variant → the whole line **disappears** (no "$0.00 (0%)", no fabricated discount). Switch back → reappears.
- [ ] Money is locale-formatted (uses `shop.money_format`), not a bare number.
- [ ] **Badge** style renders the pill; **text** style renders inline. (Defect-class verified: `Math.floor` parity, no 1% snap on variant change.)

### 2. Quantity breaks (`quantity_breaks`)
- [ ] Tiers render as a **radiogroup**; exactly one selected; keyboard arrows move selection (no empty radiogroup + live Add — the count gate).
- [ ] Displayed tier price = unit × N (Shopify auto-discounts apply at checkout); **no synthesized per-tier price**.
- [ ] **Per-unit variants ON** (multi-variant product): each of the N units gets its own variant `<select>`; Add posts a multi-line `items[]` payload; cart shows N lines.
- [ ] Changing a per-unit `<select>` does **not** also toggle the tier radio (stopPropagation).
- [ ] **Double-click Add** adds the tier **once** (busy guard), and the button re-enables after.
- [ ] A failed add surfaces the pre-rendered localized error node (kill network to test), not a silent no-op.

### 3. Sticky ATC (`sticky_atc`)
- [ ] Bar appears when the main buy button scrolls out of view; hides when it returns.
- [ ] Image/title/price/save-badge toggles honor their settings.
- [ ] Add from the sticky bar adds the **currently-selected** variant + qty (form-association via `form="product-form-<id>"`).
- [ ] No layout shift / CLS when the bar mounts (fixed viewport UI, exempt from doc-flow padding).

### 4. Bundle / Frequently bought together (`bundle`)
- [ ] Main product + add-on(s) render with a combined subtotal; **compare-at total** is the sum of per-line `compare_at × qty` (precedence bug-class — verify the strike-through total is correct, not main-only).
- [ ] Variant selects (when enabled) update the line subtotal.
- [ ] **Skip** toggling an add-on removes it from the payload and re-enables correctly.
- [ ] "Add bundle" posts all lines in one `cart/add.js`; cart shows every line; double-click adds once.
- [ ] Money uses space separators / locale format.

### 5. Product upsells (`product_upsells`)
- [ ] Manual list and "recommendations" source both render cards.
- [ ] "Exclude items already in cart" hides cards for in-cart products.
- [ ] Add from a card adds that product (Dawn `<product-form>` pipeline); cart drawer refreshes via `getSectionsToRender`.
- [ ] Columns/grid-vs-row layout honor settings.

### 6. Shipping estimate + checkpoints (`shipping_estimate`)
- [ ] Date window computes from `processing_days` + `transit_min/max` against **today**; dates are real and in order (verify across a month boundary — epoch math precedence bug-class).
- [ ] Checkpoints timeline renders when enabled; hides when off.
- [ ] No English hardcoded in Liquid beyond schema-setting defaults (G-09).

### 7. Discount code (`discount_code`)
- [ ] Code shows; **Copy** copies to clipboard with feedback.
- [ ] **Auto-apply** link uses `routes.root_url` (relative-root correct) and applies the discount at `/discount/CODE` then lands on the product.
- [ ] No fabricated savings amount in the message (copy is merchant-set).

### 8. Size chart (`size_chart`)
- [ ] Trigger opens a Dawn `<modal-dialog>`; **Esc** and the close button (`ModalClose-…`) close it; focus traps inside while open and returns to the trigger on close.
- [ ] Richtext / page / image sources all render; image `alt` is not double-escaped (renders as text, not raw tag).

### 9. Custom fields (`custom_field`)
- [ ] Field renders (text/textarea/checkbox); the value lands as a **line-item property** on Add (check cart line shows it).
- [ ] **Required** field blocks Add when empty (capture-phase submit guard fires before Dawn's submit) and shows the validation message; checkbox exposes `aria-required`.
- [ ] Property name renders escaped; no leak when product is blank.

### 10. Gift offer (`gift_offer`)
- [ ] Below threshold: shows "Spend [amount] more…"; progress bar uses `floor` (no >100%).
- [ ] Crossing the threshold auto-adds the gift **once** (one-per-cart, found by `_ct_gift` property); dropping below removes it.
- [ ] No oscillation / double-add under rapid qty changes (busy flag + 350ms debounce; qualifying total **excludes** the gift line).
- [ ] Money locale-formatted; gift preview toggles per setting.

### 11. Reviews showcase (`reviews_showcase`)
- [ ] Aggregate score + count come from metafields when present, else the schema fallback (no fabricated default baked into Liquid — G-05).
- [ ] Quote stars render on a **fixed 5-scale** (not the aggregate scale_max).
- [ ] Verified badge + author render per quote.

---

## Cross-cutting

- [ ] **Restored Dawn header/footer** (authentic Dawn 15.4.1): mega-menu/dropdowns, drawer nav, search, cart count all work; mobile + desktop.
- [ ] **Theme editor (design mode):** every block renders and is selectable; adding/removing/reordering blocks works; no JS console errors with `?design_mode`.
- [ ] **Quick-add modal:** savings-line and any variant-reactive block update inside the modal (sectionId `quickadd-<id>` match).
- [ ] **Tokens only:** colors/spacing/radius/fonts read from `--ct-*`; brand swap via settings repaints everything (no hardcoded literals).
- [ ] **Fail-open:** with JS disabled, the page still renders and the native buy button still works (progressive enhancement).
- [ ] No CLS, no console errors, no long tasks on load (Lighthouse budget lane).
