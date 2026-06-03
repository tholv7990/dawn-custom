# CozyClaw Redesign — Landing + PDP Alignment Spec

**Date:** 2026-06-03
**Branch:** `feat/minimals-foundation`
**Status:** Active — supersedes the Minimals/green direction in `2026-05-24-dawn-minimals-theme-design.md` for everything user-visible. The Dawn architecture from that earlier spec (frozen commerce layer, `--ct-*` token namespace, `ct-*` sections, per-section CSS loading) still holds — only the brand and per-page composition change here.

---

## 1. Source of truth

Authority order (per `files/CLAUDE.md`):

1. [`files/cozyclaw-design-system.md`](../../../files/cozyclaw-design-system.md) — tokens, components, compliance
2. [`files/cozyclaw-landing-spec.md`](../../../files/cozyclaw-landing-spec.md) — landing build spec
3. [`files/cozyclaw-pdp-spec.md`](../../../files/cozyclaw-pdp-spec.md) — PDP build spec
4. [`files/cozyclaw-landing.html`](../../../files/cozyclaw-landing.html), [`files/cozyclaw-pdp.html`](../../../files/cozyclaw-pdp.html) — reference HTML, **spec wins on conflict**

This redesign spec is a thin delta on top of those — its job is to map the page specs onto the existing `ct-*` sections, identify gaps, and lock the few cross-doc reconciliations.

---

## 2. Locked reconciliations

These resolve conflicts between source docs. They override anything in the source-of-truth files that contradicts them.

| # | Decision | Rationale |
|---|---|---|
| R1 | **Currency = USD**, formatted with the `money` filter (`en-US`). | All three of `files/CLAUDE.md`, `cozyclaw-landing-spec.md`, and `cozyclaw-pdp-spec.md` say USD. `cozyclaw-design-system.md §2.4` mentions VND — **ignore that paragraph**. Live product prices in `templates/product.json` are USD (`$35.97`, `$57.94`). |
| R2 | **Product title = "CozyClaw Lounge Mat"**. | `cozyclaw-landing-spec.md` migration note: reference HTML renders "CozyClaw Mat" but canonical name is "Lounge Mat". |
| R3 | **Footer brand = "CozyClaw"** (Cozy + accent Claw). | Reference HTML line 474 still says "Cuddles Meow" — a bug in the prototype. `files/CLAUDE.md` hard rule #3 forbids "CuddlesMeow" anywhere. |
| R4 | **Scope = landing page + PDP polish + homepage = landing**. Originally homepage was out of scope, but CozyClaw is a single-product store — the homepage `templates/index.json` mirrors `templates/page.landing.json` exactly. No separate merchandising layout. | Single-product storefront; the landing IS the homepage. Keeping two divergent templates would be wasted effort and inconsistent UX. |
| R5 | **Token block is unchanged**. `snippets/css-variables.liquid` already emits the CozyClaw purple values. Reskinning is **not** part of this work. | Already done in P5. The redesign is about *page composition* + *missing primitives*, not tokens. **Correction (2026-06-03):** the brand swap was incomplete — `config/settings_schema.json` `color_accent` default was still `#00A76F` (Minimals green) so `{{ settings.color_accent }}` rendered green storefront-wide. Schema defaults must match `settings_data.json` saved values; the Liquid `\| default:` filter does NOT fire on populated schema defaults. |
| R6 | **Zero edits to Dawn commerce logic.** No changes to `product-form`, variant selects, cart-drawer JS, `name="add"`/`name="id"`/`name="quantity"`. | Inherited non-negotiable from `2026-05-24-dawn-minimals-theme-design.md §3` and `files/CLAUDE.md`. |
| R7 | **Follow the reference design 100% — never add sections that aren't in the source HTML.** No "best sellers" rail, no FAQ accordion, no stats grid, no compare table, no before/after, no newsletter signup unless the reference shows it. Section order matches reference top-to-bottom. Copy comes from reference. | Past failure: the homepage was built as a Minimals-style merchandising layout (best-sellers + stats + compare + BA + faq + email) bearing no resemblance to `cozyclaw-landing.html`. When the user compared the live site to the design, the gap was catastrophic. Anti-pattern: "fill the page with sections we already have." Correct pattern: "render only what the reference shows." |

---

## 3. Architecture

Unchanged from the foundation spec:

- **Layer 1 — Dawn commerce** (frozen).
- **Layer 2 — Tokens** (`snippets/css-variables.liquid`, already CozyClaw purple).
- **Layer 3 — Sections** (`sections/ct-*.liquid` + per-section `assets/section-ct-*.css`).

