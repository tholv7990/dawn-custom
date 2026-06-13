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
          this.unsubscribe = window.subscribe(window.PUB_SUB_EVENTS.cartUpdate, () => this.sync());
        }
        this.sync();
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }

      sync() {
        var routes = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
        fetch(routes + 'cart.js', { headers: { Accept: 'application/json' } })
          .then((res) => res.json())
          .then((cart) => {
            var pids = {};
            (cart.items || []).forEach((item) => {
              pids[item.product_id] = true;
            });
            this.querySelectorAll('[data-upsell-pid]').forEach((li) => {
              var inCart = !!pids[li.getAttribute('data-upsell-pid')];
              li.hidden = inCart;
              li.classList.toggle('ct-upsells__item--hidden', inCart);
            });
          })
          .catch(() => {});
      }
    }
  );
}
