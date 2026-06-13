# AGENTS.md

Guidance for AI coding agents (Codex, etc.) working in this repository. This
file mirrors `CLAUDE.md` (the canonical version) — if the two ever disagree,
`CLAUDE.md` wins. Keep both in sync when you change project rules.

## What this is

A fork of [Shopify Dawn](https://github.com/Shopify/dawn) (Online Store 2.0
reference theme) customized into the **CozyClaw** single-product store (a plush
pet sofa-bed). There is **no build step, no bundler, and no `package.json`** —
files in `assets/` are served as-is. HTML is rendered server-side with Liquid;
JavaScript is added only as progressive enhancement.

## Read first

Before implementing CozyClaw changes, read
`docs/cozyclaw-implementation-memory.md`. It captures prior decisions and bugs
around the homepage rebuild, PDP galleries, cart rewards bar, signup popup,
footer, structured data, encoding issues, Theme Check baseline, and zip
packaging. Treat it as the working memory for this project.

Before investigating or fixing any bug, especially when the user says
"fixing bug", "fix bug", "bug", "not running", or shows a broken UI screenshot,
read `.codex/skills/shopify-liquid-theme-bugfix/SKILL.md` first. Treat its
pre-fix checklist, render-path mapping, root-cause discipline, validation
matrix, and response template as mandatory for Shopify Liquid bugfix work.

## Agent operating mode

When the user gives an implementation task, keep working until the task is
complete and validated. Do not pause just to report progress, ask whether to
continue, or wait for confirmation between obvious next steps. Stop only when
user approval/access is required (for example Shopify login, network/download
approval, destructive git/file operations, or credentials), when a product or
design decision cannot be inferred safely from local context, or when a blocking
error repeats after reasonable investigation.

## Design rule — follow the reference 100%, never add extras

The CozyClaw design files in `files/` are the **single source of visual truth**:

- `files/cozyclaw-design-system.md` — tokens + component library + compliance
- `files/cozyclaw-landing.html` / `files/cozyclaw-homepage-spec.md` — homepage reference
- `files/cozyclaw-pdp.html` — product page reference
- `files/cozyclaw-landing-spec.md` + `files/cozyclaw-pdp-spec.md` — written specs that **win over the HTML** when they conflict

**Hard rules:**

1. **Never add sections that aren't in the reference design.** No "best sellers"
   rail, stats grid, compare table, FAQ, or newsletter signup unless the
   reference shows it. If the design doesn't show it, it doesn't ship.
2. **Section order matches the reference top-to-bottom.** A JSON template's
   `"order": [...]` array reproduces the reference section sequence exactly.
3. **Copy comes from the reference.** Headings, eyebrows, body, button labels —
   match the reference verbatim unless a spec file overrides. Don't invent copy.
4. **When in doubt, audit.** Before adding any section, find it in the reference.
   If it's not there, ask before adding.
5. **Visual properties (colors, fonts, spacing) come from `--ct-*` tokens.** They
   live in `snippets/css-variables.liquid`, read from `settings.color_accent` /
   `settings.color_accent_hover` / `settings.border_radius`. **Both**
   `config/settings_schema.json` defaults **and** `config/settings_data.json`
   saved values must agree with the brand — Shopify hands the schema default to
   Liquid as a populated value, so a `{{ settings.x | default: 'fallback' }}`
   filter does **not** fire when the schema default is stale. Hardcoded brand hex
   is forbidden except the documented commerce-signal colors (sale-red, rating-
   gold, success-green), `#fff` on accent buttons, and the logo SVGs.

> Past failure that drove this rule: an earlier session built the homepage as a
> Minimals-style merchandising layout that bore no resemblance to the CozyClaw
> reference, and a stale `color_accent` schema default (`#00A76F`) rendered green
> CTAs over a lavender canvas because a `| default: '#6D3FC4'` filter never fired.
> Don't repeat either mistake.

## New design port preflight

Before converting any new HTML design into Liquid, read the "New Design Port
Failure Modes" section in `docs/cozyclaw-implementation-memory.md`. The repeated
bugs are: stale JSON/customizer state rendering old sections, duplicate section
types forcing renames, Dawn or previous-design CSS winning the cascade,
Shopify's `#shopify-section-*` wrappers breaking standalone selectors, missing
schema defaults causing blank content, unscoped JS failing in the theme editor,
cropped media slots, fabricated demo content leaking into production, and
mojibake from copied reference text.

