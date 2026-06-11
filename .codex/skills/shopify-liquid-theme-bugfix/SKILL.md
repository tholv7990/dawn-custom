---
name: shopify-liquid-theme-bugfix
description: Use this skill before investigating or fixing UI, Liquid logic, JavaScript state, cart, product/variant, section schema, theme editor, or AJAX bugs in a Shopify Liquid theme.
version: 1.0.0
last_researched: 2026-06-11
primary_stack:
  - Shopify Online Store 2.0
  - Liquid
  - Theme sections and blocks
  - JSON templates
  - CSS
  - JavaScript / Web Components
  - Shopify Ajax API
---

# Shopify Liquid Theme Bugfix Skill

## Purpose

Use this skill before touching code in a Shopify Liquid theme bugfix.

The goal is not only to “make the visible bug disappear.” The goal is to ship a minimal, safe, maintainable fix that preserves merchant settings, section customization, storefront performance, accessibility, localization, app compatibility, and cart/product correctness.

A Shopify theme bug usually sits at the boundary between:

- **Liquid**: server-rendered initial markup and Shopify data.
- **Schema/settings**: merchant-editable configuration.
- **CSS**: layout, responsive behavior, visual states, and global side effects.
- **JavaScript**: client-side state, product variant changes, cart drawer updates, dynamic rendering, event binding.
- **Shopify APIs**: Ajax Cart API, Section Rendering API, and theme editor lifecycle events.
- **External inputs**: apps, metafields, markets, translations, inventory, media, browser/device differences.

Do not patch blindly. Reproduce, isolate, fix the smallest root cause, then verify across the relevant Shopify states.

---

## Source-of-truth hierarchy

When evidence conflicts, use this priority order:

1. The current theme code and the storefront behavior observed in browser DevTools.
2. Official Shopify developer documentation.
3. Official Liquid documentation.
4. Shopify-maintained reference theme patterns, such as Dawn or Shopify liquid-skills.
5. Theme vendor documentation for the specific theme.
6. App vendor documentation for injected widgets or theme app extensions.
7. Community posts, Stack Overflow, blog posts, and AI suggestions only as weak hints.

Never treat old snippets from forums as authoritative without checking them against current Shopify docs and the current theme code.

---

## Research-backed Shopify facts to remember

These facts are common sources of bugs:

1. **Liquid is server-rendered.** Liquid can output the initial page state, but it will not automatically update after a customer changes a variant, cart quantity, drawer state, or dynamically injected section. Use JavaScript or section re-rendering for client-side changes.
   - Source: https://shopify.dev/docs/api/liquid

2. **Sections are reusable Liquid modules with merchant settings and blocks.** A section can be rendered from JSON templates, section groups, or statically. Keep section code compatible with repeated instances.
   - Source: https://shopify.dev/docs/storefronts/themes/architecture/sections

3. **JSON templates store section order and section settings.** They can render up to 25 sections, and each section can contain up to 50 blocks. A theme can contain up to 1,000 JSON templates.
   - Source: https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates

4. **The `render` tag isolates snippet scope.** Variables created outside a snippet are not directly available inside it unless passed as parameters. Variables created inside the snippet are not available outside it.
   - Source: https://shopify.dev/docs/api/liquid/tags/render

5. **Liquid truthiness differs from JavaScript.** In Liquid, false and nil are falsy; values such as `0`, empty strings, arrays, and empty arrays can still behave differently than developers expect depending on the comparison/filter used.
   - Source: https://shopify.dev/docs/api/liquid/basics

6. **The `default` filter can replace `false`.** Use `allow_false: true` when `false` is a meaningful setting value.
   - Source: https://shopify.dev/docs/api/liquid/filters/default

7. **Liquid `for` loops are capped at 50 iterations per page.** Use `paginate` for supported arrays when more than 50 items are needed.
   - Source: https://shopify.dev/docs/api/liquid/tags/paginate

8. **Theme editor re-renders sections without a full page reload.** JavaScript that runs only on initial page load will not automatically re-run after a section or block is added, removed, reordered, or re-rendered in the editor.
   - Source: https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks

9. **Section Rendering API can request up to five sections and cannot receive arbitrary section setting values.** It uses the section’s existing template/static settings or defaults.
   - Source: https://shopify.dev/docs/api/ajax/section-rendering

