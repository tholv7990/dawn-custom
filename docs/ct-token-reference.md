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

## Migration Rule

Use these semantic roles for new or touched custom UI. Keep existing `--ct-accent*` consumers working, but do not reintroduce legacy GS token consumers now that the compatibility layer has been removed.
