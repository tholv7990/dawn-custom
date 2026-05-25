# PDP Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Dawn's native `main-product` PDP into the Minimals "Full Buybox" by skinning it + adding four toggleable enhancements (bundle-card picker, real-inventory scarcity, payment reassurance, PDP tabs) — without touching any commerce logic.

**Architecture:** One CSS skin file restyles native markup. Four additive enhancements ship as new buybox blocks (`scarcity`, `payment_reassurance`), a new variant-picker `picker_type` (`bundle`) rendered by a new snippet over Dawn's native radios, and one new below-buybox section (`ct-product-tabs`). Two tiny guarded custom elements (`<ct-scarcity>`, `<ct-tabs>`) add behavior via the existing pub/sub system. The `{% form %}`, variant JS, `product-form.js` and `product-info.js` are never modified.

**Tech Stack:** Shopify Liquid, vanilla Web Components, plain CSS with `--ct-*` tokens. No build step. Spec: `docs/superpowers/specs/2026-05-25-pdp-enhancement-design.md`.

**Branch:** `feat/minimals-foundation` (continue here — do NOT create a new branch or worktree; this builds on the existing Minimals foundation).

**Verification model:** There is no unit-test suite. The only automated gate is `shopify theme check` — current baseline is **14 offenses (2 errors + 12 warnings)**. Every task must keep it at 14. Live `shopify theme dev` checks are the user's manual gate (Task 7). The engineer runs `shopify theme check` (non-interactive); it does NOT require a store login.

---

## File map

**Create:**
- `assets/section-ct-pdp.css` — PDP skin: gallery, title, price, rating, ATC, quantity, accordion, **and** styles for the bundle cards / scarcity bar / payment row (all PDP CSS lives here).
- `snippets/ct-bundle-options.liquid` — the `bundle` picker branch: native radios wrapped in fat cards.
- `assets/ct-scarcity.js` — guarded `<ct-scarcity>` element; refreshes the bar on variant change via `PUB_SUB_EVENTS.variantChange`.
- `sections/ct-product-tabs.liquid` — tabs section below the buybox.
- `assets/section-ct-product-tabs.css` — tabs styling.
- `assets/ct-tabs.js` — guarded `<ct-tabs>` element; tab switching + keyboard.

**Modify (additive only):**
- `sections/main-product.liquid` — add 1 CSS line; add `bundle` option to the `variant_picker` `picker_type` select; add `scarcity` + `payment_reassurance` block `case` branches and schema entries.
- `snippets/product-variant-picker.liquid` — route `picker_type == 'bundle'` to `ct-bundle-options`.
- `templates/product.json` — rewire main-product blocks (bundle picker, scarcity, payment, rating; remove inline description + collapsible rows), set `gallery_layout: thumbnail`, add the `ct-product-tabs` section.

**Naming contract (used across files — keep identical):**
- CSS/markup classes: `ct-bundle`, `ct-bundle__radio`, `ct-bundle__radio-dot`, `ct-bundle__body`, `ct-bundle__name`, `ct-bundle__tag`, `ct-bundle__inc`, `ct-bundle__price`, `ct-bundle__price-now`, `ct-bundle__price-diff`, `ct-bundle__ribbon`, `ct-bundle--best`, `ct-bundle-set`, `ct-bundle-set__legend`; `ct-scarcity`, `ct-scarcity__top`, `ct-scarcity__count`, `ct-scarcity__fast`, `ct-scarcity__bar`, `ct-scarcity__social`; `ct-pay`, `ct-pay__icons`, `ct-pay__secure`; `ct-tabs`, `ct-tabs__bar`, `ct-tabs__tab`, `ct-tabs__panel`, `ct-tabs__panel-inner`, `is-active`.
- Element ids: `Scarcity-{section.id}`, `CtTab-{section.id}-{i}`, `CtPanel-{section.id}-{i}`.
- Custom elements: `ct-scarcity`, `ct-tabs`.
- Liquid temp vars never use leading underscores (Theme Check `VariableName`).

---

## Task 1: PDP skin CSS + wire it in

**Files:**
- Create: `assets/section-ct-pdp.css`
- Modify: `sections/main-product.liquid` (stylesheet include, ~line 17)

- [ ] **Step 1: Create `assets/section-ct-pdp.css` with the full skin.**

