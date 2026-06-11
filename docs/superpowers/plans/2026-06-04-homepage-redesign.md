# CozyClaw Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `templates/index.json` to 100% alignment with `files/cozyclaw-homepage.html` (17 body sections in spec §5 order), with honest copy per spec §2 and PDP-safe additive changes only on shared sections.

**Architecture:** Additive throughout. Every PDP-shared section (`ct-trust-bar`, `ct-pillars`, `ct-marquee`, `ct-reviews`, `ct-final-cta`, plus `ct-aplus` which the PDP doesn't use but other templates might) gets a new `layout` / `style` / `display` select option whose default is the current behavior — so all other templates render identically. 4 brand-new sections are added (`ct-problem-solution`, `ct-features-grid`, `ct-lifestyle`, `ct-size-color-guide`). Footer is enhanced in place. Template is then re-wired top-to-bottom to the new section order. Final pass: 3 logo SVGs recolored.

**Tech Stack:** Shopify Dawn 15.4.1 · Liquid · vanilla CSS with `--ct-*` tokens · no build step · `payment_type_svg_tag` for payment icons · `{% form 'customer' %}` for footer signup. Lint via `shopify theme check` (baseline = 10 offenses; must stay ≤10 after every commit).

**Spec:** `docs/superpowers/specs/2026-06-04-homepage-redesign-design.md`

---

## Working notes for the implementer

- **Dev server is interactive.** `shopify theme dev` needs a store password prompt and stays in the foreground. Run it once at the start of your session in a separate terminal; verify it stays up between tasks.
- **Atomic-write hazard.** Do not batch many edits across files while the dev server's upload queue is mid-flight — it can lock files. After each task's commit, give the queue 2s before starting the next task's edits.
- **Theme-check baseline = 10.** After every commit run (Windows): `shopify theme check 2>&1 | findstr /R "offenses errors"` or (unix): `shopify theme check 2>&1 | grep -E 'offenses|errors'`. The summary line at the end should read `198 files inspected with 10 total offenses found across 7 files. 2 errors. 8 warnings.` — count must stay ≤10. If it rises, fix before moving on.
- **Token discipline.** Every new color/space/shadow/radius **must** reference `--ct-*` from `snippets/css-variables.liquid`. Hardcoded brand hex forbidden except: `#fff` over the accent button (Dawn pattern), `#FBF6F0` page bg in the focus-ring contrast pair, `#B23A2E` / `#E0A53B` / `#5B9A6B` for sale-red / rating-gold / success-green (commerce signals deliberately separate from brand per spec §2), and the 3 logo SVG files.
- **Commit style.** Conventional Commits with scope: `feat(ct-hero):`, `feat(ct-pricing):`, `feat(footer):`, `feat(index):`, `chore(p7):`. Stage specific files (never `git add -A` — risks dragging in unrelated WIP).
- **Curl-test pattern.** After most tasks, verify the change is live: `curl -s http://127.0.0.1:9292/ | grep -oE "<pattern>"` against the homepage (or a dedicated test template if the section isn't wired yet — see Task 0).
- **PDP regression check.** After tasks 1–8 (PDP-shared section edits), run `curl -s http://127.0.0.1:9292/products/cozy-plush-pet-sofa -o /tmp/pdp.html && wc -l /tmp/pdp.html` — line count should stay in the ±5 range of the baseline you took in Task 0. Big shifts mean PDP regression.
- **Content seeds live in the spec.** Don't duplicate copy in this plan; reference `docs/superpowers/specs/2026-06-04-homepage-redesign-design.md` §"Content seeds" when the template re-wire task asks for verbatim text.

---

## File map

| File | Type | Responsibility | Tasks |
|---|---|---|---|
| `sections/ct-hero.liquid` | modify | Add `layout: "split-photo"` + `hero_image` / `h1_em` / `trust_line` settings; new Liquid branch with masked-photo split layout | T1 |
| `assets/section-ct-hero.css` | modify | Append `.ct-hero-split` rules: max-w 1440, mask-image gradient, ≤860 stack | T1 |
| `sections/ct-pricing.liquid` | modify | Add `layout: "tier-pair"` setting + `addons_label`; new `addon` block type; per-plan `features` textarea; new Liquid branch for 2-tier comparison + addons strip | T2 |
| `assets/section-ct-pricing.css` | modify | Append `.ct-tier-pair`, `.ct-tier--pop`, `.ct-tier-badge`, `.ct-bundle__addons` rules | T2 |
| `sections/ct-aplus.liquid` | modify | Add `layout: "materials-care"` + `layout: "guarantee-4"`; add `specs_rows` block field; two new Liquid branches | T3 |
| `assets/section-ct-aplus.css` | modify | Append `.ct-aplus__materials` (2-panel spec rows) + `.ct-aplus__guarantee` (4-item accent panel) rules | T3 |
| `sections/ct-trust-bar.liquid` | modify | Add `layout: "icon-strip"`; new block fields `title` + `subtitle`; extend icon library with 4 pet-specific icons; new Liquid branch | T4 |
| `assets/section-ct-trust-bar.css` | modify | Append `.ct-trust-strip` rules (accent-subtle bg, 4-col 2×2 ≤760) | T4 |
| `sections/ct-pillars.liquid` | modify | Add `layout: "pillars-svg"`; new block field `icon_svg` (select); inline 6-icon SVG library via `{% case %}` switch; new Liquid branch | T5 |
| `assets/section-ct-pillars.css` | modify | Append `.ct-pillars-svg` rules (3×2 grid, hover lift, icon-box) | T5 |
| `sections/ct-marquee.liquid` | modify | Add `style: "italic-divider"`; new Liquid branch using existing `.ct-marquee-track` JS | T6 |
| `assets/section-ct-marquee.css` | modify | Append `.ct-marquee--italic` rules (italic Fraunces, bullet separator pseudo) | T6 |
| `sections/ct-announce.liquid` | modify | Add `display: "static-row"`; new Liquid branch (no rotation, all blocks inline) | T7 |
| `assets/section-ct-announce.css` | modify | Append `.ct-announce--static-row` rules (flex, dot separators) | T7 |
| `sections/ct-sticky-atc.liquid` | modify | Add `image` (image_picker) setting; render `<img>` with `product.featured_image` fallback when blank; update misleading schema defaults | T8 |
| `assets/section-ct-sticky-atc.css` | modify | Add `.ct-sticky-atc__img` rules if not present | T8 |
| `sections/ct-problem-solution.liquid` | create | NEW section — 2 card blocks with problem/solution variants | T9 |
| `assets/section-ct-problem-solution.css` | create | NEW stylesheet | T9 |
| `sections/ct-features-grid.liquid` | create | NEW section — 4 image+body cards | T10 |
| `assets/section-ct-features-grid.css` | create | NEW stylesheet | T10 |
| `sections/ct-lifestyle.liquid` | create | NEW section — 4 photo tiles with caption overlay | T11 |
| `assets/section-ct-lifestyle.css` | create | NEW stylesheet | T11 |
| `sections/ct-size-color-guide.liquid` | create | NEW section — product-bound; iterates color/size options | T12 |
| `assets/section-ct-size-color-guide.css` | create | NEW stylesheet | T12 |
| `sections/footer.liquid` | modify | Add address textarea, signup CTA panel via `{% form 'customer' %}`, lock-icon secure-checkout span, mail-icon SVG; update 3 hardcoded copy strings | T13 |
| `assets/section-ct-footer.css` | modify | Append `.ct-footer__signup-cta` + `.ct-footer__address` + `.ct-footer__secure` + `.ct-footer__contact-ic` rules | T13 |
| `templates/index.json` | modify | Full re-wire to 17 sections in spec §5 order; seed all blocks per spec "Content seeds"; honesty fixes #1–#23 from spec | T14 |
| `assets/cozyclaw-logo.svg` | modify | Recolor terracotta paths → `#5A3E2B` | T15 |
| `assets/cozyclaw-logo-icon.svg` | modify | Recolor terracotta paths → `#5A3E2B` | T15 |
| `assets/cozyclaw-logo-reversed.svg` | modify | Recolor dark fill → `#5A3E2B` (keeps light-on-dark intent) | T15 |
| (verification only) | — | Theme-check + curl + PDP regression + responsive sanity | T16 |

No new JS files. No `package.json`. No build step.

---

## Task 0: Pre-flight — baselines + dev server up

**Goal:** Lock the dev-server URL, theme-check baseline count, and PDP HTML baseline so later tasks have unambiguous reference points.

**Files:** none modified.

- [ ] **Step 1: Verify dev server is running**

In a separate terminal (the one already running `shopify theme dev`), confirm the preview URL is alive:

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:9292/
```

Expected: `HTTP 200`. If 000 or refused, start the server: `shopify theme dev` (interactive — needs store auth on first run).

- [ ] **Step 2: Capture theme-check baseline**

```bash
shopify theme check 2>&1 | tail -8
```

Expected last line: `198 files inspected with 10 total offenses found across 7 files. 2 errors. 8 warnings.` Note the exact 10/2/8 numbers — this is the invariant.

- [ ] **Step 3: Capture PDP regression baseline**

```bash
curl -s http://127.0.0.1:9292/products/cozy-plush-pet-sofa -o /tmp/pdp-baseline.html
wc -l /tmp/pdp-baseline.html
```

Note the line count. After Tasks 1–8 you'll re-curl and confirm the count stays within ±5.

- [ ] **Step 4: No commit** — this is observation only.

---

## Task 1: ct-hero — add `split-photo` layout

**Goal:** New layout option for `ct-hero` that renders a split text + masked-photo hero matching spec §3 design lines 81–97 / 397–415. Default `buy-box` layout unchanged.

**Files:**
- Modify: `sections/ct-hero.liquid`
- Modify: `assets/section-ct-hero.css`

- [ ] **Step 1: Add `layout` + 3 new settings to schema**

Open `sections/ct-hero.liquid`, find the `{% schema %}` block, and inside the `"settings": [...]` array, insert these 4 objects **before** the `"color_scheme"` setting:

```json
{ "type": "select", "id": "layout", "label": "Layout",
  "options": [
    { "value": "buy-box",     "label": "Buy box (PDP-style — default)" },
    { "value": "split-photo", "label": "Split text + masked photo (homepage)" }
  ],
  "default": "buy-box" },
{ "type": "image_picker", "id": "hero_image", "label": "Hero photo (split-photo only)",
  "info": "Falls back to product.featured_image when blank and a product is picked." },
{ "type": "text", "id": "h1_em", "label": "H1 italic span (split-photo only)",
  "info": "Rendered as <em> inside the H1 heading." },
{ "type": "text", "id": "trust_line", "label": "Trust line (split-photo only)",
  "info": "Use '|' as a separator between items, e.g. '★★★★★ 4.9/5 · 13 reviews | ✓ 30-night trial | ✓ Free shipping $75+'." }
```

- [ ] **Step 2: Add the `split-photo` Liquid branch**

At the top of the section markup (right after `{{ 'section-ct-hero.css' | asset_url | stylesheet_tag }}` and inside the section's render block, before the existing buy-box markup), add:

```liquid
{%- if section.settings.layout == 'split-photo' -%}
  {%- assign hero_p = section.settings.product -%}
  {%- assign hero_img = section.settings.hero_image -%}
  {%- if hero_img == blank and hero_p != blank -%}
    {%- assign hero_img = hero_p.featured_image -%}
  {%- endif -%}
  <section class="ct-hero-split color-{{ section.settings.color_scheme }}" id="{{ section.settings.anchor_id }}">
    {%- if hero_img != blank -%}
      <img class="ct-hero-split__photo" src="{{ hero_img | image_url: width: 1600 }}" alt="{{ hero_img.alt | escape | default: hero_p.title | default: 'CozyClaw' }}" width="{{ hero_img.width }}" height="{{ hero_img.height }}" loading="eager" fetchpriority="high">
    {%- endif -%}
    <div class="ct-hero-split__text">
      {%- if section.settings.eyebrow != blank -%}<span class="ct-hero-split__eyebrow">{{ section.settings.eyebrow }}</span>{%- endif -%}
      <h1 class="ct-hero-split__h1">{{ section.settings.heading }}{% if section.settings.h1_em != blank %}<br><em>{{ section.settings.h1_em }}</em>{% endif %}</h1>
      {%- if section.settings.subheading != blank -%}<p class="ct-hero-split__sub">{{ section.settings.subheading }}</p>{%- endif -%}
      <div class="ct-hero-split__cta">
        {%- if section.settings.button_label != blank -%}<a href="{{ section.settings.button_link | default: '#' }}" class="ct-btn ct-btn--primary">{{ section.settings.button_label }}</a>{%- endif -%}
        {%- if section.settings.button_label_2 != blank -%}<a href="{{ section.settings.button_link_2 | default: '#' }}" class="ct-btn ct-btn--outlined">{{ section.settings.button_label_2 }}</a>{%- endif -%}
      </div>
      {%- if section.settings.trust_line != blank -%}
        <div class="ct-hero-split__trust">
          {%- assign trust_parts = section.settings.trust_line | split: '|' -%}
          {%- for part in trust_parts -%}<span class="ct-hero-split__trust-item">{{ part | strip }}</span>{%- endfor -%}
        </div>
      {%- endif -%}
    </div>
  </section>
{%- else -%}
```

And at the **end** of the existing buy-box markup (before the closing tag of the wrapper that opens after the stylesheet load), add:

```liquid
{%- endif -%}
```

So the structure becomes: `{% if split-photo %} ... new markup ... {% else %} ... existing buy-box markup ... {% endif %}`.

- [ ] **Step 3: Append CSS rules for split-photo**

Append to the end of `assets/section-ct-hero.css`:

```css
/* split-photo layout — homepage hero per cozyclaw-homepage.html §hero */
.ct-hero-split{position:relative;max-width:1440px;margin:0 auto;min-height:520px;display:flex;align-items:center;overflow:hidden;background:var(--ct-bg)}
.ct-hero-split__photo{position:absolute;top:0;right:0;height:100%;width:56%;object-fit:cover;object-position:center;z-index:0;-webkit-mask:linear-gradient(to right, transparent 0%, #000 22%, #000 92%, transparent 100%);mask:linear-gradient(to right, transparent 0%, #000 22%, #000 92%, transparent 100%)}
.ct-hero-split__text{position:relative;z-index:2;width:100%;display:flex;flex-direction:column;justify-content:center;padding:64px 56px 64px max(var(--ct-gutter, 24px), calc((100% - var(--ct-mw, 1280px))/2 + var(--ct-gutter, 24px)))}
.ct-hero-split__eyebrow{font-family:var(--ct-font-body);font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--ct-accent-text);margin-bottom:16px}
.ct-hero-split__h1{font-family:var(--ct-font-display);font-size:clamp(38px,5.2vw,58px);font-weight:600;line-height:1.08;letter-spacing:-.01em;color:var(--ct-text);margin:0 0 18px}
.ct-hero-split__h1 em{font-style:italic;color:var(--ct-accent)}
.ct-hero-split__sub{font-size:19px;color:var(--ct-text-2);max-width:46ch;margin:0 0 28px;line-height:1.5}
.ct-hero-split__cta{display:flex;gap:14px;flex-wrap:wrap;align-items:center}
.ct-hero-split__trust{display:flex;gap:22px;flex-wrap:wrap;margin-top:26px;font-size:13.5px;color:var(--ct-text-2)}
.ct-hero-split__trust-item{display:inline-flex;align-items:center;gap:7px}
@media(max-width:860px){
  .ct-hero-split{flex-direction:column;min-height:0;max-width:none;overflow:visible}
  .ct-hero-split__photo{position:static;width:100%;height:auto;-webkit-mask:none;mask:none;order:1}
  .ct-hero-split__text{padding:40px var(--ct-gutter, 24px);order:2}
}
```

- [ ] **Step 4: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

Expected last line shows total offenses still = 10. If it rises, fix Liquid syntax errors before continuing.

- [ ] **Step 5: Commit**

```bash
git add sections/ct-hero.liquid assets/section-ct-hero.css
git commit -m "feat(ct-hero): add split-photo layout (left text + masked product photo)"
```

---

## Task 2: ct-pricing — add `tier-pair` layout + `addon` block type

**Goal:** New layout option that renders the design's 2-tier bundle (Single Cozy Spot vs Double Comfort, with "Most popular · ships free" badge) + separate addons strip. Per spec §15.

**Files:**
- Modify: `sections/ct-pricing.liquid`
- Modify: `assets/section-ct-pricing.css`

- [ ] **Step 1: Add `tier-pair` to the `layout` select**

In `sections/ct-pricing.liquid`'s `{% schema %}`, find the existing `"id": "layout"` setting and add `tier-pair` to its options array. The setting object should look like:

```json
{ "type": "select", "id": "layout", "label": "Layout",
  "options": [
    { "value": "bundle",    "label": "3-plan bundle (default)" },
    { "value": "tier-pair", "label": "2-tier comparison + addons (homepage)" }
  ],
  "default": "bundle" },
```

(Keep any other options the existing setting already has; just add `tier-pair`.)

- [ ] **Step 2: Add `addons_label` section setting**

After the `layout` setting, insert:

```json
{ "type": "text", "id": "addons_label", "label": "Addons strip label (tier-pair only)",
  "default": "Complete their setup — optional add-ons" },
```

- [ ] **Step 3: Add `features` field to `plan` block**

Inside the existing `plan` block type's `settings` array, append:

```json
{ "type": "textarea", "id": "features", "label": "Feature list (tier-pair only)",
  "info": "One per line. Wrap a line in **double asterisks** to render it in green-highlighted (FREE shipping, etc.)." }
```

- [ ] **Step 4: Add a new `addon` block type**

In the `{% schema %}`'s top-level `"blocks": [...]` array, add a new block type object after the existing `plan` block:

```json
{
  "type": "addon",
  "name": "Add-on (tier-pair layout only)",
  "settings": [
    { "type": "product", "id": "product", "label": "Add-on product" },
    { "type": "image_picker", "id": "image", "label": "Image (overrides product.featured_image)" },
    { "type": "text", "id": "title", "label": "Title (overrides product.title)" },
    { "type": "text", "id": "desc",  "label": "One-line description" }
  ]
}
```

- [ ] **Step 5: Add the `tier-pair` Liquid branch**

In the section markup, find the existing layout-switch (likely `{% case section.settings.layout %}` or `{% if %}` block). Add a new branch for `tier-pair`:

```liquid
{%- when 'tier-pair' -%}
  <section class="ct-tier-pair color-{{ section.settings.color_scheme }}" id="{{ section.settings.anchor_id }}">
    <div class="page-width">
      {%- if section.settings.kicker != blank or section.settings.heading != blank or section.settings.subheading != blank -%}
        <div class="ct-sec-head ct-sec-head--center">
          {%- if section.settings.kicker != blank -%}<span class="ct-eyebrow">{{ section.settings.kicker }}</span>{%- endif -%}
          {%- if section.settings.heading != blank -%}<h2>{{ section.settings.heading }}</h2>{%- endif -%}
          {%- if section.settings.subheading != blank -%}<p class="ct-lead">{{ section.settings.subheading }}</p>{%- endif -%}
        </div>
      {%- endif -%}
      <div class="ct-tier-pair__grid">
        {%- for block in section.blocks -%}
          {%- if block.type == 'plan' -%}
            {%- assign tier_p = block.settings.product -%}
            <div class="ct-tier{% if block.settings.featured %} ct-tier--pop{% endif %}" {{ block.shopify_attributes }}>
              {%- if block.settings.featured and block.settings.badge != blank -%}
                <span class="ct-tier-badge">{{ block.settings.badge }}</span>
              {%- endif -%}
              <h3 class="ct-tier__name">{{ block.settings.name }}</h3>
              {%- if block.settings.sub != blank -%}<span class="ct-tier__sub">{{ block.settings.sub }}</span>{%- endif -%}
              {%- if block.settings.image != blank -%}
                <img class="ct-tier__img" src="{{ block.settings.image | image_url: width: 600 }}" alt="{{ block.settings.image.alt | escape | default: block.settings.name }}" loading="lazy">
              {%- elsif tier_p != blank and tier_p.featured_image != blank -%}
                <img class="ct-tier__img" src="{{ tier_p.featured_image | image_url: width: 600 }}" alt="{{ tier_p.title }}" loading="lazy">
              {%- endif -%}
              {%- if block.settings.features != blank -%}
                <ul class="ct-tier__feat">
                  {%- assign feat_lines = block.settings.features | newline_to_br | split: '<br />' -%}
                  {%- for line in feat_lines -%}
                    {%- assign clean = line | strip | strip_newlines -%}
                    {%- if clean != blank -%}
                      {%- assign is_hl = false -%}
                      {%- if clean contains '**' -%}{%- assign is_hl = true -%}{%- assign clean = clean | replace: '**', '' -%}{%- endif -%}
                      <li{% if is_hl %} class="ct-tier__feat--hl"{% endif %}>
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>{{ clean }}
                      </li>
                    {%- endif -%}
                  {%- endfor -%}
                </ul>
              {%- endif -%}
              <div class="ct-tier__price">
                <span class="ct-tier__per">from</span>
                <b>{% if tier_p != blank %}{{ tier_p.price_min | money }}{% else %}{{ block.settings.price_fallback }}{% endif %}</b>
                {%- if block.settings.featured -%}<span class="ct-tier__ship">ships free</span>{%- endif -%}
              </div>
              <a href="{{ block.settings.button_link | default: '#' }}" class="ct-btn ct-btn--{% if block.settings.featured %}primary{% else %}outlined{% endif %} ct-btn--block">{{ block.settings.button_label | default: 'Choose this' }}</a>
            </div>
          {%- endif -%}
        {%- endfor -%}
      </div>
      {%- assign has_addons = false -%}
      {%- for block in section.blocks -%}{%- if block.type == 'addon' -%}{%- assign has_addons = true -%}{%- endif -%}{%- endfor -%}
      {%- if has_addons -%}
        <div class="ct-bundle__addons">
          {%- if section.settings.addons_label != blank -%}
            <span class="ct-bundle__addons-label">{{ section.settings.addons_label }}</span>
          {%- endif -%}
          <div class="ct-bundle__addons-grid">
            {%- for block in section.blocks -%}
              {%- if block.type == 'addon' -%}
                {%- assign ap = block.settings.product -%}
                {%- assign aimg = block.settings.image -%}
                {%- if aimg == blank and ap != blank -%}{%- assign aimg = ap.featured_image -%}{%- endif -%}
                <div class="ct-bundle__addon" {{ block.shopify_attributes }}>
                  {%- if aimg != blank -%}
                    <span class="ct-bundle__addon-img"><img src="{{ aimg | image_url: width: 120 }}" alt="{{ aimg.alt | escape | default: block.settings.title | default: ap.title }}" loading="lazy"></span>
                  {%- endif -%}
                  <div>
                    <b>{{ block.settings.title | default: ap.title }}</b>
                    {%- if block.settings.desc != blank -%}<small>{{ block.settings.desc }}</small>{%- endif -%}
                  </div>
                </div>
              {%- endif -%}
            {%- endfor -%}
          </div>
        </div>
      {%- endif -%}
    </div>
  </section>
```

- [ ] **Step 6: Append CSS for tier-pair**

Append to `assets/section-ct-pricing.css`:

```css
/* tier-pair layout — homepage 2-tier bundle per cozyclaw-homepage.html §bundle */
.ct-tier-pair{padding:56px 0}
.ct-tier-pair__grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;max-width:860px;margin:0 auto;align-items:stretch}
.ct-tier{position:relative;background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-lg);padding:26px 24px;display:flex;flex-direction:column;transition:transform var(--ct-dur-base, 240ms) var(--ct-ease-out, cubic-bezier(.22,1,.36,1)),box-shadow var(--ct-dur-base, 240ms)}
.ct-tier:hover{transform:translateY(-4px);box-shadow:var(--ct-shadow-md)}
.ct-tier--pop{border:2px solid var(--ct-accent);box-shadow:var(--ct-shadow-md)}
.ct-tier-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);white-space:nowrap;background:var(--ct-accent);color:#fff;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:6px 16px;border-radius:var(--ct-r-pill);box-shadow:var(--ct-shadow-sm)}
.ct-tier__name{font-family:var(--ct-font-display);font-size:21px;margin:0;color:var(--ct-text)}
.ct-tier__sub{display:block;font-size:13.5px;color:var(--ct-text-2);margin-top:3px}
.ct-tier__img{width:100%;aspect-ratio:16/10;object-fit:contain;background:var(--ct-bg-surface);border-radius:var(--ct-r-md);margin:16px 0}
.ct-tier__feat{list-style:none;margin:0 0 20px;padding:0;display:grid;gap:10px}
.ct-tier__feat li{display:flex;gap:9px;align-items:flex-start;font-size:14px;color:var(--ct-text-2)}
.ct-tier__feat svg{width:17px;height:17px;flex-shrink:0;margin-top:1px;stroke:var(--ct-success);fill:none;stroke-width:2.4}
.ct-tier__feat--hl{color:var(--ct-success);font-weight:600}
.ct-tier__price{font-family:var(--ct-font-display);margin-bottom:16px;display:flex;align-items:baseline;gap:8px}
.ct-tier__per{font-size:12.5px;color:var(--ct-text-3);font-family:var(--ct-font-body)}
.ct-tier__price b{font-size:27px;color:var(--ct-text);font-weight:600}
.ct-tier__ship{font-size:13px;color:var(--ct-success);font-weight:600;font-family:var(--ct-font-body)}
.ct-btn--block{width:100%;justify-content:center;margin-top:auto}
.ct-bundle__addons{max-width:860px;margin:22px auto 0;background:var(--ct-accent-subtle);border:1px solid var(--ct-accent-border);border-radius:var(--ct-r-lg);padding:20px 26px}
.ct-bundle__addons-label{display:block;font-size:11.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ct-text-3);margin-bottom:6px}
.ct-bundle__addons-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 26px}
.ct-bundle__addon{display:flex;gap:12px;align-items:flex-start;padding:11px 0}
.ct-bundle__addon-img{width:42px;height:42px;flex-shrink:0;border-radius:var(--ct-r-sm);background:var(--ct-bg-raised);overflow:hidden;display:flex;align-items:center;justify-content:center}
.ct-bundle__addon-img img{width:100%;height:100%;object-fit:cover;display:block}
.ct-bundle__addon b{display:block;font-size:14.5px;color:var(--ct-text)}
.ct-bundle__addon small{font-size:12.5px;color:var(--ct-text-2)}
@media(max-width:760px){.ct-tier-pair__grid{grid-template-columns:1fr}.ct-bundle__addons-grid{grid-template-columns:1fr}}
```

- [ ] **Step 7: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

Expected: 10 offenses (unchanged).

- [ ] **Step 8: Commit**

```bash
git add sections/ct-pricing.liquid assets/section-ct-pricing.css
git commit -m "feat(ct-pricing): add tier-pair layout (Single vs Double Comfort + addons strip)"
```

---

## Task 3: ct-aplus — add `materials-care` + `guarantee-4` layouts

**Goal:** Two new layouts. `materials-care` = 2-panel spec-row layout for §12. `guarantee-4` = 4-item accent-subtle panel for §14. Existing layouts (`banners` / `spec-grid` / `assure-grid`) untouched.

**Files:**
- Modify: `sections/ct-aplus.liquid`
- Modify: `assets/section-ct-aplus.css`

- [ ] **Step 1: Extend the `layout` select with 2 new options**

In `sections/ct-aplus.liquid`'s `{% schema %}`, find the `"id": "layout"` setting and add the 2 new values:

```json
{ "type": "select", "id": "layout", "label": "Layout",
  "options": [
    { "value": "banners",         "label": "Banners (image + text)" },
    { "value": "spec-grid",       "label": "Spec grid (3 compact)" },
    { "value": "assure-grid",     "label": "Assure grid (2 assurance cards)" },
    { "value": "materials-care",  "label": "Materials & care (2 panels of spec rows)" },
    { "value": "guarantee-4",     "label": "Guarantee panel (4 items, accent-subtle bg)" }
  ],
  "default": "banners" },
