# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

This is a fork of [Shopify Dawn](https://github.com/Shopify/dawn), Shopify's reference Online Store 2.0 theme. There is **no build step, no bundler, and no `package.json`** — files in `assets/` are served as-is. HTML is rendered server-side with Liquid; JavaScript is added only as progressive enhancement.

## Commands

All development goes through the [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) (run from the theme root):

```sh
shopify theme dev      # local dev server with hot reload against a dev store (alias: serve)
shopify theme check    # lint Liquid/templates (Theme Check) — this is the only "test"
shopify theme push     # upload theme to a store
shopify theme pull      # download theme from a store
```

There is no unit-test suite. CI (`.github/workflows/ci.yml`) runs **Theme Check** and **Lighthouse** (performance budgets) on every push — match those locally before pushing. Theme Check config lives in `.theme-check.yml` (`MatchingTranslations` and `TemplateLength` are intentionally disabled).

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
