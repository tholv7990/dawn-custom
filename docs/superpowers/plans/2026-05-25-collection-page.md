# P4a Collection Page — Minimals Skin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Skin Dawn's native collection page into Minimals via one CSS file + two stylesheet loads + one template setting, with zero filtering/sorting logic edits.

**Architecture:** `assets/section-ct-collection.css` restyles the native banner / vertical facets / sort / pills / grid / pagination / mobile drawer classes (tokens are global). `templates/collection.json` flips `filter_type` to `vertical` for the sidebar layout. `facets.liquid`, `facets.js`, `price-facet`, Section Rendering API untouched. Fail-open.

**Tech Stack:** Liquid, plain CSS with `--ct-*` tokens. No JS. Spec: `docs/superpowers/specs/2026-05-25-collection-page-design.md`.

**Branch:** `feat/minimals-foundation` (continue; no new branch).

**Verification:** No tests; gate = `shopify theme check`, baseline **14**. Live `theme dev` is the user's gate.

---

## Task 1: Create the skin CSS + wire the loads

**Files:**
- Create: `assets/section-ct-collection.css`
- Modify: `sections/main-collection-product-grid.liquid`, `sections/main-collection-banner.liquid`

- [ ] **Step 1: Create `assets/section-ct-collection.css`.**