All new primitives are added inside existing `ct-*` sections or as additional CSS rules in their per-section stylesheets. No new sections are introduced.

---

## 4. Gap analysis — landing page

Compared against `cozyclaw-landing-spec.md` + `cozyclaw-landing.html`, top-to-bottom.

### 4.1 Hero (`sections/ct-hero.liquid` + `assets/section-ct-hero.css`)

Current renders: eyebrow + h1 + italic sub + body + 2 buttons + pills + optional rating + small floating `ct-hero-card` (340px) + optional `ct-hero-float`.

| # | Target primitive | Current state | Action |
|---|---|---|---|
| H1 | `.sale-badge` — urgency-red pill with 🔥 emoji, above h1 | Eyebrow exists but renders as accent-text uppercase, not urgency red. | Add a new schema setting `sale_badge` that emits `.ct-hero-sale-badge` (urgency bg, white text, pill, shadow) above the h1. Keep eyebrow as a separate optional field. |
| H2 | `.hero-rating` — stars + "92% 5-star · 13 verified reviews" | Optional rating row exists below buttons. | Move it to **between description and price-row** (above buttons), per reference HTML order. Schema field already there. |
| H3 | `.price-row` — `.price-now` $35.97 / `.price-was` $44.97 / `.price-save` SAVE 20% pill | Not rendered. | Add schema fields `price_now`, `price_was`, `price_save_label`, emit `.ct-hero-price-row`. |
| H4 | `.avail` — green dot + "In stock — ships in 3–7 business days" | Not rendered. | Add schema field `availability_text`, emit `.ct-hero-avail` (green dot via `::before`, success color text). |
| H5 | `.hero-pills` `.pill` with **check svg icons** | Pills exist (`.ct-hero-pill`), use `•` bullet. | Replace `::before { content:'•' }` with an inline check SVG embedded in the snippet. |
| H6 | `.product-card` — aspect 4/3.4, 120px emoji, neutral bg | Current `.ct-hero-card` is 340px floating card with name+price+tags. | Replace markup: full-width product photo card (aspect 4/3.4, bg `#FCFBFE`, 120px emoji), no name/price/tags overlay. Promo lives outside the image (compliance). |
| H7 | `.gallery` thumbnail row (4 thumbs) below product card | Not rendered. | Add blocks of type `thumb` (emoji + lifestyle flag), emit `.ct-hero-gallery` + `.ct-hero-thumb`. First thumb = primary (accent border). |
| H8 | `.float-tag` — floating size badge bottom-left of product card with anim | Current `.ct-hero-float` is top-right with label/val. | Reposition to bottom-left of visual; markup unchanged. Animation already exists. |

### 4.2 Trust strip (`sections/ct-trust-bar.liquid`)

Current: 3-chip horizontal bar with icon + label + sublabel. **Matches reference.** No change.

### 4.3 Value proposition (`sections/ct-hero-split.liquid`)

Current renders an eyebrow + h2 + body + button + emoji panel (image-left).

Reference: emoji panel on the left, eyebrow + h2 + body + button on the right. **Matches.** No change.

### 4.4 Why choose (`sections/ct-use-cases.liquid` + `assets/section-ct-use-cases.css`)

Current grid: 3 columns at desktop (`.ct-use-case-grid`).
Reference: **2×2 grid** at desktop, single column on mobile.

| # | Target | Action |
|---|---|---|
| W1 | `.why-grid` 2-col with icon-tile + title + body horizontal layout | Update `assets/section-ct-use-cases.css` `.ct-use-case-grid` to `grid-template-columns:repeat(2,1fr)` at desktop. |
| W2 | Card layout: 54px icon tile (accent-subtle bg) + title + body, horizontal | Current card has tag chip + emoji circle + number + title + desc + CTA. Hide the tag/number/CTA on landing via a section-level "compact" setting OR style-only swap. Decision: **section-level "layout" setting** (`grid` default = current, `pillars` = new 2-col horizontal) so existing presets (homepage, PDP, shipping) keep working. |

### 4.5 Bundle (`sections/ct-pricing.liquid` + `assets/section-ct-pricing.css`)

Current renders 3 `.ct-pricing-plan` cards. Featured plan has accent border via `.is-featured`. The landing's plan1 is set `featured:true` with badge "This product".

Reference: **3-card grid**, "This product" card has 2px purple border (`.bundle-card.tag-best`) + "This product" flag pill on top.

