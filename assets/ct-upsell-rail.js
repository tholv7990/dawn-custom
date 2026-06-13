/*
 * <ct-upsell-rail> — W3.T05 exclude-in-cart. Hides upsell cards whose product
 * is already in the cart, live on Dawn's cartUpdate. Presentation only.
 */
if (!customElements.get('ct-upsell-rail')) {
  customElements.define(
    'ct-upsell-rail',
    class CtUpsellRail extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';
        if (this.dataset.excludeInCart !== 'true') return;

        if (window.subscribe && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.cartUpdate) {
          this.unsubscribe = window.subscribe(window.PUB_SUB_EVENTS.cartUpdate, (event) => this.sync(event && event.cartData));
        }
        // Server already rendered the initial in-cart hidden state; no connect-time fetch needed.
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
        if (this.ctrl) this.ctrl.abort();
      }

      apply(cart) {
        var pids = {};
        (cart.items || []).forEach((item) => {
          pids[item.product_id] = true;
        });
        this.querySelectorAll('[data-upsell-pid]').forEach((li) => {
          var inCart = !!pids[li.getAttribute('data-upsell-pid')];
          li.hidden = inCart;
          li.classList.toggle('ct-upsells__item--hidden', inCart);
        });
      }

      sync(cartData) {
        // Prefer the cartUpdate payload when present.
        if (cartData && cartData.items) {
          this.apply(cartData);
          return;
        }
        // Otherwise fetch once, aborting any prior in-flight request so a stale
        // out-of-order response can't overwrite the latest state.
        if (this.ctrl) this.ctrl.abort();
        this.ctrl = new AbortController();
        var routes = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
        fetch(routes + 'cart.js', { headers: { Accept: 'application/json' }, signal: this.ctrl.signal })
          .then((res) => res.json())
          .then((cart) => this.apply(cart))
          .catch(() => {});
      }
    }
  );
}
