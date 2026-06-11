# Prompt: Convert this HTML design into a Shopify (Online Store 2.0) Liquid theme

> Give this whole document to your AI coding assistant **together with the file `product-page-full.html`**.
> `product-page-full.html` is the single source of truth for layout, copy, colors, and behavior. Reproduce it faithfully; do not redesign.

---

## 1. Objective

Build a minimal **single-product Shopify theme** from the attached HTML. The store sells **one hero product** (a metal flower garden stake / 3‑in‑1 bird bath). The **home page and the product page must render the exact same design from the exact same set of sections** — a customer landing on `/` or on `/products/the-stake` sees an identical page.

Target: **Online Store 2.0**, JSON templates, sections-everywhere, fully editable in the theme customizer. Light mode only. Brand color is **green**.

---

## 2. The architecture that avoids the problems I keep hitting

I have had these recurring problems and the theme must be built to make them impossible:

- **"When I change the home page and product page I must delete all current sections first, or the wrong section loads."**
- **"If the new design has a new section I have to rename it to load correctly."**

Both come from sections being coupled to the template/layout incorrectly. Build it this way instead:

1. **Every visual block from the HTML becomes its own section file** in `/sections/`, each with a unique, stable `type` (the filename without `.liquid`). One block = one file = one `type`. Never bundle unrelated blocks into one section.
2. **Do not hardcode any block with `{% section %}` in `layout/theme.liquid`** except the global header/footer if you choose. Everything else is added through **JSON templates** so the customizer controls order.
3. **`templates/index.json` and `templates/product.json` contain the same ordered list of the same section `type`s** with the same default settings. That guarantees home == product. (Keep them in sync; if you change one, change the other.)
4. **Each section defines a `{% schema %}` with `presets`** so it can be added/reordered/removed in the customizer without editing code, and so adding a brand-new section later is just "Add section" — no renaming, no deleting everything.
5. **All editable content lives in section/block settings**, not hardcoded in markup. Swapping a design then means editing settings, not ripping out and re-adding sections.
6. **Scope every section's CSS and JS to that section instance** (prefix with `#shopify-section-{{ section.id }}` or a `data-section-id` the JS reads). This is what lets a section be reordered, duplicated, or removed without breaking siblings or loading the "wrong" one.

Deliver this file tree. **Build it as a standalone/skeleton theme — do NOT start from Dawn or any base theme** (their global CSS will override the design; see §2.5, Cause 3):

```
/layout/theme.liquid            (doctype, <head>, fonts, hard CSS reset, global CSS vars, {{ content_for_header }}, header + footer + {{ content_for_layout }}, sticky bar, global JS)
/templates/index.json           (home — FULLY populated shared section list, every setting written out)
/templates/product.json         (product — the SAME fully-populated section list as index.json)
/sections/*.liquid              (one per block, see section list below — and NO other section files)
/snippets/media-slot.liquid     (reusable image/video slot — see §5)
/config/settings_schema.json    (global brand colors + fonts + announcement content, defaults = design values)
/config/settings_data.json      (ship the exact brand tokens so global settings can't carry stale values)
/assets/base.css                (the design's CSS, copied verbatim; loaded in <head>, not deferred)
/assets/theme.js                (shared helpers; per-section JS scoped by section id)
/locales/en.default.json
```

---

## 2.5 ⚠️ Make it match the design 100% — and stop "old / wrong / unstyled" sections from loading

This is the part that usually goes wrong. In Shopify, **what renders on a page is NOT just your code.** It is:

> your section code **+** the saved JSON template **+** the saved `config/settings_data.json` **+** any edits the merchant made in the customizer **+** whatever CSS the base theme ships.

Almost every "it loaded the old section / the section has the wrong content / it doesn't look like the design" bug traces to one of the six causes below. Build to neutralize **all** of them.