10. **Ajax Cart API calls should use locale-aware URLs.** Use `window.Shopify.routes.root` when building `/cart/*.js` requests.
    - Source: https://shopify.dev/docs/api/ajax/reference/cart

11. **Bundled section rendering can return updated section HTML as part of cart add/change/update/clear calls.** This is usually the cleanest way to keep cart drawer, cart count bubble, cart footer, and live regions in sync.
    - Source: https://shopify.dev/docs/api/ajax/reference/cart

12. **Line item keys are safer than variant IDs for cart updates when duplicate variant IDs can exist.** A cart can contain multiple lines with the same variant ID when properties or discounts differ. The line item key can change when line characteristics change.
    - Source: https://shopify.dev/docs/api/ajax/reference/cart

13. **Products with many variants need special care.** Shopify has restricted `product.variants` to a maximum of 250 variants and recommends auditing theme code that assumes all variants are present.
    - Source: https://shopify.dev/docs/storefronts/themes/product-merchandising/variants/support-high-variant-products

14. **Theme Check is the baseline linter for Liquid and JSON.** It catches syntax errors, missing templates, unused variables/snippets, unknown or deprecated tags, and some performance issues.
    - Source: https://shopify.dev/docs/storefronts/themes/tools/theme-check

15. **Shopify CLI provides development themes, hot reload/refresh, Theme Check, theme profiling, pushing, pulling, and previews.** Use it instead of editing the live theme directly.
    - Source: https://shopify.dev/docs/storefronts/themes/tools/cli

16. **Performance guidance favors HTML and CSS first.** JavaScript should be progressive enhancement for core storefront experiences, not the only path for finding or purchasing products.
    - Source: https://shopify.dev/docs/storefronts/themes/best-practices/performance

17. **Accessibility is part of a bugfix.** Color contrast, keyboard access, focus management, labels, media controls, and semantic HTML should not regress during UI fixes.
    - Source: https://shopify.dev/docs/storefronts/themes/best-practices/accessibility

---

## Mandatory pre-fix checklist

Before changing code, gather this information:

```text
Bug title:
Store/theme:
Theme version or base theme:
Live URL / preview URL:
Affected template(s):
Affected section(s):
Affected product/collection/page/article/search/cart state:
Expected behavior:
Actual behavior:
Reproduction steps:
Browser/device/viewport:
Market/language/currency:
Customer state: guest / logged in / B2B / subscription / selling plan:
Cart state: empty / existing items / duplicate variant lines / line item properties:
Recent theme/app/config changes:
Console errors:
Network errors:
Screenshots or screen recording:
```

If some details are missing, proceed with the best available evidence, but note assumptions in the fix summary.

---

## Safe working protocol

### 1. Protect the merchant’s live store

Do not edit the live production theme directly unless there is no safer access path and the change is urgent.

Preferred workflow:

```bash
shopify theme pull --store <store>
git checkout -b fix/<short-bug-name>
shopify theme dev --store <store>
shopify theme check
```

Use a duplicated/unpublished theme or development theme for validation. Keep rollback simple: one branch, small patch, clear changed files.

### 2. Map the render path

Find every file that contributes to the bug:

```text
templates/*.json or templates/*.liquid
  -> sections/*.liquid
    -> snippets/*.liquid
      -> assets/*.js
      -> assets/*.css
      -> config/settings_schema.json
      -> locales/*.json
```

Search by visible text, CSS class, section ID, schema setting ID, JavaScript selector, product form field name, and URL path.

Examples:

```bash
rg "visible text or setting id"
rg "cart-icon-bubble|cart-drawer|product-form|variant"
rg "shopify:section:load|Section Rendering|cart/change"
```

### 3. Reproduce first, then hypothesize

Use browser DevTools to capture:

```text
DOM structure:
Computed CSS:
Event listeners:
Console errors:
Network request/response:
Cart JSON:
Section rendering HTML:
Theme editor events:
Injected app markup:
```

Write a one-sentence hypothesis before patching:

```text
Hypothesis: The cart count does not update because the Ajax add request succeeds, but the returned bundled section HTML is not replacing the cart icon section.
```

### 4. Classify the bug

Use this decision tree:

```text
Is the initial HTML wrong?
  -> Liquid / schema / data / template context bug.

Is the HTML correct but it looks wrong?
  -> CSS / responsive / specificity / layout / media / z-index bug.

Is the initial state correct but changes fail after interaction?
  -> JavaScript state / event binding / Ajax / section re-render bug.

Does it work outside the theme editor but fail inside the editor?
  -> theme editor lifecycle bug; handle shopify:section:* events.

Does it work for some products/pages but not others?
  -> data, metafields, variant structure, template assignment, market/language, inventory, selling plan, or app-condition bug.

Does it work until cart/product content is replaced?
  -> stale DOM reference or missing reinitialization after DOM replacement.
```

---

## Expert bugfix strategy by bug type

## UI and layout bugs

### Typical causes

- Global CSS selector changed more than intended.
- CSS specificity conflict with theme or app styles.
- A section appears multiple times, but CSS/IDs assume only one instance.
- Mobile media query breakpoint missed.
- Container width, grid, flex, `overflow`, or `position: sticky` conflict.
- Image aspect ratio or object-fit mismatch.
- Z-index or stacking context caused by `transform`, `filter`, `opacity`, `position`, or parent overflow.
- Theme setting generates invalid CSS.
- App block injects markup that shifts layout.
- Accessibility/focus styles were removed by a visual cleanup.

### Debug steps

1. Inspect the exact element and compare expected vs actual computed styles.
2. Disable suspicious rules in DevTools to identify the minimal CSS root cause.
3. Check parent containers for `overflow`, `display`, `position`, `z-index`, transforms, and width constraints.
4. Test desktop, tablet, and mobile breakpoints.
5. Test with at least one repeated instance of the section if the section can appear multiple times.
6. Test the theme editor after section reorder/load.
7. Check that the UI still works with long text, missing image, large product title, sale price, unavailable variant, and different language length.

### Safe CSS pattern

Prefer section-scoped selectors when a setting or section-specific style is needed:

```liquid
{%- style -%}
  #shopify-section-{{ section.id }} {
    --hero-gap: {{ section.settings.gap | default: 24 }}px;
  }

  #shopify-section-{{ section.id }} .hero__content {
    gap: var(--hero-gap);
  }
{%- endstyle -%}
```

Avoid global fixes like this unless the bug is truly global:

```css
/* Risky: can break every button in the theme */
.button {
  margin-top: 20px;
}
```

Prefer component selectors:

```css
.product-card__quick-add-button {
  margin-top: 20px;
}
```

### UI fix rules

- Do not hide real content to “fix” layout unless the product requirement says so.
- Do not remove focus outlines. Replace them only with a visible accessible focus style.
- Do not solve responsive bugs only with JavaScript when CSS can solve them.
- Preserve merchant setting output and translations.
- Keep images responsive; avoid hardcoded fixed heights unless design requires them.
- Use `loading`, dimensions, and aspect ratio thoughtfully to avoid layout shift.
- Check app blocks before blaming theme CSS.

---

## Liquid logic bugs

### Typical causes

- Snippet expects a variable that was not passed through `render`.
- `false` setting is overwritten by `default`.
- Empty string, nil, false, blank, and zero are confused.
- Object is unavailable in the current template context.
- Section Rendering API is called from a page context that does not contain the expected object.
- Loop silently stops at 50 items.
- Schema setting ID changed but Liquid still reads the old ID.
- JSON template refers to a missing section file.
- Variant logic renders initial state only, while client-side variant changes require JS.
- Unescaped output creates broken markup.
- Translation key is missing, causing fallback or visible key text.
- Metafield is not present, has a different type, or is not exposed where expected.

### Defensive Liquid patterns

Pass variables explicitly into snippets:

```liquid
{% render 'price',
  product: product,
  variant: product.selected_or_first_available_variant,
  show_compare_at: section.settings.show_compare_at
%}
```

Preserve meaningful `false` values:

```liquid
{% assign show_badge = section.settings.show_badge | default: true, allow_false: true %}
```

Check blank values before rendering markup:

```liquid
{% assign heading = section.settings.heading | strip %}

{% if heading != blank %}
  <h2 class="section-heading">{{ heading | escape }}</h2>
{% endif %}
```

Avoid assuming more than 50 loop items are available:

```liquid
{% paginate collection.products by 24 %}
  {% for product in collection.products %}
    {% render 'card-product', product: product %}
  {% endfor %}

  {{ paginate | default_pagination }}
{% endpaginate %}
```

