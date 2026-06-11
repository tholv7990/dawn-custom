# CozyClaw — Homepage Spec & Theme Implementation Guide

_Single source of truth for the current homepage build (`cozyclaw-homepage.html`)._
_Supersedes the old `cozyclaw-design-system.md` (which was purple and described the wrong product)._

---

## 1. What this page is

A single-product marketing homepage for **CozyClaw™**, a Shopify store selling the **Cozy Plush Pet Sofa** (a plush coral-fleece sofa-style bed for dogs & cats) plus two optional add-ons. Target market: **US / USD**. Mobile-first, desktop-friendly.

Deliverable file: `cozyclaw-homepage.html` (self-contained: inline CSS + a small vanilla-JS block, no build step).

---

## 2. Hard rules (do not break these)

- **Light mode is locked.** No dark page backgrounds. Cream surfaces only; a dark header/footer band is allowed but the page never goes "dark mode" (meta `color-scheme: light`, `:root { color-scheme: only light }`, and a `prefers-color-scheme: dark` override that re-asserts the light tokens).
- **No fabricated discounts.** Every variant's Compare-At = Price, so there is **no real discount** on the single product. Never show "Save X%" or a struck-through price on the sofa.
- **Bundle is honest.** Double Comfort = exactly 2× Single (no price cut); its only real perk is **free shipping**. Frame it as "best value · ships free," never as a percentage saving.
- **Honest social proof.** Real numbers only: **4.9/5 from 13 reviews (92% 5-star)**. No "thousands/11,000+/15,000+."
- **Supplier-free & accurate.** No supplier names, no baked-in marketing-text images, no fabricated specs (no removable-cover claim, no invented lb weight limits).
- **No third-party logos.** Payment badges are styled approximations; Shopify renders the real ones live.

---

## 3. Real product data (from `products_export__4_.csv` — authoritative)

### Cozy Plush Pet Sofa (main)
- **Material:** plush coral fleece · **Base:** non-slip backing · **Care:** machine washable (one piece — *no* removable/zip cover) · **Best for:** dogs & cats · **Style:** warm sofa-style bed
- **Colors:** Coffee, Black, Grey
- **Sizes:** 60×80 cm (≈24″×31″) and 80×90 cm (≈31″×35″)
- **Price:** $22.82–$30.15 — **⚠ Price currently = Cost per item (zero margin). Set retail prices before launch.**
- **Per-color images (CSV "Variant Image"):**
  - Coffee → `S4266af0b5e144b3abc9d082ad02705f0R.webp`
  - Black → `S0d4e7241dbca4bf1a06b87479b1166dfS.webp`
  - Grey → `S2a381fdd19594af290b618eb14be07a5I.webp`
  - (9 images total; base path `https://cdn.shopify.com/s/files/1/0998/3669/0711/files/`)

### Add-ons
- **ChompClean Toy** — squeaky chew; options Orange / Long-legged / Waffle / Chicken Legs; $5.16–$6.62; image `S30639965412442918c19b3fc56c38e9bt.webp`
- **Pet Deshedding Glove Brush** — double-sided fur remover; Black; packs 1/2/3/4/5 pcs; $2.27–$4.66; image `S1a69ae9ec8fc458fbf09f52c6f8db422R.webp`

---

## 4. Design tokens (current — dark coffee on warm cream)

Whole-store recolor = edit the single `:root` block.

| Token | Value | Use |
|---|---|---|
| `--ct-bg` / `--ct-bg-surface` / `--ct-bg-raised` | `#FBF6F0` / `#FEFAF5` / `#FFFFFF` | page / alt sections / cards |
| `--ct-accent` / `--ct-accent-strong` / `--ct-accent-text` | `#5A3E2B` / `#43301F` / `#4E3526` | buttons, links, headings accent |
| `--ct-accent-subtle` / `--ct-accent-border` | `#F1E8DE` / `#D9C7B4` | tinted panels / borders |
| `--ct-text` / `-2` / `-3` / `-off` | `#2E241D` / `#6B5A4D` / `#9C8B7C` / `#C7B8A9` | text scale |
| `--ct-urgency` / `--ct-success` / `--ct-rating` | `#B23A2E` / `#5B9A6B` / `#E0A53B` | problem ✗ / free-ship + ✓ / stars |
| radius | `sm 6` `md 12` `lg 18` `xl 24` `pill 9999` | — |
| layout | `--ct-mw 1280px` · `--ct-gutter 24px` · `--ct-touch 48px` | content width / gutter / tap target |
| fonts | Fraunces (display) · Public Sans (body) · DM Mono (small labels) | — |

