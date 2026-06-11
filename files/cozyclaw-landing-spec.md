# CozyClaw — Landing Page build spec

Build the CozyClaw Lounge Mat marketing landing page for paid/ad traffic. Pairs with
`cozyclaw-design-system.md` (tokens + components) and `cozyclaw-landing.html` (reference
implementation). Spec wins over the HTML.

> Migration note: the current `cozyclaw-landing.html` renders the title as "CozyClaw Mat". The
> canonical product name is **CozyClaw Lounge Mat** — use that.

## Goal
A focused, high-converting long-form page that takes ad traffic to one purchase decision, with
layered reassurance (social proof, benefits, bundle, reviews, guarantee). Must match its ad
creative and satisfy Google Merchant Center and Meta ad policy.

## Tech & constraints
- Vanilla HTML/CSS/JS, single file, no frameworks, no build, no browser storage.
- Fonts: Fraunces (display), Public Sans (body), DM Mono. Light-mode locked.
- All styling from `--ct-*` tokens (design system §2). Currency = **USD** (Shopify US, `en-US`)
  via the `money` filter; prototype shows `$x.xx`.
- `body` has bottom padding to clear the sticky bar.

## Global chrome
- **Announce bar** (`.announce`, accent bg): "Free shipping on orders over $50 · ★★★★★ 92% 5-star · Loved by 15,000+ cat parents".
- **Header** (`.header`, sticky): brand `Cozy`+accent`Claw`; nav → `#why`, `#details`, `#reviews`, `#bundle`; cart icon.
- **Footer** (`.footer`, 4 cols): brand + tagline + `support@cozyclaw.com`; **Shop**; **Help**;
  **Legal** (Privacy Policy, Terms of Service, Refund & Return Policy, Cookie Policy). Bottom:
  "© 2026 CozyClaw" + payment methods.
- **Sticky add-to-cart** (`#satc`): product name + price + Add to cart; reveals after the hero scrolls off.

## Page sections (in order)

### 1. Hero (`#buy`, two-column; stacks on mobile)
- **Left (copy):** sale badge (`.sale-badge`, urgency) e.g. "🔥 2,175 sold"; `h1` "CozyClaw Lounge
  Mat"; italic sub (Fraunces) "The more they lounge, the cozier their space."; short description;
  rating row (★★★★★ · 4.6 · links to `#reviews`); price row ($35.97 / $44.97 / Save 20%);
  availability "In stock — ships in 3–7 business days"; primary CTA "Add to cart" + secondary
  "See why it works" → `#why`; trust pills (free shipping, 7-day money-back, secure checkout).
- **Right (visual):** `.product-card` with a **clean, text-free** primary product image on a
  neutral background (feed-safe); a small `.float-tag` callout (e.g. size); a thumbnail row =
  1 clean primary + lifestyle shots. Any sale flag is an **overlay**, not baked into the image.

### 2. Trust strip (`.trust-strip`)
Fast shipping · Money-back guaranteed · Secured payments.

### 3. Value proposition (`.value.sec`)
Eyebrow "The cozy upgrade" + `h2` "The more they lounge, the cozier their space." + supporting
copy and a lifestyle image. Emotional benefit (cat comfort) + practical benefit (sofa protection).

### 4. Why choose us (`#why`, `.pillars`/cards)
`h2` "Your cat will love you even more." + four benefit cards: **Ultra-soft plush comfort**,
**Supportive pillow design**, **Sofa protection & non-slip base**, **Durable & easy to clean**.

