/* ct-bundle-tiers.js — PDP bundle tier picker.
   Whole-card radio toggle (role=radio + aria-checked, no <input>). The
   active tier's per-card <select>s define which variants get added to
   cart; ct-bundle-tiers publishes window.ctBundleItems from those, and
   ct-addons.js prefers that over the form's name=id on submit. Running
   total = (active tier's selected variant prices) + sum of checked
   add-ons; updates on tier / variant / add-on changes. */
(function () {
  if (window.ctBundleTiersLoaded) return;
  window.ctBundleTiersLoaded = true;

  function formatMoney(cents) {
    if (window.Shopify && typeof Shopify.formatMoney === 'function') {
      var fmt = (window.theme && window.theme.moneyFormat) || '${{amount}}';
      try { return Shopify.formatMoney(cents, fmt); } catch (e) {}
    }
    return '$' + (Number(cents) / 100).toFixed(2);
  }

  function tiers() {
    return Array.prototype.slice.call(document.querySelectorAll('.ct-tier[data-ct-tier]'));
  }

  function activeTier() {
    return document.querySelector('.ct-tier[data-ct-tier][aria-checked="true"]');
  }

  function activate(card) {
    tiers().forEach(function (c) {
      var on = (c === card);
      c.setAttribute('aria-checked', on ? 'true' : 'false');
      c.setAttribute('tabindex', on ? '0' : '-1');
      c.classList.toggle('ct-tier--active', on);
    });
    publishBundleItems();
    recomputeTotal();
  }

  function publishBundleItems() {
    var tier = activeTier();
    if (!tier) { window.ctBundleItems = null; return; }
    var qty = Number(tier.dataset.qty || 1);
    var selects = tier.querySelectorAll('.ct-tier__variant');
    var items = [];
    selects.forEach(function (sel) {
      var vid = Number(sel.value);
      if (vid) items.push({ id: vid, quantity: 1 });
    });
    // Fallback for tier blocks without selects (no product / no variants):
    // honor qty by adding the form's default variant N times.
    if (items.length === 0) {
      var form = document.querySelector('form[data-type="add-to-cart-form"]');
      var idInput = form && form.querySelector('[name="id"]');
      var vid = idInput && Number(idInput.value);
      if (vid) {
        for (var i = 0; i < qty; i++) items.push({ id: vid, quantity: 1 });
      }
    }
    window.ctBundleItems = items;
  }

  function recomputeTotal() {
    var total = 0;
    var tier = activeTier();
    if (tier) {
      tier.querySelectorAll('.ct-tier__variant').forEach(function (sel) {
        var opt = sel.options[sel.selectedIndex];
        if (opt) total += Number(opt.dataset.price || 0);
      });
      // No selects but we still want to bill the tier — use form variant × qty
      if (tier.querySelectorAll('.ct-tier__variant').length === 0) {
        var qty = Number(tier.dataset.qty || 1);
        var form = document.querySelector('form[data-type="add-to-cart-form"]');
        var price = 0;
        // No reliable per-variant price without the snippet's data; leave total at 0.
        total = price * qty;
      }
    }
    document.querySelectorAll('.ct-addons .ct-addon[aria-pressed="true"]').forEach(function (card) {
      total += Number(card.dataset.basePrice || 0);
    });
    document.querySelectorAll('[data-bundle-total]').forEach(function (el) {
      el.textContent = formatMoney(total);
    });
  }

  function bindCard(card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.ct-tier__variant')) return;
      activate(card);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
        e.preventDefault();
        activate(card);
      }
    });
    card.querySelectorAll('.ct-tier__variant').forEach(function (sel) {
      sel.addEventListener('click', function (e) { e.stopPropagation(); });
      sel.addEventListener('keydown', function (e) { e.stopPropagation(); });
      sel.addEventListener('change', function () {
        publishBundleItems();
        recomputeTotal();
      });
    });
  }

  function init() {
    var list = tiers();
    if (list.length === 0) return;
    list.forEach(bindCard);
    // If no tier is featured/active by default, activate the first.
    if (!activeTier()) activate(list[0]);
    // Listen for add-on clicks so total stays in sync.
    document.addEventListener('click', function (e) {
      if (e.target.closest('.ct-addon')) setTimeout(recomputeTotal, 0);
    });
    publishBundleItems();
    recomputeTotal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