---

## 5. Section-by-section (current order)

1. **Announce bar** — accent band, 3 items: free shipping $75+, 30-night trial, "A cozy spot for dogs & cats."
2. **Header (sticky, blurred)** — `CozyClaw™` wordmark ("Cozy" + accent "Claw" + small `<sup>` ™) · nav (Shop, Best Sellers, Reviews, About, FAQ) · search / account / cart icons.
3. **Hero** — capped at **1440 px and centered** so text + photo stay together on wide screens. Photo is a right-pinned layer faded into the cream on both edges via CSS `mask` (no hard edge, no gap). Eyebrow + H1 ("Their favorite spot. / *Your cleaner sofa.*") + subcopy + two CTAs + trust line (★ 4.9/5 · 13 reviews · 30-night trial · free shipping $75+). Stacks on mobile (full photo on top). **Still uses a product close-up — swap in a lifestyle photo for best effect.**
4. **Trust strip** — accent-subtle band, 4 icon items (coral fleece / raised edges / keeps sofas hair-free / machine-washable).
5. **Problem / Solution + Before-After slider** — interactive **before/after compare slider** on top (drag / touch / arrow keys; red "Before" + green "After" with captions), then two matched cards: **The problem** (red ✗ list) and **The solution** (accent ✓ list). _Slider images are placeholders until a real before/after pair is supplied._
6. **Why pillars** — "Comfort for them, peace of mind for you" — 6 pillars in a 3-col grid (hover lift).
7. **Features w/ images** — "Beautifully made, down to the seam" — 4 image cards (coral-fleece top / raised bolster edges / non-slip base / machine washable). Images show in full (contain).
8. **Marquee** — looping strip ("Made for happy dogs & cats / Cozier naps / Cleaner sofas / A spot of their own"); pauses under reduced-motion.
9. **Lifestyle** — "Use it anywhere they love to relax" — 4-image row.
10. **Size & color guide** — left: 3 **per-color photo tiles** (Coffee/Grey/Black) + measuring tip; right: 2 size cards — Medium 60×80 cm (24″×31″), Large 80×90 cm (31″×35″).
11. **Comparison table** — CozyClaw Sofa-Bed vs Regular Blanket vs Basic Pet Mat.
12. **Materials & care** — two panels (what it's made of / how to wash).
13. **Reviews** — "4.9 out of 5 · Based on 13 reviews" + 4 cards (includes one honest 4-star).
14. **Guarantee** — accent-subtle panel, 4 items (30-night trial, free shipping $75+, easy returns, secure checkout).
15. **Bundle & save** — **two-tier selector**: Single Cozy Spot (from $22.82) vs **Double Comfort** (from $45.64, highlighted "Most popular · ships free"), each with a photo + included-features checklist; then an **optional add-ons** strip with real photos of ChompClean Toy & Pet Deshedding Glove Brush.
16. **FAQ** — 6-question accordion (size, machine-washable, puppies/kittens, materials, stays put, returns).
17. **Final CTA** — closing pitch (no fabricated counts) + "Shop CozyClaw now."
18. **Footer** — dark-ish brand block (left) + Shop / Help / Legal columns + "Join the cozy club" signup + © 2026 CozyClaw™ + secure-payment badge row. Visible support@cozyclaw.com + business address.
19. **Sticky add-to-cart** — slides up after 620 px scroll: thumbnail, name, ★ 92% 5-star · 13 reviews, "Add to Cart — from $22.82."

---

## 6. Interactions (vanilla JS at end of file)

- **Reveal on scroll** — IntersectionObserver toggles `.reveal → .is-visible`.
- **FAQ accordion** — click toggles `.open`.
- **Sticky ATC** — shows when `scrollY > 620`.
- **Before/after slider** — `pointerdown/move/up` drag + `ArrowLeft/Right` keyboard; updates a `--pos` CSS var driving `clip-path` and the divider/handle.
- **Footer signup** — button swaps to a "Subscribed ✓" confirmation (front-end only; wire to your email tool).

---

## 7. Shopify theme implementation

Each homepage block maps to a **custom section** (Liquid) you add via the theme editor, or an enhancement of an existing Dawn section. Keep all colors as the `--ct-*` CSS variables in `theme.liquid` (or a `base.css`) so one edit reskins everything.

| Homepage block | Theme approach | Data source | Notes |
|---|---|---|---|
| Announce bar | `sections/announcement-bar` (Dawn has one) | section settings | 3 rotating/static messages |
| Header | `sections/header` (enhance Dawn) | menu + logo | add ™ to logo; sticky + blur |
| Hero | **new** `sections/cozy-hero.liquid` | image picker + richtext + 2 button settings | mask/scrim via CSS; image block |
| Trust strip | **new** `sections/icon-row.liquid` | 4 blocks (icon + title + sub) | reusable |
| Problem/Solution + slider | **new** `sections/before-after.liquid` | 2 image pickers + 2 lists (blocks) | slider JS as a section asset |
| Pillars | **new** `sections/feature-grid.liquid` | repeatable blocks | 3-col |
| Features w/ images | **new** `sections/image-feature-cards.liquid` | image + heading + text blocks | |
| Marquee | **new** `sections/marquee.liquid` | text blocks | CSS animation |
| Lifestyle row | reuse `image-feature-cards` or a gallery | image blocks | |
| Size & color guide | **new** `sections/size-color-guide.liquid` | **product variant images** for colors + size blocks | pull color images from variant media |
| Comparison table | **new** `sections/comparison.liquid` | table blocks | |
| Materials & care | reuse a 2-col rich-text section | settings | |
| Reviews | review app (e.g. Judge.me/Loox) **or** static blocks | app / metafields | keep the honest 4.9 · 13 figure synced to the app |
| Guarantee | reuse `icon-row` | blocks | |
| Bundle & save | **new** `sections/bundle-tiers.liquid` **or** a bundle app | product + variant data | Single vs Double; add-ons as line-item upsell |
| FAQ | **new** `sections/faq.liquid` (accordion) | blocks | |
| Final CTA | rich-text + button section | settings | |
| Footer | `sections/footer` (enhance Dawn) | menus + settings | Legal links, support email, address, payment icons |
| Sticky ATC | **new** snippet `snippets/sticky-atc.liquid` | product | JS shows on scroll; real price/variant |

**Mapping colors to the guide:** the size & color guide should read the product's **variant featured images** (Coffee/Black/Grey) rather than hard-coded URLs, so it stays correct if images change.

---

## 8. Before launch — open items

1. **Set retail prices.** Variant Price currently = Cost (zero margin) on all products. Decide markup, update Shopify, then update the figures here and on the page.
2. **Set the store market to US / USD.** Live store currently shows VND and a cluttered full payment-icon row because the market isn't US.
3. **Real before/after photos** for the slider (fur-covered couch → same couch with CozyClaw + happy pet). Keep it honest ("where the fur goes," not "furniture never wears").
4. **Resolve the offer:** homepage says 30-night trial / free shipping $75+; live store shows 7-day / $50. Pick one and make consistent (announce bar, hero, guarantee, FAQ, sticky ATC, footer).
5. **Real Legal pages** — footer links are `#` placeholders (Privacy, Terms, Refund/Return, Cookie).
6. **Lifestyle hero image** — replace the product close-up with a styled room/pet photo.
7. **Logo SVGs** (`cozyclaw-logo*.svg`) are still terracotta — recolor to dark coffee `#5A3E2B` to match.
8. **Review-app figure** — keep the 4.9 / 13 number in sync with your actual review app; don't let a template inflate it.

---

## 9. Asset index (CDN base: `https://cdn.shopify.com/s/files/1/0998/3669/0711/files/`)

- **Sofa (9):** `Sc68ba…p` (hero/main) · `S406fffa…y` · `S5fddab…H` · `Sb75526…F` · `S6bf961…O` · `Sbf704…S` · `S4266af…R` (**Coffee**) · `S0d4e72…S` (**Black**) · `S2a381…I` (**Grey**)
- **ChompClean Toy:** `S30639…t` (+10 more)
- **Pet Deshedding Glove Brush:** `S1a69ae…R` (+6 more)

---

_Other docs in this folder: `cozyclaw-pdp-spec.md` and `cozyclaw-landing-spec.md` still describe the older purple PDP/landing and should be refreshed to dark-coffee + this product data next._
