# CT Buy-Box & Card Library — inventory

Practical inventory of the reusable "card" components for the product buy box and
cross-sell area, so we can later compose them into a page by **adding a block/section
in the Theme Editor** (no rebuild). For the full auto-generated section list see
[`docs/ct-sections.md`](ct-sections.md); this doc adds the **editor-editable vs
CSS-only** dimension and maps each piece to the GardenStudio (tiered bundle) and
Cozy (build-your-bundle + add-ons) reference designs.

## Rule of thumb — what is editable in the Theme Editor vs needs CSS

- **Editor-editable (a merchant setting):** all text (labels, badges, sub-copy,
  headings, button labels), product pickers, quantities, on/off toggles, and a few
  curated **select** choices (e.g. badge colour presets where the schema exposes them).
- **Comes from Shopify automatically:** price, compare-at price, SAVE %, availability,
  variant options, rating/review count (metafields). Never typed by hand.
- **CSS-only (needs a code change, not a setting):** the *shape/position* of a badge
  (pill vs diagonal corner ribbon), most per-element colours and fonts (these flow
  from the global brand token `--ct-*` and the theme's font settings, not per-card
  fields), card border/shadow/spacing. Fonts and the brand accent are editor-global
  (theme settings), not per-card.

## Quick reference

| Component | Type / where to add | Matches | Status | Editor-editable highlights |
|---|---|---|---|---|
| `quantity_breaks` | block on `main-product` / `featured-product` | GardenStudio tier cards | **Ready** | per-tier label, badge text, benefit, qty, highlight; per-unit variant selects; heading/layout/button |
| `bundle` | block on `main-product` | Cozy bundle (fixed) | **Ready (fixed set)** | heading, this-product qty, 2 add-on products + qty, variant-select toggle |
| `addon` (bundle box) | block on `main-product` | Cozy opt-in add-on cards | **Schema ready, NOT wired** | product, badge text, **badge colour (accent/urgency/gold)**, savings override |
| `product_upsells` | block on `main-product` **and** `ct-product-upsells` section | "You may also like" cards | **Ready** | heading, source, product list, columns, layout, show add/variant |
| `gift_offer` | block on `main-product` / `ct-gift-offer` section | free-gift threshold | **Ready** | gift product, threshold, locked/unlocked text, toggles |
| `ct-cart-progress` / `ct-cart-checkpoints` / `ct-free-shipping-bar` | cart sections | Cozy "CART REWARDS" bar | **Ready (in cart, not buy box)** | thresholds, labels, icons |
| `ct-product-buy` | standalone section | GardenStudio full buy box chrome | **Ready (has a bug)** | value bar, ships-from, rating, price row + SAVE chip, trust row, countdown |
| price / savings_line / sticky_atc / buy_buttons / variant_picker | blocks on `main-product` | price row, sticky ATC | **Ready** | prefix/labels/toggles; price binds to Shopify |
| `ct-featured-product-cta` | standalone section | product CTA banner | **Ready** | product picker, heading, body, show-price, button, layout |

## The GardenStudio tier card — `quantity_breaks` (your focus)

Files: [`snippets/ct-quantity-breaks.liquid`](../snippets/ct-quantity-breaks.liquid),
[`assets/component-ct-quantity-breaks.css`](../assets/component-ct-quantity-breaks.css),
[`assets/ct-quantity-breaks.js`](../assets/ct-quantity-breaks.js). Schema lives in the
`quantity_breaks` block of [`sections/main-product.liquid`](../sections/main-product.liquid).

**Editable in the Theme Editor today — per tier (1–4):**
- `Enable`, `Quantity`, `Label` (e.g. "Buy 1"), `Badge` (one text slot, e.g. "MOST POPULAR"),
  `Benefit` (the sub-description line), `Highlight` (the selected-card emphasis).
