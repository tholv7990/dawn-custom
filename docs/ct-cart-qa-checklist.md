# CT Cart System (W4) — Browser/Interaction QA Checklist

> The owed live-preview QA for the W4 cart features. Static guards
> (`shopify theme check`, `node qa/ct-qa.mjs`, `node --check`) are green and the
> checkout-critical pieces (TnC gate, drawer blockification) each passed a 3-lens
> adversarial review. This covers the interaction/visual checks that need a real
> `shopify theme dev` / preview render + a real checkout attempt.
>
> All four feature toggles are **default OFF** — the cart looks unchanged until
> you enable them in **Theme settings** (the customizer's global settings).

## Setup

```
Preview: https://6x007a-35.myshopify.com/?preview_theme_id=161500889343
Editor : https://admin.shopify.com/store/6x007a-35/themes/161500889343/editor
```

Use a product with a **sale variant** (compare-at > price) and at least 2 products
in the catalog (for upsells/exclude-in-cart). Add items to populate the cart.

---

## 1. Free-shipping progress bar (W4.T02)
Enable: **Theme settings → Cart rewards → Free shipping threshold** = `5000` (=$50).
- [ ] Drawer + `/cart`: bar shows "You're $X away from free shipping" with a progress fill.
- [ ] Add items toward $50 → the bar + fill update on every add/remove/qty change (no reload).
- [ ] Cross $50 → switches to "You've unlocked free shipping!" (success color).
- [ ] Empty cart → bar hidden. Threshold back to `0` → bar gone everywhere (default-off).
- [ ] No layout shift (CLS) when the drawer opens.

## 2. TnC checkout gate (W4.T05)
Enable: **Theme settings → Checkout terms gate → Require terms agreement** ✓.
- [ ] Drawer + `/cart`: an agreement checkbox shows above checkout; checkout button looks disabled.
- [ ] Click checkout **unchecked** → blocked; the role=alert error appears; focus moves to the checkbox (screen-reader announces it).
- [ ] Keyboard: tab to checkout + Enter while unchecked → still blocked (not just mouse).
- [ ] Check the box → checkout proceeds normally.
- [ ] **Shop Pay / dynamic buttons**: while unchecked they're hidden/inert (can't click OR keyboard-activate); after checking, they return.
- [ ] Consent persists across qty changes / drawer re-open. **Empty the cart completely, then re-add** → the box is **unchecked again** (fresh consent required).
- [ ] Drawer box and `/cart` box stay in sync (check one, the other reflects it).
- [ ] Turn the setting OFF → no checkbox anywhere, checkout normal.

## 3. Discount-code field (W4.T05)
Enable: **Theme settings → Cart discount field → Show a discount-code field** ✓.
- [ ] Drawer + `/cart`: a code field + Apply button show.
- [ ] Enter a real code + Apply → navigates to `/discount/CODE?redirect=/cart`, lands on cart with the discount applied (Dawn's discount chip in the totals).
- [ ] Empty code + Apply → inline "Please enter a discount code." (no navigation).

## 4. Upsell rail (W4.T03)
Enable: **Theme settings → Cart upsells → Show an upsell rail** ✓ + pick 2-3 **Upsell products**.
- [ ] Drawer + `/cart`: a "Complete your order" rail shows the picked products (not ones already in cart).
- [ ] Click **Add** on an upsell card → it adds to cart (Dawn product-form), the cart refreshes, and **in the drawer that product disappears from the rail** (self-prune).
- [ ] A product already in the cart never appears in the rail.

## 5. Drawer blockification (W4.T01) — *after it's pushed*
- [ ] **No blocks configured (default):** the drawer footer renders exactly as before — subtotal, then discount/terms (if on), then checkout. Add/qty/remove/checkout all work.
- [ ] Open the **theme editor** → select the **Cart drawer** section → it lists footer blocks (Subtotal, Checkout, Discount, Terms, Custom Liquid).
- [ ] Toggle **"Keep drawer open in the theme editor"** → the drawer stays open while editing (editor only — confirm it's closed on the live preview without the editor).
- [ ] Add the Subtotal + Checkout blocks and **reorder** (e.g. checkout above subtotal) → order changes live in the editor.
- [ ] With blocks added, the storefront cart still **adds/updates/removes/checks out** (the `.cart-drawer__footer` + `#CartDrawer-Checkout` still present).
- [ ] ⚠️ If you remove the Subtotal or Checkout block in the editor, those elements disappear — keep both unless intentionally replacing them.

---

## Cross-cutting
- [ ] All features are **token-only** (brand colors/spacing/radius via `--ct-*`).
- [ ] **Fail-open:** with JS disabled, the cart + native checkout still work (gate/discount/upsell are progressive enhancements).
- [ ] No console errors opening/closing the drawer, adding/removing items, or in the theme editor (`?design_mode`).
- [ ] Mobile + desktop drawer; `/cart` page parity.