| # | Target | Action |
|---|---|---|
| B1 | Featured card 2px accent border + visible "This product" pill flag at top | Verify `.ct-pricing-plan.is-featured` already has 2px `--ct-accent` border. If not, add. Verify badge field renders. |
| B2 | Card emoji icons (🐈 / 🦴 / 🧤) above name | Current pricing card doesn't show emoji. Add schema field `emoji` to the plan block + render above `.ct-pricing-plan__name`. |
| B3 | Save chip (urgency red) below price row | Current has `.ct-pricing-plan__price-note`. Verify it can render the save chip styling. Add schema field `save_text` + emit `.ct-pricing-plan__save` (urgency color, 700 weight). |

### 4.6 Details (`sections/ct-aplus.liquid`)

Current: A+ banner cards with emoji + number + title + body + tag + specs.
Reference: 3-card `.spec-grid` with `.spec-k` (accent-text eyebrow) + `.spec-v` (body).

Decision: **Keep ct-aplus** — it already renders 3 banner cards via blocks. The visual difference (number + tag chip vs spec-k eyebrow) is minor and presentable. **No structural change**, just verify the layout matches at the section preset level.

If user later wants the exact `.spec-card` look, add a "compact" layout setting to `ct-aplus` (deferred).

### 4.7 Marquee (`sections/ct-marquee.liquid`)

**Matches.** No change.

### 4.8 Reviews (`sections/ct-reviews.liquid` + `assets/section-ct-reviews.css`)

Current renders kicker text + heading + 3 review cards.

Reference: **`.rev-top` centered block** above the grid containing:
- `.rev-big` — 56px Fraunces score "4.9"
- Stars (22px)
- Meta line "92% 5-star · based on 13 reviews · Join our 15,000+ happy customers"

| # | Target | Action |
|---|---|---|
| R1 | Large score block above review cards | Add schema fields `big_score`, `big_meta`. Emit a new `.ct-reviews-top` block (score + 22px stars + meta line) when `big_score` is set; otherwise fall through to current kicker layout. Stars render unconditionally when score is set — no separate toggle. |

### 4.9 Shipping & guarantee

Currently rendered via second `ct-aplus` block (`ct_promise` in `page.landing.json`). Reference uses `.assure-grid` 2-col cards.

**ct-aplus 2-banner rendering is acceptable.** No structural change.

### 4.10 Final CTA (`sections/ct-final-cta.liquid`)

Current renders eyebrow + heading + subheading + buttons + trust chips (the `.ct-trust-chip` from `assets/ct-sections.css` — checkmark prefix).

Reference: same structure but `.final-trust` `.pill` style (check svg + small text) instead of trust-chip checkmark prefix.

| # | Target | Action |
|---|---|---|
| F1 | Trust pills use check svg icon | Add a section-level setting `trust_style` = `chips` (current, default) | `pills` (svg). When `pills`, render `.ct-pill` with inline check svg. |

### 4.11 Footer (`sections/ct-footer-group` etc.)

Already done in P5. No change.

### 4.12 Sticky ATC (`sections/ct-sticky-atc.liquid`)

**Matches.** No change.

---

## 5. Gap analysis — PDP

PDP shares 4.4 (Why 2×2), 4.5 (Bundle featured border — though PDP uses bundle tiers, not pricing cards), and 4.8 (Reviews big-number) with landing. Once those are done, the only PDP-specific remaining is:

| # | Item | Current | Action |
|---|---|---|---|
| P1 | Bundle tier featured card border (`.tier.is-active`) | `snippets/ct-bundle-tiers.liquid` + `assets/section-ct-bundle-tiers.css` — verify accent border + accent-subtle tint on `.is-active`. | Verify only; fix if needed. |
| P2 | Trust-icons block (3 round icon badges in buy box) | Already added as `ct_trust_icons` block in `main-product.liquid`. | Verify rendering. |

No new sections. No commerce-logic edits.

---

## 6. Schema additions (summary)

To keep this tractable, **all schema additions are optional** (default blank/false) — existing sections in other templates remain unchanged.

| Section | New setting | Type | Purpose |
|---|---|---|---|
| ct-hero | `sale_badge` | text | Urgency-red pill above h1 |
| ct-hero | `price_now` / `price_was` / `price_save_label` | text | Price row |
| ct-hero | `availability_text` | text | Green-dot in-stock line |
| ct-hero block `thumb` | `emoji` / `is_primary` | text / checkbox | Gallery thumb row |
| ct-use-cases | `layout` | select: `grid` (default) \| `pillars` | 3-col with chips vs 2-col with icon-tile |
| ct-pricing block `plan` | `emoji` / `save_text` | text | Above name; below price row |
| ct-reviews | `big_score` / `big_meta` | text | Large 4.9 score block |
| ct-final-cta | `trust_style` | select: `chips` (default) \| `pills` | Chip vs pill rendering |

---

## 7. CSS additions (per section)

