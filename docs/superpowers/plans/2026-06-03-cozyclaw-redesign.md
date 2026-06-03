# CozyClaw Redesign (P6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the landing page (`templates/page.landing.json`) and PDP polish (`templates/product.json`) to the CozyClaw design — `files/cozyclaw-{design-system,landing-spec,pdp-spec}.md` plus the reference HTML in `files/cozyclaw-{landing,pdp}.html` — without touching Dawn's commerce JS / `product-form` / variant selects / cart-drawer logic.

**Architecture:** Additive-only. All schema fields default-blank or default-to-current-behavior so other templates (homepage `index.json`, customer pages, collection, cart) render unchanged. Five existing `ct-*` sections get small, optional primitives. No new sections, no new JS files. CSS additions live in the existing per-section stylesheets that each section already loads.

**Tech Stack:** Shopify Dawn 15.4.1 · Liquid · vanilla CSS with `--ct-*` tokens · no build step. Lint via `shopify theme check` (baseline = 11 offenses; must stay ≤11 after each task).

**Spec:** `docs/superpowers/specs/2026-06-03-cozyclaw-redesign-design.md`

---

## Working notes for the implementer

- **Dev server is interactive.** `shopify theme dev` needs a store password prompt. Run `shopify theme check` locally — that's the only automated gate. Visual QA on the running dev server is the user's responsibility.
- **Atomic-write hazard.** Do not edit theme files while `shopify theme dev` is running — it jams the upload queue. Batch edits, then restart the dev server.
- **Theme-check baseline = 11.** After every commit run `shopify theme check 2>&1 | findstr /R "offenses\|errors"` (Windows) or `shopify theme check | grep -E 'offenses|errors'` (unix). Count must stay ≤ 11. If it rises, fix before moving on.
- **No PowerShell sleep.** Use direct edits + theme check; no polling loops.
- **Commit style.** Project uses Conventional Commits with scope: `feat(ct-use-cases):`, `feat(ct-hero):`, `feat(landing):`, `chore(p6):`. Stage specific files (never `git add -A`).
- **Token discipline.** Every new color/space/shadow/radius must reference `--ct-*` from `snippets/css-variables.liquid`. Hardcoded brand hex forbidden except `#fff` over the accent button (Dawn pattern) and the intentionally-fixed `#D9433A` urgency-red / `#E8A93C` rating-gold.

---

## File map

| File | Type | Responsibility | Tasks |
|---|---|---|---|
| `sections/ct-use-cases.liquid` | modify | Add optional `layout` setting; emit `data-layout` attr on grid | T1 |
| `assets/section-ct-use-cases.css` | modify | Add `[data-layout="pillars"]` rules: 2-col grid, horizontal card with icon-tile | T1 |
| `sections/ct-pricing.liquid` | modify | Add optional `emoji` + `save_text` block settings; render above name + below price | T2 |
| `assets/section-ct-pricing.css` | modify | `.ct-plan__emoji` + `.ct-plan__save` rules | T2 |
| `assets/section-ct-reviews.css` | modify | Rebuild `.ct-reviews-rating-row` as centered vertical stack; bump score to 56px Fraunces | T3 |
| `sections/ct-final-cta.liquid` | modify | Add optional `trust_style` setting; branch chips vs pills | T4 |
| `assets/section-ct-final-cta.css` | modify | `.ct-final-cta__pills` + `.ct-final-cta__pill` rules (check-svg variant) | T4 |
| `sections/ct-hero.liquid` | modify | Add 5 new schema fields (sale_badge, price_now/was/save_label, availability_text); reorder render to rating → price-row → availability; check-svg in pill markup | T5 |
| `assets/section-ct-hero.css` | modify | `.ct-hero-sale-badge`, `.ct-hero-price-row` + children, `.ct-hero-avail`, repositioned `.ct-hero-float`, replaced `.ct-hero-card` markup, `.ct-hero-gallery` + `.ct-hero-thumb` | T5 + T6 |
| `sections/ct-hero.liquid` (markup) | modify | Replace `.ct-hero-card` with `.ct-hero-product-card`; add `thumb` block type; render thumb gallery | T6 |
| `templates/page.landing.json` | modify | Re-seed ct_hero with new fields + 4 thumb blocks; ct_why layout=pillars; ct_bundle plan emoji+save_text; ct_reviews rating_number; ct_final trust_style=pills; fix title to "CozyClaw Lounge Mat" | T7 |
| `templates/product.json` | modify | ct_why layout=pillars; ct_reviews rating_number+rating_count | T8 |
| `assets/section-ct-bundle-tiers.css` | verify only | Confirm `.ct-tier.is-active` has 2px accent border + accent-subtle tint | T8 |

No new files. Zero JS.

---

## Task 1: Why-choose — add `pillars` layout option

**Goal:** `ct-use-cases` gains a `layout` select setting. Default `grid` preserves current 3-col + image-card rendering everywhere else. `pillars` emits 2-col + horizontal-card with icon-tile (matches `cozyclaw-landing.html` `.why-card`).

**Files:**
- Modify: `sections/ct-use-cases.liquid`
- Modify: `assets/section-ct-use-cases.css`

- [ ] **Step 1: Add `layout` setting to schema**

In `sections/ct-use-cases.liquid`, inside the `"settings": [...]` array, insert this object after the `heading` setting (line ~38):

```json
{ "type": "select", "id": "layout", "label": "Layout", "options": [ { "value": "grid", "label": "Grid (image cards)" }, { "value": "pillars", "label": "Pillars (icon + horizontal card)" } ], "default": "grid" },
```

- [ ] **Step 2: Emit `data-layout` attr on the grid**

