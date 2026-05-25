# Dawn × Minimals — `ct-*` DRY Refactor (snippets + card base + authoring doc)

**Date:** 2026-05-25
**Status:** Approved (write plan next)
**Builds on:** all `ct-*` sections on `feat/minimals-foundation` (HEAD `6515aaa`).

## Goal

Remove the duplication that has accumulated across our `ct-*` sections by extracting it into shared Liquid snippets (Liquid's native "Extract Function") and one shared CSS base class, and capture the section-authoring pattern in a short doc. **Behavior-preserving.** No new sections, no new features.

## Framing / principles (why this shape)

Reviewed refactoring.guru. Its **design-patterns** half is Gang-of-Four OOP (Factory, Singleton, Strategy, Decorator, Observer, …) — it organizes *classes and objects*, which a framework-free, server-rendered Dawn theme does not have. CLAUDE.md forbids frameworks/build steps, so forcing those patterns in would be cargo-cult. The portable half is the **code-smell + refactoring-technique** catalog. The patterns that *do* fit this platform are already present (pub/sub = Observer, snippets = Extract-Function/partials, color schemes = config strategy, the Web Component guard = a consistent registration idiom). **So this refactor adds no OOP abstractions; it applies the platform's own idiom — snippets — to kill duplication.** (Locked decision: stay platform-native, no GoF.)

## Smells addressed (measured)

| Smell (refactoring.guru) | Where | Count |
|---|---|---|
| Duplicate Code / Shotgun Surgery — per-section padding `{% style %}` block | every `ct-*` section | **15** |
| Duplicate Code — `.ct-section-head` kicker+title markup | content `ct-*` sections | **9** |
| Duplicate Code — trust-chip `newline_to_br \| split` loop | ct-pricing, ct-final-cta | **2** |
| Duplicate Code — `<product-form>` add-to-cart embed | ct-pricing, cart-drawer upsell | **2** |
| Duplicate Code — "elevated card" CSS base (`bg-raised`+border+radius) | section CSS files | **~9** |

## Scope (locked)

In: the four snippet extractions + the `.ct-card` CSS base + the authoring doc. **Only our `ct-*` files** + the cart-drawer upsell block. **Out:** all Dawn-native files (buy-buttons, main-product, featured-product, card-product, cart.js, product-form.js, …), any GoF/OOP abstraction, any visual normalization beyond the 3 truly-identical card properties.

## Deliverables

### 1. `snippets/ct-section-padding.liquid`
Holds the identical block currently inline in 15 sections:
```liquid
{%- style -%}
  .section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top | times: 0.75 | round: 0 }}px;padding-bottom:{{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px}
  @media screen and (min-width:750px){.section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top }}px;padding-bottom:{{ section.settings.padding_bottom }}px}}
{%- endstyle -%}
```
Each section replaces those lines with `{% render 'ct-section-padding', section: section %}`. The snippet reads `section.id`, `section.settings.padding_top`, `section.settings.padding_bottom` from the passed `section`.

### 2. `snippets/ct-section-head.liquid`
Params: `kicker`, `heading`. Output (must be byte-identical to the current inline markup):
```liquid
{%- if heading != blank -%}
  <div class="ct-section-head" data-reveal>
    {%- if kicker != blank -%}<div class="ct-kicker">{{ kicker }}</div>{%- endif -%}
    <h2 class="ct-section-head__title">{{ heading }}</h2>
  </div>
{%- endif -%}
```
Call: `{% render 'ct-section-head', kicker: section.settings.kicker, heading: section.settings.heading %}`.
**Pre-flight verification (plan step 1):** confirm all 9 candidate sections (ct-aplus, ct-reviews, ct-use-cases, ct-pricing, ct-journey, ct-pillars, ct-ba, ct-compare, ct-faq) use this exact block. Any section that differs (e.g. an inline `style=`, an extra sub-line) either keeps its inline markup or the snippet gains an optional param — decided per-case during implementation, documented in the plan.

### 3. `snippets/ct-trust-chips.liquid`
Params: `chips` (the raw textarea string), optional `class` (default `ct-trust-row`), optional `wrap_style`, optional `reveal` (boolean → adds `data-reveal`). Output:
```liquid
<div class="{{ class | default: 'ct-trust-row' }}"{% if wrap_style %} style="{{ wrap_style }}"{% endif %}{% if reveal %} data-reveal{% endif %}>
  {%- assign _chips = chips | newline_to_br | split: '<br />' -%}
  {%- for chip in _chips -%}
    {%- assign _t = chip | strip_newlines | strip -%}
    {%- if _t != blank -%}<span class="ct-trust-chip">{{ _t }}</span>{%- endif -%}
  {%- endfor -%}
</div>
```
ct-pricing currently wraps with `style="margin-top:24px"` + `data-reveal`; ct-final-cta has neither. The snippet supports both via `wrap_style` and a `reveal` flag so both call sites stay byte-identical.

### 4. `snippets/ct-add-to-cart.liquid`
Params: `product`, `variant`, `label`, `btn_class` (e.g. `ct-btn ct-btn--primary ct-btn--full`), `form_id`, `section_id`. Output = the exact `<product-form>` structure both call sites use today (the `<span>` + `{% render 'loading-spinner' %}` are required by `product-form.js` and live only here now):
```liquid
<product-form class="product-form" data-hide-errors="true" data-section-id="{{ section_id }}">
  {%- form 'product', product, id: form_id, class: 'form' -%}
    <input type="hidden" name="id" value="{{ variant.id }}" class="product-variant-id"{% unless variant.available %} disabled{% endunless %}>
    <button type="submit" name="add" class="{{ btn_class }}"{% unless variant.available %} disabled{% endunless %}>
      <span>{% if variant.available %}{{ label }}{% else %}{{ 'products.product.sold_out' | t }}{% endif %}</span>
      {%- render 'loading-spinner' -%}
    </button>
  {%- endform -%}
</product-form>
```
Consumed by `ct-pricing.liquid` (the `if ct_product != blank and variant != blank` branch — the fallback `<a>` link stays inline) and the cart-drawer upsell block. The cart-drawer call uses `btn_class: 'ct-btn ct-btn--soft ct-btn--sm'`, `label: 'Add'`, `form_id: 'ct-upsell-form'`, `section_id: 'cart-drawer-upsell'`.

**⚠️ HIGHEST-RISK EXTRACTION — extra safeguards (user-flagged: "don't break the Shopify form"):**
- **`product-form.js` contract, must be preserved exactly:** the `<product-form>` element MUST contain — a `<form>` (from `{% form 'product' %}`); a `[name="id"]` input (`this.variantIdInput`); a `[type="submit"]` button (`this.submitButton`) with a **direct child `<span>`** (`submitButton.querySelector('span')` → `submitButtonText`); and a `.loading__spinner` element (via `{% render 'loading-spinner' %}`). Missing any of these throws in the constructor or `onSubmitHandler`.
- **Equivalence check, both call sites:** the snippet's rendered output must be byte-identical (ignoring inert inter-tag whitespace) to each current inline block. Confirm via `git diff` reasoning before committing. Note the upsell's original `<span>Add</span>` becomes `<span>{% if available %}Add{% else %}…sold_out…{% endif %}</span>` — since the upsell only ever shows an available product (filtered by `ct_p.available`), this renders identically; documented, not a behavior change.
- **Sequencing:** this extraction is the **LAST task, in its own isolated commit**, so it can be reverted without disturbing the safe extractions.
- **Mandatory live gate:** unlike the others, theme-check cannot prove this works — the add-to-cart must be exercised live (`shopify theme dev`: a pricing card add + a cart-drawer-upsell add both open the drawer and add the right variant) before it is considered done. The user may choose to keep this extraction unmerged/local until that live check passes; the other extractions do not depend on it.

### 5. `.ct-card` base in `assets/ct-sections.css`
Add exactly the three universally-identical properties:
```css
.ct-card{background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl)}
```
Adopt on the card surfaces that currently declare all three: `.ct-pillar`, `.ct-journey-step`, `.ct-use-case-card`, `.ct-review-card`, `.ct-plan`, `.ct-pricing-vs`, `.ct-aplus-banner`, `.ct-stats`, `.ct-hero-card` (its `background:#fff` equals `--ct-bg-raised`). For each: add `ct-card` to the element's class list in the section markup, and delete those three properties from the section CSS rule. **Per-section shadow, padding, hover, overflow, transition, grid all stay** — they legitimately differ (`--ct-shadow-xs` vs `-sm` vs `-lg`, etc.). If a surface uses a different shadow/etc., that is preserved.

### 6. `docs/ct-section-authoring.md`
Short reference: the anatomy of a `ct-*` section (load `ct-sections.css` + own `section-ct-*.css` → `{% render 'ct-section-padding' %}` → `page-width` + `color-{scheme}` wrapper → `{% render 'ct-section-head' %}` → blocks loop with `data-reveal`), the four snippet interfaces, and the shared primitives (`.ct-card`, `.ct-btn*`, `.ct-eyebrow`, `.ct-trust-chip`, `.ct-rating-row`). Goal: new sections start DRY.

## Constraints / invariants

- Behavior-preserving: rendered HTML/CSS unchanged. Snippet outputs are byte-identical to the inline versions they replace (whitespace inside `{% render %}` is the snippet's, not the call site's — acceptable since output is HTML where inter-tag whitespace is inert here; verified per task that no class/attr/text changed).
- `shopify theme check` stays at **14 offenses**; investigate any change.
- One extraction per commit; each independently revertable.
- No Dawn-native files modified. No new global JS. No new dependencies.

## Verification

- After each task: `shopify theme check` = 14, and a manual diff review confirming the swapped markup is equivalent.
- `git grep` confirms the old inline blocks are gone from `ct-*` files (no stragglers) and the snippet is referenced the expected number of times.
- **Live `shopify theme dev` pass deferred to the user** (interactive login + dev-store password `pwsirj-4x`): spot-check the homepage + landing page render identically to before (section spacing, headings, cards, trust rows, pricing add-to-cart, cart upsell). This is the real equivalence gate; theme-check cannot prove rendered-output equivalence.