**Cause 1 — Saved customizer/JSON state persists and overrides your code.**
Once a section is saved in the theme editor, its settings are written into the template JSON and into `settings_data.json`. Re-uploading section code does **not** erase that saved state, so the old content keeps showing.
→ **Ship authoritative, fully-populated JSON templates.** `index.json` and `product.json` must list the complete section order **with every setting value written out to match the design** — do not rely on schema defaults to fill them in. These files ARE the intended page state.
→ Publish this as a **fresh theme**; do not paste these sections into an already-customized theme. If old sections still appear after install, that's leftover JSON/customizer state — re-copy the shipped JSON over it (see §11).

**Cause 2 — Leftover or duplicate section files, or reused `type`s.**
Any old file left in `/sections/` still renders if a JSON references it, and two sections that do "almost the same thing" cause the wrong one to load.
→ **One block = one file = one unique `type`.** Delete every section file that isn't in the §7 list. Never let two `type`s output different markup for the same block. The `type` in the JSON must exactly equal the section filename (minus `.liquid`).

**Cause 3 — A base theme's CSS overriding the design (the #1 "doesn't look like the design" cause).**
If you build on Dawn or any base theme, its reset, typography, spacing, and component CSS fight the design.
→ **Build as a skeleton/standalone theme with NO inherited component CSS.** Put a hard reset at the top of the design's CSS (`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}` plus list/button/table resets), then the design's own CSS **copied verbatim from `product-page-full.html`**. Nothing but the design's CSS should style the page. Do not re-author the CSS from memory — copy it.

**Cause 4 — Shopify wraps every section in `<div id="shopify-section-{id}">`.**
That injected wrapper silently breaks any CSS that relied on `body > section`, `:first-child`, adjacent siblings (`+`/`~`), or full-bleed page width — so spacing collapses and full-width bands stop reaching the edges.
→ Don't depend on cross-section parent/sibling/`:first-child` relationships. Apply each section's spacing and full-bleed **inside** the section. Add `#shopify-section-{{ section.id }}{margin:0}` and re-establish full-bleed bands (announcement, brand strip, trust marquee, footer) within the section itself.

**Cause 5 — Settings without matching defaults render empty or as placeholder.**
If content is parameterized but the `default` isn't set to the real text, a fresh section shows blank/lorem instead of the design.
→ **Every setting's `default` must equal the exact text / number / color / image-position from the HTML**, AND the same value must be written into the shipped JSON. Acceptance test: a clean install with zero manual editing looks pixel-identical to `product-page-full.html`.

**Cause 6 — Stale global settings + async/missing CSS or fonts.**
Old `settings_data.json` carries previous colors/fonts; deferred or missing CSS/fonts cause a flash of unstyled content or the wrong typography.
→ Ship `config/settings_data.json` with the exact tokens from §3. Load the design CSS and **Poppins + Inter in `<head>`, not deferred.** Reference assets via `| asset_url` so the version hash busts the CDN cache on update.