- Block-level: `Heading`, `Layout` (normal / compact / vertical), `Enable per-unit variant
  selects`, `Add to cart` label, `Save` label.
- Auto from Shopify: each tier's price = unit × qty, strikethrough compare-at, and the
  `Save N%` chip — recomputed live on variant change. Honest (never synthesized).

**Needs CSS today (not yet an editor setting):**
- The badge renders as a **flat pill, pinned top-right, single colour** (`--ct-action`) —
  see `.ct-qb__badge` in the component CSS. To get the GardenStudio **diagonal corner
  ribbon with per-tier colours (orange / green / gold) + emoji**, that shape/position/colour
  is CSS. Good news: the sibling `addon` block already ships an editor **badge-colour select
  (accent / urgency / gold)** — so making the tier badge colour editor-controllable is a
  small, pattern-matching addition, not new ground.
- GardenStudio shows **two** badges per tier (an inline "Starter / Discount 20%" pill next
  to the name **and** the corner "MOST POPULAR" ribbon). We have **one** badge slot — a
  second slot (or folding it into the label) is needed for both.
- Fonts and the brand accent are global theme settings/tokens, not per-card fields.

**Verdict for GardenStudio:** the **card content and layout are fully editor-editable and
ready**; the **ribbon styling (shape + per-tier colour) is a small CSS/settings task** to
match the reference exactly.

## Cozy add-on cards — `addon` block (ready in schema, needs render)

Schema (in `main-product.liquid`, `Add-on (bundle box)`, limit 4) already exposes, per card:
`product`, `badge` text, `flag_style` badge colour (**accent / urgency / gold**), and a
`savings_override`. Save-X is auto-calculated from the add-on's own compare-at price.

**Gap:** the `{%- when 'addon' -%}` render case is empty and nothing iterates `addon`
blocks, so these cards **render nothing today**. The editor UI exists; the output snippet
(checkbox opt-in + image + badge + variant select + `+ ADD` feeding a shared total) is what
needs building. This is the cleanest path to the Cozy add-ons row because the merchant-facing
settings (including per-card badge colour) are already designed.

## Known gaps / what each needs to finish (for later)

- **`addon` cards** — build the render snippet (opt-in checkbox + image + badge + variant +
  add), and wire add-ons into a live total. Schema already done.
- **`ct-bundle`** — today it's a *fixed* host + up to 2 merchant-picked add-ons. To get the
  Cozy **add/remove/stepper** builder it needs a shopper-driven line list (Add appends, per-line
  qty stepper, remove X, swatch). `assets/ct-bundle.js` already has the live-total math to reuse.
- **Tier badge → ribbon** — convert `.ct-qb__badge` pill to a corner-ribbon style and add a
  per-tier colour select (copy the `addon` block's `flag_style` pattern) for editor control.
- **Duplicate/buggy tier path** — there are two tier implementations: the correct
  `ct-quantity-breaks` snippet and an older bespoke `gs-*` path in `ct-product-buy` whose
  per-unit variant `<select>`s have no `name` (a multi-colour "Buy 3" silently adds 3 of the
  default variant). Standardize on `ct-quantity-breaks`; retire the old tier path.
- **Rewards bar in the buy box** — `ct-cart-checkpoints` has the dual-threshold bar but lives
  in the cart and keys on spend; an in-PDP version tied to item count would need adapting.

## How to add a component to a page

- **A buy-box block** (`quantity_breaks`, `bundle`, `addon`, `product_upsells`, `gift_offer`,
  price, sticky_atc …): Theme Editor → Product template → the `main-product` section → **Add
  block** → pick it, then set its fields. Or seed it in `templates/product.json` under the
  `main` section's `blocks` + `block_order`.
- **A standalone section** (`ct-product-buy`, `ct-featured-product-cta`, `ct-reviews`,
  `ct-icon-columns`, `ct-gallery` …): Theme Editor → **Add section**, or add it to the template
  JSON's `sections` + `order`.