### 5. Bundle & save (`#bundle`)
Eyebrow "⭐ Limited-time add-on discount" + `h2` "Bundle & save." Add-on offers pulled from
Shopify (each its own product): **ChompClean Toy** $13.99 (was $26.97, save $12.98) and **Easy
Hair Removing Glove** $7.99 (was $13.97, save $5.98). Add-ons are **opt-in**. (Optional: reuse the
PDP's tiered bundle buy box component for a unified experience.)

### 6. Details (`#details`)
`h2` "Made to be lived on." + specifications: Size 31.5 × 35.43 in · Material Polyester, PP cotton
· Backing Non-slip · Care machine wash cold · Package includes 1 × CozyClaw Lounge Mat.

### 7. Marquee (`.marquee`, `aria-hidden`)
"♥ Loved by thousands of kitties" repeated; pauses under reduced-motion.

### 8. Reviews (`#reviews`)
Score 4.6 · "92% 5-star · 12 five-star, 1 four-star · 13 verified reviews" + 3 cards: Jackie (5★),
Zinnias (5★), rlungtha (4★ — keep the realistic vacuum-sealed-bag note).

### 9. Shipping & guarantee (`.value.sec`)
Processing 3–7 business days (Mon–Fri); Domestic 5–15; International 7–20 worldwide; "Risk-free
7-day guarantee" + `support@cozyclaw.com`.

### 10. Final CTA (`.final.sec`)
Eyebrow "Ready to make their day cozier?" + "CozyClaw Lounge Mat" + price + availability + "Add to
cart" + reassurance note (secure checkout · free shipping · 7-day money-back).

## Interactions (JS)
- Reveal-on-scroll (IntersectionObserver → `.is-visible`).
- Hero gallery thumb swap (primary ↔ lifestyle).
- Sticky bar reveal after the hero scrolls off.
- Honor `prefers-reduced-motion` (pause marquee, disable reveals). Prices render with `money`.

## Shopify data sources (Dawn theme)

This is a marketing template; most copy lives in **section/block settings** so the merchant edits
it in the theme customizer. Product values bind to the product object.

| UI element | Shopify source |
|---|---|
| Title, price/compare-at, availability, primary & lifestyle images, rating | the `product` object + review-app metafields (same as the PDP) |
| Sale badge "🔥 2,175 sold" | metafield or social-proof app — must be truthful |
| Headlines, eyebrows, value-prop & benefit copy, pillar text | section/block **settings** (rich-text / text blocks) |
| Bundle add-ons | product-reference metafield or upsell app; each add-on's price/title from its own product |
| Specs | `product.metafields.specs.*` or block settings |
| Reviews | review app block / app embed |
| Announce text, free-ship threshold, trust badges, shipping/guarantee copy | section/block settings |
| Footer policy links | Shopify policy pages (`shop.privacy_policy`, `shop.refund_policy`, `shop.terms_of_service`) + a Cookie page |
| Brand colors / fonts | theme `settings` → `css-variables.liquid` (`--ct-*`) |
| Money formatting | the `money` filter (USD, `en-US`) — never hardcode `$` |

## Compliance (must hold)
- Hero primary image clean/text-free on neutral bg; sale flag is an overlay.
- Page must match the ad creative (same product + offer); privacy policy reachable in the footer
  (Meta requirement). No disruptive pop-ups.
- Add-ons opt-in; price/availability match the product feed; honest urgency/social-proof claims.
- Benefit-focused copy; no personal-attribute targeting; no before/after or health claims.

## Acceptance checklist
- [ ] No "CuddlesMeow" anywhere; brand CozyClaw; product "CozyClaw Lounge Mat"; prices in USD.
- [ ] All colors from `--ct-*` (except logo + urgency-red + rating-gold). Light-mode only.
- [ ] Hero primary image clean; sale flag is an overlay; thumbnails swap the hero image.
- [ ] Add-ons opt-in; price + availability match the feed.
- [ ] Footer has Privacy/Terms/Refund/Cookie; contact email; secure-checkout signal.
- [ ] Reviews keep one honest 4-star.
- [ ] `prefers-reduced-motion` pauses motion; focus rings visible; 48px tap targets; no pop-ups.
- [ ] Prices render via the `money` filter in the live theme (no hardcoded `$`).