```css
/* section-ct-collection.css — Minimals skin for Dawn's native collection page.
   Presentation only; facets.js + Section Rendering API untouched. Loaded by
   main-collection-banner + main-collection-product-grid. --ct-* tokens are
   global (theme-overrides.css). Remove this file -> working Dawn collection. */

/* ---- Banner ---- */
.collection-hero__title { font-family: var(--ct-font-heading); font-weight: var(--ct-fw-bold); font-size: var(--ct-text-3xl); letter-spacing: -0.02em; }
.collection-hero__description { color: var(--ct-text-2); font-size: var(--ct-text-md); }

/* ---- Vertical layout spacing ---- */
@media screen and (min-width: 990px) {
  .facets-vertical.page-width { gap: var(--ct-space-6); }
  .facets-wrapper { padding-right: var(--ct-space-4); }
}

/* ---- Filter groups (sidebar) ---- */
.facets__disclosure-vertical { border-bottom: 1px solid var(--ct-border-subtle); padding: var(--ct-space-3) 0; }
.facets__disclosure-vertical .facets__summary { display: flex; align-items: center; justify-content: space-between; cursor: pointer; color: var(--ct-text); }
.facets__disclosure-vertical .facets__summary > div { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: var(--ct-space-2); }
.facets__summary-label { font-weight: var(--ct-fw-semi); font-size: var(--ct-text-base); }
.facets__disclosure-vertical .facets__summary svg { width: 16px; height: 16px; color: var(--ct-text-3); transition: transform var(--ct-dur-fast) var(--ct-ease-out); }
.facets__disclosure-vertical[open] .facets__summary svg { transform: rotate(180deg); }
.facets__selected { color: var(--ct-text-3); font-size: var(--ct-text-sm); }
.facets__and-helptext { color: var(--ct-text-3); font-size: var(--ct-text-xs); }

/* ---- Checkbox rows ----
   NOTE: Dawn renders <input type=checkbox> + square.svg (box) + .svg-wrapper>checkmark
   + .facet-checkbox__text. We recolor on top of component-facets.css. The exact box
   recolor is the #1 live-tweak item (verify on theme dev). */
.facets__list--vertical { display: flex; flex-direction: column; gap: var(--ct-space-2); margin-top: var(--ct-space-3); }
.facets__list--vertical .facets__item { margin: 0; }
.facet-checkbox { display: flex; align-items: center; gap: 10px; font-size: var(--ct-text-sm); color: var(--ct-text-2); cursor: pointer; padding: 2px 0; line-height: 1.4; }
.facet-checkbox.active { color: var(--ct-text); font-weight: var(--ct-fw-semi); }
.facet-checkbox.disabled { opacity: 0.5; cursor: not-allowed; }
.facet-checkbox > svg { width: 18px; height: 18px; border-radius: var(--ct-r-sm); color: var(--ct-border); flex-shrink: 0; }
.facet-checkbox input:checked ~ svg { color: var(--ct-accent); }
.facet-checkbox .svg-wrapper { color: #fff; }
.facet-checkbox__text { color: inherit; }
.facet-checkbox__text-label { color: inherit; }
.facets__item .facet-checkbox__text { font-size: var(--ct-text-sm); }

/* show more */
.button-show-more { color: var(--ct-accent-text); font-weight: var(--ct-fw-semi); font-size: var(--ct-text-sm); margin-top: var(--ct-space-2); }

/* price range */
.facets__price { display: flex; align-items: center; gap: var(--ct-space-2); margin-top: var(--ct-space-3); }
.facets__price .field__input,
.facets__price input[type="text"] { border: 1.5px solid var(--ct-border); border-radius: var(--ct-r-md); padding: 8px 10px; font-family: var(--ct-font-body); font-size: var(--ct-text-sm); color: var(--ct-text); }
.facets__price .field__input:focus { border-color: var(--ct-accent-strong); box-shadow: var(--ct-focus); outline: none; }

/* ---- Sort + count bar ---- */
.facets-vertical-sort { align-items: center; }
.facet-filters__label label,
.facet-filters__label { color: var(--ct-text-2); font-weight: var(--ct-fw-medium); }
.facet-filters .select { position: relative; }
.facet-filters__sort,
.facet-filters .select__select {
  appearance: none; -webkit-appearance: none;
  border: 1.5px solid var(--ct-border); border-radius: var(--ct-r-md);
  padding: 10px 36px 10px 14px; font-family: var(--ct-font-body); font-size: var(--ct-text-sm);
  color: var(--ct-text); background: var(--ct-bg-raised); cursor: pointer;
}
.facet-filters__sort:focus { border-color: var(--ct-accent-strong); box-shadow: var(--ct-focus); outline: none; }
.facet-filters .select .svg-wrapper { position: absolute; right: var(--ct-space-3); top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--ct-text-3); }
.product-count__text { color: var(--ct-text-2); font-size: var(--ct-text-sm); }

/* ---- Active filter pills ---- */
.active-facets { display: flex; flex-wrap: wrap; gap: var(--ct-space-2); align-items: center; }
.active-facets__button .active-facets__button-inner,
.active-facets__button-inner.button--tertiary {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--ct-bg-control); border: 1px solid var(--ct-border-subtle);
  color: var(--ct-text); border-radius: var(--ct-r-pill);
  padding: 5px 12px; font-size: var(--ct-text-sm); min-height: 0;
}
.active-facets__button-inner.button--tertiary:hover { border-color: var(--ct-accent-border); }
.active-facets__button-inner .svg-wrapper svg { width: 11px; height: 11px; color: var(--ct-text-3); }
.active-facets__button-remove { color: var(--ct-accent-text); font-weight: var(--ct-fw-semi); font-size: var(--ct-text-sm); }

/* ---- Product grid + states ---- */
.product-grid { gap: var(--ct-space-4); }
.collection--empty .title { font-family: var(--ct-font-heading); color: var(--ct-text); }

/* ---- Pagination ---- */
.pagination__list { display: flex; gap: var(--ct-space-1); justify-content: center; flex-wrap: wrap; }
.pagination__item {
  display: flex; align-items: center; justify-content: center;
  min-width: 38px; height: 38px; padding: 0 8px;
  border: 1px solid var(--ct-border-subtle); border-radius: var(--ct-r-md);
  background: var(--ct-bg-raised); color: var(--ct-text-2); font-size: var(--ct-text-sm);
}
.pagination__item--current { background: var(--ct-accent); color: #fff; border-color: var(--ct-accent); font-weight: var(--ct-fw-bold); }
.pagination__item:hover:not(.pagination__item--current) { border-color: var(--ct-accent-border); color: var(--ct-text); }

/* ---- Mobile filter drawer ---- */
.mobile-facets__open {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1.5px solid var(--ct-border); border-radius: var(--ct-r-pill);
  padding: 10px 18px; font-weight: var(--ct-fw-semi); font-size: var(--ct-text-sm); color: var(--ct-text);
  background: var(--ct-bg-raised);
}
.mobile-facets__open .svg-wrapper svg { width: 16px; height: 16px; }
.mobile-facets__inner { background: var(--ct-bg-raised); }
.mobile-facets__header { border-bottom: 1px solid var(--ct-border-subtle); }
.mobile-facets__heading { font-family: var(--ct-font-heading); font-weight: var(--ct-fw-bold); color: var(--ct-text); }
.mobile-facets__count { color: var(--ct-text-3); font-size: var(--ct-text-sm); }
.mobile-facets__summary { font-weight: var(--ct-fw-semi); color: var(--ct-text); }
.mobile-facets__label { color: var(--ct-text-2); font-size: var(--ct-text-base); }
.mobile-facets__label.active { color: var(--ct-text); font-weight: var(--ct-fw-semi); }
.mobile-facets__footer { border-top: 1px solid var(--ct-border-subtle); gap: var(--ct-space-3); }
.mobile-facets__footer .button--primary {
  background: var(--ct-accent); color: #fff; border: 0; border-radius: var(--ct-r-md);
  font-family: var(--ct-font-body); font-weight: var(--ct-fw-bold); min-height: 48px;
}
.mobile-facets__footer .button--primary:hover { background: var(--ct-accent-strong); }
.mobile-facets__clear { color: var(--ct-accent-text); font-weight: var(--ct-fw-semi); }
```

