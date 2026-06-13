# Authoring a `ct-*` Section

Custom storefront work lives in `ct-*` files. The old `gs-*` section, snippet, and asset filenames have been migrated to `ct-*`; some internal CSS classes and `data-gs-*` hooks remain for compatibility until a later markup-level rename is explicitly planned.

## Anatomy

```liquid
{{ 'section-ct-name.css' | asset_url | stylesheet_tag }}

{% render 'ct-section-padding', section: section %}

<section class="ct-name section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  <div class="page-width">
    {%- comment -%} Section header, blocks, and commerce bindings render here. {%- endcomment -%}
  </div>
</section>

{% schema %} ... {% endschema %}
```

## Shared Snippets

- `ct-section-padding`: emits the responsive padding style block. Pass `section: section`.
- `ct-color-scheme` (W1.T17): emits the merged `class` + optional `--ct-*` override `style` for the
  section wrapper (L4 per-section color scheme + custom colors). Place it inside the opening tag.
- `ct-add-to-cart`: Dawn-compatible product form helper when a custom section needs add-to-cart behavior.
- `ct-section-head`, `ct-trust-chips`, and other `ct-*` helpers should be preferred when present.
- W2 presentation primitives — see `docs/ct-primitives.md` (`ct-icon`, `ct-rating-stars`,
  `ct-price-tokens`, `ct-upsell-card`, `<ct-carousel>`, `<ct-copy-button>`, `<ct-countdown-timer>`,
  `ct-reveal.js`, `ct-toast.js`).

## Per-section color scheme + overrides (W1.T17)

Use `ct-color-scheme` for the wrapper, and add this schema fragment to the section's `settings`:

```json
{ "type": "color_scheme", "id": "color_scheme", "default": "scheme-1", "label": "Color scheme" },
{ "type": "header", "content": "Custom colors" },
{ "type": "checkbox", "id": "ct_custom_colors", "label": "Use custom colors", "default": false },
{ "type": "color", "id": "ct_custom_bg", "label": "Custom background" },
{ "type": "color", "id": "ct_custom_text", "label": "Custom text" },
{ "type": "color", "id": "ct_custom_accent", "label": "Custom accent" }
```

```liquid
{%- capture base -%}ct-name section-{{ section.id }}-padding{%- endcapture -%}
<section {% render 'ct-color-scheme', section: section, base_class: base %} {{ section.shopify_attributes }}>
```

The scheme class flips the L2 surface tokens via the scheme bridge in `snippets/css-variables.liquid`;
the custom-color toggle re-declares `--ct-bg/--ct-text/--ct-action` locally on the wrapper.

## Schema Rules

- Include a preset for every custom section unless the section is only rendered as part of a fixed group.
- Use neutral defaults. Do not seed fake ratings, sold counts, discount promises, shipping thresholds, warranty claims, real-looking addresses, or third-party brand names. Cart reward threshold settings must use `0` as the disabled default until the merchant configures real store rules.
- Keep commerce values bound to Shopify objects: `product.price`, `compare_at_price`, variants, availability, media, and metafields.
- Add padding settings with `padding_top` and `padding_bottom` when the section participates in normal document flow. Fixed bars and sticky viewport UI must be documented as exemptions in `qa/ct-section-schema-audit.mjs`.

## Styling Rules

- Use semantic `--ct-*` tokens from `snippets/css-variables.liquid`.
- Do not reintroduce legacy GS token consumers. Use semantic `--ct-*` roles directly.
- Avoid hardcoded color literals, spacing literals, and `!important`; if an exception is unavoidable, add it to the audit baseline deliberately and document why.
- Honor `prefers-reduced-motion` for marquee, reveal, sticky, and animation behavior.

## Validation

Run both checks before handing off custom section work:

```sh
node qa/ct-qa.mjs
shopify.cmd theme check
```