Use block attributes for editor compatibility:

```liquid
{% for block in section.blocks %}
  <div {{ block.shopify_attributes }}>
    {{ block.settings.text }}
  </div>
{% endfor %}
```

### Liquid fix rules

- Do not move business logic into JavaScript when Liquid can render the correct initial state.
- Do not hardcode product IDs, variant IDs, collection handles, URLs, market paths, or language strings unless the bug is explicitly store-specific.
- Use `escape` for merchant text in HTML text nodes.
- Use `json` when passing data into JavaScript.
- Keep schema defaults and Liquid fallbacks aligned.
- Confirm the object context: product page, collection page, search page, cart page, section-rendered context, and theme editor preview can differ.
- For boolean settings, test both true and false in the editor.

---

## JavaScript state and interaction bugs

### Typical causes

- Event listeners are attached on page load only, then DOM replacement removes them.
- The same section appears twice and selectors hit the first instance.
- Code stores stale DOM nodes after `innerHTML` or `replaceWith`.
- Variant changes update one UI fragment but not price, SKU, media, URL, hidden variant input, availability, pickup, selling plan, or submit button state.
- Cart Ajax request succeeds but DOM is not updated with returned cart/section state.
- Race condition: a slower request overwrites a newer UI state.
- Duplicate custom element registration throws an error.
- Modal/drawer code does not trap focus or restore focus.
- JavaScript depends on text content instead of data attributes.
- Theme editor re-renders the section and the initialization function is not called again.

### Idempotent initialization pattern

Use scoped initialization and make it safe to run more than once:

```js
function initProductCards(root = document) {
  root.querySelectorAll('[data-product-card]').forEach((card) => {
    if (card.dataset.initialized === 'true') return;

    card.dataset.initialized = 'true';
    card.addEventListener('click', (event) => {
      const button = event.target.closest('[data-quick-add]');
      if (!button) return;

      // Handle quick add.
    });
  });
}

document.addEventListener('DOMContentLoaded', () => initProductCards());

document.addEventListener('shopify:section:load', (event) => {
  initProductCards(event.target);
});
```

### Web Component pattern

```js
class QuantityInput extends HTMLElement {
  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    this.onClick = this.onClick.bind(this);
    this.addEventListener('click', this.onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.onClick);
  }

  onClick(event) {
    const button = event.target.closest('[data-quantity-button]');
    if (!button) return;

    // Update quantity.
  }
}

if (!customElements.get('quantity-input')) {
  customElements.define('quantity-input', QuantityInput);
}
```

### Theme editor lifecycle pattern

At minimum, support these events where relevant:

```js
document.addEventListener('shopify:section:load', (event) => {
  // Reinitialize JS inside event.target.
});

document.addEventListener('shopify:section:unload', (event) => {
  // Clean up timers, observers, event listeners, and third-party instances.
});

document.addEventListener('shopify:block:select', (event) => {
  // Show selected slide/accordion/tab and keep it visible.
});
```

### JS fix rules

- Prefer event delegation for elements replaced by Ajax or Section Rendering.
- Scope selectors to the current section/component root.
- Never assume IDs are unique across repeated sections unless they include `section.id`.
- Do not parse prices from formatted text to calculate totals; use Shopify response data.
- Use `AbortController`, request sequence IDs, or disabling controls to prevent stale Ajax responses from winning.
- After replacing section HTML, reinitialize only the replaced scope.
- Keep progressive enhancement: product purchasing and cart forms should still have a non-JS fallback when practical.
- Maintain `aria-expanded`, `aria-controls`, focus restore, and live region updates for drawers, modals, accordions, and cart changes.

---

## Cart and Ajax bugs

### Typical causes

- Non-locale-aware endpoint such as `/cart/add.js` breaks for market/language paths.
- Code updates cart JSON but not the cart drawer/count/footer HTML.
- Variant ID is used when line item key is required.
- `properties` update overwrites existing line item properties.
- Quantity input updates the wrong line because item indexes changed.
- Multiple rapid cart requests return out of order.
- Error response is not shown to the customer.
- Cart drawer opens before updated section HTML is rendered.
- Stale `item_count` is read from old DOM instead of the API response.

### Locale-aware Ajax pattern

