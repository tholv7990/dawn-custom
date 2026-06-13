/* ct-price-tokens.js (W2.T01) - presentation-lane price-token resolver.
   Pure utility: takes a template string + pre-formatted money values and returns the
   resolved string. Money formatting stays server-side (Liquid | money); consumers pass
   already-formatted strings so this file carries no currency logic and no dependencies.
   Inert until a consumer dispatches 'ct:price:refresh' on a [data-ct-price-tokens] node. */
(function () {
  window.CT = window.CT || {};
  if (window.CT.resolvePriceTokens) return;

  // Longer tokens are replaced before their shorter counterparts.
  window.CT.resolvePriceTokens = function (template, values) {
    var v = values || {};
    return String(template == null ? '' : template)
      .replace(/\[quantity\]/g, v.quantity != null ? v.quantity : '')
      .replace(/\[compare_price_each\]/g, v.comparePriceEach || '')
      .replace(/\[price_each\]/g, v.priceEach || '')
      .replace(/\[compare_price\]/g, v.comparePrice || '')
      .replace(/\[amount_saved_rounded\]/g, v.amountSavedRounded || '')
      .replace(/\[amount_saved\]/g, v.amountSaved || '')
      .replace(/\[price\]/g, v.price || '');
  };

  // Auto-wire: an element stores its raw template in data-ct-price-template; dispatching
  // a 'ct:price:refresh' CustomEvent (detail = values) on it re-renders the resolved text.
  document.addEventListener(
    'ct:price:refresh',
    function (event) {
      var el = event.target;
      if (!el || typeof el.hasAttribute !== 'function' || !el.hasAttribute('data-ct-price-tokens')) return;
      var template = el.getAttribute('data-ct-price-template');
      if (template == null && el.dataset) template = el.dataset.ctPriceTemplate;
      el.innerHTML = window.CT.resolvePriceTokens(template, event.detail || {});
    },
    true
  );
})();
