# CozyClaw — Product Detail Page (PDP) build spec

Build the CozyClaw Lounge Mat product page. Pairs with `cozyclaw-design-system.md` (tokens +
components) and `cozyclaw-pdp.html` (reference implementation). Spec wins over the HTML.

## Goal
A store-native product page that converts ad and organic traffic: a gallery + a tiered **bundle
buy box** with opt-in add-ons and a live total, followed by social proof, benefits, details,
shipping, reviews, and a final CTA — all compliant with Google Merchant Center and Meta ad policy.

## Tech & constraints
- Vanilla HTML/CSS/JS, single file, no frameworks, no build, no browser storage.
- Fonts via Google Fonts: Fraunces (display), Public Sans (body), DM Mono. Light-mode locked.
- All styling from `--ct-*` tokens (see design system §2). Currency = **USD** (market: Shopify US,
  `en-US`) via Shopify's `money` filter; the prototype shows `$x.xx` placeholders.
- `body` has `padding-bottom:78px` to clear the sticky bar.

## Global chrome
- **Announce bar** (`.announce`, accent bg): "Free shipping on qualifying orders · Loved by 15,000+ cat parents".
- **Header** (`.header`, sticky+blur): brand `Cozy`+accent`Claw`; nav → `#bundle` Bundle & Save,
  `#why` Why It Works, `#specs` Details, `#reviews` Reviews; cart icon.
- **Footer** (`.footer`, 4 cols): brand + tagline + `support@cozyclaw.com`; **Shop**; **Help**
  (Shipping, Returns & 7-Day Guarantee, Contact, FAQs); **Legal** (Privacy Policy, Terms of
  Service, Refund & Return Policy, Cookie Policy). Bottom: "© 2026 CozyClaw" + payment methods.
- **Sticky add-to-cart** (`.sticky-atc`, fixed bottom): thumb + product name + **live Total** +
  Add to cart. Reveals (`.show`) when the buy box's `getBoundingClientRect().bottom < 80`.

## Page sections (in order)

### 1. Breadcrumb
`.crumb` — Home / Cat Beds & Mats / **CozyClaw Lounge Mat**.

### 2. Product (`#pdp`, `.pdp-grid` = `1.02fr .98fr`, stacks at ≤900px)

**2a. Gallery (left)**
- `.gallery-main` (aspect 1/1, bg `#FCFBFE`, big product image): **clean, text-free** primary
  image. The sale flag `.gallery-badge` ("20% OFF") is an **overlay**, never part of the image.
- `.gallery-thumbs`: 5 thumbs — first is the clean primary (`is-active`, `data-life="0"`), the
  rest lifestyle (`data-life="1"`). Clicking a thumb swaps the main image and toggles the
  `.life` lifestyle background.

**2b. Buy box (right)**
1. `.bb-ratingrow`: `★★★★★` + link "13 reviews" → `#reviews`.
2. `h1.bb-title`: "CozyClaw Lounge Mat" (Fraunces, accent).
3. `.bb-pricerow`: now `$35.97` · was `$44.97` (strike) · `SAVE 20%` chip.
4. `.salesbar` (full-width, accent-subtle): "🔥 2,175 sales".
5. `.bb-avail`: green dot + "In stock — ships in 3–7 business days".
6. **Bundle block** (`#bundle`):
   - Divider: "The more they lounge, the cozier their space — Bundle & Save".
   - **Tier: Single Cozy Spot** — `.tier` `data-price="3597"`. Tag "Save 20%". Sub "You save
     $9.00". Price `$35.97` / `$44.97`. Options (shown only when active): one
     color `select` → Midnight Black / Cozy Brown / Dove Grey.
   - **Tier: Double Comfort** — `.tier.is-active` (default selected) `data-price="5797"`.
     Corner flag "💎 Best value · free shipping". Tag "Save 36%". Sub "You save $31.98".
     Price `$57.97` / `$89.94`. Options: **two** color `select`s (one per mat).
   - Divider: "⭐ Limited-time add-on discount ⭐".
   - **Add-on: ChompClean Toy** — `.addon` `data-price="1399"`, **unchecked by default**.
     "Save $12.98!" · `$13.99` / `$26.97` · corner badge "💰 Biggest savings today".
   - **Add-on: Easy Hair Removing Glove** — `.addon` `data-price="799"`, unchecked.
     "Save $5.98!" · `$7.99` / `$13.97` · corner badge "🏆 Best-selling combo".
