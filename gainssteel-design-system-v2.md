# GainsSteel™ Store Design System

**Codename:** Bold Athletic v2 · "Forge"
**Scope:** gainssteel-homepage.html · gainssteel-pdp.html · gainssteel-cart.html
**Source of truth for CSS:** one shared stylesheet (`gs2.css`) — all pages are assembled from it so they cannot drift.
**Supersedes:** the v1 HTML styleguide (`gainssteel-design-system.html`).

GainsSteel is a compact hydraulic strength **system**, not a commodity arm trainer. The design's job is retail conversion: manufacture desire (athletic energy), earn trust (proof everywhere), and keep momentum toward checkout (one loud action per screen). It is deliberately *not* a SaaS aesthetic — hierarchy is aggressive, spacing is rhythmic, and proof repeats at every decision point.

---

## 1. Research basis (what shaped v2)

The system encodes 2026 ecommerce findings: bento modular layouts as the defining grid pattern; oversized/kinetic typography as primary brand identity; micro-interactions (scroll reveals, hover lifts) for premium feel; tactile-brutalist accents used sparingly; trust badges, reviews and payment icons placed at decision points; mobile-first thumb mechanics (sticky add-to-cart, ≥44px targets); and visual consistency from PDP through checkout as a trust requirement.

Fitness color psychology: **orange = energy, movement, momentum** (Orangetheory's signature); **black/ink = power, authority, premium strength**; white/grey neutrals = clean modern backdrop. Orange + black together reads "fast, alert, active" — the exact GainsSteel pairing. Balance follows the industry **60 / 30 / 10 rule**: 60% light neutral surfaces, 30% ink/steel structure, 10% orange action.

---

## 2. Color tokens & roles

Color is assigned **by job, not taste**. Orange means "act" and nothing else; reserved colors keep their signal only if never used decoratively.

| Token | Hex | Role | Rules |
|---|---|---|---|
| `--orange` | `#ff6b1a` | **Primary action** | Buttons, price, key accents, selected states. Never structural. |
| `--orange-deep` | `#e35708` | Hover / pressed | Primary button hover only. |
| `--orange-tint` | `#fff1e6` | Soft action fill | Behind selected/featured content (bundle `.on`, upgrade nudge). |
| `--ink` | `#101216` | Power / structure | Display type, dark energy bands, ink tiles, sticky-bar accent border. |
| `--ink-soft` | `#444a55` | Secondary text | Body copy, leads. |
| `--steel` | `#5b6573` | Structure / meta | Captions, fine print, dividers, struck "was" prices. |
| `--steel-light` | `#eceef0` | Neutral fill | Table heads, neutral icon chips, UGC tiles. |
| `--bg` | `#f6f5f2` | Page | Light-locked page background. |
| `--card` | `#ffffff` | Surfaces | Cards, tiles, panels, summary. |
| `--line` | `#e4e2dc` | Hairlines | 1.5px borders standard; 2px for emphasis. |
| `--green` | `#1e7a4f` | **Trust only** | Guarantees, FREE shipping, "You're saving", verified badges. |
| `--green-tint` | `#e9f4ee` | Trust fill | Trust badge background. |
| `--gold` | `#eda21a` | **Ratings only** | Stars. Never decorative. |
| `--red` | `#d23a2c` | **Urgency only** | %-off badges, savings, problem bullets, remove-hover. |
| `--red-tint` | `#fbeceb` | Urgency fill | Behind `.off` badges and friction ✕ chips. |

Dark surfaces (`.energy`, `.proof-strip`, marquee, ink tiles) are **intentional fixed-hex accents** — at most one energy band per page — and are unrelated to OS dark mode (the page is light-locked, §8).

---

## 3. Typography

| Role | Family | Weights | Treatment |
|---|---|---|---|
| Display | **Saira Condensed** | 600–900 | UPPERCASE, line-height ~0.96, tracking −0.01em. Hero, headings, price, buttons, bundle names, day/phase labels. |
| Body | **Inter** | 400–700 | Sentence case, 16px minimum, left-aligned. Everything that gets *read*: specs, reviews, FAQ answers, fine print. |

Scale (aggressive on purpose — the eye must jump headline → price → CTA):

| Step | Size | Use |
|---|---|---|
| Mega / price | `clamp` up to ~3rem (PDP price 3rem; summary total 2.5rem) | **One mega hit per screen.** |
| H1 hero | `clamp(2.9rem, 8.4vw, 4.9rem)` w900 | Kinetic stack: outline lines + one orange payoff line. |
| H2 section | `clamp(2rem, 4.6vw, 3rem)` | Section heads; one `.hl` orange phrase max. |
| H3 / H4 | 1.5rem / 1.18rem | Card and block titles. |
| Lead | 1.1rem Inter | Section intros, max-width 640px. |
| Body | 1rem Inter | Default. |
| Eyebrow | .78rem display, tracking .2em, orange + 26px orange dash | Section kickers. |
| Fine | .82rem steel | Legal, captions, meta. |

Kinetic devices: `.ol` outline text (`-webkit-text-stroke: 2.5px var(--ink)` with solid-ink `@supports` fallback), `.hl` orange highlight, `.num` outline numerals (01–05) for the system pillars only (real sequence → numbering is earned).

**Rules:** never set paragraphs in the condensed face; tile/stat labels (`.big`, `.sm`) are `display:block` so number and caption stack (inline spans collide — learned the hard way); CTA labels must survive narrow phones (buttons wrap under 680px; JS-generated labels use short bundle names).

---

## 4. Spacing, layout & breakpoints

Spacing is **rhythm, not flat padding** — tight density makes proof feel credible; loud whitespace marks decisions.

| Token | Value | Applies to |
|---|---|---|
| `--pad-tight` | 3rem (2.6rem ≤860px) | Proof, specs, comparison, reviews, FAQ, box contents. |
| `--pad-loud` | 5.5rem (3.8rem ≤860px) | Hero, offer, final CTA, buy-box bottom. |
| Container | `.wrap` max-width 1140px, 20px gutters | All sections. |
| Radii | 14px standard, 20px feature cards, 999px chips, 11px buttons | |
| Shadows | soft `0 14px 40px rgba(16,18,22,.08)`; **hard lift** `7px 7px 0 var(--ink)` + 2px ink border | Lift = tactile-brutalist accent: hero CTA, popular plan, selected bundle (4px), order summary. Use sparingly. |
| Focus ring | `0 0 0 3px rgba(255,107,26,.35)` | All interactive elements. |

Breakpoints: **1000** (5→2 grids, proof strip 5→3), **860** (everything stacks; journey goes vertical; popular plan reorders first; gallery unsticks), **680** (buttons wrap, energy band tightens), **560** (single-column small grids, sticky bar compresses).

**Hero bento spec (desktop):** 2 columns, rows `minmax(106px, auto)`; trainer tile = column 1 × 3 rows; three stat tiles stack column 2; tile 5 (program) and tile 6 (video) each span the full row. Mobile: trainer spans both columns, stats 2-up, rows `minmax(92px, auto)`. Tile content is flex-column, vertically centered; rows grow rather than clip.

---

## 5. Component inventory

| Component | Spec highlights |
|---|---|
| **Buttons** | Display 800 uppercase, ≥48px tall (44px tap rule). `btn-primary` solid orange (hover deep + lift-shadow), `btn-ghost` 2px ink outline, sizes lg/sm. Never two orange CTAs side-by-side. Label text matches its toast ("Add to Cart" → "…added"). |
| **Marquee ticker** | Two variants: ink trust strip, orange spec ticker. Two identical halves; CSS `translateX(-50%)` loop. JS **fill** doubles content until one half ≥ viewport (no desktop gaps); duration normalized to ~45px/s; **watchdog** samples computed transform at ~250/350ms and falls back to a rAF driver if CSS animation is suppressed. ⚠ Merchant decision on file: marquee currently overrides reduced-motion. |
| **Rating chip** | Pill: gold stars + bold score + count. Seed **next to every primary CTA**. Figures bind to live Judge.me data — never hardcode at launch. |
| **Trust badges** | Green-tint pills: Free US shipping / 90-day returns / 1-year warranty. Hero, PDP panel, cart summary. |
| **Payment chips** | Outlined text chips (Visa…G Pay) under offers and beside checkout. |
| **Proof strip** | Dark ink band, 5 stats, orange display numerals (22–440 / 15 / 10 / 5.3 / 100K). |
| **Cards** | 1.5px line border, radius-lg. **Icon cards render icon-left, text-right** (`card:has(>.ic)` grid `48px 1fr`, icon spans both text rows). Numbered pillar cards keep stacked layout. |
| **Bundle selector** | Radio cards; Core pre-selected with "Best Value" flag; selected = ink border + orange tint + 4px hard shadow. Each row shows its small struck compare-at. Deep-link `?bundle=basic|core|complete`. |
| **Price block** | Display-900 price + struck `.was` + red `.off` badge ("23% OFF"). See §9 for data rules. |
| **Gallery** | Scroll-snap track, synced dots + labeled thumb pills, sticky on desktop. SVG figures are labeled photo/video slots awaiting CDN assets. |
| **Sticky add-to-cart** | Fixed bottom, 3px orange top border, name+bundle / was+price / CTA; appears after the buy-box CTA scrolls out (IntersectionObserver). Body carries 92–100px bottom padding for clearance. |
| **Energy band** | Ink, radial orange glow, one per page, for brand promise / final CTA. |
| **FAQ** | Native `<details>`, display-face summaries, orange `+` chip rotates 45°. |
| **Toast** | Ink pill, bottom-center above sticky bar, auto-dismiss ~2.5s, `aria-live`. |
| **Cart line item** | 96px thumb on orange-tint, title, orange bundle meta, includes line, struck total + total + %-chip, qty stepper (1–9), Remove. Mobile: controls drop to a full-width dashed-top row. |
| **Upgrade nudge** | Dashed-orange tinted card: Basic→Core +$20, Core→Complete +$30; one-tap swap; hidden at Complete. The store's primary upsell. |
| **Order summary** | Sticky, ink border + hard shadow: subtotal · green "You're saving −$X" (auto-hidden at 0) · Shipping FREE · returns Included · mega total · full-width checkout CTA · pay chips · guarantee note. |
| **Empty cart** | Sells, never apologizes: display headline + direct Core CTA. |

---

## 6. Motion

`.rv` reveal-on-scroll (opacity + 18px rise, .55s) gated behind a JS-added `html.js` class so no-JS still shows content; IntersectionObserver un-observes after reveal. Hover micro-interactions: tile/button −2–3px lift with shadow. `prefers-reduced-motion: reduce` kills reveals and transitions globally — **except the marquee**, which the rAF watchdog keeps running by explicit merchant choice (revert = remove the watchdog fallback).

---

## 7. Page blueprints

**Homepage:** marquee → header → kinetic hero + bento (rating chip beside CTA, trust badges) → orange spec ticker → Problem (friction ✕ list + resolve bar) → Mechanism (3 cards + proof strip) → Who It's For (4 icon-left cards) → The System (5 numbered pillars) → How It Works (3 steps) → 12-Week Journey (orange timeline) → Comparison table → Proof (4.7 header + 3 objection-mapped review slots + UGC video wall) → Offer (3 plans, Core lifted, compare-at + save badges, pay chips) → FAQ → Energy band CTA → footer.

**PDP:** marquee → header → Buy box (gallery ⟷ panel: rating chip, H1, bullets, price+was+%, bundle selector, lifted CTA, trust, pay chips) → spec ticker → Why-not-$39 table → What's in the Box → How It Works (7 actions) → Exercise Map (6 zones) → First 7 Days → Reviews → Comparison → FAQ → Energy band → footer → sticky ATC + toast. JSON-LD: **exactly one** Product object, AggregateOffer $149–199 USD, `aggregateRating` omitted until injected from Judge.me.

**Cart:** marquee → header (ghost "Keep shopping") → "Your system." + count line → items + upgrade nudge + returns reassurance ⟷ sticky summary → empty state → slim footer → toast. Seedable via `?bundle=&qty=`.

---

## 8. Light-mode lock (mandatory, every HTML file)

```
1. <meta name="color-scheme" content="light only">
2. :root,html { color-scheme: light only }   html,body { background-color:#F6F5F2; color:#101216 }
3. @media (prefers-color-scheme: dark){ html,body { background:#F6F5F2; color:#101216 } }
4. input,button,select,textarea,details,summary { color-scheme: light only }
5. FORCE-DARK DEFEAT: every light surface also gets a same-color gradient IMAGE —
   body { background-image: linear-gradient(#F6F5F2,#F6F5F2) }   cards { background-image: linear-gradient(#fff,#fff) }
   (darkeners invert background-color but never background-image)
6. No transparent/default backgrounds — every section, card, header, popup has an explicit light hex.
```

The `only` keyword is non-negotiable (bare `light` merely declares support). Anything still dark after this is the *viewer* (app-level invert / Smart Invert) — verify in Safari/Chrome directly.

---

## 9. Pricing, proof & compliance rules

**Compare-at pricing** renders only from Shopify's `compare_at_price`: Liquid `{% if variant.compare_at_price > variant.price %}`, AJAX `/products/HANDLE.js`, cart `item.compare_at_price`. If empty or ≤ price, strike + badge + savings row **auto-hide**. Values in the mockups ($189/$219/$259) are placeholders; admin values must be genuine reference prices (FTC + Meta/GMC). No invented discounts, ever.

**Reviews:** placeholder cards are slot-labeled and mapped to the three buying objections (will I use it / is resistance real / is it smooth). Replace with verbatim verified Judge.me reviews; the 4.7 / 52 figures must match the live platform. `aggregateRating` is injected, never hardcoded.

**Claims:** progression language over transformation promises; "Results vary with individual effort and consistency" in every footer; full-body claims stay honest (upper body + core).

---

## 10. Data & integration conventions

All cart/price logic in mockups is **display-only**; Shopify admin is the source of truth. Variant IDs ship as `GID_BASIC / GID_CORE / GID_COMPLETE` placeholders → replace with real numeric IDs. Wiring points are commented in-file: add `/cart/add.js`, qty/remove/upgrade `/cart/change.js`, checkout button `/checkout`. Bundle deep-links: homepage offers → `pdp?bundle=x` → (future) cart `?bundle=x&qty=n`.

---

## 11. Engineering conventions & QA

One shared stylesheet (`gs2.css`) is the source; pages are assembled (head + css + body + shared JS) — never hand-edit CSS in only one output. Files are self-contained (inline CSS/JS, Google Fonts link only), saved to `/mnt/user-data/outputs/`.

Hard-won rules: desktop overrides never use higher specificity (IDs) *after* mobile media queries — scope every override inside the correct breakpoint (`#top .split` incident); long CTA labels must wrap ≤680px and JS labels use short names; `.big/.sm` stay block; PDP body keeps sticky-bar bottom padding; patch layers get consolidated back into source regularly.

Pre-delivery checklist: tag-balance parse clean · `node --check` on every extracted script block · `light only` on meta + all 4 CSS spots, zero bare `color-scheme:light` · gradient pins present · single `</style>` · one Product JSON-LD (PDP) with no `aggregateRating` · `GID_` grep returns placeholders intentionally · bundle deep-links work · sticky bar clears footer · marquee fills and moves (or rAF kicks in) · check at 360 / 390 / 768 / 1280 / 1920.

---

## 12. Do / Don't

**Do:** one mega element per screen · rating + trust beside every CTA · identical buttons/price/badges from PDP to checkout · tight proof, loud decisions · Inter ≥16px left-aligned for anything read · show savings again in the cart summary.

**Don't:** paragraphs in the condensed face · gold or green as decoration · two orange CTAs side-by-side · flat equal section padding (the SaaS tell) · hardcoded ratings, review counts, stock urgency, or compare-at prices · transparent backgrounds anywhere.
