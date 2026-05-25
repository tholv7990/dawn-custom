# `ct-*` DRY Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Extract accumulated duplication in our `ct-*` code into shared Liquid snippets + one CSS base class, plus an authoring doc — behavior-preserving.

**Architecture:** Liquid snippets are the platform's native "Extract Function". Four new snippets replace inline duplication; one `.ct-card` base holds the 3 universally-identical card props. Only `ct-*` files + the cart-drawer upsell block change. Dawn-native files untouched.

**Tech Stack:** Shopify Liquid, plain CSS. No build step. **Gate: `shopify theme check` must stay at 14 offenses; live `shopify theme dev` is the real equivalence gate (deferred to user).**

**Spec:** `docs/superpowers/specs/2026-05-25-ct-refactor-dry-snippets-design.md`

**Sequencing rationale:** Tasks 1–5 are pure presentation (low risk). **Task 6 (the Shopify add-to-cart form) is LAST and isolated** per user instruction ("don't break the Shopify form") — revertable alone, with a mandatory live add-to-cart check.

**Equivalence note:** `{% render %}` introduces only inter-tag whitespace, which is inert in these HTML/`<style>` contexts. Each swap below is verified to keep every class, attribute, and text node identical.

---

## Task 1: `ct-section-padding` snippet (15 sections)

**Files:** Create `snippets/ct-section-padding.liquid`; modify 15 section files.

- [ ] **Step 1: Create `snippets/ct-section-padding.liquid`**

```liquid
{%- comment -%}
  Renders the per-section responsive padding <style> block.
  Accepts: section (the section object).
{%- endcomment -%}
{%- style -%}
  .section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top | times: 0.75 | round: 0 }}px;padding-bottom:{{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px}
  @media screen and (min-width:750px){.section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top }}px;padding-bottom:{{ section.settings.padding_bottom }}px}}
{%- endstyle -%}
```

- [ ] **Step 2: In each of the 15 sections, replace this exact block:**

```liquid
{%- style -%}
  .section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top | times: 0.75 | round: 0 }}px;padding-bottom:{{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px}
  @media screen and (min-width:750px){.section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top }}px;padding-bottom:{{ section.settings.padding_bottom }}px}}
{%- endstyle -%}
```

with:

```liquid
{% render 'ct-section-padding', section: section %}
```

Files (all 15): `sections/ct-hero.liquid`, `ct-hero-split.liquid`, `ct-stats.liquid`, `ct-trust-bar.liquid`, `ct-aplus.liquid`, `ct-use-cases.liquid`, `ct-reviews.liquid`, `ct-faq.liquid`, `ct-compare.liquid`, `ct-ba.liquid`, `ct-pricing.liquid`, `ct-pillars.liquid`, `ct-journey.liquid`, `ct-final-cta.liquid`, `ct-email.liquid`. (Leave any content between `{% endstyle %}` and the wrapper `<div>` — e.g. ct-compare's `assign cell_keys`, ct-pricing's `assign ct_product` — untouched.)

