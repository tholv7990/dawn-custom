/*
 * <ct-savings-line> — W3.T09. Shows the variant's real savings; hides when not
 * on sale. Recomputes on Dawn's variantChange. Presentation only.
 */
if (!customElements.get('ct-savings-line')) {
  customElements.define(
    'ct-savings-line',
    class CtSavingsLine extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';

        this.sectionId = this.dataset.sectionId;
        this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';
        this.prefix = this.dataset.prefix || 'You save';
        this.showAmount = this.dataset.showAmount === 'true';
        this.showPercent = this.dataset.showPercent === 'true';
        this.amountEl = this.querySelector('[data-savings-amount]');
        this.percentEl = this.querySelector('[data-savings-percent]');

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
        if (!variant || !variant.compare_at_price || variant.compare_at_price <= variant.price) {
          this.hidden = true;
          return;
        }
        var saved = variant.compare_at_price - variant.price;
        // Floor to match the Liquid divided_by server render (no 1% snap on variant change).
        var percent = Math.floor((saved * 100) / variant.compare_at_price);
        if (this.amountEl) this.amountEl.textContent = this.formatMoney(saved);
        if (this.percentEl) this.percentEl.textContent = '(' + percent + '%)';
        this.hidden = false;
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