```css
/* section-ct-pdp.css — Minimals skin over Dawn's native PDP.
   Pure presentation: no markup or JS depends on these rules, so the page
   stays a working Dawn PDP if this file is removed. All PDP component
   styling (bundle cards, scarcity, payment row) also lives here. */

/* ---- Gallery ---- */
.product__media-wrapper .media,
.product__media-wrapper .product__media {
  border-radius: var(--ct-r-xl);
  overflow: hidden;
}
.product__media-wrapper .thumbnail {
  border-radius: var(--ct-r-md);
  border: 1px solid var(--ct-border-subtle);
}
.product__media-wrapper .thumbnail.thumbnail--selected,
.product__media-wrapper .thumbnail[aria-current] {
  border: 2px solid var(--ct-accent);
}

/* ---- Vendor / title / descriptor ---- */
.product__info-container .product__text.caption-with-letter-spacing {
  color: var(--ct-accent-text);
  font-weight: var(--ct-fw-bold);
  letter-spacing: 0.1em;
}
.product__info-container .product__title h1,
.product__info-container .product__title > h2 {
  font-family: var(--ct-font-heading);
  font-weight: var(--ct-fw-bold);
  letter-spacing: -0.02em;
  line-height: var(--ct-leading-tight);
}
.product__info-container .product__text.subtitle {
  color: var(--ct-text-2);
  font-size: var(--ct-text-md);
}

/* ---- Price hierarchy ---- */
.product__info-container .price .price-item--regular,
.product__info-container .price .price-item--sale {
  color: var(--ct-price);
  font-weight: var(--ct-fw-bold);
}
.product__info-container .price s,
.product__info-container .price .price-item--last,
.product__info-container .price__compare .price-item {
  color: var(--ct-price-was);
}
.product__info-container .price .badge,
.product__info-container .price__badge-sale {
  background: var(--ct-badge-sale);
  color: #fff;
  border: 0;
  border-radius: var(--ct-r-pill);
  font-weight: var(--ct-fw-bold);
}

/* ---- Rating row ---- */
.product__info-container .rating-star { --color-rating-star: var(--ct-rating); }
.product__info-container .rating-count { color: var(--ct-text-2); }

/* ---- Native ATC -> Minimals primary pill (skin by selector; markup untouched) ---- */
.product__info-container .product-form__submit {
  border-radius: var(--ct-r-md);
  font-family: var(--ct-font-body);
  font-weight: var(--ct-fw-bold);
  font-size: var(--ct-text-md);
  min-height: 56px;
  box-shadow: var(--ct-shadow-sm);
  transition: background var(--ct-dur-fast) var(--ct-ease-out), transform var(--ct-dur-fast);
}
.product__info-container .product-form__submit.button--primary { background: var(--ct-accent); color: #fff; }
.product__info-container .product-form__submit.button--primary:hover:not([disabled]) { background: var(--ct-accent-strong); }
.product__info-container .product-form__submit:active:not([disabled]) { transform: translateY(1px); }
/* Dynamic-checkout / Shop Pay button stays Shopify-native — spacing only. */
.product__info-container .shopify-payment-button { margin-top: var(--ct-space-2); }

/* ---- Quantity ---- */
.product__info-container .quantity { border: 1.5px solid var(--ct-border); border-radius: var(--ct-r-md); }
.product__info-container .quantity__button { color: var(--ct-text-2); }

/* ---- Trust chips (already built) spacing ---- */
.product__info-container .ct-buy-trust { margin-top: var(--ct-space-3); }

/* ---- Any native collapsible rows still in the buybox ---- */
.product__info-container .product__accordion .accordion__title {
  font-family: var(--ct-font-heading);
  font-weight: var(--ct-fw-semi);
}

/* ============ Bundle-card variant picker (skin over native radios) ============ */
.product-form__input--bundle { border: 0; margin: 0 0 var(--ct-space-2); padding: 0; }
.ct-bundle-set__legend { font-weight: var(--ct-fw-semi); font-size: var(--ct-text-base); margin-bottom: var(--ct-space-3); }
.ct-bundle__radio { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.ct-bundle {
  position: relative;
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: var(--ct-space-3);
  align-items: start;
  border: 1.5px solid var(--ct-border);
  border-radius: var(--ct-r-lg);
  background: var(--ct-bg-raised);
  padding: 14px 16px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: border-color var(--ct-dur-fast) var(--ct-ease-out), box-shadow var(--ct-dur-fast);
}
.ct-bundle:hover { border-color: var(--ct-accent-border); }
.ct-bundle__radio:checked + .ct-bundle { border-color: var(--ct-accent); box-shadow: 0 0 0 1px var(--ct-accent), var(--ct-shadow-sm); }
.ct-bundle__radio:focus-visible + .ct-bundle { box-shadow: var(--ct-focus); }
.ct-bundle__radio:disabled + .ct-bundle { opacity: 0.5; cursor: not-allowed; }
.ct-bundle__radio-dot { width: 20px; height: 20px; margin-top: 2px; border: 2px solid var(--ct-text-off); border-radius: 50%; position: relative; }
.ct-bundle__radio:checked + .ct-bundle .ct-bundle__radio-dot { border-color: var(--ct-accent); }
.ct-bundle__radio:checked + .ct-bundle .ct-bundle__radio-dot::after { content: ""; position: absolute; inset: 3px; border-radius: 50%; background: var(--ct-accent); }
.ct-bundle__body { display: flex; flex-direction: column; gap: 2px; }
.ct-bundle__name { font-weight: var(--ct-fw-bold); font-size: var(--ct-text-base); }
.ct-bundle__tag { font-size: var(--ct-text-sm); color: var(--ct-text-2); font-style: italic; }
.ct-bundle__inc { font-size: var(--ct-text-sm); color: var(--ct-text-2); margin-top: 4px; }
.ct-bundle__inc::before { content: "\2713"; color: var(--ct-accent); font-weight: var(--ct-fw-bold); margin-right: 6px; }
.ct-bundle__price { text-align: right; white-space: nowrap; }
.ct-bundle__price-now { display: block; font-weight: var(--ct-fw-bold); font-size: var(--ct-text-md); }
.ct-bundle__price-diff { font-size: var(--ct-text-xs); color: var(--ct-text-3); }
.ct-bundle__ribbon { position: absolute; top: -10px; right: 14px; background: var(--ct-badge-best); color: #fff; font-size: var(--ct-text-xs); font-weight: var(--ct-fw-bold); padding: 3px 9px; border-radius: var(--ct-r-pill); }

/* ============ Scarcity bar ============ */
ct-scarcity { display: block; }
.ct-scarcity { background: var(--ct-warning-light); border: 1px solid #ffe2a8; border-radius: var(--ct-r-md); padding: 10px 14px; margin: var(--ct-space-3) 0; }
.ct-scarcity__top { display: flex; justify-content: space-between; gap: var(--ct-space-2); font-size: var(--ct-text-sm); font-weight: var(--ct-fw-semi); color: var(--ct-warning-dark); }
.ct-scarcity__bar { height: 6px; background: #fce3ae; border-radius: var(--ct-r-pill); margin-top: 8px; overflow: hidden; }
.ct-scarcity__bar i { display: block; height: 100%; background: var(--ct-warning); border-radius: var(--ct-r-pill); }
.ct-scarcity__social { font-size: var(--ct-text-xs); color: var(--ct-warning-dark); opacity: 0.85; margin-top: 6px; }

/* ============ Payment reassurance ============ */
.ct-pay { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-top: var(--ct-space-3); }
.ct-pay__icons { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; }
.ct-pay__icons svg { height: 24px; width: auto; }
.ct-pay__secure { display: inline-flex; align-items: center; gap: 6px; font-size: var(--ct-text-sm); color: var(--ct-text-2); }
.ct-pay__secure svg { width: 14px; height: 14px; }
```

