# Customer Pages — Minimals Restyle Design Spec

**Date:** 2026-05-25
**Branch:** `feat/minimals-foundation`
**Status:** Approved (ready for implementation plan)

## Goal

Restyle all seven native Dawn customer/account pages into the Minimals look by **swapping form fields/buttons to our existing components + adding one layout skin** — never touching Shopify form logic. Reusable theme-grade; works for any store.

## Why this approach

These are native Shopify customer forms (`customer_login`, `create_customer`, `recover_customer_password`, `reset_customer_password`, `activate_customer_password`, `customer_address`, plus the account/order views). The forms and their `name=` fields, the country selector + `addresses.js`, and the Shop login button are all platform-wired and must not change. So — exactly like the PDP — we only touch presentation: swap Dawn's `.field`/`<button>` markup to our `.ct-field`/`.ct-btn` components and add a CSS layout skin. With the skin removed and classes reverted, the pages are still working Dawn customer pages (fail-open).

## Pages covered (7)

| Page | Section | Forms / content |
|---|---|---|
| Login (+ forgot password + guest) | `main-login` | `customer_login`, `recover_customer_password` (toggle `#login`/`#recover`), Shop login button, optional `guest_login` |
| Register (sign up) | `main-register` | `create_customer` |
| Reset password | `main-reset-password` | `reset_customer_password` |
| Activate account | `main-activate-account` | `activate_customer_password` |
| Account dashboard | `main-account` | order-history `<table class="order-history">`, account details + addresses link |
| Order detail | `main-order` | `<table class="order-details">` line items, totals, fulfillment, addresses |
| Addresses | `main-addresses` | `customer_address` new + edit forms, country `<select>` (`data-address-country-select`, `addresses.js`), default-address toggle |

"Forgot password" has no separate template — the recover form lives inside `main-login`.

## Component dependencies (already in the theme)

- **`.ct-field`** floating-label component — defined in `assets/theme-overrides.css`, which is loaded **globally** (`layout/theme.liquid:273`). Exact contract:
  ```liquid
  <div class="ct-field">
    <input class="ct-field__input" placeholder=" " …>   {%- comment -%} placeholder MUST be a single space {%- endcomment -%}
    <label class="ct-field__label" for="…">Label</label> {%- comment -%} label MUST immediately follow the input (CSS uses `+`) {%- endcomment -%}
  </div>
  ```
  Error state: add `has-error` to `.ct-field` and render `.ct-field__error`.
- **`.ct-btn`** family (`.ct-btn`, `--primary`/`--outlined`/`--soft`, `--full`/`--lg`) — defined in `assets/ct-sections.css` (per-section load). Each customer section will load `ct-sections.css` to get it.
- New **`assets/section-ct-customer.css`** — the layout skin (loaded by each customer section).

## Markup swap (presentation only)

Per text/email/password field in every customer section:
- wrapper `class="field"` → `class="ct-field"`
- `<input>`: add `class="ct-field__input"`; change `placeholder="…"` → `placeholder=" "` (single space); keep `type`, `name`, `id`, `autocomplete`, `aria-*` exactly.
- `<label>`: add `class="ct-field__label"`; keep `for`.
- error `<small>`/message: add `.ct-field__error`; add `has-error` to the wrapper when `form.errors`.

Buttons & links:
- submit `<button>` → `<button class="ct-btn ct-btn--primary ct-btn--full">…`
- primary navigational `<a>` (e.g. "Create account", "Return to account") → `class="ct-btn ct-btn--outlined ct-btn--full"` where it's a main action; minor links (Cancel, Forgot password) → a plain text link styled via `section-ct-customer.css`.
- The **Shop "Sign in with Shop" button** (`shop | login_button`) stays fully native — not restyled (platform-owned, like Shop Pay).

Selects (country in addresses): keep the native `<select>` + all `data-*`/`name` attributes; give the wrapper a `.ct-select` style (label **above**, not floating — floating labels don't work on selects). Default-address checkbox styled minimally.

## Layout skin — `assets/section-ct-customer.css`

- **Auth pages** (`login`, `register`, `reset-password`, `activate-account`): center the form in a Minimals **`.ct-card`** (max-width ~440px, `--ct-bg-raised`, border, radius, shadow, generous padding), centered in the page; H1 heading on top; fields stacked; full-width primary button; secondary links centered below. Login keeps its anchor-based `#login`/`#recover` two-form toggle.
- **Account dashboard** (`account`): desktop **two-column** grid (order-history table on the left/main, account details + "View addresses" on the right/aside); mobile stacks. Style `table.order-history` into Minimals (header row, row separators, hover, status pill).
- **Order detail** (`order`): style `table.order-details` (line items, subtotals, totals) into Minimals; render billing/shipping address blocks as cards.
- **Addresses** (`addresses`): saved addresses as **cards** in a responsive grid; new/edit forms use `.ct-field` + `.ct-select`; primary/edit/delete buttons as `.ct-btn` variants; keep the JS-driven new/edit toggles working.
- **Messages**: restyle Dawn `.form__message`, `default_errors`, success states using `--ct-error`/`--ct-success`/`--ct-warning` tokens; `.ct-field.has-error` border.

## Guardrails

- Do NOT modify any `{% form %}` tag, field `name=` attribute, `id` referenced by Shopify, `routes.*`, the country selector markup/`data-address-country-select`, `assets/addresses.js`, `assets/customer.js`, or any other JS/logic.
- The `placeholder=" "` change is the only attribute value we alter on inputs (required by `.ct-field`); all other input attributes stay byte-identical.
- **theme-check stays at the 14-offense baseline.** New Liquid uses double quotes; no leading-underscore variables (`VariableName`). No new global JS.
- Fail-open: skin removed / classes reverted → still a working Dawn customer page.
- Keep `customer.css` loaded (don't delete it) so anything we don't explicitly skin still has Dawn's baseline styling.

## Accessibility

- Labels stay associated via `for`/`id`; `.ct-field__label` is visible (floating), not hidden.
- Preserve existing `aria-invalid`, `aria-describedby`, `autofocus`, `role` attributes on inputs and messages.
- Buttons keep type/submit semantics; links stay links.
- Color is not the only error signal (border + message text).
- Respects `prefers-reduced-motion` (tokens already zero durations).

## File map

**New:** `assets/section-ct-customer.css`
**Modify (markup + 2 stylesheet loads each):** `sections/main-login.liquid`, `sections/main-register.liquid`, `sections/main-reset-password.liquid`, `sections/main-activate-account.liquid`, `sections/main-account.liquid`, `sections/main-order.liquid`, `sections/main-addresses.liquid`

## Testing / verification

- **Automated:** `shopify theme check` stays at 14 (run per task).
- **Manual (user, on `shopify theme dev`):**
  1. `/account/login` — login + "forgot password" toggle + (if enabled) guest + Shop button all render and submit; errors show styled.
  2. `/account/register` — create account submits; validation errors styled.
  3. Reset & activate flows render and submit.
  4. `/account` — dashboard two-column; order-history table styled; links work.
  5. An order detail page renders styled.
  6. `/account/addresses` — add/edit/delete address works; country select works (JS intact); default toggle works.
  7. Revert classes / remove skin → still a working Dawn customer page (fail-open).

## Open questions

None — resolved in brainstorming: scope = **CSS skin + `.ct-field`/`.ct-btn` markup swap** across all 7 pages; Shop login button left native; selects use label-above `.ct-select`.
