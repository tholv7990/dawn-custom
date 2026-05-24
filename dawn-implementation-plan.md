# Dawn Implementation Plan — 1 Day

**Design system: Minimals · Public Sans · Green #00A76F · Dawn 15.4.1 · May 2026**


`✓ Design system done — 45+ components`  `✓ Phase 1 specs in project`  `⚠ Dawn ZIP required`  `~12h focused work`


---

## 1-day Dawn implementation — design system ready
`Overview`

_The Minimals design system is complete — 45+ components, all states, all motion patterns, all Shrine Pro gaps filled. What remains is translation: CSS → Liquid, HTML demo → real Shopify sections._


> Design system is complete. Every token, component, state, and motion pattern is defined. Translating to Liquid/CSS is now mechanical — no creative decisions remain.


---

## What's needed before starting — design system: Minimals
`Prerequisites`

| Item | Status | Action |
|---|---|---|
| Design system HTMLgainssteel-design-system.html — 279KB, 45+ components | ✓ DONE | Already in outputs. Use as reference. |
| Dawn 15.4.1 base themeFull theme ZIP with all Liquid + CSS + JS files | ✗ MISSING | Upload ZIP — or confirm GitHub download OK |
| Phase 1 specs — presentphase-01b/d/e/j/k — all in /mnt/project/ | ✓ DONE | Already available. Will be read before coding. |
| Phase 1 specs — missing 4 filesphase-01f/g/h/i — block spec, section spec, mapping, dependency map | ⚠ PENDING | Can be generated from existing docs + source demos |
| Shopify dev storeTest environment for preview during build | ⚠ PENDING | Need store URL for Shopify CLI |
| Node.js + Shopify CLILocal dev toolchain | ⚠ PENDING | Install if not present |


---

## Every Dawn file — touch or no-touch
`File Map`

_29 files total. Categorised by risk zone from the Phase 1 risk map._


**`assets/gs-tokens.css`** — Zone 2 — Safe · Create new

**`assets/gs-overrides.css`** — Zone 2 — Safe · Create new

**`layout/theme.liquid`** — Zone 3 — Medium risk · Edit

**`sections/header.liquid`** — Zone 3 — Medium risk · Edit

**`sections/cart-drawer.liquid`** — Zone 3 — Medium risk · Edit (CSS only)

**`sections/main-product.liquid`** — Zone 1 — High risk · CSS skin only

**`sections/gs-hero.liquid`** — Zone 2 — Safe · Create new

**`sections/gs-*.liquid (10 custom sections)`** — Zone 2 — Safe · Create new × 10

**`sections/gs-pdp-*.liquid (6 PDP sections)`** — Zone 2 — Safe · Create new × 6

**`sections/main-cart-items.liquid + main-cart-footer.liquid`** — Zone 3 — Medium risk · Edit (skin)

---

## Rules that never change — from Phase 2 doc
`Zone Restrictions`

**Allowed:**
- ✓ Add .gs-* wrapper classes to Dawn elements
- ✓ CSS-only visual overrides (colour, typography, spacing, radius)
- ✓ Create new custom sections (Zone 2)
- ✓ Load fonts, tokens, and JS via theme.liquid
- ✓ Add decorative elements that don't wrap commerce logic
- ✓ Scoped JS for visual behaviour (tabs, accordion, modal)
- ✓ CSS custom properties (--gs-* or inheriting --brand etc)

**Forbidden:**
- ✗ product-form, product-form__submit, name="add"
- ✗ variant-selects, product-form__input, quantity-input
- ✗ cart-drawer JS, cart.js, product-form.js
- ✗ price.liquid, buy-buttons.liquid logic
- ✗ media-gallery structure
- ✗ data-section, data-product-id, data-cart-count
- ✗ Checkout / payment behaviour
- ✗ Any input name attribute

---

## Setup — before any code
`Phase 0 · ~45min`

| # | Task | File | Time |
|---|---|---|---|
| P0.1 | Download + unzip Dawn 15.4.1github.com/Shopify/dawn → release 15.4.1 → ZIP | Working dir | 5min |
| P0.2 | Generate missing Phase 1 docsphase-01f block spec · phase-01g section spec · phase-01h mapping · phase-01i dependency map — generated from source demos + existing specs | docs/ | 20min |
| P0.3 | Audit Dawn current state vs design systemphase-02a-theme-system-audit.md — map each Dawn CSS var to design system equivalent. Identify conflicts. | docs/phase-02a-* | 15min |
| P0.4 | Create apply planphase-02b-system-apply-plan.md — every file to edit, every selector, every token. Required by Phase 2 doc before code. | docs/phase-02b-* | 10min |


