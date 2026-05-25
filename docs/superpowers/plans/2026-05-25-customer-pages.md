# Customer Pages — Minimals Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle all 7 native Dawn customer pages into Minimals by swapping `.field`→`.ct-field` and `<button>`→`.ct-btn`, plus one layout-skin CSS file — with zero edits to Shopify form logic.

**Architecture:** One new `assets/section-ct-customer.css` skins the shared `.customer` markup (cards, tables, address cards, selects, messages). Each customer section loads that file + `ct-sections.css` (for `.ct-btn`); `.ct-field` is already global via `theme-overrides.css`. Markup edits are presentation-only (classes + blanked placeholder). Fail-open.

**Tech Stack:** Shopify Liquid, plain CSS with `--ct-*` tokens. No build step, no JS added. Spec: `docs/superpowers/specs/2026-05-25-customer-pages-design.md`.

**Branch:** `feat/minimals-foundation` (continue here — no new branch/worktree).

**Verification model:** No unit tests. Gate = `shopify theme check`, baseline **14 offenses (2 errors + 12 warnings)**; must stay 14 after every task. CLI is installed (non-interactive; no login needed for `theme check`). Live `shopify theme dev` is the user's manual gate (Task 9).

---

## THE FIELD-SWAP RULE (applies in Tasks 2–8)

Dawn's customer field looks like this everywhere:

```liquid
<div class="field">
  <input type="…" name="…" id="…" …other-attrs… placeholder="{{ 'some.key' | t }}">
  <label for="…">{{ 'some.key' | t }}</label>
</div>
```

Transform **every** such block to (changing ONLY the three marked things; keep every other attribute — `type`, `name`, `id`, `value`, `autocomplete`, `autocapitalize`, `spellcheck`, `aria-*` — byte-identical):

```liquid
<div class="ct-field">
  <input class="ct-field__input" type="…" name="…" id="…" …other-attrs… placeholder=" ">
  <label class="ct-field__label" for="…">{{ 'some.key' | t }}</label>
</div>
```

1. wrapper `class="field"` → `class="ct-field"`
2. `<input>`: add `class="ct-field__input"` as the FIRST attribute; change the `placeholder="…"` value to a single space `" "` (the floating label needs `:placeholder-shown`).
3. `<label>`: add `class="ct-field__label"`.

Do NOT add/remove any other attribute. Error `<small>`/`<span class="form__message">` blocks stay as-is (the CSS styles `.form__message` and `.ct-field__input[aria-invalid="true"]`). The `<input>` already gets `aria-invalid="true"` from Dawn on error — no `has-error` class needed.

**Buttons:** the primary submit `<button>` → `<button class="ct-btn ct-btn--primary ct-btn--full">`; keep any `name=`/`type=` attribute (e.g. `name="decline"`, `type="reset"`). Secondary buttons → `class="ct-btn ct-btn--outlined ct-btn--full"`. Plain navigational `<a>` actions are left as links (the CSS styles `.customer a:not(.ct-btn)`).

**Stylesheet loads:** at the very top of each customer section, immediately after the existing `{{ 'customer.css' | asset_url | stylesheet_tag }}` line, add:

```liquid
{{ 'ct-sections.css' | asset_url | stylesheet_tag }}
{{ 'section-ct-customer.css' | asset_url | stylesheet_tag }}
```

(Keep `customer.css` — it provides baseline + the login `#recover`/`#login` toggle + addresses display logic.)

---

## Task 1: Create the layout-skin CSS

**Files:** Create `assets/section-ct-customer.css`

- [ ] **Step 1: Write `assets/section-ct-customer.css`.**