In the same file, replace the line:

```liquid
<div class="ct-use-case-grid">
```

with:

```liquid
<div class="ct-use-case-grid" data-layout="{{ section.settings.layout | default: 'grid' }}">
```

- [ ] **Step 3: Add pillars CSS**

Append to `assets/section-ct-use-cases.css`:

```css

/* ---- Pillars layout (CozyClaw landing/PDP Why-choose) ---- */
.ct-use-case-grid[data-layout="pillars"]{grid-template-columns:repeat(2,1fr);gap:18px}
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-card{display:flex;flex-direction:row;gap:18px;align-items:flex-start;padding:28px;background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-lg);box-shadow:var(--ct-shadow-xs);overflow:visible}
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-img{flex:0 0 54px;width:54px;height:54px;aspect-ratio:auto;border-radius:var(--ct-r-md);background:var(--ct-accent-subtle);font-size:26px}
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-tag,
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-num,
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-cta{display:none}
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-body{padding:0;flex:1}
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-title{font-size:17px;margin-bottom:6px}
.ct-use-case-grid[data-layout="pillars"] .ct-use-case-desc{font-size:14.5px;color:var(--ct-text-2);line-height:1.55}
@media(max-width:720px){.ct-use-case-grid[data-layout="pillars"]{grid-template-columns:1fr}}
```

- [ ] **Step 4: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11. If it rose, inspect the new lines.

- [ ] **Step 5: Commit**

```sh
git add sections/ct-use-cases.liquid assets/section-ct-use-cases.css
git commit -m "feat(ct-use-cases): add pillars layout (2-col horizontal cards)"
```

---

## Task 2: Bundle — add `emoji` + `save_text` to plan blocks

**Goal:** `ct-pricing` plan blocks gain an optional `emoji` (rendered above name) and `save_text` (urgency-red chip rendered below price row). Used by the landing's bundle section to show 🐈 / 🦴 / 🧤 + "Save 20%" / "Save $12.98" / "Save $5.98".

**Files:**
- Modify: `sections/ct-pricing.liquid`
- Modify: `assets/section-ct-pricing.css`

- [ ] **Step 1: Add `emoji` + `save_text` to plan block schema**

In `sections/ct-pricing.liquid`, inside the `"blocks": [{ "type": "plan", ..., "settings": [...] }]` array, insert these two objects right after the `"featured"` checkbox (around line 103):

```json
{ "type": "text", "id": "emoji", "label": "Emoji (above name)" },
{ "type": "text", "id": "save_text", "label": "Save chip text (e.g. \"Save 20%\")" },
```

- [ ] **Step 2: Render emoji above plan name**

In the same file, just before the line:

```liquid
<div class="ct-plan__name">{{ block.settings.name }}</div>
```

insert:

```liquid
{%- if block.settings.emoji != blank -%}<div class="ct-plan__emoji" aria-hidden="true">{{ block.settings.emoji }}</div>{%- endif -%}
```

- [ ] **Step 3: Render save chip below price-note**

In the same file, immediately after the `price_note` conditional block:

```liquid
{%- if block.settings.price_note != blank -%}<div class="ct-plan__price-note">{{ block.settings.price_note }}</div>{%- endif -%}
```

add:

```liquid
{%- if block.settings.save_text != blank -%}<div class="ct-plan__save">{{ block.settings.save_text }}</div>{%- endif -%}
```

- [ ] **Step 4: Add CSS for emoji + save chip**

Append to `assets/section-ct-pricing.css`:

```css

/* ---- CozyClaw bundle additions ---- */
.ct-plan__emoji{font-size:54px;line-height:1;margin-bottom:10px;text-align:center}
.ct-plan__save{display:inline-block;font-size:12px;font-weight:700;color:var(--ct-urgency);margin-bottom:16px}
```

- [ ] **Step 5: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11.

- [ ] **Step 6: Commit**

```sh
git add sections/ct-pricing.liquid assets/section-ct-pricing.css
git commit -m "feat(ct-pricing): add plan emoji + urgency save chip"
```

---

## Task 3: Reviews — Fraunces big-score, centered vertical stack

**Goal:** The existing `.ct-reviews-rating-row` block (`rating_number` + `rating_count` settings) already wires; only the visual treatment is wrong. Spec calls for a centered stack: 56px Fraunces score → 22px stars → meta line. Current is left-aligned 800-weight non-Fraunces row.

**Files:**
- Modify: `assets/section-ct-reviews.css`

- [ ] **Step 1: Replace rating-row CSS with centered stack**

In `assets/section-ct-reviews.css`, find this block:

```css
.ct-reviews-rating-row{display:flex;align-items:center;gap:16px;justify-content:center;margin-bottom:28px}
.ct-reviews-big-num{font-size:clamp(2.5rem,5vw,3.4rem);font-weight:800;color:var(--ct-text);letter-spacing:-.04em;line-height:1}
.ct-reviews-rating-col{display:flex;flex-direction:column;gap:2px}
.ct-reviews-rating-row .ct-stars{font-size:18px}
```

Replace with:

```css
.ct-reviews-rating-row{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;margin-bottom:36px;text-align:center}
.ct-reviews-big-num{font-family:var(--ct-font-display);font-size:56px;font-weight:700;color:var(--ct-text);letter-spacing:-.02em;line-height:1}
.ct-reviews-rating-col{display:flex;flex-direction:column;align-items:center;gap:4px}
.ct-reviews-rating-row .ct-stars{font-size:22px}
.ct-reviews-rating-col .ct-rating-count{font-size:14px;color:var(--ct-text-3)}
@media(max-width:600px){.ct-reviews-big-num{font-size:44px}}
```

