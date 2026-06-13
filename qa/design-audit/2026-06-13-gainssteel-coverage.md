# Design Coverage Audit — GainsSteel homepage/PDP/cart vs CT-theme (Dawn fork) @ 5fd3a4d — 2026-06-13

Parsing confidence: HIGH for all three designs. Each mockup carries a full `<head>` + substantial inline `<style>` + inline `<script>` (non-minified), so unit decomposition and token extraction were unambiguous. The only cross-cutting nuance: the GainsSteel family designs are hybrid funnel mockups — the homepage embeds a PDP-style buy box, sticky ATC, and dual marquees — so every commerce unit was scored against the theme path that would actually render it (`templates/product.landing.json` ct-* funnel for the buy-box/marquee/sticky surfaces; `templates/product.json` → `sections/main-product.liquid` for canonical PDP commerce/JSON-LD; `templates/cart.json` → `main-cart-items` + `main-cart-footer` for cart), not against the static demo JS in the mockups.

---

## 0. Inputs resolved

**REPO_ROOT:** `c:\Users\Admin\Desktop\Custom-Theme\dawn` (Shopify Dawn fork; `sections/ snippets/ assets/ config/ templates/ locales/` present). Git short-sha `5fd3a4d`.

**Design mockups discovered & audited (3):**

| # | File | Slug | Page type (from content) | sha1 (short) | Lines |
|---|---|---|---|---|---|
| 1 | `design/gainssteel-homepage.html` | gainssteel-homepage | homepage (single-product funnel: marquees, bento hero, problem/mechanism/who/system bands, how-it-works, 12-week journey, comparison, reviews+UGC, 3-tier offer cards, FAQ, dark CTA band, footer) | cb20431a6704 | 836 |
| 2 | `design/gainssteel-pdp.html` | gainssteel-pdp | pdp (buy box gallery + purchase panel, tier/bundle radiogroup, price block w/ compare-at + SAVE%, Judge.me rating chip, sticky ATC, toast, single Product JSON-LD) | 1330ac901d75 | 860 |
| 3 | `design/gainssteel-cart.html` | gainssteel-cart | cart (line items + order summary + upsell + empty state; shared header/marquee/footer chrome) | cbc3cb11bc2d | 686 |

**Page-type classification note:** all three are members of one "Bold Athletic / Forge" design family sharing the same `:root` token block, light-mode lock, and marquee/sticky chrome. The homepage is classified homepage (not landing/funnel) because it leads with multi-band marketing and 3-tier offer cards; it nonetheless embeds PDP commerce primitives, scored against the landing funnel path.

**Optional docs used:** `docs/ct-migration-status.md` (roadmap task IDs — primary mapping source); Appendix A of `design-coverage-audit-prompt.md` (fallback). No `*design-system*.md` for GainsSteel was found in-tree; intent cross-check relied on the mockups' own inline header comments (60/30/10 role comments, Judge.me/compare-at binding directives).

**Rejected/deferred candidates:** none. Exactly 3 design mockups in `design/`; all audited (≤5, no deferral needed).

**OUTPUT_REPORT:** `qa/design-audit/2026-06-13-gainssteel-coverage.md` (this file — the one permitted write).

---

## 1. Executive summary

Per-page coverage (pages NOT blended; each is a tier-weighted Σ(UnitScore×tier)/Σ(tier), 16 units each, with verify-stage corrections applied):

| Design | Page type | Coverage-Now | Coverage-After-Roadmap |
|---|---|---|---|
| gainssteel-homepage | homepage | **59.5%** | **82.4%** |
| gainssteel-pdp | pdp | **64.5%** | **90.0%** |
| gainssteel-cart | cart | **68.0%** | **88.2%** |

### gainssteel-homepage — 59.5% now → 82.4% post-roadmap
The ct-* marketing library covers the band structure (how-it-works, comparison, reviews, FAQ, CTA, pricing cards, marquees) with editable copy, but the load-bearing gaps are the kinetic bento hero (no split/bento/stat-tile hero section → unit 28, red) and the offer-band commerce details (per-plan compare-at strike / save badge / excluded-feature dim / payment chips all absent from ct-pricing-table). Typography identity (Saira Condensed uppercase + outline-stroke text) is unreachable through settings.

- **Top-5 blockers:** (1) G29/G30/G31 reviews proof-header score + UGC video player/lightbox — no aggregate-score-header setting on ct-reviews and UGC `.play` tiles are visual-only. (2) Bento/kinetic hero — ct-hero is single-column media only (schema 238-344, zero blocks). (3) G32-G35 offer-card per-plan compare-at strike / `-off` save badge / dimmed excluded `<li>` / static pay chips. (4) Typography: Saira-Condensed display + global uppercase + tracking + outline-stroke text are hardcoded to Poppins (css-variables.liquid:138,141) and have no setting surface. (5) Scroll-reveal: `data-ct-reveal` markup exists only in `ct-styleguide.liquid`, so every CT-native band's reveal is unwired (G10/G16/G24/G26/G28/G40).
- **Top-3 NEW-task proposals:** (a) W1.T05 extended typography — wire `--ct-font-display` to a font_picker + add uppercase toggle + letter-spacing/tracking ranges + outline-text type option (effort M). (b) NEW bento/composite hero section (multi-tile/stat-tile hero) — no roadmap home (effort M). (c) NEW ct-pricing-table per-plan commerce slots (compare-at strike, save badge, excluded-feature flag, payment-icon row) → extends W3.T09 / W5.T03 pricing-table (effort M).

### gainssteel-pdp — 64.5% now → 90.0% post-roadmap
Highest after-roadmap ceiling: the PDP commerce path (`main-product` + ct-product-buy) already binds price/compare-at/SAVE%/rating to live product+metafield data and emits compliant single Product JSON-LD. Gaps are content-slot depth (no bundle distinct-price selector, no comparison lead/eyebrow, no reviews aggregate-score-header) and behavior wiring (sticky ATC uses a scroll listener not IntersectionObserver; toast lacks aria-live), not missing sections.

- **Top-5 blockers:** (1) G10 bundle selector is a quantity-ladder (`current_price × quantity`, ct-product-buy.liquid:165), not distinct-price bundles. (2) G30 reviews proof header — no aggregate-score setting on ct-reviews. (3) G37 final-CTA dark-ink panel + radial glow — `.ct-cta--tint` only yields a light tint surface (no color_scheme on the section). (4) G43 sticky-ATC reveal is a scroll listener, not IntersectionObserver. (5) Typography (same Saira/uppercase/stroke gap as homepage).
- **Top-3 NEW-task proposals:** (a) W3.T03 bundle block — distinct per-bundle price + variant set (effort M). (b) W3.T09 reviews block — aggregate score-header (4.7/52) slot on ct-reviews/main-product (effort S). (c) W1.T05 extended typography (shared with homepage; effort M).