- [ ] **Step 3: Theme check.** Run `shopify theme check` → expect `14 total offenses`, no new ones (no `OrphanedSnippet` for ct-section-padding since it's now referenced).

- [ ] **Step 4: Verify no stragglers.** Run `git grep -l "section.settings.padding_top | times: 0.75" -- sections/` → expect **no results** (all swapped).

- [ ] **Step 5: Commit**

```bash
git add snippets/ct-section-padding.liquid sections/ct-*.liquid
git commit -m "refactor(ct): extract per-section padding into ct-section-padding snippet

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: `ct-section-head` snippet (9 sections)

**Files:** Create `snippets/ct-section-head.liquid`; modify 9 section files.

- [ ] **Step 1: Create `snippets/ct-section-head.liquid`**

```liquid
{%- comment -%}
  Renders the centered section head (kicker + title).
  Accepts: kicker (string), heading (string).
{%- endcomment -%}
{%- if heading != blank -%}
  <div class="ct-section-head" data-reveal>
    {%- if kicker != blank -%}<div class="ct-kicker">{{ kicker }}</div>{%- endif -%}
    <h2 class="ct-section-head__title">{{ heading }}</h2>
  </div>
{%- endif -%}
```

- [ ] **Step 2: In each of the 9 sections, replace this exact block:**

```liquid
  {%- if section.settings.heading != blank -%}
    <div class="ct-section-head" data-reveal>
      {%- if section.settings.kicker != blank -%}<div class="ct-kicker">{{ section.settings.kicker }}</div>{%- endif -%}
      <h2 class="ct-section-head__title">{{ section.settings.heading }}</h2>
    </div>
  {%- endif -%}
```

with:

```liquid
  {% render 'ct-section-head', kicker: section.settings.kicker, heading: section.settings.heading %}
```

Files (all 9, verified identical): `sections/ct-aplus.liquid`, `ct-use-cases.liquid`, `ct-reviews.liquid`, `ct-pricing.liquid`, `ct-journey.liquid`, `ct-pillars.liquid`, `ct-compare.liquid`, `ct-faq.liquid`, `ct-ba.liquid`.

- [ ] **Step 3: Theme check** → `14 total offenses`, no new.

- [ ] **Step 4: Verify no stragglers.** `git grep -l 'class="ct-section-head"' -- sections/` → **no results** (the class now lives only in the snippet).

- [ ] **Step 5: Commit**

```bash
git add snippets/ct-section-head.liquid sections/ct-*.liquid
git commit -m "refactor(ct): extract section head into ct-section-head snippet

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: `ct-trust-chips` snippet (2 sections)

**Files:** Create `snippets/ct-trust-chips.liquid`; modify `sections/ct-pricing.liquid`, `sections/ct-final-cta.liquid`.

- [ ] **Step 1: Create `snippets/ct-trust-chips.liquid`**

```liquid
{%- comment -%}
  Renders a trust-chip row from a newline-separated string.
  Accepts: chips (string, one per line); class (default 'ct-trust-row');
  wrap_style (optional inline style); reveal (boolean -> data-reveal).
{%- endcomment -%}
<div class="{{ class | default: 'ct-trust-row' }}"{% if wrap_style %} style="{{ wrap_style }}"{% endif %}{% if reveal %} data-reveal{% endif %}>
  {%- assign _chips = chips | newline_to_br | split: '<br />' -%}
  {%- for _chip in _chips -%}
    {%- assign _t = _chip | strip_newlines | strip -%}
    {%- if _t != blank -%}<span class="ct-trust-chip">{{ _t }}</span>{%- endif -%}
  {%- endfor -%}
</div>
```

- [ ] **Step 2: In `sections/ct-pricing.liquid`, replace:**

```liquid
  {%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
    <div class="ct-trust-row" style="margin-top:24px" data-reveal>
      {%- assign chips = section.settings.trust_chips | newline_to_br | split: '<br />' -%}
      {%- for chip in chips -%}
        {%- assign chip_text = chip | strip_newlines | strip -%}
        {%- if chip_text != blank -%}<span class="ct-trust-chip">{{ chip_text }}</span>{%- endif -%}
      {%- endfor -%}
    </div>
  {%- endif -%}
```

with:

```liquid
  {%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
    {% render 'ct-trust-chips', chips: section.settings.trust_chips, wrap_style: 'margin-top:24px', reveal: true %}
  {%- endif -%}
```

- [ ] **Step 3: In `sections/ct-final-cta.liquid`, replace:**

```liquid
      {%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
        <div class="ct-trust-row">
          {%- assign chips = section.settings.trust_chips | newline_to_br | split: '<br />' -%}
          {%- for chip in chips -%}
            {%- assign chip_text = chip | strip_newlines | strip -%}
            {%- if chip_text != blank -%}<span class="ct-trust-chip">{{ chip_text }}</span>{%- endif -%}
          {%- endfor -%}
        </div>
      {%- endif -%}
```

with:

```liquid
      {%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
        {% render 'ct-trust-chips', chips: section.settings.trust_chips %}
      {%- endif -%}
```

- [ ] **Step 4: Theme check** → `14 total offenses`, no new.

- [ ] **Step 5: Verify no stragglers.** `git grep -l "newline_to_br | split" -- sections/` → **no results**.

- [ ] **Step 6: Commit**

```bash
git add snippets/ct-trust-chips.liquid sections/ct-pricing.liquid sections/ct-final-cta.liquid
git commit -m "refactor(ct): extract trust-chip row into ct-trust-chips snippet

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `.ct-card` CSS base (9 surfaces)

**Files:** Modify `assets/ct-sections.css` + 7 `section-ct-*.css` files + their section `.liquid` markup.

- [ ] **Step 1: Add the base class to `assets/ct-sections.css`** (after the trust-chip block, at end of file):

```css

/* ---- Card surface base (bg + border + radius shared by ct-* cards) ---- */
.ct-card{background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl)}
```

- [ ] **Step 2: For each surface below — (a) add `ct-card ` to the element's class in the `.liquid` markup, and (b) delete the 3 props `background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl);` from the CSS rule.** Keep everything else (shadow/padding/hover/overflow/grid/etc.).

| Surface (CSS file) | CSS rule | Markup element (`.liquid` file) → new class |
|---|---|---|
| `.ct-pillar` (section-ct-pillars.css) | remove 3 props | `<div class="ct-pillar"` → `class="ct-card ct-pillar"` (ct-pillars.liquid) |
| `.ct-journey-step` (section-ct-journey.css) | remove 3 props | `<div class="ct-journey-step"` → `class="ct-card ct-journey-step"` (ct-journey.liquid) |
| `.ct-use-case-card` (section-ct-use-cases.css) | remove 3 props | `<div class="ct-use-case-card"` → `class="ct-card ct-use-case-card"` (ct-use-cases.liquid) |
| `.ct-review-card` (section-ct-reviews.css) | remove 3 props | `<div class="ct-review-card"` → `class="ct-card ct-review-card"` (ct-reviews.liquid) |
| `.ct-plan` (section-ct-pricing.css) | remove 3 props | `<div class="ct-plan{% if block.settings.featured %} ct-plan--featured{% endif %}"` → prefix `ct-card ` → `class="ct-card ct-plan{% if ... %} ct-plan--featured{% endif %}"` (ct-pricing.liquid) |
| `.ct-pricing-vs` (section-ct-pricing.css) | remove 3 props | `<div class="ct-pricing-vs"` → `class="ct-card ct-pricing-vs"` (ct-pricing.liquid) |
| `.ct-aplus-banner` (section-ct-aplus.css) | remove 3 props | `<div class="ct-aplus-banner{% if ct_rev == 1 %} ct-aplus-banner--reverse{% endif %}"` → prefix `ct-card ` (ct-aplus.liquid) |
| `.ct-stats` (section-ct-stats.css) | remove 3 props (`background:var(--ct-bg-raised)` here is mid-rule — remove just those 3 declarations, keep grid/overflow/shadow/width) | `<div class="ct-stats"` → `class="ct-card ct-stats"` (ct-stats.liquid) |
| `.ct-hero-card` (section-ct-hero.css) | remove `background:#fff;border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl);` (note `#fff` == `--ct-bg-raised`) | `<div class="ct-hero-card"` → `class="ct-card ct-hero-card"` (ct-hero.liquid) |