---

## Global layer — tokens + typography + base overrides
`Phase 1 · ~1.5hr`

_CSS files that apply sitewide. No Liquid changes yet. Everything scoped to .gs-* or :root._


| # | Task | File | Risk | Time |
|---|---|---|---|---|
| G1.1 | Create gs-tokens.cssAll CSS custom properties from design system. bg-base, tx1–tx4, str1–str4, sh2–sh28, brand palette, semantic colours, ecom tokens, radius, font, spacing. Copy directly from design system :root block. | assets/gs-tokens.css | LOW | 20min |
| G1.2 | Patch theme.liquidInject: <link> Public Sans from Google Fonts · <link> gs-tokens.css · <link> gs-overrides.css · <script defer> gs-motion.js. Inject before </head> only. Do not touch any Liquid. | layout/theme.liquid | MED | 15min |
| G1.3 | Create gs-overrides.css — typography + bodyhtml/body: bg-base, tx1, font-family Public Sans. Safe global: img max-width, box-sizing. Body 16px min for iOS. prefers-reduced-motion block. | assets/gs-overrides.css | LOW | 15min |
| G1.4 | Button system — scoped .gs-btnAll button variants from design system. Primary, outlined, soft, sizes. Ripple animation. Apply to .shopify-payment-button skip (never override). Apply to .btn class Dawn uses for theme editor buttons. | assets/gs-overrides.css | MED | 20min |
| G1.5 | Create gs-motion.jsScroll reveal IntersectionObserver · count-up on .ct-stat-num · hero stagger · ATC burst on .atc-btn clicks · button ripple. Defer loaded, no commerce touch. | assets/gs-motion.js | LOW | 20min |
| G1.6 | Header skinAdd .gs-header to header wrapper. Sticky frosted glass via CSS. Nav link hover → brand-bg2. Mobile drawer background. Search icon trigger. Preserve cart-icon-bubble + mobile menu JS. | sections/header.liquid + gs-overrides.css | MED | 20min |


---

## Landing page — 10 custom Liquid sections
`Phase 2 · ~3hr`

_All Zone 2 (safe). Each section is a new .liquid file with schema. Content from phase-01e content block inventory. Tokens from design system._


| # | Task | Section file | Key components from design system | Time |
|---|---|---|---|---|
| LP.1 | Announce barDismissible. Pulsing dot. localStorage suppress. | sections/announcement-bar.liquid | announce, announce-dot, announce-dismiss | 20min |
| LP.2 | Hero section2-col grid. Eyebrow pill + pulsing dot. H1 clamp. Subtitle. Feature pills. 2 CTAs. Floating card. Entrance stagger JS. Schema: all text + image metafields. | sections/gs-hero.liquid | ct-hero, ct-eyebrow, ct-hero-pills, ct-hero-btns, ct-hero-card, hero-stagger | 30min |
| LP.3 | Stats strip4-col. count-up JS on scroll. Scroll reveal. Schema: 4 stat blocks (number + label). | sections/gs-stats.liquid | ct-stats, ct-stat-num (count-up), reveal | 20min |
| LP.4 | Use cases3-col cards. Horizontal scroll mobile. Scroll reveal stagger. Schema: 3 cards (image + tag + title + desc). | sections/gs-use-cases.liquid | use-case-card, use-case-tag, reveal-grid | 20min |
| LP.5 | How it works (A+ banners)Alternating left/right. Up to 7 banners. Schema: repeating blocks (image + num + title + body + specs). | sections/gs-how-it-works.liquid | aplus-banner, aplus-banner.reverse, aplus-num, aplus-img | 25min |
| LP.6 | Reviews carouselSwipeable. Auto-advance 4s. Dots. Fade-right hint. Schema: up to 10 review blocks. | sections/gs-reviews.liquid | rev-carousel-wrap, rev-track, rev-dots, rev-fade-right | 25min |
| LP.7 | Trust bar + Marquee4 trust chips + scrolling marquee ticker. Pause on hover. | sections/gs-trust-bar.liquid | trust-chip, ct-marquee, ct-marquee-track | 15min |
| LP.8 | FAQ accordionSmooth max-height transition. JS toggle. Schema: up to 8 FAQ items. | sections/gs-faq.liquid | faq-item, faq-q, faq-a, FAQ toggle JS | 15min |
| LP.9 | Final CTA + Email signupBottom conversion block. Email input. Success state. | sections/gs-final-cta.liquid + gs-email-signup.liquid | ct-email-inner, ct-email-form, ct-email-input | 20min |
| LP.10 | FooterDark bg. 5-col grid (brand + 4 nav cols). Social icons. Payment icons. Legal. Schema: menu links via Shopify menu. | sections/gs-footer.liquid | site-footer, footer-inner, footer-col, footer-pay-icons | 20min |


