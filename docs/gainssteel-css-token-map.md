# GainsSteel "Forge" → CSS Token Map & Global-CSS Integration

Companion to `docs/gainssteel-port-plan.md` (which maps design block → section + what/test/CSS).
This doc answers: **which token drives which design value (content/styling/behavior), and how the GainsSteel design system folds into our existing global CSS** — so a re-skin is one token file, not 44 section rewrites.

---

## 1. The integration model (read this first)

**The design** (`gs2.css`) = one shared sheet with design tokens (`--orange`, `--ink`, `--steel`, …) + `gs-*` classes.
**Our theme** = a layered token system, single-sourced:

```
snippets/css-variables.liquid     ← THE token source (--ct-* on :root). Set GainsSteel here ONCE.
  ↓ (every section consumes var(--ct-*))
assets/theme-overrides.css        ← global skin (buttons, fields, header, focus) — already token-based
assets/section-ct-base.css        ← shared .gs-* primitives (media slot, lightbox, marquee keyframes)
assets/section-ct-components.css   ← .gs-* component CSS (tiers, compare, reviews, feature, faq, …)
assets/section-ct-responsive.css   ← breakpoint overrides
sections/*.liquid {% style %}      ← per-section scoped layout CSS
```

**Principle:** map each GainsSteel design token → one `--ct-*` token and set it in `css-variables.liquid`. Because every `ct-*` section already paints from `--ct-*`, that single change re-skins colour/type/shadow across the whole store. Per-block **layout** (bento grid, proof strip, energy band) is applied in that section's scoped CSS, still using tokens — never raw hex/px.

**Hard rule:** raw colour/px values live ONLY in `css-variables.liquid`. Section CSS uses `var(--ct-*)`. (Token audit forbids hex + px in `font-size`/`padding`/`margin`; px OK for width/height/border/insets.)

---

## 2. Colour token map (design §2 → `--ct-*`)

Set these in `snippets/css-variables.liquid` (the `default:` on the accent line must change too — a stale schema default silently wins). Accent flows from `settings.color_accent` (activate the `Forge` preset).

| Design token | Hex | Role (orange=act, green=trust, gold=rating, red=urgency) | `--ct-*` to set |
|---|---|---|---|
| `--orange` | `#ff6b1a` | primary action: buttons, price, selected, key accents | `--ct-accent` (= `settings.color_accent`) → `--ct-action` |
| `--orange-deep` | `#e35708` | hover/pressed | `--ct-accent-strong` (= `color_accent_hover`) → `--ct-action-hover` |
| `--orange-tint` | `#fff1e6` | soft action fill (selected bundle, nudge) | `--ct-action-tint` (currently grey `--ct-accent-subtle`) |
| `--ink` | `#101216` | display type, dark bands, structure | `--ct-text` (and `--ct-espresso`, `--ct-price`) |
| `--ink-soft` | `#444a55` | body copy, leads | `--ct-text-2` |
| `--steel` | `#5b6573` | captions, fine print, struck "was" | `--ct-text-3`, `--ct-price-was` |
| `--steel-light` | `#eceef0` | neutral fill (table heads, UGC tiles, chips) | `--ct-bg-surface` |
| `--bg` | `#f6f5f2` | page | `--ct-bg` |
| `--card` | `#ffffff` | cards/panels/surfaces | `--ct-bg-raised`, `--ct-card-bg` (already `#fff`) |
| `--line` | `#e4e2dc` | hairlines | `--ct-border` |
| `--green` | `#1e7a4f` | TRUST only (guarantees, FREE, saving) | `--ct-success`, `--ct-stock-in`, `--ct-trust` |
| `--green-tint` | `#e9f4ee` | trust fill | `--ct-success-light`, `--ct-trust-tint` |
| `--gold` | `#eda21a` | RATINGS only (stars) | `--ct-rating`, `--ct-stock-low`, `--ct-badge-new/-best` |
| `--red` | `#d23a2c` | URGENCY only (%-off, savings, problem ✕) | `--ct-urgency`, `--ct-error`, `--ct-badge-sale`, `--ct-price-save` |
| `--red-tint` | `#fbeceb` | urgency fill | `--ct-error-light`, `--ct-urgency-tint` |
| ink band overlay | `rgba(18,24,28,…)` | energy band / proof strip / overlay | `--ct-bg-overlay`, `--ct-overlay-bg` (already ink — OK) |

> Note: PDP price renders **orange** (design §3) but `--ct-price` is reused elsewhere — apply orange at the PDP price selector (`color: var(--ct-action)`) in the buy-box CSS, not by recolouring the global `--ct-price` token.