```

- [ ] **Step 2: Add `specs_rows` and `icon_svg` fields to `banner` block**

In the existing `banner` block's settings array, append:

```json
{ "type": "textarea", "id": "specs_rows", "label": "Spec rows (materials-care only)",
  "info": "One per line, format: 'Label | Value'. Example: 'Cover | Soft coral fleece'" },
{ "type": "select", "id": "icon_svg", "label": "Icon (guarantee-4 only)",
  "options": [
    { "value": "shield", "label": "Shield" },
    { "value": "truck",  "label": "Truck" },
    { "value": "box",    "label": "Box" },
    { "value": "lock",   "label": "Lock" }
  ],
  "default": "shield" }
```

- [ ] **Step 3: Add `materials-care` Liquid branch**

In the section markup, find the layout-switch and add this branch (before the closing `{% endcase %}` or `{% endif %}`):

```liquid
{%- when 'materials-care' -%}
  <section class="ct-aplus ct-aplus--materials color-{{ section.settings.color_scheme }}" id="{{ section.settings.anchor_id }}">
    <div class="page-width">
      {%- if section.settings.kicker != blank or section.settings.heading != blank -%}
        <div class="ct-sec-head ct-sec-head--center">
          {%- if section.settings.kicker != blank -%}<span class="ct-eyebrow">{{ section.settings.kicker }}</span>{%- endif -%}
          {%- if section.settings.heading != blank -%}<h2>{{ section.settings.heading }}</h2>{%- endif -%}
        </div>
      {%- endif -%}
      <div class="ct-aplus__mc-grid">
        {%- for block in section.blocks -%}
          <div class="ct-aplus__mc-panel" {{ block.shopify_attributes }}>
            {%- if block.settings.title != blank -%}<h3>{{ block.settings.title }}</h3>{%- endif -%}
            {%- if block.settings.specs_rows != blank -%}
              {%- assign rows = block.settings.specs_rows | newline_to_br | split: '<br />' -%}
              {%- for row in rows -%}
                {%- assign clean = row | strip | strip_newlines -%}
                {%- if clean != blank and clean contains '|' -%}
                  {%- assign parts = clean | split: '|' -%}
                  <div class="ct-aplus__spec"><span>{{ parts[0] | strip }}</span><b>{{ parts[1] | strip }}</b></div>
                {%- endif -%}
              {%- endfor -%}
            {%- endif -%}
            {%- if block.settings.body != blank -%}<p class="ct-aplus__mc-note">{{ block.settings.body }}</p>{%- endif -%}
          </div>
        {%- endfor -%}
      </div>
    </div>
  </section>
