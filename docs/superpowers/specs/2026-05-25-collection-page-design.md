# P4a Collection Page — Minimals Skin Design Spec

**Date:** 2026-05-25
**Branch:** `feat/minimals-foundation`
**Status:** Approved (ready for implementation plan)

## Goal

Restyle Dawn's native collection page (banner + product grid + filters + sort + pagination) into the Minimals look (design target: `dawn-design-system.html` **T3.6 "Collection — Grid + Filter + Sort"**) using **one CSS skin file + two stylesheet loads + one template setting** — with zero edits to filtering/sorting logic.

## Why this approach

Filtering/sorting is wired through `snippets/facets.liquid`, `assets/facets.js`, and the Section Rendering API. None of that is touched. Dawn already supports a left **vertical** filter sidebar (`filter_type: "vertical"`) — the layout the design wants — so we flip that one template setting and skin the resulting native markup. Product cards already carry Minimals styling from the foundation. Fail-open: remove the skin and it's a working Dawn collection page.

## Scope

**In:** collection banner title/description; vertical filter sidebar (groups, checkboxes, price range, show-more); sort dropdown; result count; active-filter pills + clear-all; product-grid spacing; empty state; pagination; mobile filter drawer (`menu-drawer`) trigger + panel + apply/clear.

**Out (deferred):** grid/list view toggle (adds JS), breadcrumb (Dawn renders none by default), search-results page reskin (shares facets — can reuse this CSS later), infinite scroll.

## Architecture

### Mechanism — one skin file: `assets/section-ct-collection.css`

Loaded by both collection sections (after their existing CSS). `--ct-*` tokens are global (`theme-overrides.css`), so no other CSS dependency. It restyles these native classes (no markup edits):

- **Banner:** `.collection-hero`, `.collection-hero__title` → Minimals H1; `.collection-hero__description` → muted body.
- **Layout:** `.facets-vertical` (the sidebar+grid grid), `.facets-wrapper` (sidebar), `.product-grid-container`.
- **Filter groups:** `.facets__disclosure-vertical` + `.facets__summary` (group title + `icon-caret` rotate on open), `.facets__display-vertical`.
- **Checkbox rows:** `.facets__label.facet-checkbox` / `.facet-checkbox__text` / `.facet-checkbox__text-label` + count; the native `square.svg` + `icon-checkmark.svg` recolored to a Minimals box (border → accent fill + white check when `:checked`/`.active`); `.disabled` dimmed.
- **Show more:** `.button-show-more` / `show-more-button`.
- **Price range:** `price-range`, `.facets__price`, the `price-facet` inputs (`.field__input` style).
- **Sort + count:** `.facets-vertical-sort`, `.facet-filters__sort` inside `.select` (Minimals select w/ caret), `.product-count` / `.product-count__text`.
- **Active pills:** `.active-facets__button` + `.active-facets__button-inner.button--tertiary` → Minimals chip w/ `icon-close-small`; `.active-facets__button-remove` → accent text link.
- **Grid + states:** `.product-grid` gap; `.collection--empty` centered Minimals empty state; `.loading-overlay` left as-is (Dawn loading spinner during fetch).
- **Pagination:** `.pagination` ul/li/a → Minimals page chips, current = accent.
- **Mobile drawer:** `.mobile-facets__wrapper` / `.mobile-facets__open` (filter trigger pill), `.mobile-facets__inner` / `__header` / `__details` / `__summary` / `__list` / `__item` / `__label` / `__checkbox` / `__footer`; the Apply/Clear `.button--primary` / `.underlined-link` → Minimals button/link. The slide-in is Dawn's `menu-drawer` — behavior untouched, panel skinned.

### Template setting — `templates/collection.json`

Add `"filter_type": "vertical"` to the `product-grid` section settings so the sidebar layout renders. (Everything else stays.)

### Stylesheet loads (2 lines)

- `sections/main-collection-product-grid.liquid` — add `{{ 'section-ct-collection.css' | asset_url | stylesheet_tag }}` after its existing CSS loads.
- `sections/main-collection-banner.liquid` — same.

## File map

**New:** `assets/section-ct-collection.css`
**Modify:** `sections/main-collection-product-grid.liquid` (+1 line), `sections/main-collection-banner.liquid` (+1 line), `templates/collection.json` (+`filter_type: vertical`)

## Guardrails

- Do NOT edit `snippets/facets.liquid`, `snippets/price-facet.liquid`, `assets/facets.js`, or any filter/sort logic. Presentation only.
- Keep Dawn's `component-facets.css` / `template-collection.css` loaded (baseline); our file layers on top (loads after).
- theme-check stays at the **14**-offense baseline. No new JS. `--ct-*` tokens only (no hardcoded hex).
- Fail-open: removing `section-ct-collection.css` → working Dawn collection page.

## Accessibility

- Checkbox visuals layered over the real `<input type="checkbox">` (which stays the control); `:checked`/`.active` drive the visual. Disabled values dimmed (Dawn adds `.disabled`).
- Focus rings preserved (`focus-offset`/`focus-inset` Dawn classes + global focus token).
- `role="status"` product-count and `facet-filters-form` live regions untouched.
- Respects `prefers-reduced-motion`.

## Testing / verification

- **Automated:** `shopify theme check` stays 14.
- **Manual (user, live `theme dev`):**
  1. Collection renders with left sidebar (desktop); applying a filter updates the grid (Section Rendering API intact) and shows a pill.
  2. Sort dropdown re-sorts; result count updates.
  3. "Clear all" / individual pill removal works.
  4. Price range filter works.
  5. Mobile: "Filter" opens the drawer; apply/clear work; grid updates.
  6. Empty state + pagination styled.
  7. Remove the skin → still a working Dawn collection (fail-open).

## Open questions

None — resolved in brainstorming: skin native facets (no markup edits), `filter_type: vertical`, grid/list toggle deferred.
