# CozyClaw Homepage Redesign (Dogs + Cats · Dark Coffee) — Design

**Date:** 2026-06-04
**Status:** Approved (ready for plan)
**Source artifact:** `files/cozyclaw-homepage.html` (786-line reference HTML) + `files/cozyclaw-homepage-spec.md` (authoritative section/copy/hard-rules spec).
**Builds on:** `feat/minimals-foundation`, HEAD at the start of this work has the dark-coffee token swap already applied to `snippets/css-variables.liquid` + `config/settings_schema.json` + `config/settings_data.json` (`#5A3E2B` / `#43301F` / `#4E3526` / `#F1E8DE` / `#D9C7B4` / `rgba(90,62,43,.24)` — spec §4 exact values).

## Goal

Bring `templates/index.json` to 100% alignment with `cozyclaw-homepage.html` (17 body sections in spec §5 order), while:
1. **Honoring spec §2 hard rules** — strip every fabricated discount / inflated social-proof claim.
2. **Not breaking the PDP** — `templates/product.json` shares 5 ct-* sections; all PDP-shared changes are additive (new layout options, default unchanged).
3. **Reusing existing sections wherever the audit confirmed structural fit** (3 sections reused content-only via template — `ct-ba`, `ct-compare`, `ct-faq`; 2 sections reused via template flag toggles — `ct-reviews`, `ct-final-cta`; 7 sections get a new layout/style option — `ct-hero`, `ct-pricing`, `ct-aplus` (×2), `ct-trust-bar`, `ct-pillars`, `ct-marquee`, `ct-announce`; 1 section (`ct-sticky-atc`) gets a small additive enhancement; 1 section (`footer`) gets additive enhancements; 4 brand-new sections — `ct-problem-solution`, `ct-features-grid`, `ct-lifestyle`, `ct-size-color-guide`).
4. **Binding live product data** for hero photo, size+color guide, bundle tier prices, sticky ATC (per `cozyclaw-homepage-spec.md` §7 mapping).

## Decisions (locked during brainstorming)

- **Phasing:** single PR / one phase (like P6). Index template stays mid-rebuild internally; ships when everything is in.
- **Data binding strategy:** bind to live product variants where the spec calls for it (size+color guide, hero photo fallback, bundle pricing, sticky ATC); admin-edited image/text settings everywhere else.
- **Token sync:** flipped 6 brand-color hex values to spec §4 exact values (done at brainstorming time; not part of this implementation plan).
- **PDP-shared sections (5):** additive layout options only — `ct-trust-bar`, `ct-pillars`, `ct-marquee`, `ct-reviews`, `ct-final-cta`. Defaults stay so PDP renders identically.
- **Homepage-only sections (3):** full freedom — `ct-hero`, `ct-pricing`, `ct-aplus` get new layouts side-by-side with existing defaults.
- **Brand-new sections (4):** `ct-problem-solution`, `ct-features-grid`, `ct-lifestyle`, `ct-size-color-guide`.
- **Footer:** enhance existing `sections/footer.liquid` (already custom, has 4-col grid + payment row); add address textarea, signup CTA panel using `{% form 'customer' %}`, lock-icon "Secure checkout" text.
- **Header:** untouched in code; nav items managed in Shopify admin menu.
- **Unused existing sections** (`ct-hero-split`, `ct-stats`, `ct-journey`, `ct-product-tabs`, `ct-email`): kept as code (theme editor still lists them); just removed from `templates/index.json`.
- **Theme-check invariant:** must stay at **10 offenses** (matches current baseline after dark-coffee swap).

## Deliverables

1. **Modified Liquid sections (9 actual file changes):**
   - `sections/ct-hero.liquid` — add `layout: "split-photo"` + `hero_image` + `h1_em` + `trust_line` settings
   - `sections/ct-pricing.liquid` — add `layout: "tier-pair"` + `addons_label` setting + new `addon` block type + per-plan `features` textarea field
   - `sections/ct-aplus.liquid` — add `layout: "materials-care"` + `layout: "guarantee-4"` + `specs_rows` block field
   - `sections/ct-trust-bar.liquid` — add `layout: "icon-strip"` + `title` / `subtitle` block fields; extend icon library with 4 pet-specific icons (`paw-fleece`, `bed-edge`, `couch-hair`, `wash-clock`)
   - `sections/ct-pillars.liquid` — add `layout: "pillars-svg"` + `icon_svg` block select; inline 6-icon SVG library
   - `sections/ct-marquee.liquid` — add `style: "italic-divider"`
   - `sections/ct-announce.liquid` — add `display: "static-row"`
   - `sections/ct-sticky-atc.liquid` — add `image` (image_picker) setting + Liquid render with `product.featured_image` fallback; update misleading schema defaults (`product_name: "CozyClaw Mat"` → blank, `button_label: "from $149 →"` → `"Add to Cart"`, `emoji: "💪"` → blank — image now preferred over emoji)
   - `sections/footer.liquid` — add `address` textarea, `show_signup_cta` + signup heading/body/button settings, `{% form 'customer' %}` panel with hidden `contact[tags]=newsletter`, lock-icon "Secure checkout" element; mail-icon SVG inside existing `.ct-footer__mail` link; and update 3 hardcoded copy strings (brand tag, Shop link 1 label, Help link 2 label — see Honesty checklist items 24/25/26)

   **Reused with template-only changes (no Liquid file edit):**
   - `sections/ct-reviews.liquid` — `templates/index.json` swaps `rating_count` + replaces 3 blocks with 4 new ones
   - `sections/ct-final-cta.liquid` — `templates/index.json` blanks price fields + sets `show_trust: false` + swaps copy
   - `sections/ct-ba.liquid` — `templates/index.json` block settings only (image pickers + captions + tags)
   - `sections/ct-compare.liquid` — `templates/index.json` block settings only (7 row blocks + 4 header labels)
   - `sections/ct-faq.liquid` — `templates/index.json` block settings only (6 Q&A blocks)