### gainssteel-cart — 68.0% now → 88.2% post-roadmap
Cart line items, order summary, savings line, upsell rail, trust marquee, and footer all map to shipped sections with data-bound pricing. The largest single correction this audit applied was the Toast unit (RED→YELLOW). Remaining gaps: cart heading/empty-state copy is locale-bound with no editable eyebrow/heading/lead, and the toast is wired only to the copy-protection flow, not cart commerce events.

- **Top-5 blockers:** (1) GAINSSTEELCART-G27 — `CT.toast` is wired (via ct-security.js) but only to copy-protection, NOT cart remove/add/upgrade/checkout. (2) G28 — single global `ct_security_notice` string, not per-cart-action messages. (3) Cart heading band / empty cart — no eyebrow/heading/lead/CTA settings (locale-bound `sections.cart.title`/`sections.cart.empty`). (4) Footer column headings `Info`/`Customer service`/`Contact us` hardcoded English (footer.liquid:47/60/79). (5) Typography (shared Saira/uppercase/stroke gap). 
- **Top-3 NEW-task proposals:** (a) W2.T09 — extend toast service to fire on cart remove/add/upgrade with per-action editable copy (effort M). (b) NEW cart-heading band settings (eyebrow/heading/lead + continue-shopping CTA copy on main-cart-items) → extends W4 cart parity (effort S). (c) NEW footer localized/editable column-heading settings → extends W0.T01 footer restore (effort S).

---

## 2. Scoring method note

Each unit scored on the §4 rubric `UnitScore = 100×(0.35·S + 0.25·C + 0.20·St + 0.20·B)` where S=Structure (existing section/block produces the DOM), C=Content (fraction of editable slots), St=Style (fraction of visual treatments reachable via tokens/settings/preset, no custom CSS), B=Behavior (fraction of interactions wired end-to-end; `unverified` markup-without-JS counts ×0.5). Status bands: ✅≥90, 🟢70–89, 🟡40–69, 🔴10–39, ❌<10. Caps applied: needs-custom-code ≤25; preset renders broken/empty on a bare store ≤60. Page Coverage = Σ(UnitScore×tier)/Σ(tier). Tiers were assigned per unit per the §4 importance rules: ×3 Critical for the checkout click-path of that page type (homepage/PDP buy box, ATC, price block, tier/bundle selector, sticky ATC; cart line items + order summary + checkout CTA + header cart), ×2 High for persuasion/navigation load-bearers (hero, reviews/proof, comparison, FAQ, trust, header, footer, CTA bands), ×1 Standard for the rest. Each page has 16 units; the tier-weight denominator is 25 (homepage) / 28 (pdp) / 16 (cart) as computed by the per-design scorers. All numbers below are the FINAL scores after the Phase-6 verify-stage corrections (see §8 changelog).

---

## 3. Per design file — unit tables (FINAL scores)

### 3a. gainssteel-homepage (tier-den 25; Coverage-Now 59.5%, After 82.4%)

| Unit | Tier | S/C/St/B | Score | Status | Evidence | Gap ids |
|---|---|---|---|---|---|---|
| Dual marquee tickers (top+bottom) | ×2 | 0.75/0.75/0.5/0.75 | 70.0 | 🟢 | sections/ct-trust-marquee.liquid blocks[type=message].settings.icon+text; CSS gs-scroll @section-ct-components.css:829; reduced-motion gate @section-ct-responsive.css:337-343 | G01/G02 |
| Header / nav (gs-head) | ×3 | 0.75/0.5/0.5/0.75 | 62.5 | 🟡 | sections/header.liquid settings logo/logo_width/menu/sticky_mode; mobile drawer wired ct-page.js initHeader; no CTA button, no cart-drawer trigger | G04/G05 |
| Kinetic bento hero (split + outline words + stat tiles) | ×2 | 0.25/0.4/0.25/0.25 | 28.0 | 🔴 | sections/ct-hero.liquid is single-column media hero, ZERO blocks (schema 238-344); no split/bento/stat-tile layout | G06/G07/G08/G09/G10 |
| Problem band (friction X-marks) | ×1 | 0.5/0.75/0.5/0.5 | 56.25 | 🟡 | ct-icon-columns blocks[type=column].settings.icon/title/body; icon dictionary lacks x/cross glyph | G14/G16 |
| Mechanism / "how it works" band | ×2 | 0.75/0.75/0.5/0.5 | 65.0 | 🟡 | sections/ct-steps.liquid forloop.index auto-number (:17/:27), step block title/body/icon (:167-186), preset 3 steps; reveal unwired | G24 |
| Who-it's-for personas band | ×1 | 0.5/0.75/0.5/0.5 | 56.25 | 🟡 | ct-icon-columns; persona glyphs (door/suitcase/book) absent from icon dictionary | G19 |
| System band (5-up) | ×1 | 0.25/0.75/0.5/0.5 | 46.25 | 🟡 | ct-steps grid hard-capped repeat(3,1fr) @:54 — cannot do 5-up; no eyebrow field | G20/G22 |
| How-it-works band | ×1 | 0.75/0.75/0.5/0.5 | 71.5 (spot-check 71.5) | 🟢 | sections/ct-steps.liquid auto-number + heading/subheading (:127-137) + step block (:167-186), preset seeds 3; no data-ct-reveal in markup | G24 |
| 12-week journey / timeline | ×1 | 0.75/0.75/0.5/0.5 | 65.0 | 🟡 | sections/ct-timeline.liquid blocks[type=milestone].settings.label/title/body; reveal unwired | G26 |
| Comparison table (us-vs-them) | ×2 | 0.75/0.5/0.5/0.5 | 60.0 | 🟡 | sections/ct-comparison.liquid blocks[type=row].settings feature/us/alt_1/alt_2 + good flags; brandmark = shop.name, no lead/eyebrow slot | G17/G18 |
| Reviews & proof band (score header + 3 cards + 3 UGC tiles) | ×2 | 0.5/0.5/0.5/0.75 | 56.5 | 🟡 | ct-reviews.liquid:7 data-gs-carousel, :14 data-gs-slide, :28 data-gs-dots → ct-page.js:419-420 initDots (clickable dots + passive scroll sync, idempotent box.dataset.ready, section:load rebind :428) VERIFIED; no aggregate score-header setting; UGC .play tiles visual-only (design 661-663) | G29/G30/G31 |
| 3-tier offer cards | ×3 | 0.5/0.5/0.5/0.5 | 50.0 | 🟡 | ct-pricing-table blocks[type=plan].settings name/price/period/features/featured/badge/button; no per-plan compare-at strike, no `-off` save badge, no dimmed excluded `<li>`, no payment chips (schema 285-345) | G32/G33/G34/G35 |
| FAQ band | ×2 | 1.0/0.75/0.75/1.0 | 85.5 | 🟢 | sections/ct-faq.liquid:9 native `<details {% if forloop.first %}open{% endif %}>`, :10 `<summary>` + .gs-faq__plus, item block question/answer (schema 57-69), heading (:22-27); no eyebrow/highlight slot (line 6 hardcoded &nbsp;) | G36 |
| Final CTA band (dark energy panel) | ×2 | 0.75/0.75/0.5/0.5 | 68.75 | 🟡 | sections/ct-cta-banner.liquid schema eyebrow/heading/subheading/button×2/tint/padding (127-196); tint = light --ct-action-tint (CSS 49-52) NOT dark-ink+radial-glow; no reveal; heading plain text no `<em>` slot | G38/G39/G40 |
| Footer (gs-foot) | ×2 | 0.75/0.75/0.75/1.0 | 78.75 | 🟢 | sections/footer.liquid logo/brand_blurb/info_menu/service_menu/contact_*; column headings Info/Customer service/Contact us hardcoded English @markup 47/60/79 | G41/G42/G43 |
| Embedded buy-box / sticky ATC (funnel commerce) | ×3 | 0.75/0.5/0.75/0.75 | 68.75 | 🟡 | sections/ct-product-buy.liquid price/compare/SAVE% bound to product (13/153); sticky via ct-page.js initSticky scroll listener; tier block = quantity-ladder | G11/G12/G13 |

