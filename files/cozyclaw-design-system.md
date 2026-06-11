# CozyClaw — Design System Reference (v2 · Purple)

Single source of truth for the CozyClaw storefront: brand, design tokens, components,
page templates, interaction patterns, and the ad/listing compliance rules the design must
satisfy. Built on the Dawn × Minimals theme, **light-mode locked**, with a purple brand.

This version supersedes the earlier terracotta/green profile. The token names (`--ct-*`) are
unchanged — only the values moved to purple — so the whole storefront reskins by editing one
token block.

---

## 1. Brand

- **Name:** CozyClaw (standalone brand — the former "CuddlesMeow" house name is retired and must
  not appear anywhere: header, footer, copyright, support email, or image alt text).
- **Flagship product:** CozyClaw Lounge Mat — a plush 2-in-1 sofa cover & cat bed.
- **Logo:** a sleeping cat face on a rounded purple tile, paired with a Fraunces wordmark.
  Files: `cozyclaw-logo.svg` (horizontal lockup), `cozyclaw-logo-icon.svg` (square app
  icon/favicon), `cozyclaw-logo-reversed.svg` (light-on-purple for dark/photo backgrounds).
  Logo colors are hardcoded brand values (do not theme them): tile `#6D3FC4`, cat `#F6F1FC`,
  wordmark `#532C9C`, descriptor `#7A6E9E`.
- **Wordmark treatment in UI:** `Cozy` in text color + `Claw` in accent (`.brand .paw`).
- **Voice:** warm, benefit-led, honest. Speak about the cat and the sofa, never about the
  shopper's personal traits ("Protect your sofa…", not "Are you struggling with…").
- **Tagline options:** "The spot they'll never leave." / "Plush comfort. Quiet sofa protection."

---

## 2. Foundations (design tokens)

All values live in one place. On the live Dawn theme this is `snippets/css-variables.liquid`;
in the prototype HTML it is the `:root` block. Reskinning = editing this block only.

### 2.1 Color — purple

```
/* Backgrounds (cool off-white) */
--ct-bg:#FAF8FD; --ct-bg-surface:#FCFAFE; --ct-bg-raised:#FFFFFF;
--ct-bg-control:rgba(120,100,160,.08); --ct-bg-control-h:rgba(120,100,160,.16);
/* Text (cool plum-gray) */
--ct-text:#2A2433; --ct-text-2:#645A75; --ct-text-3:#938AA6; --ct-text-off:#BCB2CC;
/* Borders (purple-tinted) */
--ct-border:rgba(120,100,160,.30); --ct-border-strong:rgba(120,100,160,.20);
--ct-border-subtle:rgba(120,100,160,.14); --ct-border-faint:rgba(120,100,160,.07);
/* Shadows (cool cast) */
--ct-shadow-xs:0 1px 2px rgba(80,60,120,.12);
--ct-shadow-sm:0 4px 10px rgba(80,60,120,.12);
--ct-shadow-md:0 8px 20px rgba(80,60,120,.14);
--ct-shadow-lg:0 16px 36px rgba(80,60,120,.16);
--ct-shadow-2xl:0 26px 56px rgba(80,60,120,.20);
/* Accent — purple */
--ct-accent:#6D3FC4; --ct-accent-strong:#552C9E; --ct-accent-text:#532C9C;
--ct-accent-subtle:#EFE7FB; --ct-accent-border:#C9B2EE; --ct-accent-glow:rgba(109,63,196,.24);
/* Status */
--ct-urgency:#D9433A;   /* sale / scarcity red — kept distinct from brand purple */
--ct-success:#5B9A6B;   /* in-stock, guarantees */
--ct-price:#2A2433; --ct-price-was:#9E94AE; --ct-rating:#E8A93C;  /* gold stars */
/* Selected-card tint (bundle tiers, add-ons) */
selected: rgba(109,63,196,.05)
```

Rules: text on the purple accent is always `#fff`; text on `--ct-accent-subtle` chips uses
`--ct-accent-text`. Urgency red and rating gold are intentionally *not* purple — they're
conventional commerce signals that need to stand apart from the brand color.

### 2.2 Typography

- **Display:** `Fraunces` (`--ct-display`) — headings, wordmark, prices.
- **Body / UI:** `Public Sans` (`--ct-font`).
- **Mono:** `DM Mono` (`--ct-mono`) — incidental.
- Patterns: `.h2` clamp(27–42px)/600; `.eyebrow` 12px/700 uppercase, letter-spacing .16em,
  accent-text color; section intros centered in `.sec-head`.

