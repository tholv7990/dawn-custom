# Dawn × Minimals — Campaign Landing Page Design

**Date:** 2026-05-25
**Status:** Approved (build inline)
**Source artifact:** `dawn-sample-landing.html` (1008-line standalone "GainsSteel®" campaign landing page, same Minimals tokens as `dawn-design-system.html`).
**Builds on:** P2 homepage `ct-*` sections (`feat/minimals-foundation`, HEAD `b4c8706`).

## Goal

Stand up a real Shopify **page** that reproduces the GainsSteel® campaign landing as closely as our **existing** `ct-*` sections allow — **without building new content section types this pass** (user decision). Compose a page template from the homepage sections, seed it with the GainsSteel copy, add the one approved landing-specific extra (a sticky add-to-cart bar), and **document the component gaps** as a backlog for a later enhancement pass.

## Decisions (locked)

- **Reuse, don't rebuild.** Compose from existing homepage `ct-*` sections. Do **not** build new content sections (pricing, pillars, journey, final-CTA) now — note them as gaps.
- **Theme chrome.** The page renders inside `theme.liquid`, so it uses the global Dawn header + `ct-announce` + Dawn footer. The sample's custom sticky-glass header / dark footer are **not** replicated.
- **One landing-specific extra:** a sticky bottom add-to-cart bar → new small section `ct-sticky-atc` (the only new section this pass).
- **Pricing CTAs (future section):** editable link URLs, not add-to-cart-by-variant.
- **Commerce stays frozen** — no Dawn JS or commerce snippet touched. `ct-sticky-atc` carries its own self-contained inline script (matching the `ct-announce` pattern); no new global JS.
- **Theme-check invariant:** must stay at **14 offenses** (2 errors, 12 warnings — all pre-existing Dawn).

## Deliverables

1. `templates/page.landing.json` — composes existing `ct-*` sections + `ct-sticky-atc`, seeded with GainsSteel content. Merchant assigns it to a Shopify Page (template suffix "landing").
2. `sections/ct-sticky-atc.liquid` + `assets/section-ct-sticky-atc.css` — the new sticky add-to-cart bar.
3. This doc (design + component-gap backlog).

## Section mapping (sample → existing `ct-*`)

| Order | Sample section | Maps to | Content seeded | Known gap |
|---|---|---|---|---|
| 1 | Hero "Your gym closed / Ours didn't" | `ct-hero` | richtext heading (both lines, `<em>` accent), 4 pills, rating, 2 buttons | no h1-subtitle style, no floating weight badge |
| 2 | Stats strip | `ct-stats` | 12 (countup) / 440 lb (countup) / 5.3 lb / 5 | no per-stat sub-line |
| 3 | "Who it's for" (3 personas) | `ct-use-cases` | 🔄 / ✈️ / 🚀 cards | no per-card CTA line |
| 4 | Product features (3 A+ banners) | `ct-aplus` | 🔧 / 🎛️ / 🧳, single tag → one spec pill | tag rendered as a spec chip |
| 5 | "Train where life happens" (3) | `ct-use-cases` | ☀️ / 🏠 / 🌍, time → tag | "No. 0x" numbering lost |
| 6 | Compare table | `ct-compare` | brand + 2 competitor cols, 5 rows | strong fit |
| 7 | Reviews (3) | `ct-reviews` | kicker = "4.7 ★ · 52 verified reviews" | no big-number rating header |
| 8 | Email capture (15% off) | `ct-email` | real `{% form 'customer' %}` | strong fit |
| 9 | FAQ (5) | `ct-faq` | 5 Q&A | strong fit |
| 10 | Sticky add-to-cart bar | **`ct-sticky-atc` (NEW)** | name, rating, price, button label + URL | — |

## `ct-sticky-atc` spec

- **Markup:** fixed bottom bar; left = emoji + product name + rating text; right = primary `.ct-btn` linking to an editable URL.
- **Behavior:** hidden (`translateY(100%)`) initially; slides up once the hero scrolls out of view. Self-contained inline script: if a `.ct-hero` element exists, use `IntersectionObserver` (show when hero is **not** intersecting); else fall back to `scrollY > 500`. Honors `prefers-reduced-motion` (transition still toggles transform; no looping animation). No global JS added.
- **Settings:** `emoji`, `product_name`, `rating_text`, `price`, `button_label`, `button_link` (url), `color_scheme`. `enabled_on` page templates.
- **CSS:** `assets/section-ct-sticky-atc.css`, `--ct-*` tokens, `.ct-btn` from `ct-sections.css`, high `z-index`, mobile-safe (truncate long product name).

## Component gap backlog (the "note it for later")

These landing components have **no existing `ct-*` section** and were deferred this pass. Build as proper schema-driven sections in a later component-enhancement phase:

1. **`ct-pricing` (3-plan pricing) — ⚠ highest priority / conversion centerpiece.** Cards with: featured-plan highlight + badge, tag, name, tagline, price + price-diff, feature list (with dimmed/struck rows), full-width CTA (editable URL per locked decision), optional plan note; plus a "vs gym $50/mo" compare strip and a trailing trust-chip row.
2. **`ct-pillars` (N-column system grid).** Card: number, icon, name, description, italic quote. Sample uses 5 across (responsive 5→2→1).
3. **`ct-journey` (horizontal step timeline).** Connected dots on a line; per step: dot, week-range, title, description, badge. Sample uses 4 steps (responsive collapses the connector).
4. **`ct-final-cta` (centered gradient CTA banner).** Eyebrow, large multi-line heading, sub, 1–2 buttons, trailing trust-chip row, brand-gradient background.

**Variant gaps in existing sections** (enhancement candidates so reuse becomes faithful, not approximate):
- `ct-hero`: optional h1-subtitle line; optional floating stat/badge over the visual.
- `ct-stats`: optional per-stat sub-line under the label.
- `ct-use-cases`: optional per-card CTA line; optional numbering label.
- `ct-reviews`: optional big-number aggregate-rating header row.
- `ct-aplus`: first-class single "tag" pill (distinct from the comma-split specs list).
- Reusable **trust-chip row** and **`ct-eyebrow`/section-head** primitives already exist in `ct-sections.css`; `ct-final-cta`/`ct-pricing` should reuse them.

## Verification

- `shopify theme check` clean (stays at 14 offenses; investigate any increase).
- Page renders inside theme chrome; all reused sections behave as on the homepage (reveal/count-up/accordion/swipe).
- `ct-sticky-atc` hidden over the hero, slides up after scrolling past it, button links correctly, no console errors, no layout shift, mobile-safe.
- Live `shopify theme dev` visual verify deferred to the user (interactive login + dev-store password `pwsirj-4x`), consistent with P2.
