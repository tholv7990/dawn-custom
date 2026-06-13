# CT Shared Primitives (W2)

Reusable, dependency-free building blocks for the custom layer. They follow the two-lane
rule (`docs/ct-migration-guardrails.md`): **commerce state** stays on Dawn's web components,
**presentation** lives in small `ct-*` snippets/elements driven by `data-ct-*` hooks and the
`--ct-*` token system.

All of these are **additive**: snippets render only when `{% render %}`-ed, custom elements
activate only when their tag appears, and the JS services stay inert until invoked. None are
wired into a live template yet — sections adopt them in W3+. The dev section
`sections/ct-styleguide.liquid` (page templates only) loads and demonstrates them.

## Snippets

### `ct-icon` (W2.T08)
Curated commerce icon system. Maps a friendly `name` to a bundled `icon-*.svg`, or renders an
uploaded `image` (G-01 fallback). Unknown name → empty output.
`{% render 'ct-icon', name: 'truck', label: 'Free shipping' %}`
Names: check, truck, plane, box, lock, return, star, heart, info, question, discount, tag,
cart, stopwatch, fire, bolt, recycle, leaf, pin, copy, success, ruler, eye, chat, error.
`label` sets `role=img` + `aria-label`; omit it for decorative `aria-hidden` icons.

### `ct-rating-stars` (W2.T03)
Accessible 5-star rating with half-star fill. Renders nothing when `rating` is absent (no
fabricated proof, G-05). `{% render 'ct-rating-stars', rating: 4.5, count: 128 %}`
Params: `rating`, `count`, `max` (5), `label`, `style` (`default` | `trustpilot`).

### `ct-price-tokens` (W2.T01, server)
Resolves price tokens in a text string using a `variant` + `quantity`, money-formatted by
Liquid. Compare/savings tokens resolve only from a real `compare_at_price`.
`{% render 'ct-price-tokens', text: block.settings.label, variant: variant, quantity: 2 %}`
Tokens: `[quantity] [price] [compare_price] [price_each] [compare_price_each] [amount_saved] [amount_saved_rounded]`.

## Elements & services (assets/)

### `ct-price-tokens.js` (W2.T01)
`window.CT.resolvePriceTokens(template, values)` — pure resolver (consumers pass pre-formatted
money strings, so no client currency logic). Auto-wires `[data-ct-price-tokens]` on a
`ct:price:refresh` CustomEvent for live qty/variant updates.

### `<ct-copy-button>` (W2.T04)
Copies `data-ct-clipboard` (or its text), shows a `data-ct-copy-state="copied"` state ≥1.5s,
announces via `aria-live`, keyboard (Enter/Space), `execCommand` fallback for insecure contexts.

### `<ct-countdown-timer>` (W2.T05)
Modes: `date` (`data-ct-deadline` ISO), `daily` (`data-ct-daily="18:00"`), `evergreen`
(`data-ct-minutes` + `sessionStorage`). `data-ct-expire="hide|zero|restart"`. SSR-safe (keeps
initial markup until first tick → no CLS). Fills `[data-ct-part]` children or sets `HH:MM:SS`.

### `ct-reveal.js` (W2.T06)
Scroll reveal via `data-ct-reveal`, consuming `--ct-reveal-*` tokens. Honors
`prefers-reduced-motion` (shows immediately). Stagger via `--ct-reveal-order` /
`data-ct-reveal-order`; `data-ct-reveal-repeat` re-triggers on re-entry. Idempotent;
re-inits on `shopify:section:load`. Self-injects its stylesheet.

### `ct-toast.js` (W2.T09)
`window.CT.toast(message, { variant, duration, onClose })` — single polite `aria-live` host,
queued (no overlap), hover/focus pause, token-styled, self-injecting. `variant`: `success` | `error`.

## Styling

`assets/component-ct-primitives.css` holds token-only styles for `.ct-icon`, `.ct-stars`,
`ct-copy-button`, and `ct-countdown-timer`. Load it from any section that adopts a primitive.
`ct-reveal.js` and `ct-toast.js` inject their own styles, so they need no CSS file.

## Deferred (next W2 pass)
- `ct-carousel` wrapper extending Dawn `slider-component` (W2.T07).
- `ct-upsell-card` snippet (W2.T02) — depends on `ct-price-tokens` + `ct-rating-stars` + Dawn `product-form`.