7. `.bb-total`: "Total" + live total (default `$57.97` = Double, no add-ons).
8. Primary `Add to cart` (`.btn-primary.btn-full.btn-lg`).
9. `.bb-secure`: lock icon + "Secure checkout · Visa, Amex, Apple Pay & Shop Pay".
10. `.bb-trust3`: three round icon badges — Fast shipping / Secure payments / Support that cares.

**Selection model:** no visible radio or checkbox. The native `input`s and the indicator spans
are `display:none`. Selection is shown only by the **card highlight** (`.is-active` = accent
border + faint accent tint). Tap anywhere on a card to select/toggle it.

### 3. Trust strip #1 (`.trust-strip`)
Fast shipping · Money-back guaranteed · Secured payments.

### 4. Marquee (`.marquee`, `aria-hidden`)
"♥ Loved by thousands of kitties" repeated; scrolls; pauses under reduced-motion.

### 5. Why (`#why`, `.pillars` 2×2)
Four `.pillar` cards: **Ultra-soft plush comfort**, **Supportive pillow design**, **Sofa
protection & non-slip base**, **Durable & easy to clean** (icon tile + Fraunces heading + 2–3
sentence benefit). Copy: see reference HTML.

### 6. Details (`#specs`, `.details-grid` = `1.1fr 1fr`)
- Prose "Product details" (2 paragraphs).
- `.spec-card` "Specifications": Size `31.5 × 35.43 in` · Material `Polyester, PP cotton` ·
  Backing `Non-slip` · Care `Machine wash, cold & gentle` · Package includes `1 × CozyClaw Lounge Mat`.

### 7. Shipping & guarantee
- `.ship-grid` 3 cards: **Processing** 3–7 business days (Mon–Fri); **Domestic** 5–15 business
  days; **International** 7–20 business days, worldwide.
- `.guarantee` panel: "🛡️ Risk-free 7-day guarantee" + email `support@cozyclaw.com`.

### 8. Trust strip #2
Fast shipping · Support that cares · 7-day money-back · Secured checkout.

### 9. Reviews (`#reviews`)
- `.rev-head`: score **4.6**; "92% 5-star · 12 five-star, 1 four-star · 13 verified reviews".
- `.rev-grid` 3 cards: Jackie (5★), Zinnias (5★), rlungtha (**4★**, the realistic note about the
  mat arriving vacuum-sealed and taking a day to fluff). Keep the one 4-star — do not make it perfect.

### 10. Final CTA (`.finalcta`)
Eyebrow + "CozyClaw Lounge Mat" + price (`$35.97` / `$44.97` / SAVE 20%) + availability
+ button "Choose your bundle" → `#bundle` + note "🔒 Secure checkout · Free shipping on the
Double Comfort bundle · 7-day money-back guarantee".

## Interactions (JS)
- `fmt(c)` → `(c/100).toLocaleString('en-US',{style:'currency',currency:'USD'})` in the prototype
  (`data-price` is in cents). In the live theme, render prices with `{{ ... | money }}` instead.
- `recalc()` → total = active tier `data-price` + Σ active add-on `data-price`; write to `#bbTotal`
  and `#stickyTotal`.
- Tier click → clear `.is-active` on all `.tier`, set on clicked, check its input, reveal its
  options (`.tier.is-active .tier-options{display:grid}`), `recalc()`.
