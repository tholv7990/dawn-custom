# Authoring a `ct-*` section

Our Minimals sections follow one shape. Copy an existing `ct-*` section and keep to this anatomy so new sections stay DRY and on-brand.

## Anatomy

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-NAME.css' | asset_url | stylesheet_tag }}

{% render 'ct-section-padding', section: section %}

<div class="page-width section-{{ section.id }}-padding color-{{ section.settings.color_scheme }}">
  {% render 'ct-section-head', kicker: section.settings.kicker, heading: section.settings.heading %}
  {%- comment -%} blocks loop; each card element gets class="ct-card ..." + data-reveal {%- endcomment -%}
</div>

{% schema %} ... {% endschema %}
```

## Shared snippets (`snippets/`)

- **`ct-section-padding`** — the responsive padding `<style>` block. Pass `section: section`.
- **`ct-section-head`** — centered kicker + `<h2>`. Pass `kicker`, `heading` (renders nothing if `heading` is blank).
- **`ct-trust-chips`** — trust-chip row from a newline-separated string. Pass `chips`; optional `class`, `wrap_style`, `reveal` (boolean → `data-reveal`).
- **`ct-add-to-cart`** — Dawn `<product-form>` add-to-cart for one variant. Pass `product`, `variant`, `label`, `btn_class`, `form_id`, `section_id`; optional `form_class`. Wraps `{% raw %}{% form 'product' %}{% endraw %}` and is required by `product-form.js` — **do not hand-roll the product-form markup.**

## Shared CSS primitives (`assets/ct-sections.css`)

- **`.ct-card`** — card surface base: `bg-raised` + border + radius. Add it to any card element; set shadow/padding/hover in your own `section-ct-*.css`.
- **`.ct-media`** + **`.ct-media--contain`** / **`.ct-media--cover`** — shared media fit helpers for CT content cards. Use `contain` when uploaded image/video content must remain fully visible; use `cover` for intentional thumbnail/hero crops.
- **`.ct-btn`** family — `.ct-btn` + `--primary` / `--outlined` / `--soft`, and `--sm` / `--lg` / `--full`.
- **`.ct-eyebrow`**, **`.ct-kicker`**, **`.ct-section-head*`** — headings.
- **`.ct-trust-row`** / **`.ct-trust-chip`**, **`.ct-rating-row`** / **`.ct-stars`** / **`.ct-rating-count`**, **`.ct-grid-3`**.

## Tokens

All colors / space / radii / shadows are `--ct-*` tokens from `snippets/css-variables.liquid`. Never hardcode hex — use the token so a brand change propagates everywhere.

## Conventions

- `disabled_on` the header/footer groups; expose `color_scheme` + `padding_top` / `padding_bottom` settings.
- Emit only the P1 JS hooks (`data-reveal`, `data-countup`, `data-accordion`, `data-swipe`, `data-ba`). No new global JS.
- CTAs use the `.ct-btn` pill family, never Dawn's `.button`.
- Keep commerce native: add-to-cart goes through `ct-add-to-cart` (Dawn's `<product-form>`), never a custom fetch.
