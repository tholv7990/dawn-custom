/*
 * <ct-atc-price> — W3.T09 price-in-the-Add-to-cart-button.
 * Appends the selected variant's price to the ATC button and updates it on
 * Dawn's variantChange. It is NOT a <span>, so Dawn's toggleSubmitButton (which
 * targets the button's first <span> label) never overwrites it. Hides when the
 * variant is unavailable. Presentation only — never touches the form/submit.
 */
if (!customElements.get('ct-atc-price')) {
  customElements.define(
    'ct-atc-price',
    class CtAtcPrice extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';

        this.sectionId = this.dataset.sectionId;
        this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';

        if (window.subscribe && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.variantChange) {
          this.unsubscribe = window.subscribe(window.PUB_SUB_EVENTS.variantChange, (event) => {
            if (!event || !event.data) return;
            var evtId = event.data.sectionId;
            if (evtId !== this.sectionId && 'quickadd-' + evtId !== this.sectionId) return;
            this.apply(event.data.variant);
          });
        }
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }

      apply(variant) {
        if (!variant || variant.available === false) {
          this.hidden = true;
          return;
        }
        this.hidden = false;
        this.textContent = this.formatMoney(variant.price);
      }

      formatMoney(cents) {
        if (this.moneyFormat && window.Shopify && typeof window.Shopify.formatMoney === 'function') {
          try {
            return window.Shopify.formatMoney(cents, this.moneyFormat);
          } catch (e) {
            /* fall through */
          }
        }
        return (cents / 100).toFixed(2);
      }
    }
  );
}