### 2.3 Radius / layout / motion

```
--ct-r-sm:6px; --ct-r-md:12px; --ct-r-lg:18px; --ct-r-xl:24px; --ct-r-pill:9999px;
--ct-mw:1120px; --ct-gutter:24px; --ct-touch:48px;          /* 48px min tap target */
--ct-dur-fast:120ms; --ct-dur-base:240ms;
--ct-ease-out:cubic-bezier(.22,1,.36,1);
--ct-focus:0 0 0 2px #FAF8FD, 0 0 0 4px #532C9C;             /* visible focus ring */
```

Honor `prefers-reduced-motion`: zero out durations and pause the marquee.

### 2.4 Currency & number format

Primary market is **Shopify US** → currency **USD**, locale `en-US`. Never hardcode a currency
symbol in the live theme: format every price through Shopify's `money` filter
(e.g. `{{ price | money }}`), which respects the store's currency and format settings. The static
prototypes use `$x.xx` as placeholders only.

Price pattern is always: current price (`--ct-accent-text` or `--ct-price`), struck-through
"was"/compare-at (`--ct-price-was`), and a `SAVE x%` chip.

Reference prices (illustrative — real values come from Shopify product/variant data): single
$35.97 (was $44.97, save 20%); Double Comfort bundle $57.97 (was $89.94, save 36%); add-ons
ChompClean $13.99 (was $26.97) and Hair Glove $7.99 (was $13.97).

---

## 3. Component library

Each component is built from tokens only. Key classes and notes:

- **Buttons** — `.btn` base (pill, 48px min). Variants: `.btn-primary` (accent, glow),
  `.btn-dark` (accent-strong), `.btn-outlined` (white/border), modifiers `.btn-lg`, `.btn-full`.
- **Announce bar** `.announce` — accent background, single line, currency-neutral message.
- **Header** `.header` (sticky, blurred), `.brand` wordmark (Cozy + accent Claw), `.nav`,
  `.header-cart` icon.
- **Breadcrumb** `.crumb` — Home / category / current.
- **Gallery** `.gallery-main` + `.gallery-thumbs`/`.gthumb`. The **primary image is clean,
  text-free, on `#FCFBFE`** (feed-safe). Lifestyle shots are additional thumbs. The sale flag
  `.gallery-badge` is an overlay — never part of the image file.
- **Buy box**
  - `.bb-ratingrow`, `.bb-title` (Fraunces, accent), `.bb-pricerow` (`.bb-now`/`.bb-was`/`.bb-save`).
  - `.salesbar` — full-width social-proof bar (accent-subtle), e.g. "🔥 2,175 sales".
  - `.bb-avail` — green dot + "In stock — ships in 3–7 business days".
- **Bundle tier selector** `.tier` (selectable card; `.is-active` = accent border + faint tint).
  Contains `.tier-name` + `.tier-tag` (save chip), `.tier-save`, `.tier-price`
  (`.tp-now`/`.tp-was`), optional `.tier-best` flag, and `.tier-options` (per-mat color
  `select`s) revealed only when active. **No visible radio control** — selection is the card
  highlight. Native input hidden.
- **Add-on cards** `.addon` (selectable; `.is-active` = accent border + tint). `.addon-thumb`,
  `.addon-name`, `.addon-save` (urgency red), `.addon-price`, `.addon-badge` (corner pill).
  **Opt-in: unchecked by default.** No visible checkbox — card highlight only.
- **Total + CTA** `.bb-total` (live total, Fraunces), primary full-width "Add to cart",
  `.bb-secure` line, `.bb-trust3` (three round icon badges: shipping / payments / support).
- **Trust strip** `.trust-strip`/`.trust-item` — accent-subtle band of reassurances.
- **Marquee** `.marquee`/`.marquee-track` — "Loved by thousands of kitties" scroll; pauses on
  reduced-motion.
- **Benefit pillars** `.pillars`/`.pillar` — 2×2 cards (icon tile + Fraunces heading + copy).
- **Spec table** `.spec-card`/`.spec-row` (k/v).
- **Shipping cards** `.ship-grid`/`.ship-card`; **guarantee** `.guarantee` (accent-subtle panel).
- **Reviews** `.rev-head` (score) + `.rev-grid`/`.rev-card` (stars, quote, `.rev-av` avatar,
  verified badge). Keep an honest mix (one 4-star).
- **Final CTA** `.finalcta` — price + availability + CTA + reassurance note.
- **Footer** `.footer` 4 columns incl. **Legal** (Privacy, Terms, Refund & Return, Cookie),
  contact email `support@cozyclaw.com`, payment methods.