- [ ] **Step 2: Add the stylesheet include to `sections/main-product.liquid`.**

Find this block near the top (≈ lines 12–17):

```liquid
  {{ 'section-main-product.css' | asset_url | stylesheet_tag }}
  {{ 'component-accordion.css' | asset_url | stylesheet_tag }}
  {{ 'component-price.css' | asset_url | stylesheet_tag }}
  {{ 'component-slider.css' | asset_url | stylesheet_tag }}
  {{ 'component-rating.css' | asset_url | stylesheet_tag }}
  {{ 'component-deferred-media.css' | asset_url | stylesheet_tag }}
```

Add one line immediately after the `component-deferred-media.css` line:

```liquid
  {{ 'component-deferred-media.css' | asset_url | stylesheet_tag }}
  {{ 'section-ct-pdp.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 3: Run Theme Check.**

Run: `shopify theme check`
Expected: **14 offenses** (2 errors + 12 warnings) — unchanged. If the count went up, you introduced a new offense; fix it before committing.

- [ ] **Step 4: Commit.**

```bash
git add assets/section-ct-pdp.css sections/main-product.liquid
git commit -m "feat(pdp): add Minimals skin over native product page"
```

---

## Task 2: Bundle-card variant picker

**Files:**
- Create: `snippets/ct-bundle-options.liquid`
- Modify: `snippets/product-variant-picker.liquid` (add `bundle` branch)
- Modify: `sections/main-product.liquid` (add `bundle` option to `picker_type` select)

CSS for the cards already shipped in Task 1.

- [ ] **Step 1: Create `snippets/ct-bundle-options.liquid`.**

```liquid
{% comment %}
  Renders Minimals bundle cards over Dawn's NATIVE radio inputs.
  These are the same radios Dawn's "button" picker emits, so variant
  selection stays native (product-info.js drives price/media/availability).
  Card copy is enriched from optional variant metafields (ct.tagline,
  ct.includes, ct.badge, ct.best); falls back to the option value + price.
  Per-card price/diff only for single-option products.
  Accepts: product, option, block, picker_type
{% endcomment %}
{%- liquid
  assign product_form_id = "product-form-" | append: section.id
  assign single_option = false
  if product.options.size == 1
    assign single_option = true
  endif
  assign base_variant = product.variants | sort: "price" | first
-%}
{%- for value in option.values -%}
  {%- liquid
    assign option_disabled = true
    if value.available
      assign option_disabled = false
    endif
    assign card_variant = null
    if single_option
      capture value_str
        echo value
      endcapture
      assign value_str = value_str | strip
      for v in product.variants
        if v.option1 == value_str
          assign card_variant = v
          break
        endif
      endfor
    endif
  -%}
  {%- capture input_id -%}{{ section.id }}-{{ option.position }}-{{ forloop.index0 }}{%- endcapture -%}
  {%- capture input_name -%}{{ option.name }}-{{ option.position }}{%- endcapture -%}
  <input
    type="radio"
    class="ct-bundle__radio"
    id="{{ input_id }}"
    name="{{ input_name | escape }}"
    value="{{ value | escape }}"
    form="{{ product_form_id }}"
    {% if value.selected %}checked{% endif %}
    {% if option_disabled %}disabled{% endif %}
    data-product-url="{{ value.product_url }}"
    data-option-value-id="{{ value.id }}"
  >
  <label for="{{ input_id }}" class="ct-bundle{% if card_variant.metafields.ct.best.value %} ct-bundle--best{% endif %}">
    {%- assign card_badge = card_variant.metafields.ct.badge.value -%}
    {%- if card_badge != blank -%}
      <span class="ct-bundle__ribbon">{{ card_badge }}</span>
    {%- endif -%}
    <span class="ct-bundle__radio-dot" aria-hidden="true"></span>
    <span class="ct-bundle__body">
      <span class="ct-bundle__name">{{ value }}</span>
      {%- assign card_tagline = card_variant.metafields.ct.tagline.value -%}
      {%- if card_tagline != blank -%}
        <span class="ct-bundle__tag">{{ card_tagline }}</span>
      {%- endif -%}
      {%- assign card_includes = card_variant.metafields.ct.includes.value -%}
      {%- if card_includes != blank -%}
        <span class="ct-bundle__inc">{{ card_includes }}</span>
      {%- endif -%}
    </span>
    {%- if single_option and card_variant != blank -%}
      <span class="ct-bundle__price">
        <span class="ct-bundle__price-now">{{ card_variant.price | money }}</span>
        {%- if card_variant.id == base_variant.id -%}
          <span class="ct-bundle__price-diff">base</span>
        {%- else -%}
          {%- assign card_diff = card_variant.price | minus: base_variant.price -%}
          <span class="ct-bundle__price-diff">+{{ card_diff | money }}</span>
        {%- endif -%}
      </span>
    {%- endif -%}
    <span class="visually-hidden label-unavailable">
      {{- "products.product.variant_sold_out_or_unavailable" | t -}}
    </span>
  </label>
{%- endfor -%}
```

- [ ] **Step 2: Route the `bundle` picker in `snippets/product-variant-picker.liquid`.**

Find the `button` branch and the `else` (dropdown) branch (≈ lines 45–55):

```liquid
      {%- elsif picker_type == 'button' -%}
        <fieldset class="js product-form__input product-form__input--pill">
          <legend class="form__label">{{ option.name }}</legend>
          {% render 'product-variant-options',
            product: product,
            option: option,
            block: block,
            picker_type: picker_type
          %}
        </fieldset>
      {%- else -%}