```css
/* section-ct-customer.css — Minimals skin for Dawn's native customer/account pages.
   Pure presentation over native Shopify customer forms. Loaded by the 7 customer
   sections alongside ct-sections.css (for .ct-btn). .ct-field lives in
   theme-overrides.css (global). Remove this file → working Dawn pages (fail-open). */

/* ---- Shared ---- */
.customer { color: var(--ct-text); }
.customer h1 { font-family: var(--ct-font-heading); font-weight: var(--ct-fw-bold); letter-spacing: -0.02em; }
.customer h2 { font-family: var(--ct-font-heading); font-weight: var(--ct-fw-semi); }
.customer a:not(.ct-btn) { color: var(--ct-accent-text); text-decoration: underline; text-underline-offset: 2px; }
.customer a:not(.ct-btn):hover { color: var(--ct-accent-strong); }

/* messages */
.customer .form__message { display: inline-flex; align-items: center; gap: 6px; font-size: var(--ct-text-sm); color: var(--ct-error); }
.customer .form__message .svg-wrapper svg { width: 16px; height: 16px; }
.customer h3.form__message { color: var(--ct-success-dark); font-weight: var(--ct-fw-semi); }
.customer ul li a { color: var(--ct-error); }
.ct-field__input[aria-invalid="true"] { border-color: var(--ct-error); }

/* ---- Auth pages: centered card ---- */
.customer.login,
.customer.register,
.customer.reset-password,
.customer.activate {
  max-width: 460px;
  margin-inline: auto;
  background: var(--ct-bg-raised);
  border: 1px solid var(--ct-border-subtle);
  border-radius: var(--ct-r-xl);
  box-shadow: var(--ct-shadow-sm);
  padding: var(--ct-space-6) var(--ct-space-5);
}
.customer.login h1,
.customer.register h1,
.customer.reset-password h1,
.customer.activate h1 { font-size: var(--ct-text-2xl); margin: 0 0 var(--ct-space-2); }
.customer.login > div > p,
.customer.register p,
.customer.reset-password p,
.customer.activate p { color: var(--ct-text-2); margin: 0 0 var(--ct-space-4); }
.customer .ct-btn { margin-top: var(--ct-space-2); }
.customer.login a:not(.ct-btn),
.customer.register a:not(.ct-btn),
.customer.activate a:not(.ct-btn) { display: inline-block; margin-top: var(--ct-space-3); font-size: var(--ct-text-sm); }

/* login: recover + login headings spacing; guest divider */
.customer.login h1 + div { margin-bottom: var(--ct-space-5); }
.customer.login hr { border: 0; border-top: 1px solid var(--ct-border-subtle); margin: var(--ct-space-5) 0; }

/* Shop "sign in with Shop" stays native; spacing only */
.customer [name="sign-in-with-shop-provider"] { margin-bottom: var(--ct-space-4); }
.customer [name="sign-in-with-shop-provider"] p { text-align: center; color: var(--ct-text-3); margin: var(--ct-space-3) 0 0; }

/* ---- Native select skin (country / province) ---- */
.customer .select { position: relative; margin-bottom: var(--ct-space-3); }
.customer .select select {
  width: 100%; padding: 14px var(--ct-space-3);
  font-family: var(--ct-font-body); font-size: 16px;
  color: var(--ct-text); background: var(--ct-bg-raised);
  border: 1.5px solid var(--ct-border); border-radius: var(--ct-r-md);
  appearance: none; -webkit-appearance: none;
}
.customer .select select:focus { border-color: var(--ct-accent-strong); box-shadow: var(--ct-focus); outline: none; }
.customer .select .svg-wrapper { position: absolute; right: var(--ct-space-3); top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--ct-text-3); }
.customer label[for^="AddressCountry"],
.customer label[for^="AddressProvince"] { display: block; font-size: var(--ct-text-sm); color: var(--ct-text-2); margin-bottom: var(--ct-space-1); }
.customer [type="checkbox"] { accent-color: var(--ct-accent); margin-right: var(--ct-space-2); }

/* ---- Account dashboard ---- */
.customer.account { max-width: var(--ct-mw); margin-inline: auto; }
.customer.account > div:first-child { display: flex; justify-content: space-between; align-items: center; gap: var(--ct-space-3); margin-bottom: var(--ct-space-5); }
.customer.account h1 { font-size: var(--ct-text-2xl); margin: 0; }
.ct-account__body { display: grid; gap: var(--ct-space-5); }
@media screen and (min-width: 750px) {
  .ct-account__body { grid-template-columns: 1fr 320px; align-items: start; }
}
.ct-account__details {
  background: var(--ct-bg-raised); border: 1px solid var(--ct-border-subtle);
  border-radius: var(--ct-r-lg); padding: var(--ct-space-4);
}
.ct-account__details h2 { font-size: var(--ct-text-lg); margin-top: 0; }

/* order-history table */
.order-history { width: 100%; border-collapse: collapse; }
.order-history th { text-align: left; font-size: var(--ct-text-sm); color: var(--ct-text-3); font-weight: var(--ct-fw-semi); padding: var(--ct-space-2) var(--ct-space-3); border-bottom: 1px solid var(--ct-border); }
.order-history td { padding: var(--ct-space-3); border-bottom: 1px solid var(--ct-border-subtle); font-size: var(--ct-text-base); }
.order-history tbody tr:hover { background: var(--ct-bg-control); }

/* ---- Order detail table ---- */
.order-details { width: 100%; border-collapse: collapse; }
.order-details th,
.order-details td { padding: var(--ct-space-3); border-bottom: 1px solid var(--ct-border-subtle); font-size: var(--ct-text-base); text-align: left; }
.order-details tfoot td { font-weight: var(--ct-fw-semi); }

/* ---- Addresses ---- */
.customer.addresses { max-width: var(--ct-mw); margin-inline: auto; }
.customer.addresses > h1 { font-size: var(--ct-text-2xl); }
.customer.addresses ul[role="list"] { list-style: none; padding: 0; margin: var(--ct-space-5) 0 0; display: grid; gap: var(--ct-space-4); }
@media screen and (min-width: 750px) { .customer.addresses ul[role="list"] { grid-template-columns: repeat(2, 1fr); } }
.customer.addresses li[data-address] {
  background: var(--ct-bg-raised); border: 1px solid var(--ct-border-subtle);
  border-radius: var(--ct-r-lg); padding: var(--ct-space-4);
}
.customer.addresses li[data-address] h2 { font-size: var(--ct-text-sm); color: var(--ct-accent-text); text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 var(--ct-space-2); }
.customer.addresses [data-address] .ct-btn { margin: var(--ct-space-2) var(--ct-space-2) 0 0; }
```

