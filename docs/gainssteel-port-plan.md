# GainsSteel "Forge" Port — Section Breakdown & Implementation Plan

Source of truth: `design/gainssteel-design-system-v2.md` + `design/gainssteel-homepage.html` · `design/gainssteel-pdp.html` · `design/gainssteel-cart.html`.
Goal: port the 3 pages into Liquid by **reusing the existing `ct-*` section/snippet library** (no new section unless a block genuinely has no host). This doc breaks every design block down to: **which section/snippet**, **what we do**, **how we test**, **how we apply the CSS**.

Legend — effort: **reuse** (settings/content only) · **adapt** (existing section + new variant/blocks/CSS) · **new** (build a section).

---

## 0. Shared conventions (apply to EVERY section)

### 0.1 How we apply CSS correctly to the design
1. **Brand via tokens, not hex.** All colour/font/spacing come from `--ct-*` tokens in `snippets/css-variables.liquid` (Phase 0 sets them to GainsSteel). Section CSS references `var(--ct-*)` — **never** raw hex/px-spacing (token audit forbids px in `font-size`/`padding`/`margin`; px allowed for `width`/`height`/`border`/insets).
2. **Read the design value, convert to the nearest token.** e.g. design `padding:3rem` → `var(--ct-space-6)` (48px); `#ff6b1a` → `var(--ct-action)`; `#101216` → `var(--ct-text)`; `7px 7px 0 ink` hard-lift → `var(--ct-shadow-lift)`. Sizing that has no token (e.g. `74.1rem` max-width, bento row `minmax(106px,auto)`) stays as a literal length (allowed).
3. **Scope every rule** to the section root (`.ct-x` / `.gs-x` class), never bare element or `body > section` / `section + section` — Shopify wraps each section in `#shopify-section-*`, which breaks adjacency/`:first-child` selectors. Full-bleed bands (marquee, proof strip, energy band) re-establish their background/padding **inside** their own wrapper.
4. **Load CSS per-section** via `{{ 'component-ct-x.css' | asset_url | stylesheet_tag }}` inside the section (or an inline `{% style %}` scoped by `section.id`), so only used CSS ships and there's no global cascade leak.
5. **Display face is uppercase.** Saira Condensed headings/price/buttons/eyebrows get `text-transform:uppercase` + tight tracking (`letter-spacing:-0.01em`, `line-height:.96`) in the section CSS — the current ct-* CSS was built for sentence-case Poppins, so this is added where the design shows uppercase.
6. **Light-lock stays intact** (design §8): no transparent backgrounds; every band has an explicit token background; the theme is already `color-scheme: light only`.

### 0.2 How we test after each section
- **Static (every change):** `node qa/ct-qa.mjs` (token + brand + content + CRLF + schema-preset + settings-sync audits) → must pass; `shopify theme check` → 0 offenses; `node --check` on any JS block.
- **Mojibake sweep:** `rg -n "â|Â|ð|€|Ã|Å|Ë" templates sections snippets` before each commit (™ → `&trade;`, ✕ → `&#10005;`, ✓ → `&#10003;`, — → `&mdash;`).
- **Visual (you, on preview `#161500889343`):** open the section side-by-side with its design HTML at **360 / 390 / 768 / 1280 / 1920** widths; confirm layout, type scale, colour roles (orange=action only, green=trust, gold=rating, red=urgency), spacing rhythm.
- **Functional (per interaction):** marquee animates + fills (or rAF fallback); reveal-on-scroll fires once; bundle selector switches price/compare/save; sticky ATC reveals after the buy CTA scrolls out and clears the footer; FAQ toggles; cart qty/remove/upgrade hit Dawn's cart pipeline; toast fires + auto-dismisses.
- **Per-section "done" =** static green + your visual sign-off + the interaction works.