### 3b. gainssteel-pdp (tier-den 28; Coverage-Now 64.5%, After 90.0%)

| Unit | Tier | S/C/St/B | Score | Status | Evidence | Gap ids |
|---|---|---|---|---|---|---|
| Header / nav | ×3 | 0.75/0.5/0.5/0.75 | 62.5 | 🟡 | sections/header.liquid logo/menu/sticky_mode; no CTA/cart-drawer | G01/G02 |
| Marquee tickers (×2) | ×2 | 0.75/0.75/0.5/0.75 | 70.0 | 🟢 | sections/ct-trust-marquee.liquid message block icon+text; reduced-motion gate | G03 |
| Buy-box gallery | ×3 | 0.75/0.5/0.75/0.75 | 68.75 | 🟡 | main-product gallery_layout/media_size/image_zoom; ct-product-buy gallery dots/lightbox via ct-page.js data-gs-product | G05/G06 |
| Buy-box purchase panel | ×3 | 0.5/0.5/0.75/0.5 | 53.75 | 🟡 | ct-product-buy.liquid schema 263-316: tier block title/pill/subtitle/badge/quantity only; price=current_price×quantity (:165); trust row hardcoded (233-246); no bullets/sub-desc/crumb | G08/G09 |
| Tier / bundle selector | ×3 | 0.5/0.5/0.5/0.75 | 55.0 | 🟡 | ct-product-buy tier block = quantity-ladder not distinct-price bundle (:165); per-tier compare guard :168/:196 | G10 |
| Price block (compare-at + SAVE%) | ×3 | 0.75/1.0/0.75/0.75 | 78.75 | 🟢 | ct-product-buy.liquid:13 save_percent if compare>current; :153 strike+SAVE% gated; snippets/price.liquid:49 on-sale class | — |
| Rating chip (Judge.me) | ×2 | 0.75/0.75/0.75/0.75 | 75.0 | 🟢 | ct-product-buy.liquid:17-26 metafields.reviews.rating/rating_count + fallback settings (no default); gated :109 | G30 |
| Comparison band | ×2 | 0.75/0.5/0.5/0.5 | 60.0 | 🟡 | ct-comparison fixed 4-column (blank/us/alt_1/alt_2 @13-19); ct-brandmark = shop.name only; row block feature/us/alt_1/alt_2; no lead paragraph | G17/G18 |
| How it works | ×1 | 0.75/0.75/0.5/0.5 | 80.0 (spot-check 80) | 🟢 | ct-steps.liquid:13-35 `<ol>` + auto-number forloop.index (:16-18/:27), step block title/body/icon (:167-187), unlimited blocks → 7 steps | G24 |
| Exercise / usage map | ×1 | 0.5/0.5/0.5/0.5 | 50.0 | 🟡 | ct-hotspots image + hotspot blocks x/y/title/text/link; layout approximate | G25 |
| Reviews band | ×2 | 0.75/0.5/0.5/0.5 | 60.0 | 🟡 | ct-reviews eyebrow+heading (:36-37) + review block photo/name/verified/rating/title/body (:47-52); NO aggregate-score-header setting (4.7/52 proof head unslotted) | G30 |
| FAQ band | ×2 | 1.0/0.75/0.75/1.0 | 85.5 | 🟢 | ct-faq native `<details>` first-open, question/answer block | G36 |
| Final CTA | ×2 | 0.75/0.75/0.5/0.5 | 71.25 (spot-check 71.25) | 🟢 | ct-cta-banner.liquid:3-35 panel eyebrow/heading/subheading/2 buttons (schema 127-166) + tint (167-172); .ct-cta--tint = light --ct-action-tint (49-52) NOT dark band; Grep: no color_scheme setting in section | G37 |
| Sticky ATC | ×3 | 0.75/0.5/0.5/0.5 | 56.25 | 🟡 | ct-page.js:283-311 initSticky scroll listener (:300-310, getBoundingClientRect().bottom<0 :307) NOT IntersectionObserver; variant→price/save sync :288-298 | G43 |
| Toast notification | ×1 | 0.5/0.25/0.75/0.5 | 48.75 | 🟡 | ct-sticky-atc.liquid:57 toast div has NO role/aria-live; ct-toast.js host present | G45 |
| Footer | ×2 | 0.75/0.75/0.75/1.0 | 75.0 (spot-check 75) | 🟢 | footer.liquid:23-43 logo+brand_blurb; Info/Customer service hardcoded @47/60; disclaimer reuses brand_blurb (135-139), copyright auto @111 | G39/G40 |

### 3c. gainssteel-cart (tier-den 16; Coverage-Now 68.0%, After 88.2%)