---

## 3. Typography token map (design §3 → tokens)

| Design role | Spec | `--ct-*` |
|---|---|---|
| Display family | **Saira Condensed** 600–900, UPPERCASE, lh .96, tracking −.01em | `--ct-font-display`, `--ct-font-heading` → `var(--font-heading-family, 'Saira Condensed', system-ui, sans-serif)` |
| Body family | **Inter** 400–700, sentence case, ≥16px | `--ct-font-body` (unchanged) |
| Mega / price | clamp ~3rem (PDP price 3rem; summary 2.5rem) | section CSS uses `--ct-text-3xl`/`--ct-text-4xl` or a local clamp; price wrapper |
| H1 hero | `clamp(2.9rem,8.4vw,4.9rem)` w900 | `--ct-display-1` (retune clamp to design); fallback `--ct-h1` |
| H2 section | `clamp(2rem,4.6vw,3rem)` | `--ct-h2` / `--ct-display-2` |
| H3 / H4 | 1.5rem / 1.18rem | `--ct-h3` (`--ct-text-2xl`) / `--ct-h4` (`--ct-text-xl`) |
| Lead | 1.1rem Inter | `--ct-body-size` scaled / `--ct-text-md` |
| Body | 1rem Inter | `--ct-body-size` (`--ct-text-base`) |
| Eyebrow | .78rem display, tracking .2em, orange + 26px dash | `--ct-text-xs`/`-sm` + `--ct-action`; dash via section CSS |
| Fine | .82rem steel | `--ct-text-sm` + `--ct-text-3` |

**Behaviour rules to encode in section CSS:** display headings/price/buttons/eyebrows get `text-transform:uppercase` + `letter-spacing:-.01em` (current ct-* CSS is sentence-case Poppins). Kinetic devices `.ol` (outline `-webkit-text-stroke:2.5px var(--ct-text)` + `@supports` solid fallback), `.hl` (orange span), `.num` (outline numerals) live in the hero/system section CSS. Never set paragraphs in the condensed face.

**Wiring:** `layout/theme.liquid` Google `<link>` → `Saira+Condensed:wght@600;700;800;900` + keep `Inter`. (Saira isn't in Shopify's font library — load via `<link>`, same as Inter.)

---

## 4. Spacing / radii / shadows / focus map (design §4 → tokens)

| Design | Value | `--ct-*` |
|---|---|---|
| `--pad-tight` | 3rem (2.6rem ≤860) | `--ct-space-6` (48px) section padding; mobile `--ct-mobile-section-pad-y` |
| `--pad-loud` | 5.5rem (3.8rem ≤860) | `--ct-pad-loud` (clamp 61–88) / `--ct-space-7` |
| Container | max 1140px, 20px gutters | `--ct-mw` (`settings.page_width`), `--ct-gutter` |
| Radius standard / feature / pill / button | 14 / 20 / 999 / 11px | `--ct-r-md` (`border_radius`→14), `--ct-r-lg` (→20), `--ct-r-pill`, `--ct-btn-radius` (→~11) |
| Shadow soft | `0 14px 40px rgba(16,18,22,.08)` | `--ct-shadow-lg` (retune) |
| **Hard lift** | `7px 7px 0 --ink` + 2px ink border | `--ct-shadow-lift` (already `7px 7px 0 var(--ct-text)`) — correct once `--ct-text`=ink |
| Focus ring | `0 0 0 3px rgba(255,107,26,.35)` | `--ct-focus` (retune to orange glow) |

---

## 5. Behaviour / interaction map (design §5/§6 → our JS + primitives)

| Design behaviour | Our implementation | Tokens |
|---|---|---|
| `.rv` reveal-on-scroll (opacity+18px, .55s, IO, un-observe) | `assets/ct-reveal.js` + `[data-reveal]` | `--ct-reveal-*`, `--ct-dur-slow`, `--ct-ease-out` |
| Marquee (two halves, `translateX(-50%)`, JS fill + rAF watchdog) | `ct-trust-marquee` (server-rendered sets + keyframe `gs-scroll`) | `--ct-marquee-duration`, `--ct-action` band |
| Rating chip (stars + score + count, bind live) | snippet `ct-rating-stars` (renders nothing without data) | `--ct-rating` |
| Toast (ink pill, bottom-center, aria-live, ~2.5s) | `assets/ct-toast.js` | `--ct-text` pill, `--ct-on-accent` |
| Sticky ATC (reveal after CTA scrolls out, 3px orange top) | `ct-sticky-atc` (IntersectionObserver) | `--ct-action` border |
| Bundle selector + deep-link `?bundle=` | section JS (scoped, idempotent) | `--ct-action`, `--ct-action-tint`, `--ct-shadow-lift` |
| Hover lift −2–3px | section CSS transitions | `--ct-dur-fast`, `--ct-ease-out` |
| `prefers-reduced-motion` | `--ct-dur-* → 0` (already) kills reveals/transitions | — |
| Light-mode lock | already `color-scheme: light only` + gradient pins | — |

