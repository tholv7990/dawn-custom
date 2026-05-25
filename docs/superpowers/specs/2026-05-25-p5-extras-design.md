# P5 Extras — Design Spec (reviews carousel · atoms · search)

**Date:** 2026-05-25 · **Branch:** `feat/minimals-foundation` · **Status:** Approved

Three independent extras, same skin-don't-touch-logic discipline. theme-check baseline **12** (must hold). Fail-open; new JS = guarded custom elements.

## 1. Reviews carousel (upgrade `ct-reviews`)

- **New `assets/ct-carousel.js`** — guarded `<ct-carousel>` element. Prev/next arrows, dot pagination, 4s autoplay (pause on hover/focus/`prefers-reduced-motion`), pointer drag/swipe. Operates on a `.ct-reviews-track` of cards; scrolls by `scrollLeft` (reuses the existing scroll-snap track).
- **`sections/ct-reviews.liquid`** — wrap the track in `<ct-carousel>`, add arrow buttons + a dots strip, load `ct-carousel.js`. Add a **`layout`** setting (`carousel` default ↔ `grid`); `grid` keeps the current 3-col grid (carousel JS no-ops). With ≤ columns count of reviews, arrows/dots hide.
- **CSS** in `section-ct-reviews.css`: carousel track (flex, snap), arrows (round Minimals buttons), dots (active = accent).
- Keep existing rating-row + card styles. `data-swipe` removed in carousel mode (ct-carousel owns interaction); grid mode keeps mobile swipe.

## 2. Atoms — breadcrumb + back-to-top

- **New `snippets/ct-breadcrumb.liquid`** — `<nav aria-label="breadcrumb">` trail: Home › [collection] › [product/title]. Uses `product`, `collection`, `request` context; renders nothing on the home page. Rendered at the top of `sections/main-product.liquid` (above title) and in `sections/main-collection-banner.liquid` (above the H1).
- **New `assets/ct-back-to-top.js`** — guarded `<ct-back-to-top>` element: a fixed bottom-right button, hidden until `scrollY > 600`, smooth-scrolls to top (instant under `prefers-reduced-motion`), `aria-label`. Rendered once before `</body>` in `layout/theme.liquid` (with its inline SVG).
- **CSS** in `assets/theme-overrides.css`: `.ct-breadcrumb*` + `ct-back-to-top` button.

## 3. Search (results page + predictive dropdown)

- **`sections/main-search.liquid`** — load existing `section-ct-collection.css` (reuses the collection facets/grid/pagination skin, since search uses the same markup) + new `section-ct-search.css`.
- **`sections/header.liquid`** — load `section-ct-search.css` right after `component-search.css` (line 2) so the header predictive dropdown is skinned site-wide.
- **New `assets/section-ct-search.css`** — skin the search **bar** (`.template-search__search .search`, `.search__input.field__input`, `.search__button`/`.reset__button` → Minimals) and the **predictive dropdown** (`.predictive-search` container card; `.predictive-search__heading` mono uppercase; `.predictive-search__list-item`/`__item` hover; product/query/collection suggestions).
- **`templates/search.json`** — add `"filter_type": "vertical"` to the `main` section (sidebar, matches collection).

## Guardrails (all)

- Do NOT edit `facets.js`, `predictive-search.js`, `main-search.js`, `cart.js`, or any form/search/review data logic. Presentation + guarded JS + one new snippet.
- New custom elements use the `if (!customElements.get(...))` guard; store unsubscribe/cleanup where relevant; respect `prefers-reduced-motion`.
- theme-check stays **12**; `--ct-*` tokens; no leading-underscore Liquid vars; double-quote `.liquid`, single-quote JS.
- Fail-open: remove the JS/CSS → working Dawn (reviews fall back to grid; search/atoms degrade to native/none).

## Testing (user, live `theme dev`)

Reviews: arrows/dots/autoplay/drag work, pause on hover, reduced-motion respected, grid layout option works. Atoms: breadcrumb on PDP/collection, back-to-top appears on scroll + scrolls up. Search: results page skinned (sidebar + grid + pagination), search bar Minimals, predictive dropdown skinned in header + search page. Fail-open checks.

## Open questions

None — build all three; carousel default layout = carousel; search filter sidebar = vertical.