---

## PDP — buybox skin + 6 custom sections
`Phase 3 · ~2.5hr`

_Buybox is Zone 1 (CSS skin only). All PDP sections below the buybox are Zone 2 (safe custom Liquid)._


| # | Task | File | Risk | Time |
|---|---|---|---|---|
| PDP.1 | Mini nav (sticky scroll-spy)Sticky below header at 64px. Active state brand underline. Horizontal scroll mobile. JS: IntersectionObserver updates active link. | sections/gs-mini-nav.liquid | LOW | 20min |
| PDP.2 | Buybox skinAdd .gs-buybox to main-product wrapper. Gallery: CSS flex-direction to put main image top + thumbs below. Lightbox JS (new overlay, reads existing media sources). Bundle picker: visual skin on Dawn variant radio inputs. ATC button: skin product-form__submit. Trust chips below. Payment badges row. | sections/main-product.liquid + gs-overrides.css | HIGH | 45min |
| PDP.3 | Product details tabs5-tab bar. Description / Specs / Reviews / FAQ / Shipping. JS panel swap. Content from Shopify metafields or schema blocks. | sections/gs-product-details.liquid | LOW | 20min |
| PDP.4 | A+ content bannersUp to 7 alternating left/right image+text banners. Schema repeating blocks. Same pattern as LP.5. | sections/gs-aplus.liquid | LOW | 15min |
| PDP.5 | Before/after sliderDraggable handle. clip-path on after panel. Touch + mouse drag JS. | sections/gs-before-after.liquid | LOW | 15min |
| PDP.6 | PDP reviews + policy cardsReview cards 3-col. Photo strip horizontal scroll. 4 policy cards. Schema: reviews via app metafield or hardcoded blocks. | sections/gs-pdp-reviews.liquid | LOW | 20min |
| PDP.7 | Sticky ATC barIntersectionObserver on buybox. Show/hide. Desktop: product info left + ATC right. Mobile: right 50% thumb zone. Reads product title + price from DOM. | sections/gs-sticky-atc.liquid | LOW | 20min |


---

## Commerce — cart drawer + cart page + collection
`Phase 4 · ~1.75hr`

| # | Task | File | Risk | Time |
|---|---|---|---|---|
| C1.1 | Cart drawer skinAdd .gs-cart-drawer wrapper. Multi-checkpoint progress bar (CSS + Liquid for threshold values). Trust row. Payment badges. Countdown timer JS. Cart notes. Preserve all cart-items, cart.js, form logic. | sections/cart-drawer.liquid + gs-overrides.css | MED | 30min |
| C1.2 | Cart page — 2-col layoutWrap main-cart-items + main-cart-footer in .gs-cart-page grid. Left: items + upsell row + notes. Right: sticky summary sidebar (discount code, express checkout, CTA, payment badges, trust). Mobile: sticky footer bar. | sections/main-cart-items.liquid + main-cart-footer.liquid + gs-overrides.css | MED | 35min |
| C1.3 | Collection page skinAdd .gs-collection wrapper. 3-col product grid. Filter sidebar CSS. Sort dropdown skin. Grid toggle JS. Wishlist heart on cards. Quick view trigger overlay. | sections/main-collection-product-grid.liquid + gs-overrides.css | MED | 30min |


---

## Extras — Shrine Pro gaps + conversion tools
`Phase 5 · ~1.5hr`