```

Insert a new `elsif` between the `</fieldset>` and `{%- else -%}`:

```liquid
        </fieldset>
      {%- elsif picker_type == 'bundle' -%}
        <fieldset class="js product-form__input product-form__input--bundle ct-bundle-set">
          <legend class="form__label ct-bundle-set__legend">{{ option.name }}</legend>
          {% render 'ct-bundle-options',
            product: product,
            option: option,
            block: block,
            picker_type: picker_type
          %}
        </fieldset>
      {%- else -%}
```

- [ ] **Step 3: Add the `bundle` option to the `variant_picker` `picker_type` select in `sections/main-product.liquid`.**

Find (≈ lines 873–886):

```json
          "options": [
            {
              "value": "dropdown",
              "label": "t:sections.main-product.blocks.variant_picker.settings.picker_type.options__1.label"
            },
            {
              "value": "button",
              "label": "t:sections.main-product.blocks.variant_picker.settings.picker_type.options__2.label"
            }
          ],
```

Add a comma after the `button` object and a new `bundle` object:

```json
            {
              "value": "button",
              "label": "t:sections.main-product.blocks.variant_picker.settings.picker_type.options__2.label"
            },
            {
              "value": "bundle",
              "label": "Bundle cards"
            }
          ],
```

- [ ] **Step 4: Run Theme Check.**

Run: `shopify theme check`
Expected: **14 offenses**, unchanged. (Watch specifically for `VariableName` — all temp vars here are non-underscored: `value_str`, `card_variant`, `card_badge`, `card_tagline`, `card_includes`, `card_diff`, `base_variant`, `single_option`, `option_disabled`.)

- [ ] **Step 5: Commit.**

```bash
git add snippets/ct-bundle-options.liquid snippets/product-variant-picker.liquid sections/main-product.liquid
git commit -m "feat(pdp): add bundle-card variant picker over native radios"
```

---

## Task 3: Scarcity block + variant-change update

**Files:**
- Create: `assets/ct-scarcity.js`
- Modify: `sections/main-product.liquid` (add `scarcity` `case` branch + schema block)

CSS already shipped in Task 1.

- [ ] **Step 1: Create `assets/ct-scarcity.js`.**

```js
if (!customElements.get('ct-scarcity')) {
  customElements.define(
    'ct-scarcity',
    class CtScarcity extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.section;
        this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          if (!event || !event.data || event.data.sectionId != this.sectionId) return;
          const source = event.data.html.getElementById(`Scarcity-${this.sectionId}`);
          if (source) this.innerHTML = source.innerHTML;
        });
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }
    }
  );
}
```

(`subscribe` and `PUB_SUB_EVENTS` are global — loaded by `pubsub.js`/`constants.js` in `theme.liquid`. `product-info.js` publishes `variantChange` with `{ data: { sectionId, html, variant } }`, where `html` is a parsed document supporting `getElementById`.)

- [ ] **Step 2: Add the `scarcity` `case` branch in `sections/main-product.liquid`.**

Find the end of the `buy_buttons` branch and the start of `rating` (≈ lines 480–488):

```liquid
              {%- when 'buy_buttons' -%}
                {%- render 'buy-buttons',
                  block: block,
                  product: product,
                  product_form_id: product_form_id,
                  section_id: section.id,
                  show_pickup_availability: true
                -%}
              {%- when 'rating' -%}