**How to actually verify 100% fidelity (do this, don't eyeball from memory):**
Open `product-page-full.html` and the theme preview **side by side** at **1440px, 768px, and 390px**. They must match element-for-element: same section order, spacing, font families/sizes/weights, colors (via the vars), border radii, shadows, badge/pill colors, marquee direction and speed, gallery/carousel behavior, and the contain-not-crop media. Any difference is a bug — fix the theme to the HTML, never the other way around.

---


Green is the brand color. Expose these as theme settings (with these defaults) and render them as `:root` CSS variables so the merchant can retune without touching code:

```
--green:        #1e7d34   /* PRIMARY brand: CTAs, prices, savings math, links, marquee bands */
--green-d:      #176a2b   /* darker green: hovers, key spec values */
--green-tint:   #eef7f0   /* green wash: tip boxes, benefit bar, badges */
--teal:         #149a98   /* accent, used ONLY in the Protection panel */
--teal-tint:    #e7f6f5
--sale:         #e23a2a   /* sale red, ONLY for strikethrough "SAVE %" / problem rows */
--gold:         #f4b400   /* ONLY star ratings + "premium" spec stars */
--ink:          #16181d   /* near-black text */
--muted:        #6b7280   /* secondary text */
--line:         #e7e9ec   /* hairlines/borders */
--soft:         #f6f8f9   /* soft section backgrounds, footer */
page background: #ffffff (light mode locked — never a dark page background)
```

Fonts: **Poppins** for headings, **Inter** for body (load the same way the HTML does). Keep the same radius/shadow tokens the HTML uses.

Color usage rules (keep consistent across the theme): green leads all primary actions and pricing; teal only inside the Protection panel; gold only for stars; red only for sale strikethrough and "problem" comparison rows.

---

## 4. Featured-product handling (so the buy box works on BOTH pages)

The buy box + gallery need product data on the home page too:

- On **product.json**, the product sections read the native `product` object.
- On **index.json**, the same sections must resolve a product from a **`product` picker setting** in their schema: `{% assign p = section.settings.product | default: product %}`. The merchant selects the hero product once.
- Variant data (colors/sizes), price, compare-at price, and the Add-to-Cart form must use real Shopify objects (`product.variants`, `product.selected_or_first_available_variant`, `/cart/add`), **not** hardcoded values. Replace the demo "From $24.95" with `{{ product.price | money }}` and the GID placeholders with real `variant.id`.

---

## 5. Media slot rule — full image, never cropped (critical)

Create `snippets/media-slot.liquid` and use it for **every** image/video placeholder in the design. Requirements:

- Render real media with **`object-fit: contain`** inside a **fixed-size slot** so the whole image always shows and the card/section never changes size. Letterbox empty space with a neutral background (`#f3f5f4` light slots; `#0d0f12` for video tiles).
- Each slot keeps the **fixed dimensions from the HTML**: gallery = square (1:1); feature blocks = 4:3; loved‑by video tiles = 4:5; related‑product cards = 1:1; **review photo = fixed 190px tall** so uploaded review images never resize the card.
- Accept either pattern: a real `<img>`/`<video>` that **replaces** the slot, or one **nested inside** it — both must end up `width:100%`, fixed height, `object-fit:contain`.
- Use Shopify image filters: `image_url: width: 1200 | image_tag: loading: 'lazy'`; never let Shopify's default `cover`/crop behavior in. Provide an `alt` from settings.
- When no image is set, show the existing placeholder (gradient + icon + label) so the customizer preview matches.

---

## 6. Interaction behaviors to preserve exactly

The HTML's JavaScript already behaves correctly. Port **all** of it, but **scope each behavior to its section** (query within `#shopify-section-{{ section.id }}`, attach on `DOMContentLoaded` and on `shopify:section:load` so it re-initializes in the editor). Behaviors to keep working:

- **Product gallery:** horizontal swipe + dot indicators + desktop prev/next arrows; scroll-snap.
- **Product‑info module:** desktop = tabs, mobile = accordion (Specifications / Protection / Why Buy / Shipping & Returns).
- **Bundle/quantity tiers:** radio selection reveals per-unit color dropdowns; updates the selected variant/price.
- **Honest countdown:** counts down to a real recurring daily cutoff — **not** a fake timer that resets on reload.
- **Carousels with dots:** reviews, loved‑by videos, "you may also like" all swipe on mobile with dot indicators (generic `wireDots`).
- **Marquees:** announcement bars, brand strip, and trust band auto-fill/clone their items so the running strip never shows an empty gap at any width, with normalized speed.
- **Sticky add‑to‑cart:** appears after scrolling past the buy box; "Added to cart" toast.
- **Any click‑to‑open popup/lightbox** (e.g. the video tiles' play overlay): keep it, scoped to its section.

Mobile: every horizontal-content section swipes/scrolls with a dot indicator; the comparison table scrolls horizontally. Don't lose any of this.

---

## 7. Section-by-section spec (top → bottom)

Build one section file per item. Each lists: **type (filename)** · purpose · key settings/blocks · data source · behavior · color. Keep all copy from the HTML; expose it as settings with those defaults.

1. **`announcement-bars`** — two stacked scrolling marquees. Bar 1 (light grey): phone / 24‑7 / email. Bar 2 (green‑tint): ships‑from / returns / free‑ship / warranty. Settings: each message text + icon, colors, scroll speed, show/hide. Behavior: auto-fill marquee. *(Can live in `theme.liquid` or as a section pinned at top of both templates.)*
2. **`header`** — wordmark logo (text or image), search/account/cart icons, cart count. Global, in `theme.liquid`. Green accent in the logo. Mobile: hide icon labels ≤560px.
3. **`product-buy`** — the main product block: media gallery (swipe/dots/arrows) **+** buy box (title, sold-by + star rating row, "Great Value" value bar with countdown, made-in + Secure bar, current price + compare-at strikethrough + red SAVE, divider, 4 bundle tiers with green "Save X%" pills + corner badges + per-unit color pickers, green **Add to cart**, trust mini-row 🔒/↩️/🚚). Data: real `product`/variants (see §4). Color: green price/CTA/savings; red strikethrough; gold stars. This is the only section that's product-data-heavy.
4. **`product-info`** — tabs (desktop) / accordion (mobile) with 4 panels:
   - *Specifications:* the full spec table (Product type, Main use, Material, Flower design, Flower diameter, Bowl depth, Overall height, Installation, Tools needed, Outdoor use, Best placement, Wildlife use, Finish, Care, Gift idea) with green key values, gold ★ on select rows, colored badge pills (green "Décor/Easy", teal "Visible", amber "Shine"), zebra striping, and a green‑tint **Tip** box. Use schema **blocks** (label + value + optional badge + optional star) so rows are editable.
   - *Protection:* teal icon grid (Secure payment, Delivery commitment, Data privacy, 24/7 support, Money-back guarantee, Easy returns). Teal accent here only.
   - *Why Buy:* 5 guarantee bullets (worry-free 100%, 30-day returns, 12-month warranty, free tracked shipping, secure checkout).
   - *Shipping & Returns:* Shipping (1–2 day processing, 7–15 day delivery, tracked) / Returns & refunds (30‑day, unused + original packaging, email `[support@yourbrand.com]`) / Warranty (1‑year limited, covers defects, excludes accidental/water damage).
5. **`brand-strip`** — slim green band, brand-name placeholders as plain white running text (no white chips), marquee auto-fill. Settings: list of brand names, speed.
6. **`reviews`** — **5-card** layout (photo on top, name, blue-dot "Verified Buyer", gold stars, bold title, body). Fixed 190px photo (§5); equal-height flex cards; mobile swipe + dots. **Use schema blocks for each review (name, rating, title, body, photo, verified toggle) — leave them empty/placeholder.** Do **not** ship fabricated reviews. Optionally render a Product JSON-LD `aggregateRating` **only when real review blocks exist** (never hardcode a rating).
7. **`feature-blocks`** — section headline (eyebrow + h2 + sub) then 3 alternating image/text rows (4:3 media). Use schema blocks (heading, body, image, two micro-tags, image side). Green eyebrow.
8. **`comparison`** — "us vs alternatives" table; horizontal-scroll on mobile; green check column, red ✗ for others. Rows as blocks.
9. **`trust-marquee`** — green band, white running text (loved by gardeners / free shipping / secure / money-back); marquee auto-fill.
10. **`video-gallery`** — "Loved by gardeners" 3 video tiles (4:5), play-button overlay → lightbox; mobile swipe + dots. Blocks = video/poster per tile.
11. **`faq`** — accordion of Q&A blocks.
12. **`related-products`** — "You may also like" 4 cards (1:1 media, green price, red SAVE badge, green button). Source from a `collection`/`product list` setting or `product.recommendations`; not hardcoded.
13. **`footer`** — light (soft bg, dark text, green accents, hairline top): brand blurb, Info / Customer service / Contact columns, region + payment icons row (use Shopify's native payment icons), copyright. Global, in `theme.liquid`. Add bottom padding so the sticky bar never covers the payment row.
14. **`sticky-atc`** (global, in `theme.liquid`) — fixed bar with thumbnail + name + price + Add to cart, shown after scrolling past the buy box; "Added to cart" toast.

---

## 8. Cart / pricing / discounts

- Bundle "Save X%" and any free-shipping thresholds shown in the UI are **display-only**. The **real** discount and shipping rules must be configured in Shopify admin (Markets, Shipping profiles, Discounts / Shopify **Functions** — note Shopify Scripts is sunset, so use Functions).
- Confirm the market/currency is **US / USD**; render all money with `| money` so it follows store currency (no mixed `$`/`₫`).
- No fake anchor MSRPs: compare-at price must come from the variant's real `compare_at_price`.

---

## 9. Acceptance criteria (the build is done when…)

- [ ] A **clean install with zero manual editing** renders pixel-identical to `product-page-full.html` at 1440 / 768 / 390px (verified side by side, not from memory).
- [ ] `index.json` and `product.json` are **fully populated** (every setting written out) and identical in section list/order; `settings_data.json` ships the exact tokens.
- [ ] Theme is **standalone/skeleton** — no Dawn/base-theme CSS leaking in; CSS is the design's own, copied verbatim, loaded in `<head>` with a hard reset; Poppins + Inter load in `<head>`.
- [ ] No leftover/duplicate section files; every `type` maps 1:1 to a filename and to exactly one block of the design.
- [ ] `/` (home) and `/products/...` render the **identical** design from the **same** section list (`index.json` mirrors `product.json`).
- [ ] Every block is a **separate section** with a unique `type` + `presets`; adding/removing/reordering or adding a NEW section in the customizer works with **no renaming and no "delete everything first."**
- [ ] All CSS/JS is **scoped per section** and re-initializes on `shopify:section:load` (works live in the theme editor).
- [ ] Every media slot uses `object-fit:contain` in a fixed-size box — **no image is ever cropped**, and uploading a review photo never changes the card size.
- [ ] All interactions work: gallery swipe/dots/arrows, tabs↔accordion, bundle pickers, honest countdown, carousels with dots, marquees with no gaps, sticky bar + toast, video popups.
- [ ] Buy box uses **real product/variant data** and a real `/cart/add` form; index uses a product-picker setting for the hero product.
- [ ] Brand color **green** throughout per the usage rules; light mode locked.
- [ ] **No fabricated reviews, ratings, stats, press logos, or fake timers.** Review/aggregateRating render only from real data.
- [ ] Spec/policy content matches §7; contact email is a placeholder for the merchant to set.

---

## 10. Do / Don't

**Do:** keep the HTML's exact look, copy, and behavior; expose content via settings/blocks; scope per section; use Shopify objects and filters; keep it accessible (alt text, button labels, aria on accordions).

**Don't:** redesign or restyle; hardcode product data or content that should be settings; bundle multiple blocks into one section; introduce dark backgrounds; add fake social proof; rely on Shopify Scripts; leave any media on `object-fit:cover`.

---

## 11. Installing without dragging in old state (do this on the store)

If the preview is correct but the live store shows old/wrong sections, it's leftover saved state — not the code. To install clean:

1. **Upload as a new, unpublished theme** (don't merge these files into an existing customized theme). Preview it first.
2. Confirm the **shipped `index.json` / `product.json`** are the ones in use — if the theme already had customizer edits, overwrite those two files with the shipped versions so no old section instances remain.
3. In the product, make sure the single hero product exists and is selected in the buy-box section's product picker (and that the home template's picker points to it).
4. Check **Online Store → Preferences / Themes** that there's no leftover legacy template (e.g. an old `product.liquid` or extra `templates/*.json`) — delete templates not part of this theme so Shopify can't fall back to them.
5. Hard-refresh / open in a private window to bypass CDN cache after publishing.
6. Run the §2.5 side-by-side fidelity check at all three widths before going live.

If a section ever loads "empty," it means its JSON instance is missing the settings — re-copy that section's block from the shipped JSON. If it loads "old content," the customizer state was saved over it — re-copy the shipped JSON template.
