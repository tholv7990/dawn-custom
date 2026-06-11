# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is a fork of [Shopify Dawn](https://github.com/Shopify/dawn), Shopify's reference Online Store 2.0 theme. There is **no build step, no bundler, and no `package.json`** — files in `assets/` are served as-is. HTML is rendered server-side with Liquid; JavaScript is added only as progressive enhancement.

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

## Design rule — follow the reference 100%, never add extras

The CozyClaw design files in `files/` are the **single source of visual truth**:

- `files/cozyclaw-design-system.md` — tokens + component library + compliance
- `files/cozyclaw-landing.html` — landing/homepage reference (CozyClaw is a single-product store, so the homepage `templates/index.json` mirrors this design — not a separate merchandising layout)
- `files/cozyclaw-pdp.html` — product page reference
- `files/cozyclaw-landing-spec.md` + `files/cozyclaw-pdp-spec.md` — written specs that win over the HTML when they conflict

**Hard rules:**

1. **Never add sections that aren't in the reference design.** No "best sellers" rail, no FAQ accordion, no stats grid, no compare table, no before/after, no newsletter signup on the homepage unless the reference HTML has them. If the design doesn't show it, it doesn't ship.
2. **Section order matches the reference top-to-bottom.** When porting a reference page to a JSON template, the `"order": [...]` array reproduces the reference section sequence exactly.
3. **Copy comes from the reference.** Headings, eyebrows, body text, button labels — match the reference HTML verbatim unless the spec file overrides them. Don't invent new marketing copy.
4. **When in doubt, audit.** Before adding any section to a template, find it in the reference HTML. If it's not there, ask before adding.
5. **Visual properties (colors, fonts, spacing) come from `--ct-*` tokens.** The tokens live in `snippets/css-variables.liquid` and are read from `settings.color_accent` / `settings.color_accent_hover` / `settings.border_radius`. Both `config/settings_schema.json` defaults AND `config/settings_data.json` saved values must agree with the brand — Shopify hands the schema default to Liquid as a populated value, so `{{ settings.x | default: 'fallback' }}` does NOT fire if the schema default is stale. **Both files must be kept in sync** when the brand changes.

Past failure that drove this rule: an earlier session built the homepage as a Minimals-style merchandising layout (best-sellers + stats + compare + BA + FAQ + email) that bore no resemblance to the CozyClaw landing reference — and the brand-swap was incomplete because the `settings_schema.json` `color_accent` default still said `#00A76F` (Minimals green) while `css-variables.liquid` carried a `| default: '#6D3FC4'` filter that never fired. The whole storefront rendered green CTAs over a lavender canvas. Don't repeat either mistake.

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

## Commands

All development goes through the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) (run from the theme root):

```sh
shopify theme dev      # local dev server with hot reload against a dev store (alias: serve)
shopify theme check    # lint Liquid/templates (Theme Check) — this is the only "test"
shopify theme push     # upload theme to a store
shopify theme pull      # download theme from a store
```

There is no unit-test suite. CI (`.github/workflows/ci.yml`) runs **Theme Check** and **Lighthouse** (performance budgets) on every push — match those locally before pushing. Theme Check config lives in `.theme-check.yml` (`MatchingTranslations` and `TemplateLength` are intentionally disabled).

**Theme zip packaging.** On Windows, do **not** use `Compress-Archive` for the final Shopify upload zip; it can write backslash entry paths such as `layout\theme.liquid`, which Shopify rejects as "missing template layout/theme.liquid". Build the archive with explicit forward-slash relative entry names and verify the raw entry list contains `layout/theme.liquid` exactly and contains no `\` path separators before handing off the zip.

Formatting is Prettier (`.prettierrc.json`): `printWidth: 120`, single quotes in JS, **double quotes in `.liquid`**. Liquid files are formatted/linted by the Shopify Theme Check VS Code extension on save; JS by Prettier on save.

## Architecture

Standard Shopify theme layout — the big picture that spans files:

- **`templates/*.json`** — Online Store 2.0 JSON templates. They don't contain markup; they list which **sections** render and in what order, plus per-section settings. `templates/customers/` holds account pages.
- **`sections/*.liquid`** — the composable rendering units. Each ends with a `{% schema %}` JSON block defining its merchant-editable settings and `blocks`. `*-group.json` files (`header-group`, `footer-group`) are section groups shared across templates.
- **`snippets/*.liquid`** — reusable partials included via `{% render 'name' %}`.
- **`assets/`** — flat folder of all CSS, JS, SVG icons, and images. No subfolders, no bundling.
- **`config/`** — `settings_schema.json` (theme editor global settings) and `settings_data.json` (their saved values). **`locales/`** — translations; `*.schema.json` files translate the theme-editor UI, plain `*.json` translate storefront strings. `en.default.json` is the source of truth.

### JavaScript model

JS is written as **native Web Components (custom elements)** — no framework. Every component file follows this guard pattern so re-injected sections don't double-define:

```js
if (!customElements.get('product-info')) {
  customElements.define('product-info', class ProductInfo extends HTMLElement { ... });
}
```

Three scripts load globally in `layout/theme.liquid` and are available everywhere: **`constants.js`** (e.g. `PUB_SUB_EVENTS`, debounce timer), **`pubsub.js`** (`subscribe`/`publish`), and **`global.js`** (shared helpers: `trapFocus`, `HTMLUpdateUtility`, `SectionId`, etc.). Component scripts (`cart.js`, `product-form.js`, `product-info.js`, `facets.js`, …) are loaded by the sections/snippets that use them.

- **Cross-component communication** uses the pub/sub system: `subscribe(PUB_SUB_EVENTS.variantChange, cb)` and `publish(...)`. Always store the returned unsubscribe function and call it in `disconnectedCallback`. Add new event names to `PUB_SUB_EVENTS` in `constants.js`, never use raw strings.
- **Partial page updates** use the [Section Rendering API](https://shopify.dev/docs/api/ajax/section-rendering) (fetch `?section_id=...` or `sections=...`) to re-render server HTML, then swap nodes via `HTMLUpdateUtility` — used by cart, facet filtering, predictive search, and product variant changes. There is no client-side templating.

### CSS model

`assets/base.css` holds global styles. Everything else is split into `component-*.css` and `section-*.css` files that are loaded **per-section** via `{{ 'file.css' | asset_url | stylesheet_tag }}` inside the section that needs them (see `sections/featured-product.liquid` for the pattern) — only the CSS a rendered page uses gets sent. Theming is driven by **color schemes**: CSS custom properties (`--color-background`, `--color-foreground`, …) are generated from settings in the `{% style %}` block of `theme.liquid` and applied via `.color-{scheme.id}` classes.

## Code principles (from `.github/CONTRIBUTING.md`)

These are enforced in review and shape what code is acceptable:

- **Web-native, no dependencies.** No frameworks, libraries, or polyfills. Use modern browser APIs directly; support older browsers through progressive enhancement, not shims.
- **Server-rendered.** Business logic, translations, and money formatting belong in Liquid on the server, not in JS. Async/on-demand rendering is used sparingly as enhancement.
- **Lean and fast.** Targets: zero Cumulative Layout Shift, no DOM manipulation before user input, no render-blocking JS, no long tasks. Features default to "no" unless they meet this bar.
- **Functional, not pixel-perfect.** Semantic markup + progressive enhancement; pages must stay functional (fail-open) even when JS or newer CSS isn't available.

## Staying in sync with upstream Dawn

This is a customizable fork. To pull upstream changes, add Shopify's repo as a remote and merge:

```sh
git remote add upstream https://github.com/Shopify/dawn.git
git fetch upstream && git pull upstream main
```
