# Dawn Theme Framework v5.0

**Dawn 15.4.1 · Minimals Design System · Shrine Pro as reference · May 2026**


Design system: Minimals (light mode, Public Sans, green #00A76F). Dawn handles commerce. We handle the design system. Shrine Pro is our reference — not our codebase. We studied their cart upsells, sticky ATC, email popup, thank you page, and PDP tabs. We adapt those patterns into Dawn using clean CSS + scoped Liquid. The design system HTML (dawn-design-system.html) is the authoritative component reference — 45+ components, all states, all motion patterns.


## Table of Contents

- [01 · Mental Model — Three things we learned — corrected from v4](#01)
- [02 · Design Token System — Minimals tokens — one file — the only thing that changes per brand](#02)
- [03 · Design System Layer — Not just CSS — CSS plus controlled Liquid edits](#03)
- [04 · Controlled Liquid Edit Map ★ NEW — Exact edits to Dawn files — what, where, why CSS cannot do it alone](#04)
- [05 · Design Demo ★ NEW — Required before any Liquid edit — not optional](#05)
- [06 · Key Patterns — Six patterns — document once, apply to every component](#06)
- [07 · Form System — Shrine's approach — one pattern applied everywhere](#07)
- [08 · Component Library — v1 Lean Set — 25 components — what each needs, what Shrine does, what we adapt](#08)
- [09 · JS Utilities — Full Code — 8 files · ~260 lines · our genuine performance advantage over Shrine](#09)
- [10 · Build Workflow — Design to live store — the correct order](#10)
- [11 · Phases &amp; Tasks — Six phases — each gates the next](#11)
- [12 · Claude Implementation Prompt ★ — Paste at the start of every implementation session](#12)
- [13 · Audit Checklist ★ — Run after every phase — updated in v5 with Liquid edit checks](#13)
---

## 01 · Mental Model — Three things we learned — corrected from v4

_These three facts change every decision in this document._

**Fact 1 — corrected from v4**  
Shrine is NOT built on DawnShrine Pro is a completely original OS 2.0 theme built from scratch. Shopify Theme Store rules actually prohibit Dawn-derived themes. Shrine sells direct at shrine.io. Their cart, their cards, their PDP — all original Liquid they wrote themselves. This is why their features slot in cleanly: they own every line of HTML.
  **Fact 2 — corrected from v4**  
Shrine uses jQuery + Slick.jsForum analysis of Shrine's actual code confirms jquery.js + slick.min.js in their theme.liquid. This is why their mobile PageSpeed is 64. Dawn scores 94. Our vanilla JS approach targets ≥70 — we will outperform Shrine on mobile while matching their features.
  **Fact 3 — our approach**  
We use Dawn + controlled Liquid editsWe start from Dawn (better commerce, better performance). We add our design system. We make controlled, documented edits to specific Dawn Liquid files to add the visual slots that CSS cannot create. Shrine is our reference — we study how they solve the problem, we adapt the pattern, we never copy their files.


  64Shrine mobilejQuery + Slick overhead
  94Dawn mobileVanilla JS baseline
  ≥70Our targetFeatures + performance
  ≥90Desktop targetAll devices

 c-purple">The design demo is the foundation. Shrine's features work seamlessly because they own every line of HTML. We need the design demo to define our HTML structure before writing any Liquid. Without the demo, class names are invented. With the demo, every Liquid edit is just making the HTML real in Shopify.

  **Layer 3 — Component Library**  
25 ct-* sectionsCustom Liquid sections. Schema-driven content. Per-section color_scheme for independent light/dark. Modular — stores pick what they need. Referenced against Shrine Pro patterns.
  **Layer 2 — Design System**  
Tokens + controlled Liquid edits52 CSS tokens applied everywhere. Controlled edits to 4 Dawn files add visual slots CSS cannot create. After Phase 0, Dawn's native sections already look on-brand.
  **Layer 1 — Commerce Engine**  
Dawn 15.4.1 — frozenProduct form, variant picker, cart logic, checkout, media gallery. CSS-only visual changes to commerce logic. Zero structural edits. Zero JS edits to Dawn's JS files.
---

## 02 · Design Token System — Minimals tokens — one file — the only thing that changes per brand

_All live in_

 c-blue">Why Liquid snippet, not CSS file? Dawn generates its color variables as RGB triples from settings_data.json — e.g. --color-foreground: 18, 18, 18. A Liquid snippet lets us read from Theme Editor font_picker, color, and range settings so merchants change brand values without code. We add our --ct-* namespace on top — we never override Dawn's --color-* variables.
| Group | Tokens | Purpose | Source |
|---|---|---|---|
| Backgrounds (4) | --ct-bg / --ct-bg-surface / --ct-bg-raised / --ct-bg-overlay | Page / cards / hover states / modal backdrop | Hardcoded — change per brand |
| Text (4) | --ct-text / --ct-text-2 / --ct-text-3 / --ct-text-off | Primary / body / muted / disabled | Hardcoded — change per brand |
| Accent (4) | --ct-accent / --ct-accent-hover / --ct-accent-text / --ct-accent-subtle | Brand primary + all states | From Theme Editor color_accent settings |
| Interactive (4) | --ct-focus / --ct-link / --ct-error / --ct-success | Focus ring / links / error / success | #dc2626 / #16a34a |
| Borders (3) | --ct-border / --ct-border-strong / --ct-border-subtle | Cards+inputs / focused / faint | #e5e7eb / #9ca3af / #f3f4f6 |
| Semantic (3) | --ct-sale / --ct-star / --ct-skeleton | Sale price / rating stars / loading shimmer | #dc2626 / #f59e0b / #f3f4f6 |
| Type — families (3) | --ct-font-heading / --ct-font-body / --ct-font-mono | H1–H6 / body / prices | From Theme Editor font_picker |
| Type — scale (7) | --ct-text-xs → --ct-text-4xl | 12px → 48px fluid (clamp) | Fixed scale — see token file code |
| Type — weight (4) | --ct-fw-normal/medium/semi/bold | 400 / 500 / 600 / 700 | Fixed values |
| Type — leading (3) | --ct-leading-tight/base/loose | 1.15 / 1.6 / 1.78 | Headings / body / relaxed |
| Space (8) | --ct-space-1 → --ct-space-10 | 4px → 128px geometric scale | Fixed — 4,8,12,20,32,48,80,128px |
| Layout (2) | --ct-mw / --ct-gutter | Max-width / side padding | From Theme Editor page_width |
| Radius (4) | --ct-r-sm/md/lg/pill | 4 / [editor] / [editor+4] / 9999px | --ct-r-md from Theme Editor border_radius |
| Elevation (3) | --ct-shadow-sm/md/lg | Cards / drawers / modals | Fixed shadows — see code |
| Motion (6) | --ct-dur-fast/base/slow + --ct-ease-out/spring/in-out | 120ms/240ms/480ms + cubic-beziers | Auto-zero via prefers-reduced-motion |
| Glass (1) | --ct-glass | Frosted surface opacity | From Theme Editor glass_opacity |
snippets/css-variables.liquid/* snippets/css-variables.liquid — THE ONLY FILE THAT CHANGES PER BRAND */
/* Design system: Minimals — light mode, Public Sans, green brand */
```liquid
{%- liquid
```
  assign fh = settings.font_heading | font_face
  assign fb = settings.font_body    | font_face
-%}
```liquid
{{ fh }}{{ fb }}
<style>
```
/* ── Light mode lock — mandatory, never remove ── */
:root { color-scheme: only light }
html {
  color-scheme: only light;
  forced-color-adjust: none;
  background: #F4F6F8 !important;
  color: #212B36 !important;
}
body { background: #F4F6F8 !important; color: #212B36 !important; }

:root {
  /* Backgrounds */
  --bg-base:#F4F6F8; --bg-layer:#F9FAFB; --bg-elevated:#FFFFFF;
  --bg-control:rgba(145,158,171,.08); --bg-ctrl-h:rgba(145,158,171,.16);
  --bg-overlay:rgba(22,28,36,.80);

  /* Text */
  --tx1:#212B36; --tx2:#637381; --tx3:#919EAB; --tx4:#C4CDD0;

  /* Strokes — grey-tinted rgba (Minimals signature) */
  --str1:rgba(145,158,171,.32); --str2:rgba(145,158,171,.20);
  --str3:rgba(145,158,171,.12); --str4:rgba(145,158,171,.06);

  /* Shadows */
  --sh2:0 1px 2px rgba(145,158,171,.14);
  --sh4:0 4px 8px rgba(145,158,171,.16);
  --sh8:0 8px 16px rgba(145,158,171,.18);
  --sh16:0 16px 32px rgba(145,158,171,.20);
  --sh28:0 20px 40px rgba(145,158,171,.24);

  /* Brand — Minimals green */
  --brand:#00A76F; --brand-rest:#007867; --brand-fg:#007867;
  --brand-fg2:#004B50; --brand-bg2:#C8FAD6; --brand-str:#5BE49B;
  --brand-glow:rgba(0,167,111,.16);

  /* Semantic */
  --success-main:#22C55E; --success-dark:#15803D; --success-lighter:#D3FCD2;
  --warning-main:#FFAB00; --warning-dark:#B76E00; --warning-lighter:#FFF5CC;
  --error-main:#FF5630;   --error-dark:#B71D18;   --error-lighter:#FFE9D5;

  /* Ecommerce */
  --ct-price:#212B36; --ct-price-was:#919EAB; --ct-price-save:#007867;
  --ct-badge-sale:#B71D18; --ct-badge-new:#00A76F; --ct-rating:#FFAB00;
  --ct-touch:48px; --ct-stock-in:#007867; --ct-stock-low:#B76E00; --ct-stock-out:#919EAB;

  /* Radius */
  --r-s:4px; --r-m:8px; --r-l:12px; --r-xl:16px; --r-pill:9999px;

  /* Focus */
  --focus:0 0 0 2px #F4F6F8,0 0 0 4px #007867;

  /* Typography */
  --font:'Public Sans',system-ui,sans-serif;
  --mono:'DM Mono',monospace;
  --mw:1120px;
}
```liquid
</style>
```
---

## 03 · Design System Layer — Not just CSS — CSS plus controlled Liquid edits

_The design system layer covers two things: visual overrides applied via CSS, and the markup slots that CSS alone cannot create. Both are required before any custom section is built. After Phase 0, Dawn's native sections already look on-brand._

 c-amber">The key correction from v4: Previous versions said "CSS only" for product card overlays, cart drawer progress bars, and trust chips. This is wrong. CSS cannot insert new HTML elements — it can only style existing ones. These features require controlled Liquid edits to specific Dawn files. The edits are small, safe, and documented precisely in Section 04.### What theme-overrides.css handles (CSS layer)
_All visual styling. All values use --ct-* token variables. No hardcoded colors anywhere._

| Dawn component | Problem | Our CSS fix |
|---|---|---|
| Root / body typography | Dawn inline style block hardcodes html{font-size:62.5%} and body{letter-spacing:0.06rem} — external CSS cannot override inline style | Patch INSIDE Dawn's existing {%- style -%} block in theme.liquid. Set html{font-size:16px!important} and body{letter-spacing:normal!important} |
| All headings | Inconsistent sizes per section, default Assistant font | Apply --ct-font-heading + --ct-text-* scale to all h1–h6 |
| Buttons — global | Inconsistent across header/cart/PDP. Browser-default focus ring. | Unified style: --ct-accent, --ct-r-md, hover lift translateY(-1px), :focus-visible via --ct-focus, .is-loading/.is-success states |
| Product cards — visual | Square image, no hover state, generic "Sale" badge | Locked aspect ratio, hover overlay visibility (CSS), badge system: % off / New / Sold out. NOTE: overlay and second image WRAPPERS require Liquid edit — see Section 04 |
| Variant swatches | Radio buttons, color chip only | Hide radios opacity:0;position:absolute. Style labels as pill/swatch buttons. :checked → selected scale. Sold-out diagonal strikethrough |
| Rating stars | SVGs use currentColor → render white on many surfaces | .rating__stars svg{fill:var(--ct-star)} |
| Cart notification | Completely unstyled — browser defaults | Full restyle: bg, border, radius, shadow, font via --ct-* tokens |
| Cart drawer | Flat white, no visual hierarchy | Apply --ct-bg, --ct-border, --ct-font-body. Glass option via --ct-glass. NOTE: progress bar and upsell slot require Liquid edit — see Section 04 |
| Header | Default font, no glass sticky option | Apply --ct-font-body. Sticky glass via CSS background:rgba(255,255,255,var(--ct-glass)) |
| Badges (sale/new/sold-out) | Just "Sale" text, no system | .badge--sale: --ct-sale. .badge--new: --ct-accent. .badge--sold-out: muted. Consistent --ct-r-sm |
| Inputs / search | Placeholder disappears on type, browser focus | Floating label pattern via .ct-field wrapper. Focus border via --ct-border-strong |
| Scroll reveal base | Everything renders static | [data-reveal]: opacity:0;transform:translateY(20px). .is-visible: animates using --ct-dur-slow + --ct-ease-out |
| Skeleton shimmer | Nothing | .ct-skeleton: animated gradient using --ct-skeleton token |
| Pagination, filters, tags | Browser defaults, inconsistent | Apply border, radius, font, color tokens throughout |
theme.liquid patch/* In theme.liquid — PATCH INSIDE Dawn's existing {%- style -%} block */
/* NOTE: No Liquid tags {% %} inside CSS comments in style blocks — fatal parser error */
```liquid
{%- style -%}
```
  /* === Dawn's generated variables above this line === */
  html { font-size: 16px !important; }
  body { letter-spacing: normal !important; }
```liquid
  {%- render 'css-variables' -%}
{%- endstyle -%}

liquid
{{ 'theme-overrides.css' | asset_url | stylesheet_tag }}
<script src="{{ 'ct-swipe.js'      | asset_url }}" defer></script>
<script src="{{ 'ct-reveal.js'     | asset_url }}" defer></script>
<script src="{{ 'ct-accordion.js'  | asset_url }}" defer></script>
<script src="{{ 'ct-countup.js'    | asset_url }}" defer></script>
<script src="{{ 'ct-ba.js'         | asset_url }}" defer></script>
<script src="{{ 'ct-scrollspy.js'  | asset_url }}" defer></script>
<script src="{{ 'ct-sticky-atc.js' | asset_url }}" defer></script>
<script src="{{ 'ct-quickview.js'  | asset_url }}" defer></script>
```
---

## 04 · Controlled Liquid Edit Map ★ NEW — Exact edits to Dawn files — what, where, why CSS cannot do it alone

_These are the only Dawn files we touch. Every edit is additive — we insert new markup slots. We never remove, reorder, or rewrite existing Dawn logic. Commerce behavior is untouched._

 c-blue">How Shrine solves this: Shrine wrote their own cart-drawer.liquid, card-product.liquid, and buy-buttons.liquid from scratch — so adding progress bars, overlays, and trust chips cost them nothing. We start from Dawn, so we make these targeted edits. The rule: add markup slots only. Never touch form logic, variant logic, price logic, or cart submission.
| File | What we add | Why CSS alone fails | Risk | Demo reference |
|---|---|---|---|---|
| snippets/card-product.liquid | (1) Second image  inside a .ct-card__img-2 wrapper. (2) Hover overlay  with Quick View + ATC buttons. (3) % off badge  with Liquid calculation. | CSS cannot insert new HTML elements. The second image and overlay do not exist in Dawn's card markup — we must add them. | Low — additive only. Dawn's ATC, swatch, and grid logic untouched. | Card component in design demo |
| snippets/cart-drawer.liquid | (1) Free shipping progress bar  at top of drawer, driven by cart.total_price Liquid. (2) Upsell product slot  — rendered as a Dawn app block for Theme Editor control. (3) Trust badge row  above checkout button. | Cart drawer HTML is fixed — CSS cannot insert a progress bar, an upsell row, or a trust badge row. Only Liquid render can add markup inside the drawer. | Low-Medium — we add slots above/below existing Dawn markup. Cart form, checkout button, line items untouched. | Cart drawer state in design demo |
| snippets/buy-buttons.liquid | Trust chip grid  below the ATC button. 4 chips: shipping, returns, warranty, cancel. Schema-driven — content editable in Theme Editor. | Trust chips below ATC do not exist in Dawn. CSS cannot place elements relative to the ATC button. | Low — purely additive. Buy button form, dynamic checkout buttons untouched. | PDP buybox in design demo |
| config/settings_schema.json | New global settings group: color_accent, color_accent_hover, color_accent_label, font_heading, font_body, border_radius (range 0–24), page_width (range 1000–1400), glass_opacity (range 0–1), enable_animations (checkbox). | Token file reads from settings.* variables — these settings must exist for the Liquid to resolve. | Zero — purely additive JSON. Existing Dawn settings untouched. | — |
| layout/theme.liquid | Patch inside existing {%- style -%} block: font-size fix + token snippet render. Load override CSS. Load 8 JS utilities with defer. | Font-size and letter-spacing are inline — external CSS cannot override. Token snippet must render inside a  tag to work. | Very low — we append to existing block. Dawn layout structure untouched. | — |
snippets/card-product.liquid — additions{%- comment -%}
  snippets/card-product.liquid — ADD these three blocks to Dawn's existing card markup
  Find the existing product image img tag and wrap it, then add the overlay after
```liquid
{%- endcomment -%}

liquid
{%- comment -%} FIND: Dawn's existing image output. WRAP IT with: {%- endcomment -%}
<div class="ct-card__img-wrap">
  {%- comment -%} Dawn's existing image tag goes here — untouched {%- endcomment -%}

liquid
  {%- comment -%} ADD: Second image (crossfade on hover) {%- endcomment -%}
  {%- if card_product.images.size > 1 -%}
    <img
```
      src="{{ card_product.images[1] | image_url: width: 600 }}"
      alt="{{ card_product.images[1].alt | escape }}"
      width="{{ card_product.images[1].width }}"
      height="{{ card_product.images[1].height }}"
      loading="lazy"
      class="ct-card__img-2"
    >
```liquid
  {%- endif -%}

liquid
  {%- comment -%} ADD: % off badge {%- endcomment -%}
  {%- if card_product.compare_at_price > card_product.price -%}
    {%- assign pct = card_product.compare_at_price | minus: card_product.price
```
                     | times: 100 | divided_by: card_product.compare_at_price -%}
```liquid
    <span class="badge badge--sale">-{{ pct }}%</span>
  {%- endif -%}

liquid
  {%- comment -%} ADD: Hover overlay with Quick View trigger {%- endcomment -%}
  <div class="ct-card__overlay" aria-hidden="true">
    <button
```
      class="ct-card__qv-btn"
      data-quickview
      data-url="{{ card_product.url }}?section_id=main-product"
      aria-label="Quick view {{ card_product.title | escape }}"
    >Quick View</button>
```liquid
  </div>
</div>snippets/cart-drawer.liquid — additions{%- comment -%}
```
  snippets/cart-drawer.liquid — ADD three slots
  (1) Free shipping bar — add near top of drawer, before cart-items
  (2) Upsell slot — add after cart-items, before footer
  (3) Trust row — add inside drawer footer, above checkout button
```liquid
{%- endcomment -%}

liquid
{%- comment -%} SLOT 1: Free shipping bar {%- endcomment -%}
{%- assign threshold = settings.free_shipping_threshold | default: 5000 -%}
{%- assign remaining = threshold | minus: cart.total_price -%}
{%- assign pct = cart.total_price | times: 100 | divided_by: threshold | at_most: 100 -%}
<div class="ct-cart__bar">
  {%- if remaining > 0 -%}
    <p class="ct-cart__bar-text">
```
      Add {{ remaining | money }} for <strong>free shipping</strong>
```liquid
    </p>
  {%- else -%}
    <p class="ct-cart__bar-text ct-cart__bar-text--reached">✓ You've unlocked free shipping!</p>
  {%- endif -%}
  <div class="ct-cart__bar-track">
    <div class="ct-cart__bar-fill" style="width:{{ pct }}%"></div>
  </div>
</div>

liquid
{%- comment -%} SLOT 3: Trust row — add above checkout button {%- endcomment -%}
<div class="ct-cart__trust">
  <span>?? Secure checkout</span>
  <span>?? Free shipping over {{ threshold | money }}</span>
  <span>↩️ 90-day returns</span>
</div>
```
---

## 05 · Design Demo ★ NEW — Required before any Liquid edit — not optional

_The design demo is a standalone HTML file that shows every component in its final visual state with our token system applied. It is built first. All Liquid is written to match it. This is what eliminates invented class names._

 c-purple">Why Shrine's features work seamlessly: They own every line of HTML. We don't — Dawn owns the HTML. The design demo is how we define our HTML structure before Dawn constrains us. Demo first → Liquid matches it. This is the only way to avoid invented class names.
| Demo must cover | States to show | Purpose |
|---|---|---|
| Global — Header | Default, sticky (scrolled), mobile (hamburger open) | Defines header CSS class names used in theme-overrides.css |
| Global — Cart drawer | Empty state, with items, free shipping bar at 40%/100%, upsell row, trust badges | Defines ct-cart__bar, ct-cart__upsell, ct-cart__trust class names |
| Global — Cart notification | Product just added toast | Defines cart-notification CSS |
| Global — Announce bar | Single message, rotating (2 messages visible) | Defines ct-announce class names |
| Product card | Default, hover (overlay visible), sold out, sale badge, new badge | Defines ct-card__overlay, ct-card__img-2, badge class names |
| Variant swatches | Color swatch default/selected/sold-out, Size pill default/selected | Defines swatch CSS over Dawn radios |
| Buttons | Default, hover, focus, loading (.is-loading), success (.is-success) | Defines button state CSS applied globally |
| Form inputs | Default (floating label down), focused (label up), filled (label up), error | Defines ct-field pattern CSS |
| Homepage — all 10 sections | Desktop layout, mobile layout (375px) | Defines HTML structure + class names for all ct-* sections |
| PDP — full page | Buybox (variant selected, ATC idle), sticky ATC bar visible, anchor nav active state | Defines HTML for every PDP component |
| Collection page | Grid with mixed card states, filter sidebar open/closed | Defines collection CSS enhancements |
 c-green">Design demo rules:
1. Demo uses our token system (--ct-* variables) — shows the real visual output
2. Every class name in the demo is intentional — these become the class names in Liquid
3. Demo HTML structure defines what Liquid emits — Liquid must match, not the other way around
4. Demo is brand-agnostic — uses generic placeholder content, not brand-specific copy
5. Demo is the source of truth for both the Dawn implementation and any Shrine reskin
6. Demo must be completed before writing any section Liquid file### How the demo feeds into implementation

| Demo element | → Where it goes |
|---|---|
| .ct-card__overlay HTML structure | → Copied exactly into snippets/card-product.liquid Liquid edit |
| .ct-cart__bar HTML structure | → Copied exactly into snippets/cart-drawer.liquid Liquid edit |
| .ct-hero section HTML | → Defines the HTML scaffold for sections/ct-hero.liquid |
| .ct-field form pattern | → Applied in every ct-* section that has an input |
| Token values visible in context | → Confirms token decisions before any Liquid is written |
| Mobile layout at 375px | → Defines responsive CSS breakpoints before implementation |

---

## 06 · Key Patterns — Six patterns — document once, apply to every component

_These patterns are used across all 25 components. They come from studying Shrine Pro's approach and adapting it to our Dawn-based architecture._

### Pattern 1 — Scroll reveal (from Shrine's animation approach)
Shrine uses scroll-triggered animations on every section. We replicate this with IntersectionObserver + CSS classes. Add data-reveal to any element. Add data-delay="120" for stagger.Pattern 1 — scroll reveal<!-- HTML in every animated section -->
```liquid
<div class="ct-trust__item" data-reveal data-delay="{{ forloop.index0 | times: 80 }}">
```

/* CSS in theme-overrides.css */
[data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity var(--ct-dur-slow) var(--ct-ease-out),
              transform var(--ct-dur-slow) var(--ct-ease-out);
}
[data-reveal].is-visible { opacity: 1; transform: translateY(0); }### Pattern 2 — Per-section color scheme (Shrine does this for every section)
_Every ct-* section exposes a color_scheme setting. Merchants pick light or dark per section independently in Theme Editor. Dawn handles the background and text via its own scheme system._
Pattern 2 — color scheme{%- comment -%} Apply to the section tag in every ct-*.liquid {%- endcomment -%}
```liquid
<section class="ct-hero color-{{ section.settings.color_scheme }} gradient">

liquid
{%- comment -%} Add to schema settings in EVERY ct-*.liquid {%- endcomment -%}
```
{ "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" }### Pattern 3 — Image with all required Shopify attributes
_Required for performance and Theme Store compliance. Use in every section with images._
Pattern 3 — image{%- if section.settings.image != blank -%}
```liquid
  {%- assign img = section.settings.image -%}
  <img
```
    src="{{ img | image_url: width: 800 }}"
    srcset="{{ img | image_url: width: 400 }} 400w,
```liquid
            {{ img | image_url: width: 800 }} 800w,
            {{ img | image_url: width: 1200 }} 1200w"
```
    sizes="(max-width: 600px) 100vw, 50vw"
    width="{{ img.width }}" height="{{ img.height }}"
    alt="{{ img.alt | escape }}" loading="lazy"
  >
```liquid
{%- else -%}
  {{ 'product-1' | placeholder_svg_tag: 'placeholder-svg' }}
{%- endif -%}### Pattern 4 — Button loading/success states (Shrine's ATC feedback approach)
```
_Shrine shows a spinner during ATC, then a checkmark on success. We replicate this with CSS classes toggled by JS on Dawn's own events — no custom fetch._
Pattern 4 — button states/* CSS in theme-overrides.css */
.button { position: relative; transition: background var(--ct-dur-base) var(--ct-ease-out); }
.button.is-loading { pointer-events: none; color: transparent; }
.button.is-loading::after {
  content: ''; position: absolute; inset: 50% auto auto 50%;
  width: 16px; height: 16px; margin: -8px 0 0 -8px;
  border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%; animation: ct-spin 0.6s linear infinite;
}
.button.is-success { background: var(--ct-success) !important; }
@keyframes ct-spin { to { transform: rotate(360deg); } }

/* Cart badge pulse on add — listen to Dawn's own event */
document.addEventListener('cart:add', () => {
  document.querySelector('.cart-count-bubble')?.classList.add('ct-pulse');
  setTimeout(() => document.querySelector('.cart-count-bubble')?.classList.remove('ct-pulse'), 400);
});
@keyframes ct-pulse { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
.ct-pulse { animation: ct-pulse 0.4s var(--ct-ease-spring); }### Pattern 5 — Variant swatch upgrade (CSS only — Shrine's approach adapted)
_Shrine renders card-style variant pickers. We replicate this by hiding Dawn's radio inputs with CSS and styling the labels. Zero JS. Zero commerce logic change._
Pattern 5 — variant swatches/* CSS in theme-overrides.css — hide Dawn radios, style labels as swatches */
.variant-picker .swatch input[type="radio"] {
  position: absolute; opacity: 0; width: 0; height: 0;
}
.variant-picker .swatch label {
  display: flex; align-items: center; justify-content: center;
  min-width: 36px; height: 36px; padding: 0 12px;
  border: 2px solid var(--ct-border); border-radius: var(--ct-r-sm);
  cursor: pointer; font-size: var(--ct-text-sm); font-weight: var(--ct-fw-semi);
  transition: border-color var(--ct-dur-fast) var(--ct-ease-out),
              transform    var(--ct-dur-fast) var(--ct-ease-out);
}
/* Selected — driven by Dawn's :checked, zero JS */
.variant-picker .swatch input:checked + label {
  border-color: var(--ct-accent); transform: scale(1.06);
}
/* Sold out — diagonal CSS strikethrough */
.variant-picker .swatch.disabled label { opacity: 0.45; position: relative; }
.variant-picker .swatch.disabled label::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg,transparent 45%,var(--ct-border-strong) 46%,var(--ct-border-strong) 54%,transparent 55%);
}### Pattern 6 — Skeleton shimmer (used in quick view modal)
Pattern 6 — skeleton/* CSS in theme-overrides.css */
.ct-skeleton {
  background: linear-gradient(90deg, var(--ct-skeleton) 25%, var(--ct-bg-raised) 50%, var(--ct-skeleton) 75%);
  background-size: 200% 100%; border-radius: var(--ct-r-md);
  animation: ct-shimmer 1.4s ease infinite;
}
@keyframes ct-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
---

## 07 · Form System — Shrine's approach — one pattern applied everywhere

_Shrine uses floating labels and animated feedback on every form. We replicate this with the ct-field pattern. Never replaces Dawn's form logic — wraps and enhances the visual layer only._

 c-red">Rule: Never replace Dawn's <form> tags, input name attributes, or the product-form custom element. Add wrapper divs and classes around them. Commerce untouched.ct-field pattern — applied to all forms<!-- HTML: wrap any input with this structure -->
```liquid
<div class="ct-field">
  <input class="ct-field__input" type="email" id="ct-email"
```
    name="contact[email]" placeholder=" " autocomplete="email" required>
```liquid
  <label class="ct-field__label" for="ct-email">Email address</label>
  <div class="ct-field__error" role="alert" aria-live="polite"></div>
</div>
```

/* CSS in theme-overrides.css */
.ct-field { position: relative; margin-bottom: var(--ct-space-3); }
.ct-field__input {
  width: 100%; padding: 20px var(--ct-space-3) 8px;
  font-family: var(--ct-font-body); font-size: var(--ct-text-base);
  color: var(--ct-text); background: var(--ct-bg-surface);
  border: 1.5px solid var(--ct-border); border-radius: var(--ct-r-md);
  outline: none; appearance: none;
  transition: border-color var(--ct-dur-base) var(--ct-ease-out);
}
.ct-field__input:focus { border-color: var(--ct-border-strong); box-shadow: var(--ct-focus); }
.ct-field__label {
  position: absolute; left: var(--ct-space-3); top: 50%;
  transform: translateY(-50%); font-size: var(--ct-text-base);
  color: var(--ct-text-3); pointer-events: none;
  transition: all var(--ct-dur-base) var(--ct-ease-out);
}
/* placeholder=" " trick: :not(:placeholder-shown) = has a value */
.ct-field__input:focus + .ct-field__label,
.ct-field__input:not(:placeholder-shown) + .ct-field__label {
  top: 10px; transform: translateY(0) scale(0.78); color: var(--ct-text-3);
}
.ct-field.has-error .ct-field__input { border-color: var(--ct-error); }
.ct-field__error { font-size: var(--ct-text-sm); color: var(--ct-error); margin-top: var(--ct-space-1); }
| Form | Dawn default | Our enhancement | Method |
|---|---|---|---|
| Email capture | Plain input + submit | Floating label + inline validation + loading spinner + animated success + privacy microcopy | ct-field CSS + minimal JS |
| Variant picker | Radio buttons + color chips | CSS card/swatch over hidden radios. Sold-out strikethrough. Selected scale. | CSS only |
| ATC button | Text changes to "Adding..." | Spinner overlay + checkmark on success + cart badge pulse | CSS classes + Dawn events |
| Search (predictive) | Text + thumbnail | CSS reskin: larger thumbnails, price shown. Skeleton while loading. | theme-overrides.css |
| Newsletter | Plain input + submit | ct-field floating label + animated success state | ct-field CSS |
| Contact / account | Browser defaults | All inputs use ct-field pattern | CSS only |

---

## 08 · Component Library — v1 Lean Set — 25 components — what each needs, what Shrine does, what we adapt

 c-blue">How to read this catalog: Each component shows the Dawn file it extends, whether it needs a Liquid edit (and what exactly), which JS utility it uses, and what Shrine Pro does for reference. "Shrine reference" means we studied their pattern and adapted it — not that we copied their code.### Global — always present on every page (5)
ct-announceAnnouncement BarCSS only~20Shrine ref: Multi-message with rotation, dismiss, countdownMulti-message rotation with auto-play and dismiss. Optional real countdown to a specific date. Background + text color per message. Schema: repeatable message blocks.Cart drawer enhancementsCart Drawer UpgradeLiquid editCSSShrine ref: Free shipping bar, upsell row, trust badges, payment icons, discount redirectFree shipping progress bar (Liquid: cart.total_price vs threshold). Upsell product slot (Dawn app block for Theme Editor control). Trust badges row. Discount code → /checkout?discount=CODE redirect.Header CSS layerHeader UpgradeLiquid editCSSShrine ref: Sticky glass on scroll, consistent font/colorSticky glass on scroll via CSS. Consistent font and color via tokens. Zero Liquid edits to header.liquid.ct-quickviewQuick View ModalCSS onlyct-quickview.jsShrine ref: Quick view on collection cardsFetches product section via Section Rendering API. Skeleton while loading. Full Dawn commerce inside modal — untouched.ct-scroll-topBack to TopLiquid edit~15Shrine ref: Scroll to top buttonAppears after 400px scroll. Smooth scrolls to top. Accessible: aria-label, keyboard focusable.### Homepage sections (10)
ct-hero.liquidHeroNew sectionct-revealShrine ref: Full-width hero with eyebrow, H1 gradient span, CTAsEyebrow pill, H1 with optional gradient text span, subtitle, feature pills row, two CTAs, image/video column. data-reveal stagger on text.ct-hero-split.liquidHero SplitNew sectionCSS onlyShrine ref: 50/50 editorial split layout50/50 split: large image left, text + CTA right. Optional reverse layout. No JS needed. Replaces Dawn image-with-text.ct-marquee.liquidBrand MarqueeNew sectionCSS onlyShrine ref: Infinite marquee for logos and trust statementsPure @keyframes infinite scroll strip. Logos, trust statements, shipping info. Pauses on hover. Replaces Dawn's announcement bar for marketing use.ct-stats.liquidStats CounterNew sectionct-countupShrine ref: Animated stats strip with count-up4 animated number stats with suffix and label. Count-up fires once on IntersectionObserver. Schema: number, suffix, label per block.ct-reviews.liquidReviews CarouselNew sectionct-swipeShrine ref: Swipeable review cards with photosDrag-scrollable carousel. Review cards: star rating, optional photo, quote, author, verified badge, date. Dot nav. Schema: repeatable review blocks.ct-trust-bar.liquidTrust / Icon BarNew sectionct-revealShrine ref: 4-column icon + title + body gridIcon (emoji or SVG) + title + body grid. Stagger reveal on scroll. Schema: repeatable chips. Replaces Dawn multicolumn for this use case.ct-ba.liquidBefore / After SliderNew sectionct-baShrine ref: Clip-path drag slider — core Shrine featureCSS clip-path drag divider. One Pointer Events handler covers mouse + touch. Static image fallback without JS. Schema: before image, after image, labels.ct-compare.liquidComparison TableNew sectionCSS onlyShrine ref: Sticky header comparison table — core Shrine featureCSS position:sticky header row. Highlighted brand column. Check / cross / dash icons. Schema: column names + repeatable feature rows.ct-faq.liquidFAQ AccordionExtends Dawnct-accordionShrine ref: ARIA accordion with one-open behaviorARIA-compliant. One open at a time. aria-expanded managed. Keyboard accessible. Schema: repeatable Q+A pairs.ct-email.liquidEmail CaptureExtends Dawnct-field CSS + JSShrine ref: Floating label email with animated successct-field floating label input. Inline email validation. Loading spinner on submit. Animated success state. Privacy microcopy. Klaviyo / Shopify Email hook.### PDP additions — below Dawn's buybox (7)
ct-mini-navPDP Anchor NavigationLiquid editct-scrollspyShrine ref: Sticky anchor nav with scroll spy active stateSticky nav bar below header. ct-scrollspy.js sets aria-current on active link as sections scroll into view. Schema: repeatable anchor items.Buybox CSS layerBuybox Visual UpgradeLiquid editCSS onlyShrine ref: Card-style variant picker, trust chips, swatch imagesCard-style variant picker (CSS over Dawn hidden radios). Swatch image via variant featured_image or metafield. Trust chips below ATC (Liquid edit). Zero edits to form logic.ct-aplusA+ Content BannersLiquid editct-revealShrine ref: Alternating image+text banners for feature deep-diveAlternating image+text banners. L/R flip on odd/even forloop index. data-reveal stagger. Schema: image, eyebrow, title, body, tags per block.ct-reviews-pdpReviews Grid + PhotosLiquid editct-swipeShrine ref: Review grid with optional photo strip per card3-column review card grid. Optional swipeable photo strip per card. Schema: stars, quote, author, date, verified, photo list.ct-faqFAQ — FullSharedct-accordionShrine ref: Same component, full item count on PDPSame ct-faq component. PDP shows all items. Homepage can show a subset with "see all" link to PDP FAQ anchor.ct-policiesPolicy CardsLiquid editCSS onlyShrine ref: Policy reassurance cards below FAQShipping / returns / cancellation / support — 4 cards with icon + title + bullet list. CSS only. Schema: icon, title, bullets per card.ct-sticky-atcSticky Add to CartLiquid editct-sticky-atcShrine ref: Sticky ATC bar — core Shrine Pro featureFixed bar at bottom. IntersectionObserver watches buybox. Shows title, variant, price. Submit triggers Dawn's native product-form requestSubmit() — zero custom cart logic.### Collection additions (3)
Product card upgradeCard Upgrade (CSS + Liquid)Liquid editCSS for styles, Liquid for structureShrine ref: Second image crossfade, hover overlay CTA, % off badgeSecond image crossfade on hover. Hover overlay with Quick View button. % off badge via Liquid calculation. Locked aspect ratio. All visual behavior CSS — structure added via Liquid edit.ct-quickviewQuick View — CollectionSharedct-quickviewShrine ref: Quick view modal without page leaveShared with global. Triggered by data-quickview button added in card Liquid edit. Fetches product section via Section Rendering API.Grid toggleColumn Toggle 2/3/4Liquid edit~20 lines JSShrine ref: Grid column toggle on collectionThree icon buttons switch CSS grid-template-columns. Active state persisted in sessionStorage.### Deferred to v2 — with honest reasons

| Component | Reason | What covers it in v1 |
|---|---|---|
| Bento / editorial grid | Not conversion-critical. Nice to have. | Dawn image-with-text restyled |
| Video hero (autoplay MP4) | Dawn native video section restyled covers the need | Dawn video section + CSS |
| Lookbook with hotspots | Requires metafields. High complexity. | ct-hero-split editorial layout |
| Product tabs | Dawn collapsible rows + ct-faq cover 80% of use cases | ct-faq + Dawn collapsible rows |
| Pricing table | Store-specific. Not universal. | ct-compare + variant picker cards |
| Featured on / logo bar | Nice to have, not conversion-critical | ct-marquee with logos |
| Bundle / quantity breaks | Requires Shopify Functions for real price logic | Variant picker with price variants |
| Gift with purchase | Cart logic complexity. Better as app. | Cart upsell slot (app block) |
| Recently viewed | localStorage + Section Rendering API. High complexity. | Dawn related products |
| Cookie consent bar | Legal requirements vary by region. Use app. | Defer to OneTrust/Pandectes app |
| Exit intent popup | Low conversion lift, high annoyance cost | ct-email capture section |
| Mega menu images | Dawn menu JS is complex and risky | CSS-only header reskin |
| Product tabs (complex) | Phase 2 — tabs add significant JS complexity | ct-faq accordion |
| Back in stock notify | App required (Klaviyo/Swym) | @app block placeholder |

---

## 09 · JS Utilities — Full Code — 8 files · ~260 lines · our genuine performance advantage over Shrine

 c-green">Performance context: Shrine Pro uses jQuery + Slick.js in their theme.liquid. This is why their mobile PageSpeed score is 64. Our vanilla JS approach (~260 lines, 8 files, all defer-loaded) is the reason we can target ≥70 mobile while matching Shrine's features. No frameworks. No npm. No build step.
| File | Lines | Trigger attribute | Shrine equivalent | Used by |
|---|---|---|---|---|
| ct-swipe.js | ~30 | data-swipe | Slick.js carousel drag | Reviews carousel, use-case cards, review photo strips |
| ct-reveal.js | ~30 | data-reveal + data-delay | Shrine scroll animation system | All animated sections |
| ct-accordion.js | ~40 | data-accordion / data-accordion-btn / data-accordion-panel | Shrine FAQ/collapsible logic | FAQ, product details |
| ct-countup.js | ~20 | data-countup data-to="4800" data-suffix="+" | Shrine stats counter | Stats counter strip |
| ct-ba.js | ~50 | data-ba + .ba-before/.ba-after/.ba-handle | Shrine before/after slider (one of their key features) | Before/after sections |
| ct-scrollspy.js | ~25 | data-scrollspy on nav | Shrine PDP anchor nav active state | PDP mini navigation |
| ct-sticky-atc.js | ~25 | id="buybox" on product section | Shrine sticky ATC bar | PDP sticky bar |
| ct-quickview.js | ~40 | data-quickview data-url="..." | Shrine quick view modal on collection | Collection cards, anywhere |
ct-swipe.js(function(){
  'use strict';
  function init(el){
    let startX,scrollLeft,dragging=false;
    el.style.cursor='grab';
    el.addEventListener('pointerdown',e=>{
      dragging=true;startX=e.pageX-el.offsetLeft;scrollLeft=el.scrollLeft;
      el.setPointerCapture(e.pointerId);el.style.cursor='grabbing';el.style.userSelect='none';
    });
    el.addEventListener('pointermove',e=>{
      if(!dragging)return;
      el.scrollLeft=scrollLeft-(e.pageX-el.offsetLeft-startX)*1.2;
    });
    ['pointerup','pointercancel'].forEach(ev=>el.addEventListener(ev,()=>{
      dragging=false;el.style.cursor='grab';el.style.userSelect='';
    }));
  }
  document.querySelectorAll('[data-swipe]').forEach(init);
})();ct-reveal.js(function(){
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(reduced){document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('is-visible'));return;}
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const delay=+(entry.target.dataset.delay||0);
      setTimeout(()=>entry.target.classList.add('is-visible'),delay);
      io.unobserve(entry.target);
    });
  },{threshold:0.1});
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
})();ct-accordion.js(function(){
  'use strict';
  document.querySelectorAll('[data-accordion]').forEach(root=>{
    const btns=root.querySelectorAll('[data-accordion-btn]');
    btns.forEach(btn=>{
      const panel=btn.nextElementSibling;
      panel.style.overflow='hidden';panel.style.maxHeight='0';
      panel.style.transition='max-height 0.28s ease';
      btn.addEventListener('click',()=>{
        const open=btn.getAttribute('aria-expanded')==='true';
        btns.forEach(b=>{b.setAttribute('aria-expanded','false');b.nextElementSibling.style.maxHeight='0';});
        if(!open){btn.setAttribute('aria-expanded','true');panel.style.maxHeight=panel.scrollHeight+'px';}
      });
    });
  });
})();ct-countup.js(function(){
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;io.unobserve(entry.target);
      const el=entry.target,to=+el.dataset.to,suffix=el.dataset.suffix||'',dur=reduced?0:1600;
      if(!dur){el.textContent=to+suffix;return;}
      const start=performance.now();
      requestAnimationFrame(function step(now){
        const p=Math.min((now-start)/dur,1);
        el.textContent=Math.floor(p*to)+suffix;
        if(p<1)requestAnimationFrame(step);
      });
    });
  },{threshold:0.3});
  document.querySelectorAll('[data-countup]').forEach(el=>io.observe(el));
})();ct-ba.js(function(){
  'use strict';
  document.querySelectorAll('[data-ba]').forEach(root=>{
    const after=root.querySelector('.ba-after'),handle=root.querySelector('.ba-handle');
    if(!after||!handle)return;
    let dragging=false;
    function setPos(pct){
      pct=Math.max(2,Math.min(98,pct));
      after.style.clipPath='inset(0 0 0 '+pct+'%)';handle.style.left=pct+'%';
    }
    setPos(50);
    function getPct(e){const r=root.getBoundingClientRect();return((e.clientX-r.left)/r.width)*100;}
    handle.addEventListener('pointerdown',e=>{dragging=true;handle.setPointerCapture(e.pointerId);});
    root.addEventListener('pointermove',e=>{if(dragging)setPos(getPct(e));});
    ['pointerup','pointercancel'].forEach(ev=>root.addEventListener(ev,()=>{dragging=false;}));
  });
})();ct-scrollspy.js(function(){
  'use strict';
  const navs=document.querySelectorAll('[data-scrollspy]');if(!navs.length)return;
  const links=[...navs].flatMap(n=>[...n.querySelectorAll('a[href^="#"]')]);
  const targets=links.map(l=>document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      links.forEach(l=>l.removeAttribute('aria-current'));
      const a=links.find(l=>l.getAttribute('href')==='#'+entry.target.id);
      if(a)a.setAttribute('aria-current','true');
    });
  },{rootMargin:'-30% 0px -60% 0px'});
  targets.forEach(t=>io.observe(t));
})();ct-sticky-atc.js(function(){
  'use strict';
  const buybox=document.getElementById('buybox'),bar=document.getElementById('ct-sticky-atc');
  if(!buybox||!bar)return;
  new IntersectionObserver(entries=>{
    entries.forEach(e=>bar.classList.toggle('is-visible',!e.isIntersecting));
  },{threshold:0}).observe(buybox);
  const btn=bar.querySelector('[data-sticky-atc-btn]');
  const form=document.querySelector('product-form form');
  if(btn&&form)btn.addEventListener('click',()=>form.requestSubmit());
})();ct-quickview.js(function(){
  'use strict';
  let modal=null;
  function getModal(){
    if(modal)return modal;
    modal=document.createElement('div');
    modal.id='ct-qv';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
```javascript
    modal.innerHTML='<div class="ct-qv__overlay"></div><div class="ct-qv__panel"><button class="ct-qv__close" aria-label="Close">&#x2715;</button><div class="ct-qv__body"></div></div>';
    modal.querySelector('.ct-qv__overlay').addEventListener('click',close);
    modal.querySelector('.ct-qv__close').addEventListener('click',close);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
    document.body.appendChild(modal);return modal;
  }
  function close(){if(modal)modal.classList.remove('is-open');}
  document.addEventListener('click',async e=>{
    const btn=e.target.closest('[data-quickview]');if(!btn)return;
    const url=btn.dataset.url;if(!url)return;
    const m=getModal();
    m.querySelector('.ct-qv__body').innerHTML='<div class="ct-skeleton" style="height:360px"></div>';
    m.classList.add('is-open');
    try{
      const html=await(await fetch(url)).text();
      const doc=new DOMParser().parseFromString(html,'text/html');
      const content=doc.querySelector('.product');
      m.querySelector('.ct-qv__body').innerHTML=content?content.outerHTML:'Could not load product.';
    }catch{m.querySelector('.ct-qv__body').innerHTML='Error loading product.';}
  });
})(); c-green">Total: ~260 lines across 8 files. No file exceeds 55 lines. All loaded with defer in theme.liquid. Zero external dependencies. This is why we outperform Shrine on mobile.
---

## 10 · Build Workflow — Design to live store — the correct order

_Every step has a gate. The next step does not start until the gate passes. Step 0 is new in v5 — reading Shrine Pro's Liquid is mandatory before writing any code._


| Step | Action | Input | Gate |
|---|---|---|---|
| 0. Read Shrine Pro Liquid ★ NEW | Spend 2–3 hours reading Shrine's actual Liquid files. Focus on: cart-drawer.liquid (how they implement the progress bar and upsell slot), card snippet (how they add overlays), main-product section (how sticky ATC is triggered), and their CSS variable system. | Shrine Pro theme files (you have the license) | You can describe exactly how Shrine implements each feature before writing any code |
| 1. Build design demo ★ NEW | Build a standalone HTML file showing every component in its final visual state with our token system applied. Every class name intentional. Cover all states listed in Section 05. | Token decisions, Shrine reference, component inventory | Demo exists. Every component has a defined HTML structure and class name set. |
| 2. Extract tokens | Pull brand colors, fonts, radius from the demo. Write snippets/css-variables.liquid with concrete values. | Design demo | Theme Editor preview shows correct brand colors and fonts |
| 3. Make controlled Liquid edits | Edit the 5 Dawn files from Section 04 exactly as documented. Add markup slots. Never touch commerce logic. | Liquid edit map (Section 04) + design demo for HTML structure | All 5 edits complete. Commerce flow (variant → ATC → cart → checkout) identical to stock Dawn. |
| 4. Write theme-overrides.css | Write all CSS overrides. Reference the design demo for every class name. All values use --ct-* tokens. | Design demo (class name source), token file | Dawn's native sections look on-brand. No horizontal scroll at 375px. |
| 5. Build ct-* sections | Build all 25 custom sections. Reference design demo for HTML structure. Reference Shrine for behavioral patterns. All CSS uses tokens. All content in schema. | Design demo + Shrine reference + Section 08 catalog | All JSON template references resolve. All sections render correctly at 375px and 1280px. |
| 6. QA + ship | Run Section 13 audit. Test full commerce on real mobile. Package ZIP with full Dawn base. | Complete theme | All audit checklist items pass. assets/base.css present in ZIP. |
 c-blue">Component dependency map — which sections need which JS file
| Section | swipe | reveal | accordion | countup | ba | scrollspy | sticky-atc | quickview |
|---|---|---|---|---|---|---|---|---|
| ct-hero |  | ✓ |  |  |  |  |  |  |
| ct-marquee (CSS only) |  |  |  |  |  |  |  |  |
| ct-stats |  | ✓ |  | ✓ |  |  |  |  |
| ct-reviews | ✓ |  |  |  |  |  |  |  |
| ct-trust-bar |  | ✓ |  |  |  |  |  |  |
| ct-ba |  |  |  |  | ✓ |  |  |  |
| ct-faq |  |  | ✓ |  |  |  |  |  |
| ct-email |  |  |  |  |  |  |  |  |
| ct-mini-nav |  |  |  |  |  | ✓ |  |  |
| ct-aplus |  | ✓ |  |  |  |  |  |  |
| ct-reviews-pdp | ✓ |  |  |  |  |  |  |  |
| ct-sticky-atc |  |  |  |  |  |  | ✓ |  |
| Collection cards |  |  |  |  |  |  |  | ✓ |

---

## 11 · Phases & Tasks — Six phases — each gates the next

_Phase 0 now includes reading Shrine Pro's Liquid and building the design demo. These are mandatory before any code is written._

P0Read Shrine + Build design demoStep 0 + Step 1 · ~1 day · Mandatory before any coding startsFoundationRead Shrine Pro's key Liquid files (2–3 hrs): cart-drawer.liquid, card product snippet, main-product section, CSS variable system. Document how each feature is structured.Build the design demo HTML (4–6 hrs): all components, all states, our token system applied. Every class name intentional.Confirm: you can describe exactly how Shrine implements cart progress bar, product card overlay, sticky ATC, and variant swatch cardsGate: Design demo exists and covers all items in Section 05. Zero ambiguity about HTML structure of any component.P1Token file + Controlled Liquid edits + theme-overrides.cssSteps 2–4 · ~6 hours · Requires P0BlockerWrite snippets/css-variables.liquid — all 52 tokens, connected to Theme EditorMake the 5 controlled Liquid edits from Section 04 exactly as documentedWrite assets/theme-overrides.css — reference design demo for all class namesUpdate config/settings_schema.json with global brand settingsPatch layout/theme.liquid — token snippet, 8 JS utilities, font-size fixBuild all 8 JS utility files (code in Section 09)Gate: Dawn native sections look on-brand. Commerce flow (variant → ATC → cart → checkout) identical to stock Dawn. Cart drawer shows progress bar slot.P2Homepage sectionsStep 5 (homepage) · ~2.5 days · Requires P1CoreBuild all 10 homepage ct-* Liquid sections with schemas and scoped CSSReference design demo for HTML structure and class names — no invented valuesWire into templates/index.jsonct-announce replaces Dawn announce barGate: All JSON section references resolve. No horizontal scroll at 375px. Reveal, swipe, countup all working.P3PDP sections + Cart enhancementsStep 5 (PDP) · ~2 days · Requires P2CoreBuild all 7 PDP sections. Zero further Liquid edits to main-product.liquid beyond what was done in P1.Buybox CSS upgrade: variant swatches, trust chips (from P1 Liquid edit), sticky ATCWire into templates/product.jsonCart drawer enhancements: progress bar, upsell slot (from P1 Liquid edit)Gate: Sticky ATC submits via native Dawn form. Cart commerce untouched. PDP swipe works on real mobile.P4Collection + remaining templatesStep 5 (collection) · ~1 day · Requires P3EnhancementApply product card CSS upgrade (from P1 Liquid edit): second image, hover overlay, % off badgeWire ct-quickview on collection cardsRestyle all remaining Dawn templates: blog, article, page, search, account, 404, passwordGate: Collection page converts better. All templates consistent.P5QA + Documentation + ShipStep 6 · ~4 hours · Final gateFinalFull cross-device QA — 375px, 768px, 1280px, 1440px. Real iOS + Android.Full commerce flow: variant selection → add to cart → cart drawer → checkoutLighthouse: ≥70 mobile, ≥90 desktop on homepage, PDP, collectionRun Section 13 audit checklist — all items must passPackage ZIP: full Dawn 15.4.1 base + all custom files. Verify assets/base.css present.Include INSTALL.md and BRAND_OVERRIDE.mdFinal gate: All audit items pass. Performance target met.
---

## 12 · Claude Implementation Prompt ★ — Paste at the start of every implementation session

_Updated in v5 with: Step 0 (read design demo first), controlled Liquid edit rules, Shrine reference rule, and performance target. Copy the complete block._

Claude system prompt# Claude Operating File — Shopify Custom Theme Framework v5.0
# Paste at the start of every implementation session

## ROLE
Senior Shopify Dawn 15.4.1 theme developer.
You build sections and make controlled Liquid edits as defined in the v5.0 spec.
You never modify Dawn's commerce logic.
You read the design demo before writing any code.

## MANDATORY ORDER — before writing any section or Liquid edit
1. Read the v5.0 spec section for the component you are building
2. Read the design demo HTML for that component → extract EXACT class names
3. Read theme-overrides.css → verify patterns already defined there
4. If making a Liquid edit → read Section 04 of the spec for the exact edit
5. Only then write Liquid or CSS

## EVERY SECTION MUST HAVE
[ ] Filename ≤ 25 characters including .liquid extension
[ ] Schema name ≤ 25 characters
[ ] color_scheme setting in schema (per-section light/dark — always)
[ ] All CSS values use --ct-* variables — no hardcoded hex colors
[ ] All content in schema settings — no hardcoded copy in Liquid
[ ] Images: image_url + srcset + width + height + alt + loading=lazy
[ ] data-reveal on animated elements
[ ] data-swipe on horizontal scroll containers
[ ] data-accordion-btn / data-accordion-panel on FAQ items
[ ] No Liquid tags {% %} {{ }} inside CSS comments in {%- style -%} blocks

## CONTROLLED LIQUID EDITS — only these 5 files, only these additions
snippets/card-product.liquid → add: second image wrapper, overlay div, quickview btn, % off badge
snippets/cart-drawer.liquid → add: free shipping bar slot, upsell slot, trust badge row
snippets/buy-buttons.liquid → add: trust chip block (schema-driven)
config/settings_schema.json → add: color_accent, font_heading, font_body, border_radius, page_width
layout/theme.liquid → patch existing style block ONLY

## DAWN NEVER-TOUCH LIST
product-form · product-form__submit · name="add" · name="id"
name="quantity" · variant-selects · quantity-input · media-gallery
cart-drawer · cart-notification · cart-icon-bubble · data-section
data-product-id · data-update-url · data-media-id

## DAWN QUIRKS — know these before coding
Q1: Font-size 62.5% + letter-spacing hardcoded inline → patch inside existing {%- style -%} block only
Q2: Liquid tags in style block CSS comments = fatal page crash → plain text comments only
Q3: Dawn --color-* vars are RGB triples not hex → use --ct-* namespace only
Q4: Rating stars render white → .rating__stars svg { fill: var(--ct-star); }
Q5: cart-notification unstyled → add scoped CSS in theme-overrides.css
Q6: ZIP must include full Dawn base → verify assets/base.css exists before delivering
Q7: Discount codes cannot apply to cart via AJAX → redirect to /checkout?discount=CODE

## SHRINE PRO REFERENCE RULE
You may reference Shrine Pro's patterns to understand how a feature should behave.
You may adapt patterns from Shrine's approach.
You must never copy Shrine's Liquid code files verbatim into this project.
All Liquid written for this framework must be original code.

## PERFORMANCE RULE
No jQuery. No Slick.js. No external libraries.
All JS is vanilla, written in the 8 ct-*.js utility files.
Total custom JS budget: ~260 lines, ≤18KB.
All JS loaded with defer — never render-blocking.
Target: ≥70 mobile Lighthouse. ≥90 desktop.
---

## 13 · Audit Checklist ★ — Run after every phase — updated in v5 with Liquid edit checks


| Check | How to verify | Fail action |
|---|---|---|
| Design demo exists and is complete | All components in Section 05 are shown with correct HTML structure and class names | Build the missing demo sections before proceeding |
| JSON template references valid | Every section type in templates/*.json has a matching .liquid file | Create missing file before packaging |
| Full Dawn base in ZIP | assets/base.css and assets/global.js present in archive | Re-package with full Dawn 15.4.1 |
| Controlled Liquid edits verified | card-product.liquid has overlay+second image+badge. cart-drawer.liquid has bar+upsell+trust. buy-buttons.liquid has trust chips. | Make the missing edit from Section 04 |
| Commerce flow unchanged after Liquid edits | Variant → ATC → cart drawer → checkout flow identical to stock Dawn | Revert changes that touch commerce logic |
| Dawn never-touch list respected | Grep custom sections and Liquid edits for the never-touch list — none should appear modified | Revert any changes |
| No hardcoded brand values | No hex colors or font names in sections/ct-*.liquid — all via --ct-* tokens or schema settings | Move to token file or schema |
| No invented class names | Every CSS class in sections exists in the design demo HTML | Replace with correct class from demo |
| color_scheme in every section schema | Each ct-*.liquid schema has a color_scheme setting | Add it — required for per-section theming |
| All images correct | alt + width + height + loading=lazy on every img (except above-fold hero) | Add missing attributes |
| No Liquid in style block comments | No {% or {{ inside CSS comments in {%- style -%} blocks | Remove Liquid from CSS comments |
| Liquid syntax balanced | No unclosed if/for/capture blocks | Fix immediately — breaks entire page render |
| ct-field on all form inputs | Every form input uses ct-field wrapper pattern | Wrap with ct-field |
| Button states implemented | ATC has .is-loading/.is-success CSS. Cart badge pulses on add. | Add CSS classes + Dawn event listener |
| No horizontal scroll at 375px | Each template at 375px — no scroll bar, no clipped content | Find and fix overflowing element |
| Lighthouse ≥70 mobile | Incognito run on homepage, PDP, collection in Lighthouse | Audit custom JS and CSS — no jQuery allowed |
| Full commerce on real mobile | iOS + Android: variant → ATC → drawer → checkout | Any broken step is a phase blocker |
| No console errors | Browser console on every template — zero uncaught errors | Fix all JS errors before shipping |

```