```js
async function addToCart(form) {
  const body = new FormData(form);
  body.append('sections', 'cart-drawer,cart-icon-bubble,cart-live-region-text');

  const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
    method: 'POST',
    body,
    headers: {
      Accept: 'application/json'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.description || data.message || 'Cart update failed');
  }

  return data;
}
```

### Section replacement pattern

```js
function replaceSection(sectionId, html) {
  if (!html) return;

  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const incoming = parsed.querySelector(`#shopify-section-${sectionId}`);
  const current = document.querySelector(`#shopify-section-${sectionId}`);

  if (!incoming || !current) return;

  current.replaceWith(incoming);

  document.dispatchEvent(new CustomEvent('theme:section:replaced', {
    detail: { sectionId, section: incoming }
  }));
}
```

### Cart fix rules

- Use `window.Shopify.routes.root` for cart endpoints.
- Use bundled section rendering when updating cart UI fragments.
- Prefer line item keys for update/change operations when duplicate variant lines are possible.
- Always handle `response.ok === false`.
- Disable or debounce controls while a line is updating.
- Do not hide errors; render them near the related control and update live regions where the theme supports them.
- After a cart update, trust the API response or returned section HTML, not old DOM values.

---

## Product and variant bugs

### Typical causes

- Liquid renders initial variant data, but JS does not update UI after variant selection.
- Hidden product form input `name="id"` does not update to the selected variant ID.
- Selected variant is unavailable but add button remains enabled.
- Price, compare-at price, SKU, inventory message, pickup availability, media, badges, unit price, or selling plan UI is out of sync.
- Variant deep link query parameter is ignored.
- Product with more than 250 variants assumes all variants are available in `product.variants`.
- Swatch values use translated labels or colors inconsistently.
- Media gallery and variant picker use different option state.

### Variant fix checklist

When variant selection changes, verify all relevant UI:

```text
Hidden variant input:
Add-to-cart disabled/enabled state:
Button text:
Price:
Compare-at price:
Unit price:
SKU/barcode:
Inventory message:
Pickup availability:
Selling plan:
URL variant parameter:
Media/gallery:
Selected swatch/radio/select state:
Unavailable/sold-out option state:
Analytics events, if present:
```

### Product fix rules

- Liquid should render the correct initial state.
- JavaScript should update all dependent client-side fragments after selection.
- Avoid serializing all variants for high-variant products. Audit any code that assumes all variants are available in Liquid.
- Use data attributes for variant IDs and option value IDs rather than parsing visible labels.
- Test products with one variant, multiple variants, unavailable variants, subscriptions/selling plans, and missing optional metafields.

---

## Section schema and theme editor bugs

### Typical causes

- Invalid JSON in `{% schema %}`.
- Setting ID changed in schema but not in Liquid.
- Section has no `presets`, so merchants cannot add it in JSON templates.
- Section or block is missing `enabled_on` / `disabled_on` constraints.
- Block markup lacks `{{ block.shopify_attributes }}`.
- JavaScript does not handle `shopify:section:load`, `shopify:section:unload`, `shopify:block:select`, or `shopify:block:deselect`.
- Section reuses non-unique IDs.
- App block compatibility is broken by removing block rendering or schema support.
- New settings have no safe defaults, causing existing stores to render blank or invalid CSS.

### Schema fix rules

- Keep schema IDs stable once merchants use the theme.
- Add new settings with defaults.
- If renaming a setting, support old and new IDs where possible for migration.
- Validate JSON carefully; no trailing commas.
- Include `presets` when the section should be addable from the editor.
- Preserve app block rendering if the section supports `@app` blocks.
- Use `block.shopify_attributes` for editor selection and reordering.
- In editor mode, selected slides/tabs/accordion blocks should become visible and remain visible while selected.

---

## Accessibility guardrails

Every UI bugfix must preserve or improve accessibility.

Check:

```text
Keyboard can reach and operate controls.
Visible focus state exists.
Buttons use <button> for actions; links use <a> for navigation.
Inputs have labels.
Modals/drawers manage focus and restore focus on close.
Accordions/toggles update aria-expanded and aria-controls.
Cart updates use live regions where present.
Color is not the only way to communicate state.
Text and icon contrast remain acceptable.
Autoplay media can be paused/stopped/muted according to the component need.
Images have meaningful alt text or empty alt when decorative.
```

Do not “fix” UI by removing labels, focus outlines, semantic elements, or live regions.

---

## Performance guardrails

Do not create a bugfix that makes the storefront noticeably slower.

Check:

```text
No large new JS library for a small interaction.
No repeated expensive DOM queries in scroll/resize handlers.
No unbounded Liquid loops.
No full page reload when a scoped section update is enough.
No oversized JSON blob if only a few fields are needed.
No layout thrashing from repeated read/write DOM operations.
No duplicate event listeners after section re-renders.
No global CSS that forces repaint/reflow across the page.
```

Prefer:

- HTML and CSS for static/interactable UI where possible.
- Small, scoped JS modules.
- Event delegation.
- Section-level re-rendering for server-derived HTML.
- Throttled/debounced observers and listeners.
- Shopify image/media filters and responsive image patterns.

---

## Common symptom → root cause → fix map

| Symptom | Likely root cause | Diagnostic | Preferred fix |
|---|---|---|---|
| UI looks correct on desktop but breaks on mobile | Missing breakpoint, container overflow, fixed width | Inspect computed width and parent overflow | CSS breakpoint or responsive sizing |
| One section fix changes many pages | Global selector too broad | Search selector usage | Scope to component or `#shopify-section-{{ section.id }}` |
| Click works on first load, fails after editing section in theme editor | Section DOM was re-rendered; JS did not reinitialize | Listen for `shopify:section:load` | Idempotent init on editor events |
| Variant price does not change | Liquid rendered initial price only | Change variant and inspect JS events | Add/update variant JS or section re-render |
| Add-to-cart succeeds but cart bubble stays old | Ajax response not replacing cart sections | Inspect network response | Use bundled section rendering and replace returned sections |
| Wrong cart line quantity changes | Duplicate variant IDs in cart | Inspect cart JSON line keys | Use line item key or line index correctly |
| A boolean setting set to false behaves as true | `default` filter replaced false | Inspect rendered Liquid value | Use `allow_false: true` or explicit checks |
| Snippet cannot read a variable | `render` scope isolation | Check snippet call | Pass variable explicitly |
| Products beyond 50 do not render | Liquid loop limit | Count rendered items | Use `paginate` for supported arrays |
| Section cannot be added in editor | Missing schema presets or disabled_on/enabled_on mismatch | Check schema | Add valid `presets` or adjust availability |
| Section rendering returns unexpected settings | API cannot accept arbitrary setting values | Inspect section’s template/static settings | Render existing section or use data/API approach |
| Product with many variants breaks | Theme assumes all variants in Liquid | Test product with >250 variants | Use scalable option-value pattern/API |
| Drawer/modal traps keyboard or loses focus | Missing focus management | Keyboard test | Add focus trap/restore and ARIA state |