```

Insert two new branches (`scarcity` and `payment_reassurance` — the latter is filled in Task 4; add only `scarcity` now, leaving the `payment_reassurance` branch for Task 4) between the buy-buttons `-%}` and `{%- when 'rating' -%}`:

```liquid
                -%}
              {%- when 'scarcity' -%}
                {%- liquid
                  assign ct_var = product.selected_or_first_available_variant
                  assign ct_show_scarcity = false
                  if ct_var.inventory_management == "shopify" and ct_var.inventory_quantity > 0 and ct_var.inventory_quantity <= block.settings.threshold
                    assign ct_show_scarcity = true
                  endif
                  if request.design_mode
                    assign ct_show_scarcity = true
                  endif
                  assign ct_pct = 0
                  if block.settings.threshold > 0
                    assign ct_pct = ct_var.inventory_quantity | times: 100.0 | divided_by: block.settings.threshold
                  endif
                  if ct_pct > 100
                    assign ct_pct = 100
                  endif
                -%}
                <script src="{{ 'ct-scarcity.js' | asset_url }}" defer="defer"></script>
                <ct-scarcity id="Scarcity-{{ section.id }}" data-section="{{ section.id }}" {{ block.shopify_attributes }}>
                  {%- if ct_show_scarcity -%}
                    <div class="ct-scarcity" role="status">
                      <div class="ct-scarcity__top">
                        <span class="ct-scarcity__count">Only {{ ct_var.inventory_quantity }} left in stock</span>
                        {%- if block.settings.selling_fast_label != blank -%}
                          <span class="ct-scarcity__fast">{{ block.settings.selling_fast_label }}</span>
                        {%- endif -%}
                      </div>
                      <div class="ct-scarcity__bar"><i style="width: {{ ct_pct }}%"></i></div>
                      {%- if block.settings.social_line != blank -%}
                        <div class="ct-scarcity__social">{{ block.settings.social_line }}</div>
                      {%- endif -%}
                    </div>
                  {%- endif -%}
                </ct-scarcity>
              {%- when 'rating' -%}
```

- [ ] **Step 3: Add the `scarcity` schema block in `sections/main-product.liquid`.**

Find the end of the `buy_buttons` schema block (≈ lines 911–930), which ends with:

```json
        {
          "type": "checkbox",
          "id": "show_gift_card_recipient",
          "default": true,
          "label": "t:sections.main-product.blocks.buy_buttons.settings.show_gift_card_recipient.label",
          "info": "t:sections.main-product.blocks.buy_buttons.settings.show_gift_card_recipient.info"
        }
      ]
    },
```

Immediately after that closing `},` (before the `description` block definition), insert:

```json
    {
      "type": "scarcity",
      "name": "Scarcity bar",
      "limit": 1,
      "settings": [
        {
          "type": "paragraph",
          "content": "Shows only when the selected variant's real stock is at or below the threshold (and inventory is tracked). Hidden when well-stocked — no fake urgency."
        },
        { "type": "range", "id": "threshold", "label": "Low-stock threshold", "min": 1, "max": 50, "step": 1, "default": 10 },
        { "type": "text", "id": "selling_fast_label", "label": "Selling-fast label", "default": "Selling fast" },
        { "type": "text", "id": "social_line", "label": "Social-proof line (optional)", "info": "Static editorial text. Leave blank to hide. Never a fake live counter." }
      ]
    },