| Unit | Tier | S/C/St/B | Score | Status | Evidence | Gap ids |
|---|---|---|---|---|---|---|
| Header / nav | ×3 | 0.75/0.5/0.5/0.75 | 62.5 | 🟡 | header.liquid logo/menu/sticky_mode; no cart-drawer trigger | G05/G06 |
| Trust marquee ticker | ×2 | 1.0/1.0/0.75/1.0 | 95.0 (spot-check) | ✅ | sections/ct-trust-marquee.liquid blocks[type=message].settings icon (:64) + text (:65), schema 59-67; reduced-motion gate | — |
| Cart heading band | ×2 | 0.75/0.25/0.5/0.5 | 53.75 | 🟡 | main-cart-items.liquid schema 476-507; heading locale-bound sections.cart.title; no eyebrow/heading/lead setting | G18/G19 |
| Cart line items | ×3 | 0.75/0.75/0.75/1.0 | 75.0 (spot-check) | 🟢 | main-cart-items.liquid img 102-117, title 124, options loop 152-159, compare-at strike `<s class=cart-item__old-price>` 131-138, `<quantity-input>` 251-305, `<cart-remove-button data-index>` 307-324; AJAX via cart.js (CartItems custom element) | G20 |
| Order summary / subtotal | ×3 | 0.75/0.5/0.5/0.75 | 65.0 | 🟡 | main-cart-footer subtotal+estimated_total+tax note; trust chips Return policy/SSL/Product support hardcoded (not a setting) | G22/G23 |
| Cart savings line | ×2 | 0.75/0.75/0.5/0.5 | 65.0 | 🟡 | sections/ct-cart-savings.liquid:12 saved=original_total−total, :21 if saved>0 (server-only, no live JS) | G24 |
| Upsell / cross-sell rail | ×1 | 0.75/0.75/0.5/0.75 | 70.0 | 🟢 | ct-cart-upsells products(limit 4) + AJAX add via ct-upsell-card; excludes in-cart by product_id | G25 |
| Empty cart state | ×1 | 0.75/0.25/0.5/0.5 | 53.75 | 🟡 | main-cart-items empty state locale-bound sections.cart.empty + general.continue_shopping; no editable eyebrow/heading/lead/CTA | G26 |
| Free-shipping progress | ×1 | 0.75/0.5/0.5/0.75 | 65.0 | 🟡 | ct-free-shipping-bar threshold from settings.ct_free_shipping_threshold_cents; cartUpdate live update | G29 |
| Reward checkpoints | ×1 | 0.75/0.75/0.5/0.75 | 70.0 | 🟢 | ct-cart-checkpoints milestone blocks threshold/label/icon/reached_text; live width via cartUpdate | G30 |
| Discount code field | ×2 | 0.75/0.75/0.5/0.75 | 70.0 | 🟢 | ct-cart-discount form → /discount/<code>?redirect=/cart, native fallback | G31 |
| Cart note | ×1 | 0.75/0.75/0.5/0.75 | 70.0 | 🟢 | ct-cart-note textarea pre-filled cart.note; POST cart/update.js + cartUpdate | — |
| Terms gate (TnC) | ×2 | 0.75/0.5/0.5/0.75 | 65.0 | 🟡 | ct-cart-tnc checkbox disables checkout until checked, fail-open, re-applies on cartUpdate | G33 |
| Checkout CTA | ×3 | 0.75/0.5/0.5/0.75 | 65.0 | 🟡 | main-cart-footer buttons block checkout submit + dynamic checkout; hardcoded trust row | G22 |
| Toast notification (overlay) | ×1 | 0.5/0.25/0.75/0.5 | 49.0 | 🟡 | ct-security.js:17-19 calls window.CT.toast; theme.liquid:313-317 wires it; settings_schema.json:1549-1553 ct_security_notice editable copy (gated by ct_copy_protect 1543-1547); ct-toast.js:18-30 dark-ink pill+slide-up+reduced-motion (:30). Wired ONLY to copy-protection, not cart remove/add/upgrade/checkout (design 567-570) | GAINSSTEELCART-G27/G28 |
| Footer | ×2 | 0.75/0.75/0.75/1.0 | 80.0 (spot-check) | 🟢 | footer.liquid logo (120-123), brand_blurb (135-139), info_menu/service_menu (141-149), contact_* (150-169), copyright auto @111; Info/Customer service/Contact us hardcoded @47/60/79 | G39/G40 |

---

## 4. Gap register

Critical-tier (×3) gaps first, then High (×2), then Standard (×1).

