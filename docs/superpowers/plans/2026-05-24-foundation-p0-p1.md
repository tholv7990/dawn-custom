# Dawn × Minimals — Foundation (P0 + P1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the design-system layer so Dawn's native pages render on-brand (Minimals) with commerce 100% intact, and ship the shared `ct-` token/class vocabulary + 8 JS utilities every later phase depends on.

**Architecture:** Three frozen layers — Dawn 15.4.1 commerce (untouched logic) → design system (`css-variables.liquid` tokens + `theme-overrides.css` + 8 vanilla JS utils + 5 additive Liquid edits) → `ct-*` component sections (later phases). All custom CSS uses `--ct-*` tokens and `ct-` class prefixes. No build step; assets served as-is.

**Tech Stack:** Shopify Liquid, CSS custom properties, vanilla ES (no framework, no jQuery), Shopify CLI (`shopify theme dev` / `theme check`), Theme Check linter.

**Spec:** `docs/superpowers/specs/2026-05-24-dawn-minimals-theme-design.md`. Read it before starting.

---

## Domain note: how "tests" work here

This is a Liquid/CSS/JS theme — there is no unit-test runner. Each task's verification is the theme's real quality gate, in this order:

1. **`shopify theme check`** → must be clean (no new offenses).
2. **Live preview** via `shopify theme dev` → open the affected surface and confirm the specific visual/behavioral expectation stated in the task.
3. **Commerce smoke-test** (only for tasks touching shared snippets): on a product page, select a variant → Add to Cart → cart drawer opens → proceed to checkout. Behavior must be **identical to stock Dawn**.
4. **Commit.**

Run `shopify theme dev` once in a side terminal and leave it running; it hot-reloads on save.

---

## File Structure

| File | Create/Modify | Responsibility |
|---|---|---|
| `snippets/css-variables.liquid` | Create | The only per-brand file. Emits `--ct-*` tokens + `@font-face` from Theme Editor settings (Minimals defaults). |
| `assets/theme-overrides.css` | Create | All CSS overrides of Dawn natives + global patterns (typography, buttons, ct-field, focus, skeleton, badges, header, cart-notification). |
| `assets/ct-reveal.js` `ct-countup.js` `ct-swipe.js` `ct-accordion.js` `ct-ba.js` `ct-scrollspy.js` `ct-sticky-atc.js` `ct-quickview.js` | Create | 8 scoped vanilla utilities, each ≤ ~55 lines, `defer`-loaded. |
| `config/settings_schema.json` | Modify | Add the brand settings group the token snippet reads. |
| `layout/theme.liquid` | Modify | Render tokens inside reset style block; load override CSS after `base.css`; load the 8 JS with `defer`. |
| `snippets/card-product.liquid` | Modify | Add hover overlay + Quick-View trigger + %-off badge (reuse Dawn's native secondary image + badges). |
| `snippets/cart-drawer.liquid` | Modify | Add free-shipping progress bar + upsell slot + trust row (markup only). |
| `snippets/buy-buttons.liquid` | Modify | Add trust-chip grid below ATC. |

---

## Task 1: Initialize git + baseline commit

**Files:** none created — repo init only. `.gitignore` already exists in repo.

- [ ] **Step 1: Initialize the repository**

```bash
git init
git add -A
git commit -m "chore: baseline Dawn 15.4.1 + design docs"
```

- [ ] **Step 2: Create a working branch**

```bash
git checkout -b feat/minimals-foundation
```

- [ ] **Step 3: Verify clean state**

Run: `git status`
Expected: `On branch feat/minimals-foundation` · `nothing to commit, working tree clean`

---

## Task 2: Add brand settings group to `settings_schema.json`

**Files:**
- Modify: `config/settings_schema.json` (append one object to the top-level array)

- [ ] **Step 1: Add the settings group**

Insert this object as a **new element in the top-level array**, immediately before the closing `]` of the file (after the last existing group object — add a comma after that object):

```json
{
  "name": "Minimals brand",
  "settings": [
    { "type": "header", "content": "Brand colours" },
    { "type": "color", "id": "color_accent", "label": "Accent", "default": "#00A76F" },
    { "type": "color", "id": "color_accent_hover", "label": "Accent (hover/strong)", "default": "#007867" },
    { "type": "header", "content": "Brand type" },
    { "type": "font_picker", "id": "font_heading", "label": "Heading font", "default": "public_sans_n4" },
    { "type": "font_picker", "id": "font_body", "label": "Body font", "default": "public_sans_n4" },
    { "type": "header", "content": "Shape & layout" },
    { "type": "range", "id": "border_radius", "label": "Corner radius", "min": 0, "max": 24, "step": 1, "unit": "px", "default": 8 },
    { "type": "range", "id": "glass_opacity", "label": "Sticky header glass opacity", "min": 0, "max": 1, "step": 0.1, "default": 0.9 },
    { "type": "header", "content": "Commerce" },
    { "type": "range", "id": "free_shipping_threshold", "label": "Free shipping threshold", "min": 0, "max": 50000, "step": 500, "unit": "¢", "default": 5000, "info": "In cents. 5000 = $50.00" }
  ]
}
```

> Notes: (a) `public_sans_n4` is the Shopify font-library handle for Public Sans — confirm it resolves when you save Theme settings; if Shopify renamed the handle, pick Public Sans in the picker and copy the saved handle. (b) Content max-width reuses Dawn's existing `settings.page_width` (no duplicate slider). (c) Scroll animations are gated by `prefers-reduced-motion` in JS, so no separate toggle is added.

- [ ] **Step 2: Verify Theme Check passes**

Run: `shopify theme check`
Expected: no new offenses (JSON valid).

- [ ] **Step 3: Verify in Theme Editor**

In `shopify theme dev` preview → Theme settings → confirm a "Minimals brand" group appears with all controls.

- [ ] **Step 4: Commit**

```bash
git add config/settings_schema.json
git commit -m "feat(settings): add Minimals brand settings group"
```

---

## Task 3: Create the token snippet `css-variables.liquid`

**Files:**
- Create: `snippets/css-variables.liquid`

This snippet is rendered **inside** `theme.liquid`'s reset `{% style %}` block (Task 5), so it emits **raw CSS only — no `<style>` wrapper**. It does **not** set `html { font-size }` (see spec §4 ⚠ — Dawn's `62.5%` root is load-bearing).