2. **New Liquid sections (4):**
   - `sections/ct-problem-solution.liquid` + `assets/section-ct-problem-solution.css`
   - `sections/ct-features-grid.liquid` + `assets/section-ct-features-grid.css`
   - `sections/ct-lifestyle.liquid` + `assets/section-ct-lifestyle.css`
   - `sections/ct-size-color-guide.liquid` + `assets/section-ct-size-color-guide.css`

3. **Modified CSS (matching the 9 modified Liquid):**
   - `assets/section-ct-hero.css` — append `.ct-hero-split` rules (split text + masked photo + responsive stack)
   - `assets/section-ct-pricing.css` — append `.ct-tier-pair` + `.ct-bundle__addons` rules
   - `assets/section-ct-aplus.css` — append `.ct-aplus__materials` (2-panel spec rows) + `.ct-aplus__guarantee` (4-item panel) rules
   - `assets/section-ct-trust-bar.css` — append `.ct-trust-strip` (4-col icon-box layout)
   - `assets/section-ct-pillars.css` — append `.ct-pillars-svg` (3×2 grid + icon-box styling)
   - `assets/section-ct-marquee.css` — append `.ct-marquee--italic` (italic Fraunces + bullet separators)
   - `assets/section-ct-announce.css` — append `.ct-announce--static-row` (inline 3-message flex)
   - `assets/section-ct-footer.css` — append `.ct-footer__signup-cta`, `.ct-footer__address`, `.ct-footer__secure`, `.ct-footer__contact-ic`

4. **Modified config / template:**
   - `templates/index.json` — full re-wire to 17 sections in spec §5 order, with honest copy seeded throughout (see §7 below).

5. **SVG recolor (per spec §8 item 7):**
   - `assets/cozyclaw-logo.svg` — terracotta → `#5A3E2B`
   - `assets/cozyclaw-logo-icon.svg` — terracotta → `#5A3E2B`
   - `assets/cozyclaw-logo-reversed.svg` — verify only the dark fill is `#5A3E2B`

6. **Untouched (kept as code, removed from `templates/index.json`):**
   - `sections/ct-hero-split.liquid`, `sections/ct-stats.liquid`, `sections/ct-journey.liquid`, `sections/ct-product-tabs.liquid`, `sections/ct-email.liquid` — theme editor still lists them for merchant use elsewhere.

## Section mapping (spec §5 → existing or new section)

| Order | Spec section | File / change | Layout setting | Block type · count | Honesty notes |
|---|---|---|---|---|---|
| 1 | Announce (3 messages) | `ct-announce` + `display: "static-row"` | `static-row` | `message` × 3 | drop "Loved by 15,000+ cat parents" |
| 2 | Header (sticky, blurred) | `header.liquid` (no code change) | — | merchant menu admin | — |
| 3 | Hero (split text + masked photo) | `ct-hero` + `layout: "split-photo"` | `split-photo` | n/a (settings-only) | drop `2,175 sold` / `Save 20%` / `$35.97 was $44.97` / `92% 5-star · 13 verified reviews` from rating_text |
| 4 | Trust strip | `ct-trust-bar` + `layout: "icon-strip"` | `icon-strip` | `chip` × 4 (new fields: title, subtitle) | — |
| 5a | Before/After slider | `ct-ba` (reuse as-is) | — | n/a | placeholder images noted in §10 |
| 5b | Problem / Solution cards | **NEW** `ct-problem-solution` | — | `card` × 2 (variant: problem · solution) | — |
| 6 | Why pillars (6, SVG icons) | `ct-pillars` + `layout: "pillars-svg"` | `pillars-svg` | `pillar` × 6 (new field: icon_svg) | — |
| 7 | Features w/ images (4) | **NEW** `ct-features-grid` | — | `feature` × 4 | — |
| 8 | Marquee (italic + bullets) | `ct-marquee` + `style: "italic-divider"` | `italic-divider` | `message` × 4 | drop 6× "LOVED BY THOUSANDS OF KITTIES" |
| 9 | Lifestyle (4 photos w/ overlay caption) | **NEW** `ct-lifestyle` | — | `tile` × 4 | — |
| 10 | Size & Color guide | **NEW** `ct-size-color-guide` (product-bound) | — | settings-only | binds to product Color + Size options |
| 11 | Comparison table | `ct-compare` (reuse as-is) | — | `row` × 7 | — |
| 12 | Materials & care (2 panels) | `ct-aplus` + `layout: "materials-care"` | `materials-care` | `banner` × 2 (new field: specs_rows) | spec §3: NO removable cover — fix "Unzip" step |
| 13 | Reviews (4 cards, big 4.9) | `ct-reviews` (content-only fix) | — | `review` × 4 (incl. 1× honest 4★) | drop "Join our 15,000+ happy customers" from rating_count |
| 14 | Guarantee (4-item accent panel) | `ct-aplus` + `layout: "guarantee-4"` | `guarantee-4` | `banner` × 4 | — |
| 15 | Bundle & save (2-tier + addons) | `ct-pricing` + `layout: "tier-pair"` | `tier-pair` | `plan` × 2 + new `addon` × 2 | drop "Save 20%" / "Save $12.98" / fabricated price_was; reframe as "best value · ships free" |
| 16 | FAQ accordion (6) | `ct-faq` (reuse as-is) | — | `item` × 6 | — |
| 17 | Final CTA | `ct-final-cta` (content-only fix) | — | n/a | drop price + trust pills (`show_trust: false`, price_now blank) |
| — | Footer | `footer.liquid` (additive) | — | (existing block types) | drop "cat parents / fur babies"; update "CozyClaw Mat" → "Cozy Plush Pet Sofa"; update "7-Day" → "30-Night" |
| 18 | Sticky ATC | `ct-sticky-atc` (verify product-bound) | — | n/a | drop hardcoded price; use `product.price_min` + `money` filter |