| GAP-id | Design › Unit | What's missing | Nearest capability (evidence) | Roadmap task | NEW proposal | Effort |
|---|---|---|---|---|---|---|
| HOME-G10 | homepage › bento hero / 3-tier offer (×3) | per-plan compare-at strike, `-off` save badge, dimmed excluded `<li>`, static payment chips | ct-pricing-table blocks[type=plan] name/price/period/features/featured/badge/button (schema 285-345) — no commerce-strike slots | W5.T03 / W3.T09 | NEW — add per-plan `compare_at`, `save_badge`, `excluded` feature flag, payment-icon row to ct-pricing-table plan block | M |
| HOME-G06..G09 | homepage › kinetic bento hero (×2→commerce-adjacent) | split/bento layout, outline-stroke hero words, stat tiles, kinetic reveal | ct-hero is single-column media hero, ZERO blocks (schema 238-344) | W5.T04 (heroes) | NEW — composite/bento hero section (media+stat-tile blocks + outline-text option) | M |
| PDP-G10 | pdp › tier/bundle selector (×3) | distinct per-bundle price + variant set (radiogroup with own prices) | ct-product-buy tier block = quantity-ladder, price=current_price×quantity (ct-product-buy.liquid:165); tier block has only title/pill/subtitle/badge/quantity (310-314) | W3.T03 (bundle) / W3.T01 | extends W3.T03 — bundle block w/ per-bundle product+price | M |
| PDP-G08/G09 | pdp › buy-box purchase panel (×3) | bullets/sub-description/breadcrumb slots; editable trust row | ct-product-buy trust row hardcoded (:233-246); no sub-desc/bullet settings | W3.T07 (trust set) | extends W3.T07 — benefits/bullets block + editable trust chips | S |
| CART-G22 | cart › order summary + checkout CTA (×3) | editable trust chips (Return policy/SSL/Product support hardcoded), savings-row live JS | main-cart-footer buttons else-branch hardcodes trust row (not a setting); ct-cart-savings server-only | W4 (cart parity) | extends W4 — block-driven summary trust chips + cart-level savings live update | M |
| HOME-G04/G05 | homepage/cart › header (×3) | header CTA button, icon-hide toggle, cart-drawer trigger | header.liquid settings logo/logo_width/menu/sticky_mode only; cart = plain `<a href=/cart>` no drawer hook | W6.T01/T02 | extends W6.T01 — header CTA + cart-drawer open hook | M |
| HOME-G29/G30/G31 | homepage › reviews & proof (×2) | aggregate score-header (4.7/52), UGC video lightbox/player | ct-reviews eyebrow+heading + review blocks (:36-52); NO aggregate-score setting; UGC .play tiles visual-only (design 661-663) | W5.T01 / W2.T07 | extends W3.T09 — reviews aggregate score-header block; W2.T07 carousel covers UGC wall | S+M |
| PDP-G30 / HOME-G30 | pdp/homepage › reviews band (×2) | aggregate score-header proof slot (score + count) | ct-reviews.liquid:36-52 has per-review blocks only | W3.T09 | extends W3.T09 — score-header setting on ct-reviews | S |
| HOME-G17/G18, PDP-G17/G18 | homepage/pdp › comparison (×2) | lead-paragraph/eyebrow slot above table; editable brandmark "us" header | ct-comparison fixed 4-column (alt labels @13-19); ct-brandmark emits shop.name only | W5.T03 | extends W5.T03 — comparison lead/eyebrow + editable us-column label | S |
| HOME-G38/G39/G40, PDP-G37 | homepage/pdp › final CTA (×2) | dark-ink panel + radial glow; rich `<em>` heading slot; scroll-reveal | ct-cta-banner tint = light --ct-action-tint (CSS 49-52); Grep: no color_scheme setting in section; heading plain text | W1.T17 + W1.T08 | extends W1.T17 — per-section color_scheme (dark band) on ct-cta-banner; W1.T08 reveal | S+M |
| HOME-G41..G43, PDP-G39/G40, CART-G39/G40 | all › footer (×2) | editable/localized column headings (Info/Customer service/Contact us hardcoded English) | footer.liquid markup :47/60/79 literal | W0.T01 | NEW — column-heading settings (or locale keys) on footer | S |
| CART-G18/G19, CART-G26 | cart › heading band + empty state (×2/×1) | eyebrow/heading/lead/CTA copy settings | main-cart-items locale-bound sections.cart.title/.empty; schema 476-507 no copy settings | W4 (cart parity) | NEW — cart heading + empty-state copy settings on main-cart-items | S |
| CART-G27/G28 | cart › toast (×1) | toast firing on cart remove/add/upgrade/checkout; per-action editable copy | CT.toast wired (ct-security.js:17-19, theme.liquid:313-317) but ONLY to copy-protection; ct_security_notice is a single global string (settings_schema.json:1549-1553) | W2.T09 | extends W2.T09 — cart-event toast triggers + per-action copy | M |
| PDP-G43, HOME-G11/G12/G13 | pdp/homepage › sticky ATC (×3) | IntersectionObserver-driven reveal (uses scroll listener) | ct-page.js:283-311 initSticky scroll listener (:300-310), not IO | W3.T02 | extends W3.T02 — sticky ATC IO reveal + show-matrix | S |
| PDP-G45 | pdp › toast (×1) | role/aria-live on toast div | ct-sticky-atc.liquid:57 toast div has no role/aria-live | W2.T09 | extends W2.T09 — add aria-live to toast | S |
| HOME-G14/G16, HOME-G19, PDP-G24 | homepage/pdp › problem/persona/steps (×1) | x/cross, door/suitcase/book glyphs; scroll-reveal | ct-icon dictionary maps ~26 keys (ct-icon.liquid:19-74) but lacks these specific glyphs; data-ct-reveal only in ct-styleguide.liquid | W2.T08 + W1.T08 | extends W2.T08 — add missing glyphs; W1.T08 wire reveal | S |
| HOME-G20/G22 | homepage › system band 5-up (×1) | 5-column layout; eyebrow field | ct-steps grid hard-capped repeat(3,1fr) (:54) | W5.T05 | extends W5.T05 — column-count option on ct-steps/icon-columns + eyebrow | S |
| ALL — typography | all › all heading/eyebrow units | Saira Condensed display, global uppercase, letter-spacing/tracking, outline-stroke text | css-variables.liquid:138,141 hardcodes Poppins for --ct-font-display/heading AND re-sets --font-heading-family (overriding theme.liquid:124 picker); no text-transform/tracking/stroke setting in settings_schema.json | W1.T05 | NEW — W1.T05 extended typography: wire --ct-font-display to font_picker + uppercase toggle + tracking ranges + outline-text option | M |

---

## 5. Roadmap projection (per workstream)

| Workstream | Units that move | Page % after |
|---|---|---|
| **W1.T05 extended typography** (display-font wire, uppercase, tracking, outline-text) | Lifts Style on every heading/eyebrow unit across all 3 pages (hero, FAQ, CTA, comparison, reviews, footer headings). Largest single Style lever. | homepage +~6, pdp +~6, cart +~5 |
| **W1.T08 + W2.T06 scroll-reveal engine** | Homepage how-it-works/timeline/problem/persona/CTA Behavior 0.5→1.0; PDP steps/CTA; sticky-ATC IO reveal. | homepage +~4, pdp +~3 |
| **W2.T07 carousel + W2.T09 toast** | Homepage reviews UGC wall + carousel; cart toast → cart-event triggers + aria-live (Toast 49→~92). | homepage +~2, cart +~5, pdp +~3 |
| **W3.T01/T02/T03 PDP blocks** (qty-break tier, sticky ATC block, bundle) | PDP buy-box purchase panel + tier/bundle selector + sticky ATC Structure/Content; homepage embedded buy box. | pdp +~9, homepage +~5 |
| **W3.T07/T09 trust + reviews/pricing** | Reviews aggregate-score-header (homepage+pdp); comparison lead/eyebrow; offer-card commerce slots; benefits/bullets. | homepage +~6, pdp +~5 |
| **W4 cart parity** (heading/empty copy, summary trust chips, savings live) | Cart heading band, empty state, order summary, savings, checkout CTA Content/Behavior. | cart +~7 |
| **W5.T03/T04/T05 sections** (comparison, bento hero, column-count, pricing-table) | Homepage bento hero (28→~70), system band 5-up, comparison; pricing-table per-plan. | homepage +~8 |
| **W6.T01/T02 header** (CTA, cart-drawer, mega-menu) | Header across all 3 pages Content/Behavior. | homepage +~2, pdp +~2, cart +~3 |
| **W0.T01 footer** (editable/localized column headings) | Footer Content across all 3. | all +~1.5 each |
| **Net** | | **homepage 59.5→82.4 · pdp 64.5→90.0 · cart 68.0→88.2** |

Note: roadmap status in `docs/ct-migration-status.md` is internally inconsistent (TL;DR claims W1.T05–T08 and W2.T01–T09 complete; the status matrix marks W1.T05–T08 ⬜). The after-roadmap projection treats each mapped task's acceptance criteria as delivered per §4, independent of current build status.

---

## 6. Token / style fit

### 6a. gainssteel-homepage — token map

