# Technical Guide

This theme is a stable Dawn fork with a separated custom layer. The active
storefront now starts from neutral Dawn-style templates, while the custom section
library remains available for merchants or future builds through `ct-*` files.

## Current State

| Area | State |
| --- | --- |
| Base theme | Shopify Dawn, no build step, no package manager |
| Active homepage | `templates/index.json` uses starter `image-banner`, `rich-text`, and `featured-collection` sections with empty saved settings |
| Active product page | `templates/product.json` uses `main-product` and `related-products` with product-bound data |
| Active cart page | `templates/cart.json` uses `main-cart-items` and `main-cart-footer` with empty saved settings |
| Header/footer groups | Single `header` and `footer` sections with empty saved group settings |
| Custom namespace | Custom files use `ct-*`; some internal `.gs-*` CSS classes and `data-gs-*` hooks are retained for compatibility |
| QA entry point | `node qa/ct-qa.mjs` |
| Shopify lint | `shopify.cmd theme check` |

## File Boundaries

Custom work should stay in the `ct-*` layer:

- Sections: `sections/ct-*.liquid`
- Snippets: `snippets/ct-*.liquid`
- Assets: `assets/ct-*.js`, `assets/section-ct-*.css`
- QA helpers: `qa/ct-*.mjs`
- Docs: `docs/ct-*.md`

Dawn core files should only change when they are integration points that cannot
be wrapped cleanly. When they do change, keep the patch small and validate with
both CT QA and Theme Check.

## Active Defaults

Templates and groups are intentionally generic. They should not contain a
specific product, niche, collection handle, fake review count, fake discount,
warehouse location, warranty claim, phone number, or support email.

Active starter files:

- `templates/index.json`
- `templates/product.json`
- `templates/cart.json`
- `sections/header-group.json`
- `sections/footer-group.json`

Global brand settings are neutral:

- `color_accent`: `#111827`
- `color_accent_hover`: `#374151`
- cart reward thresholds: all reward threshold fields use `0` as disabled until the merchant configures real rules

Keep `config/settings_schema.json` and `config/settings_data.json` in sync for
watched settings. `qa/ct-settings-sync.mjs` guards that relationship.

## Custom Section Library

The custom section library is file-renamed to `ct-*` and merchant-facing schema
labels are neutral:

- `ct-announcement-bars`
- `ct-brand-strip`
- `ct-comparison`
- `ct-email-signup`
- `ct-faq`
- `ct-feature-blocks`
- `ct-product-buy`
- `ct-product-info`
- `ct-related-products`
- `ct-reviews`
- `ct-sticky-atc`
- `ct-trust-marquee`
- `ct-video-gallery`

These sections still use the existing `.gs-*` class names and `data-gs-*`
attributes internally. That is intentional for this migration step because it
keeps CSS and JS behavior stable while satisfying the custom-file prefix rule.

Shared snippets:

- `ct-section-padding`
- `ct-media-slot`
- `ct-brandmark`
- `ct-policy-link`

Shared assets:

- `assets/section-ct-base.css`, `assets/section-ct-components.css`, `assets/section-ct-responsive.css` (split from the former `section-ct-page.css`)
- `assets/ct-page.js`

`layout/theme.liquid` loads both shared custom assets globally. The code remains
vanilla CSS/JS with no dependencies.

## QA Guards

Run the full custom guard:

```sh
node qa/ct-qa.mjs
```

It runs:

- token audit
- settings sync
- brand/IP leakage audit
- niche seed-copy and fake-proof audit
- custom section schema audit
- CRLF baseline audit

Run Shopify Theme Check:

```sh
shopify.cmd theme check
```

Current expected status:

- CT QA passes
- Theme Check passes with no offenses
- CRLF baseline: 31,688 line endings across 86 files

## Packaging

Do not use PowerShell `Compress-Archive` for the Shopify upload zip. It can write
backslash paths such as `layout\theme.liquid`, which Shopify rejects. Build zips
with forward-slash entry names and verify the raw archive contains
`layout/theme.liquid` and no backslash entry paths.

## Next Migration Notes

- A future markup-level rename can convert internal `.gs-*` classes and
  `data-gs-*` hooks to `ct-*`, but it should be planned as a separate behavior
  regression task.
- Reference docs may still contain old project context for analysis. Storefront
  audits intentionally scan live theme code, not historical reference docs.