- [ ] **Step 2: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11.

- [ ] **Step 3: Commit**

```sh
git add assets/section-ct-reviews.css
git commit -m "feat(ct-reviews): Fraunces 56px big-score, centered vertical stack"
```

---

## Task 4: Final CTA — add `trust_style` pills option

**Goal:** Optional `trust_style` setting: `chips` (default, current rendering via `ct-trust-chips` snippet) or `pills` (inline check-svg pill row matching `cozyclaw-landing.html` `.final-trust`).

**Files:**
- Modify: `sections/ct-final-cta.liquid`
- Modify: `assets/section-ct-final-cta.css`

- [ ] **Step 1: Add `trust_style` setting to schema**

In `sections/ct-final-cta.liquid`, inside `"settings": [...]`, replace this object (around line 44):

```json
{ "type": "checkbox", "id": "show_trust", "label": "Show trust chips", "default": true },
```

with:

```json
{ "type": "checkbox", "id": "show_trust", "label": "Show trust chips", "default": true },
{ "type": "select", "id": "trust_style", "label": "Trust row style", "options": [ { "value": "chips", "label": "Chips (checkmark prefix)" }, { "value": "pills", "label": "Pills (check svg)" } ], "default": "chips" },
```

- [ ] **Step 2: Branch markup on trust_style**

In the same file, replace:

```liquid
{%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
  {% render 'ct-trust-chips', chips: section.settings.trust_chips %}
{%- endif -%}
```

with:

```liquid
{%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
  {%- if section.settings.trust_style == 'pills' -%}
    <div class="ct-final-cta__pills">
      {%- assign trust_lines = section.settings.trust_chips | newline_to_br | split: '<br />' -%}
      {%- for line in trust_lines -%}
        {%- assign line_text = line | strip_newlines | strip -%}
        {%- if line_text != blank -%}
          <span class="ct-final-cta__pill"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>{{ line_text }}</span>
        {%- endif -%}
      {%- endfor -%}
    </div>
  {%- else -%}
    {% render 'ct-trust-chips', chips: section.settings.trust_chips %}
  {%- endif -%}
{%- endif -%}
```

- [ ] **Step 3: Add pill CSS**

Append to `assets/section-ct-final-cta.css`:

```css

/* ---- Pills trust-style (CozyClaw landing) ---- */
.ct-final-cta__pills{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px}
.ct-final-cta__pill{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--ct-text-2);background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);padding:7px 13px;border-radius:var(--ct-r-pill)}
.ct-final-cta__pill svg{width:13px;height:13px;stroke:var(--ct-accent);stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
```

- [ ] **Step 4: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11.

- [ ] **Step 5: Commit**

```sh
git add sections/ct-final-cta.liquid assets/section-ct-final-cta.css
git commit -m "feat(ct-final-cta): add pills trust-style (check svg)"
```

---

## Task 5: Hero — buy-box primitives (sale-badge, price-row, availability, check-svg pills, rating reposition)

**Goal:** Add the four new buy-box primitives to `ct-hero`. Keep existing rendering intact when fields are blank.

Render order target (per `cozyclaw-landing.html`):
1. sale-badge → 2. h1 → 3. h1_subtitle (italic Fraunces) → 4. subheading (description) → 5. rating-row → 6. price-row → 7. availability → 8. buttons → 9. pills.

**Files:**
- Modify: `sections/ct-hero.liquid`
- Modify: `assets/section-ct-hero.css`

- [ ] **Step 1: Add new fields to schema**

In `sections/ct-hero.liquid`, inside `"settings": [...]`, insert these objects after the existing `eyebrow` setting (line ~80):

```json
{ "type": "text", "id": "sale_badge", "label": "Sale badge (urgency-red pill)", "info": "e.g. 🔥 2,175 sold. Renders above h1. Leave blank to hide." },
```

Then, after the `subheading` textarea (line ~82), insert:

```json
{ "type": "header", "content": "Price + availability" },
{ "type": "text", "id": "price_now", "label": "Current price (e.g. $35.97)" },
{ "type": "text", "id": "price_was", "label": "Compare-at price (struck)" },
{ "type": "text", "id": "price_save_label", "label": "Save chip (e.g. Save 20%)" },
{ "type": "text", "id": "availability_text", "label": "Availability line", "info": "e.g. In stock — ships in 3–7 business days. Leave blank to hide." },
```

- [ ] **Step 2: Reorder + add markup in ct-hero-text**

In `sections/ct-hero.liquid`, replace the entire `<div class="ct-hero-text">…</div>` block (lines 9–43) with:

```liquid
      <div class="ct-hero-text">
        {%- if section.settings.sale_badge != blank -%}
          <span class="ct-hero-sale-badge">{{ section.settings.sale_badge }}</span>
        {%- endif -%}
        {%- if section.settings.eyebrow != blank -%}
          <div class="ct-eyebrow"><span class="ct-eyebrow__dot"></span>{{ section.settings.eyebrow }}</div>
        {%- endif -%}
        {%- if section.settings.heading != blank -%}
          <h1 class="ct-hero-h1">{{ section.settings.heading }}</h1>
        {%- endif -%}
        {%- if section.settings.h1_subtitle != blank -%}
          <div class="ct-hero-h1-sub">{{ section.settings.h1_subtitle }}</div>
        {%- endif -%}
        {%- if section.settings.subheading != blank -%}
          <p class="ct-hero-sub">{{ section.settings.subheading }}</p>
        {%- endif -%}
        {%- if section.settings.show_rating -%}
          <div class="ct-rating-row ct-hero-rating">
            <span class="ct-stars">★★★★★</span>
            <span class="ct-rating-count">{{ section.settings.rating_text }}</span>
          </div>
        {%- endif -%}
        {%- if section.settings.price_now != blank -%}
          <div class="ct-hero-price-row">
            <span class="ct-hero-price-now">{{ section.settings.price_now }}</span>
            {%- if section.settings.price_was != blank -%}<span class="ct-hero-price-was">{{ section.settings.price_was }}</span>{%- endif -%}
            {%- if section.settings.price_save_label != blank -%}<span class="ct-hero-price-save">{{ section.settings.price_save_label }}</span>{%- endif -%}
          </div>
        {%- endif -%}
        {%- if section.settings.availability_text != blank -%}
          <div class="ct-hero-avail"><span class="ct-hero-avail__dot" aria-hidden="true"></span>{{ section.settings.availability_text }}</div>
        {%- endif -%}
        <div class="ct-hero-btns">
          {%- if section.settings.button_label != blank -%}
            <a class="ct-btn ct-btn--primary ct-btn--lg" href="{{ section.settings.button_link | default: '#' }}">{{ section.settings.button_label }}</a>
          {%- endif -%}
          {%- if section.settings.button_label_2 != blank -%}
            <a class="ct-btn ct-btn--outlined" href="{{ section.settings.button_link_2 | default: '#' }}">{{ section.settings.button_label_2 }}</a>
          {%- endif -%}
        </div>
        {%- if section.blocks.size > 0 -%}
          <div class="ct-hero-pills">
            {%- for block in section.blocks -%}
              {%- if block.type == 'pill' -%}
                <span class="ct-hero-pill" {{ block.shopify_attributes }}><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>{{ block.settings.text }}</span>
              {%- endif -%}
            {%- endfor -%}
          </div>
        {%- endif -%}
      </div>
```

Note three changes from current:
1. New `.ct-hero-sale-badge` at the top.
2. Rating moved from end (after pills) to between subheading and price-row.
3. Pills are wrapped with `{%- if block.type == 'pill' -%}` — Task 6 adds a second block type (`thumb`) that must NOT render in this loop.
4. Pill markup now includes an inline check svg (replaces the `::before { content:'•' }` bullet).

- [ ] **Step 3: Add CSS for new primitives + remove pill bullet**

In `assets/section-ct-hero.css`, find the `.ct-hero-pill` rule (line ~10):

```css
.ct-hero-pill{display:flex;align-items:center;gap:6px;background:var(--ct-bg);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-pill);padding:5px 12px;font-size:13px;color:var(--ct-text-2)}
.ct-hero-pill::before{content:'•';color:var(--ct-accent-text);font-size:10px}
```

Replace those two lines with:

```css
.ct-hero-pill{display:inline-flex;align-items:center;gap:6px;background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-pill);padding:7px 13px;font-size:12.5px;font-weight:600;color:var(--ct-text-2)}
.ct-hero-pill svg{width:13px;height:13px;stroke:var(--ct-accent);stroke-width:3;fill:none;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
```

Then append to the same file:

```css

/* ---- CozyClaw buy-box primitives (sale-badge, rating row, price row, availability) ---- */
.ct-hero-sale-badge{display:inline-flex;align-items:center;gap:7px;background:var(--ct-urgency);color:#fff;font-size:12.5px;font-weight:700;letter-spacing:.04em;padding:7px 14px;border-radius:var(--ct-r-pill);margin-bottom:18px;box-shadow:0 6px 16px rgba(217,67,58,.25)}
.ct-hero-rating{margin:0 0 22px}
.ct-hero-rating .ct-stars{font-size:14px}
.ct-hero-rating .ct-rating-count{font-size:14px;color:var(--ct-text-2)}
.ct-hero-price-row{display:flex;align-items:baseline;gap:12px;margin-bottom:14px;flex-wrap:wrap}
.ct-hero-price-now{font-family:var(--ct-font-display);font-size:38px;font-weight:700;color:var(--ct-text);line-height:1}
.ct-hero-price-was{font-size:20px;color:var(--ct-price-was);text-decoration:line-through}
.ct-hero-price-save{font-size:13px;font-weight:700;color:#fff;background:var(--ct-urgency);padding:4px 10px;border-radius:var(--ct-r-pill)}
.ct-hero-avail{display:inline-flex;align-items:center;gap:7px;font-size:13.5px;font-weight:700;color:var(--ct-success);margin-bottom:18px}
.ct-hero-avail__dot{width:8px;height:8px;border-radius:50%;background:var(--ct-success)}
```

- [ ] **Step 4: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11.

- [ ] **Step 5: Commit**

```sh
git add sections/ct-hero.liquid assets/section-ct-hero.css
git commit -m "feat(ct-hero): add sale-badge + price-row + availability + check-svg pills"
```

---

## Task 6: Hero — visual rebuild (big product card + thumb gallery + repositioned float-tag)

**Goal:** Replace the small 340px `.ct-hero-card` (with name/price/tags overlay) with a clean `.ct-hero-product-card` (aspect 4/3.4, 120px emoji, neutral bg — feed-compliant). Add a `.ct-hero-gallery` thumb row + a new `thumb` block type. Move `.ct-hero-float` to bottom-left of the visual column.

**Files:**
- Modify: `sections/ct-hero.liquid`
- Modify: `assets/section-ct-hero.css`

- [ ] **Step 1: Add `thumb` block type to schema**

In `sections/ct-hero.liquid`, in the schema `"blocks": [...]` array (line ~108), replace:

```json
{ "type": "pill", "name": "Feature pill", "settings": [ { "type": "text", "id": "text", "label": "Text", "default": "Feature" } ] }
```

