# Pricing, Cart Upsell & Remaining Landing Sections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `ct-pricing` (3 variant add-to-cart cards), a cart-drawer upsell, and `ct-pillars` / `ct-journey` / `ct-final-cta`, then rewire the landing template to the demo's order.

**Architecture:** Each content section follows the established `ct-*` pattern (loads `ct-sections.css` + own `section-ct-*.css`, `page-width` wrapper, per-section padding `{% style %}`, `color_scheme`, `data-reveal` hooks, `.ct-btn` family). `ct-pricing` adds commerce by embedding Dawn's native `<product-form>` per card (zero new commerce JS). The cart upsell fills the pre-existing `data-ct-upsell` stub in `snippets/cart-drawer.liquid`, server-rendered so Dawn's cart re-render keeps it current.

**Tech Stack:** Shopify Liquid, Dawn web components (`product-form.js`), `--ct-*` CSS tokens. No build step. **No unit-test framework exists for Liquid themes — the gate is `shopify theme check` (must stay at 14 offenses) plus deferred live `shopify theme dev` verification.**

**Spec:** `docs/superpowers/specs/2026-05-25-pricing-upsell-landing-sections-design.md`

---

## File structure

**Create:**
- `sections/ct-pillars.liquid` + `assets/section-ct-pillars.css`
- `sections/ct-journey.liquid` + `assets/section-ct-journey.css`
- `sections/ct-final-cta.liquid` + `assets/section-ct-final-cta.css`
- `sections/ct-pricing.liquid` + `assets/section-ct-pricing.css`

**Modify:**
- `assets/ct-sections.css` — add shared `.ct-trust-row` / `.ct-trust-chip` primitive (Task 3; reused by Task 4)
- `snippets/cart-drawer.liquid` — fill the `data-ct-upsell` slot (Task 5)
- `assets/theme-overrides.css` — `.ct-cart__upsell` card styles, next to the existing stub (Task 5)
- `templates/page.landing.json` — insert the four sections in demo order + seed copy (Task 6)

**Token mapping (demo `dawn-sample-landing.html` → `--ct-*`):** `--bg-base`→`--ct-bg`, `--bg-layer`→`--ct-bg-surface`, `--bg-elevated`→`--ct-bg-raised`, `--bg-control`→`--ct-bg-control`, `--tx1/2/3/4`→`--ct-text`/`--ct-text-2`/`--ct-text-3`/`--ct-text-off`, `--str1/2/3/4`→`--ct-border`/`--ct-border-strong`/`--ct-border-subtle`/`--ct-border-faint`, `--brand`→`--ct-accent`, `--brand-rest`/`--brand-fg`→`--ct-accent-strong`/`--ct-accent-text`, `--brand-bg2`→`--ct-accent-subtle`, `--brand-str`→`--ct-accent-border`, `--sh4/8/16/28`→`--ct-shadow-sm/md/lg/2xl`, `--r-s/m/l/xl`→`--ct-r-sm/md/lg/xl`, star gold→`--ct-rating`, `--font`/`--mono`→`--ct-font-body`/`--ct-font-mono`.

**Convention note:** section heads use the existing centered `.ct-section-head` + `.ct-kicker` + `.ct-section-head__title` (as `ct-aplus`/`ct-use-cases` already do on this page), not the demo's left-aligned `.section-eyebrow`. This keeps the landing page's section heads visually consistent.

---

## Task 1: `ct-pillars` (system grid)

**Files:**
- Create: `sections/ct-pillars.liquid`
- Create: `assets/section-ct-pillars.css`

- [ ] **Step 1: Create `assets/section-ct-pillars.css`**

```css
/* section-ct-pillars.css — demo .system/.pillar → .ct-pillar* (tokens → --ct-*) */
.ct-pillar-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.ct-pillar{background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl);padding:20px 16px;text-align:center;box-shadow:var(--ct-shadow-xs);transition:box-shadow .2s,transform .2s}
.ct-pillar:hover{box-shadow:var(--ct-shadow-md);transform:translateY(-2px)}
.ct-pillar__num{font-family:var(--ct-font-mono);font-size:10px;color:var(--ct-text-off);letter-spacing:.1em;margin-bottom:12px}
.ct-pillar__icon{font-size:32px;margin-bottom:10px}
.ct-pillar__name{font-size:13px;font-weight:700;color:var(--ct-text);margin-bottom:6px}
.ct-pillar__desc{font-size:11px;color:var(--ct-text-3);line-height:1.5}
.ct-pillar__quote{font-size:11px;font-style:italic;color:var(--ct-accent-text);margin-top:8px;line-height:1.4}
@media(max-width:760px){.ct-pillar-grid{grid-template-columns:1fr 1fr}.ct-pillar-grid>*:last-child{grid-column:span 2}}
@media(max-width:400px){.ct-pillar-grid{grid-template-columns:1fr}.ct-pillar-grid>*:last-child{grid-column:span 1}}
```

- [ ] **Step 2: Create `sections/ct-pillars.liquid`**

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-pillars.css' | asset_url | stylesheet_tag }}

{%- style -%}
  .section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top | times: 0.75 | round: 0 }}px;padding-bottom:{{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px}
  @media screen and (min-width:750px){.section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top }}px;padding-bottom:{{ section.settings.padding_bottom }}px}}
{%- endstyle -%}

<div class="page-width section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  {%- if section.settings.heading != blank -%}
    <div class="ct-section-head" data-reveal>
      {%- if section.settings.kicker != blank -%}<div class="ct-kicker">{{ section.settings.kicker }}</div>{%- endif -%}
      <h2 class="ct-section-head__title">{{ section.settings.heading }}</h2>
    </div>
  {%- endif -%}
  <div class="ct-pillar-grid">
    {%- for block in section.blocks -%}
      <div class="ct-pillar" data-reveal data-delay="{{ forloop.index0 | times: 80 }}" {{ block.shopify_attributes }}>
        {%- if block.settings.number != blank -%}<div class="ct-pillar__num">{{ block.settings.number }}</div>{%- endif -%}
        {%- if block.settings.icon != blank -%}<div class="ct-pillar__icon">{{ block.settings.icon }}</div>{%- endif -%}
        <div class="ct-pillar__name">{{ block.settings.name }}</div>
        {%- if block.settings.desc != blank -%}<p class="ct-pillar__desc">{{ block.settings.desc }}</p>{%- endif -%}
        {%- if block.settings.quote != blank -%}<div class="ct-pillar__quote">{{ block.settings.quote }}</div>{%- endif -%}
      </div>
    {%- endfor -%}
  </div>