- Add-on click → toggle `.is-active` + its checkbox state, `recalc()`.
- Gallery thumb click → swap main image + `.life` bg, move `is-active`.
- Reveal-on-scroll via IntersectionObserver adding `.is-visible` to `.reveal`.
- Sticky bar toggle on scroll. Run `recalc()` once on load.

## Compliance (must hold)
- Primary gallery image clean/text-free on neutral bg; all promo (20% OFF, sales count, badges)
  are HTML overlays, never baked into the image file.
- Add-ons **unchecked by default** (opt-in). Bundle tiers are clearly priced choices.
- On-page price & availability match the product feed; no coupon codes in the title.
- Footer privacy/terms/refund/cookie links present; secure-checkout signal present; contact email present.
- Benefit-focused copy; no personal-attribute targeting; no before/after or health claims; no pop-ups.
- "Limited-time" / "biggest savings" / "2,175 sales" must be genuinely true when ads run.

## Shopify data sources (Dawn theme)

Implement as a custom `main-product` section plus blocks. Bind every dynamic value to Shopify —
the prototype numbers/copy are placeholders.

| UI element | Shopify source |
|---|---|
| Title ("CozyClaw Lounge Mat") | `product.title` |
| Price / compare-at / SAVE % | variant `price` and `compare_at_price` rendered with the `money` filter; SAVE % computed from the two |
| Availability ("ships in 3–7 days") | `variant.available` / inventory, plus a processing-time section setting or metafield |
| Gallery primary (clean image) | `product.featured_media` / media position 1 — keep one clean, text-free image as primary |
| Gallery lifestyle thumbs | the remaining `product.media` |
| Color options (Midnight Black, etc.) | `product.options_with_values` and variant selection |
| Rating + review count | review app metafields (Shopify Product Reviews, Judge.me, or Loox) |
| Reviews list | review app block / app embed |
| Product details + specs | `product.description` and `product.metafields.specs.*` |
| "🔥 2,175 sales" | not a native field — a metafield or social-proof app; must be truthful, otherwise remove |
| Bundle tiers (Single / Double) | Shopify native Bundles or a quantity-break/bundle app; the two Double color selects map to the two bundled mats' variants |
| Add-ons (ChompClean, Hair Glove) | product-reference metafield (e.g. `product.metafields.custom.addons`) or an upsell app; each add-on's title/price/compare-at from its own product; discount via automatic discount or bundle app |
| Announce text, free-ship threshold, trust badges, shipping/guarantee copy | section/block settings (theme customizer) so the merchant edits without code |
| Brand colors / fonts | theme `settings` → `css-variables.liquid` (`--ct-*`) |
| Footer policy links | Shopify policy pages (`shop.privacy_policy`, `shop.refund_policy`, `shop.terms_of_service`) + a Cookie page |
| Money formatting | the `money` filter (USD, `en-US`) — never hardcode `$` |

Cart: "Add to cart" posts the selected bundle/variant plus any ticked add-ons to `/cart/add`
(add-ons as separate line items or via the bundle app). The prototype's live total mirrors the cart.

## Acceptance checklist
- [ ] No "CuddlesMeow" anywhere; brand reads CozyClaw; product "CozyClaw Lounge Mat".
- [ ] All colors from `--ct-*` (except logo + urgency-red + rating-gold). Light-mode only.
- [ ] Default tier = Double Comfort; total shows `$57.97` on load.
- [ ] Selecting Single shows 1 color select; Double shows 2; total updates correctly.
- [ ] Add-ons start unchecked; ticking each updates the total and the sticky total.
- [ ] No visible native radio/checkbox; selection shown by card highlight only.
- [ ] Gallery primary image clean; "20% OFF" is an overlay; thumbs swap the main image.
- [ ] Footer has Privacy/Terms/Refund/Cookie; contact email present; secure-checkout shown.
- [ ] Sticky bar appears after the buy box scrolls off and mirrors the live total.
- [ ] `prefers-reduced-motion` pauses the marquee and reveals; focus ring visible; 48px targets.
