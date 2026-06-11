# CLAUDE.md — CozyClaw storefront build

Project context for an AI coding agent. Read this first, then the design system, then the page spec you're working on.

## What this is
A single-product Shopify storefront for **CozyClaw** (flagship: **CozyClaw Lounge Mat**, a plush
2-in-1 cat sofa cover & bed). Two key pages: a marketing **landing page** (ad traffic) and a
**product detail page (PDP)**. Built on the Dawn × Minimals theme, **light-mode only**, purple brand.

## File map
- `cozyclaw-design-system.md` — **tokens + component library + compliance**. The source of truth for
  colors, type, spacing, and every reusable component. Do not invent new tokens; use `--ct-*`.
- `cozyclaw-landing-spec.md` — build spec for the landing page.
- `cozyclaw-pdp-spec.md` — build spec for the PDP.
- `cozyclaw-landing.html` — **reference implementation** of the landing page (working HTML/CSS/JS).
- `cozyclaw-pdp.html` — **reference implementation** of the PDP (working HTML/CSS/JS).
- `cozyclaw-logo.svg`, `cozyclaw-logo-icon.svg`, `cozyclaw-logo-reversed.svg` — logo assets.

When the spec and the reference HTML disagree, the **spec wins**; the HTML is a starting point.

## Hard rules (apply to every page)
1. **Light-mode locked.** No dark backgrounds, no dark-mode toggle. `color-scheme: only light`.
2. **Tokens only.** All color/spacing/radius/shadow come from the `--ct-*` block. The only allowed
   hardcoded colors are the logo files and the intentionally-fixed urgency-red (`#D9433A`) and
   rating-gold (`#E8A93C`).
3. **Brand:** the word "CuddlesMeow" must not appear anywhere (text, alt, email, copyright). Brand
   is **CozyClaw**; product is **CozyClaw Lounge Mat**.
4. **Currency:** USD (market = **Shopify US**, locale `en-US`). In the live theme, format prices
   with Shopify's `money` filter — never hardcode `$`. Prototype HTML uses `$x.xx` placeholders.
5. **No frameworks, no build step, no browser storage.** Vanilla HTML/CSS/JS. Honor
   `prefers-reduced-motion`; visible focus rings; 48px min tap targets.
6. **Compliance is non-negotiable** — see §6 of the design system and the per-page compliance block.
   Primary product image stays clean/text-free; promo lives in overlays; add-ons are opt-in;
   price/availability match the feed; footer carries privacy/terms/refund/cookie links.
7. **Content is Shopify-driven.** Bind every dynamic value (title, price, compare-at, variants,
   images, availability, rating, reviews, shipping copy, announcement text, brand colors) to
   Shopify — Liquid objects, section/block settings, metafields, and the review app. See each
   page spec's "Shopify data sources" table. The numbers and copy in the prototype HTML are
   placeholders to be replaced by live Shopify data. Implementation target is the Dawn theme.

## Build order
1. Read `cozyclaw-design-system.md`.
2. Implement shared chrome (announce, header, footer, sticky bar) once.
3. Build the page from its spec section by section, top to bottom.
4. Run the spec's acceptance checklist before finishing.