- [ ] **Step 1: Write the snippet**

```liquid
{% comment %}
  snippets/css-variables.liquid — the ONLY file that changes per brand.
  Emits Minimals --ct-* tokens + @font-face. Rendered inside theme.liquid's
  reset style block, so it outputs raw CSS only (no style wrapper).
  Plain-text comments only — never Liquid tags inside CSS comments.
{% endcomment %}
{{ settings.font_heading | font_face: font_display: 'swap' }}
{{ settings.font_body | font_face: font_display: 'swap' }}

:root { color-scheme: only light; }
html { color-scheme: only light; forced-color-adjust: none; }
body {
  background: #F4F6F8 !important;
  color: #212B36 !important;
  letter-spacing: normal !important;
  overflow-x: hidden;
}

:root {
  --ct-bg:#F4F6F8; --ct-bg-surface:#F9FAFB; --ct-bg-raised:#FFFFFF;
  --ct-bg-control:rgba(145,158,171,.08); --ct-bg-control-h:rgba(145,158,171,.16);
  --ct-bg-overlay:rgba(22,28,36,.80);

  --ct-text:#212B36; --ct-text-2:#637381; --ct-text-3:#919EAB; --ct-text-off:#C4CDD0;

  --ct-border:rgba(145,158,171,.32); --ct-border-strong:rgba(145,158,171,.20);
  --ct-border-subtle:rgba(145,158,171,.12); --ct-border-faint:rgba(145,158,171,.06);

  --ct-shadow-xs:0 1px 2px rgba(145,158,171,.14);
  --ct-shadow-sm:0 4px 8px rgba(145,158,171,.16);
  --ct-shadow-md:0 8px 16px rgba(145,158,171,.18);
  --ct-shadow-lg:0 16px 32px rgba(145,158,171,.20);
  --ct-shadow-2xl:0 20px 40px rgba(145,158,171,.24);

  --ct-accent: {{ settings.color_accent | default: '#00A76F' }};
  --ct-accent-strong: {{ settings.color_accent_hover | default: '#007867' }};
  --ct-accent-text:#007867; --ct-accent-subtle:#C8FAD6; --ct-accent-border:#5BE49B;
  --ct-accent-glow:rgba(0,167,111,.16);

  --ct-success:#22C55E; --ct-success-dark:#15803D; --ct-success-light:#D3FCD2;
  --ct-warning:#FFAB00; --ct-warning-dark:#B76E00; --ct-warning-light:#FFF5CC;
  --ct-error:#FF5630; --ct-error-dark:#B71D18; --ct-error-light:#FFE9D5;

  --ct-price:#212B36; --ct-price-was:#919EAB; --ct-price-save:#007867;
  --ct-badge-sale:#B71D18; --ct-badge-new:#00A76F; --ct-badge-best:#B76E00;
  --ct-stock-in:#007867; --ct-stock-low:#B76E00; --ct-stock-out:#919EAB;
  --ct-rating:#FFAB00; --ct-touch:48px;

  --ct-r-sm:4px;
  --ct-r-md: {{ settings.border_radius | default: 8 }}px;
  --ct-r-lg:12px; --ct-r-xl:16px; --ct-r-pill:9999px;

  --ct-font-heading: "{{ settings.font_heading.family | default: 'Public Sans' }}", system-ui, sans-serif;
  --ct-font-body: "{{ settings.font_body.family | default: 'Public Sans' }}", system-ui, sans-serif;
  --ct-font-mono: 'DM Mono', ui-monospace, monospace;

  --ct-text-xs:12px; --ct-text-sm:13px; --ct-text-base:15px; --ct-text-md:16px;
  --ct-text-lg:20px; --ct-text-xl:26px; --ct-text-2xl:32px; --ct-text-3xl:40px; --ct-text-4xl:48px;
  --ct-fw-normal:400; --ct-fw-medium:500; --ct-fw-semi:600; --ct-fw-bold:700;
  --ct-leading-tight:1.15; --ct-leading-base:1.6; --ct-leading-loose:1.78;

  --ct-space-1:4px; --ct-space-2:8px; --ct-space-3:12px; --ct-space-4:20px;
  --ct-space-5:32px; --ct-space-6:48px; --ct-space-7:80px; --ct-space-8:128px;

  --ct-mw: {{ settings.page_width | default: 1120 }}px; --ct-gutter:24px; --ct-gutter-m:16px;
  --ct-focus:0 0 0 2px #F4F6F8, 0 0 0 4px #007867;

  --ct-dur-fast:120ms; --ct-dur-base:240ms; --ct-dur-slow:480ms;
  --ct-ease-out:cubic-bezier(.22,1,.36,1);
  --ct-ease-spring:cubic-bezier(.34,1.56,.64,1);
  --ct-ease-in-out:cubic-bezier(.65,0,.35,1);

  --ct-glass: {{ settings.glass_opacity | default: 0.9 }};
}

@media (prefers-reduced-motion: reduce) {
  :root { --ct-dur-fast:0ms; --ct-dur-base:0ms; --ct-dur-slow:0ms; }
}
```

- [ ] **Step 2: Verify Theme Check passes**

Run: `shopify theme check`
Expected: no new offenses. (The snippet is not yet rendered anywhere — that happens in Task 5.)

- [ ] **Step 3: Commit**