## Per-section detail (the implementation contract)

### 3 · Hero `split-photo`
- **Markup:** `<section class="ct-hero-split">` max-w 1440px centered, min-h 520px, position relative, overflow hidden. `<img class="ct-hero-split__photo">` absolute top:0 right:0 width:56% height:100% object-fit:cover, **CSS mask** `linear-gradient(to right, transparent 0%, #000 22%, #000 92%, transparent 100%)` for soft fade. `<div class="ct-hero-split__text">` z-index 2, padding-left = `max(var(--ct-gutter), calc((100% - var(--ct-mw))/2 + var(--ct-gutter)))` so text aligns to mw while photo overflows.
- **Settings (new):** `layout` (select buy-box · split-photo, default buy-box), `hero_image` (image_picker — falls back to `product.featured_image`), `h1_em` (text — italic span inside h1), `trust_line` (text — single line with `★★★★★ 4.9/5 · 13 reviews ✓ 30-night trial ✓ Free shipping $75+`).
- **Markup contents:** eyebrow → h1 with `<em>{{ section.settings.h1_em }}</em>` → subheading → 2 CTAs (primary + outlined) → trust_line.
- **Responsive:** ≤860px stack vertical (photo full-width on top, text below, mask off).
- **PDP impact:** none — `buy-box` stays the default; ct-hero on PDP keeps rendering.

