# Technical Migration Document — Generic Theme Platform → Shrine Pro Parity

**Document type:** Engineering migration plan · task breakdown · testing specification
**Prepared:** June 12, 2026 · **Status:** v1.0 for review
**Companion documents (IDs referenced throughout):**

| Ref | Document | Provides |
|---|---|---|
| BRD | *Shrine Pro — Functional Requirements & Dawn Gap Analysis* | FR-*/GAP-*/NFR-* target requirements |
| GA | *Petalform-Codex-V1 → Shrine Pro Parity — Gap Analysis* | CF-01…06 critical findings, coverage scorecard, reuse map |
| TG | `Technical-Guide.md` (current theme: Dawn 15.4.1 fork, `gs-*` kit, `.gs-scope`, `--ct-*` tokens) | Current-state architecture |
| DS | `gainssteel-design-system-v2.md` ("Forge") | Design-system **methodology** to generalize (role-based color, rhythm spacing, compliance rules) — *not* a brand to hardcode |

---

## 1. Objective & Hard Constraints

**Objective:** evolve the current codebase into a **generic, brand-agnostic Shopify OS 2.0 theme** with Shrine-Pro-level functionality, where every component is assembled in the Theme Editor (drag/drop sections, add blocks, type text) — *no store-specific code, content, or assets anywhere*.

### Generic-theme hard rules (G-rules — every task is reviewed against these)

| ID | Rule |
|---|---|
| G-01 | **No brand content in code.** No brand names, product copy, niche assets, or third-party logos shipped in Liquid/SVG. Brands live in `settings_data` presets only. |
| G-02 | **Everything editable.** All visible text/media/choices come from `{% schema %}` settings/blocks or `locales/*` strings. Zero hardcoded UI strings. |
| G-03 | **Every section ships a preset** with neutral seed blocks so drag-in shows a complete, sensible default (already true for all 13 `gs-*` sections — keep it true). |
| G-04 | **Settings-first, metafields-optional.** Any metafield read (rating, sold count…) must have a settings fallback + an editor `info` note. No hard metafield dependencies. |
| G-05 | **No fake commerce data.** Compare-at/savings render only from real `compare_at_price` (DS §9); ratings/counts never hardcoded defaults that look real. Tier/bundle pricing is display-layer over Shopify automatic discounts (NFR-06). |
| G-06 | **Token-only styling.** No raw hex/px-size literals in component CSS (current state already achieves 0 hex in `section-gs-page.css` — enforced by CI from W1 on). |
| G-07 | **Dawn-native commerce path.** Cart/product mutations go through Dawn's `<product-form>`/cart elements; custom JS stays presentational or extends Dawn elements — never forks the cart pipeline. |
| G-08 | **Theme-editor safe.** Idempotent init (`dataset.ready`), `shopify:section:load/select` handling, "test mode" for drawers/popups (Shrine pattern, FR-CART-13). |
| G-09 | **Locale-complete.** New UI strings land in `locales/en.default.json` (+ schema strings in `en.default.schema.json`); never English literals in Liquid. |
| G-10 | **A11y/perf floors:** focus-ring token on all interactives, `prefers-reduced-motion` honored by default (DS marquee exception becomes an explicit *setting*, default OFF), Lighthouse budgets in CI (W1.T18). |

---

## 2. Current-State Delta (what TG/DS + code inspection add to GA)

Verified against the codebase on June 12, 2026:

| # | Finding | Consequence for this plan |
|---|---|---|
| CS-01 ✅ | **Token discipline already exists and is good.** `snippets/css-variables.liquid` emits **84 `--ct-*` tokens** (incl. commerce semantics: price/badge/stock/rating/status separated from brand accent — exactly DS's "color by job" idea); `section-gs-page.css` contains **0 hex literals**; `--gs-*` (56) are pure aliases. | W1 is a **restructure & extend**, not a rescue. Keep `--ct-` as the single namespace; deprecate `--gs-` aliases. |
| CS-02 🔴 | **Light-lock fights Dawn schemes.** `:root{color-scheme: only light}` + `body{background:var(--ct-bg) !important; color:var(--ct-text) !important}` overrides `color_scheme_group` page-wide — Dawn schemes can't paint surfaces. | W1.T03 reworks light-lock into a **setting** implementing DS §8's 5-step defeat *per scheme*, dropping `!important` body paint. Until then, scheme work (GAP-01 follow-through) is blocked. |
| CS-03 🟡 | **Three CSS layers in flight:** Dawn `base.css` (~80 KB) + `theme-overrides.css` (16.8 KB, undocumented grab-bag) + `section-gs-page.css` (46.5 KB, scoped). | W1.T13 triages overrides into tokens/components; W1.T12 splits the mega-file; `.gs-scope` retired at W1.T14. |
| CS-04 🟡 | **Doc drift:** TG says accent `#E0A92E` (Pollinook gold); code default is `#C16E4A` (Petalform terracotta). TG also still calls the brand Pollinook while `theme_name` is Petalform-Codex-V1. | Confirms the schema↔data sync footgun (TG §3.4). W1.T16 ships a sync-check script; presets become the brand mechanism. |
| CS-05 🔴 | **Brand/IP leakage for a generic theme:** `gs-brandmark` (Pollinook™ wordmark), `gs-press-logo` (inline GMA/WIRED/BBC/USA-Today SVGs — third-party trademarks), `gardenstudio_benefits` block type, hardcoded English strings, niche seed content (15 garden-stake specs). | W1.T15 purges; press logos become **image-upload only** (legal requirement, G-01). |
| CS-06 ✅ | JS layer is clean & small: IIFE, idempotent, editor-safe, no fetch (TG §7) — and Dawn's commerce elements untouched. | Two-lane JS convention (§3.4) formalizes this; new commerce features extend Dawn elements. |
| CS-07 ✅ | `--ct-accent-rgb` triple already bridges into Dawn's `rgb()`-based `--color-*` vars. | Pattern to generalize in the scheme bridge (W1.T03). |

---

## 3. Target Architecture

### 3.1 The token pyramid (top-down reuse)

One namespace (`--ct-*`), five layers, strict downward flow. **Change a token once → every consumer updates.** Emission order inside `snippets/css-variables.liquid` mirrors the layers.

```
L0  Dawn native (keep as-is)
    color_scheme_group → per-scheme --color-* (rgb triples) on .color-scheme-N classes
    --font-heading-*/--font-body-* from font_picker · --page-width

L1  FOUNDATION SCALES (static or settings-scaled; :root)
    Space     --ct-space-0…12  (0/2/4/8/12/16/20/24/32/40/48/64/80px)
    Rhythm    --ct-pad-tight / --ct-pad-loud            ← DS §4 "tight proof, loud decisions", merchant-tunable
    Type      --ct-text-xs…3xl, --ct-display-1/2        ← clamp() generated from base size + scale settings
    Radius    --ct-radius-xs/sm/md/lg/pill              (md ← setting; exists today)
    Shadow    --ct-shadow-xs…2xl (exists) + --ct-shadow-lift (hard offset, DS tactile accent)
    Motion    --ct-dur-fast/base/slow, --ct-ease, --ct-reveal-* (engine inputs, FR-GS-04)
    Focus     --ct-ring (exists as --ct-focus-ring → consolidate)

L2  SEMANTIC ROLES (settings-driven; :root; scheme-independent commerce truth)
    Action    --ct-action / --ct-action-hover / --ct-action-tint   (renames --ct-accent*; aliases kept 1 release)
    Trust     --ct-trust / --ct-trust-tint     Rating --ct-rating     Urgency --ct-urgency / --ct-urgency-tint
    Price     --ct-price / --ct-price-compare / --ct-savings
    Badges    --ct-badge-sale/new/best         Stock --ct-stock-in/low/out        Status success/warn/error (exist)
    Surfaces  --ct-surface-page/card/raised/overlay/line  ← **bridged per scheme** (see 3.1.1)

L3  COMPONENT CONTRACTS (written by Theme-Settings "skin" panels = Shrine FR-GS-05/07/08/09/10/11/12)
    --ct-btn-*   --ct-input-*   --ct-card-*   --ct-qty-*   --ct-pill-*   --ct-dropdown-*
    --ct-swatch-*   --ct-arrow-* / --ct-dot-* (slider chrome)   --ct-drawer-*   --ct-popup-*   --ct-badge-*
    Defaults reference L1/L2 only.

L4  LOCAL OVERRIDES (per section/block; implements Shrine FR-X-08 with zero specificity wars)
    a) scheme: class="color-scheme-{{ section.settings.color_scheme }}"  → flips all L2 surface tokens
    b) overrides: style="--ct-btn-bg: {{ s.custom_btn }}; --section-pad-top: {{ s.pad_top }}px …"
       Inline style re-declares the SAME token names on the section/block wrapper; cascade does the rest.
```

#### 3.1.1 Scheme bridge (the GAP-01 completion)

Inside the global stylesheet, for each scheme class Dawn generates, map semantic surfaces onto scheme output:

```css
[class*="color-scheme-"] {
  --ct-surface-page: rgb(var(--color-background));
  --ct-text:        rgb(var(--color-foreground));
  --ct-line:        rgba(var(--color-foreground), .12);
  /* card/raised derive from scheme background with elevation overlays */
}
```

Commerce roles (price, rating, trust, urgency, badges, stock) stay **global** (L2) so a scheme change never recolors a sale badge — preserving TG's best architectural idea and DS's reserved-color rules simultaneously.

### 3.2 Settings panels → token map (Theme Editor is the skin system)

| Editor panel (target) | Writes | Trace |
|---|---|---|
| Colors (Dawn schemes) | L0 `--color-*` → bridged L2 surfaces | FR-GS-02 ✅ |
| Commerce colors *(new)* | L2 action/trust/rating/urgency/price/badges/stock | DS §2, FR-GS-02 |
| Typography *(extended)* | L1 type scale + display treatment (uppercase/tracking opt.) | FR-GS-03 |
| Layout & spacing *(extended)* | `--page-width`, L1 rhythm + section-pad defaults | FR-X-07 |
| Buttons *(extended)* | `--ct-btn-*` (radius/border/shadow/hover/lift) | FR-GS-07 |
| Inputs / Cards / Drawers / Popups | `--ct-input-* / card-* / drawer-* / popup-*` | FR-GS-12 |
| Variant pills / dropdowns / Quantity / Swatches / Slider controls *(new ×5)* | `--ct-pill-* / dropdown-* / qty-* / swatch-* / arrow-* / dot-*` (+ swatch color dictionary) | FR-GS-05/08/09/10/11 |
| Animations *(new)* | `--ct-reveal-*` + enable flags | FR-GS-04 |
| Badges *(extended)* | badge formats + L3 badge tokens | FR-GS-06 |
| Accessibility & color-mode *(new)* | light-lock toggle, marquee-vs-reduced-motion toggle (default honors RM) | CS-02, G-10 |

### 3.3 CSS file architecture & loading

```
assets/base.css                 Dawn foundation (keep lean; receives L1 additions only)
snippets/css-variables.liquid   THE EMITTER: L1→L2→L3 token output from settings (raw CSS, ordered, commented)
assets/component-<name>.css     one file per shared component (button add-ons, qty, pills, swatch, marquee, rating, upsell-card, toast, sticky-bar …)
assets/section-<name>.css       one file per section, loaded by that section via {{ 'x.css' | asset_url | stylesheet_tag }}
(theme-overrides.css)           DELETED by end of W1 — contents triaged into tokens/components
(section-gs-page.css)           DELETED by end of W1 — split into the above
```

Rules: section CSS loads only when the section renders (Dawn pattern); component CSS loads from the sections that use it (duplicate tags are deduped by Shopify); **no `!important`** except documented a11y cases; no ID selectors; max specificity 0-2-0; mobile-first with the unified breakpoint set **560 / 680 / 750 (Dawn) / 880 / 990 (Dawn) / 1040** — new code uses Dawn's 750/990 plus 560/880 only (TG's 620/760/780/820/1000 collapse into these during W1.T10).

### 3.4 JS conventions (two-lane rule)

| Lane | Tech | Used for | Examples |
|---|---|---|---|
| **Commerce** | Dawn Web Components (extend, never fork) | Anything touching cart/variant/price state | `<product-form>`, variant pickers, qty-breaks add-to-cart, cart-drawer blocks, upsell add |
| **Presentation** | Current IIFE pattern (`assets/theme-ux.js`, renamed from `gs-page.js`) — `data-ct-*` attributes, idempotent `dataset.ready`, `init(root)` on `DOMContentLoaded` + `shopify:section:load` | Carousels/dots, marquee fill+watchdog (DS §5), tabs/accordions, lightbox, toast, sticky show/hide, countdown display, copy-button, reveal engine | all current `gs-page.js` features |

New shared elements land as small standalone assets (Dawn style): `copy-button.js`, `countdown-timer.js`, `price-tokens.js` (W2). Events between lanes use Dawn's `pubsub.js` (`cart:update`, `variant:change`) — no DOM polling.

### 3.5 Section & snippet authoring conventions (the "drag/drop" contract)

Every new/retrofitted section MUST use these shared schema partials (created W1.T09/T17) and patterns:

1. **`schema-section-padding`** group → wrapper emits `style="--section-pad-top:{{…}}px; --section-pad-bottom:{{…}}px"` with separate mobile/desktop ranges (FR-X-07).
2. **`schema-color-scheme+overrides`** group → scheme select + optional custom background/text/accent writing L4 inline tokens (FR-X-08).
3. **Heading group** standard (text, size select mapping to L1 steps, alignment).
4. Blocks for repeatable content; section settings for layout; `presets` with 2–4 seed blocks of **neutral commerce copy** ("Free shipping over $50", "★★★★★ — Sarah M."), never niche copy (G-01/03).
5. All strings via `t:` schema keys + `{{ 'x' | t }}` runtime keys (G-09).
6. `{% render %}`-able core: any block that must appear in multiple hosts (buy-box blocks, upsell card, stars) is a snippet with explicit params; the section block case-statement only maps settings → snippet args (BRD R-03).

---

## 4. Migration Phasing & Dependency Graph

```
W0 Repair (CF-01…06) ─┬─► W1 CSS architecture & token refactor (THIS DOCUMENT'S DEEP PART)
                      │        │
                      │        ▼
                      └─► W2 Shared primitives (8 + elements)
                               │
              ┌────────────────┼──────────────────┐
              ▼                ▼                  ▼
        W3 PDP block lib   W4 Cart system    W5 Section library
              └────────────────┴──────────────────┘
                               ▼
                    W6 Nav/overlays/utilities + hardening (RTL, a11y, perf)
```

Sizing: **S** ≤ 1 dev-day · **M** 2–4 · **L** 5–10 · **XL** > 10. Every task inherits the **Definition of Done** (§7.6) — its Test Spec lists only task-specific verification on top of DoD.

---

## 5. W0 — Repair & Re-baseline (prerequisite, ~1 week)

| ID | Task | Key acceptance criteria | Test spec (beyond DoD) | Size | Trace |
|---|---|---|---|---|---|
| W0.T01 | Restore Dawn 15.4.1 `header.liquid`/`footer.liquid`; park gs versions as `gs-header-minimal`/`gs-footer-minimal` (unlisted via `"templates": []` until W6 styling) | Stock Dawn header/footer render with menu picker, localization, sticky options; gs files no longer referenced by groups | Editor: assign `main-menu`; verify dropdown/mega/drawer modes, locale selector, sticky on-scroll. Smoke all Dawn templates (collection/search/cart/account) render with header/footer | M | CF-01/02 |
| W0.T02 | Rebuild `product.json` on `main-product` (Dawn block order); move gs funnel stack to `templates/product.landing.json` | Default PDP uses `main-product`; landing template selectable per product; no gs section in default `product.json` | Create test product → default template shows Dawn buy-box; switch template to *landing* in admin → funnel renders; ATC works on both | S | CF-03 |
| W0.T03 | Repo hygiene: LF normalize + `.gitattributes`; re-diff vs Dawn 15.4.1 to isolate true deltas; fold the 32-line cart-drawer currency patch into a documented override note | `git diff --stat` vs Dawn shows only intentional files; zero CRLF | CI: `git grep -lI $'\r'` returns empty | S | CF-05 |
| W0.T04 | Rename `gardenstudio_benefits` → `benefits_checklist` (with template-key migration note); sweep gs sections for hardcoded strings → locales | `grep -ri "gardenstudio\|pollinook" sections/ snippets/` → 0 (brandmark handled in W1.T15) | Editor: re-add block post-rename; translated string renders via `t` | S | CF-04/06, G-09 |
| W0.T05 | Baseline capture: Lighthouse (home/PDP/collection/cart, mobile+desktop), template screenshots at 6 viewports, current token report | Baseline artifacts committed to `/qa/baseline/` | — (this *is* the test infrastructure seed) | S | NFR-01 |

---

## 6. W1 — CSS Architecture & Token Refactor (the deep part)

**Goal:** one top-down token system feeding every component; spacing/typography normalized; CSS split per component/section; brand fully extracted to presets; override pattern live. **Exit state:** `theme-overrides.css` and `section-gs-page.css` deleted; `.gs-scope` retired; CI guards token discipline.

### W1.E1 — Token foundation & emitter

**W1.T01 · Token inventory & audit tooling** — Size S · Deps W0.T05
Build `qa/token-audit.mjs` (Node, no deps): scans `assets/*.css` + `sections|snippets/*.liquid` for (a) hex/rgb literals outside `css-variables.liquid` & scheme bridge, (b) `font-size`/`padding`/`margin` px literals outside token files, (c) `--gs-` usages, (d) `!important`. Outputs a categorized report; CI mode fails on new violations vs committed allowlist.
*AC:* report reproduces today's truth (0 hex in `section-gs-page.css`; counts for overrides file & Dawn css recorded to allowlist).
*Test:* introduce a stray `#fff` in a section → CI run fails naming file:line; remove → passes.

**W1.T02 · Restructure the emitter into L1→L3** — Size M · Deps T01
Rewrite `snippets/css-variables.liquid` in three commented layers per §3.1: add space scale, rhythm pair (`--ct-pad-tight/loud` ← 2 new range settings, defaults 48/88px desktop · 40/61px mobile via clamp), type scale (`--ct-text-*`, `--ct-display-*` from existing base-size + new scale-ratio setting), motion + focus tokens; rename `--ct-accent*` → `--ct-action*` keeping old names as one-line aliases marked `/* deprecated W1 */`.
*AC:* every L1/L2 token listed in §3.1 emits; old names still resolve; file renders raw CSS (no `<style>`), parses (no Liquid inside CSS comments — TG warning).
*Test:* (1) View source on any page → ordered token block present once. (2) Toggle each new setting in editor → computed style of `:root` updates live (no reload artifacts). (3) `getComputedStyle(document.documentElement).getPropertyValue('--ct-accent')` === `--ct-action` value. (4) token-audit: no orphan tokens (emitted-but-unused list reviewed).

**W1.T03 · Scheme bridge + light-lock as a setting** — Size M · Deps T02 · **Highest-risk task**
Remove `body { background/color … !important }` from the emitter; add the §3.1.1 scheme-bridge rules; convert force-light into Theme Settings → *Accessibility & color-mode*: when ON, emit DS §8's full defeat (meta `color-scheme: light only` via `theme.liquid` conditional, `:root/html/form-controls color-scheme`, prefers-dark re-pin, gradient-image pins on `body` + card/raised tokens, explicit backgrounds rule). Default **ON** (preserves current behavior) — flag for product decision (§8 D-04).
*AC:* with lock OFF, switching a section's color scheme visibly repaints page/card surfaces from `--color-*`; with lock ON, Android force-dark + iOS Smart-Invert leave surfaces light; no `!important` remains in emitter.
*Test:* matrix — {lock ON, lock OFF} × {scheme-1, a new dark scheme} × {Chrome force-dark emulation, normal}: page bg, card bg, text, price color asserted per cell (8 manual checks + screenshot diff vs expected). Regression: gift-card & checkout-adjacent pages unaffected.