| File | Additions |
|---|---|
| `assets/section-ct-hero.css` | `.ct-hero-sale-badge`, `.ct-hero-price-row` + children, `.ct-hero-avail`, `.ct-hero-gallery` + `.ct-hero-thumb`, repositioned `.ct-hero-float`, replaced `.ct-hero-card` markup |
| `assets/section-ct-use-cases.css` | `.ct-use-case-grid[data-layout="pillars"]` 2-col + horizontal card body |
| `assets/section-ct-pricing.css` | `.ct-pricing-plan__emoji`, `.ct-pricing-plan__save` |
| `assets/section-ct-reviews.css` | `.ct-reviews-top`, `.ct-reviews-big` (56px Fraunces) |
| `assets/section-ct-final-cta.css` | `.ct-pill` (check-svg variant) |

No new CSS files. All token references use `--ct-*`.

---

## 8. JS additions

**None.** All interactions (reveal-on-scroll, sticky ATC, gallery thumb swap) already exist:

- Reveal: `assets/ct-reveal.js` (loaded globally) handles `[data-reveal]`.
- Sticky bar: `assets/ct-sticky-atc.js`.
- Gallery thumb swap on hero: **defer** — for v1 the thumbnails are decorative (first = primary, rest = lifestyle indicators). Wiring up image-swap is a future enhancement.

---

## 9. Compliance (must hold)

Inherited from `cozyclaw-design-system.md §6` + both page specs. None of the changes in this redesign threaten any of these:

- Hero primary image stays clean / text-free / neutral bg. The `.sale-badge`, `.price-save` chip, and any promo are HTML overlays, never baked into the image file.
- Add-ons opt-in (unchanged — PDP rendering already conforms).
- Footer Privacy / Terms / Refund / Cookie + `support@cozyclaw.com` + secure-checkout signal (already in place).
- `prefers-reduced-motion` honored; visible focus rings; 48px tap targets (token-driven).
- No "CuddlesMeow" — enforced by R3.
- Honest urgency claims ("🔥 2,175 sold") — text is editor-driven, merchant responsibility to keep truthful.

---

## 10. Acceptance checklist

Landing page:

- [ ] Hero shows: sale-badge → h1 "CozyClaw Lounge Mat" → italic sub → description → rating row → price row → availability → buttons → check-pill row.
- [ ] Hero visual: big product card (aspect 4/3.4, 120px emoji, neutral bg) + 4-thumb gallery + floating size badge bottom-left.
- [ ] Why choose renders as 2-col on desktop, single column ≤720px.
- [ ] Bundle "This product" card has 2px accent border + "This product" pill flag + 🐈 emoji above name. Add-on cards show 🦴 / 🧤 emoji + save chip.
- [ ] Reviews shows large "4.9" Fraunces score (56px) above the 3 review cards.
- [ ] Final CTA renders check-svg pills (not checkmark chips).
- [ ] Footer reads "CozyClaw" (not "CuddlesMeow"), all 4 legal links present.
- [ ] Sticky ATC reveals after hero scrolls off; mirrors price.
- [ ] All prices render via `money` filter; no hardcoded `$` or `VND`.

PDP:

- [ ] Why choose section (when present) uses same 2-col pillars layout.
- [ ] Reviews same big-score treatment.
- [ ] Bundle tier picker: active tier has 2px accent border + faint accent tint; per-card color selects shown only when active.
- [ ] Trust-icons buy-box block renders 3 round icon badges.
- [ ] No visible native radio/checkbox; selection by card highlight only.

Cross-page:

- [ ] `shopify theme check` count not worse than current baseline (12).
- [ ] No edits to Dawn commerce JS / `product-form` / variant selects / cart-drawer.
- [ ] All new CSS rules use `--ct-*` tokens (no raw brand hex except urgency-red `#D9433A` and rating-gold `#E8A93C`).
- [ ] Existing homepage (`index.json`) and customer pages render unchanged.

---

## 11. Out of scope

- Homepage (`index.json`) — not touched by this redesign.
- Token reskin — already done in P5.
- New sections — none introduced.
- Image-swap JS for hero gallery thumbs — decorative-only in v1.
- A+ banner ↔ spec-card visual swap — deferred unless user requests it.
- Reviews app integration (Judge.me / Loox / Shopify Reviews) — placeholder content only; live data integration is a separate project.

---

## 12. Update to memory

After this spec is implemented, update `dawn-minimals-project.md`:

- VND → USD in the project notes (memory still references VND).
- Add "P6 = CozyClaw redesign alignment (landing hero rebuild + 2-col Why + bundle emoji+save + reviews big-score + final-CTA pills)" to the build log.