| Design token | Role | Theme mechanism | Status |
|---|---|---|---|
| --orange #ff6b1a | action / primary button | settings.color_accent → --ct-accent → --ct-action → --ct-btn-bg (css-variables.liquid:93/95/229); 'Forge' preset already sets it (settings_data.json:580-587) | exact |
| --orange-deep #e35708 | action hover | settings.color_accent_hover → --ct-accent-strong → --ct-action-hover (:94/96/230) | exact |
| --green #1e7a4f / tint | trust/success | --ct-trust/--ct-trust-tint = --ct-success (:117/120-121) hardcoded, role present | approx |
| --gold #eda21a | rating star | --ct-rating #f4b400 (:129) hardcoded, yellower | approx |
| --red #d23a2c / tint | urgency/sale | --ct-urgency/--ct-error/--ct-price-save (:115/124/127) | approx |
| --ink #101216 / --steel | structure / dark bands | --ct-text #16181d (:81); dark BAND surfaces have no dedicated setting (only whole-section scheme) | approx/gap |
| --bg #f6f5f2 warm canvas | surface | --ct-bg fixed #ffffff (:77); reachable only via color_scheme background (40-101), not Brand panel | approx |
| --hard 7px 7px 0 ink | brutalist hard-lift shadow | --ct-shadow-lift 7px 7px 0 var(--ct-text) (:73) EXACT; buttons skin can build 7/7/0 zero-blur | exact |
| Saira Condensed 800-900 display | display typeface | css-variables.liquid:138/141 hardcodes Poppins + re-sets --font-heading-family overriding theme.liquid:124 picker | gap |
| global UPPERCASE | type treatment | no text-transform setting in settings_schema.json (grep:0) | gap |
| tracking (-.01em / +.2em / +.16em) | type treatment | no letter-spacing setting | gap |
| outline/stroke text (.ol/.num) | kinetic type | no stroke/transparent-fill token or setting | gap |
| light-mode lock + force-dark defeat | color-mode | settings.ct_force_light_mode (:1497-1503, default true) → css-variables.liquid:8-49 same gradient-pin technique | exact |

**Preset verdict (homepage): NO** — cannot ship as zero-custom-CSS preset. Color layer is essentially solved (named 'Forge' preset carries the action orange/radius/glass/light-lock; trust-green, rating-gold, urgency-red, ink/steel roles all have --ct-* tokens; hard-lift shadow + light-lock map exactly). Blocking: the load-bearing TYPOGRAPHY identity is unreachable — display font hardcoded to Poppins (and the picker overridden), no uppercase/tracking/outline-text settings. At best a ~60% color/shape preset. Close via W1.T05 extended typography.

### 6b. gainssteel-pdp — token map (24 mappings; key ones)

| Design token | Role | Theme mechanism | Status |
|---|---|---|---|
| --orange #ff6b1a / --orange-deep #e35708 | action / hover | color_accent / color_accent_hover → --ct-action/--ct-action-hover (css-variables.liquid:93-96,229-230) | exact |
| --bg #f6f5f2 | page surface | --ct-bg pinned #ffffff under force-light (:77); per-scheme only (:337-342) | approx |
| --card #ffffff | card surface | --ct-bg-raised:#ffffff (:77,341); card_color_scheme (settings_schema.json:537-541) | exact |
| --line #e4e2dc warm border | border | --ct-border #e7e9ec cool (:84) or per-scheme rgba(fg,.18); no independent warm-border setting | approx |
| --ink #101216 dark bands | dark accent surface | --ct-text #16181d (:81); no "dark accent surface" setting; only whole-section color_scheme | gap |
| --green/--gold/--red | trust/rating/urgency | --ct-success/--ct-rating/--ct-urgency (:117/129/115) near-hex, hardcoded, not editable | approx |
| Saira Condensed 800/900 | display face | type_header_font picker (113-116) OVERRIDDEN by css-variables.liquid:137-141 Poppins hardcode; Saira not in Shopify font library | gap |
| Inter body | body face | type_body_font (131-136) but --ct-font-body hardcoded Inter (:139) — present by hardcode, picker inert | approx |
| UPPERCASE + neg tracking + lh .96 | type treatment | no text-transform/letter-spacing token; typography panel = picker + scale only (113-146) | gap |
| outline/stroke text | kinetic type | no token/setting | gap |
| --radius 14 / --radius-lg 20 | corner radius | settings.border_radius (1479-1487) → --ct-r-md; --ct-r-lg/xl hardcoded; card radius range covers 20 | exact/approx |
| button radius 11px | button corner | buttons_radius (262-270, step 2) → 10/12, not exact | approx |
| --hard 7px 7px 0 ink | hard-lift shadow | --ct-shadow-lift (:73) exact; buttons_shadow_* offset±12 + blur 0 builds 7/7/0 (286-305) | exact |
| --orange-tint #fff1e6 | action-subtle tint | --ct-accent-subtle fixed grey #f3f4f6 (:100), NOT derived from accent — orange accent leaves grey tint | gap |
| light-lock + force-dark defeat | color-mode | ct_force_light_mode (1497-1503) → css-variables.liquid:8-49 | exact |
| marquee + scroll-reveal | motion | reveal via animations_reveal_on_scroll (205-231); reduced-motion zeroes durations (:353-355); MARQUEE element has no setting | approx/gap |

**Preset verdict (pdp): NO.** ~40% reproducible via existing surface (accent action color, corner radius, 7/7/0 hard-lift via buttons skin, light-lock, accent-tinted focus ring, scroll-reveal/hover-lift). Blocking gaps: (1) Saira Condensed hardcoded Poppins + absent from font_picker; (2) uppercase + negative-tracking heading treatment (no setting); (3) outline/stroke kinetic text; (4) dark accent bands (only whole-section scheme, not per-band); (5) warm border + accent-tracking tint are fixed cool-grey hexes; (6) marquee/ticker element has no section/setting; (7) warm #f6f5f2 canvas reachable only by editing a scheme background + tagging section roots. Ship as color/shape/shadow preset only.

### 6c. gainssteel-cart — token map (key)

Same Forge system. Reproducible today: action color (color_accent/_hover, settings_schema.json:1463-1472, default grey so merchant must change), body font Inter, base radius ~14px, pill radius, button radius+hard-lift direction (buttons_radius + buttons_shadow_*), light-lock (ct_force_light_mode), trust/rating/urgency commerce colors render near-exact by default. Blocking: (1) Saira Condensed not in font library + --ct-font-display hardcoded Poppins (css-variables.liquid:137); (2) no uppercase/tracking token (W1.T05 ⬜); (3) outline/stroke .ol/.num text; (4) --orange-tint #fff1e6 → --ct-accent-subtle hardcoded grey #f3f4f6 (:100), not accent-derived; (5) dual radius scale (single global slider; --ct-r-lg 18px hardcoded); (6) dark accent bands (no per-section scheme on cart, W1.T17 ⬜); (7) hard-lift button shadow tokens emitted but not consumed (W1.T06 ⬜); (8) marquee (W5.T02) + scroll-reveal engine (W1.T08) unwired; (9) commerce-role colors render near-exact by default but are NOT merchant-settable.