**W1.T04 · `--gs-` deprecation shim & freeze** — Size S · Deps T02
Move the 56 alias lines into `assets/deprecated-aliases.css` loaded last in `theme.liquid`; token-audit gains "no NEW `--gs-` consumers" rule (existing allowlisted, burned down by W1.T10/T12).
*AC:* visual no-op (screenshot diff = 0 across baseline set); CI blocks new `--gs-` use.
*Test:* add `--gs-ink` to a new file → CI fails; baseline screenshots byte-similar (≤0.1% pixel diff).

### W1.E2 — Settings "skin" panels writing L3

**W1.T05 · Extended Typography panel** (FR-GS-03) — M · Deps T02 — heading/body size, scale ratio, weight, letter-spacing, optional display-uppercase toggle (DS §3 as *option*, default off) → L1 type tokens; Dawn `--font-*` untouched.
*Test:* slider sweep updates `h1…h6`, `.ct-lead`, `.ct-fine` live; 16px body floor enforced (input clamps); no layout overflow at 360px with max settings.

**W1.T06 · Buttons panel extension** (FR-GS-07) — M · Deps T02 — radius/border/shadow choice (soft | hard-lift per DS), hover behavior (darken | lift | both), min-height (default 48px, floor 44 — DS tap rule) → `--ct-btn-*`; applied to Dawn `.button` + form submits globally.
*Test:* primary/secondary/ghost buttons across PDP, cart, newsletter reflect each setting; keyboard focus shows `--ct-ring`; 44px tap target verified at 360px (DevTools tap-area overlay).

**W1.T07a–e · Control-skin panels ×5** (FR-GS-05/08/09/10/11) — each S/M · Deps T02
(a) Variant pills (b) Variant dropdowns (c) Quantity pickers (d) Color swatches incl. **merchant color-dictionary** richtext ("Name:#hex" lines parsed by snippet) (e) Slider chrome (arrow size/radius/icon, dot w/h/active-scale/gap). Each panel = one token cluster + one `component-*.css` consuming it. Swatch/pill/dropdown rendering itself ships in W2/W3; here the contracts + a styleguide preview section (`gs-styleguide`, dev-only via `"enabled_on": {"templates":[]}` + manual add) prove the tokens.
*Test (pattern, run per panel):* styleguide section shows the control in default/hover/focus/selected/disabled; change every setting → visual updates; contrast of text-on-control ≥ 4.5:1 with default tokens (axe check); RTL flip sanity (`dir="rtl"` on html).

**W1.T08 · Animations panel + reveal tokens** (FR-GS-04) — S · Deps T02 — panel: enable, repeat, duration, initial delay, stagger, start opacity/X/Y/zoom → `--ct-reveal-*` + body data-flags. Engine wiring is W2.T06; here Dawn's existing `scroll-trigger` consumes duration/opacity tokens as proof.
*Test:* tokens reflected in computed styles; `prefers-reduced-motion` zeroes durations (DevTools emulation); settings persist through editor reload.

### W1.E3 — Spacing & typography normalization ("fix spacing, font")

**W1.T09 · `schema-section-padding` partial + section shell** — M · Deps T02
Create the shared schema snippet (4 ranges: top/bottom × mobile/desktop, step 4, default tight-rhythm) + `snippets/section-shell.liquid` wrapper emitting the L4 inline pad tokens and optional scheme class. Document in `/docs/section-authoring.md` with copy-paste template.
*AC:* one reference section (gs-faq) migrated; editor shows grouped "Section padding" controls.
*Test:* drag faq in → default rhythm matches `--ct-pad-tight`; set 0/0 → flush; mobile values apply only <750px; reorderåing sections in editor keeps inline styles (section reload event).

**W1.T10 · Retrofit all 13 gs sections to tokens + unified breakpoints** — L · Deps T09
Replace literal paddings (60/44px), widths (1160 wrap → `--page-width` with `--ct-wrap-narrow` option), gaps, and the 5 legacy breakpoints (620/760/780/820/1040 → 560/750/880/990) ; adopt section-shell + padding schema in every gs section; burn `--gs-` aliases here.
*AC:* token-audit shows 0 px-literal paddings & 0 `--gs-` refs in `sections/gs-*`; visual diff vs baseline within tolerance (intentional rhythm changes documented with before/after).
*Test:* 6-viewport screenshot matrix per section vs annotated expectations; editor padding controls verified on 3 random sections; no horizontal scroll at 360px anywhere (`document.documentElement.scrollWidth === innerWidth` probe on each template).

**W1.T11 · Typography retrofit & heading standard** — M · Deps T05, T10
Map gs heading/lead/fine classes to L1 steps; remove per-section font-size literals; add the shared heading schema group (size select = L1 steps) to retrofitted sections.
*Test:* type-scale slider sweep re-flows every gs section coherently; no clipped condensed-face descenders at 200% browser zoom; `body` copy ≥16px everywhere (computed-style crawl in qa script).

### W1.E4 — CSS file split & scope retirement

**W1.T12 · Split `section-gs-page.css` (46.5 KB) into per-component/per-section files** — L · Deps T10
Cut along TG §8.1's existing internal order → `component-marquee.css`, `component-rating.css`, `component-toast.css`, `component-sticky-bar.css`, `component-lightbox.css`, `component-media-slot.css`, + one `section-gs-<name>.css` each; each section loads its own + needed component sheets; keep `.gs-scope` prefix intact during the cut (mechanical move only).
*AC:* `section-gs-page.css` deleted; per-template CSS payload reported (expect ≥30% reduction on non-funnel templates); zero selector changes (stylelint diff).
*Test:* Lighthouse CSS-bytes per template ≤ baseline−30% on collection/cart; funnel template visual diff = 0; network panel shows only used sheets per template.

**W1.T13 · `theme-overrides.css` triage to zero** — M · Deps T02, T12
Classify all 16.8 KB: (a) token-expressible → move value into emitter/panels (b) component-specific → into its component file (c) dead → delete. Record each decision in `/docs/overrides-ledger.md`.
*AC:* file deleted; ledger complete; no visual regressions on Dawn-native templates.
*Test:* baseline screenshot diff across **all** templates (this file touched Dawn pages); token-audit `!important` count strictly decreases to documented floor.

