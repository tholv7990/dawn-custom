# CT Migration Guardrails

This project continues from the current stable source code. Dawn remains the reference baseline, but custom migration work must stay in a clearly separated `ct-` layer unless a core edit is explicitly approved.

## File Boundary

- Custom files use a `ct-` prefix.
- Dawn/core files are not edited for routine migration work.
- When a core integration point is unavoidable, prefer a `ct-` wrapper, parallel file, or custom workflow first.
- Core files that may require explicit approval include `layout/theme.liquid`, Dawn sections, Dawn snippets, `config/settings_schema.json`, `config/settings_data.json`, and locale files.

Token usage guidance lives in `docs/ct-token-reference.md`.

## Current Custom Guards

Run the full custom QA guard set:

```sh
node qa/ct-qa.mjs
```

Run the token guard:

```sh
node qa/ct-token-audit.mjs --ci
```

Run the settings sync guard:

```sh
node qa/ct-settings-sync.mjs
```

Run the brand leakage guard:

```sh
node qa/ct-brand-audit.mjs --ci
```

Run the niche seed-copy guard:

```sh
node qa/ct-content-audit.mjs --ci
```

This guard also blocks known fake proof/urgency defaults such as seeded rating counts, flash-sale badges, discount signup promises, fixed return windows, warranty claims, free-shipping thresholds, seeded cart reward thresholds, fake structured-data return windows, and fake warehouse locations.

Run the custom section schema guard:

```sh
node qa/ct-section-schema-audit.mjs
```

Run the CRLF guard:

```sh
node qa/ct-crlf-audit.mjs --ci
```

All six are wired into `.github/workflows/ct-qa.yml` through `qa/ct-qa.mjs`.

## Current Baselines

`ct-token-audit` records the current source truth in `qa/ct-token-audit-allowlist.json` and fails only when a future change adds new tracked findings.

Current tracked totals:

- `color-literal`: 14
- legacy GS token consumers: 0
- `important`: 42
- `px-spacing-type-literal`: 211

`ct-settings-sync` checks brand-sensitive saved settings against schema defaults, including the `ct_force_light_mode` safety switch. Current saved setting drift: none.

`settings_data.json` now carries named skin presets: `Default` (active/current storefront), `Studio Neutral`, `Terracotta`, and `Forge`. The active preset intentionally remains `Default` while migration continues so the stable storefront does not repaint without an explicit product decision.

`snippets/css-variables.liquid` includes the first scheme bridge: Dawn `color-*` wrappers re-declare CT surface, text, and border aliases from `--color-background` / `--color-foreground`. Commerce roles remain global.

The deprecated legacy token alias stylesheet has been removed. Live storefront CSS now consumes the CT token layer directly.

`snippets/ct-section-padding.liquid` is the shared responsive padding primitive. Current migrated custom sections: `ct-brand-strip`, `ct-comparison`, `ct-email-signup`, `ct-faq`, `ct-feature-blocks`, `ct-product-buy`, `ct-product-info`, `ct-related-products`, `ct-reviews`, `ct-trust-marquee`, and `ct-video-gallery` (11/13 custom `ct-*` sections). `ct-announcement-bars` and `ct-sticky-atc` are documented exemptions because they are fixed-height ticker/fixed-viewport UI rather than normal document-flow content sections.

`ct-brand-audit` records brand/IP leakage in storefront code. Current tracked mentions: 0.

`ct-content-audit` blocks niche demo copy and known unverified proof defaults in live theme code while allowing the current dev product handle. Current tracked mentions: 0.

`ct-section-schema-audit` confirms all 13 current `ct-*` sections include at least one preset.

The custom section CSS is split (W1.T12) into `assets/section-ct-base.css` + `assets/section-ct-components.css` + `assets/section-ct-responsive.css`, loaded in that order from `layout/theme.liquid` (byte-identical to the former `section-ct-page.css`). `section-ct-responsive.css` pauses announcement and marquee animation under `prefers-reduced-motion: reduce`.

`ct-crlf-audit` records current line-ending debt and fails only when future changes add more CRLF line endings. Current baseline:

- CRLF line endings: 31,669
- Files with CRLF: 86