**Preset verdict (cart): NO** — though closer than a naive read (theme's --ct-* layer was modeled on this Forge system: same 60/30/10 split, same --ct-shadow-lift 7px 7px 0, same pad-tight/loud rhythm, same light-lock gradient-defeat). Smallest closing tasks: W1.T05 (uppercase/tracking/display-font-wire + stroke), W1.T06 (consume the emitted --ct-btn-shadow-* hard-lift), and wiring --ct-accent-subtle off color_accent. With those it flips to YES for everything except the Saira Condensed face (a font-availability limit, not a theme gap).

---

## 7. Compliance readiness

Four universal commerce-compliance checks, assessed against the THEME render path (not the static mockups' demo JS). All citations file:line at branch `custom-theme`.

### gainssteel-homepage

| Check | Result | Evidence |
|---|---|---|
| Compare-at strike/badge/savings AUTO-HIDE when compare_at empty/≤price | **PASS** | snippets/price.liquid:49 `price--on-sale` only `if compare_at_price > price`; component-price.css:57/76/87 hides sale/strike unless on-sale. card-product.liquid:107/156/580 savings+sale badge gated `compare_at_price > price and available`. ct-product-buy.liquid:13 save_percent only if compare>current; :153 strike+SAVE% wrapped; per-tier :178/:196. nil>price=false → all hidden. |
| No hardcoded ratings/sold/urgency in rendered defaults; data-bound (Judge.me) | **PASS** | ct-product-buy.liquid:19-21 reads metafields.reviews.rating/rating_count; :24-26 fallback_* settings ship with NO default (schema 268-270) → blank on bare store; :109 gates rating row. product.landing.json seeds no fallback_* keys. ct-reviews uses neutral placeholders ([Customer name] etc., 48-52); star count is a range setting (default 5). show_countdown default false (:278). |
| Exactly ONE Product JSON-LD on PDP-type pages, no hardcoded aggregateRating | **PASS** | PDP via product.json → main-product.liquid:846-881 single Product LD-JSON; aggregateRating gated :871 `if schema_rating != blank and schema_rating_count_number > 0`, values from metafields (841-877). JSON-LD grep limited to main-product/featured-product/main-article; product.json includes none of the latter; no ct-* section emits JSON-LD. featured-product.liquid:486 structured_data unused (no template reference). Mockup head has only Organization LD-JSON. |
| prefers-reduced-motion honored | **PASS** | ct-trust-marquee .gs-marquee-track (gs-scroll @section-ct-components.css:829) disabled @section-ct-responsive.css:337-343 (pure-CSS, no RAF watchdog — unlike mockup:801-816). ct-carousel.js:17/40 autoplay only if !reduceMotion. ct-reveal.js:8/20 + base.css:3261 honor reduced motion. Countdown is text-only + opt-in (show_countdown default false). |

### gainssteel-pdp

| Check | Result | Evidence |
|---|---|---|
| Compare-at auto-hide | **PASS** | ct-product-buy.liquid:13 + :153 (strike :154 / save-tag :155 gated); per-tier :168/:196. ct-sticky-atc.liquid:8 + :40 data-save only `if compare>price`. price.liquid:49-50 on-sale class only if compare>price. No unconditional strike. |
| No hardcoded ratings/sold/urgency in defaults | **PASS** | ct-product-buy.liquid:17-26 binds rating from metafields.reviews.*; fallback_rating/review_count/sold_text have NO default (268-270) → blank, gated :109. Tier price = current_price×quantity (:165), not hardcoded. show_countdown default false (:278). product.landing.json review blocks = neutral placeholder copy. |
| Exactly ONE Product JSON-LD, no hardcoded aggregateRating | **PASS** | product.json → main-product.liquid:846-881 single node; aggregateRating gated :871, bound to metafields (841-843). No ct-* section emits ld+json (grep clean). ADVISORY: product.landing.json (the ct-* funnel mirroring this design) emits ZERO Product JSON-LD (under-emission, not the double-emission failure the check guards). featured-product.liquid:486 not on product templates. |
| prefers-reduced-motion honored | **PASS** | ct-trust-marquee .gs-marquee-track (section-ct-components.css:829) + .gs-announce__track (gs-scroll @section-ct-base.css:208-216) disabled @section-ct-responsive.css:337-343. ct-reveal.js:8 matchMedia + :37-40 immediate reveal + :20 reduced-motion stylesheet. Sticky/toast transitions nulled :345-348. No autoplay carousel/countdown by default. |

### gainssteel-cart

| Check | Result | Evidence |
|---|---|---|
| Compare-at auto-hide (incl. cart-summary savings) | **PASS** | price.liquid:49; ct-product-buy.liquid:13/153 + per-tier :168/:196; ct-price-tokens.liquid:32 resolves compare/saved only when `ct_unit_compare != blank and > ct_unit`. Cart line strike main-cart-items.liquid:126/196 gated `item.original_price != item.final_price`. Summary savings row → ct-cart-savings.liquid:12 (saved=original−total) + :21 `if saved > 0`. All bound to Shopify objects. |
| No hardcoded ratings/sold/urgency in defaults | **PASS** | ct-product-buy.liquid:18-26 metafield-bound; fallback_* no default (268-270), row gated :109. show_countdown default false (:278). Product buy preset (318-327) seeds only tier quantities. templates/*.json have no fallback_rating/review_count/sold_text (grep clean). ct-cart-checkpoints defaults (Rewards progress/0/Reward/Unlocked!) carry no sold/urgency numbers. |
| Exactly ONE Product JSON-LD on PDP-type pages, no hardcoded aggregateRating | **PASS** | `"@type":"Product"` grep matches only main-product.liquid (846-881); aggregateRating gated :871 from metafields (841-843). product.json renders one main-product, no featured-product; ct-* buy/info sections emit no JSON-LD. featured-product.liquid:487 structured_data not on any PDP template. Cart pages (cart.json → main-cart-items + main-cart-footer) emit no Product JSON-LD (correct for cart type). |
| prefers-reduced-motion honored | **PASS** | Mockup .mtrack → ct-trust-marquee .gs-marquee-track (animation gs-scroll var(--ct-marquee-duration,24s) @section-ct-components.css:829) neutralized + .gs-announce__track @section-ct-responsive.css:337-343 (animation:none; transform:none; will-change:auto); same block kills .gs-sticky/.gs-toast transitions (345-348). Marquee speed also a merchant range setting (default 30). Scroll-reveal reduced-motion-safe. No always-moving element runs unconditionally. |

---

## 8. Assumptions, unverified items, audit changelog

**Assumptions.**
- The GainsSteel family is one "Bold Athletic / Forge" design system; commerce units were scored against the theme path that would actually render each design: homepage/PDP buy-box/sticky/marquee surfaces → `templates/product.landing.json` ct-* funnel; canonical PDP commerce + JSON-LD → `templates/product.json` → `sections/main-product.liquid`; cart → `templates/cart.json` → `main-cart-items` + `main-cart-footer`. The static mockups' demo JS (display-only carts, rafMarquee watchdogs) was NOT credited as theme capability; the theme equivalents do not carry those defects.
- Roadmap mapping uses `docs/ct-migration-status.md` task IDs primarily, Appendix A as fallback. That doc is internally inconsistent (TL;DR marks W1.T05–T08 / W2.T01–T09 complete while the status matrix marks W1.T05–T08 ⬜); the after-roadmap projection assumes mapped tasks' acceptance criteria delivered per §4, independent of current build state.
- Editor-only counting honored: custom-liquid blocks, hand CSS, and code-edit-only treatments (the entire typography identity) were NOT credited; units depending on them are capped/marked gap.

**Unverified items (count ×0.5 where scored).**
- UGC video tiles `.play` (homepage reviews band, design 661-663): visual-only, no lightbox/player handler — Behavior unverified.
- `data-ct-reveal` scroll-reveal: markup present only in `ct-styleguide.liquid`; absent from every CT-native marketing band → reveal Behavior unwired across G10/G16/G24/G26/G28/G40.
- Several JS custom elements are defined but UNWIRED (grep:0 markup): `<ct-carousel>`, `<ct-countdown-timer>`, `<ct-copy-button>` (the section uses an inline handler), `[data-ct-price-tokens]`, `card-product [data-quickview]`, `main-product addon` block (renders zero DOM). Counted ×0.5 / 0 where they back a unit.
- Cart-AJAX sections follow Dawn's tested product-form pattern but `docs/ct-migration-status.md` flags them as functionally unverified pending a live `shopify theme dev` render (ECONNRESET). Scored on code-path evidence; live QA still owed.

**Parsing confidence:** HIGH for all three designs (non-minified, full head + inline style + script).

**Audit changelog (Phase-6 self-verification corrections folded in).**
- **gainssteel-homepage — 1 correction applied.** Reviews & proof band Behavior 0.5→0.75 (unit 50.5→56.5): FALSE NEGATIVE — the scorer conflated the standalone unwired `<ct-carousel>` namespace (`[data-ct-carousel-track]`/`[data-ct-slide]`) with the carousel ct-reviews actually uses. ct-reviews.liquid:7 emits `data-gs-carousel`, :14 `data-gs-slide`, :28 `data-gs-dots`; ct-page.js:419-420 selects `[data-gs-carousel]` and runs initDots (clickable dots + passive scroll sync, idempotent `box.dataset.ready`, section:load rebind :428) — VERIFIED end-to-end. Not 1.0 because the 3 UGC video tiles remain visual-only. Coverage-Now 58.97→59.45 (~59.5); After unchanged 82.4. Also corrected a recurring imprecision: the icon dictionary is ~26 keys (ct-icon.liquid:19-74), not the "9-key" framing repeated in gap text — does NOT change any Style score (the limiting factor is the specific missing glyph, not dictionary size). ARITHMETIC NOTE: the scorer's headline 55.5 did not reconcile with its own unit table; tier-weighted Σ over 16 units (tier sum 25) = 58.97 before corrections. Spot-checks (FAQ 85.5, How-it-works 71.5, Final CTA 68.75) all PASS the evidence rule. Red unit 28 (hero) and Hero C=0.4 re-confirmed.
- **gainssteel-pdp — 0 corrections.** Re-opened all 8 units with Content<0.5 (Header, buy-box gallery, purchase panel, comparison, exercise map, reviews, sticky ATC, toast); no red/fail units. Confirmed genuine gaps, no over/under-credit: G37 (no color_scheme on ct-cta-banner, dark-band unreachable), G10 (tier = quantity-ladder :165 not distinct-price bundle), G17/G18 (ct-comparison hard 4-column + brandmark, no lead), G30 (no aggregate-score-header on ct-reviews), G43 (sticky reveal is a scroll listener, not IO), G45 (toast lacks aria-live). Minor non-scoring line-citation drift (±2 lines) noted, no subscore changed. Coverage-Now recomputed 64.47 (~64.5); After 90.0 unchanged. Spot-checks (How it works 80, Final CTA 71.25, Footer 75) PASS.
- **gainssteel-cart — 1 unit, 4 sub-corrections applied (Toast, RED→YELLOW).** FALSE NEGATIVE on the premise: the scorer claimed `CT.toast` has zero callers and no editor copy. Both wrong — ct-security.js:17-19 calls `window.CT.toast(notice)`; theme.liquid:313-317 wires it end-to-end; settings_schema.json:1549-1553 (`ct_security_notice`, gated by `ct_copy_protect` 1543-1547) is the editable copy slot. Corrections: Content 0→0.25 (one editable string; design needs ~3 contextual messages → 1/3), Style 0.5→0.75 (ct-toast.js:18-30 self-injects token-driven dark-ink pill + slide-up + reduced-motion guard :30), Behavior premise fixed (unverified cap removed) but stays 0.5 because the cart-action triggers (remove/add/upgrade/checkout, design 567-570) are genuinely unwired — the toast fires only in the copy-protection flow. Unit 38→49. Gap text reworded: GAINSSTEELCART-G27 from "zero callers/unwired" → "CT.toast wired only to copy-protection, not cart commerce events"; G28 from "no editor copy" → "single global ct_security_notice string, not per-cart-action messages". Other Content<0.5 units (Cart heading band, Empty cart) re-greped clean — both locale-bound (sections.cart.title/.empty / general.continue_shopping) with no eyebrow/heading/lead/CTA settings (main-cart-items schema 476-507); C=0.25 upheld. Coverage-Now 67.19→67.88 (~68); After 88.2 unchanged (toast's post-W2.T09 after-target ~92 unmoved; only its now-score rose). Spot-checks (Trust marquee 95, Cart line items 75, Footer 80) all VALID (one minor citation imprecision: cart.js line 23 is the debounce-timer arg, not the fetch — claim still holds; cart.js IS the AJAX driver).