**W1.T14 · Retire `.gs-scope`** — M · Deps T12, T13, T03
With tokens global and Dawn pages token-aware, remove the scope wrapper: selectors de-scoped per file with stylelint-enforced max specificity; isolation responsibility moves to the token system + audit CI.
*AC:* `grep -r "gs-scope"` → 0; Dawn-native templates pixel-stable.
*Test:* full-template screenshot matrix (the critical regression gate for this task); axe scan unchanged; one deliberate token change (`--ct-action`) propagates to BOTH gs sections and Dawn buttons (proves unification).

### W1.E5 — De-branding & preset system

**W1.T15 · Brand/IP purge** — M · Deps W0.T04 · **Legal-priority**
`gs-brandmark` → header/footer use logo settings only; `gs-press-logo` inline third-party SVGs **removed**, brand-strip becomes image+text blocks (G-01); niche seed content (15 stake specs, garden copy) replaced with neutral commerce seeds; remaining literals → locales.
*AC:* `grep -riE "pollinook|wired|bbc|usatoday|gma|good morning" sections snippets assets` → 0; brand-strip preset shows 5 neutral image placeholders.
*Test:* fresh-install simulation (default `settings_data`): every template renders sensible neutral content; locale switch (any non-EN file) shows no orphan English UI strings in gs sections.

**W1.T16 · Preset & sync system** — S · Deps T02, T15
Ship presets in `settings_data.json` `presets` map: **"Studio Neutral"** (new default), **"Terracotta"** (current Petalform values), **"Forge"** (DS palette: orange/ink/steel + lift shadows — DS encoded as data, proving G-01). Add `qa/settings-sync.mjs` verifying schema-default ↔ current-data agreement for brand keys (TG §3.4 footgun).
*Test:* switch preset in editor → full repaint matches each spec swatch table; sync script fails when a default is edited without data update (simulate), passes after fix.

### W1.E6 — Override pattern & CI

**W1.T17 · `schema-color-scheme+overrides` partial (L4)** — M · Deps T03
Scheme select + "enable custom background/text/accent" toggles → inline token re-declares on the shell; reference-implement on `gs-reviews` + `image-banner`.
*Test:* per section: scheme flip repaints card/text; custom toggle beats scheme; removing override returns to scheme (no stale inline residue after editor change — section reload verified); nested block-level override beats section-level.

**W1.T18 · CI hardening** — S · Deps T01, T16, W0.T05
GitHub workflow gains: token-audit (fail-on-new), settings-sync, `theme-check`, Lighthouse budgets (mobile PDP: Perf ≥ 85, LCP ≤ 2.5 s, CLS ≤ 0.05, CSS ≤ 110 KB/template, JS ≤ 90 KB), CRLF guard, screenshot-baseline upload artifact.
*Test:* seeded violations for each guard fail the pipeline with actionable messages; clean branch passes < 5 min.

**W1 exit review checklist:** all E1–E6 ACs green · GA scorecard FR-GS row re-scored (target ≥ 80%) · `/docs/section-authoring.md` + token reference published · demo video: one preset switch + one scheme flip + one padding edit.

---

## 6½. W2 — Shared Primitives (unlocks everything downstream)

| ID | Task (deliverable) | Acceptance criteria | Test spec (beyond DoD) | Size | Trace |
|---|---|---|---|---|---|
| W2.T01 | **Dynamic price-token formatter** — `snippets/price-tokens.liquid` (server) + `assets/price-tokens.js` (live updates): resolves `[quantity] [price] [compare_price] [price_each] [compare_price_each] [amount_saved] [amount_saved_rounded]` in any text setting, money-formatted, multi-currency | All 7 tokens resolve server-side; JS re-resolves on `variant:change`/qty change via pubsub; unknown tokens pass through untouched | Unit table (qty 1/2/3 × with/without compare-at × 2 currencies) rendered in styleguide section and asserted; switch market currency → values reformat; XSS probe: token text with `<script>` renders escaped | M | FR-X-01, GAP-10 gate |
| W2.T02 | **Upsell card snippet** `snippets/upsell-card.liquid` + `component-upsell-card.css` + add-to-cart via extended product-form | Params: product, layout, show-variant/qty, source(manual/recs); emits price w/ compare; adds correct variant/qty through Dawn pipeline | Add from card updates cart (drawer + page) without reload; sold-out variant disables button w/ locale label; card a11y: one tab stop per control, image alt from product | M | FR-X-04, GAP-13 |
| W2.T03 | **Star-rating pair** `rating-stars` + `trustpilot-style-stars` snippets (manual values; optional metafield bind per G-04) | Half-star support; size/color via tokens; link-to-anchor option | Visual: 0/2.5/4.7/5 render correctly; screen reader announces "4.7 out of 5"; G-05: default preset shows label "★ rating" placeholder styling, not a fake number | S | FR-X-05, FR-PDP-11/12 |
| W2.T04 | **`<copy-button>` element** | Copies payload, "copied" state ≥1.5 s, fallback for insecure context | Click/Enter/Space copy verified; `aria-live` announce; clipboard-denied path shows tooltip fallback | S | FR-X-02 |
| W2.T05 | **`<countdown-timer>` element** (modes: fixed-date, daily-reset, per-session evergreen w/ honest labeling) | Emits parts via slots; expiry behavior setting (hide/zero/restart); SSR-safe placeholder prevents CLS | Timezone matrix (UTC±) for daily mode; reduced-motion: no tick animation; reload mid-session keeps evergreen remainder | S | FR-X-03, FR-CART-06 |
| W2.T06 | **Reveal engine v2** consuming W1.T08 tokens (stagger via `--animation-order`, repeat option) | Replaces ad-hoc `.rv`; honors RM; editor-safe re-init | Stagger order matches DOM; repeat toggles re-trigger on re-entry; no layout shift from initial transform (opacity/transform only) | S | FR-GS-04 |
| W2.T07 | **Slider decision + wrapper** — extend Dawn `slider-component` with loop/peek/autoplay/per-breakpoint widths *(chosen over Splide — see D-02)* behind `<ct-carousel>` wrapper consuming W1.T07e chrome tokens | API covers all GA-listed consumers (reviews, related, image-slider, upsells…) | Keyboard: arrows + focus order; swipe on touch; autoplay pauses on hover/focus/RM; per-breakpoint slide widths asserted at 360/768/1280 | L | GAP-05 |
| W2.T08 | **Icon system** — curated inline-SVG set (~60 commerce icons) via `snippets/icon.liquid` name param + image-upload fallback in icon-bearing blocks | Replaces ad-hoc SVGs incl. trust-marquee mapping; `aria-hidden` default, label opt-in | Render-all gallery in styleguide; unknown name → safe empty + theme-check note; fill inherits `currentColor` (token-recolorable) | M | FR-X-06 |
| W2.T09 | **Toast service** unification (single `aria-live` host, queueing) | All add-to-cart paths reuse it | Rapid double-add queues not overlaps; SR announces each; auto-dismiss timer pauses on hover | S | DS §5 |

