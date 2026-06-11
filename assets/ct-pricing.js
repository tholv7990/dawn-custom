(function () {
  if (customElements.get('ct-savings-calculator')) return;

  customElements.define(
    'ct-savings-calculator',
    class CtSavingsCalculator extends HTMLElement {
      connectedCallback() {
        this.range = this.querySelector('[data-savings-range]');
        this.amount = this.querySelector('[data-savings-amount]');
        this.status = this.querySelector('[data-savings-status]');
        this.fill = this.querySelector('[data-savings-fill]');

        if (!this.range || !this.amount || !this.status || !this.fill) return;

        this.freeShippingThreshold = Number(this.dataset.freeShippingThreshold || 0);
        this.discountThreshold = Number(this.dataset.discountThreshold || 0);
        this.discountPercent = Number(this.dataset.discountPercent || 15);
        this.maxTotal = Number(this.dataset.maxTotal || this.range.max || 15000);
        this.moneyFormat = window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : this.dataset.moneyFormat;

        this.onInput = this.update.bind(this);
        this.range.addEventListener('input', this.onInput);
        this.update();
      }

      disconnectedCallback() {
        if (this.range && this.onInput) this.range.removeEventListener('input', this.onInput);
      }

      formatMoney(cents) {
        if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
          return window.Shopify.formatMoney(Math.max(0, Math.round(cents)), this.moneyFormat);
        }

        return '$' + (Math.max(0, cents) / 100).toFixed(0);
      }

      update() {
        var subtotal = Number(this.range.value || 0);
        var progress = this.maxTotal > 0 ? Math.min(100, Math.max(0, (subtotal / this.maxTotal) * 100)) : 0;

        this.amount.textContent = this.formatMoney(subtotal);
        this.fill.style.width = progress + '%';

        if (subtotal >= this.discountThreshold) {
          this.status.textContent = this.formatMoney(this.discountThreshold) + ' reached - ' + this.discountPercent + '% off + free shipping';
          this.dataset.state = 'discount';
          return;
        }

        if (subtotal >= this.freeShippingThreshold) {
          this.status.textContent =
            this.formatMoney(this.freeShippingThreshold) + ' reached - add ' + this.formatMoney(this.discountThreshold - subtotal) + ' to reach ' + this.formatMoney(this.discountThreshold);
          this.dataset.state = 'shipping';
          return;
        }

        this.status.textContent = 'Add ' + this.formatMoney(this.freeShippingThreshold - subtotal) + ' to reach ' + this.formatMoney(this.freeShippingThreshold) + ' free shipping';
        this.dataset.state = 'base';
      }
    }
  );
})();