```bash
git add snippets/css-variables.liquid
git commit -m "feat(tokens): add css-variables snippet with Minimals --ct-* tokens"
```

---

## Task 4: Create `theme-overrides.css` — base reset + typography

**Files:**
- Create: `assets/theme-overrides.css`

- [ ] **Step 1: Write the base layer**

```css
/* assets/theme-overrides.css — Minimals design system over Dawn.
   All values use --ct-* tokens. Components authored in px (root-independent;
   we never change Dawn's 62.5% html font-size). */

/* ---- Typography ---- */
body,
.rte,
p,
li,
input,
select,
textarea,
button {
  font-family: var(--ct-font-body);
}
h1, h2, h3, h4, h5, h6,
.h0, .h1, .h2, .h3, .h4, .h5 {
  font-family: var(--ct-font-heading);
  color: var(--ct-text);
  letter-spacing: -0.02em;
  line-height: var(--ct-leading-tight);
}
h1, .h1 { font-size: var(--ct-text-3xl); font-weight: var(--ct-fw-bold); }
h2, .h2 { font-size: var(--ct-text-xl); font-weight: var(--ct-fw-bold); }
h3, .h3 { font-size: var(--ct-text-lg); font-weight: var(--ct-fw-semi); }

/* ---- Page chrome ---- */
.color-background-1,
.gradient { background: var(--ct-bg); }
.page-width { max-width: var(--ct-mw); }
img { max-width: 100%; }
```

- [ ] **Step 2: Verify Theme Check passes**

Run: `shopify theme check`
Expected: no new offenses. (Not yet loaded — loaded in Task 5.)

- [ ] **Step 3: Commit**

```bash
git add assets/theme-overrides.css
git commit -m "feat(css): add theme-overrides base typography layer"
```

---

## Task 5: Patch `theme.liquid` — render tokens, load CSS + JS

**Files:**
- Modify: `layout/theme.liquid` (reset style block closes just before `base.css` at line 258; existing `<script defer>` block at lines 31–40)

- [ ] **Step 1: Render the token snippet inside the reset style block**

Find the `{% endstyle %}` that closes the reset block (immediately before the line `{{ 'base.css' | asset_url | stylesheet_tag }}`). Insert on the line **before** that `{% endstyle %}`:

```liquid
      {%- render 'css-variables' -%}
```

- [ ] **Step 2: Load the override stylesheet after `base.css`**

Immediately **after** the existing line `{{ 'base.css' | asset_url | stylesheet_tag }}`, add:

```liquid
    {{ 'theme-overrides.css' | asset_url | stylesheet_tag }}
```

- [ ] **Step 3: Load the 8 JS utilities (defer)**

Immediately after the existing `<script src="{{ 'search-form.js' | asset_url }}" defer="defer"></script>` line (in the `<head>` script block), add:

```liquid
    <script src="{{ 'ct-reveal.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'ct-countup.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'ct-swipe.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'ct-accordion.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'ct-ba.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'ct-scrollspy.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'ct-sticky-atc.js' | asset_url }}" defer="defer"></script>
    <script src="{{ 'ct-quickview.js' | asset_url }}" defer="defer"></script>
```

> The JS files don't exist yet — they're created in Tasks 6–8. A 404 on a missing asset is harmless to page render, but complete Tasks 6–8 before the final verify.

- [ ] **Step 4: Verify Theme Check passes**

Run: `shopify theme check`
Expected: no new offenses. Confirm no `{% %}` or `{{ }}` ended up inside any CSS comment in the style block (fatal parse error if so).

- [ ] **Step 5: Verify in preview**