</div>

{% schema %}
{
  "name": "CT Pillars",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "The system" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "We didn't build equipment. We built a system." },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "label": "Top padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 }
  ],
  "blocks": [
    {
      "type": "pillar",
      "name": "Pillar",
      "settings": [
        { "type": "text", "id": "number", "label": "Number", "default": "01 / 05" },
        { "type": "text", "id": "icon", "label": "Icon (emoji)", "default": "💪" },
        { "type": "text", "id": "name", "label": "Name", "default": "The Trainer" },
        { "type": "textarea", "id": "desc", "label": "Description", "default": "Short description of this pillar." },
        { "type": "text", "id": "quote", "label": "Quote (italic)", "default": "A short supporting quote." }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [
    {
      "name": "CT Pillars",
      "blocks": [
        { "type": "pillar", "settings": { "number": "01 / 03", "icon": "💪", "name": "Pillar one" } },
        { "type": "pillar", "settings": { "number": "02 / 03", "icon": "📋", "name": "Pillar two" } },
        { "type": "pillar", "settings": { "number": "03 / 03", "icon": "🎯", "name": "Pillar three" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Run Theme Check**

Run: `shopify theme check`
Expected: `14 offenses` (2 errors, 12 warnings) — same pre-existing Dawn offenses, **no new ones referencing `ct-pillars`**. If the count rose, read the new offense and fix it before committing.

- [ ] **Step 4: Commit**

```bash
git add sections/ct-pillars.liquid assets/section-ct-pillars.css
git commit -m "feat(landing): add ct-pillars system-grid section

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: `ct-journey` (step timeline)

**Files:**
- Create: `sections/ct-journey.liquid`
- Create: `assets/section-ct-journey.css`

- [ ] **Step 1: Create `assets/section-ct-journey.css`**

```css
/* section-ct-journey.css — demo .journey* → .ct-journey* (tokens → --ct-*) */
.ct-journey-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;position:relative}
.ct-journey-track::before{content:'';position:absolute;top:28px;left:28px;right:28px;height:2px;background:var(--ct-accent-border);z-index:0}
.ct-journey-step{background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl);padding:20px 16px;position:relative;z-index:1;box-shadow:var(--ct-shadow-xs);transition:box-shadow .2s,transform .2s}
.ct-journey-step:hover{box-shadow:var(--ct-shadow-md);transform:translateY(-2px)}
.ct-journey-dot{width:14px;height:14px;border-radius:50%;background:var(--ct-accent-strong);border:3px solid var(--ct-bg-raised);box-shadow:0 0 0 2px var(--ct-accent-border);margin:0 auto 14px;display:block}
.ct-journey-weeks{font-family:var(--ct-font-mono);font-size:10px;color:var(--ct-accent-text);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;text-align:center}
.ct-journey-title{font-size:14px;font-weight:800;color:var(--ct-text);margin-bottom:6px;text-align:center}
.ct-journey-desc{font-size:12px;color:var(--ct-text-2);line-height:1.6;margin-bottom:8px;text-align:center}
.ct-journey-badge{display:block;width:fit-content;margin:0 auto;padding:3px 8px;background:var(--ct-accent-subtle);border-radius:var(--ct-r-pill);font-size:10px;color:var(--ct-accent-text);font-weight:600;font-family:var(--ct-font-mono)}
@media(max-width:640px){.ct-journey-track{grid-template-columns:1fr 1fr}.ct-journey-track::before{display:none}}
@media(max-width:380px){.ct-journey-track{grid-template-columns:1fr}}
```

- [ ] **Step 2: Create `sections/ct-journey.liquid`**

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-journey.css' | asset_url | stylesheet_tag }}

{%- style -%}
  .section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top | times: 0.75 | round: 0 }}px;padding-bottom:{{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px}
  @media screen and (min-width:750px){.section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top }}px;padding-bottom:{{ section.settings.padding_bottom }}px}}
{%- endstyle -%}

<div class="page-width section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  {%- if section.settings.heading != blank -%}
    <div class="ct-section-head" data-reveal>
      {%- if section.settings.kicker != blank -%}<div class="ct-kicker">{{ section.settings.kicker }}</div>{%- endif -%}
      <h2 class="ct-section-head__title">{{ section.settings.heading }}</h2>
    </div>
  {%- endif -%}
  <div class="ct-journey-track">
    {%- for block in section.blocks -%}
      <div class="ct-journey-step" data-reveal data-delay="{{ forloop.index0 | times: 80 }}" {{ block.shopify_attributes }}>
        <span class="ct-journey-dot"></span>
        {%- if block.settings.week_range != blank -%}<div class="ct-journey-weeks">{{ block.settings.week_range }}</div>{%- endif -%}
        <div class="ct-journey-title">{{ block.settings.title }}</div>
        {%- if block.settings.desc != blank -%}<p class="ct-journey-desc">{{ block.settings.desc }}</p>{%- endif -%}
        {%- if block.settings.badge != blank -%}<span class="ct-journey-badge">{{ block.settings.badge }}</span>{%- endif -%}
      </div>
    {%- endfor -%}
  </div>
</div>

{% schema %}
{
  "name": "CT Journey",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "The journey" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "Week 1, you start. Week 12, you won't recognize yourself." },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "label": "Top padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 }
  ],
  "blocks": [
    {
      "type": "step",
      "name": "Step",
      "settings": [
        { "type": "text", "id": "week_range", "label": "Week range", "default": "Week 1–2" },
        { "type": "text", "id": "title", "label": "Title", "default": "Foundation." },
        { "type": "textarea", "id": "desc", "label": "Description", "default": "What happens in this phase." },
        { "type": "text", "id": "badge", "label": "Badge", "default": "First results incoming" }
      ]
    }
  ],
  "max_blocks": 6,
  "presets": [
    {
      "name": "CT Journey",
      "blocks": [
        { "type": "step", "settings": { "week_range": "Week 1–2", "title": "Foundation." } },
        { "type": "step", "settings": { "week_range": "Week 3–5", "title": "Build." } },
        { "type": "step", "settings": { "week_range": "Week 6–9", "title": "Push." } },
        { "type": "step", "settings": { "week_range": "Week 10–12", "title": "Transform." } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Run Theme Check**

Run: `shopify theme check`
Expected: `14 offenses`, no new offenses referencing `ct-journey`. Fix any new offense before committing.

- [ ] **Step 4: Commit**

```bash
git add sections/ct-journey.liquid assets/section-ct-journey.css
git commit -m "feat(landing): add ct-journey step-timeline section

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: `ct-final-cta` (gradient banner) + shared trust-chip primitive

**Files:**
- Modify: `assets/ct-sections.css` (append shared `.ct-trust-row` / `.ct-trust-chip`)
- Create: `sections/ct-final-cta.liquid`
- Create: `assets/section-ct-final-cta.css`

- [ ] **Step 1: Append the shared trust-chip primitive to `assets/ct-sections.css`**

Add at the end of the file (before nothing — it's the last content). This primitive is reused by `ct-final-cta` and `ct-pricing`:

```css

/* ---- Trust chips (demo .trust-row/.trust-chip) — shared by ct-final-cta + ct-pricing ---- */
.ct-trust-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.ct-trust-chip{display:inline-flex;align-items:center;gap:8px;background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-lg);padding:10px 14px;font-size:13px;font-weight:500;color:var(--ct-text-2)}
.ct-trust-chip::before{content:'✓';color:var(--ct-accent-text);font-weight:700;font-size:12px}
```

- [ ] **Step 2: Create `assets/section-ct-final-cta.css`**

```css
/* section-ct-final-cta.css — demo .final-cta* → .ct-final-cta* (tokens → --ct-*) */
.ct-final-cta{background:linear-gradient(135deg,var(--ct-accent-subtle) 0%,rgba(200,250,214,.3) 60%,var(--ct-bg) 100%);border-radius:var(--ct-r-xl)}
.ct-final-cta__inner{max-width:620px;margin:0 auto;text-align:center}
.ct-final-cta__eyebrow{font-family:var(--ct-font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--ct-accent-text);margin-bottom:10px}
.ct-final-cta__title{font-size:clamp(1.8rem,4vw,2.6rem);font-weight:800;color:var(--ct-text);letter-spacing:-.03em;line-height:1.07;margin-bottom:10px}
.ct-final-cta__sub{font-size:15px;color:var(--ct-text-2);margin-bottom:28px;line-height:1.65}
.ct-final-cta__btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:20px}
```

- [ ] **Step 3: Create `sections/ct-final-cta.liquid`**

Note: the gradient background is applied to the inner `.ct-final-cta` block (rounded), inside the `page-width` wrapper, so it doesn't fight Dawn's `color-{scheme}` full-bleed background.

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-final-cta.css' | asset_url | stylesheet_tag }}

{%- style -%}
  .section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top | times: 0.75 | round: 0 }}px;padding-bottom:{{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px}
  @media screen and (min-width:750px){.section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top }}px;padding-bottom:{{ section.settings.padding_bottom }}px}}
{%- endstyle -%}

<div class="page-width section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  <div class="ct-final-cta section-{{ section.id }}-padding" data-reveal>
    <div class="ct-final-cta__inner">
      {%- if section.settings.eyebrow != blank -%}<div class="ct-final-cta__eyebrow">{{ section.settings.eyebrow }}</div>{%- endif -%}
      {%- if section.settings.heading != blank -%}<h2 class="ct-final-cta__title">{{ section.settings.heading }}</h2>{%- endif -%}
      {%- if section.settings.subheading != blank -%}<p class="ct-final-cta__sub">{{ section.settings.subheading }}</p>{%- endif -%}
      <div class="ct-final-cta__btns">
        {%- if section.settings.button_label != blank -%}
          <a class="ct-btn ct-btn--primary ct-btn--lg" href="{{ section.settings.button_link | default: '#' }}">{{ section.settings.button_label }}</a>
        {%- endif -%}
        {%- if section.settings.button_label_2 != blank -%}
          <a class="ct-btn ct-btn--outlined" href="{{ section.settings.button_link_2 | default: '#' }}">{{ section.settings.button_label_2 }}</a>
        {%- endif -%}
      </div>
      {%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
        <div class="ct-trust-row">
          {%- assign chips = section.settings.trust_chips | newline_to_br | split: '<br />' -%}
          {%- for chip in chips -%}
            {%- assign chip_text = chip | strip_newlines | strip -%}
            {%- if chip_text != blank -%}<span class="ct-trust-chip">{{ chip_text }}</span>{%- endif -%}
          {%- endfor -%}
        </div>
      {%- endif -%}
    </div>
  </div>
</div>

{% schema %}
{
  "name": "CT Final CTA",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Eyebrow", "default": "Ready" },
    { "type": "richtext", "id": "heading", "label": "Heading", "default": "<p>Your living room is ready. Are you?</p>" },
    { "type": "textarea", "id": "subheading", "label": "Subheading", "default": "12 weeks from now, you'll either have started — or you'll still be thinking about it." },
    { "type": "header", "content": "Buttons" },
    { "type": "text", "id": "button_label", "label": "Primary button label", "default": "Start tonight →" },
    { "type": "url", "id": "button_link", "label": "Primary button link" },
    { "type": "text", "id": "button_label_2", "label": "Secondary button label", "default": "View full details" },
    { "type": "url", "id": "button_link_2", "label": "Secondary button link" },
    { "type": "header", "content": "Trust chips" },
    { "type": "checkbox", "id": "show_trust", "label": "Show trust chips", "default": true },
    { "type": "textarea", "id": "trust_chips", "label": "Trust chips (one per line)", "default": "Free US Shipping\n90-Day Returns\n4.7 · 52 Reviews" },
    { "type": "header", "content": "Section" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "label": "Top padding", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 48 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 48 }
  ],
  "presets": [{ "name": "CT Final CTA" }]
}
{% endschema %}
```

- [ ] **Step 4: Run Theme Check**

Run: `shopify theme check`
Expected: `14 offenses`, no new offenses referencing `ct-final-cta` or `ct-sections.css`. Fix any new offense before committing.

- [ ] **Step 5: Commit**

```bash
git add assets/ct-sections.css sections/ct-final-cta.liquid assets/section-ct-final-cta.css
git commit -m "feat(landing): add ct-final-cta banner + shared trust-chip primitive

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `ct-pricing` (3-variant add-to-cart cards)

**Files:**
- Create: `sections/ct-pricing.liquid`
- Create: `assets/section-ct-pricing.css`

**Depends on:** Task 3 (shared `.ct-trust-row` / `.ct-trust-chip`).

**Commerce notes (read before implementing):**
- `ct-pricing` MUST load `product-form.js` itself — it is not loaded on a generic page template, and it is what AJAX-adds and opens the cart drawer. It is self-guarded (`if (!customElements.get('product-form'))`), so loading it again elsewhere is safe.
- Each card renders one Dawn `<product-form>` containing `{% form 'product', product %}`, a hidden `<input name="id">` set to the card's variant, a submit `<button>` with a child `<span>` (required — `product-form.js` reads `submitButton.querySelector('span')`), and `{% render 'loading-spinner' %}` (required — `product-form.js` toggles `.loading__spinner`).
- `data-hide-errors="true"` on `<product-form>` suppresses the inline error block (errors still publish via pub/sub), so cards stay clean without an error wrapper.
- Variant binding: `variant_position` is 1-based and defaults to the block's order; the bound variant is `product.variants[variant_position - 1]`.
- Fallback: if no product is selected, render an `<a class="ct-btn">` link + `price_fallback` text instead of a form, so the section never errors in the editor.

- [ ] **Step 1: Create `assets/section-ct-pricing.css`**

```css
/* section-ct-pricing.css — demo .pricing/.plan → .ct-pricing/.ct-plan (tokens → --ct-*) */
.ct-pricing-vs{display:flex;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:28px;padding:14px 20px;background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl);box-shadow:var(--ct-shadow-sm)}
.ct-pricing-vs__label{font-size:13px;color:var(--ct-text-3)}
.ct-pricing-vs__gym{font-size:15px;font-weight:700;color:var(--ct-text-2);text-decoration:line-through}
.ct-pricing-vs__sep{color:var(--ct-text-off);font-size:20px}
.ct-pricing-vs__brand{font-size:15px;font-weight:700;color:var(--ct-accent-text)}
.ct-plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.ct-plan{background:var(--ct-bg-raised);border:1px solid var(--ct-border-strong);border-radius:var(--ct-r-xl);padding:28px;box-shadow:var(--ct-shadow-sm);position:relative;transition:box-shadow .2s,transform .2s}
.ct-plan:hover{box-shadow:var(--ct-shadow-lg);transform:translateY(-2px)}
.ct-plan--featured{border-color:var(--ct-accent-border);border-width:2px;box-shadow:0 0 0 4px var(--ct-accent-glow),var(--ct-shadow-lg)}
.ct-plan__badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--ct-accent-strong);color:#fff;font-family:var(--ct-font-mono);font-size:10px;font-weight:600;letter-spacing:.1em;padding:4px 14px;border-radius:var(--ct-r-pill);white-space:nowrap}
.ct-plan__tag{font-family:var(--ct-font-mono);font-size:10px;color:var(--ct-text-3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}
.ct-plan__name{font-size:18px;font-weight:800;color:var(--ct-text);margin-bottom:4px}
.ct-plan__tagline{font-size:13px;color:var(--ct-text-2);font-style:italic;margin-bottom:16px}
.ct-plan__price-row{display:flex;align-items:baseline;gap:6px;margin-bottom:4px}
.ct-plan__price{font-size:clamp(2rem,4vw,2.8rem);font-weight:800;color:var(--ct-text);letter-spacing:-.04em;line-height:1}
.ct-plan__price-diff{font-size:13px;color:var(--ct-accent-text);font-weight:600}
.ct-plan__price-note{font-size:12px;color:var(--ct-text-3);margin-bottom:20px;font-family:var(--ct-font-mono)}
.ct-plan__features{display:flex;flex-direction:column;gap:8px;margin-bottom:24px;list-style:none;padding:0}
.ct-plan__feature{font-size:13px;color:var(--ct-text-2);display:flex;align-items:baseline;gap:8px}
.ct-plan__feature::before{content:'✓';color:var(--ct-accent-text);font-weight:700;flex-shrink:0;font-size:12px}
.ct-plan__feature--dim{color:var(--ct-text-off)}
.ct-plan__feature--dim::before{content:'–';color:var(--ct-text-off)}
.ct-plan__note{font-size:12px;color:var(--ct-accent-text);text-align:center;margin-top:12px;font-family:var(--ct-font-mono)}
.ct-plan .product-form{margin:0}
.ct-plan .product-form__error-message-wrapper{display:none}
@media(max-width:720px){.ct-plan-grid{grid-template-columns:1fr}.ct-plan--featured{margin-top:16px}}
```

- [ ] **Step 2: Create `sections/ct-pricing.liquid`**

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-pricing.css' | asset_url | stylesheet_tag }}
<script src="{{ 'product-form.js' | asset_url }}" defer="defer"></script>

{%- style -%}
  .section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top | times: 0.75 | round: 0 }}px;padding-bottom:{{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px}
  @media screen and (min-width:750px){.section-{{ section.id }}-padding{padding-top:{{ section.settings.padding_top }}px;padding-bottom:{{ section.settings.padding_bottom }}px}}
{%- endstyle -%}

{%- assign ct_product = section.settings.product -%}

<div class="page-width section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  {%- if section.settings.heading != blank -%}
    <div class="ct-section-head" data-reveal>
      {%- if section.settings.kicker != blank -%}<div class="ct-kicker">{{ section.settings.kicker }}</div>{%- endif -%}
      <h2 class="ct-section-head__title">{{ section.settings.heading }}</h2>
    </div>
  {%- endif -%}

  {%- if section.settings.vs_gym != blank -%}
    <div class="ct-pricing-vs" data-reveal>
      {%- if section.settings.vs_label != blank -%}<span class="ct-pricing-vs__label">{{ section.settings.vs_label }}</span>{%- endif -%}
      <span class="ct-pricing-vs__gym">{{ section.settings.vs_gym }}</span>
      <span class="ct-pricing-vs__sep">vs</span>
      <span class="ct-pricing-vs__brand">{{ section.settings.vs_brand }}</span>
    </div>
  {%- endif -%}

  <div class="ct-plan-grid">
    {%- for block in section.blocks -%}
      {%- assign vnum = block.settings.variant_position | default: forloop.index -%}
      {%- assign vidx = vnum | minus: 1 -%}
      {%- assign variant = blank -%}
      {%- if ct_product != blank -%}{%- assign variant = ct_product.variants[vidx] -%}{%- endif -%}
      {%- assign style = block.settings.button_style | default: 'primary' -%}
      <div class="ct-plan{% if block.settings.featured %} ct-plan--featured{% endif %}" data-reveal data-delay="{{ forloop.index0 | times: 80 }}" {{ block.shopify_attributes }}>
        {%- if block.settings.featured and block.settings.badge != blank -%}<div class="ct-plan__badge">{{ block.settings.badge }}</div>{%- endif -%}
        {%- if block.settings.tag != blank -%}<div class="ct-plan__tag">{{ block.settings.tag }}</div>{%- endif -%}
        <div class="ct-plan__name">{{ block.settings.name }}</div>
        {%- if block.settings.tagline != blank -%}<div class="ct-plan__tagline">{{ block.settings.tagline }}</div>{%- endif -%}
        <div class="ct-plan__price-row">
          <span class="ct-plan__price">
            {%- if variant != blank -%}{{ variant.price | money }}{%- else -%}{{ block.settings.price_fallback }}{%- endif -%}
          </span>
          {%- if block.settings.price_diff != blank -%}<span class="ct-plan__price-diff">{{ block.settings.price_diff }}</span>{%- endif -%}
        </div>
        {%- if block.settings.price_note != blank -%}<div class="ct-plan__price-note">{{ block.settings.price_note }}</div>{%- endif -%}

        {%- if block.settings.features != blank -%}
          <ul class="ct-plan__features">
            {%- assign feats = block.settings.features | newline_to_br | split: '<br />' -%}
            {%- for feat in feats -%}
              {%- assign feat_text = feat | strip_newlines | strip -%}
              {%- if feat_text != blank -%}
                {%- assign marker = feat_text | slice: 0 -%}
                {%- if marker == '-' or marker == '~' -%}
                  <li class="ct-plan__feature ct-plan__feature--dim">{{ feat_text | remove_first: marker | strip }}</li>
                {%- else -%}
                  <li class="ct-plan__feature">{{ feat_text }}</li>
                {%- endif -%}
              {%- endif -%}
            {%- endfor -%}
          </ul>
        {%- endif -%}

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
          <a class="ct-btn ct-btn--{{ style }} ct-btn--full" href="{{ block.settings.button_link | default: '#' }}">{{ block.settings.button_label }}</a>
        {%- endif -%}

        {%- if block.settings.note != blank -%}<div class="ct-plan__note">{{ block.settings.note }}</div>{%- endif -%}
      </div>
    {%- endfor -%}
  </div>

  {%- if section.settings.show_trust and section.settings.trust_chips != blank -%}
    <div class="ct-trust-row" style="margin-top:24px" data-reveal>
      {%- assign chips = section.settings.trust_chips | newline_to_br | split: '<br />' -%}
      {%- for chip in chips -%}
        {%- assign chip_text = chip | strip_newlines | strip -%}
        {%- if chip_text != blank -%}<span class="ct-trust-chip">{{ chip_text }}</span>{%- endif -%}
      {%- endfor -%}
    </div>
  {%- endif -%}
</div>

{% schema %}
{
  "name": "CT Pricing",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "kicker", "label": "Kicker", "default": "Pick your system" },
    { "type": "text", "id": "heading", "label": "Heading", "default": "One system. Three ways in." },
    { "type": "product", "id": "product", "label": "Product", "info": "Each plan card binds to one variant of this product (by position)." },
    { "type": "header", "content": "Compare strip" },
    { "type": "text", "id": "vs_label", "label": "Compare label", "default": "Compare:" },
    { "type": "text", "id": "vs_gym", "label": "Struck comparison", "default": "Gym: $50/month" },
    { "type": "text", "id": "vs_brand", "label": "Brand comparison", "default": "GainsSteel: one time · any room" },
    { "type": "header", "content": "Trust chips" },
    { "type": "checkbox", "id": "show_trust", "label": "Show trust chips", "default": true },
    { "type": "textarea", "id": "trust_chips", "label": "Trust chips (one per line)", "default": "Free US Shipping\n90-Day Returns\n1-Year Warranty\nCancel within 1 Hour" },
    { "type": "header", "content": "Section" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "range", "id": "padding_top", "label": "Top padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 }
  ],
  "blocks": [
    {
      "type": "plan",
      "name": "Plan",
      "settings": [
        { "type": "checkbox", "id": "featured", "label": "Featured", "default": false },
        { "type": "text", "id": "badge", "label": "Featured badge", "default": "7 in 10 choose this" },
        { "type": "text", "id": "tag", "label": "Tag", "default": "Basic" },
        { "type": "text", "id": "name", "label": "Name", "default": "The Plan" },
        { "type": "text", "id": "tagline", "label": "Tagline (italic)", "default": "\"Who it's for.\"" },
        { "type": "number", "id": "variant_position", "label": "Variant number", "info": "1 = first variant of the product. Defaults to card order." },
        { "type": "text", "id": "price_diff", "label": "Price diff", "default": "" },
        { "type": "text", "id": "price_note", "label": "Price note", "default": "One-time · ships in 24h" },
        { "type": "textarea", "id": "features", "label": "Features (one per line; prefix - or ~ to dim a row)", "default": "Feature one\nFeature two\n- Dimmed feature" },
        { "type": "text", "id": "button_label", "label": "Button label", "default": "Choose this →" },
        { "type": "select", "id": "button_style", "label": "Button style", "options": [ { "value": "primary", "label": "Primary" }, { "value": "outlined", "label": "Outlined" }, { "value": "soft", "label": "Soft" } ], "default": "primary" },
        { "type": "url", "id": "button_link", "label": "Button link (fallback when no product)" },
        { "type": "text", "id": "price_fallback", "label": "Fallback price", "default": "$149" },
        { "type": "text", "id": "note", "label": "Note under button", "default": "" }
      ]
    }
  ],
  "max_blocks": 4,
  "presets": [
    {
      "name": "CT Pricing",
      "blocks": [
        { "type": "plan", "settings": { "tag": "Basic", "name": "The Trainer", "button_style": "outlined", "price_fallback": "$149" } },
        { "type": "plan", "settings": { "featured": true, "tag": "Core Pro", "name": "The System", "button_style": "primary", "price_fallback": "$169" } },
        { "type": "plan", "settings": { "tag": "Pro Bundle", "name": "The Full Setup", "button_style": "soft", "price_fallback": "$199" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 3: Run Theme Check**

Run: `shopify theme check`
Expected: `14 offenses`, no new offenses referencing `ct-pricing`. Common things to watch: `UnusedAssign` (the `variant = blank` then conditional reassign is used in the price + form branches — keep both uses), and valid schema JSON. Fix any new offense before committing.

- [ ] **Step 4: Commit**

```bash
git add sections/ct-pricing.liquid assets/section-ct-pricing.css
git commit -m "feat(landing): add ct-pricing 3-variant add-to-cart cards

Native <product-form> per card (reuses product-form.js, opens cart
drawer); variant-position binding; safe link+fallback price when no
product is set.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Cart-drawer upsell

**Files:**
- Modify: `snippets/cart-drawer.liquid` (the `data-ct-upsell` slot, ~line 499-501)
- Modify: `assets/theme-overrides.css` (add `.ct-cart__upsell` card styles next to the existing `.ct-cart__upsell:empty` rule, ~line 182)

**Notes:**
- The slot is already guarded by `if cart != empty and settings.cart_drawer_collection != blank` — keep all new markup inside that guard to preserve the documented `.is-empty + .drawer__footer` rule.
- Show exactly one upsell product: the first product in `settings.cart_drawer_collection` not already in `cart.items`. If none qualifies, render nothing (the existing `.ct-cart__upsell:empty{display:none}` rule hides the slot).
- The "Add" button is a native `<product-form>` (same flow as Task 4) so the drawer re-renders on add. `cart-drawer.liquid` already loads `cart.js`; add a `product-form.js` script tag in the snippet so the upsell button works.

- [ ] **Step 1: Replace the upsell stub in `snippets/cart-drawer.liquid`**

Find (around line 499-501):

```liquid
      {%- if cart != empty and settings.cart_drawer_collection != blank -%}
        <div class="ct-cart__upsell" data-ct-upsell></div>
      {%- endif -%}
```

Replace with:

```liquid
      {%- if cart != empty and settings.cart_drawer_collection != blank -%}
        {%- assign ct_upsell_product = blank -%}
        {%- for ct_p in settings.cart_drawer_collection.products -%}
          {%- assign ct_in_cart = false -%}
          {%- for ct_item in cart.items -%}
            {%- if ct_item.product_id == ct_p.id -%}{%- assign ct_in_cart = true -%}{%- break -%}{%- endif -%}
          {%- endfor -%}
          {%- if ct_in_cart == false and ct_p.available -%}
            {%- assign ct_upsell_product = ct_p -%}
            {%- break -%}
          {%- endif -%}
        {%- endfor -%}
        <div class="ct-cart__upsell" data-ct-upsell>
          {%- if ct_upsell_product != blank -%}
            {%- assign ct_upsell_variant = ct_upsell_product.selected_or_first_available_variant -%}
            <div class="ct-cart__upsell-head">You might also like</div>
            <div class="ct-cart__upsell-card">
              {%- if ct_upsell_product.featured_image != blank -%}
                <img class="ct-cart__upsell-img" src="{{ ct_upsell_product.featured_image | image_url: width: 120 }}" alt="{{ ct_upsell_product.featured_image.alt | escape }}" width="60" height="60" loading="lazy">
              {%- endif -%}
              <div class="ct-cart__upsell-info">
                <div class="ct-cart__upsell-name">{{ ct_upsell_product.title | escape }}</div>
                <div class="ct-cart__upsell-price">{{ ct_upsell_variant.price | money }}</div>
              </div>
              <product-form class="product-form ct-cart__upsell-form" data-hide-errors="true" data-section-id="cart-drawer-upsell">
                {%- form 'product', ct_upsell_product, id: 'ct-upsell-form', class: 'form' -%}
                  <input type="hidden" name="id" value="{{ ct_upsell_variant.id }}" class="product-variant-id"{% unless ct_upsell_variant.available %} disabled{% endunless %}>
                  <button type="submit" name="add" class="ct-btn ct-btn--soft ct-btn--sm"{% unless ct_upsell_variant.available %} disabled{% endunless %}>
                    <span>Add</span>
                    {%- render 'loading-spinner' -%}
                  </button>
                {%- endform -%}
              </product-form>
            </div>
          {%- endif -%}
        </div>
      {%- endif -%}
```

- [ ] **Step 2: Add the `product-form.js` script to `snippets/cart-drawer.liquid`**

Find (near the top, ~line 11-12):

```liquid
<script src="{{ 'cart.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'quantity-popover.js' | asset_url }}" defer="defer"></script>
```

Add a line after them:

```liquid
<script src="{{ 'cart.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'quantity-popover.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'product-form.js' | asset_url }}" defer="defer"></script>
```

- [ ] **Step 3: Add `.ct-cart__upsell` card styles to `assets/theme-overrides.css`**

Find (~line 182):

```css
.ct-cart__upsell:empty { display: none; }
```

Add immediately after it:

```css
.ct-cart__upsell { padding: 12px 20px; border-top: 1px solid var(--ct-border-subtle); }
.ct-cart__upsell-head { font-size: var(--ct-text-xs); font-family: var(--ct-font-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ct-text-3); margin-bottom: 8px; }
.ct-cart__upsell-card { display: flex; align-items: center; gap: 12px; background: var(--ct-bg-raised); border: 1px solid var(--ct-border-strong); border-radius: var(--ct-r-lg); padding: 10px; }
.ct-cart__upsell-img { width: 48px; height: 48px; border-radius: var(--ct-r-md); object-fit: cover; flex-shrink: 0; }
.ct-cart__upsell-info { min-width: 0; flex: 1; }
.ct-cart__upsell-name { font-size: var(--ct-text-sm); font-weight: var(--ct-fw-semi); color: var(--ct-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ct-cart__upsell-price { font-size: var(--ct-text-sm); color: var(--ct-text-2); }
.ct-cart__upsell-form { margin: 0; flex-shrink: 0; }
.ct-cart__upsell-form .product-form__error-message-wrapper { display: none; }
```

- [ ] **Step 4: Run Theme Check**

Run: `shopify theme check`
Expected: `14 offenses`, no new offenses referencing `cart-drawer.liquid` or `theme-overrides.css`. Fix any new offense before committing.

- [ ] **Step 5: Commit**

```bash
git add snippets/cart-drawer.liquid assets/theme-overrides.css
git commit -m "feat(cart): Shrine-style cart-drawer upsell in the existing slot

Fills the data-ct-upsell stub server-side with the first not-in-cart
product from cart_drawer_collection; native <product-form> Add button
so the drawer re-renders on add. No new global JS.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Rewire `templates/page.landing.json` to demo order + seed copy

**Files:**
- Modify: `templates/page.landing.json`

**Goal:** insert `ct_pillars`, `ct_journey`, `ct_pricing`, `ct_final_cta` into the existing template and set the `order` to the demo sequence. Keep all existing section objects (`ct_hero`, `ct_stats`, `ct_who`, `ct_features`, `ct_when`, `ct_compare`, `ct_reviews`, `ct_email`, `ct_faq`, `ct_sticky_atc`) unchanged.

- [ ] **Step 1: Add the four new section objects inside `"sections"`**

Add these keys alongside the existing section objects (anywhere inside the `"sections"` object — order is controlled by `"order"`):

```json
    "ct_pillars": {
      "type": "ct-pillars",
      "blocks": {
        "p1": { "type": "pillar", "settings": { "number": "01 / 05", "icon": "💪", "name": "The Trainer", "desc": "22 to 440 lb. Hydraulic. Zero snap-back. 5.3 pounds. Fits under the couch.", "quote": "\"Level 13 had me actually struggling.\" — D. Taj" } },
        "p2": { "type": "pillar", "settings": { "number": "02 / 05", "icon": "📋", "name": "The Program", "desc": "12 weeks. Session by session. No guessing. Works for beginners and veterans.", "quote": "Structure is what the gym gave you." } },
        "p3": { "type": "pillar", "settings": { "number": "03 / 05", "icon": "🎵", "name": "The Music", "desc": "Curated playlists built for intensity. Silence kills momentum.", "quote": "Atmosphere on demand." } },
        "p4": { "type": "pillar", "settings": { "number": "04 / 05", "icon": "🥗", "name": "The Nutrition", "desc": "Protein targets. Meal timing. No diet culture. Eat to perform, not to punish.", "quote": "Fuel the system, not the guilt." } },
        "p5": { "type": "pillar", "settings": { "number": "05 / 05", "icon": "🎯", "name": "The Coaching", "desc": "Submit your form. Get real feedback. Training wrong is worse than not training.", "quote": "A coach in your pocket." } }
      },
      "block_order": ["p1", "p2", "p3", "p4", "p5"],
      "settings": { "kicker": "The GainsSteel system", "heading": "We didn't build equipment. We built a system.", "color_scheme": "scheme-1", "padding_top": 44, "padding_bottom": 44 }
    },
    "ct_journey": {
      "type": "ct-journey",
      "blocks": {
        "j1": { "type": "step", "settings": { "week_range": "Week 1–2", "title": "Foundation.", "desc": "You learn the system. The program tells you exactly what to do. Form gets corrected before bad habits form.", "badge": "First results incoming" } },
        "j2": { "type": "step", "settings": { "week_range": "Week 3–5", "title": "Build.", "desc": "You feel it working. Levels go up. You stop questioning — you know it is.", "badge": "Visible changes begin" } },
        "j3": { "type": "step", "settings": { "week_range": "Week 6–9", "title": "Push.", "desc": "Past the point where most quit. Still going. People start asking questions.", "badge": "Others start noticing" } },
        "j4": { "type": "step", "settings": { "week_range": "Week 10–12", "title": "Transform.", "desc": "You don't need motivation anymore. It's just what you do. Week 13 is up to you.", "badge": "The body you wanted" } }
      },
      "block_order": ["j1", "j2", "j3", "j4"],
      "settings": { "kicker": "The 12-week journey", "heading": "Week 1, you start. Week 12, you won't recognize yourself.", "color_scheme": "scheme-1", "padding_top": 44, "padding_bottom": 44 }
    },
    "ct_pricing": {
      "type": "ct-pricing",
      "blocks": {
        "pl1": { "type": "plan", "settings": { "featured": false, "tag": "Basic", "name": "The Trainer", "tagline": "\"I have my own plan.\"", "variant_position": 1, "price_note": "One-time · ships in 24h", "features": "GainsSteel® Hydraulic Trainer\nHex tool + setup card\n1-year warranty · Free US shipping\n- 12-week program\n- Training music\n- Nutrition guide\n- Form-check coaching", "button_label": "Choose The Trainer →", "button_style": "outlined", "price_fallback": "$149", "note": "Add the full system for +$20." } },
        "pl2": { "type": "plan", "settings": { "featured": true, "badge": "7 in 10 choose this", "tag": "Core Pro", "name": "The System", "tagline": "\"I need structure or I won't stick with it.\"", "variant_position": 2, "price_diff": "+$20", "price_note": "One-time · ships in 24h", "features": "GainsSteel® Hydraulic Trainer\nAB roller wheels (detachable)\n12-week progressive program\nTraining music playlists\nNutrition guide\nEmail support · 1-year warranty\nPersonal form-check coaching", "button_label": "Choose The System →", "button_style": "primary", "price_fallback": "$169" } },
        "pl3": { "type": "plan", "settings": { "featured": false, "tag": "Pro Bundle", "name": "The Full Setup", "tagline": "\"I want zero guesswork.\"", "variant_position": 3, "price_diff": "+$30", "price_note": "One-time · ships in 24h", "features": "Everything in The System\nPersonal form-check video review\nMobility + recovery guide\nPriority email support\n1-year warranty · Free US shipping", "button_label": "Choose Full Setup →", "button_style": "soft", "price_fallback": "$199", "note": "Form-check alone is worth +$30 if starting fresh." } }
      },
      "block_order": ["pl1", "pl2", "pl3"],
      "settings": { "kicker": "Pick your system", "heading": "One system. Three ways in.", "vs_label": "Compare:", "vs_gym": "Gym: $50/month", "vs_brand": "GainsSteel: one time · any room", "show_trust": true, "trust_chips": "Free US Shipping\n90-Day Returns\n1-Year Warranty\nCancel within 1 Hour", "color_scheme": "scheme-1", "padding_top": 44, "padding_bottom": 44 }
    },
    "ct_final_cta": {
      "type": "ct-final-cta",
      "settings": { "eyebrow": "Ready", "heading": "<p>Your living room is ready. Are you?</p>", "subheading": "12 weeks from now, you'll either have started — or you'll still be thinking about it.", "button_label": "Start tonight — from $149 →", "button_link": "shopify://collections/all", "button_label_2": "View full product details", "button_link_2": "", "show_trust": true, "trust_chips": "Free US Shipping\n90-Day Returns\n4.7 · 52 Reviews", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 }
    },
```

- [ ] **Step 2: Replace the `"order"` array**

Replace the existing `"order"` array with the demo sequence:

```json
  "order": [
    "ct_hero",
    "ct_stats",
    "ct_who",
    "ct_features",
    "ct_when",
    "ct_pillars",
    "ct_journey",
    "ct_compare",
    "ct_reviews",
    "ct_pricing",
    "ct_email",
    "ct_faq",
    "ct_final_cta",
    "ct_sticky_atc"
  ]
```

- [ ] **Step 3: Validate JSON + Theme Check**

Run: `shopify theme check`
Expected: `14 offenses`, no new offenses. A JSON syntax error here (trailing comma, unbalanced brace) would surface as a parse error — if so, fix the braces/commas. Confirm the file is valid JSON (the four new objects each end with a comma, the `order` array is the last key).

- [ ] **Step 4: Commit**

```bash
git add templates/page.landing.json
git commit -m "feat(landing): wire pillars/journey/pricing/final-cta into landing page

Landing template now matches the demo section order and is seeded with
GainsSteel copy. ct-pricing product picker left unset (merchant binds
the 3 variants); cards show fallback prices until then.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Final verification

- [ ] **Step 1: Full Theme Check**

Run: `shopify theme check`
Expected: `14 offenses` (2 errors, 12 warnings), all pre-existing Dawn (main-search `UnusedAssign`, quick-order-product-row `OrphanedSnippet`, etc.). **Zero** referencing any new `ct-*` file. If higher, investigate and fix before declaring done.

- [ ] **Step 2: Confirm git state**

Run: `git log --oneline -7`
Expected: 6 new feature commits (Tasks 1–6) on `feat/minimals-foundation`, plus the spec commit `b778fe8`.

- [ ] **Step 3: Hand off live verification to the user**

Live `shopify theme dev` verification is deferred to the user (interactive login + dev-store password `pwsirj-4x`). Provide this checklist:
- Landing page renders all 14 sections in demo order inside theme chrome.
- New sections reveal/animate (`data-reveal`).
- **Prerequisite for live add-to-cart:** create the GainsSteel product with 3 variants (Trainer / System / Full Setup) in the dev store, then set it as `ct-pricing`'s Product in the theme editor. Until then, pricing cards show fallback prices + links (expected).
- With the product set: each card adds the correct variant and the cart drawer opens; live prices format correctly; featured card highlighted; dimmed feature rows render.
- Set a collection as the cart drawer's collection (`settings.cart_drawer_collection`) → the upsell appears in the drawer (when non-empty), skips in-cart items, and its "Add" button adds + re-renders.
- No console errors; no layout shift.

---

## Self-review notes (for the implementer)

- **Spec coverage:** ct-pricing (Task 4), cart upsell (Task 5), ct-pillars (Task 1), ct-journey (Task 2), ct-final-cta (Task 3), landing rewire (Task 6) — all spec sections covered.
- **Token names** are verified against `snippets/css-variables.liquid` (`--ct-border-strong` = the str2/.20 alpha used for card borders; `--ct-rating` = star gold; `--ct-accent-glow` = the featured ring).
- **`product-form.js` contract:** the submit `<button>` MUST contain a `<span>` and the form MUST contain a `.loading__spinner` (via `{% render 'loading-spinner' %}`) — both are present in Tasks 4 and 5. `ct-pricing` and `cart-drawer.liquid` both load `product-form.js`.
- **Feature-dim parsing** uses `slice: 0` to read the first char and `remove_first` to strip the marker — consistent between the section and seed copy (seed uses `-` prefixes).
