/* ct-addons.js — PDP cross-sell add-ons box.
   Whole-card toggle (no checkbox/radio); on main add-to-cart submit, bundles
   the main product + every pressed add-on into one /cart/add.js POST and
   hands the response to Dawn's cart-notification / cart-drawer. */
(function () {
  if (window.ctAddonsLoaded) return;
  window.ctAddonsLoaded = true;

  function formatMoney(cents) {
    if (window.Shopify && typeof Shopify.formatMoney === 'function') {
      var fmt = (window.theme && window.theme.moneyFormat) || '${{amount}}';
      try { return Shopify.formatMoney(cents, fmt); } catch (e) {}
    }
    return '$' + (Number(cents) / 100).toFixed(2);
  }

  function toggle(card) {
    var pressed = card.getAttribute('aria-pressed') === 'true';
    card.setAttribute('aria-pressed', pressed ? 'false' : 'true');
  }

  function bindCard(card) {
    card.addEventListener('click', function (e) {
      // Ignore clicks that originate on the variant select (or its children).
      if (e.target.closest('.ct-addon__variant')) return;
      toggle(card);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
        e.preventDefault();
        toggle(card);
      }
    });
    var sel = card.querySelector('.ct-addon__variant');
    if (!sel) return;
    // Clicking the select must NOT toggle the card.
    sel.addEventListener('click', function (e) { e.stopPropagation(); });
    sel.addEventListener('keydown', function (e) { e.stopPropagation(); });
    sel.addEventListener('change', function () {
      var opt = sel.options[sel.selectedIndex];
      if (!opt) return;
      card.dataset.variantId = opt.value;
      var price = Number(opt.dataset.price || 0);
      var compare = Number(opt.dataset.compare || 0);
      var nowEl = card.querySelector('[data-addon-now]');
      var wasEl = card.querySelector('[data-addon-was]');
      var saveEl = card.querySelector('[data-addon-save]');
      if (nowEl) nowEl.textContent = formatMoney(price);
      if (compare > price) {
        if (wasEl) { wasEl.textContent = formatMoney(compare); wasEl.hidden = false; }
        if (saveEl) saveEl.textContent = formatMoney(compare - price);
      } else {
        if (wasEl) { wasEl.textContent = ''; wasEl.hidden = true; }
        if (saveEl) saveEl.textContent = '';
      }
    });
  }

  function pressedAddons() {
    return Array.prototype.slice.call(
      document.querySelectorAll('.ct-addons[data-ct-addons] .ct-addon[aria-pressed="true"]')
    );
  }

  function onSubmitCapture(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    if (form.getAttribute('data-type') !== 'add-to-cart-form') return;
    var pressed = pressedAddons();
    if (pressed.length === 0) return; // No add-ons selected — let Dawn handle.

    // Intercept Dawn's normal flow.
    e.preventDefault();
    e.stopImmediatePropagation();

    var idInput = form.querySelector('[name="id"]');
    if (!idInput || !idInput.value) return;
    var qtyInput = form.querySelector('[name="quantity"]');
    var mainQty = Number((qtyInput && qtyInput.value) || 1);

    var items = [{ id: Number(idInput.value), quantity: mainQty }];
    pressed.forEach(function (card) {
      var vid = Number(card.dataset.variantId);
      if (vid) items.push({ id: vid, quantity: 1 });
    });

    var cartTarget = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    var sectionsList = '';
    if (cartTarget && typeof cartTarget.getSectionsToRender === 'function') {
      try {
        sectionsList = cartTarget.getSectionsToRender().map(function (s) { return s.section; }).join(',');
      } catch (err) { sectionsList = ''; }
    }

    var payload = {
      items: items,
      sections_url: window.location.pathname
    };
    if (sectionsList) payload.sections = sectionsList;

    var url = (window.routes && window.routes.cart_add_url) ? window.routes.cart_add_url : '/cart/add.js';

    var btn = form.querySelector('[name="add"]');
    if (btn) {
      btn.setAttribute('aria-disabled', 'true');
      btn.classList.add('loading');
    }

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
        if (parsed && parsed.status) {
          // Shopify returned an error structure.
          var msg = parsed.description || parsed.message || 'Sorry — could not add to cart.';
          var errWrap = form.parentNode && form.parentNode.querySelector('.product-form__error-message-wrapper');
          var errMsg = errWrap && errWrap.querySelector('.product-form__error-message');
          if (errWrap && errMsg) { errMsg.textContent = msg; errWrap.hidden = false; }
          else { window.alert(msg); }
          return;
        }
        // Reset the add-on pressed state.
        pressed.forEach(function (card) { card.setAttribute('aria-pressed', 'false'); });

        if (cartTarget && typeof cartTarget.renderContents === 'function') {
          try { cartTarget.renderContents(parsed); }
          catch (err) { window.location.href = '/cart'; }
        } else {
          window.location.href = '/cart';
        }

        if (window.publish && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.cartUpdate) {
          try { window.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'ct-addons', productVariantId: items[0].id }); }
          catch (err) {}
        }
      })
      .catch(function (err) {
        if (btn) { btn.removeAttribute('aria-disabled'); btn.classList.remove('loading'); }
        // eslint-disable-next-line no-console
        console.error('[ct-addons] /cart/add failed', err);
        window.alert("Sorry — couldn't add to cart. Please try again.");
      });
  }

  function init() {
    document.querySelectorAll('.ct-addon[data-ct-addon]').forEach(bindCard);
    document.addEventListener('submit', onSubmitCapture, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