In `shopify theme dev` preview, open the homepage. Expected: page still renders (no white screen), Public Sans is applied to body text, background is `#F4F6F8`. Inspect `<html>` → computed `font-size` is still ~10px (Dawn's 62.5% preserved, NOT 16px).

- [ ] **Step 6: Commerce smoke-test**

Open a product → select variant → Add to Cart → drawer opens → checkout button reaches checkout. Must match stock Dawn.

- [ ] **Step 7: Commit**

```bash
git add layout/theme.liquid
git commit -m "feat(layout): render ct tokens, load overrides css + 8 js utils"
```

---

## Task 6: Create `ct-reveal.js` + `ct-countup.js`

**Files:**
- Create: `assets/ct-reveal.js`, `assets/ct-countup.js`

- [ ] **Step 1: Write `ct-reveal.js`**

```js
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const els = document.querySelectorAll('[data-reveal]');
  if (reduced) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = +(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  els.forEach((el) => io.observe(el));
})();
```

- [ ] **Step 2: Write `ct-countup.js`**

```js
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target, to = +el.dataset.to, suffix = el.dataset.suffix || '', dur = reduced ? 0 : 1600;
      if (!dur) { el.textContent = to + suffix; return; }
      const start = performance.now();
      requestAnimationFrame(function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(p * to) + suffix;
        if (p < 1) requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-countup]').forEach((el) => io.observe(el));
})();
```

- [ ] **Step 3: Verify Theme Check + no console errors**

Run: `shopify theme check` → clean. In preview, open homepage, check the browser console → no errors from these files.

- [ ] **Step 4: Commit**

```bash
git add assets/ct-reveal.js assets/ct-countup.js
git commit -m "feat(js): add ct-reveal and ct-countup utilities"
```

---

## Task 7: Create `ct-swipe.js` + `ct-accordion.js` + `ct-ba.js`

**Files:**
- Create: `assets/ct-swipe.js`, `assets/ct-accordion.js`, `assets/ct-ba.js`

- [ ] **Step 1: Write `ct-swipe.js`**

```js
(function () {
  'use strict';
  function init(el) {
    let startX, scrollLeft, dragging = false;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (e) => {
      dragging = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; el.style.userSelect = 'none';
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.2;
    });
    ['pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => {
      dragging = false; el.style.cursor = 'grab'; el.style.userSelect = '';
    }));
  }
  document.querySelectorAll('[data-swipe]').forEach(init);
})();
```

- [ ] **Step 2: Write `ct-accordion.js`**

```js
(function () {
  'use strict';
  document.querySelectorAll('[data-accordion]').forEach((root) => {
    const btns = root.querySelectorAll('[data-accordion-btn]');
    btns.forEach((btn) => {
      const panel = btn.nextElementSibling;
      panel.style.overflow = 'hidden'; panel.style.maxHeight = '0';
      panel.style.transition = 'max-height 0.28s ease';
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btns.forEach((b) => { b.setAttribute('aria-expanded', 'false'); b.nextElementSibling.style.maxHeight = '0'; });
        if (!open) { btn.setAttribute('aria-expanded', 'true'); panel.style.maxHeight = panel.scrollHeight + 'px'; }
      });
    });
  });
})();
```

- [ ] **Step 3: Write `ct-ba.js`**

```js
(function () {
  'use strict';
  document.querySelectorAll('[data-ba]').forEach((root) => {
    const after = root.querySelector('.ct-ba-after'), handle = root.querySelector('.ct-ba-handle');
    if (!after || !handle) return;
    let dragging = false;
    function setPos(pct) {
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)'; handle.style.left = pct + '%';
    }
    setPos(50);
    function getPct(e) { const r = root.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; }
    handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
    root.addEventListener('pointermove', (e) => { if (dragging) setPos(getPct(e)); });
    ['pointerup', 'pointercancel'].forEach((ev) => root.addEventListener(ev, () => { dragging = false; }));
  });
})();
```

> Note the `.ct-ba-after` / `.ct-ba-handle` class names (ct-prefixed per spec §5; the demo uses `.ba-after`/`.ba-handle`).

- [ ] **Step 4: Verify Theme Check + console**

Run: `shopify theme check` → clean. Preview → no console errors.

- [ ] **Step 5: Commit**

```bash
git add assets/ct-swipe.js assets/ct-accordion.js assets/ct-ba.js
git commit -m "feat(js): add ct-swipe, ct-accordion, ct-ba utilities"
```

---

## Task 8: Create `ct-scrollspy.js` + `ct-sticky-atc.js` + `ct-quickview.js`

**Files:**
- Create: `assets/ct-scrollspy.js`, `assets/ct-sticky-atc.js`, `assets/ct-quickview.js`

- [ ] **Step 1: Write `ct-scrollspy.js`**

```js
(function () {
  'use strict';
  const navs = document.querySelectorAll('[data-scrollspy]'); if (!navs.length) return;
  const links = [...navs].flatMap((n) => [...n.querySelectorAll('a[href^="#"]')]);
  const targets = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.removeAttribute('aria-current'));
      const a = links.find((l) => l.getAttribute('href') === '#' + entry.target.id);
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  targets.forEach((t) => io.observe(t));
})();
```

- [ ] **Step 2: Write `ct-sticky-atc.js`**

```js
(function () {
  'use strict';
  const buybox = document.getElementById('buybox'), bar = document.getElementById('ct-sticky-atc');
  if (!buybox || !bar) return;
  new IntersectionObserver((entries) => {
    entries.forEach((e) => bar.classList.toggle('is-visible', !e.isIntersecting));
  }, { threshold: 0 }).observe(buybox);
  const btn = bar.querySelector('[data-sticky-atc-btn]');
  const form = document.querySelector('product-form form');
  if (btn && form) btn.addEventListener('click', () => form.requestSubmit());
})();
```

- [ ] **Step 3: Write `ct-quickview.js`**

```js
(function () {
  'use strict';
  let modal = null;
  function close() { if (modal) modal.classList.remove('is-open'); }
  function getModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'ct-qv'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="ct-qv__overlay"></div><div class="ct-qv__panel"><button class="ct-qv__close" aria-label="Close">&#x2715;</button><div class="ct-qv__body"></div></div>';
    modal.querySelector('.ct-qv__overlay').addEventListener('click', close);
    modal.querySelector('.ct-qv__close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.body.appendChild(modal);
    return modal;
  }
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-quickview]'); if (!btn) return;
    const url = btn.dataset.url; if (!url) return;
    const m = getModal();
    m.querySelector('.ct-qv__body').innerHTML = '<div class="ct-skeleton" style="height:360px"></div>';
    m.classList.add('is-open');
    try {
      const html = await (await fetch(url)).text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('.product');
      m.querySelector('.ct-qv__body').innerHTML = content ? content.outerHTML : 'Could not load product.';
    } catch (err) { m.querySelector('.ct-qv__body').innerHTML = 'Error loading product.'; }
  });
})();
```

- [ ] **Step 4: Verify Theme Check + console**

Run: `shopify theme check` → clean. Preview homepage + a product page → no console errors. (Quick-view trigger wiring is added in Task 12; the listener safely no-ops until then.)

- [ ] **Step 5: Commit**

```bash
git add assets/ct-scrollspy.js assets/ct-sticky-atc.js assets/ct-quickview.js
git commit -m "feat(js): add ct-scrollspy, ct-sticky-atc, ct-quickview utilities"
```

---

## Task 9: `theme-overrides.css` — button system

**Files:**
- Modify: `assets/theme-overrides.css` (append)

- [ ] **Step 1: Append the button layer**

```css
/* ---- Buttons (skins Dawn's .button; never touch .shopify-payment-button) ---- */
.button,
.shopify-challenge__button,
.customer button {
  font-family: var(--ct-font-body);
  font-weight: var(--ct-fw-semi);
  border-radius: var(--ct-r-md);
  transition: background var(--ct-dur-base) var(--ct-ease-out),
              transform var(--ct-dur-fast) var(--ct-ease-out),
              box-shadow var(--ct-dur-base) var(--ct-ease-out);
}
.button--primary,
.button:not(.button--secondary):not(.button--tertiary) {
  --color-button: var(--ct-accent-strong);
}
.button:hover { transform: translateY(-1px); }
.button:focus-visible { box-shadow: var(--ct-focus); outline: none; }

/* Loading / success states toggled by JS classes (used by sticky ATC etc.) */
.button.is-loading { pointer-events: none; color: transparent; position: relative; }
.button.is-loading::after {
  content: ''; position: absolute; inset: 50% auto auto 50%;
  width: 16px; height: 16px; margin: -8px 0 0 -8px;
  border: 2px solid currentColor; border-top-color: transparent;
  border-radius: 50%; animation: ct-spin 0.6s linear infinite;
}
.button.is-success { background: var(--ct-success) !important; }
@keyframes ct-spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 2: Verify**

Run: `shopify theme check` → clean. Preview a product page → ATC and "View details" buttons show brand green, rounded corners, lift on hover, brand focus ring on keyboard focus. Payment (Shop Pay) button is unchanged.

- [ ] **Step 3: Commit**

```bash
git add assets/theme-overrides.css
git commit -m "feat(css): add button system overrides"
```

---

## Task 10: `theme-overrides.css` — `.ct-field` form pattern

**Files:**
- Modify: `assets/theme-overrides.css` (append)

- [ ] **Step 1: Append the form pattern**

```css
/* ---- ct-field: floating-label wrapper (visual only; never replaces Dawn form logic) ---- */
.ct-field { position: relative; margin-bottom: var(--ct-space-3); }
.ct-field__input {
  width: 100%; padding: 20px var(--ct-space-3) 8px;
  font-family: var(--ct-font-body); font-size: 16px; /* 16px = iOS no-zoom */
  color: var(--ct-text); background: var(--ct-bg-surface);
  border: 1.5px solid var(--ct-border); border-radius: var(--ct-r-md);
  outline: none; appearance: none;
  transition: border-color var(--ct-dur-base) var(--ct-ease-out);
}
.ct-field__input:focus { border-color: var(--ct-accent-strong); box-shadow: var(--ct-focus); }
.ct-field__label {
  position: absolute; left: var(--ct-space-3); top: 50%; transform: translateY(-50%);
  font-size: var(--ct-text-md); color: var(--ct-text-3); pointer-events: none;
  transition: all var(--ct-dur-base) var(--ct-ease-out);
}
.ct-field__input:focus + .ct-field__label,
.ct-field__input:not(:placeholder-shown) + .ct-field__label {
  top: 10px; transform: translateY(0) scale(0.78); color: var(--ct-text-3);
}
.ct-field.has-error .ct-field__input { border-color: var(--ct-error); }
.ct-field__error { font-size: var(--ct-text-sm); color: var(--ct-error); margin-top: var(--ct-space-1); }
```

- [ ] **Step 2: Verify**

Run: `shopify theme check` → clean. (Visual confirmation happens when `.ct-field` wrappers are used in later phases; this task just defines the pattern.)

- [ ] **Step 3: Commit**

```bash
git add assets/theme-overrides.css
git commit -m "feat(css): add ct-field floating-label form pattern"
```

---

## Task 11: `theme-overrides.css` — focus, skeleton, badges, scroll-reveal, swatches, rating fix

**Files:**
- Modify: `assets/theme-overrides.css` (append)

- [ ] **Step 1: Append the shared atoms**

```css
/* ---- Focus ring (universal, keyboard only) ---- */
:where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
  outline: none; box-shadow: var(--ct-focus);
}