```

- [ ] **Step 4: Add `guarantee-4` Liquid branch**

In the same layout-switch, add:

```liquid
{%- when 'guarantee-4' -%}
  <section class="ct-aplus ct-aplus--guarantee color-{{ section.settings.color_scheme }}" id="{{ section.settings.anchor_id }}">
    <div class="page-width">
      <div class="ct-aplus__guarantee-panel">
        {%- for block in section.blocks -%}
          <div class="ct-aplus__guarantee-item" {{ block.shopify_attributes }}>
            <span class="ct-aplus__guarantee-ic">
              {%- case block.settings.icon_svg -%}
                {%- when 'shield' -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 5-3 7-7 9-4-2-7-4-7-9V6z"/></svg>
                {%- when 'truck'  -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h13V6H3zM16 9h3l2 3v4h-5z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>
                {%- when 'box'    -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7l8-4 8 4-8 4z"/><path d="M4 7v7l8 4 8-4V7"/></svg>
                {%- when 'lock'   -%}<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
              {%- endcase -%}
            </span>
            {%- if block.settings.title != blank -%}<b>{{ block.settings.title }}</b>{%- endif -%}
            {%- if block.settings.body != blank -%}<p>{{ block.settings.body }}</p>{%- endif -%}
          </div>
        {%- endfor -%}
      </div>
    </div>
  </section>
```

- [ ] **Step 5: Append CSS for both new layouts**

Append to `assets/section-ct-aplus.css`:

```css
/* materials-care — 2-panel spec rows per cozyclaw-homepage.html §materials */
.ct-aplus--materials{padding:56px 0}
.ct-aplus__mc-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:var(--ct-mw, 1280px);margin:0 auto}
.ct-aplus__mc-panel{background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-lg);padding:30px;box-shadow:var(--ct-shadow-sm)}
.ct-aplus__mc-panel h3{font-family:var(--ct-font-display);font-size:20px;margin-bottom:16px;color:var(--ct-text)}
.ct-aplus__spec{display:flex;justify-content:space-between;gap:16px;padding:11px 0;border-bottom:1px solid var(--ct-border-subtle);font-size:14.5px}
.ct-aplus__spec:last-of-type{border-bottom:none}
.ct-aplus__spec span{color:var(--ct-text-3)}
.ct-aplus__spec b{font-weight:600;text-align:right;color:var(--ct-text)}
.ct-aplus__mc-note{font-size:13.5px;color:var(--ct-text-3);margin-top:16px}
@media(max-width:760px){.ct-aplus__mc-grid{grid-template-columns:1fr}}

/* guarantee-4 — 4-item accent-subtle panel per cozyclaw-homepage.html §guarantee */
.ct-aplus--guarantee{padding:56px 0}
.ct-aplus__guarantee-panel{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;padding:40px 30px;background:var(--ct-accent-subtle);border:1px solid var(--ct-accent-border);border-radius:var(--ct-r-xl);max-width:var(--ct-mw, 1280px);margin:0 auto}
.ct-aplus__guarantee-item{text-align:center;padding:6px}
.ct-aplus__guarantee-ic{width:50px;height:50px;border-radius:50%;background:var(--ct-bg-raised);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;box-shadow:var(--ct-shadow-xs)}
.ct-aplus__guarantee-ic svg{width:24px;height:24px;stroke:var(--ct-accent-strong);stroke-width:1.7;fill:none}
.ct-aplus__guarantee-item b{font-size:15px;display:block;margin-bottom:4px;color:var(--ct-text)}
.ct-aplus__guarantee-item p{font-size:13px;color:var(--ct-text-2);margin:0}
@media(max-width:760px){.ct-aplus__guarantee-panel{grid-template-columns:1fr 1fr;gap:26px 18px}}
```

- [ ] **Step 6: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

Expected: 10 offenses.

- [ ] **Step 7: Commit**

```bash
git add sections/ct-aplus.liquid assets/section-ct-aplus.css
git commit -m "feat(ct-aplus): add materials-care + guarantee-4 layouts"
```

---

## Task 4: ct-trust-bar — add `icon-strip` layout

**Goal:** New layout per spec §4 — accent-subtle band, 4 items with icon-box + bold title + small subtitle. Extends icon library with 4 pet-specific icons. Default `chips` layout unchanged so PDP keeps rendering.

**Files:**
- Modify: `sections/ct-trust-bar.liquid`
- Modify: `assets/section-ct-trust-bar.css`

- [ ] **Step 1: Add `layout` select to schema**

In `sections/ct-trust-bar.liquid`'s `{% schema %}` `settings` array, insert at the top:

```json
{ "type": "select", "id": "layout", "label": "Layout",
  "options": [
    { "value": "chips",       "label": "Chip row (default — used by PDP)" },
    { "value": "icon-strip",  "label": "Icon strip (homepage — accent-subtle band)" }
  ],
  "default": "chips" },
```

- [ ] **Step 2: Add `title` + `subtitle` to `chip` block + extend icon list**

In the `chip` block's settings, find the `icon` select and add 4 new options to its array:

```json
{ "value": "paw-fleece", "label": "Paw / heart (fleece)" },
{ "value": "bed-edge",   "label": "Bed with edge" },
{ "value": "couch-hair", "label": "Couch / lines (hair-free)" },
{ "value": "wash-clock", "label": "Wash / clock" }
```

And in the same block's settings, append:

```json
{ "type": "text", "id": "title",    "label": "Title (icon-strip only)" },
{ "type": "text", "id": "subtitle", "label": "Subtitle (icon-strip only)" }
```

- [ ] **Step 3: Add icon SVG paths to the existing `{% case %}` switch**

Find the existing `{% case block.settings.icon %}` switch in the section markup. Add 4 new `{% when %}` branches inside it (paths copied from `files/cozyclaw-homepage.html` lines 419–422):

```liquid
{%- when 'paw-fleece' -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c5-3 8-6 8-10a4 4 0 00-8-1 4 4 0 00-8 1c0 4 3 7 8 10z"/></svg>
{%- when 'bed-edge'   -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c0-4 4-6 8-6s8 2 8 6"/><path d="M3 14h18v4H3z"/></svg>
{%- when 'couch-hair' -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
{%- when 'wash-clock' -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 109 9"/><path d="M12 7v5l3 2"/></svg>
```

- [ ] **Step 4: Add the `icon-strip` Liquid branch**

Wrap the existing chip-row markup in a layout-switch. The new structure should look like:

```liquid
{%- if section.settings.layout == 'icon-strip' -%}
  <div class="ct-trust-strip color-{{ section.settings.color_scheme }}">
    <div class="page-width">
      {%- for block in section.blocks -%}
        <div class="ct-trust-strip__item" {{ block.shopify_attributes }}>
          <span class="ct-trust-strip__ic">
            {%- case block.settings.icon -%}
              {%- when 'truck'        -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h13V6H3zM16 9h3l2 3v4h-5z"/><circle cx="7" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/></svg>
              {%- when 'shield-money' -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 5-3 7-7 9-4-2-7-4-7-9V6z"/></svg>
              {%- when 'lock'         -%}<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
              {%- when 'chat'         -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H7l-3 3z"/></svg>
              {%- when 'check'        -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
              {%- when 'paw-fleece'   -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c5-3 8-6 8-10a4 4 0 00-8-1 4 4 0 00-8 1c0 4 3 7 8 10z"/></svg>
              {%- when 'bed-edge'     -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c0-4 4-6 8-6s8 2 8 6"/><path d="M3 14h18v4H3z"/></svg>
              {%- when 'couch-hair'   -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              {%- when 'wash-clock'   -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 109 9"/><path d="M12 7v5l3 2"/></svg>
            {%- endcase -%}
          </span>
          <div>
            {%- if block.settings.title != blank -%}<b class="ct-trust-strip__title">{{ block.settings.title }}</b>{%- endif -%}
            {%- if block.settings.subtitle != blank -%}<small class="ct-trust-strip__sub">{{ block.settings.subtitle }}</small>{%- endif -%}
          </div>
        </div>
      {%- endfor -%}
    </div>
  </div>
{%- else -%}
  <!-- existing chip-row markup stays here unchanged -->
{%- endif -%}
```

(Keep the existing chip-row markup verbatim inside the `{% else %}`.)

- [ ] **Step 5: Append CSS for icon-strip**

Append to `assets/section-ct-trust-bar.css`:

```css
/* icon-strip — homepage trust strip per cozyclaw-homepage.html §trust-strip */
.ct-trust-strip{background:var(--ct-accent-subtle)}
.ct-trust-strip .page-width{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;padding:26px var(--ct-gutter, 24px)}
.ct-trust-strip__item{display:flex;gap:13px;align-items:center}
.ct-trust-strip__ic{width:42px;height:42px;border-radius:var(--ct-r-sm);background:var(--ct-bg-raised);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--ct-shadow-xs)}
.ct-trust-strip__ic svg{width:21px;height:21px;stroke:var(--ct-accent-strong);stroke-width:1.8;fill:none}
.ct-trust-strip__title{font-size:14.5px;display:block;color:var(--ct-text);font-weight:700;font-family:var(--ct-font-body)}
.ct-trust-strip__sub{font-size:12.5px;color:var(--ct-text-3);display:block}
@media(max-width:760px){.ct-trust-strip .page-width{grid-template-columns:1fr 1fr;gap:20px 14px}}
```

- [ ] **Step 6: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

- [ ] **Step 7: Commit**

```bash
git add sections/ct-trust-bar.liquid assets/section-ct-trust-bar.css
git commit -m "feat(ct-trust-bar): add icon-strip layout + 4 pet-specific icons"
```

---

## Task 5: ct-pillars — add `pillars-svg` layout + 6-icon SVG library

**Goal:** New 6-pillar 3-column grid with hover lift and SVG icons (not emoji). Per spec §6 / design lines 142–151 / 462–477.

**Files:**
- Modify: `sections/ct-pillars.liquid`
- Modify: `assets/section-ct-pillars.css`

- [ ] **Step 1: Add `layout` select**

In `sections/ct-pillars.liquid`'s `{% schema %}`, insert at the top of `settings`:

```json
{ "type": "select", "id": "layout", "label": "Layout",
  "options": [
    { "value": "default",     "label": "Default (used by PDP)" },
    { "value": "pillars-svg", "label": "6 pillars with SVG icons (homepage)" }
  ],
  "default": "default" },
```

- [ ] **Step 2: Add `icon_svg` field to `pillar` block**

In the `pillar` block's settings, append:

```json
{ "type": "select", "id": "icon_svg", "label": "SVG icon (pillars-svg layout only)",
  "options": [
    { "value": "heart-paw",    "label": "Heart / paw (cozy)" },
    { "value": "bed-bolster",  "label": "Bed with bolster" },
    { "value": "shield-couch", "label": "Shield / couch (protect)" },
    { "value": "star",         "label": "Star (style)" },
    { "value": "wash-clock",   "label": "Wash / clock (easy clean)" },
    { "value": "check-double", "label": "Double check (built to last)" }
  ],
  "default": "heart-paw" }
```

- [ ] **Step 3: Add the `pillars-svg` Liquid branch**

Wrap the existing pillars markup in a layout-switch. The new structure:

```liquid
{%- if section.settings.layout == 'pillars-svg' -%}
  <section class="ct-pillars-svg color-{{ section.settings.color_scheme }}" id="{{ section.settings.anchor_id }}">
    <div class="page-width">
      {%- if section.settings.kicker != blank or section.settings.heading != blank -%}
        <div class="ct-sec-head ct-sec-head--center">
          {%- if section.settings.kicker != blank -%}<span class="ct-eyebrow">{{ section.settings.kicker }}</span>{%- endif -%}
          {%- if section.settings.heading != blank -%}<h2>{{ section.settings.heading }}</h2>{%- endif -%}
        </div>
      {%- endif -%}
      <div class="ct-pillars-svg__grid">
        {%- for block in section.blocks -%}
          <div class="ct-pillars-svg__card" {{ block.shopify_attributes }}>
            <span class="ct-pillars-svg__ic">
              {%- case block.settings.icon_svg -%}
                {%- when 'heart-paw'    -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c5-3 8-6 8-10a4 4 0 00-8-1 4 4 0 00-8 1c0 4 3 7 8 10z"/></svg>
                {%- when 'bed-bolster'  -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14c0-4 4-6 8-6s8 2 8 6"/><path d="M3 14h18v5H3z"/></svg>
                {%- when 'shield-couch' -%}<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="9" width="16" height="11" rx="2"/><path d="M8 9V6a4 4 0 018 0v3"/></svg>
                {%- when 'star'         -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l3 6 6 .9-4.5 4.3 1 6.3L12 17l-5.5 3.5 1-6.3L3 9.9 9 9z"/></svg>
                {%- when 'wash-clock'   -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 109 9"/><path d="M12 7v5l3 2"/></svg>
                {%- when 'check-double' -%}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7L9 18l-5-5"/><path d="M4 7l3 3"/></svg>
              {%- endcase -%}
            </span>
            {%- if block.settings.name != blank -%}<h3>{{ block.settings.name }}</h3>{%- endif -%}
            {%- if block.settings.desc != blank -%}<p>{{ block.settings.desc }}</p>{%- endif -%}
          </div>
        {%- endfor -%}
      </div>
    </div>
  </section>
{%- else -%}
  <!-- existing default markup stays unchanged -->
{%- endif -%}
```

- [ ] **Step 4: Append CSS for pillars-svg**

Append to `assets/section-ct-pillars.css`:

```css
/* pillars-svg — 6 pillars 3-col with SVG icons + hover lift, per cozyclaw-homepage.html §pillars */
.ct-pillars-svg{padding:56px 0;background:var(--ct-bg-surface)}
.ct-pillars-svg__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:var(--ct-mw, 1280px);margin:0 auto}
.ct-pillars-svg__card{background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-lg);padding:28px;transition:transform var(--ct-dur-base, 240ms) var(--ct-ease-out, cubic-bezier(.22,1,.36,1)),box-shadow var(--ct-dur-base, 240ms)}
.ct-pillars-svg__card:hover{transform:translateY(-4px);box-shadow:var(--ct-shadow-md)}
.ct-pillars-svg__ic{width:46px;height:46px;border-radius:var(--ct-r-sm);background:var(--ct-accent-subtle);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.ct-pillars-svg__ic svg{width:23px;height:23px;stroke:var(--ct-accent-strong);stroke-width:1.7;fill:none}
.ct-pillars-svg__card h3{font-family:var(--ct-font-display);font-size:19px;margin:0 0 8px;color:var(--ct-text)}
.ct-pillars-svg__card p{font-size:14.5px;color:var(--ct-text-2);margin:0}
@media(max-width:860px){.ct-pillars-svg__grid{grid-template-columns:1fr 1fr}}
@media(max-width:560px){.ct-pillars-svg__grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.ct-pillars-svg__card{transition:none}.ct-pillars-svg__card:hover{transform:none}}
```

- [ ] **Step 5: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

- [ ] **Step 6: Commit**

```bash
git add sections/ct-pillars.liquid assets/section-ct-pillars.css
git commit -m "feat(ct-pillars): add pillars-svg layout with 6-icon SVG library"
```

---

## Task 6: ct-marquee — add `italic-divider` style

**Goal:** New style option that renders italic-Fraunces phrases with `•` separators between items. Default `loop-blocks` style unchanged. Per spec §8 / design lines 162–167 / 493–497.

**Files:**
- Modify: `sections/ct-marquee.liquid`
- Modify: `assets/section-ct-marquee.css`

- [ ] **Step 1: Add `style` select to schema**

In `sections/ct-marquee.liquid`'s `{% schema %}`, insert at the top of `settings`:

```json
{ "type": "select", "id": "style", "label": "Style",
  "options": [
    { "value": "loop-blocks",    "label": "Loop blocks (default — used by PDP)" },
    { "value": "italic-divider", "label": "Italic phrases with bullet dividers (homepage)" }
  ],
  "default": "loop-blocks" },
```

- [ ] **Step 2: Add `data-style` attr on the marquee container**

Find the wrapper element (likely `<div class="ct-marquee">` or similar). Add an attribute:

```liquid
<div class="ct-marquee" data-style="{{ section.settings.style | default: 'loop-blocks' }}">
```

This lets CSS branch without duplicating JS or markup.

- [ ] **Step 3: Append CSS for italic-divider**

Append to `assets/section-ct-marquee.css`:

```css
/* italic-divider style — homepage marquee per cozyclaw-homepage.html §marquee */
.ct-marquee[data-style="italic-divider"]{background:var(--ct-accent-subtle);border-top:1px solid var(--ct-border-faint);border-bottom:1px solid var(--ct-border-faint);padding:16px 0}
.ct-marquee[data-style="italic-divider"] .ct-marquee-track span{font-family:var(--ct-font-display);font-style:italic;font-size:19px;color:var(--ct-accent-text);display:inline-flex;align-items:center;gap:46px}
.ct-marquee[data-style="italic-divider"] .ct-marquee-track span::after{content:'•';color:var(--ct-accent-border);margin-left:46px}
.ct-marquee[data-style="italic-divider"] .ct-marquee-track span:last-child::after{content:none}
```

- [ ] **Step 4: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

- [ ] **Step 5: Commit**

```bash
git add sections/ct-marquee.liquid assets/section-ct-marquee.css
git commit -m "feat(ct-marquee): add italic-divider style (italic Fraunces with bullet separators)"
```

---

## Task 7: ct-announce — add `static-row` display

**Goal:** New display option that shows all blocks inline in one row (no rotation). Default `rotate` unchanged. Per spec §5 item 1 / design lines 374–378.

**Files:**
- Modify: `sections/ct-announce.liquid`
- Modify: `assets/section-ct-announce.css`

- [ ] **Step 1: Add `display` select to schema**

In `sections/ct-announce.liquid`'s `{% schema %}`, insert at the top of `settings`:

```json
{ "type": "select", "id": "display", "label": "Display mode",
  "options": [
    { "value": "rotate",     "label": "Rotate messages (default)" },
    { "value": "static-row", "label": "Show all in one row (homepage)" }
  ],
  "default": "rotate" },
```

- [ ] **Step 2: Add the static-row Liquid branch**

In the section markup, wrap the existing markup in a display-switch:

```liquid
{%- if section.settings.display == 'static-row' -%}
  <div class="ct-announce ct-announce--static-row color-{{ section.settings.color_scheme }}" role="region" aria-label="Announcement">
    <div class="page-width">
      {%- for block in section.blocks -%}
        <span class="ct-announce--static-row__item" {{ block.shopify_attributes }}>
          {%- if block.settings.link != blank -%}<a href="{{ block.settings.link }}">{{ block.settings.text }}</a>
          {%- else -%}{{ block.settings.text }}
          {%- endif -%}
        </span>
      {%- endfor -%}
    </div>
  </div>
{%- else -%}
  <!-- existing rotate markup stays unchanged -->
{%- endif -%}
```

- [ ] **Step 3: Append CSS for static-row**

Append to `assets/section-ct-announce.css`:

```css
/* static-row display — homepage announce per cozyclaw-homepage.html §announce */
.ct-announce--static-row{background:var(--ct-accent);color:#fff;font-size:12.5px;letter-spacing:.04em;font-weight:600;min-height:auto;padding:0}
.ct-announce--static-row .page-width{display:flex;gap:30px;justify-content:center;flex-wrap:wrap;padding:9px var(--ct-gutter, 24px)}
.ct-announce--static-row__item{display:inline-flex;align-items:center;gap:7px;opacity:.96}
.ct-announce--static-row__item a{color:inherit;text-decoration:none}
.ct-announce--static-row__item a:hover{text-decoration:underline}
@media(max-width:560px){.ct-announce--static-row .page-width{gap:14px;font-size:12px}}
```

- [ ] **Step 4: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

- [ ] **Step 5: Commit**

```bash
git add sections/ct-announce.liquid assets/section-ct-announce.css
git commit -m "feat(ct-announce): add static-row display (3 messages inline)"
```

---

## Task 8: ct-sticky-atc — add image setting with product.featured_image fallback

**Goal:** Sticky ATC currently uses an emoji. Design uses a real product thumbnail. Add `image` (image_picker) setting with `product.featured_image` fallback. Plus blank-out misleading defaults.

**Files:**
- Modify: `sections/ct-sticky-atc.liquid`

- [ ] **Step 1: Add `image` setting to schema**

In `sections/ct-sticky-atc.liquid`'s `{% schema %}`, find the `emoji` setting and insert this object before it:

```json
{ "type": "image_picker", "id": "image", "label": "Thumbnail image",
  "info": "Falls back to product.featured_image when blank and a product is picked. Replaces the emoji when set." },
```

- [ ] **Step 2: Update misleading default values**

In the same schema, find and update these existing settings:

```json
{ "type": "text", "id": "emoji", "label": "Emoji / icon (only used if no image and no product)", "default": "" },
{ "type": "text", "id": "product_name", "label": "Product name override (otherwise uses product.title)", "default": "" },
{ "type": "text", "id": "button_label", "label": "Button label override (otherwise uses 'Add to Cart — $X.XX' from product.price_min)", "default": "" },
```

- [ ] **Step 3: Add image render before emoji fallback**

In the section markup, find the existing emoji render line (e.g. `<span class="ct-sticky-atc__emoji">{{ section.settings.emoji }}</span>`) and replace its surrounding `{% if section.settings.emoji != blank %}...{% endif %}` block with:

```liquid
{%- assign sticky_img = section.settings.image -%}
{%- if sticky_img == blank and atc_product != blank -%}
  {%- assign sticky_img = atc_product.featured_image -%}
{%- endif -%}
{%- if sticky_img != blank -%}
  <img class="ct-sticky-atc__img" src="{{ sticky_img | image_url: width: 96 }}" alt="{{ sticky_img.alt | escape | default: atc_name }}" loading="lazy" width="48" height="48">
{%- elsif section.settings.emoji != blank -%}
  <span class="ct-sticky-atc__emoji" aria-hidden="true">{{ section.settings.emoji }}</span>
{%- endif -%}
```

- [ ] **Step 4: Add image CSS** (only if `.ct-sticky-atc__img` isn't already defined)

Check first: `grep "ct-sticky-atc__img" assets/section-ct-sticky-atc.css 2>/dev/null` (file may not exist; sticky-atc CSS may live in `ct-sections.css`). If not present, append to whichever file holds the other `.ct-sticky-atc__*` rules:

```css
.ct-sticky-atc__img{width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;border:1px solid var(--ct-border-subtle)}
```

- [ ] **Step 5: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

- [ ] **Step 6: Commit**

```bash
git add sections/ct-sticky-atc.liquid
# Plus the CSS file if you appended to it in Step 4
git commit -m "feat(ct-sticky-atc): add image setting with product.featured_image fallback"
```

---

## Task 9: NEW section — ct-problem-solution

**Goal:** Brand-new section: 2-card problem/solution layout. Per spec §5b / design lines 438–460.

**Files:**
- Create: `sections/ct-problem-solution.liquid`
- Create: `assets/section-ct-problem-solution.css`

- [ ] **Step 1: Create the Liquid file**

Create `sections/ct-problem-solution.liquid` with these contents:

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-problem-solution.css' | asset_url | stylesheet_tag }}

<section class="ct-ps color-{{ section.settings.color_scheme }} section-{{ section.id }}-padding" id="{{ section.settings.anchor_id }}">
  <div class="page-width">
    {%- if section.settings.kicker != blank -%}
      <div class="ct-sec-head ct-sec-head--center">
        <span class="ct-eyebrow">{{ section.settings.kicker }}</span>
      </div>
    {%- endif -%}
    <div class="ct-ps__grid">
      {%- for block in section.blocks -%}
        <div class="ct-ps__card ct-ps__card--{{ block.settings.variant }}" {{ block.shopify_attributes }}>
          {%- if block.settings.tag_label != blank -%}<div class="ct-ps__tag">{{ block.settings.tag_label }}</div>{%- endif -%}
          {%- if block.settings.heading != blank -%}<h3>{{ block.settings.heading }}</h3>{%- endif -%}
          {%- if block.settings.bullets != blank -%}
            <ul>
              {%- assign lines = block.settings.bullets | newline_to_br | split: '<br />' -%}
              {%- for line in lines -%}
                {%- assign clean = line | strip | strip_newlines -%}
                {%- if clean != blank -%}
                  <li>
                    {%- if block.settings.variant == 'problem' -%}
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    {%- else -%}
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
                    {%- endif -%}
                    {{ clean }}
                  </li>
                {%- endif -%}
              {%- endfor -%}
            </ul>
          {%- endif -%}
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>

{% style %}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
{% endstyle %}

{% schema %}
{
  "name": "CT Problem / Solution",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text",  "id": "anchor_id", "label": "Anchor id" },
    { "type": "text",  "id": "kicker",    "label": "Kicker (eyebrow above the cards)" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "header", "content": "Padding" },
    { "type": "range",  "id": "padding_top",    "label": "Top padding",    "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 },
    { "type": "range",  "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 }
  ],
  "blocks": [
    {
      "type": "card",
      "name": "Card",
      "limit": 2,
      "settings": [
        { "type": "select", "id": "variant", "label": "Variant",
          "options": [
            { "value": "problem",  "label": "Problem (red ✗ bullets)" },
            { "value": "solution", "label": "Solution (accent ✓ bullets)" }
          ],
          "default": "problem" },
        { "type": "text",     "id": "tag_label", "label": "Tag label (uppercase eyebrow)" },
        { "type": "text",     "id": "heading",   "label": "Heading" },
        { "type": "textarea", "id": "bullets",   "label": "Bullets (one per line)" }
      ]
    }
  ],
  "max_blocks": 2,
  "presets": [
    {
      "name": "CT Problem / Solution",
      "blocks": [
        { "type": "card", "settings": { "variant": "problem",  "tag_label": "The problem",  "heading": "Headline of the pain" } },
        { "type": "card", "settings": { "variant": "solution", "tag_label": "The solution", "heading": "Headline of the relief" } }
      ]
    }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Create the CSS file**

Create `assets/section-ct-problem-solution.css` with these contents:

```css
/* section-ct-problem-solution.css — 2-card problem/solution per cozyclaw-homepage.html §ps */
.ct-ps__grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;max-width:var(--ct-mw, 1280px);margin:0 auto}
.ct-ps__card{background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-lg);padding:34px;box-shadow:var(--ct-shadow-sm)}
.ct-ps__tag{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px}
.ct-ps__card--problem .ct-ps__tag{color:var(--ct-urgency)}
.ct-ps__card--solution .ct-ps__tag{color:var(--ct-accent-text)}
.ct-ps__card h3{font-family:var(--ct-font-display);font-size:25px;font-weight:600;margin-bottom:20px;color:var(--ct-text);line-height:1.15}
.ct-ps__card ul{list-style:none;margin:0;padding:0}
.ct-ps__card li{display:flex;gap:11px;align-items:flex-start;margin-bottom:13px;font-size:15.5px;color:var(--ct-text-2)}
.ct-ps__card li svg{width:20px;height:20px;flex-shrink:0;margin-top:1px;fill:none;stroke-width:2.2}
.ct-ps__card--problem li svg{stroke:var(--ct-urgency)}
.ct-ps__card--solution li svg{stroke:var(--ct-accent)}
@media(max-width:760px){.ct-ps__grid{grid-template-columns:1fr}}
```

- [ ] **Step 3: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git add sections/ct-problem-solution.liquid assets/section-ct-problem-solution.css
git commit -m "feat(ct-problem-solution): new section — 2-card problem/solution layout"
```

---

## Task 10: NEW section — ct-features-grid

**Goal:** Brand-new section: 4-col grid of image+body cards. Per spec §7 / design lines 152–161 / 480–491.

**Files:**
- Create: `sections/ct-features-grid.liquid`
- Create: `assets/section-ct-features-grid.css`

- [ ] **Step 1: Create the Liquid file**

Create `sections/ct-features-grid.liquid`:

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-features-grid.css' | asset_url | stylesheet_tag }}

<section class="ct-features color-{{ section.settings.color_scheme }} section-{{ section.id }}-padding" id="{{ section.settings.anchor_id }}">
  <div class="page-width">
    {%- if section.settings.kicker != blank or section.settings.heading != blank -%}
      <div class="ct-sec-head ct-sec-head--center">
        {%- if section.settings.kicker != blank -%}<span class="ct-eyebrow">{{ section.settings.kicker }}</span>{%- endif -%}
        {%- if section.settings.heading != blank -%}<h2>{{ section.settings.heading }}</h2>{%- endif -%}
      </div>
    {%- endif -%}
    <div class="ct-features__grid">
      {%- for block in section.blocks -%}
        <div class="ct-features__card" {{ block.shopify_attributes }}>
          {%- if block.settings.image != blank -%}
            <img class="ct-features__img" src="{{ block.settings.image | image_url: width: 600 }}" alt="{{ block.settings.image.alt | escape | default: block.settings.title }}" loading="lazy" width="{{ block.settings.image.width }}" height="{{ block.settings.image.height }}">
          {%- endif -%}
          <div class="ct-features__body">
            {%- if block.settings.title != blank -%}<h3>{{ block.settings.title }}</h3>{%- endif -%}
            {%- if block.settings.description != blank -%}<p>{{ block.settings.description }}</p>{%- endif -%}
          </div>
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>

{% style %}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
{% endstyle %}

{% schema %}
{
  "name": "CT Features grid",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "anchor_id", "label": "Anchor id" },
    { "type": "text", "id": "kicker",    "label": "Kicker (eyebrow)", "default": "Thoughtfully designed" },
    { "type": "text", "id": "heading",   "label": "Heading",          "default": "Beautifully made, down to the seam" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "header", "content": "Padding" },
    { "type": "range", "id": "padding_top",    "label": "Top padding",    "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 }
  ],
  "blocks": [
    {
      "type": "feature",
      "name": "Feature card",
      "settings": [
        { "type": "image_picker", "id": "image",       "label": "Image" },
        { "type": "text",         "id": "title",       "label": "Title" },
        { "type": "textarea",     "id": "description", "label": "Description" }
      ]
    }
  ],
  "max_blocks": 8,
  "presets": [ { "name": "CT Features grid" } ]
}
{% endschema %}
```

- [ ] **Step 2: Create the CSS file**

Create `assets/section-ct-features-grid.css`:

```css
/* section-ct-features-grid.css — 4-col image+body cards per cozyclaw-homepage.html §feat */
.ct-features__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;max-width:var(--ct-mw, 1280px);margin:0 auto}
.ct-features__card{background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-lg);overflow:hidden;box-shadow:var(--ct-shadow-sm)}
.ct-features__img{width:100%;aspect-ratio:1/1;object-fit:contain;background:var(--ct-bg-surface);display:block}
.ct-features__body{padding:20px 20px 24px}
.ct-features__body h3{font-family:var(--ct-font-display);font-size:18px;font-weight:600;margin:0 0 7px;color:var(--ct-text)}
.ct-features__body p{font-size:13.8px;color:var(--ct-text-2);margin:0;line-height:1.5}
@media(max-width:860px){.ct-features__grid{grid-template-columns:1fr 1fr}}
@media(max-width:520px){.ct-features__grid{grid-template-columns:1fr}}
```

- [ ] **Step 3: Run theme check + commit**

```bash
shopify theme check 2>&1 | tail -3
git add sections/ct-features-grid.liquid assets/section-ct-features-grid.css
git commit -m "feat(ct-features-grid): new section — 4-col image+body cards"
```

---

## Task 11: NEW section — ct-lifestyle

**Goal:** Brand-new section: 4 photo tiles with caption overlay (linear-gradient at bottom). Per spec §9 / design lines 169–176 / 499–511.

**Files:**
- Create: `sections/ct-lifestyle.liquid`
- Create: `assets/section-ct-lifestyle.css`

- [ ] **Step 1: Create the Liquid file**

Create `sections/ct-lifestyle.liquid`:

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-lifestyle.css' | asset_url | stylesheet_tag }}

<section class="ct-life color-{{ section.settings.color_scheme }} section-{{ section.id }}-padding" id="{{ section.settings.anchor_id }}">
  <div class="page-width">
    {%- if section.settings.kicker != blank or section.settings.heading != blank -%}
      <div class="ct-sec-head ct-sec-head--center">
        {%- if section.settings.kicker != blank -%}<span class="ct-eyebrow">{{ section.settings.kicker }}</span>{%- endif -%}
        {%- if section.settings.heading != blank -%}<h2>{{ section.settings.heading }}</h2>{%- endif -%}
      </div>
    {%- endif -%}
    <div class="ct-life__grid">
      {%- for block in section.blocks -%}
        <figure class="ct-life__tile" {{ block.shopify_attributes }}>
          {%- if block.settings.image != blank -%}
            <img src="{{ block.settings.image | image_url: width: 600 }}" alt="{{ block.settings.image.alt | escape | default: block.settings.caption }}" loading="lazy" width="{{ block.settings.image.width }}" height="{{ block.settings.image.height }}">
          {%- endif -%}
          {%- if block.settings.caption != blank -%}<figcaption>{{ block.settings.caption }}</figcaption>{%- endif -%}
        </figure>
      {%- endfor -%}
    </div>
  </div>
</section>

{% style %}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
{% endstyle %}

{% schema %}
{
  "name": "CT Lifestyle grid",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "anchor_id", "label": "Anchor id" },
    { "type": "text", "id": "kicker",  "label": "Kicker (eyebrow)", "default": "Made for real life" },
    { "type": "text", "id": "heading", "label": "Heading",          "default": "Use it anywhere they love to relax" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "header", "content": "Padding" },
    { "type": "range", "id": "padding_top",    "label": "Top padding",    "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 }
  ],
  "blocks": [
    {
      "type": "tile",
      "name": "Photo tile",
      "settings": [
        { "type": "image_picker", "id": "image",   "label": "Photo" },
        { "type": "text",         "id": "caption", "label": "Caption (overlay at bottom)" }
      ]
    }
  ],
  "max_blocks": 8,
  "presets": [ { "name": "CT Lifestyle grid" } ]
}
{% endschema %}
```

- [ ] **Step 2: Create the CSS file**

Create `assets/section-ct-lifestyle.css`:

```css
/* section-ct-lifestyle.css — 4-photo grid with caption overlay per cozyclaw-homepage.html §life */
.ct-life__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:var(--ct-mw, 1280px);margin:0 auto}
.ct-life__tile{position:relative;border-radius:var(--ct-r-md);overflow:hidden;margin:0}
.ct-life__tile img{width:100%;aspect-ratio:1/1;object-fit:contain;background:var(--ct-bg-surface);transition:transform .5s var(--ct-ease-out, cubic-bezier(.22,1,.36,1));display:block}
.ct-life__tile:hover img{transform:scale(1.05)}
.ct-life__tile figcaption{position:absolute;left:0;right:0;bottom:0;padding:14px;color:#fff;font-weight:600;font-size:14px;background:linear-gradient(transparent, rgba(46,36,29,.74))}
@media(max-width:760px){.ct-life__grid{grid-template-columns:1fr 1fr}}
@media(prefers-reduced-motion:reduce){.ct-life__tile img{transition:none}.ct-life__tile:hover img{transform:none}}
```

- [ ] **Step 3: Run theme check + commit**

```bash
shopify theme check 2>&1 | tail -3
git add sections/ct-lifestyle.liquid assets/section-ct-lifestyle.css
git commit -m "feat(ct-lifestyle): new section — 4-photo grid with caption overlay"
```

---

## Task 12: NEW section — ct-size-color-guide (product-bound)

**Goal:** Brand-new section: split layout binding to product variant featured images for the color swatches. Per spec §10 / design lines 178–190 / 514–530.

**Files:**
- Create: `sections/ct-size-color-guide.liquid`
- Create: `assets/section-ct-size-color-guide.css`

- [ ] **Step 1: Create the Liquid file**

Create `sections/ct-size-color-guide.liquid`:

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-size-color-guide.css' | asset_url | stylesheet_tag }}

{%- assign p = section.settings.product -%}

<section class="ct-guide color-{{ section.settings.color_scheme }} section-{{ section.id }}-padding" id="{{ section.settings.anchor_id }}">
  <div class="page-width">
    {%- if p == blank -%}
      <p class="ct-guide__warn"><em>Pick a product in the section settings to render the size & color guide.</em></p>
    {%- else -%}
      <div class="ct-guide__grid">
        <div class="ct-guide__col">
          {%- if section.settings.kicker != blank -%}<span class="ct-eyebrow">{{ section.settings.kicker }}</span>{%- endif -%}
          {%- if section.settings.heading != blank -%}<h2 class="ct-guide__h2">{{ section.settings.heading }}</h2>{%- endif -%}
          {%- if section.settings.body != blank -%}<p class="ct-lead">{{ section.settings.body }}</p>{%- endif -%}
          {%- assign color_opt_name = section.settings.color_option_name | default: 'Color' -%}
          {%- assign color_opt = nil -%}
          {%- for opt in p.options_with_values -%}
            {%- if opt.name == color_opt_name -%}{%- assign color_opt = opt -%}{%- endif -%}
          {%- endfor -%}
          {%- if color_opt != nil -%}
            <div class="ct-guide__swatches">
              {%- for color_value in color_opt.values -%}
                {%- assign matched_variant = nil -%}
                {%- for v in p.variants -%}
                  {%- if v.options contains color_value and matched_variant == nil -%}{%- assign matched_variant = v -%}{%- endif -%}
                {%- endfor -%}
                <div class="ct-guide__sw">
                  {%- if matched_variant != nil and matched_variant.featured_image != blank -%}
                    <img src="{{ matched_variant.featured_image | image_url: width: 240 }}" alt="{{ p.title }} in {{ color_value }}" loading="lazy">
                  {%- elsif p.featured_image != blank -%}
                    <img src="{{ p.featured_image | image_url: width: 240 }}" alt="{{ p.title }} in {{ color_value }}" loading="lazy">
                  {%- endif -%}
                  <span class="ct-guide__sw-label">{{ color_value }}</span>
                </div>
              {%- endfor -%}
            </div>
          {%- endif -%}
          {%- if section.settings.measuring_tip != blank -%}
            <p class="ct-guide__tip">{{ section.settings.measuring_tip }}</p>
          {%- endif -%}
        </div>
        <div class="ct-guide__col">
          {%- assign size_opt_name = section.settings.size_option_name | default: 'Size' -%}
          {%- assign size_opt = nil -%}
          {%- for opt in p.options_with_values -%}
            {%- if opt.name == size_opt_name -%}{%- assign size_opt = opt -%}{%- endif -%}
          {%- endfor -%}
          {%- if size_opt != nil -%}
            <div class="ct-guide__sizes">
              {%- for size_value in size_opt.values -%}
                {%- assign size_initial = size_value | slice: 0 | upcase -%}
                {%- assign size_desc = '' -%}
                {%- if size_initial == 'M' -%}{%- assign size_desc = section.settings.size_M_desc -%}{%- endif -%}
                {%- if size_initial == 'L' -%}{%- assign size_desc = section.settings.size_L_desc -%}{%- endif -%}
                {%- if size_initial == 'S' -%}{%- assign size_desc = section.settings.size_S_desc -%}{%- endif -%}
                {%- if size_initial == 'X' -%}{%- assign size_desc = section.settings.size_X_desc -%}{%- endif -%}
                <div class="ct-guide__size-card">
                  <span class="ct-guide__size-badge">{{ size_initial }}</span>
                  <div>
                    <b>{{ size_value }}</b>
                    {%- if size_desc != blank -%}<p>{{ size_desc }}</p>{%- endif -%}
                  </div>
                </div>
              {%- endfor -%}
            </div>
          {%- endif -%}
        </div>
      </div>
    {%- endif -%}
  </div>
</section>

{% style %}
  .section-{{ section.id }}-padding {
    padding-top: {{ section.settings.padding_top | times: 0.75 | round: 0 }}px;
    padding-bottom: {{ section.settings.padding_bottom | times: 0.75 | round: 0 }}px;
  }
  @media screen and (min-width: 750px) {
    .section-{{ section.id }}-padding {
      padding-top: {{ section.settings.padding_top }}px;
      padding-bottom: {{ section.settings.padding_bottom }}px;
    }
  }
{% endstyle %}

{% schema %}
{
  "name": "CT Size & color guide",
  "tag": "section",
  "class": "section",
  "disabled_on": { "groups": ["header", "footer"] },
  "settings": [
    { "type": "text", "id": "anchor_id", "label": "Anchor id" },
    { "type": "product", "id": "product", "label": "Product (REQUIRED)",
      "info": "Pulls color swatches from this product's color-option variant featured images and size cards from its size-option values." },
    { "type": "text", "id": "kicker",  "label": "Kicker (eyebrow)", "default": "Size & color guide" },
    { "type": "text", "id": "heading", "label": "Heading",          "default": "Find their perfect fit" },
    { "type": "textarea", "id": "body", "label": "Intro body" },
    { "type": "text", "id": "measuring_tip", "label": "Measuring tip" },
    { "type": "text", "id": "color_option_name", "label": "Color option name", "default": "Color", "info": "Must match the product option name exactly." },
    { "type": "text", "id": "size_option_name",  "label": "Size option name",  "default": "Size",  "info": "Must match the product option name exactly." },
    { "type": "header", "content": "Size descriptions" },
    { "type": "textarea", "id": "size_M_desc", "label": "Medium description" },
    { "type": "textarea", "id": "size_L_desc", "label": "Large description" },
    { "type": "textarea", "id": "size_S_desc", "label": "Small description (optional)" },
    { "type": "textarea", "id": "size_X_desc", "label": "Extra Large description (optional)" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "header", "content": "Padding" },
    { "type": "range", "id": "padding_top",    "label": "Top padding",    "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 120, "step": 4, "unit": "px", "default": 56 }
  ],
  "presets": [ { "name": "CT Size & color guide" } ]
}
{% endschema %}
```

- [ ] **Step 2: Create the CSS file**

Create `assets/section-ct-size-color-guide.css`:

```css
/* section-ct-size-color-guide.css — split swatches + sizes per cozyclaw-homepage.html §guide */
.ct-guide{background:var(--ct-bg-surface)}
.ct-guide__grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:40px;align-items:center;max-width:var(--ct-mw, 1280px);margin:0 auto}
.ct-guide__h2{font-family:var(--ct-font-display);font-size:30px;font-weight:600;color:var(--ct-text);margin:10px 0 6px;line-height:1.1}
.ct-guide__swatches{display:flex;gap:16px;margin:18px 0 8px}
.ct-guide__sw{text-align:center;font-size:13px;color:var(--ct-text-2);flex:1;max-width:130px}
.ct-guide__sw img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--ct-r-md);border:1px solid var(--ct-border-subtle);box-shadow:var(--ct-shadow-sm);margin:0 auto 8px;background:var(--ct-bg-raised)}
.ct-guide__sw-label{display:block}
.ct-guide__tip{font-size:13px;color:var(--ct-text-3);margin-top:14px}
.ct-guide__sizes{display:grid;gap:14px}
.ct-guide__size-card{background:var(--ct-bg-raised);border:1px solid var(--ct-border-subtle);border-radius:var(--ct-r-md);padding:20px 22px;display:flex;gap:18px;align-items:center}
.ct-guide__size-badge{width:54px;height:54px;border-radius:var(--ct-r-sm);background:var(--ct-accent);color:#fff;font-family:var(--ct-font-display);font-weight:700;font-size:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ct-guide__size-card b{font-size:16px;color:var(--ct-text);font-weight:600;display:block}
.ct-guide__size-card p{font-size:13.5px;color:var(--ct-text-2);margin:4px 0 0}
.ct-guide__warn{padding:24px;text-align:center;color:var(--ct-text-3);background:var(--ct-bg-raised);border:1px dashed var(--ct-border);border-radius:var(--ct-r-md);max-width:var(--ct-mw, 1280px);margin:0 auto}
@media(max-width:760px){.ct-guide__grid{grid-template-columns:1fr;gap:26px}}
```

- [ ] **Step 3: Run theme check + commit**

```bash
shopify theme check 2>&1 | tail -3
git add sections/ct-size-color-guide.liquid assets/section-ct-size-color-guide.css
git commit -m "feat(ct-size-color-guide): new section — product-bound swatches + size cards"
```

---

## Task 13: Footer enhancements

**Goal:** Add address line, signup CTA panel (Shopify-native `{% form 'customer' %}`), lock-icon "Secure checkout" element, and update 3 hardcoded copy strings. Per spec §18.

**Files:**
- Modify: `sections/footer.liquid`
- Modify: `assets/section-ct-footer.css`

- [ ] **Step 1: Update 3 hardcoded copy strings**

In `sections/footer.liquid`, search and replace these 3 strings (use exact match — they're literal strings in the Liquid markup):

```
"Founded to help cat parents make their fur babies' daily lives a little better — one cozy, well-made product at a time."
```
→
```
"Founded to help pet parents make their dogs' and cats' everyday lives a little cozier — one well-made product at a time."
```

```
>CozyClaw Mat<
```
→
```
>Cozy Plush Pet Sofa<
```

```
>Returns &amp; 7-Day Guarantee<
```
→
```
>Returns &amp; 30-Night Guarantee<
```

- [ ] **Step 2: Add address line inside `.ct-footer__brand-col`**

In `sections/footer.liquid`, find the existing `<a href="mailto:support@cozyclaw.com" class="ct-footer__mail">` line. Insert these 2 elements above it (after the existing `.ct-footer__tag` paragraph):

```liquid
{%- if section.settings.address != blank -%}
  <p class="ct-footer__address">
    <svg class="ct-footer__contact-ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s-7-5.2-7-11a7 7 0 0114 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>
    </svg>
    <span>{{ section.settings.address }}</span>
  </p>
{%- endif -%}
```

And wrap the existing `support@cozyclaw.com` text in a mail-icon span (replace the existing `<a class="ct-footer__mail">...</a>` element with):

```liquid
<a href="mailto:support@cozyclaw.com" class="ct-footer__mail">
  <svg class="ct-footer__contact-ic" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
  </svg>support@cozyclaw.com
</a>
```

- [ ] **Step 3: Add signup CTA panel between grid and bottom row**

In `sections/footer.liquid`, find the closing tag of `<div class="ct-footer__grid">...</div>`. Right after it (before `<div class="ct-footer__bottom">`), insert:

```liquid
{%- if section.settings.show_signup_cta -%}
  <div class="ct-footer__signup-cta">
    <div class="ct-footer__signup-text">
      <h3>{{ section.settings.signup_heading }}</h3>
      <p>{{ section.settings.signup_body }}</p>
    </div>
    {%- form 'customer', class: 'ct-footer__signup-form' -%}
      <input type="hidden" name="contact[tags]" value="newsletter">
      <input type="email" name="contact[email]" placeholder="Enter your email" aria-label="Email address" autocomplete="email" required>
      <button type="submit" class="ct-btn ct-btn--primary">
        {%- if form.posted_successfully? -%}
          {{ section.settings.signup_button_success | default: 'Subscribed ✓' }}
        {%- else -%}
          {{ section.settings.signup_button_label }}
        {%- endif -%}
      </button>
      {%- if form.errors -%}
        <small class="ct-footer__signup-err">Please enter a valid email address.</small>
      {%- endif -%}
    {%- endform -%}
  </div>
{%- endif -%}
```

- [ ] **Step 4: Add lock-icon "Secure checkout" inside `.ct-footer__bottom`**

In `sections/footer.liquid`, find `<div class="ct-footer__bottom">` and inside it, **before** the existing `<span class="ct-footer__pay">` element, insert:

```liquid
<span class="ct-footer__secure">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>
  </svg>Secure checkout
</span>
```

- [ ] **Step 5: Add 6 new schema settings**

In `sections/footer.liquid`'s `{% schema %}` `settings` array, append these objects (after the existing settings):

```json
{ "type": "header",   "content": "Brand column" },
{ "type": "textarea", "id": "address", "label": "Business address (shown with pin icon)",
  "default": "509 Byrum Rd, Chaparral, NM 88081, United States" },
{ "type": "header",   "content": "Signup CTA panel" },
{ "type": "checkbox", "id": "show_signup_cta", "label": "Show \"Join the cozy club\" panel", "default": true },
{ "type": "text",     "id": "signup_heading", "label": "Signup heading", "default": "Join the cozy club" },
{ "type": "text",     "id": "signup_body",    "label": "Signup body",    "default": "Get 15% off your first order, plus first dibs on new colors and cozy deals." },
{ "type": "text",     "id": "signup_button_label",   "label": "Signup button label", "default": "Sign up" },
{ "type": "text",     "id": "signup_button_success", "label": "Signup success label", "default": "Subscribed ✓" }
```

- [ ] **Step 6: Append CSS for the new footer elements**

Append to `assets/section-ct-footer.css`:

```css
/* footer additions — address + signup CTA + secure checkout per cozyclaw-homepage.html §footer */
.ct-footer__address{display:flex;align-items:flex-start;gap:8px;font-size:13px;color:var(--ct-text-2);margin-top:16px;line-height:1.5;max-width:32ch}
.ct-footer__contact-ic{width:16px;height:16px;stroke:var(--ct-accent);fill:none;stroke-width:1.8;flex-shrink:0}
.ct-footer__address .ct-footer__contact-ic{margin-top:2px}
.ct-footer__mail{display:inline-flex;align-items:center;gap:8px;color:var(--ct-accent-text);font-size:14.5px;font-weight:600;text-decoration:none;margin-top:14px}
.ct-footer__mail:hover{text-decoration:underline}
.ct-footer__signup-cta{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;background:var(--ct-accent-subtle);border:1px solid var(--ct-accent-border);border-radius:var(--ct-r-lg);padding:26px 30px;margin-top:56px}
.ct-footer__signup-text h3{font-family:var(--ct-font-display);font-size:21px;margin:0 0 4px;color:var(--ct-text);font-weight:600}
.ct-footer__signup-text p{font-size:14px;color:var(--ct-text-2);margin:0}
.ct-footer__signup-form{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0}
.ct-footer__signup-form input[type="email"]{min-height:var(--ct-touch, 48px);padding:0 18px;border-radius:var(--ct-r-pill);border:1px solid var(--ct-border);background:var(--ct-bg-raised);color:var(--ct-text);font-family:inherit;font-size:14.5px;min-width:230px}
.ct-footer__signup-form input[type="email"]:focus{outline:none;border-color:var(--ct-accent);box-shadow:0 0 0 3px var(--ct-accent-glow)}
.ct-footer__signup-err{display:block;width:100%;color:var(--ct-urgency);font-size:12.5px;margin-top:6px}
.ct-footer__secure{display:inline-flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--ct-text-2)}
.ct-footer__secure svg{width:15px;height:15px;stroke:var(--ct-success);fill:none;stroke-width:1.9}
@media(max-width:620px){
  .ct-footer__signup-cta{flex-direction:column;align-items:stretch}
  .ct-footer__signup-form{flex-direction:column;width:100%}
  .ct-footer__signup-form input[type="email"],.ct-footer__signup-form .ct-btn{width:100%}
}
```

- [ ] **Step 7: Run theme check + commit**

```bash
shopify theme check 2>&1 | tail -3
git add sections/footer.liquid assets/section-ct-footer.css
git commit -m "feat(footer): add address, signup CTA panel, secure checkout indicator + honesty fixes"
```

---

## Task 14: Re-wire `templates/index.json` (the big one)

**Goal:** Replace `templates/index.json` with the new 17-section homepage. All content seeded per spec §"Content seeds" verbatim. All 26 honesty-cleanup items resolved.

**Files:**
- Modify: `templates/index.json`

This task has one big step plus verification. The new file is long but every block content is sourced from the spec — refer to `docs/superpowers/specs/2026-06-04-homepage-redesign-design.md` §"Content seeds" for every text value.

- [ ] **Step 1: Replace `templates/index.json` with the new 17-section structure**

Write the new `templates/index.json` with sections in this order (and each section's settings/blocks per the spec content seeds):

```json
{
  "sections": {
    "ct_hero": {
      "type": "ct-hero",
      "settings": {
        "layout": "split-photo",
        "product": "cozy-plush-pet-sofa",
        "anchor_id": "buy",
        "eyebrow": "The plush sofa-bed for dogs & cats",
        "heading": "Their favorite spot.",
        "h1_em": "Your cleaner sofa.",
        "subheading": "CozyClaw's deep, pillow-edged pet sofa is soft enough that they'll finally pick their own bed over your couch — keeping the fur, dander, and claws off your furniture.",
        "button_label": "Shop CozyClaw",
        "button_link": "#bundle",
        "button_label_2": "See sizes & colors",
        "button_link_2": "#guide",
        "trust_line": "★★★★★ 4.9/5 · 13 reviews | ✓ 30-night trial | ✓ Free shipping $75+",
        "sale_badge": "",
        "price_now": "",
        "price_was": "",
        "price_save_label": "",
        "rating_text": "",
        "availability_text": "",
        "color_scheme": "scheme-1",
        "padding_top": 0,
        "padding_bottom": 0
      }
    },
    "ct_trust_strip": {
      "type": "ct-trust-bar",
      "settings": { "layout": "icon-strip", "color_scheme": "scheme-1" },
      "blocks": {
        "c1": { "type": "chip", "settings": { "icon": "paw-fleece", "title": "Cloud-soft coral fleece", "subtitle": "Cozy on every paw" } },
        "c2": { "type": "chip", "settings": { "icon": "bed-edge",   "title": "Raised pillow edges",     "subtitle": "A built-in head-rest" } },
        "c3": { "type": "chip", "settings": { "icon": "couch-hair", "title": "Helps keep sofas hair-free","subtitle": "Fur stays on the bed" } },
        "c4": { "type": "chip", "settings": { "icon": "wash-clock", "title": "Machine-washable",         "subtitle": "Fresh in one cycle" } }
      },
      "block_order": ["c1","c2","c3","c4"]
    },
    "ct_ba": {
      "type": "ct-ba",
      "settings": {
        "kicker": "",
        "heading": "",
        "before_image": "shopify://shop_images/S6bf961fb4e8a48729f92fa08354ca682O.webp",
        "after_image":  "shopify://shop_images/Sc68ba0bf97fc446882fe68d55365fbf6p.webp",
        "before_tag": "Before",
        "after_tag": "After",
        "before_label": "Fur, dander & claws all over your sofa",
        "after_label": "Their own cozy, washable spot",
        "color_scheme": "scheme-1",
        "padding_top": 40,
        "padding_bottom": 40
      }
    },
    "ct_ps": {
      "type": "ct-problem-solution",
      "settings": { "color_scheme": "scheme-1", "padding_top": 0, "padding_bottom": 56 },
      "blocks": {
        "prob": {
          "type": "card",
          "settings": {
            "variant": "problem",
            "tag_label": "The problem",
            "heading": "They love your sofa. It doesn't love them back.",
            "bullets": "Fur and dander work their way deep into your cushions.\nClaws catch and pull at the fabric weave over time.\nEvery evening turns into the same \"scoot over\" standoff.\nThey don't have a spot that's truly, only theirs."
          }
        },
        "sol": {
          "type": "card",
          "settings": {
            "variant": "solution",
            "tag_label": "The solution",
            "heading": "A spot they'll claim. A home you'll keep clean.",
            "bullets": "A bed so plush they choose it over your couch.\nFur collects on a bed you can toss in the wash.\nGentle on paws, and far easier on your furniture.\nTheir own cozy corner — in tones that match your room."
          }
        }
      },
      "block_order": ["prob","sol"]
    },
    "ct_why": {
      "type": "ct-pillars",
      "settings": { "layout": "pillars-svg", "anchor_id": "why", "kicker": "Why pet parents love it", "heading": "Comfort for them, peace of mind for you", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 },
      "blocks": {
        "p1": { "type": "pillar", "settings": { "icon_svg": "heart-paw",    "name": "Ultra-soft & cozy",     "desc": "A dense coral-fleece surface over thick padding cushions tired joints and holds in warmth on cold mornings." } },
        "p2": { "type": "pillar", "settings": { "icon_svg": "bed-bolster",  "name": "Secure & supportive",   "desc": "Raised bolster edges double as a head-rest and a wall, giving anxious or older pets a safe place to settle." } },
        "p3": { "type": "pillar", "settings": { "icon_svg": "shield-couch", "name": "Protects your furniture","desc": "When they have a spot they prefer, you get fewer hairs on the couch, less scratching, and cleaner cushions." } },
        "p4": { "type": "pillar", "settings": { "icon_svg": "star",         "name": "Stylish & neutral",     "desc": "Coffee, Grey, and Black tones blend into a modern home instead of shouting \"pet stuff\" from the corner." } },
        "p5": { "type": "pillar", "settings": { "icon_svg": "wash-clock",   "name": "Easy to clean",         "desc": "The whole bed goes straight in the machine and comes out soft and fluffy — ready for the next nap." } },
        "p6": { "type": "pillar", "settings": { "icon_svg": "check-double", "name": "Built to last",         "desc": "Reinforced seams and a resilient high-loft fill keep their shape and bounce, wash after wash." } }
      },
      "block_order": ["p1","p2","p3","p4","p5","p6"]
    },
    "ct_features": {
      "type": "ct-features-grid",
      "settings": { "anchor_id": "features", "kicker": "Thoughtfully designed", "heading": "Beautifully made, down to the seam", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 },
      "blocks": {
        "f1": { "type": "feature", "settings": { "image": "shopify://shop_images/S406fffa8c67d4e68b36a83ae663911b0y.webp", "title": "Plush coral-fleece top", "description": "A deep, faux-fur surface that feels like a favorite blanket — and stays that soft after every wash." } },
        "f2": { "type": "feature", "settings": { "image": "shopify://shop_images/Sb75526b52f8d43f397981f334b909aafF.webp", "title": "Raised bolster edges", "description": "Cushioned sides work as both a pillow and a wall, so they can curl up tight or stretch right out." } },
        "f3": { "type": "feature", "settings": { "image": "shopify://shop_images/Sbf704be07ddd4c10adad72633a594629S.webp", "title": "Non-slip base", "description": "A grippy underside keeps the bed planted on floors, sofas, and slick surfaces — no sliding mid-zoomies." } },
        "f4": { "type": "feature", "settings": { "image": "shopify://shop_images/S4266af0b5e144b3abc9d082ad02705f0R.webp", "title": "Machine washable", "description": "The whole bed goes straight in the wash and comes back soft and fluffy — no fuss, no special care." } }
      },
      "block_order": ["f1","f2","f3","f4"]
    },
    "ct_marquee": {
      "type": "ct-marquee",
      "settings": { "style": "italic-divider", "speed": 22, "color_scheme": "scheme-1" },
      "blocks": {
        "m1": { "type": "message", "settings": { "text": "Made for happy dogs & cats" } },
        "m2": { "type": "message", "settings": { "text": "Cozier naps" } },
        "m3": { "type": "message", "settings": { "text": "Cleaner sofas" } },
        "m4": { "type": "message", "settings": { "text": "A spot of their own" } }
      },
      "block_order": ["m1","m2","m3","m4"]
    },
    "ct_life": {
      "type": "ct-lifestyle",
      "settings": { "kicker": "Made for real life", "heading": "Use it anywhere they love to relax", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 },
      "blocks": {
        "l1": { "type": "tile", "settings": { "image": "shopify://shop_images/Sc68ba0bf97fc446882fe68d55365fbf6p.webp", "caption": "On the sofa" } },
        "l2": { "type": "tile", "settings": { "image": "shopify://shop_images/S0d4e7241dbca4bf1a06b87479b1166dfS.webp", "caption": "On the floor" } },
        "l3": { "type": "tile", "settings": { "image": "shopify://shop_images/S2a381fdd19594af290b618eb14be07a5I.webp", "caption": "By the window" } },
        "l4": { "type": "tile", "settings": { "image": "shopify://shop_images/S6bf961fb4e8a48729f92fa08354ca682O.webp", "caption": "In their cozy corner" } }
      },
      "block_order": ["l1","l2","l3","l4"]
    },
    "ct_guide": {
      "type": "ct-size-color-guide",
      "settings": {
        "anchor_id": "guide",
        "product": "cozy-plush-pet-sofa",
        "kicker": "Size & color guide",
        "heading": "Find their perfect fit",
        "body": "Three neutral colors, two roomy sizes. Pick the shade that suits your space and the size that suits your pet.",
        "measuring_tip": "Tip: measure your pet nose-to-tail while they're curled up, then add 4–6″ of breathing room.",
        "color_option_name": "Color",
        "size_option_name": "Size",
        "size_M_desc": "Best for cats and small dogs — a snug spot for curling up.",
        "size_L_desc": "Best for medium and larger dogs, or any pet who loves to sprawl.",
        "color_scheme": "scheme-1",
        "padding_top": 56,
        "padding_bottom": 56
      }
    },
    "ct_compare": {
      "type": "ct-compare",
      "settings": {
        "kicker": "How it compares",
        "heading": "CozyClaw vs. the rest",
        "feature_label": "Feature",
        "brand_label": "CozyClaw Sofa-Bed",
        "col2_label": "Regular Blanket",
        "col3_label": "Basic Pet Mat",
        "color_scheme": "scheme-1",
        "padding_top": 56,
        "padding_bottom": 56
      },
      "blocks": {
        "r1": { "type": "row", "settings": { "feature": "Cloud-soft coral fleece",     "brand_type": "check", "col2_type": "text", "col2_text": "Sometimes", "col3_type": "cross" } },
        "r2": { "type": "row", "settings": { "feature": "Raised supportive edges",     "brand_type": "check", "col2_type": "cross", "col3_type": "cross" } },
        "r3": { "type": "row", "settings": { "feature": "Helps keep sofas hair-free",  "brand_type": "check", "col2_type": "text", "col2_text": "Limited", "col3_type": "text", "col3_text": "Sometimes" } },
        "r4": { "type": "row", "settings": { "feature": "Machine-washable cover",      "brand_type": "check", "col2_type": "text", "col2_text": "Limited", "col3_type": "text", "col3_text": "Limited" } },
        "r5": { "type": "row", "settings": { "feature": "Non-slip bottom",             "brand_type": "check", "col2_type": "cross", "col3_type": "text", "col3_text": "Sometimes" } },
        "r6": { "type": "row", "settings": { "feature": "Stylish, home-friendly look", "brand_type": "check", "col2_type": "cross", "col3_type": "text", "col3_text": "Limited" } },
        "r7": { "type": "row", "settings": { "feature": "Holds shape over time",       "brand_type": "check", "col2_type": "text", "col2_text": "Low",     "col3_type": "text", "col3_text": "Low" } }
      },
      "block_order": ["r1","r2","r3","r4","r5","r6","r7"]
    },
    "ct_materials": {
      "type": "ct-aplus",
      "settings": { "layout": "materials-care", "anchor_id": "story", "kicker": "Materials & care", "heading": "What it's made of — and how to keep it fresh", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 },
      "blocks": {
        "mc1": { "type": "banner", "settings": { "title": "Inside & out", "specs_rows": "Cover | Soft coral fleece\nFill | Thick high-loft padding\nBase | Non-slip backing\nBest for | Dogs & cats\nColors | Coffee · Grey · Black\nSizes | 60×80 & 80×90 cm" } },
        "mc2": { "type": "banner", "settings": { "title": "Care in three steps", "specs_rows": "1 · Brush off | Lift loose fur with a glove brush\n2 · Wash | Machine wash cold, gentle\n3 · Dry | Air-dry or tumble low", "body": "The fleece keeps its softness and the fill keeps its loft, so it comes out feeling brand new — wash after wash." } }
      },
      "block_order": ["mc1","mc2"]
    },
    "ct_reviews": {
      "type": "ct-reviews",
      "settings": { "anchor_id": "reviews", "kicker": "", "heading": "", "rating_number": "4.9", "rating_count": "Based on 13 reviews", "layout": "grid", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 },
      "blocks": {
        "rv1": { "type": "review", "settings": { "rating": 5, "text": "He used to take over the entire couch. Now he goes straight to his CozyClaw the moment we sit down — and the cushions finally stay clean.", "author": "Megan R.", "meta": "Verified buyer · Golden mix", "verified": true } },
        "rv2": { "type": "review", "settings": { "rating": 5, "text": "My cat picked her spot in about five minutes flat. She loves nesting against the raised edge. Washes beautifully too.", "author": "Jordan P.", "meta": "Verified buyer · Tabby cat", "verified": true } },
        "rv3": { "type": "review", "settings": { "rating": 4, "text": "Really comfy and looks great in Coffee. It took a day out of the box to fully fluff up, but after that it's perfect.", "author": "Alicia N.", "meta": "Verified buyer · Two dogs", "verified": true } },
        "rv4": { "type": "review", "settings": { "rating": 5, "text": "Worth it for the bolster edges alone. My senior boy rests his head on them and settles right down for the night.", "author": "David L.", "meta": "Verified buyer · Senior lab", "verified": true } }
      },
      "block_order": ["rv1","rv2","rv3","rv4"]
    },
    "ct_guarantee": {
      "type": "ct-aplus",
      "settings": { "layout": "guarantee-4", "kicker": "", "heading": "", "color_scheme": "scheme-1", "padding_top": 0, "padding_bottom": 56 },
      "blocks": {
        "g1": { "type": "banner", "settings": { "icon_svg": "shield", "title": "30-night trial",     "body": "Sleep on it. If it's not their spot, send it back." } },
        "g2": { "type": "banner", "settings": { "icon_svg": "truck",  "title": "Free shipping $75+", "body": "Fast, tracked delivery on qualifying orders." } },
        "g3": { "type": "banner", "settings": { "icon_svg": "box",    "title": "Easy returns",       "body": "A simple, no-drama return process if you need it." } },
        "g4": { "type": "banner", "settings": { "icon_svg": "lock",   "title": "Secure checkout",    "body": "Encrypted payment with trusted providers." } }
      },
      "block_order": ["g1","g2","g3","g4"]
    },
    "ct_bundle": {
      "type": "ct-pricing",
      "settings": {
        "layout": "tier-pair",
        "anchor_id": "bundle",
        "kicker": "Bundle & save",
        "heading": "Pick their cozy setup",
        "subheading": "Most homes have more than one favorite napping spot. Add a second bed and the whole order ships free.",
        "addons_label": "Complete their setup — optional add-ons",
        "color_scheme": "scheme-1",
        "padding_top": 56,
        "padding_bottom": 56
      },
      "blocks": {
        "plan1": {
          "type": "plan",
          "settings": {
            "featured": false,
            "product": "cozy-plush-pet-sofa",
            "name": "Single Cozy Spot",
            "sub": "One plush sofa-bed",
            "image": "shopify://shop_images/Sc68ba0bf97fc446882fe68d55365fbf6p.webp",
            "features": "One bed in your chosen color & size\n30-night risk-free trial",
            "price_fallback": "$22.82",
            "button_label": "Choose single",
            "button_link": "#buy"
          }
        },
        "plan2": {
          "type": "plan",
          "settings": {
            "featured": true,
            "product": "cozy-plush-pet-sofa",
            "name": "Double Comfort",
            "sub": "Two beds for every favorite spot",
            "badge": "Most popular · ships free",
            "image": "shopify://shop_images/S2a381fdd19594af290b618eb14be07a5I.webp",
            "features": "Two beds — mix colors & sizes freely\n**FREE shipping on the whole order**\n30-night risk-free trial",
            "price_fallback": "$45.64",
            "button_label": "Choose double",
            "button_link": "#buy"
          }
        },
        "addon1": { "type": "addon", "settings": { "product": "chompclean-toy",           "desc": "A squeaky chew that keeps playtime on their bed." } },
        "addon2": { "type": "addon", "settings": { "product": "pet-deshedding-glove-brush","desc": "Lifts loose fur before it ever reaches your sofa." } }
      },
      "block_order": ["plan1","plan2","addon1","addon2"]
    },
    "ct_faq": {
      "type": "ct-faq",
      "settings": { "anchor_id": "faq", "kicker": "Good to know", "heading": "Frequently asked questions", "color_scheme": "scheme-1", "padding_top": 56, "padding_bottom": 56 },
      "blocks": {
        "q1": { "type": "item", "settings": { "question": "What size should I choose?", "answer": "<p>Measure your pet nose-to-tail while they're curled up and add about 4–6 inches. Medium is 60×80 cm (24″×31″) and suits cats and small dogs; Large is 80×90 cm (31″×35″) for medium and larger dogs, or any pet who loves to sprawl.</p>" } },
        "q2": { "type": "item", "settings": { "question": "Is it machine washable?", "answer": "<p>Yes. The whole bed is machine-washable on a cold, gentle cycle. Air-dry or tumble on low and it comes back soft and fluffy.</p>" } },
        "q3": { "type": "item", "settings": { "question": "Is it safe for puppies and kittens?", "answer": "<p>It's designed for dogs and cats of all ages. The soft, supportive edges are especially comforting for young or older pets. As with any bed, supervise heavy chewers.</p>" } },
        "q4": { "type": "item", "settings": { "question": "What is it made of?", "answer": "<p>A soft coral-fleece cover over thick high-loft padding, with a non-slip backing underneath to keep it in place on floors and furniture.</p>" } },
        "q5": { "type": "item", "settings": { "question": "Will it stay put on my sofa?", "answer": "<p>The grippy non-slip base helps it stay planted on most sofas, floors, and slick surfaces, so it won't slide around when they hop on and off.</p>" } },
        "q6": { "type": "item", "settings": { "question": "What is your return policy?", "answer": "<p>Every CozyClaw comes with a 30-night risk-free trial. If it isn't their new favorite spot, reach out to support@cozyclaw.com and we'll help with a return. Free shipping applies to orders over $75.</p>" } }
      },
      "block_order": ["q1","q2","q3","q4","q5","q6"]
    },
    "ct_final": {
      "type": "ct-final-cta",
      "settings": {
        "eyebrow": "A cozier pet, a cleaner home",
        "heading": "Give them their favorite spot.",
        "subheading": "Give your dog or cat a cozier spot of their own and keep your home a little tidier — backed by a 30-night risk-free trial and free shipping over $75.",
        "price_now": "",
        "price_was": "",
        "price_save_label": "",
        "button_label": "Shop CozyClaw now",
        "button_link": "#bundle",
        "button_label_2": "",
        "show_trust": false,
        "trust_chips": "",
        "color_scheme": "scheme-1",
        "padding_top": 56,
        "padding_bottom": 56
      }
    },
    "ct_sticky_atc": {
      "type": "ct-sticky-atc",
      "settings": {
        "product": "cozy-plush-pet-sofa",
        "image": "",
        "emoji": "",
        "product_name": "",
        "rating_text": "★★★★★ 92% 5-star · 13 reviews",
        "button_label": "",
        "button_link": "",
        "color_scheme": "scheme-1"
      }
    }
  },
  "order": [
    "ct_hero",
    "ct_trust_strip",
    "ct_ba",
    "ct_ps",
    "ct_why",
    "ct_features",
    "ct_marquee",
    "ct_life",
    "ct_guide",
    "ct_compare",
    "ct_materials",
    "ct_reviews",
    "ct_guarantee",
    "ct_bundle",
    "ct_faq",
    "ct_final",
    "ct_sticky_atc"
  ]
}
```

**IMPORTANT** about the `shopify://shop_images/...` paths in the JSON: these are placeholders. The actual `image_picker` setting stores either an empty string or a Shopify file-resource URI. After this commit, open the section in the Theme Editor at `https://ap0nn0-it.myshopify.com/admin/themes/187052065064/editor?hr=9292` and re-pick each image from the merchant's actual asset library. The placeholder strings here are documentation hints — Shopify will treat unknown URIs as blank and the Liquid `{% if image != blank %}` guards will hide the broken image element until a real one is picked.

- [ ] **Step 2: Update ct-announce content in header-group.json**

The `ct-announce` section lives in `sections/header-group.json` (not `templates/index.json`). Open `sections/header-group.json` and update the ct-announce instance:

- Add `"display": "static-row"` to its settings
- Replace its 2 existing blocks with 3 new ones (text values from spec):

```json
"display": "static-row",
"dismissible": false,
...
"blocks": {
  "m1": { "type": "message", "settings": { "text": "🚚 Free shipping on orders $75+" } },
  "m2": { "type": "message", "settings": { "text": "🌙 30-night risk-free trial" } },
  "m3": { "type": "message", "settings": { "text": "🐾 A cozy spot for dogs & cats" } }
},
"block_order": ["m1","m2","m3"]
```

- [ ] **Step 3: Run theme check**

```bash
shopify theme check 2>&1 | tail -3
```

Expected: 10 offenses (unchanged).

- [ ] **Step 4: Curl homepage + verify each section is rendered**

```bash
curl -s http://127.0.0.1:9292/ -o /tmp/home.html
echo "Sections present:"
for s in ct-hero-split ct-trust-strip ct-ba ct-ps ct-pillars-svg ct-features ct-marquee ct-life ct-guide ct-compare ct-aplus--materials ct-reviews ct-aplus--guarantee ct-tier-pair ct-faq ct-final ct-sticky-atc; do
  count=$(grep -c "class=\"$s" /tmp/home.html)
  echo "  $s: $count"
done
echo "Honesty fixes (should all be 0):"
for stale in '2,175 sold' 'LOVED BY THOUSANDS' '15,000+' 'Save 20%' 'Save \$12.98' 'Free shipping over \$50' '7-Day Guarantee' 'CozyClaw Mat'; do
  count=$(grep -c "$stale" /tmp/home.html)
  echo "  '$stale': $count"
done
```

Expected: every section count ≥ 1; every honesty-fix count = 0. If any section is 0, check that section's task was completed correctly. If any honesty-fix is ≥1, find where it leaked.

- [ ] **Step 5: Commit**

```bash
git add templates/index.json sections/header-group.json
git commit -m "feat(index): re-wire homepage to 17-section dark-coffee layout per spec §5"
```

---

## Task 15: Logo SVG recolor

**Goal:** Update the 3 logo SVG files from terracotta to dark coffee `#5A3E2B`. Per spec §8 item 7.

**Files:**
- Modify: `assets/cozyclaw-logo.svg`
- Modify: `assets/cozyclaw-logo-icon.svg`
- Modify: `assets/cozyclaw-logo-reversed.svg`

- [ ] **Step 1: Find every terracotta hex in the SVGs**

```bash
grep -nE "#BC5A38|#9A4424|#5C3A21|#3F2614|#6D3FC4" "assets/cozyclaw-logo.svg" "assets/cozyclaw-logo-icon.svg" "assets/cozyclaw-logo-reversed.svg"
```

This shows you exactly which `fill=` or `stroke=` attributes need swapping in which files.

- [ ] **Step 2: Edit each SVG to replace terracotta with dark coffee `#5A3E2B`**

For each match in Step 1, replace the hex value with `#5A3E2B`. Pattern (per file):
- The "Cozy" wordmark / icon stroke → `#5A3E2B`
- The "Claw" accent paw → `#5A3E2B` (same color — they were the same brand-accent in earlier palettes; spec says one dark-coffee color)
- For `cozyclaw-logo-reversed.svg`: only the DARK fills change to `#5A3E2B`; any light fills (`#FFFFFF`, `#FBF6F0`) stay as-is so the logo remains light-on-dark.

- [ ] **Step 3: Verify**

```bash
grep -nE "#BC5A38|#9A4424|#5C3A21|#3F2614|#6D3FC4" "assets/cozyclaw-logo.svg" "assets/cozyclaw-logo-icon.svg" "assets/cozyclaw-logo-reversed.svg"
```

Expected: no matches (all terracotta replaced with dark coffee).

- [ ] **Step 4: Run theme check + commit**

```bash
shopify theme check 2>&1 | tail -3
git add assets/cozyclaw-logo.svg assets/cozyclaw-logo-icon.svg assets/cozyclaw-logo-reversed.svg
git commit -m "feat(logo): recolor terracotta to dark coffee #5A3E2B per spec §8"
```

---

## Task 16: Final verification

**Goal:** Confirm theme-check baseline holds, PDP didn't regress, all 26 honesty fixes are live, and visual responsive sanity at the design's breakpoints.

**Files:** none modified.

- [ ] **Step 1: Theme-check baseline**

```bash
shopify theme check 2>&1 | tail -8
```

Expected last line: `198 files inspected with 10 total offenses found across 7 files. 2 errors. 8 warnings.` If it shifted, look at which files added/removed offenses.

- [ ] **Step 2: PDP regression check**

```bash
curl -s http://127.0.0.1:9292/products/cozy-plush-pet-sofa -o /tmp/pdp-after.html
wc -l /tmp/pdp-after.html
diff <(wc -l < /tmp/pdp-baseline.html) <(wc -l < /tmp/pdp-after.html)
```

Expected: line counts within ±5. Big shift means a PDP-shared section regressed.

- [ ] **Step 3: Honesty cleanup verification**

```bash
curl -s http://127.0.0.1:9292/ -o /tmp/home.html
echo "Stale claims that should all be ZERO:"
for stale in '2,175 sold' 'LOVED BY THOUSANDS' 'thousands of kitties' '15,000+' 'Save 20%' 'Save \$12.98' 'Save \$5.98' '\$44.97' '\$26.97' 'Free shipping over \$50' '7-Day Guarantee' '7-day money-back' 'CozyClaw Mat' 'cat parents make their fur babies' '92% 5-star · 13 verified reviews' 'Biggest savings today' 'Best-selling combo'; do
  count=$(grep -c "$stale" /tmp/home.html)
  if [ "$count" != "0" ]; then echo "  ⚠ '$stale': $count"; else echo "  ✓ '$stale': 0"; fi
done
```

Expected: every line prefixed with ✓ (count 0). Any ⚠ line means that honesty fix didn't land.

- [ ] **Step 4: Live trust-line / new copy verification**

```bash
echo "New copy (should each show ≥ 1):"
for new in 'Their favorite spot' 'Your cleaner sofa' '30-night risk-free trial' 'Free shipping on orders \$75' 'A cozy spot for dogs & cats' 'Single Cozy Spot' 'Double Comfort' 'Most popular · ships free' 'Cozy Plush Pet Sofa' 'Based on 13 reviews' '4.9 out of 5' 'Made for happy dogs & cats'; do
  count=$(grep -c "$new" /tmp/home.html)
  if [ "$count" = "0" ]; then echo "  ⚠ '$new': MISSING"; else echo "  ✓ '$new': $count"; fi
done
```

Expected: every line ✓.

- [ ] **Step 5: Visual responsive sanity in browser**

Open http://127.0.0.1:9292 in a real browser and verify at these widths:
- **≥1280px (desktop)**: hero shows split layout (text left, photo right with soft mask), pillars 3×2, features 4-col, lifestyle 4-col, bundle 2-col, guarantee 4-col
- **860px**: hero stacks photo-on-top text-below; pillars become 2-col; features 2-col; trust-strip 2×2
- **760px**: lifestyle 2-col; guarantee 2×2; problem/solution single-col
- **620px**: footer signup CTA stacks vertical (heading above form)
- **560px**: pillars 1-col; announce static-row wraps; sticky-atc text shrinks

Spot-check: dark-coffee buttons render as `#5A3E2B`; eyebrows render `#4E3526`; accent-subtle panels render `#F1E8DE` cream tint; footer signup panel uses accent-subtle bg.

- [ ] **Step 6: Other-template regression check (smoke)**

```bash
for url in /products/cozy-plush-pet-sofa /pages/contact /pages/faq /pages/about; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9292$url)
  echo "$url → $code"
done
```

Expected: every URL → 200. 404 is acceptable for pages the merchant hasn't created. 500 means the PDP-shared section changes broke something.

- [ ] **Step 7: No commit** — verification only.

---

## Self-review

After writing the plan above, scanning for issues:

**Spec coverage:** Each of the 17 spec §5 sections has a task that implements it: hero (T1), trust-strip (T4), ba (template), problem-solution (T9), pillars (T5), features (T10), marquee (T6), lifestyle (T11), guide (T12), compare (template), materials (T3), reviews (template), guarantee (T3), bundle (T2), faq (template), final-cta (template), sticky-atc (T8). Footer enhancements (T13). Announce (T7 schema + template content). Logo recolor (T15). Honesty cleanup (T14 step 4 + T16 step 3). All 26 honesty fixes have a verification grep in T16.

**Placeholder scan:** No "TBD" / "TODO" / "FIXME" / "implement later" / "similar to Task N" patterns. Every step shows the actual JSON / Liquid / CSS / shell to run.

**Type consistency:** Layout option names used consistently: `split-photo` (T1, T14), `tier-pair` (T2, T14), `materials-care` + `guarantee-4` (T3, T14), `icon-strip` (T4, T14), `pillars-svg` (T5, T14), `italic-divider` (T6, T14), `static-row` (T7, T14). Class names consistent: `ct-hero-split`, `ct-tier-pair`, `ct-aplus--materials`, `ct-aplus--guarantee`, `ct-trust-strip`, `ct-pillars-svg`, `ct-marquee[data-style="italic-divider"]`, `ct-announce--static-row`, `ct-ps`, `ct-features`, `ct-life`, `ct-guide`. Block field names consistent across tasks (e.g. `icon_svg` defined in T3 for `banner`, T5 for `pillar`; `specs_rows` in T3 only).

**Acceptance criteria** (from spec §"Acceptance criteria"): all 7 criteria mapped to T16 verification steps.

No issues found.

---

## Execution

Plan saved to `docs/superpowers/plans/2026-06-04-homepage-redesign.md`. 17 tasks — Pre-flight + 13 implementation tasks + Final verification.