| # | Task | File | Time |
|---|---|---|---|
| E1.1 | Email popup section5s delay trigger + exit-intent JS. 2-col modal. Discount pill. Success state. Mobile bottom sheet. localStorage 7-day suppress. Schema: headline, offer, discount code, delay. | sections/gs-email-popup.liquid | 25min |
| E1.2 | Back in stockSnippet that replaces ATC when variant.available = false. Email form. Success state. Integrate with Shopify Back in Stock app or native form action. | snippets/gs-back-in-stock.liquid | 20min |
| E1.3 | Search overlay skinSkin Dawn's predictive-search with search-overlay panel pattern. Slide-down animation. Recent searches localStorage. Keyboard Escape closes. | snippets/predictive-search.liquid + gs-overrides.css | 20min |
| E1.4 | Thank you pageSkin order status page. Confirmation hero. Steps list. Order summary. Post-purchase upsell (Shopify checkout extension or static). Next-order discount code display. Social share. | templates/customers/order.liquid or checkout extension | 25min |
| E1.5 | Post-code audit + docs + ZIPphase-02c-post-code-audit.md. Verify all Dawn hooks preserved. Lint CSS. Test cart, variant picker, checkout. Export full theme ZIP. | docs/ + theme ZIP | 30min |


---

## 1 focused day — hour by hour
`Day Timeline`

**08:00–09:00** — Phase 0 — Setup
- Download Dawn 15.4.1
- Generate missing Phase 1 docs
- Pre-code audit doc
- Apply plan doc

**09:00–10:30** — Phase 1 — Global layer
- gs-tokens.css
- theme.liquid patch
- gs-overrides.css base
- gs-motion.js
- Header skin

**10:30–13:30** — Phase 2 — Landing (10 sections)
- Announce bar
- Hero, Stats, Use cases
- How it works, Reviews
- Trust bar, FAQ, CTA, Footer

**13:30–16:00** — Phase 3 — PDP (7 sections)
- Mini nav
- Buybox skin (careful)
- Tabs, A+, BA slider
- Reviews, Sticky ATC

**16:00–17:45** — Phase 4 — Commerce
- Cart drawer skin
- Cart page 2-col
- Collection skin

**17:45–19:30** — Phase 5 — Extras + audit
- Email popup + BIS
- Search overlay
- Thank you page
- Audit + ZIP

---

## Acceptance criteria — what a complete day looks like
`Done = Done`

**Allowed:**
- ✓ Add to cart works on PDP
- ✓ Variant selection updates price correctly
- ✓ Cart drawer opens + updates item count
- ✓ Quantity input works in cart
- ✓ Checkout button reaches Shopify checkout
- ✓ Cart page totals calculate correctly
- ✓ Collection filters work
- ✓ Search returns results
- ✓ Minimals tokens applied sitewide
- ✓ Public Sans loaded and rendering
- ✓ All 10 landing sections visible + responsive
- ✓ PDP tabs, A+, BA slider, mini-nav working
- ✓ Cart page 2-col on desktop, sticky footer mobile
- ✓ Email popup fires on delay/exit-intent
- ✓ Scroll reveal triggers on all cards
- ✓ Stats count-up fires on scroll
- ✓ prefers-reduced-motion respected
- ✓ No horizontal scroll on mobile

---

## Known risks + mitigation
`Risks + Rollback`

| Risk | Likelihood | Mitigation |
|---|---|---|
| Buybox CSS conflicts with Dawn variant picker | HIGH | Always inspect Dawn output HTML before adding selectors. Use .gs-buybox scoped prefix. Never touch variant-selects or radio inputs directly. |
| Cart drawer JS breaks after CSS changes | MED | Test add-to-cart after every cart-drawer.liquid edit. Keep cart-drawer JS untouched. Only add wrapper div + CSS classes. |
| theme.liquid syntax error breaks whole store | MED | Add only inside <head> before </head>. Never inside {% %} Liquid blocks. Test immediately after each edit. |
| Mobile horizontal overflow reappears | LOW | All grids use minmax(0,1fr). All cards have min-width:0. body has overflow-x:hidden. Test on 375px viewport after each section. |
| Email popup fires too early / too often | LOW | localStorage key prevents re-show for 7 days. Test by clearing localStorage. Never fire on checkout or thank you pages. |