Treat those as implementation blockers, not cleanup notes. Update template JSON,
section schema defaults, `settings_schema.json`, and `settings_data.json`
together when a design changes. Scope CSS/JS to the section or design root, and
bind commerce data from Shopify objects instead of JSON strings.

## Product data, not hardcoded strings

Price, compare-at price, save %, availability, title, images, variants, and
rating must bind to the Liquid `product` object — never hardcode them as JSON
string settings. Editorial copy (taglines, button labels, trust-chip text,
anchor IDs) stays in section settings. Some legacy sections still carry
hardcoded `price_now` / `price_was` settings left blank — prefer the bound
`product` path when touching them.

## Commands

Everything goes through the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli)
from the theme root:

```sh
shopify theme dev      # local dev server, hot reload against a dev store (alias: serve)
shopify theme check    # lint Liquid/templates (Theme Check) — this is the only "test"
shopify theme push     # upload theme to a store
shopify theme pull     # download theme from a store
```

There is **no unit-test suite**. CI (`.github/workflows/ci.yml`) runs **Theme
Check** and **Lighthouse** performance budgets on every push — match those
locally before pushing. Theme Check config is in `.theme-check.yml`
(`MatchingTranslations` and `TemplateLength` intentionally disabled).

**Theme-check baseline.** Treat the current offense count as an invariant — do
not let it rise. Check after each change:

```sh
# unix / bash
shopify theme check 2>&1 | grep -E 'offenses|errors'
# windows / powershell
shopify theme check 2>&1 | Select-String "offenses","errors"
```

**Theme zip packaging.** On Windows, do **not** use `Compress-Archive` for the
final Shopify upload zip; it can write backslash entry paths such as
`layout\theme.liquid`, which Shopify rejects as "missing template
layout/theme.liquid". Build the archive with explicit forward-slash relative
entry names and verify the raw entry list contains `layout/theme.liquid` exactly
and contains no `\` path separators before handing off the zip.

**Dev server is interactive** (`shopify theme dev` prompts for a store password
and stays in the foreground) — start it once in its own terminal. Avoid batching
many file edits while its upload queue is mid-flight; it can lock files. Verify
live changes with curl, e.g. `curl -s http://127.0.0.1:9292/ | grep -oE "<pattern>"`.

**Formatting** is Prettier (`.prettierrc.json`): `printWidth: 120`, single quotes
in JS, **double quotes in `.liquid`**. Liquid is formatted/linted by the Shopify
Theme Check VS Code extension on save; JS by Prettier on save.

**Commits** use Conventional Commits with a scope, e.g. `feat(ct-hero):`,
`fix(pdp):`, `refactor(pdp-css):`, `chore(p7):`. Stage specific files — never
`git add -A` (risks dragging in unrelated WIP / the many untracked `.zip`s).

## Architecture

Standard Shopify theme layout:

- **`templates/*.json`** — Online Store 2.0 templates. No markup; they list which
  **sections** render, in what `order`, plus per-section settings.
  `templates/customers/` holds account pages.
- **`sections/*.liquid`** — composable rendering units, each ending in a
  `{% schema %}` JSON block defining merchant-editable settings and `blocks`.
  `*-group.json` (`header-group`, `footer-group`) are shared section groups.
- **`snippets/*.liquid`** — reusable partials included via `{% render 'name' %}`.
- **`assets/`** — flat folder of all CSS, JS, SVG, images. No subfolders, no bundling.
- **`config/`** — `settings_schema.json` (global theme-editor settings) +
  `settings_data.json` (their saved values). **`locales/`** — `*.schema.json`
  translate the theme-editor UI, plain `*.json` translate storefront strings;
  `en.default.json` is the source of truth.

### CozyClaw custom layer (`ct-*`)

The customization lives in a parallel set of `ct-*` files alongside stock Dawn:

- **Sections** (`sections/ct-*.liquid`): `ct-hero`, `ct-trust-bar`, `ct-pillars`,
  `ct-use-cases`, `ct-marquee`, `ct-announce`, `ct-reviews`, `ct-pricing`,
  `ct-aplus`, `ct-faq`, `ct-compare`, `ct-ba`, `ct-stats`, `ct-final-cta`,
  `ct-sticky-atc`, `ct-product-tabs`, `ct-problem-solution`, `ct-features-grid`,
  `ct-lifestyle`, `ct-size-color-guide`, `ct-signup-popup`, `ct-bundle-only-pdp`, …