---

## Minimal patch discipline

Before editing, state the smallest fix surface:

```text
Files likely affected:
- sections/main-product.liquid
- snippets/price.liquid
- assets/product-form.js

Root cause:
- The selected variant ID updates, but the price snippet is only rendered on initial Liquid render.

Patch strategy:
- Preserve Liquid initial render.
- Add client-side update for price using existing variant data or section re-render.
- Scope JS to the product section.
- Reinitialize after section load.
```

When editing:

- Change the fewest files that solve the root cause.
- Preserve naming conventions already used by the theme.
- Prefer extending existing components over creating parallel systems.
- Do not remove code you do not understand.
- Avoid “cleanup” in the same patch unless it is required by the fix.
- Add comments only where they explain a non-obvious Shopify-specific behavior.

---

## Regression test matrix

Choose the relevant subset, but do not skip obvious states.

### Browser and viewport

```text
Chrome desktop:
Safari desktop, if available:
Mobile viewport:
Real mobile, if available:
Tablet width:
```

### Storefront state

```text
Logged out:
Logged in:
Cart empty:
Cart with one item:
Cart with duplicate variant lines/properties:
Market/language path:
Currency formatting:
Theme editor preview:
App block present:
```

### Product state

```text
Single variant:
Multiple variants:
Unavailable variant:
Sale price:
Unit price:
Subscription/selling plan:
Missing optional metafield:
Product media image:
Product media video/model, if relevant:
High variant count, if relevant:
```

### Page state

```text
Home:
Product:
Collection:
Search:
Cart:
Section repeated twice:
Long merchant text:
Missing/blank image:
```

### Technical checks