- [ ] **Step 2: Theme check.** Run `shopify theme check` → expect **14**. (A new CSS file alone won't change the count.)

- [ ] **Step 3: Commit.**

```bash
git add assets/section-ct-customer.css
git commit -m "feat(customer): add Minimals skin stylesheet for customer pages"
```

---

## Task 2: Login page

**Files:** Modify `sections/main-login.liquid`

- [ ] **Step 1: Add the two stylesheet loads** after the `customer.css` line (see THE FIELD-SWAP RULE → "Stylesheet loads").

- [ ] **Step 2: Apply the field swap** to both `.field` blocks:
  - `#RecoverEmail` (recover form)
  - `#CustomerEmail` and `#CustomerPassword` (login form)

- [ ] **Step 3: Class the buttons.**
  - Recover form submit `<button>{{ 'customer.login_page.submit' | t }}</button>` → `class="ct-btn ct-btn--primary ct-btn--full"`
  - Login form submit `<button>{{ 'customer.login_page.sign_in' | t }}</button>` → `class="ct-btn ct-btn--primary ct-btn--full"`
  - Guest login `<button>{{ 'customer.login_page.guest_continue' | t }}</button>` → `class="ct-btn ct-btn--outlined ct-btn--full"`
  - Leave the `{{ shop | login_button: … }}` Shop button untouched. Leave the `<a href="#recover">`, `<a href="#login">`, `<a href="{{ routes.account_register_url }}">` as links.

- [ ] **Step 4: Theme check** → expect **14**.

- [ ] **Step 5: Commit.**

```bash
git add sections/main-login.liquid
git commit -m "feat(customer): restyle login + recover + guest into Minimals"
```

---

## Task 3: Register page

**Files:** Modify `sections/main-register.liquid`

- [ ] **Step 1: Add the two stylesheet loads** after the `customer.css` line.

- [ ] **Step 2: Apply the field swap** to all four `.field` blocks: `#RegisterForm-FirstName`, `#RegisterForm-LastName`, `#RegisterForm-email`, `#RegisterForm-password`. (Keep the `aria-required`, `aria-invalid`, `aria-describedby`, `spellcheck`, `autocapitalize`, conditional `value` exactly.)

- [ ] **Step 3: Class the button.** Submit `<button>{{ 'customer.register.submit' | t }}</button>` → `class="ct-btn ct-btn--primary ct-btn--full"`.

- [ ] **Step 4: Theme check** → expect **14**.

- [ ] **Step 5: Commit.**

```bash
git add sections/main-register.liquid
git commit -m "feat(customer): restyle register page into Minimals"
```

---

## Task 4: Reset-password page

**Files:** Modify `sections/main-reset-password.liquid`

- [ ] **Step 1: Add the two stylesheet loads** after the `customer.css` line.

- [ ] **Step 2: Apply the field swap** to both `.field` blocks: `#password` and `#password_confirmation`. (These have the error `<small>` INSIDE the `.field` wrapper — leave the `<small>` as-is; only swap the wrapper/input/label.)

- [ ] **Step 3: Class the button.** Submit `<button>{{ 'customer.reset_password.submit' | t }}</button>` → `class="ct-btn ct-btn--primary ct-btn--full"`.

- [ ] **Step 4: Theme check** → expect **14**.

- [ ] **Step 5: Commit.**

```bash
git add sections/main-reset-password.liquid
git commit -m "feat(customer): restyle reset-password page into Minimals"
```

---

## Task 5: Activate-account page

**Files:** Modify `sections/main-activate-account.liquid`

- [ ] **Step 1: Add the two stylesheet loads** after the `customer.css` line.

- [ ] **Step 2: Apply the field swap** to both `.field` blocks: `#password` and `#password_confirmation`.

- [ ] **Step 3: Class the buttons.**
  - Submit `<button>{{ 'customer.activate_account.submit' | t }}</button>` → `class="ct-btn ct-btn--primary ct-btn--full"`
  - Decline `<button name="decline">{{ 'customer.activate_account.cancel' | t }}</button>` → `class="ct-btn ct-btn--outlined ct-btn--full"` (**keep `name="decline"`**).

- [ ] **Step 4: Theme check** → expect **14**.

- [ ] **Step 5: Commit.**

```bash
git add sections/main-activate-account.liquid
git commit -m "feat(customer): restyle activate-account page into Minimals"
```

---

## Task 6: Account dashboard

**Files:** Modify `sections/main-account.liquid`

No `.field` blocks here. Two changes: stylesheet loads + add layout classes so the CSS two-column grid applies.

- [ ] **Step 1: Add the two stylesheet loads** after the `customer.css` line.

- [ ] **Step 2: Add layout classes.** In the markup:
  - The second top-level `<div>` (the one that wraps the orders block and the account-details block — currently `<div>` on the line right after the title/logout `</div>`, i.e. the `<div>` that contains the two inner `<div>`s) → `<div class="ct-account__body">`.
  - Its first inner child `<div>` (contains `<h2>{{ 'customer.orders.title' | t }}</h2>` + the paginated table) → `<div class="ct-account__orders">`.
  - Its second inner child `<div>` (contains `<h2>{{ 'customer.account.details' | t }}</h2>` + `format_address` + view-addresses link) → `<div class="ct-account__details">`.
  - Do not change the table, pagination, or links markup.

- [ ] **Step 3: Class the logout/links (optional, light).** Leave `<a href="{{ routes.account_logout_url }}">` and the view-addresses `<a>` as links (the CSS styles `.customer a:not(.ct-btn)`). No button class needed.

- [ ] **Step 4: Theme check** → expect **14**.

- [ ] **Step 5: Commit.**

```bash
git add sections/main-account.liquid
git commit -m "feat(customer): restyle account dashboard (two-column + tables)"
```

---

## Task 7: Order detail

**Files:** Modify `sections/main-order.liquid`

Table-heavy, no forms. Skin is CSS-driven (targets `.customer.order` + `.order-details`). Only change needed is the stylesheet loads.

- [ ] **Step 1: Read `sections/main-order.liquid`** to confirm structure.

- [ ] **Step 2: Add the two stylesheet loads** after the `customer.css` line.

- [ ] **Step 3:** Leave the markup otherwise as-is (the `.order-details` table + address blocks are styled by `section-ct-customer.css`). If there is a primary action `<button>` or main `<a>`, you may class it `ct-btn ct-btn--outlined`, but do not alter tables or address output.

- [ ] **Step 4: Theme check** → expect **14**.

- [ ] **Step 5: Commit.**

```bash
git add sections/main-order.liquid
git commit -m "feat(customer): restyle order-detail page into Minimals"
```

---

## Task 8: Addresses

**Files:** Modify `sections/main-addresses.liquid`

The heaviest: two near-identical forms (new + edit), ~10 fields each, country/province selects, default-address checkbox.

- [ ] **Step 1: Add the two stylesheet loads** after the `customer.css` line. **Do NOT touch** the `<script src="customer.js">`, the `CustomerAddresses` init script, or any `data-*` attribute (`data-customer-addresses`, `data-address`, `data-address-id`, `data-address-country-select`, `data-default`, `data-form-id`, `data-target`, `data-confirm-message`).

- [ ] **Step 2: Apply the field swap** to EVERY `.field` block in BOTH the new-address form (`…New` ids) and the edit form (`…_{{ form.id }}` ids): first_name, last_name, company, address1, address2, city, zip, phone — for each form. (Selects are NOT `.field` — skip them, see Step 3.)

- [ ] **Step 3: Leave the country/province selects as-is.** They use `<div class="select"><select …>…</select><span class="svg-wrapper">…</span></div>` with their `<label>` above — the CSS skins `.customer .select` and the country/province labels. Keep `data-address-country-select`, `data-default`, `data-form-id`, `name`, `id` exactly.

- [ ] **Step 4: Class the buttons** (keep all `type=`/`data-*`/`aria-*`):
  - "Add new" toggle `<button type="button" aria-controls="AddAddress">` → add `class="ct-btn ct-btn--primary"`
  - New form: `<button>{{ 'customer.addresses.add' | t }}</button>` → `class="ct-btn ct-btn--primary"`; `<button type="reset">…cancel…</button>` → `class="ct-btn ct-btn--outlined"`
  - Each saved address: Edit `<button … data-address-id=…>` → `class="ct-btn ct-btn--outlined ct-btn--sm"`; Delete `<button … data-confirm-message=…>` → `class="ct-btn ct-btn--soft ct-btn--sm"`
  - Edit form: `<button>{{ 'customer.addresses.update' | t }}</button>` → `class="ct-btn ct-btn--primary"`; `<button type="reset">…cancel…</button>` → `class="ct-btn ct-btn--outlined"`

- [ ] **Step 5: Theme check** → expect **14**.

- [ ] **Step 6: Commit.**

```bash
git add sections/main-addresses.liquid
git commit -m "feat(customer): restyle addresses (cards + ct-field forms)"
```

---

## Task 9: Final review + finish

**Files:** none (verification only)

- [ ] **Step 1: Full theme check.** Run `shopify theme check` → confirm **14 offenses (2 errors + 12 warnings)**.

- [ ] **Step 2: Confirm no logic/JS touched.**
  Run: `git diff --stat <task1-commit>~1 HEAD -- assets/customer.js assets/addresses.js assets/customer.css`
  Expected: **no output** (these are untouched). Also spot-check that no `{% form %}`, `name=`, or `data-*` attribute was altered in the 7 sections (only `class`, `placeholder=" "`, and the account layout-class additions).

- [ ] **Step 3: Hand the live checklist to the user** (see the spec's Testing section): login + forgot toggle + guest + Shop button; register; reset; activate (incl. decline); account two-column + order table; an order detail; addresses add/edit/delete + country select (JS intact) + default toggle; and fail-open with classes reverted.

- [ ] **Step 4: Finish the branch.** Announce and use **superpowers:finishing-a-development-branch** (do not auto-merge; this stays on `feat/minimals-foundation`).

---

## Self-review notes

- **Spec coverage:** skin CSS → T1; the 7 pages → T2–T8 (login incl. recover+guest, register, reset, activate incl. decline, account, order, addresses); guardrail verification → T9. ✓
- **Naming consistency:** `.ct-field`/`.ct-field__input`/`.ct-field__label` (matches `theme-overrides.css` contract), `.ct-btn*` (matches `ct-sections.css`), `.ct-account__body`/`__orders`/`__details` and `.customer.addresses li[data-address]` cards all defined in T1's CSS and used in T6/T8. ✓
- **No placeholders:** the field swap is a deterministic rule with the exact field-id inventory per task; CSS is complete. ✓
- **Risk:** CSS selectors target Dawn's `customer.css` structure (e.g. `.customer.account > div:first-child`, `[name="sign-in-with-shop-provider"]`); these are first-pass and the user should confirm on live `theme dev` — but nothing here can break form submission (presentation only, logic untouched).