```

- [ ] **Step 4: Run Theme Check.**

Run: `shopify theme check`
Expected: **14 offenses**, unchanged. (Temp vars `ct_var`, `ct_show_scarcity`, `ct_pct` are non-underscored.)

- [ ] **Step 5: Commit.**

```bash
git add assets/ct-scarcity.js sections/main-product.liquid
git commit -m "feat(pdp): add real-inventory scarcity block with variant-change update"
```

---

## Task 4: Payment-reassurance block

**Files:**
- Modify: `sections/main-product.liquid` (add `payment_reassurance` `case` branch + schema block)

CSS already shipped in Task 1.

- [ ] **Step 1: Add the `payment_reassurance` `case` branch.**

In `sections/main-product.liquid`, find the `scarcity` branch you added in Task 3, ending with `</ct-scarcity>` immediately before `{%- when 'rating' -%}`. Insert the new branch between them:

```liquid
                </ct-scarcity>
              {%- when 'payment_reassurance' -%}
                <div class="ct-pay" {{ block.shopify_attributes }}>
                  {%- if block.settings.show_icons and shop.enabled_payment_types.size > 0 -%}
                    <div class="ct-pay__icons">
                      {%- for type in shop.enabled_payment_types -%}
                        {{ type | payment_type_svg_tag }}
                      {%- endfor -%}
                    </div>
                  {%- endif -%}
                  {%- if block.settings.secure_line != blank -%}
                    <div class="ct-pay__secure">
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="5" y="11" width="14" height="9" rx="2"></rect>
                        <path d="M8 11V8a4 4 0 0 1 8 0v3"></path>
                      </svg>
                      {{ block.settings.secure_line }}
                    </div>
                  {%- endif -%}
                </div>
              {%- when 'rating' -%}
```

- [ ] **Step 2: Add the `payment_reassurance` schema block.**

In the schema, immediately after the `scarcity` block object you added in Task 3 (before the `description` block), insert:

```json
    {
      "type": "payment_reassurance",
      "name": "Payment reassurance",
      "limit": 1,
      "settings": [
        { "type": "checkbox", "id": "show_icons", "label": "Show payment icons", "default": true },
        { "type": "text", "id": "secure_line", "label": "Secure-checkout line", "default": "Secure checkout · SSL encrypted" }
      ]
    },
