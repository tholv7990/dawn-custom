# CT Token Reference

`snippets/css-variables.liquid` is the current token emitter. During migration, new work should consume semantic `--ct-*` roles and avoid reintroducing legacy GS token consumers.

The storefront is light-mode locked by default through `settings.ct_force_light_mode`. When enabled, the token emitter and layouts emit the browser color-scheme hints needed to preserve the current light surfaces.

The temporary legacy token alias shim has been removed. If a future section needs compatibility behavior, add the CT semantic role in `snippets/css-variables.liquid` and migrate the caller to that role.

## Foundation Tokens

- `--ct-pad-tight`: compact proof/information section rhythm.
- `--ct-pad-loud`: high-emphasis decision section rhythm.
- `--ct-display-1`: large display headline scale.
- `--ct-display-2`: section headline scale.
- `--ct-shadow-lift`: hard lift shadow accent.
- `--ct-ring`: focus ring alias.
- `--ct-marquee-duration`: per-section marquee speed.

## Semantic Role Aliases

- `--ct-action`: primary action color. Currently aliases `--ct-accent`.
- `--ct-action-hover`: primary action hover/strong color. Currently aliases `--ct-accent-strong`.
- `--ct-action-tint`: soft action background. Currently aliases `--ct-accent-subtle`.
- `--ct-action-border`: action border. Currently aliases `--ct-accent-border`.
- `--ct-trust`: trust/success signal. Currently aliases `--ct-success`.
- `--ct-trust-tint`: trust/success fill. Currently aliases `--ct-success-light`.
- `--ct-urgency`: urgency/error signal.
- `--ct-urgency-tint`: urgency/error fill. Currently aliases `--ct-error-light`.
- `--ct-price`: current price signal.
- `--ct-price-compare`: compare-at/was price. Currently aliases `--ct-price-was`.
- `--ct-savings`: savings signal. Currently aliases `--ct-price-save`.

## L3 Component Contracts (W1.E2)

Component-level tokens emitted by `snippets/css-variables.liquid`. Geometry **aliases the
Dawn-native panel variables** (`--buttons-radius`, `--inputs-radius`, `--variant-pills-radius`,
`--card-corner-radius`, `--popup-corner-radius`, `--badge-corner-radius`, etc.) so the Theme
Editor "Buttons / Inputs / Variant pills / Cards / Drawers / Popups / Badges" panels drive them;
color and shadow reference the CT L1/L2 roles above. Emission is **additive** — these are a
visual no-op until a component opts in by consuming them.

- Buttons (W1.T06): `--ct-btn-radius`, `--ct-btn-border-width`, `--ct-btn-border-opacity`, `--ct-btn-shadow-h/-v/-blur/-opacity`, `--ct-btn-bg`, `--ct-btn-bg-hover`, `--ct-btn-text`, `--ct-btn-min-height` (44px floor).
- Inputs (W1.T07b): `--ct-input-radius`, `--ct-input-border-width`, `--ct-input-border-opacity`, `--ct-input-border`, `--ct-input-bg`, `--ct-input-text`, `--ct-input-height`, `--ct-input-pad-x`.
- Variant pills (W1.T07a): `--ct-pill-radius`, `--ct-pill-border-width`, `--ct-pill-border-opacity`, `--ct-pill-border`, `--ct-pill-bg`, `--ct-pill-text`, `--ct-pill-selected-bg`, `--ct-pill-selected-text`, `--ct-pill-min-height`.
- Dropdowns (W1.T07b): `--ct-dropdown-radius/-border/-bg/-text` (share input geometry).
- Quantity (W1.T07c): `--ct-qty-radius/-border/-bg/-text/-height/-btn-size`.
- Swatches (W1.T07d): `--ct-swatch-size/-radius/-border/-ring/-gap`.
- Slider chrome (W1.T07e): `--ct-arrow-size/-radius/-bg/-icon/-color`, `--ct-dot-size/-active-width/-gap/-color/-active-color`.
- Cards (W1.T07): `--ct-card-radius/-border-width/-border/-bg/-pad-token/-shadow`.
- Drawers (W1.T07): `--ct-drawer-bg/-border/-shadow/-width`.
- Popups (W1.T07): `--ct-popup-radius/-bg/-border/-shadow/-overlay`.
- Badges (W1.T07 / FR-GS-06): `--ct-badge-radius/-pad-x/-pad-y/-shadow`.

## Typography Scale (W1.T05)

Settings-driven multipliers from the Typography panel (`heading_scale`, `body_scale`):
`--ct-heading-scale`, `--ct-body-scale`, and derived `--ct-h1…--ct-h6` + `--ct-body-size`.

## Reveal / Motion (W1.T08)

Inputs for the (forthcoming W2.T06) reveal engine: `--ct-reveal-duration` (follows
`--ct-dur-slow`, so it zeroes under `prefers-reduced-motion`), `--ct-reveal-delay`,
`--ct-reveal-stagger`, `--ct-reveal-opacity`, `--ct-reveal-x`, `--ct-reveal-y`,
`--ct-reveal-zoom`, `--ct-reveal-ease`.

## Dev styleguide

`sections/ct-styleguide.liquid` (enabled on `page` templates only, not referenced by any live
template) renders all of the above so a developer can confirm the tokens resolve. Token-only
styling keeps it inside the CT token-audit budget.

## Migration Rule

Use these semantic roles for new or touched custom UI. Keep existing `--ct-accent*` consumers working, but do not reintroduce legacy GS token consumers now that the compatibility layer has been removed.