- **Snippets** (`snippets/ct-*.liquid`): `ct-section-head`, `ct-section-padding`,
  `ct-trust-chips`, `ct-trust-icons`, `ct-add-to-cart`, `ct-bundle-options`,
  `ct-bundle-tiers`, `ct-addons`, `ct-breadcrumb`.
- **Per-section CSS** (`assets/section-ct-*.css`) and **per-feature JS**
  (`assets/ct-*.js`: reveal, swipe, carousel, tabs, accordion, ba, countup,
  scrollspy, sticky-atc, quickview, scarcity, back-to-top, reviews-rail, addons,
  bundle-tiers, signup-popup).

**Layout-variant pattern (important).** Sections shared across templates (PDP +
homepage) gain new looks via an **additive** `layout` / `style` / `display`
`select` setting whose **default reproduces the existing behavior**, plus a new
Liquid branch. This is how a section can render one way on the PDP and another on
the homepage without regressing other templates. Examples currently in use:
`ct-hero` → `split-photo`, `ct-pricing` → `tier-pair`, `ct-aplus` →
`materials-care` / `guarantee-4`, `ct-trust-bar` → `icon-strip`, `ct-pillars` →
`pillars-svg`, `ct-marquee` → `italic-divider`, `ct-announce` → `static-row`.
When adding a variant, never change the default branch's output.

**Templates of note:** `templates/index.json` (homepage — currently a 17-section
CozyClaw landing build), `templates/product.json` (main PDP),
`templates/product.bundle-only.json` (bundle-only PDP variant).

### JavaScript model

JS is written as **native Web Components (custom elements)** — no framework, no
dependencies, no polyfills. Every component file uses this guard so re-injected
sections don't double-define:

```js
if (!customElements.get('product-info')) {
  customElements.define('product-info', class ProductInfo extends HTMLElement { /* … */ });
}
```

Three scripts load globally in `layout/theme.liquid` and are available everywhere:
**`constants.js`** (`PUB_SUB_EVENTS`, debounce timer), **`pubsub.js`**
(`subscribe`/`publish`), **`global.js`** (`trapFocus`, `HTMLUpdateUtility`,
`SectionId`, …). Component scripts are loaded by the sections/snippets that use
them.

- **Cross-component communication** uses pub/sub:
  `subscribe(PUB_SUB_EVENTS.variantChange, cb)` / `publish(...)`. Store the
  returned unsubscribe and call it in `disconnectedCallback`. Add new event names
  to `PUB_SUB_EVENTS` in `constants.js` — never raw strings.
- **Partial page updates** use the
  [Section Rendering API](https://shopify.dev/docs/api/ajax/section-rendering)
  (`?section_id=…` / `sections=…`) to re-render server HTML, then swap nodes via
  `HTMLUpdateUtility`. No client-side templating.

### CSS model

`assets/base.css` holds global styles. Everything else is split into
`component-*.css` and `section-*.css`, loaded **per-section** via
`{{ 'file.css' | asset_url | stylesheet_tag }}` inside the section that needs it —
only the CSS a rendered page uses gets sent. Theming uses **color schemes**: CSS
custom properties (`--color-background`, `--color-foreground`, …) are generated in
the `{% style %}` block of `theme.liquid` and applied via `.color-{scheme.id}`
classes. CozyClaw brand tokens (`--ct-*`) come from
`snippets/css-variables.liquid` — every new color/space/shadow/radius must
reference one.

> CSS-cascade note: `ct-pdp.css` is loaded **after** Dawn's `main-product.css`, so
> PDP overrides win by load order — recent work removed `!important` hacks in
> favor of this. Don't reintroduce `!important` to win a fight the cascade already
> handles.

## Code principles (from `.github/CONTRIBUTING.md`)

- **Web-native, no dependencies.** No frameworks, libraries, or polyfills. Modern
  browser APIs directly; older browsers via progressive enhancement, not shims.
- **Server-rendered.** Business logic, translations, and money formatting belong
  in Liquid on the server, not JS. Async rendering is sparing enhancement.
- **Lean and fast.** Zero Cumulative Layout Shift, no DOM manipulation before user
  input, no render-blocking JS, no long tasks.
- **Functional, not pixel-perfect.** Semantic markup + progressive enhancement;
  pages stay functional (fail-open) even when JS or newer CSS isn't available.

## Staying in sync with upstream Dawn

```sh
git remote add upstream https://github.com/Shopify/dawn.git
git fetch upstream && git pull upstream main
```