**Specificity note:** after removal, `.ct-card` and the section class declare *disjoint* properties, so cascade order is irrelevant. `.ct-card` loads first (ct-sections.css), section class second.

- [ ] **Step 3: Theme check** → `14 total offenses`, no new.

- [ ] **Step 4: Verify.** `git grep -c "border-radius:var(--ct-r-xl)" -- assets/section-ct-*.css` — the 9 surface rules above should no longer match (other uses of `--ct-r-xl` for non-card elements may remain; confirm only the card rules changed by reviewing the diff).

- [ ] **Step 5: Commit**

```bash
git add assets/ct-sections.css assets/section-ct-*.css sections/ct-*.liquid
git commit -m "refactor(ct): extract shared .ct-card surface base (bg/border/radius)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Authoring doc

**Files:** Create `docs/ct-section-authoring.md`.

- [ ] **Step 1: Create `docs/ct-section-authoring.md`**

```markdown
# Authoring a `ct-*` section

Our Minimals sections follow one shape. Copy an existing `ct-*` section and keep to this anatomy so new sections stay DRY and on-brand.

## Anatomy

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-NAME.css' | asset_url | stylesheet_tag }}

{% render 'ct-section-padding', section: section %}

<div class="page-width section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  {% render 'ct-section-head', kicker: section.settings.kicker, heading: section.settings.heading %}
  ... blocks loop, each element with data-reveal ...
</div>