```bash
shopify theme check
shopify theme profile --url <path-if-performance-related>
```

Manual checks:

```text
No console errors:
No failed network requests:
No duplicate custom element registration errors:
No broken theme editor section load:
No keyboard/focus regression:
No visible layout shift regression:
Before/after screenshot captured:
```

---

## Definition of Done

A Shopify Liquid theme bugfix is done only when:

```text
The bug is reproducible before the fix.
The root cause is identified.
The patch is minimal and scoped.
Liquid initial render is correct.
Client-side state updates correctly after interaction.
Theme editor section/block lifecycle still works where relevant.
Merchant settings and translations are preserved.
Cart/product/variant state is accurate.
Accessibility does not regress.
Performance does not regress meaningfully.
shopify theme check passes, or exceptions are documented.
The fix is tested on relevant templates, viewports, and store states.
Rollback path is clear.
```

---

## Bugfix response template

Use this when reporting the fix:

```markdown
## Root cause
Brief explanation of why the bug happened.

## Files changed
- `sections/...`
- `snippets/...`
- `assets/...`

## Fix
What changed and why this is the smallest safe fix.

## Validation
- Reproduction steps retested
- Browser/device tested
- Theme editor tested
- Cart/product/variant state tested
- `shopify theme check` result

## Risk / rollback
Any remaining risk and how to revert.
```

---

## Red flags that require extra caution

Pause and inspect deeper when any of these appear:

```text
Checkout behavior is involved.
Subscription/selling plan logic is involved.
Multi-currency or markets are involved.
B2B/customer-specific pricing is involved.
Apps inject product/cart/checkout widgets.
The bug only appears in the theme editor.
The section can appear multiple times.
The code uses global selectors like `.button`, `.price`, `.product-form`.
The fix touches layout/theme.liquid or global.js.
The product has many variants.
Cart line item properties are used.
The change affects accessibility-critical UI: modal, drawer, menu, quantity, form, media, accordion.
```

---

## Practical expert heuristics

- If Liquid is wrong on first paint, fix Liquid/schema/data.
- If first paint is right but interaction is wrong, fix JavaScript state or Section Rendering.
- If data is right but visuals are wrong, fix CSS/layout.
- If a theme editor action breaks it, add lifecycle-aware JS and block/section editor support.
- If cart UI is stale, update from Ajax response or bundled sections, not old DOM.
- If the same code must work across sections, never rely on global IDs.
- If a setting can be false, do not use `default` without thinking.
- If a loop may exceed 50, design for pagination or filtering.
- If the fix needs a hardcoded ID, there is probably a better theme-native solution.
- If a patch works only on your test product, it is not finished.

---

## Research references

- Shopify Liquid reference: https://shopify.dev/docs/api/liquid
- Liquid basics: https://shopify.dev/docs/api/liquid/basics
- Liquid `render` tag: https://shopify.dev/docs/api/liquid/tags/render
- Liquid `default` filter: https://shopify.dev/docs/api/liquid/filters/default
- Liquid `paginate` tag: https://shopify.dev/docs/api/liquid/tags/paginate
- Shopify sections: https://shopify.dev/docs/storefronts/themes/architecture/sections
- Shopify section schema: https://shopify.dev/docs/storefronts/themes/architecture/sections/section-schema
- Shopify JSON templates: https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates
- Shopify Section Rendering API: https://shopify.dev/docs/api/ajax/section-rendering
- Shopify Ajax Cart API: https://shopify.dev/docs/api/ajax/reference/cart
- Shopify theme editor events: https://shopify.dev/docs/storefronts/themes/best-practices/editor/integrate-sections-and-blocks
- Shopify Theme Check: https://shopify.dev/docs/storefronts/themes/tools/theme-check
- Shopify CLI for themes: https://shopify.dev/docs/storefronts/themes/tools/cli
- Shopify performance best practices: https://shopify.dev/docs/storefronts/themes/best-practices/performance
- Shopify accessibility best practices: https://shopify.dev/docs/storefronts/themes/best-practices/accessibility
- Product media docs: https://shopify.dev/docs/storefronts/themes/product-merchandising/media
- High-variant product support: https://shopify.dev/docs/storefronts/themes/product-merchandising/variants/support-high-variant-products
- Shopify liquid-skills repository: https://github.com/Shopify/liquid-skills