### 4 · Trust strip `icon-strip`
- **Markup:** `<div class="ct-trust-strip">` bg `var(--ct-accent-subtle)`, 4-col grid (`repeat(4,1fr)`, gap 14px), padding 26px gutter. Each item = `.ic` 42×42 rounded-sm bg-raised + `<div><b class="ct-trust-strip__title">{{title}}</b><small class="ct-trust-strip__sub">{{subtitle}}</small></div>`. 2×2 grid ≤760px.
- **Icon library extension:** add 4 paths to the existing icon switch in `ct-trust-bar.liquid`: `paw-fleece`, `bed-edge`, `couch-hair`, `wash-clock`. (Designed from the design HTML's 4 trust-strip SVGs at lines 419–422.)
- **Block schema:** `chip` block gets `title` (text) + `subtitle` (text) added. Existing `label` field still works for chip layout.
- **PDP impact:** none — PDP uses default `chips` layout with `label`.

### 5b · Problem/Solution (NEW)
- **Schema:** `name: "CT Problem / Solution"`. Settings: `kicker` (text), `color_scheme` (color_scheme), padding range. Block type `card` with: `variant` (select: problem · solution), `tag_label` (text), `heading` (text), `bullets` (textarea — one per line). Max 2 blocks.
- **Markup:** 2-col grid max-w `--ct-mw`, gap 24px (1-col ≤760px). Each card = bg-raised, border-subtle, radius lg, padding 34px, shadow sm. `.tag` color = `--ct-urgency` (problem) or `--ct-accent-text` (solution). `<h3>` 25px. `<ul>` with per-line ✗ or ✓ SVG inline (24×24, stroke `--ct-urgency` for problem, `--ct-accent` for solution).
- **Asset:** `assets/section-ct-problem-solution.css` (new). Loads via `{{ 'section-ct-problem-solution.css' | asset_url | stylesheet_tag }}` at top of section.
- **Content:** see §7 below.

### 6 · Why pillars `pillars-svg`
- **Schema:** `layout` select gains `pillars-svg`. Block `pillar` gets `icon_svg` (select with 6 options: `heart-paw`, `bed-bolster`, `shield-couch`, `star`, `wash-clock`, `check-double`). Max blocks stays 6.
- **Liquid `pillars-svg` branch:** 3-col grid (`repeat(3,1fr)`, gap 18px; 2-col ≤860; 1-col ≤560). Each pillar card = bg-raised, border-subtle, radius lg, padding 28px, hover lift (`translateY(-4px) + shadow-md`). `.ic` = 46×46 rounded-sm bg-accent-subtle. SVG paths inline in a `{% case block.settings.icon_svg %}` (same pattern as ct-trust-bar's icon switch). `<h3>` 19px, `<p>` 14.5px text-2.
- **PDP impact:** none — PDP uses default layout.

### 7 · Features grid (NEW)
- **Schema:** `name: "CT Features grid"`. Settings: `kicker`, `heading`, color_scheme, padding. Block `feature`: `image` (image_picker), `title` (text), `description` (textarea). Max 8 blocks (we use 4).
- **Markup:** section head (`.ct-sec-head` centered) + `.ct-feat-grid` 4-col grid (2-col ≤860, 1-col ≤520). Card = bg-raised, border-subtle, radius lg, shadow-sm, overflow hidden. `<img>` aspect 1/1, object-fit contain, bg `--ct-bg-surface`. Body padding 20px 20px 24px: h3 (18px) + p (13.8px text-2).
- **Asset:** `assets/section-ct-features-grid.css` (new).

### 8 · Marquee `italic-divider`
- **Schema:** add `style` select (`loop-blocks` default · `italic-divider`).
- **Liquid `italic-divider` branch:** same `.ct-marquee-track` infinite-scroll JS, but `<span>` per block uses `font-family: var(--ct-font-display); font-style: italic; font-size: 19px; color: var(--ct-accent-text);` with `span::after { content:'•'; color:var(--ct-accent-border); margin-left:46px; }` between items. Background `--ct-accent-subtle`, border-top/bottom `--ct-border-faint`.
- **PDP impact:** none — PDP uses `loop-blocks`.

### 9 · Lifestyle (NEW)
- **Schema:** `name: "CT Lifestyle"`. Settings: `kicker`, `heading`, color_scheme, padding. Block `tile`: `image` (image_picker), `caption` (text). Max 8 blocks (we use 4).
- **Markup:** section head + 4-col grid (2-col ≤760). Each tile: `<figure>` position-relative, radius md, overflow hidden. `<img>` aspect 1/1 object-fit contain bg-surface, hover scale(1.05) (skipped under reduced-motion). `<figcaption>` absolute bottom 0/0/0, padding 14px, color #fff, font-weight 600, **background `linear-gradient(transparent, rgba(46,36,29,.74))`**.
- **Asset:** `assets/section-ct-lifestyle.css` (new).

### 10 · Size & color guide (NEW · product-bound)
- **Schema:** `name: "CT Size & color guide"`. Settings: `product` (product_picker — REQUIRED), `kicker`, `heading`, `body`, `measuring_tip` (text), `color_option_name` (text, default "Color"), `size_option_name` (text, default "Size"), `size_M_desc` / `size_L_desc` (textarea, descriptions per size variant), color_scheme, padding.
- **Liquid:**
  - Resolve product: `{% assign p = all_products[section.settings.product] %}` (or use `section.settings.product` if Shopify resolves it directly).
  - Background `var(--ct-bg-surface)`.
  - Split grid `.ct-guide__grid` (`grid-template-columns: .9fr 1.1fr`, single-col ≤760px).
  - **Left:** kicker + h2 + body + `.ct-swatches` flex row → iterate `p.options_by_name[section.settings.color_option_name].values`. For each color value, find a matching variant via `p.variants | where: 'option1', color_value` (or by index of option_name in `p.options`) and render `<img src="{{ variant.featured_image | image_url: width: 240 }}">` + caption. Tip text below.
  - **Right:** `.ct-sizes` stacked cards. Iterate `p.options_by_name[section.settings.size_option_name].values`. For each size: `.ct-size-card` = bg-raised, border-subtle, radius md, padding 20px 22px, flex gap 18px. `.badge` 54×54 rounded-sm bg-accent color-white font-display 24px (single-char `M` / `L`). Right column = bold label + dimension in mono (use the size option value text directly, e.g. "60×80 cm (24″×31″)") + description from `size_M_desc` / `size_L_desc`.
- **Asset:** `assets/section-ct-size-color-guide.css` (new).

### 12 · Materials & care `materials-care`
- **Schema:** `layout` select gains `materials-care`. Block `banner` gets `specs_rows` (textarea — one per line, format `label | value`). Max blocks 7 (we use 2).
- **Liquid `materials-care` branch:** 2-col grid (1-col ≤760). Each block = panel (bg-raised, border-subtle, radius lg, padding 30px, shadow-sm). H3 from `block.settings.title`. Body parses `specs_rows`: split textarea on newlines, then split each line on `|`, render as `.ct-aplus__spec` row (`display:flex; justify-content:space-between; gap:16px; padding:11px 0; border-bottom:1px solid var(--ct-border-subtle); font-size:14.5px;`) with `<span>` (label, color text-3) and `<b>` (value, font-weight 600 text-right text).

### 14 · Guarantee `guarantee-4`
- **Schema:** `layout` select gains `guarantee-4`.
- **Liquid branch:** wrapper `.ct-aplus__guarantee` = accent-subtle bg, accent-border, radius xl, padding 40px 30px. 4-col grid (2×2 ≤760). Each block = centered: icon-circle 50×50 (bg-raised, shadow-xs) + bold title (15px) + small body (13px text-2). Icon from `block.settings.icon_svg` (reuse 6-icon library from ct-pillars OR add 4 new: shield, truck, box, lock).

### 15 · Bundle `tier-pair`
- **Schema:** `layout` select gains `tier-pair`. Settings: `addons_label` (text). Existing block type `plan` keeps all its current fields (we use first 2 blocks for tiers). NEW block type `addon`: `product` (product_picker), `image` (image_picker — overrides product.featured_image), `title` (text — overrides product.title), `desc` (text).
- **Liquid `tier-pair` branch:**
  - Max-w 860px centered. 2-col grid (1-col ≤760), align-items: stretch.
  - Iterate first 2 `plan` blocks: `.ct-tier` card = bg-raised, border-subtle, radius lg, padding 26px 24px, flex-column, hover lift. If `block.settings.featured`: add `.ct-tier--pop` (2px accent border + shadow-md) and render `.ct-tier-badge` absolute top -13px center, accent bg, white text, uppercase 11px pill ("Most popular · ships free" or `block.settings.badge`).
  - Tier contents: H3 + `.ct-tier__sub` line + product image (aspect 16:10, contain, bg-surface, radius md) + `<ul class="ct-tier__feat">` (parses a new textarea `block.settings.features` — one per line; ✓ SVG per line, success-green stroke; lines containing `**...**` get `.hl` class for green highlight) + price line (`<b>from {{ p.price_min | money }}</b>` + optional "ships free" green text) + full-width CTA (`.btn--block`).
  - Below: `.ct-bundle__addons` = max-w 860 centered, accent-subtle bg, accent-border, radius lg, padding 20px 26px. Label "Complete their setup — optional add-ons". 2-col grid of addon cards (1-col ≤760).
- **PDP impact:** none — PDP uses default `bundle` layout.

### 18 · Footer additions
- **Schema additions:**
  ```
  { "type": "header", "content": "Brand column" }
  { "type": "textarea", "id": "address", "default": "509 Byrum Rd, Chaparral, NM 88081, United States" }
  { "type": "header", "content": "Signup CTA panel" }
  { "type": "checkbox", "id": "show_signup_cta", "default": true }
  { "type": "text", "id": "signup_heading", "default": "Join the cozy club" }
  { "type": "text", "id": "signup_body", "default": "Get 15% off your first order, plus first dibs on new colors and cozy deals." }
  { "type": "text", "id": "signup_button_label", "default": "Sign up" }
  ```
- **Liquid additions:**
  - Inside `.ct-footer__brand-col` after tag: address line with pin-icon SVG. Mail-icon SVG inside existing `.ct-footer__mail` link.
  - Between `.ct-footer__grid` and `.ct-footer__bottom`: `{%- if section.settings.show_signup_cta -%}` block with heading/body/`{% form 'customer' %}` panel containing hidden `contact[tags]=newsletter` + email input + submit button. Pre-fills `posted_successfully?` state.
  - Inside `.ct-footer__bottom`: insert `<span class="ct-footer__secure">` (lock SVG + "Secure checkout") left of the existing payment row.
- **Markup-only edits to existing Liquid** (the in-code copy currently hardcoded):
  - Brand tag: `"Founded to help cat parents make their fur babies' daily lives a little better — one cozy, well-made product at a time."` → `"Founded to help pet parents make their dogs' and cats' everyday lives a little cozier — one well-made product at a time."`
  - Shop col link 1 label: `"CozyClaw Mat"` → `"Cozy Plush Pet Sofa"`
  - Help col link 2 label: `"Returns & 7-Day Guarantee"` → `"Returns & 30-Night Guarantee"`

## Content seeds (verbatim from spec + design)

Full block content for each section, ready to paste into `templates/index.json`. Keeping this list explicit so the implementation step has zero copy ambiguity.

### Announce (3 blocks)
1. `🚚 Free shipping on orders $75+`
2. `🌙 30-night risk-free trial`
3. `🐾 A cozy spot for dogs & cats`

### Hero (split-photo settings)
- eyebrow: `The plush sofa-bed for dogs & cats`
- heading: `Their favorite spot.`
- h1_em: `Your cleaner sofa.`
- subheading: `CozyClaw's deep, pillow-edged pet sofa is soft enough that they'll finally pick their own bed over your couch — keeping the fur, dander, and claws off your furniture.`
- button_label: `Shop CozyClaw` · button_link: `#bundle`
- button_label_2: `See sizes & colors` · button_link_2: `#guide`
- trust_line: a single string parsed by Liquid into 3 spans separated by margin-left, **not by multi-spaces** (browsers collapse whitespace). Format: `★★★★★ 4.9/5 · 13 reviews | ✓ 30-night trial | ✓ Free shipping $75+` — the `|` characters act as split markers in Liquid (`{% assign parts = section.settings.trust_line | split: '|' %}` then render each in a `<span class="ct-hero-split__trust-item">`). CSS gives each span `margin-right: 22px`.
- hero_image: merchant-uploaded (placeholder = `cdn.shopify.com/.../Sc68ba0bf97fc446882fe68d55365fbf6p.webp`). Falls back to `product.featured_image` if blank and product is picked.

### Trust strip (4 chip blocks · icon-strip layout)
1. icon `paw-fleece` · title `Cloud-soft coral fleece` · subtitle `Cozy on every paw`
2. icon `bed-edge` · title `Raised pillow edges` · subtitle `A built-in head-rest`
3. icon `couch-hair` · title `Helps keep sofas hair-free` · subtitle `Fur stays on the bed`
4. icon `wash-clock` · title `Machine-washable` · subtitle `Fresh in one cycle`

### Before/After (ct-ba settings)
- before_image: `S6bf961fb4e8a48729f92fa08354ca682O.webp`
- after_image: `Sc68ba0bf97fc446882fe68d55365fbf6p.webp`
- before_tag: `Before` · after_tag: `After`
- before_label: `Fur, dander & claws all over your sofa`
- after_label: `Their own cozy, washable spot`

### Problem/Solution (2 card blocks)
1. variant `problem` · tag_label `The problem` · heading `They love your sofa. It doesn't love them back.` · bullets:
   - Fur and dander work their way deep into your cushions.
   - Claws catch and pull at the fabric weave over time.
   - Every evening turns into the same "scoot over" standoff.
   - They don't have a spot that's truly, only theirs.
2. variant `solution` · tag_label `The solution` · heading `A spot they'll claim. A home you'll keep clean.` · bullets:
   - A bed so plush they choose it over your couch.
   - Fur collects on a bed you can toss in the wash.
   - Gentle on paws, and far easier on your furniture.
   - Their own cozy corner — in tones that match your room.

### Why pillars (6 pillar blocks · pillars-svg layout)
- kicker `Why pet parents love it` · heading `Comfort for them, peace of mind for you` · lead `Every detail is built around one idea: give your dog or cat a place so good they'll never want to leave it.`
1. icon_svg `heart-paw` · name `Ultra-soft & cozy` · desc `A dense coral-fleece surface over thick padding cushions tired joints and holds in warmth on cold mornings.`
2. icon_svg `bed-bolster` · name `Secure & supportive` · desc `Raised bolster edges double as a head-rest and a wall, giving anxious or older pets a safe place to settle.`
3. icon_svg `shield-couch` · name `Protects your furniture` · desc `When they have a spot they prefer, you get fewer hairs on the couch, less scratching, and cleaner cushions.`
4. icon_svg `star` · name `Stylish & neutral` · desc `Coffee, Grey, and Black tones blend into a modern home instead of shouting "pet stuff" from the corner.`
5. icon_svg `wash-clock` · name `Easy to clean` · desc `The whole bed goes straight in the machine and comes out soft and fluffy — ready for the next nap.`
6. icon_svg `check-double` · name `Built to last` · desc `Reinforced seams and a resilient high-loft fill keep their shape and bounce, wash after wash.`

### Features grid (4 feature blocks)
- kicker `Thoughtfully designed` · heading `Beautifully made, down to the seam`
1. image `S406fffa8c67d4e68b36a83ae663911b0y.webp` · title `Plush coral-fleece top` · desc `A deep, faux-fur surface that feels like a favorite blanket — and stays that soft after every wash.`
2. image `Sb75526b52f8d43f397981f334b909aafF.webp` · title `Raised bolster edges` · desc `Cushioned sides work as both a pillow and a wall, so they can curl up tight or stretch right out.`
3. image `Sbf704be07ddd4c10adad72633a594629S.webp` · title `Non-slip base` · desc `A grippy underside keeps the bed planted on floors, sofas, and slick surfaces — no sliding mid-zoomies.`
4. image `S4266af0b5e144b3abc9d082ad02705f0R.webp` · title `Machine washable` · desc `The whole bed goes straight in the wash and comes back soft and fluffy — no fuss, no special care.`

### Marquee (4 message blocks · italic-divider style)
1. `Made for happy dogs & cats`
2. `Cozier naps`
3. `Cleaner sofas`
4. `A spot of their own`

### Lifestyle (4 tile blocks)
- kicker `Made for real life` · heading `Use it anywhere they love to relax`
1. image `Sc68ba0bf97fc446882fe68d55365fbf6p.webp` · caption `On the sofa`
2. image `S0d4e7241dbca4bf1a06b87479b1166dfS.webp` · caption `On the floor`
3. image `S2a381fdd19594af290b618eb14be07a5I.webp` · caption `By the window`
4. image `S6bf961fb4e8a48729f92fa08354ca682O.webp` · caption `In their cozy corner`

### Size & color guide (settings)
- product: `cozy-plush-pet-sofa` (merchant-selected)
- kicker `Size & color guide` · heading `Find their perfect fit`
- body `Three neutral colors, two roomy sizes. Pick the shade that suits your space and the size that suits your pet.`
- measuring_tip `Tip: measure your pet nose-to-tail while they're curled up, then add 4–6" of breathing room.`
- color_option_name `Color` · size_option_name `Size`
- size_M_desc `Best for cats and small dogs — a snug spot for curling up.`
- size_L_desc `Best for medium and larger dogs, or any pet who loves to sprawl.`

### Comparison table (ct-compare · 7 rows · 3 cols)
- feature_label `Feature` · brand_label `CozyClaw Sofa-Bed` · col2_label `Regular Blanket` · col3_label `Basic Pet Mat`

| Feature | CozyClaw | Blanket | Mat |
|---|---|---|---|
| Cloud-soft coral fleece | check | text:Sometimes | cross |
| Raised supportive edges | check | cross | cross |
| Helps keep sofas hair-free | check | text:Limited | text:Sometimes |
| Machine-washable cover | check | text:Limited | text:Limited |
| Non-slip bottom | check | cross | text:Sometimes |
| Stylish, home-friendly look | check | cross | text:Limited |
| Holds shape over time | check | text:Low | text:Low |

### Materials & care (2 banner blocks · materials-care layout)
- kicker `Materials & care` · heading `What it's made of — and how to keep it fresh`
1. title `Inside & out` · specs_rows:
   ```
   Cover | Soft coral fleece
   Fill | Thick high-loft padding
   Base | Non-slip backing
   Best for | Dogs & cats
   Colors | Coffee · Grey · Black
   Sizes | 60×80 & 80×90 cm
   ```
   **(Removed "zip-off" — spec §3 confirms no removable cover.)**
2. title `Care in three steps` · specs_rows:
   ```
   1 · Brush off | Lift loose fur with a glove brush
   2 · Wash | Machine wash cold, gentle
   3 · Dry | Air-dry or tumble low
   ```
   (Step 1 reworded — original "Unzip" violated the no-removable-cover constraint.)

### Reviews (4 blocks · ct-reviews)
- rating_number `4.9` · rating_count `Based on 13 reviews`
1. rating 5 · author `Megan R.` · meta `Verified buyer · Golden mix` · text `He used to take over the entire couch. Now he goes straight to his CozyClaw the moment we sit down — and the cushions finally stay clean.`
2. rating 5 · author `Jordan P.` · meta `Verified buyer · Tabby cat` · text `My cat picked her spot in about five minutes flat. She loves nesting against the raised edge. Washes beautifully too.`
3. rating **4** · author `Alicia N.` · meta `Verified buyer · Two dogs` · text `Really comfy and looks great in Coffee. It took a day out of the box to fully fluff up, but after that it's perfect.`
4. rating 5 · author `David L.` · meta `Verified buyer · Senior lab` · text `Worth it for the bolster edges alone. My senior boy rests his head on them and settles right down for the night.`

### Guarantee (4 banner blocks · guarantee-4 layout)
- (no kicker/heading — direct panel)
1. icon `shield` · title `30-night trial` · body `Sleep on it. If it's not their spot, send it back.`
2. icon `truck` · title `Free shipping $75+` · body `Fast, tracked delivery on qualifying orders.`
3. icon `box` · title `Easy returns` · body `A simple, no-drama return process if you need it.`
4. icon `lock` · title `Secure checkout` · body `Encrypted payment with trusted providers.`

### Bundle (2 plan blocks + 2 addon blocks · tier-pair layout)
- kicker `Bundle & save` · heading `Pick their cozy setup` · subheading `Most homes have more than one favorite napping spot. Add a second bed and the whole order ships free.`
- addons_label `Complete their setup — optional add-ons`
- Plan 1 (`featured: false`): name `Single Cozy Spot` · sub `One plush sofa-bed` · image `Sc68ba0bf97fc446882fe68d55365fbf6p.webp` · features:
  ```
  One bed in your chosen color & size
  30-night risk-free trial
  ```
  · price: `{{ product.price_min | money }}` (from product picker) · button `Choose single` (outlined)
- Plan 2 (`featured: true`): name `Double Comfort` · sub `Two beds for every favorite spot` · badge `Most popular · ships free` · image `S2a381fdd19594af290b618eb14be07a5I.webp` · features:
  ```
  Two beds — mix colors & sizes freely
  **FREE shipping on the whole order**
  30-night risk-free trial
  ```
  · price: `{{ product.price_min | times: 2 | money }}` + `ships free` green text · button `Choose double` (primary)
- Addon 1: product `chompclean-toy` (auto title/image from product) · desc `A squeaky chew that keeps playtime on their bed.`
- Addon 2: product `pet-deshedding-glove-brush` (auto title/image from product) · desc `Lifts loose fur before it ever reaches your sofa.`

### FAQ (6 item blocks · ct-faq)
- kicker `Good to know` · heading `Frequently asked questions`
1. q `What size should I choose?` · a `Measure your pet nose-to-tail while they're curled up and add about 4–6 inches. Medium is 60×80 cm (24″×31″) and suits cats and small dogs; Large is 80×90 cm (31″×35″) for medium and larger dogs, or any pet who loves to sprawl.`
2. q `Is it machine washable?` · a `Yes. The whole bed is machine-washable on a cold, gentle cycle. Air-dry or tumble on low and it comes back soft and fluffy.`
3. q `Is it safe for puppies and kittens?` · a `It's designed for dogs and cats of all ages. The soft, supportive edges are especially comforting for young or older pets. As with any bed, supervise heavy chewers.`
4. q `What is it made of?` · a `A soft coral-fleece cover over thick high-loft padding, with a non-slip backing underneath to keep it in place on floors and furniture.`
5. q `Will it stay put on my sofa?` · a `The grippy non-slip base helps it stay planted on most sofas, floors, and slick surfaces, so it won't slide around when they hop on and off.`
6. q `What is your return policy?` · a `Every CozyClaw comes with a 30-night risk-free trial. If it isn't their new favorite spot, reach out to support@cozyclaw.com and we'll help with a return. Free shipping applies to orders over $75.`

### Final CTA (settings)
- eyebrow `A cozier pet, a cleaner home`
- heading `Give them their favorite spot.`
- subheading `Give your dog or cat a cozier spot of their own and keep your home a little tidier — backed by a 30-night risk-free trial and free shipping over $75.`
- price_now / price_was / price_save_label: **blank** (strips fabricated discount)
- button_label `Shop CozyClaw now` · button_link `#bundle`
- button_label_2: blank
- show_trust: `false`

### Sticky ATC (settings)
- product: `cozy-plush-pet-sofa` (merchant-selected) — section already binds `atc_btn_label = atc_product.price_min | money | prepend: 'Add to Cart — '` when product is picked (verified in `sections/ct-sticky-atc.liquid`)
- rating_text: `★★★★★ 92% 5-star · 13 reviews`
- button_label: blank (auto-bound to `"Add to Cart — $X.XX"` via existing Liquid)
- emoji: blank (image now preferred — see Liquid change in deliverables)
- image: blank (Liquid falls back to `product.featured_image`)

## Honesty cleanup checklist (per spec §2)

Every fabricated claim and where it appears (status: all flipped to honest in this redesign).

| # | Location | Stale value | New value |
|---|---|---|---|
| 1 | `templates/index.json` `ct_hero.sale_badge` | `🔥 2,175 sold` | (blank) |
| 2 | `templates/index.json` `ct_hero.price_now` | `$35.97` | (blank) |
| 3 | `templates/index.json` `ct_hero.price_was` | `$44.97` | (blank) |
| 4 | `templates/index.json` `ct_hero.price_save_label` | `Save 20%` | (blank) |
| 5 | `templates/index.json` `ct_hero.rating_text` | `92% 5-star · 13 verified reviews` | (blank — trust_line takes over) |
| 6 | `templates/index.json` `ct_hero.availability_text` | `In stock — ready to ship in 3-7 business days` | (blank for split-photo) |
| 7 | `templates/index.json` `ct_marquee` blocks (6×) | `LOVED BY THOUSANDS OF KITTIES` | 4 new phrases (above) |
| 8 | `templates/index.json` `ct_announce.message_1` | `🚚 Free shipping over $50` | `🚚 Free shipping on orders $75+` |
| 9 | `templates/index.json` `ct_announce.message_2` | `★★★★★ 92% 5-star · Loved by 15,000+ cat parents` | `🌙 30-night risk-free trial` + new 3rd `🐾 A cozy spot for dogs & cats` |
| 10 | `templates/index.json` `ct_bundle.plan1.save_text` | `Save 20%` | (blank) |
| 11 | `templates/index.json` `ct_bundle.plan1.price_was` | `$44.97` | (blank) |
| 12 | `templates/index.json` `ct_bundle.plan2.badge` | `💰 Biggest savings today` | `Most popular · ships free` |
| 13 | `templates/index.json` `ct_bundle.plan2.flag_style` | `urgency` | `accent` |
| 14 | `templates/index.json` `ct_bundle.plan2.save_text` | `Save $12.98` | (blank) |
| 15 | `templates/index.json` `ct_bundle.plan2.price_was` | `$26.97` | (blank) |
| 16 | `templates/index.json` `ct_bundle.plan3` (whole block) | 3rd plan with "🏆 Best-selling combo" etc. | **DELETE** (tier-pair = 2 tiers only) |
| 17 | `templates/index.json` `ct_reviews.rating_count` | `92% 5-star · based on 13 reviews · Join our 15,000+ happy customers` | `Based on 13 reviews` |
| 18 | `templates/index.json` `ct_reviews` blocks (3×) | 3 cat-only blocks | 4 dog+cat blocks (incl. 1× honest 4★) |
| 19 | `templates/index.json` `ct_final.price_now` | `$35.97` | (blank) |
| 20 | `templates/index.json` `ct_final.price_was` | `$44.97` | (blank) |
| 21 | `templates/index.json` `ct_final.price_save_label` | `Save 20%` | (blank) |
| 22 | `templates/index.json` `ct_final.show_trust` | `true` | `false` |
| 23 | `templates/index.json` `ct_sticky_atc.button_label` | `Add to Cart →` | `Add to Cart` (Liquid appends price) |
| 24 | `sections/footer.liquid` brand tag (Liquid string) | `...cat parents make their fur babies'...` | `...pet parents make their dogs' and cats'...` |
| 25 | `sections/footer.liquid` Shop col link 1 label | `CozyClaw Mat` | `Cozy Plush Pet Sofa` |
| 26 | `sections/footer.liquid` Help col link 2 label | `Returns & 7-Day Guarantee` | `Returns & 30-Night Guarantee` |

## Risks / open questions during implementation

- **`product.options_by_name` Liquid availability** — Shopify exposes `product.options_with_values` as the canonical option iterator. If `options_by_name` is unavailable in `section.settings.product`-resolved products (vs the `product` global on PDP), the size+color guide falls back to iterating `product.options_with_values` and matching by `option.name == section.settings.color_option_name`. The implementation plan must verify this against Shopify Liquid docs before locking the iteration syntax.
- **`addon` block image fallback** — if merchant doesn't override `addon.image`, Liquid renders `product.featured_image`. Need to test what happens when product has no featured image (likely shows a Shopify placeholder).
- **PDP visual regression** — even though all PDP-shared schema changes are additive, adding new fields to existing block types can shift the JSON template editor's field order. Verify the PDP renders identically after the Liquid changes (no settings cleared, no spacing shifted).
- **Theme-check budget** — adding 4 new sections + 9 modified sections will add lint surface. Implementation must keep us at the 10-offense baseline.
- **Bundle price math** — Plan 2's "from {{ product.price_min | times: 2 | money }}" assumes the merchant picks the same product for both tiers (which they should, since spec §3 calls out one product, two tiers being "exactly 2× Single, no real discount"). If a merchant overrides plan 2 with a different product picker, the math breaks. Acceptable risk — document in section info text.
- **Variant image fetching cost** — size+color guide iterating 3 color variants pulls 3 image_urls server-side. Negligible perf cost but verify under Lighthouse.

## Out of scope (per spec §8 — merchant-side)

These are tracked for the launch checklist but NOT part of this implementation:
1. Set retail prices in Shopify admin (variant Price currently = Cost per item; zero margin).
2. Switch Shopify market to US / USD.
3. Provide real before/after photo pair for `ct-ba`.
4. Provide a lifestyle hero photo to replace the product close-up in the hero photo slot.
5. Real legal pages for footer (currently `#` placeholders).
6. Sync `ct_reviews.rating_number` + `rating_count` to the actual review-app figure (e.g., Judge.me / Loox) once installed.

## Acceptance criteria

This redesign is done when:
1. `templates/index.json` matches spec §5's 17 sections in order, no extras, no missing sections.
2. The live `/` page renders identically to `files/cozyclaw-homepage.html` at ≥1280px and gracefully responsive ≤860 / ≤760 / ≤620 / ≤560 / ≤520 breakpoints.
3. The 26 honesty-cleanup items are all flipped; grep across `templates/index.json` + touched Liquid files returns no stale value.
4. PDP (`/products/cozy-plush-pet-sofa`) renders identically to before this PR (no regressions in shared sections).
5. `shopify theme check` stays at 10 offenses (baseline preserved).
6. All `ct-*` sections still use `--ct-*` tokens; no hardcoded hex values introduced in new sections.
7. New product-bound sections (`ct-size-color-guide`, `ct-pricing tier-pair`, `ct-sticky-atc`, `ct-hero split-photo` hero photo fallback) all degrade gracefully if no product is picked (don't 500, just render empty state with a setting-info notice).