## W3 — PDP Block Library (FR-PDP / GAP-10…18)

Authoring rule for every block task: implement as **snippet + schema fragment**, register in `main-product` AND `featured-product` (BRD R-03), padding/margin group included, preset-safe defaults.

| ID | Task | Acceptance criteria (functional core) | Test spec highlights | Size | Trace |
|---|---|---|---|---|---|
| W3.T01 | **Quantity Breaks** inside `quantity_selector` (tier engine generalizing `gs-product-buy`): ≤4 tiers, 3 layouts (normal/compact/vertical-images), badge style+scheme, benefit text, compare-basis per tier, selected indicator, **per-unit variant selectors** incl. single-qty, live price via W2.T01 | Selecting tier N adds N lines (or qty N) correctly incl. mixed variants; tokens resolve in every text field; stepper mode untouched when disabled | Cart-content assertions for: 1-tier default, 3×same-variant, 2×different-variants, sold-out variant inside tier (blocked w/ message); automatic-discount tutorial note visible in editor (NFR-06); CLS = 0 on tier switch; keyboard radio-group semantics | **XL** | FR-PDP-20 |
| W3.T02 | **Sticky ATC block** (generalize gs-sticky-atc): desktop/mobile show-matrix (image/title/stars/price/sale-badge/variant-picker/full-width/price-in-button/transparent), button function (ATC/buy-now/scroll) | Appears when buy-box CTA exits viewport; variant select syncs main form bidirectionally | IO trigger at 3 scroll speeds; bottom-padding clearance (no footer overlap, DS rule); mobile 360px: bar ≤ 2 rows, tap targets ≥44px; buy-now routes to checkout with correct variant | M | FR-PDP-29 |
| W3.T03 | **Bundle offer block** (evolve `addon`): main + ≤2 products, per-product variant/qty, combined price w/ tokens, single multi-add CTA | One click adds all lines; partial-availability handling (skip-with-notice vs block, setting) | Cart math vs displayed totals identity; discount-stacking caveat copy present; remove-one-then-re-add idempotent | L | FR-PDP-21 |
| W3.T04 | **Gifts on quantity** | Threshold ladder UI; auto-add/remove gift line via cart events; locked/unlocked states | Crossing threshold up/down adds/removes exactly one gift; gift line is price-0 only via merchant discount (G-05 messaging); drawer + page parity | M | FR-PDP-22 |
| W3.T05 | **Product upsells block** (hosts W2.T02 card; manual/recommendation sources, exclude-in-cart) | Multi-instance; layout list/slider via `<ct-carousel>` | Recommendation source renders ≤ set count; in-cart exclusion live-updates after add | M | FR-PDP-23 |
| W3.T06 | **Estimated shipping + Shipping checkpoints** pair (shared date engine: processing, transit min/max, cutoff w/ tz, excluded weekdays, locale dates) | Dates correct across month/locale boundaries; checkpoints render 3-step timeline | Date matrix: Fri-after-cutoff, weekend-excluded, month-end, non-EN locale format; SR reads timeline as list | M | FR-PDP-25/26 |
| W3.T07 | **Trust set** (7 small blocks): payment badges (auto wallets + uploads), urgency (evolve `scarcity`), benefits checklist (rename done), text-with-icon, icon-with-text grid, divider, link-button | Each ≤ 1 day, token-skinned, multi-instance where Shrine allows | Per block: add via editor, all settings live-update, RTL render, axe clean | M(set) | FR-PDP-14…19,30 |
| W3.T08 | **Clickable discount + Sizing chart + Custom product fields** | Copy-code card (W2.T04); size-guide modal (page/image/table src, per-product metafield override per G-04); line-item property fields w/ required validation | Discount copies & survives reload; modal focus-trap + ESC; required field blocks ATC with inline error; properties appear on cart line & order (dev order test) | L | FR-PDP-24/27/28 |
| W3.T09 | **Reviews showcase block** + upgraded price/variant-picker/buy-buttons/collapsible (savings line, swatch dictionary consumption, price-in-button, icon library) | Dawn-block superset: defaults identical to Dawn when new settings untouched | Dawn-parity regression (settings off → pixel-match Dawn baseline); swatch dictionary parse edge: bad line ignored w/ theme-check note | L | FR-PDP-02/04/06/08/13 |
| W3.T10 | **Media gallery §8.6** (mobile slide-width/scroll-padding, video autoplay group, trust-badge image slot, hide-variant-media) + **featured-product mirror** registration of all blocks | featured-product hosts the full library on any page incl. homepage | Variant switch filters media; trust badge slot renders under gallery; add featured-product to index via editor and run W3.T01/T02 smoke there | L | §8.6, FR-PA-01 |

## W4 — Cart System (GAP-20…24)

| ID | Task | Acceptance criteria | Test spec highlights | Size | Trace |
|---|---|---|---|---|---|
| W4.T01 | **Drawer blockification** — rebuild `cart-drawer` section as block host (items/subtotals/checkout as default blocks) + **test-mode** setting + width & header/body/footer scheme overrides | Stock behavior preserved with default blocks; blocks reorderable | Editor: reorder blocks live; test-mode keeps drawer open during edits and is editor-only (`request.design_mode`) — never on storefront | L | FR-CART-01/02/03/13 |
| W4.T02 | Free-shipping **progress bar** + multi-tier **checkpoints bar** (≤3 milestones, icon, reached state, optional gift link to W4.T04) | Threshold math from settings incl. multi-currency note; states empty/partial/achieved | Cart 0→cross threshold via add: bar animates, copy switches, `aria-live` polite announce; currency switch recalcs; CLS 0 | M | FR-CART-04/05 |
| W4.T03 | Drawer **upsells** (W2.T02 host w/ exclude-in-cart, recommendations) + **trust blocks** (text-with-icon / icons / image / badges / custom-liquid) | Upsell add updates drawer in place (section rendering API) | Add-from-drawer: no full reload, focus stays in drawer; exclusion removes just-added product from rail | M | FR-CART-07/12 |
| W4.T04 | **Conditional gift engine** (value or item trigger, auto add/remove, one-per-cart, locked display) | Idempotent under rapid cart changes; survives qty edits | Threshold oscillation test (add/remove around limit ×5) → exactly 0/1 gift; gift not removable into negative; works from both drawer & cart page | L | FR-CART-08 |
| W4.T05 | **Discount field** (cart-AJAX apply, chips, errors) for drawer + `main-cart-footer` block; **TnC checkbox** gate; **countdown** block (W2.T05) | Invalid code error inline; TnC blocks checkout incl. dynamic buttons | Apply/remove code reflects totals; checkout click w/o consent → focus to checkbox + error; timer expiry behavior per setting | M | FR-CART-06/09/10 |
| W4.T06 | Cart-page parity pass + savings line + note block | Page offers drawer-equivalent blocks where sensible | Drawer↔page feature matrix executed; deep-link `/cart` flows | S | FR-CART-02/11 |