- [ ] **Step 2: Load the skin in `sections/main-collection-product-grid.liquid`.**

The file starts with:
```liquid
{{ 'template-collection.css' | asset_url | stylesheet_tag }}
{{ 'component-card.css' | asset_url | stylesheet_tag }}
{{ 'component-price.css' | asset_url | stylesheet_tag }}
```
Add one line after the `component-price.css` line:
```liquid
{{ 'component-price.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-collection.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 3: Load the skin in `sections/main-collection-banner.liquid`.**

The file starts with `{% comment %}…{% endcomment %}` then:
```liquid
{{ 'component-collection-hero.css' | asset_url | stylesheet_tag }}
```
Add one line after it:
```liquid
{{ 'component-collection-hero.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-collection.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 4: Theme check** → expect **14**.

- [ ] **Step 5: Commit.**
```bash
git add assets/section-ct-collection.css sections/main-collection-product-grid.liquid sections/main-collection-banner.liquid
git commit -m "feat(collection): add Minimals skin over native collection page"
```

---

## Task 2: Flip the template to the vertical sidebar layout

**Files:** Modify `templates/collection.json`

- [ ] **Step 1: Add `filter_type: vertical` to the product-grid settings.**

In `templates/collection.json`, the `product-grid` section settings currently end with `"enable_sorting": true,` … `"columns_mobile": "2"`. Add the `filter_type` key inside that settings object:
```json
        "enable_filtering": true,
        "filter_type": "vertical",
        "enable_sorting": true,
        "columns_mobile": "2",
```

- [ ] **Step 2: Validate JSON.**
Run: `node -e "JSON.parse(require('fs').readFileSync('templates/collection.json','utf8'))&&console.log('ok')"` → `ok`.

- [ ] **Step 3: Theme check** → expect **14**.

- [ ] **Step 4: Commit.**
```bash
git add templates/collection.json
git commit -m "feat(collection): use vertical filter sidebar layout"
```

---

## Task 3: Final review + finish

- [ ] **Step 1: Full theme check** → confirm **14 (2 errors + 12 warnings)**.
- [ ] **Step 2: Confirm logic untouched.** `git diff --stat <task1-commit>~1 HEAD -- snippets/facets.liquid snippets/price-facet.liquid assets/facets.js` → no output.
- [ ] **Step 3: Hand the user the live checklist** (spec Testing section): sidebar renders desktop; filter apply updates grid + pill; sort works; clear-all works; price range works; mobile drawer apply/clear; empty + pagination; fail-open. Flag the **facet checkbox box recolor** as the main thing to eyeball on `theme dev`.
- [ ] **Step 4: Finish** via superpowers:finishing-a-development-branch (no auto-merge; stays on `feat/minimals-foundation`).

---

## Self-review

- **Spec coverage:** banner, sidebar groups, checkboxes, price, sort, count, pills, grid, empty, pagination, mobile drawer, template setting, guardrails — all in Task 1/2. ✓
- **No placeholders:** full CSS provided; exact anchors for the 2 loads + template key. ✓
- **Risk:** the `.facet-checkbox` box recolor depends on Dawn's `square.svg`/checkmark using `currentColor`; flagged as the live-tweak item. Everything else is high-confidence layout/token CSS. Pagination class names (`pagination__list`/`__item`/`__item--current`) are Dawn's `snippets/pagination.liquid` classes — confirm during implementation by reading that snippet; if they differ, adjust selectors.
