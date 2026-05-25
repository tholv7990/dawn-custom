# P5 Footer — Minimals Dark Skin Design Spec

**Date:** 2026-05-25
**Branch:** `feat/minimals-foundation`
**Status:** Approved (ready for implementation plan)

## Goal

Restyle Dawn's native footer into the Minimals **dark footer** (design-system `#tfooter` / `.site-footer`) — brand + social, mono-uppercase link columns, native newsletter form, native payment icons, and a legal/policy bottom bar — with zero markup/logic changes (one CSS file + one stylesheet load).

## Approach

Dawn's `<footer class="footer color-{scheme} gradient">` uses Dawn's `--color-*` RGB-triple plumbing. We flip it dark by **overriding `--color-background` / `--color-foreground` on `footer.footer`** (element+class specificity beats `.color-scheme-N`), so every native footer element (links, borders, newsletter, social) recolors light-on-dark for free. Then small tweaks: mono uppercase headings, accent hovers, dark-friendly newsletter field. **Payment icons stay Dawn-native** (`payment_type_svg_tag: class: 'icon icon--full-color'`, already in `footer.liquid`) — official branded Visa/Mastercard/etc., not recolored. Full-color payment icons on a dark footer are standard and high-trust.

## Scope

**In:** dark background + light text; brand block; `.footer-block__heading` mono uppercase; link lists; newsletter form (dark input, accent submit arrow); social icons; bottom bar (top divider, faint legal + policy links); localization selectors dark-friendly; keep native payment icons.

**Out:** restructuring footer blocks/markup; changing newsletter/localization/policy logic; a filled-green newsletter button (keep Dawn's arrow button, accent on hover — the mockup's filled button is a non-blocking nicety).

## File map

**New:** `assets/section-ct-footer.css`
**Modify:** `sections/footer.liquid` — add one line `{{ 'section-ct-footer.css' | asset_url | stylesheet_tag }}` after its existing CSS loads.

## Guardrails

- Do NOT edit the newsletter `{% form 'customer' %}`, `social-icons` snippet, `localization-form`, payment markup, policy links, or any logic. Presentation only.
- Keep Dawn's `section-footer.css` + component CSS loaded (baseline); our file layers after.
- Payment icons remain native full-color (`payment_type_svg_tag`), per the [[use-native-shopify-elements]] preference.
- theme-check stays **14**. No new JS. `--ct-*` tokens (+ controlled white-alpha for dark surface).
- Fail-open: remove the skin → Dawn's normal (light-scheme) footer.

## Accessibility

- Contrast: light text on `#212B36` meets AA (white .66+ on dark). Headings #fff.
- Focus rings preserved (global focus token); links keep underline-on-focus behavior.
- Newsletter label stays associated; payment icons keep their `visually-hidden` caption.

## Testing / verification

- **Automated:** `shopify theme check` stays 14.
- **Manual (user, live `theme dev`):** footer renders dark site-wide; link columns + hovers; newsletter submits (success/error states legible on dark); social + native payment icons show; policy links + locale selectors legible; mobile stacks; remove skin → light Dawn footer (fail-open).

## Open questions

None — dark footer via scheme-var override; payment icons native full-color; filled newsletter button deferred.
