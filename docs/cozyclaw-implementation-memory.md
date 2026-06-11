# CozyClaw Implementation Memory

Read this file before implementing CozyClaw theme changes. It captures repeated
decisions, bugs, and fixes from prior work so the same mistakes do not come back.

## Core Rule

Reference files in `files/` are the source of truth. Do not invent sections,
copy, spacing, colors, icons, or behavior. If the reference does not show it, do
not ship it unless the user explicitly approves it.

Primary references:

- `files/new-design-cozyclaw-homepage.html`
- `files/cozyclaw-cart-rewards-bar.html`
- `files/cozyclaw-design-system.md`
- `files/cozyclaw-homepage-spec.md`
- `files/cozyclaw-pdp-spec.md`

Use `--ct-*` tokens from `snippets/css-variables.liquid`. Avoid one-off local
CSS values unless the token does not exist and a new token is genuinely needed.

## New Design Port Failure Modes

When converting a fresh HTML design into Liquid, assume the preview is the sum of
section code, JSON template state, saved global settings, merchant customizer
state, Dawn's wrappers, and Dawn's CSS/JS. The bugs below have repeated enough
that they are now preflight checks.

- **Old or wrong sections render:** template JSON still references old section
  IDs/types, or live customizer state was saved over the code. Rewrite the
  relevant `templates/*.json` `sections` and `order` arrays to match the
  reference top-to-bottom. If home and product are meant to match, update both in
  the same change and keep the same ordered section types/settings.
- **A new design "only works after renaming sections":** two section files or
  JSON instances are doing the same visual job. Use one stable section type per
  visual block. Do not leave duplicate legacy section types in the active
  template. Prefer additive `layout`/`style` variants only when the section is
  intentionally shared and the default branch remains unchanged.
- **The page looks like Dawn or a previous design:** inherited base CSS, old
  section CSS, stale global color settings, or generic selectors are winning.
  Scope new design CSS under a section/root class, load section CSS from the
  section that needs it, and keep `config/settings_schema.json` defaults in sync
  with `config/settings_data.json`. Do not rely on Liquid `default` filters for
  stale schema defaults.
- **Full-width bands or spacing break after porting HTML:** Shopify injects a
  `#shopify-section-*` wrapper around every section, so selectors like
  `body > section`, `section + section`, and `:first-child` from standalone HTML
  are fragile. Re-establish full-bleed backgrounds, padding, and borders inside
  each section wrapper.
- **Fresh install renders blank/lorem/old copy:** schema defaults and shipped
  JSON were not both fully populated. Every setting default should match the
  reference, and every intended value should also be written into the JSON
  template. Product data is the exception: price, compare-at price, availability,
  title, images, variants, and rating bind from `product`.
- **Interactions work in static HTML but not in Shopify/editor:** JS queries the
  whole document, binds IDs that duplicate across sections, or does not re-init
  after `shopify:section:load`. Scope queries to the section root, guard custom
  elements with `customElements.get`, and unsubscribe pub/sub listeners in
  `disconnectedCallback`.
- **Ticker/announcement bars drift from the HTML:** do not let Liquid repeat
  messages four times and then let JS clone them again. For reference-style
  scrolling announcement bars, render two identical server-side sets and animate
  the track with CSS. Keep saved `sections/header-group.json` icon/text values
  in sync with the section defaults.
- **Images crop or resize cards unexpectedly:** standalone demo slots often hide
  this. Reuse shared media/gallery snippets where possible and keep product,
  feature, review, video, and related-product media in fixed-ratio slots with
  `object-fit: contain` unless the reference explicitly requires cover.
- **Demo content leaks into production:** never ship fabricated reviews,
  ratings, sales counts, stats, press logos, fake timers, fake thresholds, or
  placeholder money as live product data. Placeholder review blocks are allowed
  only when visibly bracketed/empty and not emitted as structured data.