with:

```json
{ "type": "pill", "name": "Feature pill", "settings": [ { "type": "text", "id": "text", "label": "Text", "default": "Feature" } ] },
{ "type": "thumb", "name": "Hero gallery thumb", "settings": [
  { "type": "text", "id": "emoji", "label": "Emoji (fallback)", "default": "🐈" },
  { "type": "image_picker", "id": "image", "label": "Thumb image (optional)" },
  { "type": "checkbox", "id": "is_primary", "label": "Primary thumb (accent border)", "default": false }
] }
```

Also bump `"max_blocks": 5` to `"max_blocks": 10` so up to 5 pills + 4 thumbs fit.

- [ ] **Step 2: Replace ct-hero-visual markup**

In `sections/ct-hero.liquid`, find and replace the entire `<div class="ct-hero-visual">…</div>` block (lines 44–68) with:

```liquid
      <div class="ct-hero-visual">
        {%- if section.settings.image != blank -%}
          <div class="ct-hero-product-card">
            {{ section.settings.image | image_url: width: 900 | image_tag: loading: 'eager', class: 'ct-hero-product-card__img', alt: section.settings.heading | strip_html | default: '' }}
          </div>
        {%- elsif section.settings.card_emoji != blank -%}
          <div class="ct-hero-product-card">
            <div class="ct-hero-product-card__emoji" aria-hidden="true">{{ section.settings.card_emoji }}</div>
          </div>
        {%- endif -%}
        {%- assign thumb_count = 0 -%}
        {%- for block in section.blocks -%}{%- if block.type == 'thumb' -%}{%- assign thumb_count = thumb_count | plus: 1 -%}{%- endif -%}{%- endfor -%}
        {%- if thumb_count > 0 -%}
          <div class="ct-hero-gallery">
            {%- for block in section.blocks -%}
              {%- if block.type == 'thumb' -%}
                <div class="ct-hero-thumb{% if block.settings.is_primary %} ct-hero-thumb--primary{% endif %}" {{ block.shopify_attributes }}>
                  {%- if block.settings.image != blank -%}
                    {{ block.settings.image | image_url: width: 200 | image_tag: loading: 'lazy', class: 'ct-hero-thumb__img', alt: '' }}
                  {%- else -%}
                    <span aria-hidden="true">{{ block.settings.emoji | default: '🐈' }}</span>
                  {%- endif -%}
                </div>
              {%- endif -%}
            {%- endfor -%}
          </div>
        {%- endif -%}
        {%- if section.settings.float_value != blank -%}
          <div class="ct-hero-float">
            {%- if section.settings.float_icon != blank -%}<div class="ct-hero-float__icon">{{ section.settings.float_icon }}</div>{%- endif -%}
            <div>
              {%- if section.settings.float_label != blank -%}<div class="ct-hero-float__label">{{ section.settings.float_label }}</div>{%- endif -%}
              <div class="ct-hero-float__val">{{ section.settings.float_value }}</div>
            </div>
          </div>
        {%- endif -%}
      </div>
```

Note: the old `.ct-hero-visual__glow` div is dropped (the background gradient now lives on `.ct-hero-visual` itself; see Step 3 CSS).

- [ ] **Step 3: Rewrite hero-visual + card + gallery + float-tag CSS**

In `assets/section-ct-hero.css`:

(a) Replace the `.ct-hero-visual` rule (line ~13):

```css
.ct-hero-visual{background:radial-gradient(120% 100% at 88% -5%, var(--ct-accent-subtle) 0%, transparent 55%), linear-gradient(135deg, #FCFAFE 0%, #FFFFFF 100%);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
```

with:

```css
.ct-hero-visual{position:relative;display:flex;flex-direction:column;justify-content:center;padding:0;background:transparent;overflow:visible}
```

(b) Delete these old card rules (lines ~14–23 of the original CSS):

```css
.ct-hero-visual__glow{position:absolute;inset:0;background:radial-gradient(circle at 60% 40%,rgba(109,63,196,.10) 0%,transparent 70%)}
.ct-hero-visual__img{position:relative;width:100%;height:100%;object-fit:cover}
.ct-hero-card{position:relative;background:#fff;border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-xl);padding:24px 22px;box-shadow:var(--ct-shadow-2xl);width:min(340px,80%);animation:ct-float 5s ease-in-out infinite;text-align:center;overflow:hidden}
.ct-hero-card__emoji{font-size:96px;margin-bottom:12px;line-height:1}
.ct-hero-card__name{font-size:13px;font-weight:700;color:var(--ct-text)}
.ct-hero-card__price{font-size:18px;font-weight:800;color:var(--ct-price);margin-top:4px}
.ct-hero-card__tags{display:flex;gap:4px;justify-content:center;margin-top:6px}
.ct-hero-card__tag{font-size:10px;font-weight:700;padding:2px 8px;border-radius:var(--ct-r-pill)}
.ct-hero-card__tag--rating{background:var(--ct-accent-subtle);color:var(--ct-accent-text)}
.ct-hero-card__tag--ship{background:#fff5cc;color:#7a4f01}
```

(c) Append the new product-card + gallery + repositioned float:

```css

/* ---- Big product card (feed-safe: clean, text-free, neutral bg) ---- */
.ct-hero-product-card{position:relative;width:100%;aspect-ratio:4/3.4;border-radius:var(--ct-r-xl);overflow:hidden;border:1px solid var(--ct-border-subtle);background:#FCFBFE;box-shadow:var(--ct-shadow-2xl);display:flex;align-items:center;justify-content:center}
.ct-hero-product-card::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 30% 22%, rgba(255,255,255,.6), transparent 45%);pointer-events:none}
.ct-hero-product-card__img{width:100%;height:100%;object-fit:cover;position:relative}
.ct-hero-product-card__emoji{font-size:120px;line-height:1;position:relative}

/* ---- Thumbnail gallery under product card ---- */
.ct-hero-gallery{display:flex;gap:10px;margin-top:14px}
.ct-hero-thumb{flex:1;aspect-ratio:1;border-radius:var(--ct-r-md);border:1px solid var(--ct-border-subtle);background:#FCFBFE;display:flex;align-items:center;justify-content:center;font-size:26px;overflow:hidden}
.ct-hero-thumb--primary{border:2px solid var(--ct-accent)}
.ct-hero-thumb__img{width:100%;height:100%;object-fit:cover}

/* ---- Floating size tag — bottom-left (was top-right) ---- */
```

(d) Find the existing `.ct-hero-float` rule (around line 30) and replace just that selector's positioning:

```css
.ct-hero-float{position:absolute;bottom:16px;right:16px;background:var(--ct-bg-raised);border:1px solid var(--ct-accent-border);border-radius:var(--ct-r-xl);padding:12px 16px;box-shadow:var(--ct-shadow-lg);display:flex;align-items:center;gap:10px;max-width:210px}
```

becomes:

```css
.ct-hero-float{position:absolute;bottom:-18px;left:-16px;background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-md);padding:12px 16px;box-shadow:var(--ct-shadow-lg);display:flex;align-items:center;gap:10px;max-width:230px;animation:ct-float 5s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.ct-hero-float{animation:none}}
```

The existing `@keyframes ct-float` (line ~24) still applies — reuse it.

(e) Also drop the now-unused `.ct-hero-card` animation reference. Find the rule near line ~24:

```css
@media(prefers-reduced-motion:reduce){.ct-hero-card{animation:none}}
```

and delete it (the reduced-motion rule was already re-emitted in step (d) for `.ct-hero-float`).

- [ ] **Step 4: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11.

- [ ] **Step 5: Commit**

```sh
git add sections/ct-hero.liquid assets/section-ct-hero.css
git commit -m "feat(ct-hero): visual rebuild — big product card + thumb gallery + repositioned float-tag"
```

---

## Task 7: Wire landing template — page.landing.json

**Goal:** Seed the new ct-hero / ct-why / ct-bundle / ct-reviews / ct-final settings with the CozyClaw content from `cozyclaw-landing.html`. Fix product title to "CozyClaw Lounge Mat" (per spec R2).

**Files:**
- Modify: `templates/page.landing.json`

- [ ] **Step 1: Update ct_hero section**

In `templates/page.landing.json`, replace the entire `"ct_hero"` section block (lines ~3–33) with:

```json
    "ct_hero": {
      "type": "ct-hero",
      "blocks": {
        "p1": { "type": "pill", "settings": { "text": "Free shipping over $50" } },
        "p2": { "type": "pill", "settings": { "text": "7-day money-back" } },
        "p3": { "type": "pill", "settings": { "text": "Secure checkout" } },
        "t1": { "type": "thumb", "settings": { "emoji": "🐈", "is_primary": true } },
        "t2": { "type": "thumb", "settings": { "emoji": "😻" } },
        "t3": { "type": "thumb", "settings": { "emoji": "🛋️" } },
        "t4": { "type": "thumb", "settings": { "emoji": "🐾" } }
      },
      "block_order": ["p1", "p2", "p3", "t1", "t2", "t3", "t4"],
      "settings": {
        "sale_badge": "🔥 2,175 sold",
        "eyebrow": "",
        "heading": "CozyClaw Lounge Mat",
        "h1_subtitle": "Protect your sofa without fighting your cat.",
        "subheading": "A plush 2-in-1 sofa cover and cat bed. Place it where your cat already hangs out — soft enough to nap on, beautiful enough to leave out when guests come over.",
        "show_rating": true,
        "rating_text": "92% 5-star · 13 verified reviews",
        "price_now": "$35.97",
        "price_was": "$44.97",
        "price_save_label": "Save 20%",
        "availability_text": "In stock — ready to ship in 3–7 business days",
        "button_label": "Add to Cart →",
        "button_link": "shopify://collections/all",
        "button_label_2": "See why cats love it",
        "button_link_2": "#why",
        "card_emoji": "🐈",
        "float_icon": "📏",
        "float_label": "Generous size",
        "float_value": "31.5 × 35.43 in",
        "color_scheme": "scheme-1",
        "padding_top": 40,
        "padding_bottom": 40
      }
    },
```

- [ ] **Step 2: Set ct_why layout = pillars**

In the `"ct_why"` section (around line 60), find the `"settings"` object and add `"layout": "pillars"` so it reads:

```json
"settings": { "kicker": "Why choose us", "heading": "Your cat will love you even more.", "layout": "pillars", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 }
```

- [ ] **Step 3: Add emoji + save_text to ct_bundle plan blocks**

In the `"ct_bundle"` section, edit each plan block's `settings` to add `"emoji"` and `"save_text"`. The three blocks become:

```json
"plan1": {
  "type": "plan",
  "settings": {
    "featured": true,
    "badge": "This product",
    "emoji": "🐈",
    "tag": "CozyClaw",
    "name": "CozyClaw Lounge Mat",
    "tagline": "\"Soft enough to nap, smart enough to protect.\"",
    "price_note": "One-time · ships in 3–7 days",
    "save_text": "Save 20%",
    "features": "Ultra-soft A-grade plush\nSupportive pillow edge\nNon-slip backing\nMachine washable\n31.5 × 35.43 in",
    "button_label": "Add CozyClaw Mat →",
    "button_style": "primary",
    "price_fallback": "$35.97"
  }
},
"plan2": {
  "type": "plan",
  "settings": {
    "tag": "Add-on",
    "badge": "💰 Biggest savings today",
    "emoji": "🦴",
    "name": "ChompClean Toy",
    "tagline": "\"For the kitty who needs a chew.\"",
    "price_note": "Pairs with mat · ships together",
    "save_text": "Save $12.98",
    "features": "Dental-safe chew material\nCleans teeth while they play\n- Bundles with Mat (free combo shipping)",
    "button_label": "Add ChompClean →",
    "button_style": "outlined",
    "price_fallback": "$13.99"
  }
},
"plan3": {
  "type": "plan",
  "settings": {
    "tag": "Add-on",
    "badge": "🏆 Best-selling combo",
    "emoji": "🧤",
    "name": "Easy Hair Removing Glove",
    "tagline": "\"Cuddle time meets cleanup.\"",
    "price_note": "Pairs with mat · ships together",
    "save_text": "Save $5.98",
    "features": "Silicone fingertips\nGentle on coat, fierce on fur\n- Bundles with Mat (free combo shipping)",
    "button_label": "Add Glove →",
    "button_style": "soft",
    "price_fallback": "$7.99"
  }
}
```

- [ ] **Step 4: Switch ct_reviews to big-score kicker**

In the `"ct_reviews"` section, replace the `"settings"` object with:

```json
"settings": { "kicker": "", "heading": "What cat parents say.", "rating_number": "4.9", "rating_count": "92% 5-star · based on 13 reviews · Join our 15,000+ happy customers", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 }
```

- [ ] **Step 5: Set ct_final trust_style = pills**

In the `"ct_final"` section, replace the `"settings"` object with:

```json
"settings": {
  "eyebrow": "Ready to make their day cozier?",
  "heading": "Give your cat the spot they'll never want to leave.",
  "subheading": "$35.97 today. Free shipping over $50. 7-day money-back guarantee.",
  "button_label": "Add to Cart →",
  "button_link": "shopify://collections/all",
  "button_label_2": "",
  "show_trust": true,
  "trust_style": "pills",
  "trust_chips": "Free shipping over $50\n7-day money-back\nSecure checkout\n92% 5-star · 13 reviews",
  "color_scheme": "scheme-1",
  "padding_top": 56,
  "padding_bottom": 56
}
```

- [ ] **Step 6: Update sticky ATC product name**

In the `"ct_sticky_atc"` section, change `"product_name": "CozyClaw Mat"` to `"product_name": "CozyClaw Lounge Mat"` and `"button_label": "Add to Cart — $35.97 →"` is fine as-is.

- [ ] **Step 7: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11. JSON syntax errors will show up here — fix any trailing-comma / bracket issues.

- [ ] **Step 8: Commit**

```sh
git add templates/page.landing.json
git commit -m "feat(landing): wire CozyClaw hero + bundle + reviews + final-CTA to spec"
```

---

## Task 8: PDP polish — wire product.json + verify bundle-tier active border

**Goal:** PDP inherits the same Why-pillars + Reviews-big-score treatment. Verify the bundle-tier picker's `.is-active` styling matches the spec (2px accent border + accent-subtle tint).

**Files:**
- Modify: `templates/product.json`
- Verify: `assets/section-ct-bundle-tiers.css`

- [ ] **Step 1: Set ct_why layout = pillars on PDP**

In `templates/product.json`, in the `"ct_why"` section settings, add `"layout": "pillars"`:

```json
"settings": { "kicker": "Why choose CozyClaw", "heading": "Built for cats, made to protect your couch", "layout": "pillars", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 }
```

- [ ] **Step 2: Switch ct_reviews to big-score on PDP**

In `templates/product.json`, replace the `"ct_reviews"` settings with:

```json
"settings": { "kicker": "", "heading": "Real cat parents, real results", "rating_number": "4.6", "rating_count": "92% 5-star · 12 five-star, 1 four-star · 13 verified reviews", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 }
```