{% schema %} ... {% endschema %}
```

## Shared snippets

- `ct-section-padding` — the responsive padding `<style>` block. Pass `section: section`.
- `ct-section-head` — centered kicker + `<h2>`. Pass `kicker`, `heading`.
- `ct-trust-chips` — trust-chip row from a newline-separated string. Pass `chips`; optional `class`, `wrap_style`, `reveal`.
- `ct-add-to-cart` — Dawn `<product-form>` add-to-cart for one variant. Pass `product`, `variant`, `label`, `btn_class`, `form_id`, `section_id`; optional `form_class`. (Wraps `{% form 'product' %}`; required by `product-form.js`. Do not hand-roll the product-form markup.)

## Shared CSS primitives (assets/ct-sections.css)

- `.ct-card` — card surface base: `bg-raised` + border + radius. Add it to any card element; set shadow/padding/hover in your section CSS.
- `.ct-btn` family — `.ct-btn` + `--primary` / `--outlined` / `--soft`, `--sm` / `--lg` / `--full`.
- `.ct-eyebrow`, `.ct-kicker`, `.ct-section-head*` — headings.
- `.ct-trust-row` / `.ct-trust-chip`, `.ct-rating-row` / `.ct-stars` / `.ct-rating-count`, `.ct-grid-3`.

## Tokens

All colors/space/radii/shadows are `--ct-*` tokens from `snippets/css-variables.liquid`. Never hardcode hex; use the token so a brand change propagates.

## Conventions

- `disabled_on` header/footer groups; `color_scheme` + `padding_top`/`padding_bottom` settings.
- Emit only P1 JS hooks (`data-reveal`, `data-countup`, `data-accordion`, `data-swipe`, `data-ba`). No new global JS.
- CTAs use the `.ct-btn` pill family, not Dawn's `.button`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/ct-section-authoring.md
git commit -m "docs(ct): add ct-* section authoring guide

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: `ct-add-to-cart` snippet (HIGHEST RISK — Shopify form, LAST + isolated)

**Files:** Create `snippets/ct-add-to-cart.liquid`; modify `sections/ct-pricing.liquid`, `snippets/cart-drawer.liquid`.

⚠️ **The `product-form.js` contract must survive exactly:** `<form>` (from `{% form 'product' %}`), `[name="id"]` input, submit `<button>` with a direct child `<span>`, and a `.loading__spinner`. Preserve `data-hide-errors`, `data-section-id`, the `form` id/class, and (for the upsell) the extra `ct-cart__upsell-form` class via `form_class`.

- [ ] **Step 1: Create `snippets/ct-add-to-cart.liquid`**

```liquid
{%- comment -%}
  Renders a Dawn product-form add-to-cart button for a specific variant.
  product-form.js requires: a <form>, a [name=id] input, a submit <button>
  with a direct child <span>, and a .loading__spinner (loading-spinner snippet).
  Accepts: product, variant, label, btn_class, form_id, section_id;
  optional form_class (extra class on <product-form>).
{%- endcomment -%}
<product-form class="product-form{% if form_class %} {{ form_class }}{% endif %}" data-hide-errors="true" data-section-id="{{ section_id }}">
  {%- form 'product', product, id: form_id, class: 'form' -%}
    <input type="hidden" name="id" value="{{ variant.id }}" class="product-variant-id"{% unless variant.available %} disabled{% endunless %}>
    <button type="submit" name="add" class="{{ btn_class }}"{% unless variant.available %} disabled{% endunless %}>
      <span>
        {%- if variant.available -%}{{ label }}{%- else -%}{{ 'products.product.sold_out' | t }}{%- endif -%}
      </span>
      {%- render 'loading-spinner' -%}
    </button>
  {%- endform -%}
</product-form>
```

- [ ] **Step 2: In `sections/ct-pricing.liquid`, replace the product-form block:**

Replace:

```liquid
        {%- if ct_product != blank and variant != blank -%}
          {%- assign form_id = 'ct-plan-' | append: section.id | append: '-' | append: block.id -%}
          <product-form class="product-form" data-hide-errors="true" data-section-id="{{ section.id }}">
            {%- form 'product', ct_product, id: form_id, class: 'form' -%}
              <input type="hidden" name="id" value="{{ variant.id }}" class="product-variant-id"{% unless variant.available %} disabled{% endunless %}>
              <button type="submit" name="add" class="ct-btn ct-btn--{{ style }} ct-btn--full"{% unless variant.available %} disabled{% endunless %}>
                <span>
                  {%- if variant.available -%}{{ block.settings.button_label }}{%- else -%}{{ 'products.product.sold_out' | t }}{%- endif -%}
                </span>
                {%- render 'loading-spinner' -%}
              </button>
            {%- endform -%}
          </product-form>
        {%- else -%}