/* ---- Scroll reveal base (paired with ct-reveal.js) ---- */
[data-reveal] {
  opacity: 0; transform: translateY(20px);
  transition: opacity var(--ct-dur-slow) var(--ct-ease-out),
              transform var(--ct-dur-slow) var(--ct-ease-out);
}
[data-reveal].is-visible { opacity: 1; transform: translateY(0); }

/* ---- Skeleton shimmer ---- */
.ct-skeleton {
  background: linear-gradient(90deg, var(--ct-bg-surface) 25%, var(--ct-bg-raised) 50%, var(--ct-bg-surface) 75%);
  background-size: 200% 100%; border-radius: var(--ct-r-md);
  animation: ct-shimmer 1.4s ease infinite;
}
@keyframes ct-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ---- Badges ---- */
.ct-badge {
  display: inline-block; padding: 2px 8px; border-radius: var(--ct-r-sm);
  font-size: var(--ct-text-xs); font-weight: var(--ct-fw-bold); line-height: 1.6;
  font-family: var(--ct-font-mono); letter-spacing: .04em; color: #fff;
}
.ct-badge--sale { background: var(--ct-badge-sale); }
.ct-badge--new { background: var(--ct-badge-new); }
.ct-badge--sold-out { background: var(--ct-stock-out); }

/* ---- Rating stars fix (Dawn SVGs use currentColor → render white on cards) ---- */
.rating__stars svg,
.rating-star { color: var(--ct-rating); fill: var(--ct-rating); }