(Note: PDP keeps one 4-star review per the spec's "Keep an honest mix" compliance rule. PDP score = 4.6, landing aspirational = 4.9.)

- [ ] **Step 3: Verify bundle-tier active border**

Read `assets/section-ct-bundle-tiers.css` and confirm a rule of this shape exists:

```css
.ct-tier.is-active{border:2px solid var(--ct-accent);background:var(--ct-accent-subtle)}
```

If a similar rule exists with `--ct-accent-border` instead of `--ct-accent`, or only 1px border, **add or update to** the rule above by appending to the file:

```css

/* ---- CozyClaw bundle-tier active state (P6 verify) ---- */
.ct-tier.is-active{border:2px solid var(--ct-accent);background:rgba(109,63,196,.05)}
```

If the rule already matches the spec, no edit needed — leave the file alone.

- [ ] **Step 4: Run theme check**

```sh
shopify theme check
```

Expected: offenses count ≤ 11.

- [ ] **Step 5: Commit**

```sh
git add templates/product.json assets/section-ct-bundle-tiers.css
git commit -m "feat(product): wire PDP polish — pillars Why + big-score reviews + tier active border"
```

(If Step 3 did not modify the bundle-tiers CSS, omit `assets/section-ct-bundle-tiers.css` from `git add`.)

---

## Task 9: Final verification

**Goal:** Confirm acceptance checklist items that can be verified statically. Visual + live-commerce items remain user-side on `shopify theme dev`.

**Files:** None modified.

- [ ] **Step 1: Theme-check final count**

```sh
shopify theme check
```

Expected: **≤ 11 offenses**. Note exact count — record for memory update.

- [ ] **Step 2: No CuddlesMeow anywhere**

```sh
git grep -i cuddlesmeow -- ":!files/"
```

Expected: **no output**. (Excluding `files/` because the reference HTML there still has the bug — we override in our impl.)

If anything matches outside `files/`, fix it before continuing.

- [ ] **Step 3: No hardcoded VND in templates or assets**

```sh
git grep -nE "VND|\\.000,?\\s*VND" -- "templates/*" "assets/*" "sections/*" "snippets/*"
```

Expected: **no output**.

- [ ] **Step 4: Old hero card class removed**

```sh
git grep -n "ct-hero-card" -- "sections/" "assets/"
```

Expected: **no output** (the rebuild dropped `.ct-hero-card` entirely; only `.ct-hero-product-card`, `.ct-hero-gallery`, `.ct-hero-thumb` remain).

- [ ] **Step 5: Landing JSON parses**

```sh
node -e "JSON.parse(require('fs').readFileSync('templates/page.landing.json','utf8'));console.log('ok')"
```

Expected: `ok`.

Same for product.json:

```sh
node -e "JSON.parse(require('fs').readFileSync('templates/product.json','utf8'));console.log('ok')"
```

Expected: `ok`.

- [ ] **Step 6: Confirm acceptance checklist items**

Walk through the spec's §10 acceptance checklist mentally:

**Landing:**
- [ ] Hero shows: sale-badge → h1 → italic sub → description → rating → price → availability → buttons → check-pill row → product-card + gallery + float-tag.
- [ ] Why-choose 2-col with icon-tile + horizontal text.
- [ ] Bundle "This product" has 2px accent border + emoji + save chip.
- [ ] Reviews big "4.9" 56px Fraunces score above 3 cards.
- [ ] Final-CTA renders check-svg pills.
- [ ] Sticky ATC reads "CozyClaw Lounge Mat".

**PDP (inherits):**
- [ ] Why pillars 2-col.
- [ ] Reviews big "4.6" score.
- [ ] Bundle tier `.is-active` = 2px accent border + tint.

**Cross-page:**
- [ ] theme-check ≤ 11.
- [ ] No CuddlesMeow.
- [ ] No VND.
- [ ] All ct-hero-card refs removed.

- [ ] **Step 7: Tag the redesign**

```sh
git tag -a p6-cozyclaw-redesign -m "P6: CozyClaw landing rebuild + PDP polish per spec 2026-06-03"
```

(Tag is local-only — push only if/when the user wants `git push --tags`.)

- [ ] **Step 8: Update memory note**

Edit `C:\Users\Admin\.claude\projects\c--Users-Admin-Desktop-Custom-Theme-dawn\memory\dawn-minimals-project.md` — find the "## P6 CozyClaw redesign" heading and change `SPEC written, plan + impl PENDING` to `SPEC + PLAN + IMPL DONE (HEAD <new-sha>, theme-check <final-count>). Live `theme dev` QA = user-side.` Substitute the actual SHA from `git log -1 --format=%h` and the count from Step 1.

No commit for the memory update (it's a personal file outside the repo).

---

## Self-review checklist

1. **Spec coverage** — Every gap in §4 of the spec has a task:
   - Hero H1 sale-badge ✓ T5
   - Hero H2 rating reposition ✓ T5
   - Hero H3 price-row ✓ T5
   - Hero H4 availability ✓ T5
   - Hero H5 check-svg pills ✓ T5
   - Hero H6 product card rebuild ✓ T6
   - Hero H7 thumb gallery ✓ T6
   - Hero H8 float-tag reposition ✓ T6
   - Why 2-col pillars ✓ T1
   - Bundle emoji + save chip ✓ T2 + featured border already exists (verified in T8 reuses spec §4.5 B1)
   - Reviews big-score block ✓ T3 (CSS-only — existing `rating_number`/`rating_count` fields reused)
   - Final-CTA pills ✓ T4
   - PDP polish ✓ T8

2. **Placeholder scan** — No TBD/TODO/"add appropriate error handling"/"similar to Task N" anywhere. Every code block is concrete.

3. **Type/name consistency** —
   - `.ct-hero-pill svg` selector used in T5 step 3 + emitted in T5 step 2 ✓
   - `.ct-hero-product-card` used consistently in T6 ✓
   - `.ct-hero-gallery` / `.ct-hero-thumb` / `.ct-hero-thumb--primary` consistent T6 ✓
   - `.ct-plan__emoji` / `.ct-plan__save` consistent T2 ✓
   - `.ct-final-cta__pills` / `.ct-final-cta__pill` consistent T4 ✓
   - `data-layout="pillars"` consistent T1 + matches §4.4 W1 of spec ✓
   - Schema field IDs (`sale_badge`, `price_now`, `price_was`, `price_save_label`, `availability_text`, `layout`, `emoji`, `save_text`, `trust_style`, thumb `image`/`emoji`/`is_primary`) all match between schema steps and JSON wiring ✓

4. **Spec ambiguity refinements made in plan:**
   - Spec §4.8 R1 said add `big_score` + `big_meta`. Plan reuses existing `rating_number` + `rating_count` (which already render `.ct-reviews-rating-row` + `.ct-reviews-big-num`) — saves a schema bloat. Result is functionally identical.
   - Spec §4.5 B3 said add `.ct-pricing-plan__save`. Existing class prefix is `.ct-plan__*` not `.ct-pricing-plan__*` — plan uses the real existing prefix.
   - Spec §4.1 H8 said float-tag bottom-left of product card; plan emits `bottom:-18px;left:-16px` (matches reference HTML `.float-tag` exactly).