```

with:

```liquid
        {%- if ct_product != blank and variant != blank -%}
          {%- assign form_id = 'ct-plan-' | append: section.id | append: '-' | append: block.id -%}
          {%- assign plan_btn_class = 'ct-btn ct-btn--' | append: style | append: ' ct-btn--full' -%}
          {% render 'ct-add-to-cart', product: ct_product, variant: variant, label: block.settings.button_label, btn_class: plan_btn_class, form_id: form_id, section_id: section.id %}
        {%- else -%}
```

(The `{%- else -%}` fallback `<a>` link and the closing `{%- endif -%}` stay unchanged.)

- [ ] **Step 3: In `snippets/cart-drawer.liquid`, replace the upsell product-form block:**

Replace:

```liquid
              <product-form class="product-form ct-cart__upsell-form" data-hide-errors="true" data-section-id="cart-drawer-upsell">
                {%- form 'product', ct_upsell_product, id: 'ct-upsell-form', class: 'form' -%}
                  <input type="hidden" name="id" value="{{ ct_upsell_variant.id }}" class="product-variant-id"{% unless ct_upsell_variant.available %} disabled{% endunless %}>
                  <button type="submit" name="add" class="ct-btn ct-btn--soft ct-btn--sm"{% unless ct_upsell_variant.available %} disabled{% endunless %}>
                    <span>Add</span>
                    {%- render 'loading-spinner' -%}
                  </button>
                {%- endform -%}
              </product-form>
```

with:

```liquid
              {% render 'ct-add-to-cart', product: ct_upsell_product, variant: ct_upsell_variant, label: 'Add', btn_class: 'ct-btn ct-btn--soft ct-btn--sm', form_id: 'ct-upsell-form', section_id: 'cart-drawer-upsell', form_class: 'ct-cart__upsell-form' %}
```

- [ ] **Step 4: Theme check** → `14 total offenses`, no new.

- [ ] **Step 5: Verify no stragglers in our files.** `git grep -l "form 'product'" -- sections/ct-pricing.liquid snippets/cart-drawer.liquid` → **no results** (both now use the snippet). Dawn-native files (buy-buttons, main-product, featured-product, card-product) still contain `form 'product'` — that is expected and correct.

- [ ] **Step 6: Commit**

```bash
git add snippets/ct-add-to-cart.liquid sections/ct-pricing.liquid snippets/cart-drawer.liquid
git commit -m "refactor(ct): extract add-to-cart product-form into ct-add-to-cart snippet

Isolated commit (highest risk). Preserves the product-form.js contract
exactly; cart-drawer keeps ct-cart__upsell-form via form_class param.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full theme check** → `14 total offenses` (2 errors, 12 warnings), zero referencing any new snippet.
- [ ] **Step 2: Confirm git state.** `git log --oneline -7` → 6 refactor commits + this plan/spec commits.
- [ ] **Step 3: Hand off to user — MANDATORY live `shopify theme dev` checks** (theme-check cannot prove rendered equivalence):
  - Homepage + landing page: section spacing, kickers/headings, all card surfaces, trust rows render **identically to before**.
  - **Add-to-cart (the flagged risk):** a `ct-pricing` card add AND a cart-drawer-upsell "Add" both fire — open the drawer, add the correct variant, no console error. (Requires the GainsSteel product + cart_drawer_collection set, per the earlier prereqs.)
  - If the add-to-cart check fails, revert only Task 6's commit; Tasks 1–5 are independent.

---

## Self-review notes

- **Spec coverage:** ct-section-padding (T1), ct-section-head (T2), ct-trust-chips (T3), .ct-card (T4), authoring doc (T5), ct-add-to-cart (T6) — all six deliverables covered.
- **Byte-equivalence verified per swap:** padding/section-head blocks are identical across all sites; trust-chips attribute order (class, style, data-reveal) matches both call sites; add-to-cart reproduces the exact `<product-form>` structure incl. the upsell's `ct-cart__upsell-form` via `form_class`, and the `<span>` available/sold-out logic renders identically (upsell product is pre-filtered available).
- **Risk isolation:** the Shopify-form extraction is the last, standalone commit with a mandatory live gate, per user instruction.
- **No Dawn-native files touched** except `snippets/cart-drawer.liquid`, which we already own/edited (the upsell block is ours).