- **Template JSON keeps fake commerce data alive:** after removing hardcoded
  money or product strings from a section schema, also remove the saved values
  from active JSON templates. For GardenStudio/CozyClaw product surfaces,
  bundle tier prices, compare-at prices, save labels, product title, product
  media, availability, selected variant, sticky ATC price, related-product
  prices, and review ratings must come from Shopify product/metafield data or
  render as an empty/configure state. Never leave fallback `$...` values in
  template JSON.
- **Encoding damage becomes visible:** normalize copied reference text before it
  enters Liquid/JSON. Use entities such as `&trade;`, `&mdash;`, `&ndash;`,
  `&starf;`, `&#10003;`, and `&#10005;` where that is safer than storing fragile
  symbols in JSON settings.
- **Shopify rejects the theme zip as missing `layout/theme.liquid`:** Windows
  `Compress-Archive` can store entries with backslashes (`layout\theme.liquid`),
  which looks correct after local normalization but is not a valid Shopify theme
  archive. Build release zips entry-by-entry with forward-slash relative paths,
  then verify the raw archive entry list contains `layout/theme.liquid` exactly
  and no entry contains `\`.

Recent token additions that should be reused:

- Product layout:
  `--ct-product-layout-width`, `--ct-product-layout-gap`,
  `--ct-product-layout-media`, `--ct-product-layout-buy`
- Product/gallery controls:
  `--ct-product-sticky-top`, `--ct-product-button-height`,
  `--ct-product-pill-button-height`, `--ct-product-button-radius`,
  `--ct-product-form-gap`, `--ct-product-details-offset`,
  `--ct-gallery-arrow-size`, `--ct-gallery-icon-size`,
  `--ct-gallery-dot-size`, `--ct-gallery-dot-active-width`,
  `--ct-gallery-dot-gap`, `--ct-gallery-heart-size`,
  `--ct-gallery-control-inset`, `--ct-gallery-badge-inset`,
  `--ct-gallery-dots-offset`, `--ct-gallery-badge-font`,
  `--ct-gallery-badge-pad-y`, `--ct-gallery-badge-pad-x`
- Forms:
  `--ct-form-field-height`, `--ct-form-field-pad-x`
- Shared color/use:
  `--ct-on-accent`, `--ct-scarcity-border`, `--ct-scarcity-track`

## Theme Check and Packaging

- Theme Check baseline is currently expected to stay at `9 total offenses` and
  `2 errors`. Do not let the count rise.
- Use:
  `shopify.cmd theme check 2>&1 | Select-String "offenses","errors"`
- Rebuild `gardenstudio-codex-v1.zip` after user-facing theme changes.
- The zip must contain theme root folders directly, especially
  `layout/theme.liquid`. Do not zip the parent folder.
- Verify the raw zip entries use forward slashes, not Windows backslashes:
  `layout/theme.liquid` must exist exactly, and no entry should contain `\`.
- Zip only Shopify theme folders: `assets`, `config`, `layout`, `locales`,
  `sections`, `snippets`, `templates`.

## Encoding and Copy

Watch for mojibake such as `â`, `Â`, `Ã`, `ð`, `€`, `Å`, `Ë`, and `â‚¬`.
These have appeared in JSON template settings and render visibly on PDP copy.

Before packaging, run targeted searches on touched template/section files:

```powershell
rg -n "â|Â|ð|€|Ã|Å|Ë|â‚¬" templates sections snippets assets
```

Prefer ASCII in editable JSON settings unless a real symbol is required. For
brand trademark rendering in HTML/Liquid, use `&trade;` or a proper `<sup>` path
instead of storing fragile encoded text in JSON settings.

## Homepage Rebuild Lessons

The homepage must match `files/new-design-cozyclaw-homepage.html`, not old Dawn
or Minimals-style sections.

Avoid:

- Adding extra sections not in the reference.
- Keeping old footer, CTA, FAQ, stats, compare, or bottom CTA sections unless
  the reference shows them.
- Duplicating text or rendering old icon strips.
- Using placeholder/logo output where an image picker or asset-selected logo is
  required.

Required behavior already discussed:

- Announcement bar uses the new design and clicking the 15% offer should open
  the signup popup.
- On mobile, the static-row announcement bar should be horizontally swipeable.
  Each announcement item should occupy one full slide, use scroll snap, hide the
  scrollbar, and center the icon + text. The text is wrapped with
  `.ct-announce--static-row__text` so linked and non-linked messages center and
  wrap consistently.
- Signup areas validate email, disable invalid submit behavior, and show the
  thank-you popup after success.
- Footer links should use live-store style content and real routes, including a
  Blogs link. Secure payment methods should come from Shopify native payment
  types where possible.
- Footer logo must be picker-driven where requested, not hardcoded.
- Footer copyright should render CozyClaw trademark correctly, not `CozyClawTM`.

## PDP Structure

Main bundle PDP:

- `templates/product.json`
- `sections/main-product.liquid`
- Flexible bundle builder:
  `snippets/ct-bundle-tiers.liquid`,
  `assets/ct-bundle-tiers.js`,
  `assets/section-ct-bundle-tiers.css`

Non-bundle PDP:

- `templates/product.non-bundle.json`
- `sections/ct-non-bundle-pdp.liquid`
- Uses the same `ct-product-gallery` and bundle-tier JS/CSS APIs.

Known decisions:

- Remove bottom CTA from PDP when it is not in the reference.
- Remove rendered Dawn `Price` and `Scarcity` blocks from the main PDP template
  when the buy box already handles the offer/total.
- Desktop PDP width should be controlled by root product layout tokens, not
  local one-off widths. Main PDP and non-bundle PDP both read
  `--ct-product-layout-*`; mobile/tablet layouts remain separate.
- Main PDP desktop layout overrides Dawn's narrow percentage info column with a
  shared two-column grid at `min-width: 990px`. Do not reintroduce Dawn's local
  35% buy-box cap.
- Non-bundle PDP uses the same root product layout tokens for desktop width/gap,
  while its mobile order remains title, benefits, image gallery, then the rest
  of the buy box.
- Product data must bind from Liquid `product`, variants, and cart-derived
  values. Do not hardcode price, compare-at, save percent, availability, title,
  images, variants, or rating.
- Ratings must not be hardcoded into structured data. Only render
  `aggregateRating` when real review metafields exist, or leave reviews to
  Judge.me.

## Cart Rewards Bar

Reference: `files/cozyclaw-cart-rewards-bar.html`.

Applied to both bundle and non-bundle PDP reward bars.

Reward threshold source:

- Current rule: never guessed-convert USD thresholds into another active
  currency. Shopify Liquid can format presentment money, but the theme must not
  invent an FX rate or infer thresholds from Discounts. Non-shop currencies need
  exact values from `localization.market.metafields.cozyclaw.reward_thresholds`
  or `settings.ct_reward_thresholds_by_currency`; otherwise
  `ct-reward-threshold` returns `configured=false` and the UI must say rewards
  are calculated at checkout instead of showing progress/discount estimates.
- Use `snippets/ct-reward-threshold.liquid` for every reward threshold.
- Priority is: separate Market integer metafields
  `custom.free_shipping_threshold` / `custom.discount_threshold` (also supports
  `cozyclaw.free_shipping_threshold` / `cozyclaw.discount_threshold`), then
  `localization.market.metafields.cozyclaw.reward_thresholds` JSON, then Theme Editor currency map
  (`settings.ct_reward_thresholds_by_currency`), then Theme Editor shop-currency defaults
  (`settings.ct_free_shipping_threshold_cents` /
  `settings.ct_discount_threshold_cents`) only when active currency equals `shop.currency`.
- Do not use the shop-currency fallback for other active currencies. For
  example, VND needs a line such as
  `VND:125000000,250000000`; otherwise Shopify can format `5000` as roughly
  `₫50` and the cart will appear to unlock rewards immediately.
- Do not store guessed common-currency defaults in the Theme Editor map. Use
  exact market policy values only, preferably from the market metafield
  `cozyclaw.reward_thresholds` so storefront math matches Shopify discounts.
- Do not reintroduce section-local `5000` / `10000` reward constants. Labels,
  progress bars, cart summary math, bundle totals, add-ons, and pricing
  calculators must all read the same resolved threshold values.
- PDP reward cards should not disappear for unconfigured markets. Show a neutral
  `Cart rewards` card with checkout-calculated copy; switch to milestone bars
  only when both market thresholds are configured.
- The market metafield JSON supports:
  `free_shipping_threshold`, `discount_threshold`, and the older
  `*_threshold_cents` aliases.

Current intended UI:

- Eyebrow: `Cart rewards`
- Progress bar with two milestone nodes.
- Milestone labels only:
  `$50.00` / `Free shipping`
  `$100.00` / `15% off`
- Do not show a dynamic sentence like `Add $8.00 to get free shipping` if the
  user asks for milestone-only display.

Important functional bug already fixed once:

- The progress percent must clamp after converting to percent:
  `Math.min(subtotal / discountThreshold() * 100, 100)`
- The broken version used `Math.min(subtotal / discountThreshold() * 100, 1) * 100`,
  which filled the bar too early.

Milestone state should follow subtotal:

- `$50` node reached when subtotal >= free shipping threshold.
- `$100` node reached when subtotal >= discount threshold.
- For long currencies, show compact milestone text on enhanced JS labels while
  keeping the full money value in `title`/`aria-label`.

Typography and spacing should follow `--ct-text-*`, `--ct-space-*`, and
`--ct-font-*` tokens. The reward card should not overpower the buy box on mobile.

## Mobile Drawer

- Dawn's default menu drawer is header-relative (`top: 100%` and height based on
  header bottom). CozyClaw mobile must behave as a true sidebar: fixed overlay,
  fixed left panel, full `100dvh`, blocked page interaction behind it, and body
  scroll locked while open.
- If mobile/editor viewports still show the page behind the bottom of the
  drawer, freeze the document open state and let only
  `.menu-drawer__navigation-container` scroll.
- Keep Dawn's existing `header-drawer` JS/focus trap; fix the layout in
  `assets/component-menu-drawer.css`.

## Product Gallery

Shared gallery component:

- Markup: `snippets/ct-product-gallery.liquid`
- JS: `assets/ct-product-gallery.js`
- Shared lightbox CSS: `assets/ct-sections.css`

Used in at least three places:

- Homepage product showcase: `sections/ct-home-showcase.liquid`
- Main PDP: `sections/main-product.liquid`
- Non-bundle PDP: `sections/ct-non-bundle-pdp.liquid`

Current behavior requirements:

- Mobile uses swipe; do not add mobile arrow buttons.
- Desktop uses arrow buttons because drag/swipe is not obvious on desktop.
- Dots/indicators should work on desktop and mobile.
- Clicking/tapping the active image should open a full-size popup.
- The popup must open on the clicked/current image, not always the first image.
- Popup must support swipe on mobile and arrow/keyboard navigation on desktop.
- Popup backdrop should be opaque enough that the underlying page/gallery does
  not show through as a duplicate/weird background.
- Lightbox dialogs should not add a white fixed-width canvas behind
  `object-fit: contain` images. Use a transparent dialog/stage and put any
  shadow/radius on the image itself, otherwise portrait product images show
  strange pale side bars.
- Main PDP, non-bundle PDP, and landing/homepage should share the same gallery
  component instead of three independent implementations.
- For main PDP product media, full-size image data must exist even when
  `render_product_media: true`, otherwise the custom lightbox cannot open.

Known implementation details:

- `ct-product-gallery` should set `data-gallery-full-image` and
  `data-gallery-full-alt` on product media slides as well as plain image slides.
- The click handler should open the custom lightbox in capture phase so nested
  Dawn `modal-opener` does not swallow desktop clicks.
- Use the clicked slide/current gallery index to compute popup index.
- `product-info.js` variant changes call the gallery `setActiveMedia(mediaId)`.

Non-bundle mobile order:

- User requested: title, benefits, image gallery, then the rest of buy box.
- CSS alone cannot place a sibling gallery between elements inside the body.
  Keep a desktop sticky gallery for desktop and a mobile-only gallery rendered
  inside the body after benefits.

Image display:

- Do not crop product/section images incorrectly. Reuse global image display
  utilities/classes where possible.
- Popup image should use `object-fit: contain` and viewport caps.
- Desktop modal images should not exceed the viewport.

## Announcement Bar and Signup Popup

Known behavior requirements:

- New announcement bar must include the design icons/content.
- Clicking the 15% off announcement item opens the signup popup.
- Static-row mobile announcement uses CSS scroll-snap instead of wrapping into
  stacked rows.
- Signup form must validate email and not submit invalid/empty email.
- Submit button should behave disabled/invalid correctly.
- Successful signup should show thank-you popup/state.

Email field rendering:

- All CozyClaw email fields should use the shared field tokens:
  `--ct-form-field-height` and `--ct-form-field-pad-x`.
- Use `min-height`, tokenized horizontal padding, `line-height: 1.2`, and
  `appearance: none` on custom email inputs. This prevents mobile native email
  controls from rendering cramped/off-center placeholder text.
- Current custom email inputs covered by this rule:
  homepage signup (`.cth-signup input[type='email']`), standalone email section
  (`.ct-email-input`), and signup popup
  (`.ct-signup-popup__field input[type="email"]`).
- Email/signup buttons should share the same field height when visually paired
  with an input.

## Footer

Known behavior requirements:

- Match the new design/reference, not Dawn defaults.
- Logo should be configurable/picker-driven where requested.
- Footer links should route correctly. Include blog navigation.
- Payment methods should come from Shopify native payment icons/types.
- Avoid `CozyClawTM`; render trademark correctly or use safe HTML.

## Product Structured Data

Goal for product rich results:

- Exactly one Product JSON-LD object on the product page, accounting for theme
  plus Judge.me.
- Do not create duplicate Product objects.
- Product JSON-LD should include:
  `offers.price`, `offers.priceCurrency`, `offers.availability`,
  `offers.itemCondition`, `offers.url`, `image`, `description`, `brand`, `sku`.
- Price must be plain decimal from selected variant cents divided by 100.
- Currency should be the active checkout/shopper currency.
- Availability comes from `product.available`.
- Optional merchant listing fields can include `shippingDetails` and
  `hasMerchantReturnPolicy`.
- Aggregate rating only renders from real review data; never hardcode rating.

## Clean Code Expectations

- Prefer shared snippets/components over one-off duplicated markup.
- Keep CSS tokenized through `--ct-*`.
- If multiple sections need the same size/spacing/color behavior, add or reuse a
  root token in `snippets/css-variables.liquid` instead of copying hardcoded
  values into section CSS.
- Do not mechanically rewrite every legacy hardcoded value in one pass. Prioritize
  shared/high-risk paths first, then clean section-by-section to avoid visual
  regressions. Known remaining high-hardcode custom CSS files include
  `assets/section-ct-homepage.css`, `assets/section-ct-pricing.css`, and
  `assets/section-ct-bundle-tiers.css`.
- Remove stale hooks when UI changes; do not hide dirty old code if it can be
  removed safely.
- Avoid `!important` unless there is no better cascade path.
- Do not reintroduce separate gallery implementations for each page.
- Keep Shopify JSON templates valid UTF-8 without BOM.
- If PowerShell rewrites JSON, re-save without BOM:

```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Resolve-Path 'templates/product.json'), $content, $utf8NoBom)
```

## Pre-Implementation Checklist

Before coding:

- Read this file.
- Read the relevant reference HTML/spec file in `files/`.
- Locate the current rendered section/template/snippet.
- Confirm whether the change belongs in a shared snippet/component.
- Check whether mobile and desktop have different required behavior.

Before final response:

- Run syntax checks for touched JS with `node --check`.
- Validate touched JSON templates with `ConvertFrom-Json`.
- Run Theme Check summary and keep baseline unchanged.
- Search touched files for mojibake.
- Rebuild `Dawn-Codex-15.4.1.zip` after storefront changes.