- **Sticky ATC** `.sticky-atc` — appears after the buy box scrolls off; mirrors the live total.

---

## 4. Page templates

- **Landing page** (`cozyclaw-landing.html`, ad traffic): announce → header → hero (clean image
  + buy CTA) → trust strip → value prop → why-choose pillars → bundle & save → specs → reviews →
  shipping + guarantee → final CTA → footer → sticky ATC.
- **Product page / PDP** (`cozyclaw-pdp.html`): announce → header → breadcrumb → product
  (gallery + the tiered **bundle buy box** with add-ons + live total) → trust strip → marquee →
  why-choose pillars → details + specs → shipping + guarantee → trust strip → reviews →
  final CTA → footer → sticky ATC.
- **Logo placement:** lockup in header/emails/invoices; icon for favicon/avatar; reversed on
  dark or photographic backgrounds.

---

## 5. Interaction patterns

- **Reveal on scroll** — `.reveal` + IntersectionObserver adds `.is-visible`.
- **Gallery swap** — thumb click sets the main image and toggles the lifestyle background.
- **Bundle select** — clicking a `.tier` card sets it active, reveals its color options, and
  recalculates the total.
- **Add-on toggle** — clicking an `.addon` card toggles active + recalculates the total
  (starts unchecked).
- **Live total** — `tier price + Σ checked add-ons`, formatted as USD (via the money filter in the theme), mirrored in the sticky bar.
- **Sticky ATC** — shown once the buy box's bottom passes the viewport top.

---

## 6. Compliance baked into the system (Google Merchant Center + Meta)

These are design-controlled requirements; keep them true as the store evolves.

- **Clean feed image.** The primary product image must be text-free on a white/neutral
  background, product filling ~75–90% of the frame, 800×800px+. All promo (sale %, "sales"
  count, badges) lives as on-page overlays — never burned into the image file.
- **Honest, opt-in pricing.** Add-ons are unchecked by default; bundle tiers are clearly priced
  radio choices. Page price/availability must match the Merchant feed; no coupon codes in titles.
- **Required on-site.** Visible contact (`support@cozyclaw.com`), returns/refund policy, secure
  checkout signal, and footer links to Privacy, Terms, Refund & Return, and Cookie policies
  (Meta requires a privacy policy on the landing page).
- **Copy.** Benefit-focused; no personal-attribute targeting; no before/after or health claims;
  no disruptive pop-ups. Urgency/scarcity claims ("limited-time", "2,175 sales") must be
  genuinely true when ads run — Meta checks the landing page against the ad.
- **Brand assets.** No third-party logos/trademarks (applying a color is fine; reproducing a
  brand's logo is not).

Launch-time items the design can't set: HTTPS + a working cart, real policy pages behind the
footer links, a real `support@cozyclaw.com` inbox, and genuinely clean photos uploaded to the feed.

---

## 7. Implementation on Dawn (theme mapping)

- **Three layers:** (1) Dawn's commerce engine — never edited; (2) the `--ct-*` token block in
  `css-variables.liquid` — the only per-brand file; (3) the `ct-*` section components above.
- **Reskin** = edit the token block. Because every component references tokens (no hardcoded
  brand hex except the logo files and the intentionally-fixed urgency/rating colors), one edit
  repaints the whole store.
- **Never touch** Dawn cart, checkout, customer, or search logic.

---

## 8. Reskin & audit checklist

- [ ] Token block updated; no stray hardcoded brand hex in components.
- [ ] No "CuddlesMeow" anywhere (text, email, alt, copyright).
- [ ] Primary product image clean/text-free; badges are overlays.
- [ ] Price + availability match the feed; USD formatting consistent (money filter, en-US).
- [ ] Add-ons default unchecked; bundle total recalculates correctly.
- [ ] Footer legal links present and pointing to real pages.
- [ ] Contact email live; secure-checkout signal present.
- [ ] `prefers-reduced-motion` honored; focus ring visible; 48px tap targets.
- [ ] Light-mode locked (no dark backgrounds).

---

## 9. Asset index

- `cozyclaw-landing.html` — marketing/ad landing page.
- `cozyclaw-pdp.html` — product detail page (tiered bundle buy box).
- `cozyclaw-logo.svg` — primary lockup.
- `cozyclaw-logo-icon.svg` — app icon / favicon.
- `cozyclaw-logo-reversed.svg` — dark/photo backgrounds.
- `cozyclaw-design-system.md` — this document.