/* ---- Variant swatches: hide Dawn radios, style labels (CSS only) ---- */
.variant-picker .swatch input[type="radio"],
fieldset.product-form__input input[type="radio"] {
  position: absolute; opacity: 0; width: 0; height: 0;
}
.variant-picker .swatch label,
fieldset.product-form__input label.swatch {
  display: flex; align-items: center; justify-content: center;
  min-width: 36px; height: 36px; padding: 0 12px;
  border: 2px solid var(--ct-border); border-radius: var(--ct-r-sm);
  cursor: pointer; font-size: var(--ct-text-sm); font-weight: var(--ct-fw-semi);
  transition: border-color var(--ct-dur-fast) var(--ct-ease-out),
              transform var(--ct-dur-fast) var(--ct-ease-out);
}
.variant-picker .swatch input:checked + label,
fieldset.product-form__input input:checked + label.swatch {
  border-color: var(--ct-accent); transform: scale(1.06);
}
```

> The swatch selectors are first-pass guesses against Dawn's variant-picker markup. **In the verify step, inspect the real PDP DOM** and adjust the selectors if they don't match — do NOT change the radio inputs themselves.

- [ ] **Step 2: Verify**

Run: `shopify theme check` → clean. Preview a product page with variants → swatches render as bordered pills/chips, selected one scales up + brand border; rating stars (on a product with reviews/metafield) are amber, not white. Variant selection still updates price/availability (commerce intact).

- [ ] **Step 3: Commit**

```bash
git add assets/theme-overrides.css
git commit -m "feat(css): add focus, skeleton, badges, swatches, rating fix"
```

---

## Task 12: Edit `card-product.liquid` — overlay + Quick-View + %-off badge

**Files:**
- Modify: `snippets/card-product.liquid` (additive markup inside `.card__media`)

Dawn already renders the secondary image (`show_secondary_image`) and a sale badge — we **reuse those** and add only the overlay + Quick-View trigger + a %-off badge.

- [ ] **Step 1: Add the %-off badge + hover overlay**

Find the closing `</div>` of the `<div class="media media--transparent media--hover-effect">` block (it wraps the `<img>` tags, after the secondary-image `{%- endif -%}`). Immediately **after** that closing `</div>` (still inside `.card__media`), insert:

```liquid
        {%- if card_product.compare_at_price > card_product.price and card_product.available -%}
          {%- assign ct_pct = card_product.compare_at_price
            | minus: card_product.price
            | times: 100.0
            | divided_by: card_product.compare_at_price
            | round
          -%}
          <span class="ct-badge ct-badge--sale ct-card__badge">-{{ ct_pct }}%</span>
        {%- endif -%}
        <div class="ct-card__overlay" aria-hidden="true">
          <button
            type="button"
            class="ct-card__qv-btn"
            data-quickview
            data-url="{{ card_product.url }}"
            tabindex="-1"
            aria-label="{{ 'products.product.choose_options' | t }} {{ card_product.title | escape }}"
          >
            {{ 'products.product.choose_options' | t }}
          </button>
        </div>
```

- [ ] **Step 2: Add card overlay CSS to `theme-overrides.css`**

```css
/* ---- Product card overlay (paired with card-product.liquid edit) ----
   Dawn already sets .card__media { position: absolute } (component-card.css),
   the containing block for these absolute children — do NOT re-position it. */