## W5 — Section Library (GAP-30…36, 41)

Grouped tasks; every section uses §3.5 conventions + W1 partials. Per-section standard test: preset drag-in renders complete · all settings live · 6-viewport matrix · axe clean · RTL sanity.

| ID | Group | Sections (build/upgrade) | Extra test focus | Size | Trace |
|---|---|---|---|---|---|
| W5.T01 | Social proof upgrades | testimonials (←gs-reviews), logo-list (←gs-brand-strip, image-only), results, FB-style testimonials, Trustpilot-style wall | G-05: seeded ratings clearly placeholder; carousel keyboard ops | L | FR-SP-01…05 |
| W5.T02 | Tickers & bars | horizontal-ticker (←gs-trust-marquee w/ text/image/review items, fill+watchdog from DS §5 — RM default honored, override setting), vertical-ticker, announcement-bar blocks (discount-copy via W2.T04, socials) | Marquee fill on ultrawide (no gaps @1920); watchdog kicks in with animations suppressed; RM disables unless merchant opt-out | M | FR-AN-01/02/03 |
| W5.T03 | Comparison & tabs | comparison-table (←gs-comparison: us-vs-them columns, icon set, highlight), before/after slider, content-tabs, pricing-table | Slider: pointer+keyboard handle, labels; table mobile collapse mode | L | FR-SEC-26/27/28/29 |
| W5.T04 | Hotspots & heroes | shoppable-image, product-features, image/video-slider (←gs-video-gallery), slideshow-hero, parallax-hero | Hotspot keyboard reachability + popover focus return; parallax off under RM | L | FR-SEC-21…25 |
| W5.T05 | Builders & structure | custom-columns (14 block types), icon-bar (←gs-feature-blocks), icons-with-content, multicolumn/multirow/rich-text/image-banner/image-with-text upgrades (stars/ATC blocks), section-divider, sections-group | Dawn-parity regression with new settings off; ATC-in-banner adds correct variant | XL | FR-SEC-01…05,20,30…33 |
| W5.T06 | Forms & misc | contact-form builder blocks, email-signup upgrades (←gs-email-signup), FAQ upgrade (icon library), collection/featured-collection upgrades w/ quick-add, bundle-deals section, track-order (17TRACK opt-in), colors-changer, `page.faq/contact/track-order` templates | Quick-add variant popup flow; 17TRACK loads only when configured (G-04/NFR-05) | L | FR-SEC-06…16,35,36, FR-PA-03 |

## W6 — Navigation, Overlays, Hardening

| ID | Task | Test focus | Size | Trace |
|---|---|---|---|---|
| W6.T01 | Header Shrine deltas on restored Dawn header: sticky types, logo positions, active-link highlight, mobile secondary menu/title/scheme | Sticky×4 modes scroll matrix; drawer focus trap | M | FR-HD-01…06 |
| W6.T02 | **Commerce mega-menu** (collection products/child images, desktop/mobile toggles) | Large menu perf (≤1 extra request via section rendering); keyboard + ESC | M | FR-HD-04/GAP-38 |
| W6.T03 | Overlays: promo-popup (delay/frequency/email-or-code), scroll-to-top, music players (opt-in) | Popup frequency-cap via localStorage honest reset; never in design-mode unless test-mode | M | FR-GL-03/04/05 |
| W6.T04 | Security panel (copy-protect **default OFF** + country notice — client-side disclaimer per GA risk) | A11y audit with copy-protect ON documents impact; setting copy states limitation | S | FR-GS-15 |
| W6.T05 | RTL stylesheet + logical-properties sweep; locale completeness audit | `dir=rtl` 6-viewport matrix on top 8 sections; missing-key report = 0 | M | FR-X-09 |
| W6.T06 | Hardening: a11y full pass (axe + manual SR script), perf budget tightening, CLS audit (sticky/ticker/badge reservations), docs & styleguide finalization, GA scorecard re-run (target ≥ 95% overall) | Release-candidate checklist (§7.7) fully green | L | NFR-01…08 |

---

## 7. Testing Strategy & Infrastructure

A no-build Liquid theme can't lean on unit frameworks, so quality lives in **layered automated guards + scripted manual QA**. The pyramid:

```
            Manual exploratory (release candidates only)
         Scripted manual QA (per task: §7.4 editor script + §7.5 matrix)
      Browser probes (qa/probe.mjs: overflow, CLS, computed-style crawls)
   Lighthouse CI budgets (per template, mobile+desktop)
Static guards (theme-check · token-audit · settings-sync · CRLF · stylelint specificity)
```

### 7.1 Static guards (every push — built in W1.T01/T16/T18)

| Guard | Fails when |
|---|---|
| `shopify theme check` | Any Liquid/schema error or new warning class |
| `qa/token-audit.mjs` | New hex/rgb literal, px font-size/padding outside token files, new `--gs-` consumer, new `!important` |
| `qa/settings-sync.mjs` | Brand-key default in `settings_schema.json` ≠ `settings_data.json` |
| CRLF guard | Any `\r` in repo |
| stylelint | Selector specificity > 0-2-0, ID selectors, vendor-prefix without supports note |

### 7.2 Lighthouse CI budgets (mobile unless noted)

| Template | Perf | LCP | CLS | CSS KB | JS KB |
|---|---|---|---|---|---|
| Product (default) | ≥ 85 | ≤ 2.5 s | ≤ 0.05 | ≤ 110 | ≤ 90 |
| Home (demo preset) | ≥ 85 | ≤ 2.5 s | ≤ 0.05 | ≤ 120 | ≤ 90 |
| Collection / Cart | ≥ 90 | ≤ 2.0 s | ≤ 0.05 | ≤ 90 | ≤ 70 |

Budgets ratchet **down** only (any increase needs a ledger entry in the PR).

### 7.3 Browser probes (`qa/probe.mjs`, Playwright, run nightly + on release branches)

- **Overflow probe:** every template at 360 px asserts `scrollWidth === innerWidth`.
- **Type floor crawl:** computed `font-size ≥ 16px` for paragraph-class nodes.
- **Token propagation test:** set `--ct-action` on `:root` → sample button/price/star nodes report the new color (proves the pyramid end-to-end after W1.T14).
- **CLS reservation checks:** sticky-ATC mount, marquee init, countdown mount produce 0 layout-shift entries (PerformanceObserver).
- **Idempotency:** dispatch `shopify:section:load` twice on each section → listener count stable (counter shim).