### 0.3 Data-binding rules (non-negotiable — design §9/§10 + project G-05)
Bind to Shopify, **never hardcode**: product price, `compare_at_price`, save %, availability, title, media, variants; rating + review count + review text (Judge.me/metafields); payment icons (native `payment_type_svg_tag`). If `compare_at_price ≤ price`, the strike/badge/savings row auto-hide. No invented discounts, ratings, stock urgency, or `$…` left in template JSON. `aggregateRating` JSON-LD omitted until real reviews exist. Editorial copy (headings, eyebrows, bullets, specs, FAQ) is ported verbatim from the design into section settings.

### 0.4 Port failure-mode guards (design memory)
Rewrite `index.json`/`product.json`/`cart.json` `sections`+`order` wholesale per blueprint (no stale leftovers); one stable section type per block; scope CSS + keep `settings_schema` defaults in sync with `settings_data` (the brand-swap trap); full-bleed inside `#shopify-section`; scoped/idempotent JS (`customElements.get` guard, unsubscribe in `disconnectedCallback`, re-init on `shopify:section:load`); render marquee sets server-side (no JS double-clone); fixed-ratio media `object-fit:contain`; never emit fabricated data.

---

## Phase 0 — Foundation (prerequisite; flips the whole store to GainsSteel)

| Item | File(s) | What we do | Test |
|---|---|---|---|
| Activate brand | `config/settings_data.json` | Set `"current": "Forge"` (the GainsSteel preset already exists, lines ~613-815: accent `#FF6B1A`/`#E35708`, light schemes). | `ct-qa` settings-sync passes; preview shows orange brand. |
| Sync schema defaults | `config/settings_schema.json` | `color_accent` `#111827`→`#FF6B1A`, `color_accent_hover` `#374151`→`#E35708` (so default == active preset — the hard sync rule). | `ct-qa` brand audit. |
| Swap hardcoded tokens | `snippets/css-variables.liquid` | These `--ct-*` are hardcoded (don't read settings) → edit to spec §2: `--ct-bg` `#ffffff`→`#f6f5f2`; `--ct-bg-surface`→`#ffffff`/steel-light; `--ct-text` `#16181d`→`#101216`; `--ct-text-2`→`#444a55`; `--ct-text-3`→`#5b6573`; `--ct-border` `#e7e9ec`→`#e4e2dc`; `--ct-action-tint`→`#fff1e6`; `--ct-success`→`#1e7a4f` (+light `#e9f4ee`); `--ct-rating`→`#eda21a`; `--ct-urgency`/`--ct-error`/`--ct-badge-sale`→`#d23a2c` (+ red-tint `#fbeceb`); fix the stale `default: '#111827'` on the accent line. | `ct-qa` token audit; visual on preview. |
| Fonts | `layout/theme.liquid` + `snippets/css-variables.liquid` | Swap the Google Fonts `<link>` (line ~29) from Poppins → **Saira Condensed** `wght@600;700;800;900` (keep Inter). Change `--ct-font-display`/`--ct-font-heading` fallback `'Poppins'` → `'Saira Condensed'` (Inter body unchanged). | Headings render condensed; `node --check` n/a; visual. |
| Display uppercase | section CSS (rolling) | Where the design shows uppercase display (headings, price, buttons, eyebrows), section CSS adds `text-transform:uppercase` + tracking. Done per-section as we touch them. | visual. |

**CSS approach:** pure token edits — zero new layout. After Phase 0 the existing pages already re-skin to GainsSteel colours/fonts; we then port layouts page by page.

---

## Phase 1 — Homepage (`templates/index.json`) — blueprint order

| # | Design block | Section / snippet | Effort | What we do | CSS approach | Test |
|---|---|---|---|---|---|---|
| 1 | Top trust marquee (ink) | `ct-trust-marquee` | reuse | 3 message blocks (free shipping / 90-day returns / 1-yr warranty) + star separators; ink band. | tokens; existing marquee CSS; ink bg = `var(--ct-text)` band. | marquee scrolls + fills; reduced-motion rAF. |
| 2 | Header / nav | `header-group` (shared) | adapt | Saira wordmark, anchor menu, orange "Get the System" CTA. Not in index order. | theme-overrides header rules, tokens. | sticky + blur; links scroll. |
| 3 | **Hero — kinetic + bento** | **`ct-hero-bento` (NEW)** | new | Build a bento hero: split left (eyebrow, 3-line outlined `.ol`/`.hl` headline, lead, `ct-rating-stars` chip, dual buttons, trust badges) + right 6-tile bento (product tile / 3 spec tiles / program tile / video slot via `ct-media-slot`). Tile blocks repeatable. | new scoped CSS: bento grid `2col, rows minmax(106px,auto)`, outline text `-webkit-text-stroke:2.5px var(--ct-text)` + `@supports` solid fallback; all colour/space tokens. | rating chip binds to metafield (empty if none); reveal; responsive bento (2-up tiles ≤860). |
| 4 | Spec marquee (orange) | `ct-trust-marquee` | reuse (+tiny adapt) | 2nd instance, spec strings (22–440 lb · 15 levels…), orange band variant. | add an `band: ink|orange` style setting (1 setting) or scheme; tokens. | scrolls; orange band. |
| 5 | Problem — friction split | `ct-feature-blocks` | adapt | Heading + lead + orange resolve line; 4 friction cards each with red ✕ chip (`ct-icon` error). | add a "friction/split" layout variant: 2-up, `var(--ct-red)` ✕ chips, orange left-border resolve callout. | reveal; stacks ≤860. |
| 6a | Mechanism — 3 cards | `ct-icon-columns` | reuse | 3 icon cards (icon+title+body), columns:3, icon-left. | confirm icon-left (`card:has(>.ic)` grid `48px 1fr`); tokens. | layout; 3→1 ≤860. |
| 6b | Mechanism — proof strip | `ct-stats` | adapt | Dark 5-up stat band (22–440 / 15 / 10 / 5.3 / 100K), orange display numerals. | dark-band style variant (ink bg, orange `var(--ct-action)` numerals, Saira); full-bleed inside wrapper. | 5→3 ≤1000. |
| 7 | Who It's For | `ct-icon-columns` | reuse | 4 persona cards, columns:4, neutral steel icons. | tokens only. | 4→2→1 responsive. |
| 8 | The System — 5 pillars | `ct-steps` | adapt | 5 numbered cards (01–05), big outline numerals, accent border on card 1. | allow 5 blocks; outline-numeral card style (`.num` outline via text-stroke); accent first card. | layout; numerals render. |
| 9 | How It Works — 3 steps | `ct-steps` | reuse | 3 step blocks, circular ink number badges. | tokens; 2nd ct-steps instance. | layout. |
| 10 | 12-Week Journey | `ct-timeline` | reuse | 4 milestones (Week 1–2 Learn …), connecting track + dots. | orange track/dots via tokens. | horizontal→vertical ≤860. |
| 11 | Comparison | `ct-comparison` | adapt | GainsSteel vs 3 alternatives × 6 rows; orange-highlighted "us" column. | **add a 3rd alternative column** (`alt_3` label + per-row value + good-flag); us-column highlight token. | horizontal-scroll ≤620; checks/✕ render. |
| 12a | Proof — reviews | `ct-reviews` | adapt | Big aggregate score (4.7 + stars + count) header + 3 objection-mapped review cards (verified badge). | big-score header (`ct-rating-stars`, Saira numeral); score/count **bind to live rating**, not settings. | empty if no rating; cards layout. |
| 12b | Proof — UGC wall | `ct-video-gallery` | reuse | 3-up UGC video slots (play + caption). | tokens; `ct-media-slot` video (autoplay muted per earlier work). | video autoplay/contain. |
| 13 | Offer — 3 plans + pay | `ct-pricing-table` | adapt | Basic/Core(popular)/Complete: price + struck `was` + save% + feature checklist + CTA; payment row; Core hard-lift. | add compare-at strike + save badge **bound to a variant picker** (display-only), payment-row option (or `ct-trust-bar` payment block), popular `var(--ct-shadow-lift)`. | prices bind to variants; strike auto-hides; CTAs deep-link `pdp?bundle=`. |
| 14 | FAQ | `ct-faq` | reuse | 7 Q/A item blocks; orange `+`→`×` toggle. | tokens; orange chip rotate. | accordion toggles. |
| 15 | Final CTA — energy band | `ct-cta-banner` | adapt | Ink band, radial orange glow, eyebrow + emphasized headline + CTA (price from Core variant). | "energy band" style variant (ink bg + radial glow + rounded); full-bleed inside wrapper. | CTA links to PDP. |
| 16 | Footer | `footer-group` (shared) | adapt | Wordmark + 3-col links + legal/"Results vary" line. | footer skin, tokens. | links; legal line. |

**New homepage section:** `ct-hero-bento` (block #3) — the only block ct-hero can't host.

---

## Phase 2 — PDP (`templates/product.json`) — blueprint order

| # | Design block | Section / snippet | Effort | What we do | CSS approach | Test |
|---|---|---|---|---|---|---|
| 1 | Trust marquee | `ct-trust-marquee` | reuse | as homepage #1. | tokens. | scrolls. |
| 2 | Header | `header-group` | adapt | "Choose System" CTA. | header skin. | sticky. |
| 3 | **Buy box** (gallery ⟷ panel) | `ct-product-buy` | adapt | Gallery (already single-hero + dots + arrows from prior work) + panel: breadcrumb, `ct-rating-stars` chip, H1, 4 bullets, price+was+%off, free-ship line, **bundle selector = 3 distinct variants** (Basic/Core/Complete, each own price+compare+"Best Value"), full-width ATC, trust row, payment chips. | **extend tier block to bind a variant per bundle** (variant picker per block) instead of qty-multiplier; per-bundle struck compare + flag + includes line; tokens + Saira price in orange; hard-lift on selected. | price/compare/%off from `variant`; ATC → `/cart/add.js`; bundle switch updates price; gallery uncropped. |
| 4 | Spec marquee | `ct-trust-marquee` | reuse | orange spec ticker. | band variant. | scrolls. |
| 5 | Why-not-$39 | `ct-comparison` | adapt | Intro split (eyebrow/headline/lead) + 2-col $39-vs-System × 5 rows. | add intro copy column (or precede with a text block); highlight "us" column. | table; scroll ≤620. |
| 6 | What's in the Box | `ct-icon-columns` | adapt | 6 icon-left items, one "Complete-only" dimmed. | allow 6 blocks + per-block dim/muted tone toggle. | layout; dim state. |
| 7 | How It Works (7 actions) | `ct-steps` | adapt | 7 numbered cards, 4-up grid. | allow 7 blocks + 4-col wrap. | layout. |
| 8 | Exercise Map (6 zones) | `ct-feature-blocks` *(adapt-leaning-new)* | adapt/new | Body-figure media card (left) + 2-col numbered zone list (right). **Decision point** below. | figure/media column + numbered zone list; if ct-feature-blocks can't host the side figure cleanly → small NEW `ct-exercise-map`. | figure + 6 zones; stacks. |
| 9 | First 7 Days | `ct-timeline` | adapt | 7 vertical day milestones (D1–D7), round day badges. | 7 blocks + vertical connector + day-badge style. | layout. |
| 10 | Verified Reviews | `ct-reviews` | adapt | Big score (4.7 + "collected via Judge.me") + 3 objection-question cards. | big-score header; live bind. | empty if no data. |
| 11 | FAQ | `ct-faq` | reuse | 7 items. | tokens. | toggles. |
| 12 | Energy band | `ct-cta-banner` | adapt | dark energy CTA anchoring to buy box. | energy-band variant (shared with homepage #15). | anchor scroll. |
| 13 | Footer | `footer-group` | adapt | as homepage. | skin. | links. |
| 14 | Sticky ATC + toast | `ct-sticky-atc` + `ct-toast` | reuse | fixed bar (name/bundle, was+price, ATC), reveal after buy CTA scrolls out; toast on add. | 3px orange top border token; ensure it tracks the selected bundle variant. | reveals; clears footer; toast. |

**JSON-LD:** exactly one Product object, AggregateOffer $149–199 USD, **no** `aggregateRating` until real reviews.
**New PDP section (only if needed):** `ct-exercise-map` (block #8) — decide reuse vs build after a closer look at `ct-feature-blocks`.

---

## Phase 3 — Cart (`templates/cart.json`) — Forge skin on Dawn natives

| # | Design block | Section / snippet | Effort | What we do | CSS approach | Test |
|---|---|---|---|---|---|---|
| 1 | Trust marquee | `ct-trust-marquee` | reuse | shared (header-group level). | tokens. | scrolls. |
| 2 | Header (+"Keep shopping") | `header-group` | adapt | ghost "← Keep shopping" CTA. | header skin. | link. |
| 3 | Heading band ("Your system.") | `main-cart-items` title region | adapt | eyebrow + kinetic heading + live count line. | restyle title block; bind count to `cart.item_count`. | count updates. |
| 4 | Cart line items | `main-cart-items` (Dawn) | adapt | **Forge skin only** — native component owns qty/remove/AJAX/empty toggle. | `component-cart-items.css` overrides scoped to a cart wrapper class: 96px thumb on orange-tint, Saira orange bundle meta, was+%off badge. | qty/remove via `/cart/change.js`; re-render. |
| 5 | Upgrade nudge (dashed) | `ct-cart-upsells` (snippet wired in footer) | adapt | one-tap "Upgrade to next bundle +$X" via Dawn `<product-form>`. | dashed-orange tinted banner; commerce via product-form, not JS. | adds via AJAX; hides at top tier. |
| 6 | Returns reassurance | `ct-icon` + fine print | reuse | static 90-day-returns line w/ return glyph. | inline note in cart column. | renders. |
| 7 | Order summary (sticky) | `main-cart-footer` (Dawn) + `ct-cart-savings` | adapt | native subtotal/total/checkout; drop in `ct-cart-savings` (green "You're saving", auto-hide at 0); FREE shipping + returns rows; payment icons (native); warranty note. | `component-totals.css` overrides: ink border + `var(--ct-shadow-lift)`, mega total Saira; scoped. | totals bind to `cart`; checkout → `/checkout`; savings auto-hide. |
| 8 | Empty state | `main-cart-items` is-empty | adapt | Forge copy + "Start with Core System" CTA (price from variant). | restyle built-in empty block; CTA → PDP. | shows when `cart == empty`. |
| 9 | Footer (slim) | `footer-group` | reuse | minimal footer via existing settings. | skin. | renders. |

**No new cart section** — Dawn natives own real cart state; ct-* layer on top.

---

## Summary of build effort
- **Reuse (settings/content only):** ct-trust-marquee ×N, ct-icon-columns (Who), ct-steps (How), ct-timeline (Journey), ct-faq, ct-sticky-atc, ct-video-gallery, ct-cart-savings, footer/header groups.
- **Adapt (variant/blocks/CSS):** ct-hero? (no→new), ct-stats (dark proof strip), ct-steps (5 pillars / 7 actions), ct-comparison (3rd col / intro split), ct-reviews (big score), ct-pricing-table (compare-at+pay+lift), ct-cta-banner (energy band), ct-feature-blocks (friction / exercise map), ct-icon-columns (6 + dim), ct-product-buy (bundle→variant), main-cart-items / main-cart-footer (Forge skin), ct-cart-upsells (upgrade nudge).
- **New (only candidates):** `ct-hero-bento` (definite), `ct-exercise-map` (only if ct-feature-blocks can't host the figure+zones).

## Open decisions (need your call before building)
1. **Bento hero** — new `ct-hero-bento` (recommended) vs cram into `ct-hero`.
2. **Bundles** — does the product have 3 real variants (Basic/Core/Complete) at different prices, or build variant-ready with placeholder GIDs to wire later?
3. **Exercise Map** — accept an adapt of `ct-feature-blocks`, or allow one small new `ct-exercise-map` section?
4. **Sequence** — Foundation → Homepage → PDP → Cart (recommended), one page at a time so you QA each.