Guards: scope JS to section root, `customElements.get` guard, unsubscribe in `disconnectedCallback`, re-init on `shopify:section:load`; render marquee sets server-side (no double-clone).

---

## 6. gs2.css class → our class/section map

| Design class | Our home | Note |
|---|---|---|
| `.wrap` (1140px) | `.gs-wrap` / `--ct-mw` | container |
| `.btn-primary` / `.btn-ghost` | `.ct-btn--primary` / `.ct-btn--outlined` (theme-overrides) or `.button` | orange solid / 2px ink outline |
| `.card` (line border, radius-lg) | `--ct-card-*` tokens / `.gs-card` | icon-left `card:has(>.ic)` → `ct-icon-columns` |
| `.energy` (ink + radial orange glow) | `ct-cta-banner` energy variant | one per page |
| `.proof-strip` (dark, 5 stats, orange numerals) | `ct-stats` dark-band variant | full-bleed inside `#shopify-section` |
| `.tier` (radio bundle card, selected = ink+tint+4px lift) | `ct-bundle` / `.gs-tier` + `ct-product-buy` | `--ct-action-tint` + `--ct-shadow-lift` |
| `.marquee` (ink trust / orange spec) | `ct-trust-marquee` | band style setting |
| `.ol` / `.hl` / `.num` | hero/system section CSS | kinetic type utilities |
| `.rv` | `[data-reveal]` + ct-reveal.js | — |
| FAQ `<details>` + orange `+` | `ct-faq` | chip rotate 45° |
| gallery (snap track + dots + thumbs) | `ct-product-buy` `gs-gallery` / `ct-gallery` | already built |
| sticky bar | `ct-sticky-atc` | — |
| toast | `ct-toast` | — |

---

## 7. Applying to the CURRENT global CSS — concrete steps

1. **`snippets/css-variables.liquid` (the one global change that re-skins everything):** apply §2 colours + §3 fonts + §4 radii/shadow/focus to the `--ct-*` declarations. Edit the hardcoded hexes (they don't read settings) and fix the accent `default:`. This alone flips all `ct-*` sections to GainsSteel colour/type.
2. **`config/settings_data.json` / `settings_schema.json`:** activate `Forge` preset (`current`) + sync schema `color_accent`/`color_accent_hover` defaults so they agree (the brand-swap trap).
3. **`layout/theme.liquid`:** swap the Google Fonts `<link>` to Saira Condensed + Inter.
4. **`assets/theme-overrides.css` (global skin):** already token-based → recolours automatically. Add the global uppercase/tracking rule for display headings under `.gs-scope` (or per-section) so the condensed face reads as designed. Buttons (`.ct-btn`, `.button`) already token-driven → become orange.
5. **`assets/section-ct-base/components/responsive.css`:** the `.gs-*` component CSS already exists and consumes `--ct-*` → colours/fonts update for free; **adapt only the layout deltas** the GainsSteel design needs (bento, dark proof strip, 3rd compare column, energy band, 5-pillar numerals) — scoped, token-only.
6. **New section CSS:** `ct-hero-bento` (and any new block) gets its own scoped `component-ct-*.css`, token-only, full-bleed re-established inside `#shopify-section`.
7. **Per-section `{% style %}`:** apply block-specific layout (grids, ratios) with tokens; keep selectors scoped to the section (no bare element / adjacency selectors — Shopify wrappers break them).

**Order:** #1–#3 = Phase 0 (re-skins the store globally, low risk, token-only). #4–#7 = per page as we port (Phases 1–3).

---

## 8. Token-audit guardrails (so each change stays green)

- Section/component CSS: **no hex, no `rgb()/rgba()` literals, no px in `font-size`/`padding`/`margin`** — use `var(--ct-*)`. Raw colours allowed ONLY in `css-variables.liquid` (audit-ignored there).
- px allowed for width/height/border-width/insets and true sizing with no token.
- No `--gs-*` custom props, no `!important` (allowlisted exceptions only).
- After each change: `node qa/ct-qa.mjs` + `shopify theme check` (0 offenses) + mojibake sweep + your visual QA on the preview.