.ct-card__badge { position: absolute; top: 10px; left: 10px; z-index: 2; }
.ct-card__overlay {
  position: absolute; inset: auto 0 0 0; padding: var(--ct-space-3);
  display: flex; justify-content: center;
  opacity: 0; transform: translateY(8px);
  transition: opacity var(--ct-dur-base) var(--ct-ease-out),
              transform var(--ct-dur-base) var(--ct-ease-out);
  pointer-events: none;
}
.card-wrapper:hover .ct-card__overlay { opacity: 1; transform: translateY(0); pointer-events: auto; }
.ct-card__qv-btn {
  width: 100%; height: 40px; border: none; cursor: pointer;
  background: var(--ct-bg-raised); color: var(--ct-text);
  border-radius: var(--ct-r-md); font-weight: var(--ct-fw-semi);
  box-shadow: var(--ct-shadow-md);
}
.ct-card__qv-btn:hover { background: var(--ct-accent); color: #fff; }
```

- [ ] **Step 3: Verify Theme Check passes**

Run: `shopify theme check`
Expected: clean. Confirm balanced Liquid (no unclosed `if`).

- [ ] **Step 4: Verify in preview + Quick View**

Open a collection page. Expected: hovering a card reveals the "Choose options" overlay button; sale products show a `-N%` badge; clicking the overlay button opens the Quick-View modal with the product loaded (skeleton → product). Add-to-cart from a card (Dawn quick-add, if enabled) still works.

- [ ] **Step 5: Commit**

```bash
git add snippets/card-product.liquid assets/theme-overrides.css
git commit -m "feat(card): add hover overlay, quick-view trigger, %-off badge"
```

---

## Task 13: Edit `cart-drawer.liquid` — free-shipping bar + upsell slot + trust row

**Files:**
- Modify: `snippets/cart-drawer.liquid` (3 additive slots at verified anchors)

- [ ] **Step 1: Add the free-shipping progress bar (Slot 1)**

Immediately **after** the `</div>` that closes `<div class="drawer__header">` (i.e., after the close button block, before `<cart-drawer-items`), insert:

```liquid
      {%- assign ct_threshold = settings.free_shipping_threshold | default: 5000 -%}
      {%- if ct_threshold == 0 -%}{%- assign ct_threshold = 5000 -%}{%- endif -%}
      {%- if cart != empty -%}
        {%- assign ct_remaining = ct_threshold | minus: cart.total_price -%}
        {%- assign ct_pct = cart.total_price | times: 100 | divided_by: ct_threshold | at_most: 100 -%}
        <div class="ct-cart__bar">
          {%- if ct_remaining > 0 -%}
            <p class="ct-cart__bar-text">
              Add {{ ct_remaining | money }} more for <strong>free shipping</strong>
            </p>
          {%- else -%}
            <p class="ct-cart__bar-text ct-cart__bar-text--reached">You've unlocked free shipping!</p>
          {%- endif -%}
          <div class="ct-cart__bar-track"><div class="ct-cart__bar-fill" style="width:{{ ct_pct }}%"></div></div>
        </div>
      {%- endif -%}
```
> `ct_threshold` + zero-guard sit **above** the `cart != empty` check: avoids `divided_by: 0` if a merchant sets the threshold to 0, and makes the value available to the trust row (Slot 3).

- [ ] **Step 2: Add the upsell slot (Slot 2)**

Immediately **after** the closing `</cart-drawer-items>` tag and **before** `<div class="drawer__footer">`, insert:

```liquid
      {%- comment -%}
        NOTE: .drawer__footer must stay the immediate next sibling of cart-drawer-items
        in the EMPTY state — Dawn's component-cart-drawer.css uses the adjacent combinator
        `cart-drawer-items.is-empty + .drawer__footer { display:none }`. Any element added
        here MUST be guarded by `if cart != empty` (as below) to preserve that.
      {%- endcomment -%}
      {%- if cart != empty and settings.cart_drawer_collection != blank -%}
        <div class="ct-cart__upsell" data-ct-upsell></div>
      {%- endif -%}
```

> The upsell is intentionally an empty styled slot for now; it is populated (Dawn app block / recommendation) in the Cart phase (P4). This task only reserves the markup + style. The comment guards Dawn's footer-hiding adjacent-sibling rule against future insertions.

- [ ] **Step 3: Add the trust row (Slot 3)**

Immediately **before** `<div class="cart__ctas"` (inside `.drawer__footer`), insert:

```liquid
        {%- if cart != empty -%}
          <div class="ct-cart__trust">
            <span>Secure checkout</span>
            <span>Free shipping over {{ ct_threshold | money }}</span>
            <span>90-day returns</span>
          </div>
        {%- endif -%}
```
> Reuses the `ct_threshold` assigned (and zero-guarded) in Slot 1 — no re-assign. Guarded by `cart != empty` for consistency with the other slots.

- [ ] **Step 4: Add cart-drawer CSS to `theme-overrides.css`**

```css
/* ---- Cart drawer slots (paired with cart-drawer.liquid edit) ---- */
.ct-cart__bar { padding: 12px 20px; border-bottom: 1px solid var(--ct-border-subtle); }
.ct-cart__bar-text { font-size: var(--ct-text-sm); color: var(--ct-text-2); margin: 0 0 8px; }
.ct-cart__bar-text--reached { color: var(--ct-accent-text); font-weight: var(--ct-fw-semi); }
.ct-cart__bar-track { height: 6px; border-radius: var(--ct-r-pill); background: var(--ct-bg-control); overflow: hidden; }
.ct-cart__bar-fill { height: 100%; background: var(--ct-accent); border-radius: var(--ct-r-pill); transition: width var(--ct-dur-slow) var(--ct-ease-out); }
.ct-cart__upsell:empty { display: none; }
.ct-cart__trust {
  display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;
  padding: 10px 20px; font-size: var(--ct-text-xs); color: var(--ct-text-3);
  font-family: var(--ct-font-mono);
}
```

- [ ] **Step 5: Verify Theme Check passes**

Run: `shopify theme check`
Expected: clean. Confirm balanced Liquid.

- [ ] **Step 6: Verify in preview + commerce smoke-test**

Add a product to cart → drawer opens. Expected: free-shipping bar shows at top with a filled track proportional to cart total; trust row sits above the checkout button. Changing quantity updates the cart; the checkout button still reaches checkout. Line items, remove, quantity all behave as stock Dawn.

- [ ] **Step 7: Commit**

```bash
git add snippets/cart-drawer.liquid assets/theme-overrides.css
git commit -m "feat(cart): add free-shipping bar, upsell slot, trust row"
```

---

## Task 14: Edit `buy-buttons.liquid` — trust-chip grid below ATC

**Files:**
- Modify: `snippets/buy-buttons.liquid` (additive markup after `</product-form>`)

- [ ] **Step 1: Add the trust chips**

Immediately **after** the `</product-form>` closing tag (and before the `{%- else -%}` of the `if product != blank` branch), insert:

```liquid
    <div class="ct-buy-trust">
      <span class="ct-buy-trust__chip">Free shipping</span>
      <span class="ct-buy-trust__chip">90-day returns</span>
      <span class="ct-buy-trust__chip">2-year warranty</span>
      <span class="ct-buy-trust__chip">Cancel anytime</span>
    </div>
```

- [ ] **Step 2: Add trust-chip CSS to `theme-overrides.css`**

```css
/* ---- Buy-button trust chips (paired with buy-buttons.liquid edit) ---- */
.ct-buy-trust {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: var(--ct-space-3);
}
.ct-buy-trust__chip {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border: 1px solid var(--ct-border-subtle); border-radius: var(--ct-r-md);
  background: var(--ct-bg-surface); color: var(--ct-text-2);
  font-size: var(--ct-text-sm); font-weight: var(--ct-fw-medium);
}
```

- [ ] **Step 3: Verify Theme Check passes**

Run: `shopify theme check`
Expected: clean.

- [ ] **Step 4: Verify in preview + commerce smoke-test**

Open a product page. Expected: a 2×2 grid of trust chips appears directly below the Add-to-Cart button. ATC, dynamic checkout (Shop Pay), and variant selection all behave as stock Dawn.

- [ ] **Step 5: Commit**

```bash
git add snippets/buy-buttons.liquid assets/theme-overrides.css
git commit -m "feat(pdp): add trust-chip grid below ATC"
```

---

## Task 15: `theme-overrides.css` — header sticky glass skin

**Files:**
- Modify: `assets/theme-overrides.css` (append)

CSS-only — no edit to `header.liquid`. Dawn already supports a sticky header (`settings.sticky_header_type`); we restyle it as frosted glass.

- [ ] **Step 1: Append the header skin**

```css
/* ---- Header: Minimals skin + sticky glass ---- */
.header { font-family: var(--ct-font-body); }
.header__menu-item,
.header__active-menu-item { color: var(--ct-text-2); font-weight: var(--ct-fw-medium); }
.header__menu-item:hover { color: var(--ct-text); }
.header-wrapper--sticky.scrolled-past-header,
.shopify-section-header-sticky.scrolled-past-header {
  background: rgba(255, 255, 255, var(--ct-glass));
  backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  box-shadow: var(--ct-shadow-sm); border-bottom: 1px solid var(--ct-border-strong);
}
```

> The sticky selector is a first-pass guess. **In the verify step, scroll the live header, inspect which class Dawn toggles on scroll, and correct the selector if needed.**

- [ ] **Step 2: Verify**

Run: `shopify theme check` → clean. In preview, enable a sticky header in Theme Editor (Header section → sticky), scroll down → header becomes frosted/translucent with blur + subtle shadow. Mobile menu drawer still opens (Dawn JS untouched).

- [ ] **Step 3: Commit**

```bash
git add assets/theme-overrides.css
git commit -m "feat(css): add header sticky-glass skin"
```

---

## Task 16: `theme-overrides.css` — cart-notification skin

**Files:**
- Modify: `assets/theme-overrides.css` (append)

- [ ] **Step 1: Append the cart-notification skin**

```css
/* ---- Cart notification (Dawn ships this largely unstyled) ---- */
.cart-notification {
  background: var(--ct-bg-raised); border: 1px solid var(--ct-border-strong);
  border-radius: var(--ct-r-xl); box-shadow: var(--ct-shadow-lg);
  font-family: var(--ct-font-body);
}
.cart-notification__heading,
.cart-notification-product__name { color: var(--ct-text); font-weight: var(--ct-fw-semi); }
.cart-notification__links .button { border-radius: var(--ct-r-md); }
```

- [ ] **Step 2: Verify**

Run: `shopify theme check` → clean. In Theme Editor set cart type to "notification" (not drawer); add a product from a product page → the notification popup shows with brand border, radius, shadow, and Public Sans. "View cart" / "Checkout" links still work.

- [ ] **Step 3: Commit**

```bash
git add assets/theme-overrides.css
git commit -m "feat(css): add cart-notification skin"
```

---

## Phase gate (run after Task 16)

- [ ] `shopify theme check` is clean across the whole theme.
- [ ] Homepage, a product page, a collection page, and the cart drawer all render on-brand (Public Sans, green accent, `#F4F6F8` bg) at 375px, 768px, 1280px — **no horizontal scroll** at 375px.
- [ ] Full commerce smoke-test on real mobile: variant → ATC → cart drawer (with free-shipping bar) → checkout. Identical behavior to stock Dawn.
- [ ] Browser console: zero uncaught errors on every surface.
- [ ] `<html>` computed font-size is still ~10px (Dawn's rem scale intact).
- [ ] Lighthouse (incognito, homepage): mobile ≥ 70, desktop ≥ 90.
- [ ] Merge the branch when green: `git checkout main && git merge --no-ff feat/minimals-foundation`.

---

## Notes for later phases

- The token + class vocabulary established here (`--ct-*`, `.ct-*`) is the contract every later plan references.
- `.ct-card__overlay`, `.ct-cart__bar/__upsell/__trust`, `.ct-buy-trust` markup is now live and styled — P3/P4 build on it (e.g., populating the upsell slot).
- Swatch / sticky-header / rating selectors marked "first-pass guess" must be re-confirmed against live DOM during their verify steps; record any corrections back into this file.

### Deferred optimizations (revisit at P5 QA/Lighthouse gate)
Surfaced during Task 5 code review; intentionally deferred to avoid mid-foundation churn:
1. **Double `@font-face` load.** Our `font_heading`/`font_body` settings emit `@font-face` in `css-variables.liquid` while Dawn separately emits `@font-face` for its native `type_header_font`/`type_body_font`. If the merchant's Dawn typography differs from the brand fonts, both families download (one unused). At the perf gate, either guide merchants to align Dawn typography with brand fonts, or consolidate to reuse Dawn's `type_*_font` settings (mirroring how we reused `page_width`).
2. **Unconditional global JS.** All 8 `ct-*.js` load on every page; `ct-sticky-atc.js` (product-only) and `ct-quickview.js` (product-card pages) are candidates for `{% if %}` page-type guards or concatenation if Lighthouse shows impact.
3. **`forced-color-adjust: none` a11y tradeoff.** The mandated light-mode lock opts the theme out of Windows High-Contrast mode. Confirm this tradeoff is acceptable at the final gate (it is a deliberate design-system requirement, but a real accessibility regression for high-contrast users).

### Deferred to P4 (Quick View component)
Surfaced during Task 12 review; the real Quick View component is built in P4, so refine there:
4. **Card overlay label/conditions.** The overlay renders for sold-out products with a `choose_options` label. When the P4 Quick View component lands, give it a proper "Quick view" label (add a `quick_view` key to `en.default.json`) and decide whether to suppress/relabel for unavailable products.
5. **`ct-quickview.js` robustness.** It currently fetches the full product URL and injects `.product` HTML — `<script>` tags won't re-execute, so the in-modal variant/ATC form is non-functional, and the `.product` selector fails on custom product templates. In P4, switch to `fetch(url + '?section_id=<product-section>')` (section-only HTML) and add script re-execution (or scope the modal to gallery + "view full product" link). Also consider removing the persistent modal node on SPA navigation.
6. **Cart-slot copy → locale keys.** The cart free-shipping bar text and the three trust-row labels ("Secure checkout" / "Free shipping over …" / "90-day returns") are hardcoded English foundation slots. In P4, move them to `en.default.json` locale keys (and/or schema text fields) before non-English use.
7. **`.ct-cart__upsell:empty` whitespace.** When P4 populates the upsell slot via JS, it must not leave whitespace/text nodes inside the div, or the `:empty { display:none }` rule won't match (use `innerHTML=''` / remove children when clearing).
</content>
