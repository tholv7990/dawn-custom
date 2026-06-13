/*
 * <ct-cart-discount> — W4.T05 cart discount-code field (drawer + cart page).
 * On submit, navigates to Shopify's native discount link so the code attaches
 * to the cart, then returns to /cart (where Dawn renders the applied-discount
 * chips from cart.cart_level_discount_applications). Uses window.Shopify.routes.root
 * (the populated JS root), not Liquid routes.root.
 * FAIL-OPEN: if this never runs, the native <form> still submits.
 */
if (!customElements.get('ct-cart-discount')) {
  customElements.define(
    'ct-cart-discount',
    class CtCartDiscount extends HTMLElement {
      connectedCallback() {
        if (this._ready) return;
        this._ready = true;
        this.form = this.querySelector('[data-ct-discount-form]');
        this.input = this.querySelector('[data-ct-discount-input]');
        this.status = this.querySelector('[data-ct-discount-status]');
        this.emptyMsg = this.dataset.emptyMsg || '';
        this.applyingMsg = this.dataset.applyingMsg || '';
        if (!this.form || !this.input) return;
        this._onSubmit = this.onSubmit.bind(this);
        this.form.addEventListener('submit', this._onSubmit);
      }

      disconnectedCallback() {
        if (this.form && this._onSubmit) this.form.removeEventListener('submit', this._onSubmit);
      }

      rootPath() {
        var routes = window.Shopify && window.Shopify.routes;
        return (routes && routes.root) || '/';
      }

      setStatus(message) {
        if (this.status) this.status.textContent = message || '';
      }

      onSubmit(event) {
        event.preventDefault();
        var code = (this.input.value || '').trim();
        if (!code) {
          this.setStatus(this.emptyMsg);
          this.input.focus();
          return;
        }
        this.setStatus(this.applyingMsg);
        var target = this.rootPath() + 'discount/' + encodeURIComponent(code) + '?redirect=/cart';
        try {
          window.location.assign(target);
        } catch (e) {
          // Progressive enhancement: fall back to a native navigation.
          try {
            this.form.action = this.rootPath() + 'discount/' + encodeURIComponent(code);
            this.form.submit();
          } catch (err) {
            /* keep the page usable if navigation APIs are unavailable */
          }
        }
      }
    }
  );
}
