/* ct-bundle-tiers.js - PDP variant list builder.
   One row per selected variant, optional add-ons, live threshold/total display. */
(function () {
  if (window.ctBundleTiersLoaded) return;
  window.ctBundleTiersLoaded = true;

  var SELECTORS = {
    addons: '.ct-addons .ct-addon[aria-pressed="true"]',
    addonVariant: '.ct-addon__variant',
    addToCartForm: 'form[data-type="add-to-cart-form"]',
    addVariant: '[data-bundle-add-variant]',
    bedRows: '[data-bundle-bed-rows]',
    builder: '[data-ct-bundle-builder]',
    bundleRoot: '[data-ct-bundle-tiers]',
    discountNote: '[data-bundle-discount-note]',
    optionsSource: '[data-bundle-options-source]',
    picker: '[data-bundle-picker]',
    productPrice: '.product__info-container .price .price-item--regular, .product__info-container .price .price-item--sale',
    submitButton: 'form[data-type="add-to-cart-form"] [name="add"]',
    total: '[data-bundle-total]',
    totalRows: '[data-bundle-total-rows]',
    totalWas: '[data-bundle-total-was]',
    unitPrice: '[data-bundle-unit-price]',
    unlock: '[data-bundle-unlock]',
    unlockFill: '[data-bundle-unlock-fill]',
    unlockLabel: '[data-bundle-unlock-label]'
  };

  var MAX_ROW_QTY = 99;
  var state = {
    rows: []
  };

  function toArray(list) {
    return Array.prototype.slice.call(list);
  }

  function root() {
    return document.querySelector(SELECTORS.bundleRoot);
  }

  function builder() {
    return document.querySelector(SELECTORS.builder);
  }

  function centsFrom(value) {
    var cents = Number(value || 0);
    return isFinite(cents) ? cents : 0;
  }

  function formatMoney(cents) {
    if (window.Shopify && typeof Shopify.formatMoney === 'function') {
      var fmt = window.theme && window.theme.moneyFormat;
      try { return Shopify.formatMoney(cents, fmt); } catch (e) {}
    }
    return '$' + (Number(cents) / 100).toFixed(2);
  }

  function discountPercent() {
    var el = root();
    var pct = el ? Number(el.dataset.discountPercent || 0) : 0;
    if (!isFinite(pct) || pct < 0) return 0;
    return Math.min(pct, 100);
  }

  function thresholdCents(name, fallback) {
    var el = root();
    var cents = el ? Number(el.dataset[name] || 0) : 0;
    return isFinite(cents) && cents > 0 ? cents : (fallback || 0);
  }

  function freeShippingThreshold() {
    return thresholdCents('freeShippingThreshold', 0);
  }

  function discountThreshold() {
    return thresholdCents('discountThreshold', 0);
  }

  function rewardsConfigured() {
    var el = root();
    return !!(el && el.dataset.rewardsConfigured === 'true' && freeShippingThreshold() > 0 && discountThreshold() > 0);
  }

  function rewardCurrency() {
    var el = root();
    return (el && el.dataset.rewardCurrency) || (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'USD';
  }

  function formatCompactMoney(cents) {
    try {
      return new Intl.NumberFormat(document.documentElement.lang || undefined, {
        style: 'currency',
        currency: rewardCurrency(),
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(Number(cents || 0) / 100);
    } catch (e) {
      return formatMoney(cents);
    }
  }

  function updateRewardMoneyLabels() {
    document.querySelectorAll('[data-ct-bundle-tiers] [data-reward-money]').forEach(function (label) {
      var cents = centsFrom(label.dataset.rewardMoney);
      var full = formatMoney(cents);
      label.textContent = full.length > 10 ? formatCompactMoney(cents) : full;
      label.title = full;
      label.setAttribute('aria-label', full);
    });
  }

  function thresholdMoney(cents) {
    return formatMoney(cents) + '+';
  }

  function applyDiscount(cents, eligible) {
    var pct = discountPercent();
    if (!eligible || pct <= 0) return cents;
    return Math.round(cents * (100 - pct) / 100);
  }

  function remainingFor(threshold, subtotal) {
    return Math.max(threshold - subtotal, 0);
  }

  function selectedOption(select) {
    return select && select.options ? select.options[select.selectedIndex] : null;
  }

  function optionDetails(option) {
    if (!option) return null;
    return {
      id: Number(option.value),
      label: option.textContent.trim(),
      price: centsFrom(option.dataset.price),
      compare: centsFrom(option.dataset.compare)
    };
  }

  function sourceOptions() {
    var b = builder();
    var source = b && b.querySelector(SELECTORS.optionsSource);
    return source ? toArray(source.options).filter(function (option) { return !option.disabled; }) : [];
  }

  function optionById(id) {
    return sourceOptions().find(function (option) { return Number(option.value) === Number(id); }) || null;
  }

  function pickerOption() {
    var b = builder();
    var picker = b && b.querySelector(SELECTORS.picker);
    return selectedOption(picker);
  }

  function cleanVariantLabel(label) {
    return String(label || '').replace(/\s+-\s+Sold out$/i, '').trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function colorName(label) {
    var first = cleanVariantLabel(label).split('/')[0].split('·')[0].trim();
    return first || 'Option';
  }

  function colorClass(label) {
    var key = colorName(label).toLowerCase();
    if (key.indexOf('coffee') !== -1) return 'is-coffee';
    if (key.indexOf('oatmeal') !== -1) return 'is-oatmeal';
    if (key.indexOf('black') !== -1) return 'is-black';
    if (key.indexOf('grey') !== -1 || key.indexOf('gray') !== -1) return 'is-grey';
    return 'is-default';
  }

  function addVariant(id, qty) {
    var option = optionById(id);
    var details = optionDetails(option);
    if (!details || !details.id || !details.price) return;
    var existing = state.rows.find(function (row) { return row.id === details.id; });
    if (existing) {
      existing.quantity = Math.min(existing.quantity + (qty || 1), MAX_ROW_QTY);
    } else {
      state.rows.push({
        id: details.id,
        label: cleanVariantLabel(details.label),
        price: details.price,
        compare: details.compare,
        quantity: Math.max(1, qty || 1)
      });
    }
  }

  function ensureOneRow() {
    if (state.rows.length) return;
    var option = pickerOption() || sourceOptions()[0];
    if (option) addVariant(option.value, 1);
  }

  function hydrateDefaultRows() {
    var b = builder();
    var options = sourceOptions();
    if (!b || !options.length) return;
    var defaultQty = Math.max(1, Math.min(Number(b.dataset.defaultQty || 1) || 1, 12));
    for (var i = 0; i < defaultQty; i++) {
      addVariant(options[i % options.length].value, 1);
    }
    ensureOneRow();
  }

  function selectedBedDetails() {
    return state.rows.map(function (row) {
      return {
        id: row.id,
        label: row.label,
        price: row.price,
        compare: row.compare,
        quantity: row.quantity,
        linePrice: row.price * row.quantity
      };
    }).filter(function (item) {
      return item.id && item.price && item.quantity > 0;
    });
  }

  function selectedAddonCards() {
    return toArray(document.querySelectorAll(SELECTORS.addons));
  }

  function selectedAddonDetails() {
    return selectedAddonCards().map(function (card) {
      var select = card.querySelector(SELECTORS.addonVariant);
      var option = selectedOption(select);
      var title = card.dataset.productTitle || '';
      var titleEl = card.querySelector('.ct-addon__title');
      var price = option ? centsFrom(option.dataset.price) : centsFrom(card.dataset.price);
      var id = option ? Number(option.value) : Number(card.dataset.variantId);
      if (!title && titleEl) title = titleEl.textContent.trim();
      return { id: id, label: title || 'Add-on', price: price };
    }).filter(function (item) {
      return item.id && item.price;
    });
  }

  function updateAddButton() {
    var b = builder();
    if (!b) return;
    var addButton = b.querySelector(SELECTORS.addVariant);
    var option = pickerOption();
    if (addButton) addButton.disabled = !option || option.disabled;
  }

  function renderRows() {
    var b = builder();
    if (!b) return;
    var rows = b.querySelector(SELECTORS.bedRows);
    if (!rows) return;

    rows.innerHTML = '';
    selectedBedDetails().forEach(function (item, index) {
      var label = escapeHtml(item.label);
      var row = document.createElement('div');
      row.className = 'ct-bundle-builder__row';
      row.dataset.variantId = String(item.id);
      row.innerHTML =
        '<span class="ct-bundle-builder__swatch ' + colorClass(item.label) + '" aria-hidden="true"></span>' +
        '<span class="ct-bundle-builder__row-main">' +
          '<strong class="ct-bundle-builder__row-title">' + label + '</strong>' +
          '<span class="ct-bundle-builder__row-price">' + formatMoney(item.price) + ' each - ' + formatMoney(item.linePrice) + '</span>' +
        '</span>' +
        '<span class="ct-bundle-builder__row-qty" aria-label="Quantity for ' + label + '">' +
          '<button type="button" data-bundle-row-minus data-index="' + index + '" aria-label="Decrease quantity">-</button>' +
          '<span>' + item.quantity + '</span>' +
          '<button type="button" data-bundle-row-plus data-index="' + index + '" aria-label="Increase quantity">+</button>' +
        '</span>' +
        '<button type="button" class="ct-bundle-builder__remove" data-bundle-bed-remove data-index="' + index + '" aria-label="Remove ' + label + '">x</button>';
      rows.appendChild(row);

      var minus = row.querySelector('[data-bundle-row-minus]');
      if (minus) minus.disabled = item.quantity <= 1;
      var remove = row.querySelector('[data-bundle-bed-remove]');
      if (remove) remove.disabled = state.rows.length <= 1;
    });
    updateAddButton();
    updateRewardMoneyLabels();
  }

  function publishBundleItems() {
    var items = selectedBedDetails().map(function (bed) {
      return { id: bed.id, quantity: bed.quantity };
    });
    window.ctBundleItems = items.length ? items : null;
  }

  function ensureAtcPill() {
    var button = document.querySelector(SELECTORS.submitButton);
    if (!button) return null;
    var pill = button.querySelector('[data-bundle-atc-total]');
    if (pill) return pill;
    pill = document.createElement('span');
    pill.className = 'ct-atc-total-pill';
    pill.setAttribute('data-bundle-atc-total', '');
    button.appendChild(pill);
    return pill;
  }

  function renderTotalRows(beds, addonDetails, eligible, freeShippingEligible, savings) {
    var configured = rewardsConfigured();
    var rootEl = root();
    var productTitle = (rootEl && rootEl.dataset.productTitle) || 'Cozy Plush Pet Sofa';
    var bedCount = beds.reduce(function (sum, bed) { return sum + bed.quantity; }, 0);
    var sofaTotal = beds.reduce(function (sum, bed) { return sum + bed.linePrice; }, 0);
    document.querySelectorAll(SELECTORS.totalRows).forEach(function (wrap) {
      wrap.innerHTML = '';

      var rows = [
        { label: productTitle + ' x' + bedCount, value: formatMoney(sofaTotal), modifier: '' }
      ];
      addonDetails.forEach(function (addon) {
        rows.push({ label: addon.label, value: formatMoney(addon.price), modifier: '' });
      });
      if (configured && eligible && savings > 0) {
        rows.push({
          label: discountPercent() + '% off - ' + thresholdMoney(discountThreshold()),
          value: '- ' + formatMoney(savings),
          modifier: ' ct-running-total__line--save'
        });
      }
      rows.push({
        label: 'Shipping',
        value: configured && freeShippingEligible ? 'FREE' : 'Calculated at checkout',
        modifier: ' ct-running-total__line--shipping'
      });

      rows.forEach(function (row) {
        var line = document.createElement('div');
        var label = document.createElement('span');
        var value = document.createElement('span');
        line.className = 'ct-running-total__line' + row.modifier;
        value.className = 'ct-running-total__line-value';
        label.textContent = row.label;
        value.textContent = row.value;
        line.appendChild(label);
        line.appendChild(value);
        wrap.appendChild(line);
      });
    });
  }

  function updateUnlockBar(subtotal, eligible, freeShippingEligible, savings) {
    if (!rewardsConfigured()) return;
    var pct = Math.min(subtotal / discountThreshold() * 100, 100);
    document.querySelectorAll(SELECTORS.unlock).forEach(function (el) {
      el.classList.toggle('is-locked', !eligible);
      el.querySelectorAll('[data-bundle-unlock-node="shipping"]').forEach(function (node) {
        node.classList.toggle('is-reached', freeShippingEligible);
      });
      el.querySelectorAll('[data-bundle-unlock-node="discount"]').forEach(function (node) {
        node.classList.toggle('is-reached', eligible);
      });
      el.querySelectorAll(SELECTORS.unlockLabel).forEach(function (label) {
        var type = label.dataset.bundleUnlockLabel;
        label.classList.toggle('is-reached', type === 'shipping' ? freeShippingEligible : eligible);
      });
    });
    document.querySelectorAll(SELECTORS.unlockFill).forEach(function (el) {
      el.style.width = pct + '%';
    });
  }

  function updateUnitPrice(beds) {
    var b = builder();
    if (!b || beds.length === 0) return;
    var firstPrice = beds.reduce(function (min, bed) {
      return min === 0 ? bed.price : Math.min(min, bed.price);
    }, 0);
    var unit = b.querySelector(SELECTORS.unitPrice);
    if (unit) {
      unit.textContent = 'from ' + formatMoney(firstPrice) + ' each' +
        (rewardsConfigured() ? ' - free shipping' : ' - rewards calculated at checkout');
    }
  }

  function recomputeTotal() {
    var beds = selectedBedDetails();
    var addonDetails = selectedAddonDetails();
    var subtotal = beds.reduce(function (sum, bed) { return sum + bed.linePrice; }, 0) +
      addonDetails.reduce(function (sum, addon) { return sum + addon.price; }, 0);
    var configured = rewardsConfigured();
    var eligible = configured && subtotal >= discountThreshold();
    var freeShippingEligible = configured && subtotal >= freeShippingThreshold();
    var total = applyDiscount(subtotal, eligible);
    var savings = subtotal - total;

    document.querySelectorAll(SELECTORS.total).forEach(function (el) {
      el.textContent = formatMoney(total);
    });
    document.querySelectorAll(SELECTORS.totalWas).forEach(function (el) {
      if (eligible && savings > 0) {
        el.textContent = formatMoney(subtotal);
        el.hidden = false;
      } else {
        el.textContent = '';
        el.hidden = true;
      }
    });
    document.querySelectorAll(SELECTORS.discountNote).forEach(function (el) {
      if (savings > 0) {
        el.textContent = thresholdMoney(discountThreshold()) + ' reached - ' + discountPercent() + '% off applied automatically';
      } else if (freeShippingEligible) {
        el.textContent = thresholdMoney(freeShippingThreshold()) + ' reached - add ' + formatMoney(remainingFor(discountThreshold(), subtotal)) + ' to reach ' + thresholdMoney(discountThreshold());
      } else if (!configured) {
        el.textContent = 'Rewards calculated at checkout';
      } else {
        el.textContent = 'Add ' + formatMoney(remainingFor(freeShippingThreshold(), subtotal)) + ' to reach ' + thresholdMoney(freeShippingThreshold()) + ' free shipping';
      }
    });

    renderTotalRows(beds, addonDetails, eligible, freeShippingEligible, savings);
    updateUnlockBar(subtotal, eligible, freeShippingEligible, savings);
    updateUnitPrice(beds);
    publishBundleItems();

    var pill = ensureAtcPill();
    if (pill) pill.textContent = formatMoney(total);

    if (beds.length) {
      document.querySelectorAll(SELECTORS.productPrice).forEach(function (el) {
        el.textContent = formatMoney(applyDiscount(beds[0].price, eligible));
      });
    }
  }
  window.ctRecomputeBundleTotal = recomputeTotal;

  function changeRowQty(index, delta) {
    var row = state.rows[index];
    if (!row) return;
    row.quantity = Math.max(1, Math.min(row.quantity + delta, MAX_ROW_QTY));
  }

  function bindBuilder() {
    var b = builder();
    if (!b) return;
    hydrateDefaultRows();
    renderRows();

    var picker = b.querySelector(SELECTORS.picker);
    if (picker) {
      picker.addEventListener('change', updateAddButton);
    }

    var addButton = b.querySelector(SELECTORS.addVariant);
    if (addButton) {
      addButton.addEventListener('click', function () {
        var option = pickerOption();
        if (!option || option.disabled) return;
        addVariant(option.value, 1);
        renderRows();
        recomputeTotal();
      });
    }

    b.addEventListener('click', function (e) {
      var plus = e.target.closest('[data-bundle-row-plus]');
      var minus = e.target.closest('[data-bundle-row-minus]');
      var remove = e.target.closest('[data-bundle-bed-remove]');
      if (plus) {
        changeRowQty(Number(plus.dataset.index || 0), 1);
      } else if (minus) {
        changeRowQty(Number(minus.dataset.index || 0), -1);
      } else if (remove) {
        if (state.rows.length <= 1) return;
        state.rows.splice(Number(remove.dataset.index || 0), 1);
      } else {
        return;
      }
      renderRows();
      recomputeTotal();
    });
  }

  function init() {
    if (!root()) return;
    bindBuilder();
    updateRewardMoneyLabels();
    document.addEventListener('submit', onSubmitCapture, true);
    document.addEventListener('click', function (e) {
      if (e.target.closest('.ct-addon')) setTimeout(recomputeTotal, 0);
    });
    recomputeTotal();
  }

  function hasAddonController() {
    return !!document.querySelector('.ct-addons[data-ct-addons]');
  }

  function onSubmitCapture(e) {
    if (hasAddonController()) return;
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    if (form.getAttribute('data-type') !== 'add-to-cart-form') return;
    var bundleItems = (window.ctBundleItems && window.ctBundleItems.length) ? window.ctBundleItems : null;
    if (!bundleItems) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    var items = bundleItems.map(function (it) {
      return { id: Number(it.id), quantity: Number(it.quantity || 1) };
    }).filter(function (it) {
      return it.id && it.quantity > 0;
    });
    if (items.length === 0) return;

    var cartTarget = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    var sectionsList = '';
    if (cartTarget && typeof cartTarget.getSectionsToRender === 'function') {
      try {
        sectionsList = cartTarget.getSectionsToRender().map(function (s) { return s.section; }).join(',');
      } catch (err) { sectionsList = ''; }
    }

    var payload = { items: items, sections_url: window.location.pathname };
    if (sectionsList) payload.sections = sectionsList;

    var url = (window.routes && window.routes.cart_add_url) ? window.routes.cart_add_url : '/cart/add.js';
    var btn = form.querySelector('[name="add"]');
    var spinner = form.closest('product-form') && form.closest('product-form').querySelector('.loading__spinner');
    if (btn) { btn.setAttribute('aria-disabled', 'true'); btn.classList.add('loading'); }
    if (spinner) spinner.classList.remove('hidden');

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/javascript',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (parsed) {
        if (btn) { btn.removeAttribute('aria-disabled'); btn.classList.remove('loading'); }
        if (spinner) spinner.classList.add('hidden');
        if (parsed && parsed.status) {
          var msg = parsed.description || parsed.message || 'Sorry - could not add to cart.';
          var errWrap = form.parentNode && form.parentNode.querySelector('.product-form__error-message-wrapper');
          var errMsg = errWrap && errWrap.querySelector('.product-form__error-message');
          if (errWrap && errMsg) { errMsg.textContent = msg; errWrap.hidden = false; }
          else { window.alert(msg); }
          return;
        }
        if (cartTarget && typeof cartTarget.renderContents === 'function') {
          try { cartTarget.renderContents(parsed); }
          catch (err) { window.location.href = '/cart'; }
        } else {
          window.location.href = '/cart';
        }
        if (typeof publish === 'function' && typeof PUB_SUB_EVENTS !== 'undefined' && PUB_SUB_EVENTS.cartUpdate) {
          try { publish(PUB_SUB_EVENTS.cartUpdate, { source: 'ct-bundle-builder', productVariantId: items[0].id }); }
          catch (err) {}
        }
      })
      .catch(function (err) {
        if (btn) { btn.removeAttribute('aria-disabled'); btn.classList.remove('loading'); }
        if (spinner) spinner.classList.add('hidden');
        console.error('[ct-bundle-builder] /cart/add failed', err);
        window.alert("Sorry - couldn't add to cart. Please try again.");
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