```

- [ ] **Step 3: Run Theme Check.**

Run: `shopify theme check`
Expected: **14 offenses**, unchanged.

- [ ] **Step 4: Commit.**

```bash
git add sections/main-product.liquid
git commit -m "feat(pdp): add payment-reassurance block (native payment icons + secure line)"
```

---

## Task 5: PDP tabs section

**Files:**
- Create: `sections/ct-product-tabs.liquid`
- Create: `assets/section-ct-product-tabs.css`
- Create: `assets/ct-tabs.js`

- [ ] **Step 1: Create `assets/ct-tabs.js`.**

```js
if (!customElements.get('ct-tabs')) {
  customElements.define(
    'ct-tabs',
    class CtTabs extends HTMLElement {
      connectedCallback() {
        this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
        this.panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
        this.tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => this.select(index));
          tab.addEventListener('keydown', (event) => this.onKeydown(event, index));
        });
      }

      select(index) {
        this.tabs.forEach((tab, i) => {
          const active = i === index;
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
          tab.classList.toggle('is-active', active);
          tab.tabIndex = active ? 0 : -1;
        });
        this.panels.forEach((panel, i) => {
          const active = i === index;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });
      }

      onKeydown(event, index) {
        const last = this.tabs.length - 1;
        let next = null;
        if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
        else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = last;
        if (next === null) return;
        event.preventDefault();
        this.select(next);
        this.tabs[next].focus();
      }
    }
  );
}
```

- [ ] **Step 2: Create `assets/section-ct-product-tabs.css`.**

```css
.ct-tabs {
  display: block;
  background: var(--ct-bg-raised);
  border: 1px solid var(--ct-border-subtle);
  border-radius: var(--ct-r-xl);
  box-shadow: var(--ct-shadow-xs);
  overflow: hidden;
}
.ct-tabs__bar {
  display: flex;
  border-bottom: 1px solid var(--ct-border-subtle);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.ct-tabs__tab {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  padding: 16px 22px;
  font-family: var(--ct-font-body);
  font-size: var(--ct-text-base);
  font-weight: var(--ct-fw-semi);
  color: var(--ct-text-2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}
.ct-tabs__tab.is-active { color: var(--ct-accent-text); border-bottom-color: var(--ct-accent); }
.ct-tabs__tab:focus-visible { outline: none; box-shadow: var(--ct-focus); }
.ct-tabs__panel { padding: 26px 28px; }
.ct-tabs__panel[hidden] { display: none; }
.ct-tabs__panel-inner { max-width: 760px; color: var(--ct-text-2); }
.ct-tabs__panel-inner :is(h2, h3, h4) { color: var(--ct-text); }
```

- [ ] **Step 3: Create `sections/ct-product-tabs.liquid`.**

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-product-tabs.css' | asset_url | stylesheet_tag }}
<script src="{{ 'ct-tabs.js' | asset_url }}" defer="defer"></script>

{% render 'ct-section-padding', section: section %}

<div class="page-width section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  {% render 'ct-section-head', kicker: section.settings.kicker, heading: section.settings.heading %}
  {%- if section.blocks.size > 0 -%}
    <ct-tabs class="ct-tabs">
      <div
        class="ct-tabs__bar"
        role="tablist"
        aria-label="{{ section.settings.heading | default: 'Product information' | escape }}"
      >
        {%- for block in section.blocks -%}
          <button
            type="button"
            class="ct-tabs__tab{% if forloop.first %} is-active{% endif %}"
            role="tab"
            id="CtTab-{{ section.id }}-{{ forloop.index }}"
            aria-controls="CtPanel-{{ section.id }}-{{ forloop.index }}"
            aria-selected="{% if forloop.first %}true{% else %}false{% endif %}"
            tabindex="{% if forloop.first %}0{% else %}-1{% endif %}"
            {{ block.shopify_attributes }}
          >
            {{- block.settings.heading -}}
          </button>
        {%- endfor -%}
      </div>
      {%- for block in section.blocks -%}
        <div
          class="ct-tabs__panel{% if forloop.first %} is-active{% endif %}"
          role="tabpanel"
          id="CtPanel-{{ section.id }}-{{ forloop.index }}"
          aria-labelledby="CtTab-{{ section.id }}-{{ forloop.index }}"
          {% unless forloop.first %}hidden{% endunless %}
        >
          <div class="ct-tabs__panel-inner rte">
            {%- case block.settings.content_source -%}
              {%- when "description" -%}
                {{ product.description }}
              {%- when "page" -%}
                {{ block.settings.page.content }}
              {%- else -%}
                {{ block.settings.content }}
            {%- endcase -%}
          </div>
        </div>
      {%- endfor -%}
    </ct-tabs>
  {%- endif -%}
</div>

{% schema %}
{
  "name": "CT Product Tabs",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "label": "Top padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 28 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 28 }
  ],
  "blocks": [
    {
      "type": "tab",
      "name": "Tab",
      "settings": [
        { "type": "text", "id": "heading", "label": "Tab heading", "default": "Tab" },
        {
          "type": "select",
          "id": "content_source",
          "label": "Content source",
          "options": [
            { "value": "richtext", "label": "Custom text" },
            { "value": "description", "label": "Product description" },
            { "value": "page", "label": "Page" }
          ],
          "default": "richtext"
        },
        { "type": "richtext", "id": "content", "label": "Custom text" },
        { "type": "page", "id": "page", "label": "Page" }
      ]
    },
    { "type": "@app" }
  ],
  "max_blocks": 8,
  "presets": [
    {
      "name": "CT Product Tabs",
      "blocks": [
        { "type": "tab", "settings": { "heading": "Description", "content_source": "description" } },
        { "type": "tab", "settings": { "heading": "Specifications", "content_source": "richtext" } },
        { "type": "tab", "settings": { "heading": "Shipping & Returns", "content_source": "richtext" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 4: Run Theme Check.**

Run: `shopify theme check`
Expected: **14 offenses**, unchanged.

- [ ] **Step 5: Commit.**

```bash
git add sections/ct-product-tabs.liquid assets/section-ct-product-tabs.css assets/ct-tabs.js
git commit -m "feat(pdp): add product tabs section (desktop tabs / mobile scroll)"
```

---

## Task 6: Seed GainsSteel — wire the product template

**Files:**
- Modify: `templates/product.json`

- [ ] **Step 1: Rewire the `main` (main-product) section in `templates/product.json`.**

Replace the entire `"main"` section object (lines 3–114 in the current file) with this. It adds `rating`, switches the picker to `bundle`, adds `scarcity` + `payment_reassurance`, removes the inline `description` + four `collapsible_tab` rows (their role moves to the tabs section), and sets `gallery_layout: thumbnail`:

```json
    "main": {
      "type": "main-product",
      "blocks": {
        "vendor": {
          "type": "text",
          "settings": { "text": "{{ product.vendor }}", "text_style": "uppercase" }
        },
        "title": { "type": "title" },
        "caption": {
          "type": "text",
          "settings": { "text": "{{ product.metafields.descriptors.subtitle.value }}", "text_style": "subtitle" }
        },
        "rating": { "type": "rating" },
        "price": { "type": "price" },
        "variant_picker": {
          "type": "variant_picker",
          "settings": { "picker_type": "bundle" }
        },
        "scarcity": {
          "type": "scarcity",
          "settings": { "threshold": 10, "selling_fast_label": "Selling fast", "social_line": "" }
        },
        "quantity_selector": { "type": "quantity_selector" },
        "buy_buttons": {
          "type": "buy_buttons",
          "settings": { "show_dynamic_checkout": true, "show_gift_card_recipient": true }
        },
        "payment_reassurance": {
          "type": "payment_reassurance",
          "settings": { "show_icons": true, "secure_line": "Secure checkout · SSL encrypted" }
        },
        "share": {
          "type": "share",
          "settings": { "share_label": "Share" }
        }
      },
      "block_order": [
        "vendor",
        "title",
        "caption",
        "rating",
        "price",
        "variant_picker",
        "scarcity",
        "quantity_selector",
        "buy_buttons",
        "payment_reassurance",
        "share"
      ],
      "settings": {
        "enable_sticky_info": true,
        "gallery_layout": "thumbnail",
        "media_size": "large",
        "constrain_to_viewport": true,
        "mobile_thumbnails": "show",
        "hide_variants": true,
        "enable_video_looping": false,
        "padding_top": 36,
        "padding_bottom": 12
      }
    },
```

- [ ] **Step 2: Add the `ct-product-tabs` section and put it right after `main` in the order.**

In `templates/product.json`, add this section object inside `"sections"` (e.g. after the `"main"` object):

```json
    "ct-product-tabs": {
      "type": "ct-product-tabs",
      "blocks": {
        "tab-description": {
          "type": "tab",
          "settings": { "heading": "Description", "content_source": "description" }
        },
        "tab-specs": {
          "type": "tab",
          "settings": { "heading": "Specifications", "content_source": "richtext", "content": "<p>Add specifications here.</p>" }
        },
        "tab-shipping": {
          "type": "tab",
          "settings": { "heading": "Shipping & Returns", "content_source": "richtext", "content": "<p>Free US shipping, ships in 24h. 90-day returns.</p>" }
        }
      },
      "block_order": ["tab-description", "tab-specs", "tab-shipping"],
      "settings": { "color_scheme": "scheme-1", "padding_top": 28, "padding_bottom": 28 }
    },
```

And update the top-level `"order"` array to place tabs after the buybox:

```json
  "order": [
    "main",
    "ct-product-tabs",
    "image-with-text",
    "multicolumn",
    "related-products"
  ]
```

- [ ] **Step 3: Run Theme Check.**

Run: `shopify theme check`
Expected: **14 offenses**, unchanged. (JSON template changes shouldn't add offenses; if Theme Check reports an invalid block type, confirm the `case` branches and schema from Tasks 2–5 are present.)

- [ ] **Step 4: (Optional, store-side) Create the bundle metafield definitions.**

This is **not required for the build** — bundle cards fall back to name + price without it. Do this only when seeding GainsSteel for the full visual, and only with dev-store access (via the Shopify MCP `graphql_mutation` or the admin UI). Create four **variant** metafield definitions under namespace `ct`:

| key | type |
|---|---|
| `ct.tagline` | `single_line_text_field` |
| `ct.includes` | `single_line_text_field` |
| `ct.badge` | `single_line_text_field` |
| `ct.best` | `boolean` |

Example (one definition; repeat per key) via `metafieldDefinitionCreate`:

```graphql
mutation {
  metafieldDefinitionCreate(definition: {
    name: "Bundle tagline",
    namespace: "ct",
    key: "tagline",
    type: "single_line_text_field",
    ownerType: PRODUCTVARIANT
  }) { createdDefinition { id } userErrors { field message } }
}
```

Then set the values per variant (admin UI or `metafieldsSet`). Also ensure the GainsSteel product has **one option** (e.g. "Bundle") with the three values so three cards render with per-card price.

- [ ] **Step 5: Commit.**

```bash
git add templates/product.json
git commit -m "feat(pdp): wire GainsSteel product template to enhanced PDP"
```

---

## Task 7: Final verification + finish the branch

**Files:** none (verification only)

- [ ] **Step 1: Full Theme Check.**

Run: `shopify theme check`
Expected: **14 offenses (2 errors + 12 warnings)** — identical to the pre-PDP baseline. If higher, locate and fix the new offense.

- [ ] **Step 2: Confirm no Dawn commerce files were modified.**

Run: `git diff --stat feat/minimals-foundation~7 -- assets/product-form.js assets/product-info.js snippets/buy-buttons.liquid`
Expected: **no output** (these files are untouched). If any show changes, revert them — the guardrail is that commerce logic stays native.

- [ ] **Step 3: Hand the live checklist to the user.**

The engineer cannot run `shopify theme dev` non-interactively. Present this checklist for the user to verify on their dev store:
1. Bundle cards render; selecting a card updates price/media/availability (native behavior intact).
2. Add to cart works; cart drawer opens; existing upsell unaffected.
3. Scarcity bar shows only when the selected variant's real stock ≤ threshold; switching to a well-stocked variant hides it; hidden entirely when inventory isn't tracked.
4. Payment icons match the store's enabled payment types; secure line shows.
5. Tabs switch on desktop; tab bar scrolls horizontally on mobile; keyboard arrows/Home/End work.
6. Temporarily set the picker back to `button` and remove enhancements → page is still a normal working Dawn PDP (fail-open).

- [ ] **Step 4: Finish the branch.**

Announce: "I'm using the finishing-a-development-branch skill to complete this work." Then follow **superpowers:finishing-a-development-branch** to verify state and present merge/PR options. (Do not auto-merge; this is part of the long-lived `feat/minimals-foundation` branch.)

---

## Notes / deviations from spec

- **Tabs on mobile** scroll horizontally rather than collapsing into a separate accordion (simpler, no DOM duplication, matches the approved mockup). Spec updated to match.
- **"Add to cart · $price"** label is **deferred** — appending live price would edit `buy-buttons.liquid`, and per the user's instruction Shopify-native buttons are left alone. Native "Add to cart" label stays.
- The **dynamic-checkout / Shop Pay button** is left fully native (only margin spacing in CSS).
- The bundle **metafield definitions + GainsSteel single-option setup** are store-side and optional for the theme to function (graceful fallback to name + price).