### 7.4 Theme-Editor QA script (run per section/block task — the "drag/drop" guarantee, G-02/03/08)

1. Fresh dev store, default preset → add the section from the picker. **Expect:** complete neutral preview, no console errors.
2. Edit every setting once (sweep) → live update without reload artifacts.
3. Add max blocks, reorder, delete middle block → order/state correct.
4. Duplicate the section → independent settings.
5. Switch color scheme + one L4 override → repaint correct; remove override → reverts.
6. Undo ×3 / redo ×3 in editor → state consistent.
7. Save, reload editor, hard-refresh storefront → parity.
8. Mobile preview toggle → padding/breakpoint behavior matches §3.5 settings.
9. (Commerce blocks) run the block's functional cases against a seeded test product (multi-variant, one sold-out variant, with & without compare-at — G-05 path).
10. Remove section → no orphan CSS/JS errors on page.

### 7.5 Manual viewport & a11y matrix (per task where UI changes)

- **Viewports:** 360 · 390 · 768 · 1024 · 1280 · 1920 (union of DS §11 and current QA).
- **A11y per component:** keyboard-only operation · visible `--ct-ring` focus · SR pass (NVDA or VoiceOver script) for dynamic regions (`aria-live` on toast/progress/timer) · `prefers-reduced-motion` emulation · axe-core scan = 0 serious/critical.
- **RTL spot-set** (post-W6.T05): header, PDP buy-box, drawer, ticker, reviews.

### 7.6 Definition of Done (inherited by every task)

1. AC met · 2. Static guards green · 3. Editor QA script §7.4 executed (record in PR) · 4. Relevant probe set green · 5. Budgets respected · 6. New strings in locales (G-09) · 7. Docs touched (`section-authoring.md` / token reference / overrides-ledger) · 8. Screenshot baseline updated intentionally (diff attached) · 9. No new `TODO` without ticket · 10. Trace IDs (FR/GAP/CF/G) listed in PR description.

### 7.7 Release-candidate checklist (end of W6)

Full §7.4 across all sections · all templates × 6 viewports × {light-lock ON/OFF} · preset switch ×3 clean · Dawn-parity regression suite (settings-off pixel match on upgraded Dawn sections) · GA scorecard re-run ≥ 95% · fresh-store install from zip (forward-slash entries — TG §10 Windows packaging rule) renders demo preset correctly.

---

## 8. Decision Log & Risks

| ID | Decision / Risk | Resolution / Mitigation |
|---|---|---|
| D-01 | **Namespace:** keep `--ct-*` + `gs-`/`ct-` file prefixes? | **Keep `--ct-`** as the only token namespace (84 tokens already; zero-churn). Retire `--gs-` aliases (W1.T04→T10). File prefix for new shared code: `ct-`/none per Dawn convention; existing `gs-` section files keep names until their W5 rebuild renames them (template-key migration noted per rename). |
| D-02 | **Slider:** Splide (Shrine's choice) vs extend Dawn | **Extend Dawn `slider-component`** (W2.T07): keeps zero-dependency posture (CS-06, NFR-05), avoids 30 KB lib; revisit only if loop+peek complexity exceeds budget in implementation — fallback is Splide MIT with tokens mapped to W1.T07e. |
| D-03 | `.gs-scope` retirement risk: Dawn-page visual drift when tokens go global | Gate = W1.T14's full-template screenshot matrix; tokens designed additive (Dawn vars untouched at L0); rollback = re-wrap, since split files (T12) keep prefixes until T14. |
| D-04 | Light-lock **default ON or OFF** for a generic theme | Ship **ON** (matches current behavior & DS §8) but implemented scheme-compatible (W1.T03); product owner may flip default before release — single setting, no code change. |
| D-05 | Marquee vs `prefers-reduced-motion` (DS keeps it moving) | Generic theme **honors RM by default**; DS behavior available as explicit setting "Keep tickers moving under reduced motion" (default off) — merchant owns the choice (G-10). |
| D-06 | Press logos legal exposure | Resolved by W1.T15: image-upload only; demo preset uses neutral placeholder marks. |
| D-07 | Quantity-breaks ↔ automatic-discount mismatch (NFR-06) | Editor `paragraph` warnings + docs page + W3.T01 test asserting display==cart math pre-discount; never synthesize prices. |
| D-08 | Two PDP templates (default + landing) drift | `product.landing.json` consumes the same blocks/snippets post-W3.T10; funnel-only sections live in W5 library — no duplicated logic. |
| D-09 | Settings sprawl harming editor UX (Shrine has 100-setting blocks) | Convention: header-grouped settings, progressive disclosure (checkbox-gated groups), defaults that look right untouched; UX review checkpoint at end of W3.T01 (the densest block). |

---

## Appendix A — Key token migrations (old → new)

| Current | Becomes | Layer |
|---|---|---|
| `--ct-accent` / `--ct-accent-strong` | `--ct-action` / `--ct-action-hover` (aliases 1 release) | L2 |
| `--gs-green/-d/-gold/-sale/-ink/-muted/-line/-bg/-soft/-teal` | corresponding `--ct-*` L2 names (shim → deleted) | L2 |
| `--gs-wrap-width:1160px` | `--page-width` (+ `--ct-wrap-narrow` option) | L1 |
| `--gs-section-pad-y:60px` | `--ct-pad-tight/loud` + per-section `--section-pad-*` (L4) | L1/L4 |
| `--gs-marquee-duration` | `--ct-marquee-duration` (per-section inline stays) | L3/L4 |
| body `!important` light pin | Accessibility panel light-lock (scheme-aware) | L0/L2 |
| TG §3.2 commerce tokens | unchanged names, formalized as L2 | L2 |

## Appendix B — Generic-theme content rules quick checklist (apply to every PR)

No brand strings/assets (G-01) · all copy via schema/locales (G-02/09) · preset present & neutral (G-03) · metafield reads have settings fallback + info note (G-04) · no fabricated prices/ratings/urgency defaults (G-05) · token-only styling (G-06) · commerce via Dawn pipeline (G-07) · editor-safe init + test-mode where overlaying (G-08) · RM honored, focus ring, budgets (G-10).

---

*End of document. Grounded against: Petalform-Codex-V1 source (verified June 12 2026: 84 `--ct-*` tokens · 0 hex in component CSS · 13/13 section presets · light-lock `!important` conflict confirmed), Technical-Guide.md, gainssteel-design-system-v2.md, Dawn 15.4.1, Shrine PRO 1.2.3 schemas.*
