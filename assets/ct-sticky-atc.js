/*
 * <ct-sticky-atc> — W3.T02 sticky add-to-cart bar.
 * Presentation lane (Dawn web-component style): visibility via IntersectionObserver,
 * live variant sync via Dawn's variantChange pubsub. The add itself rides the host
 * <product-form> (reuse mode) or its own form (standalone mode) — never forks the cart.
 */
if (!customElements.get('ct-sticky-atc')) {
  customElements.define(
    'ct-sticky-atc',
    class CtStickyAtc extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';

        this.sectionId = this.dataset.sectionId;
        this.priceEl = this.querySelector('[data-ct-sticky-price]');
        this.saveEl = this.querySelector('[data-ct-sticky-save]');
        this.btn = this.querySelector('[data-ct-sticky-add]');
        this.select = this.querySelector('[data-ct-sticky-variant]');

        this.setupVisibility();
        this.setupVariantSync();
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
        if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
        if (this.unsubscribe) this.unsubscribe();
      }

      // Show the bar once the host buy box has scrolled above the viewport.
      setupVisibility() {
        var anchor =
          document.querySelector('[data-ct-buybox-anchor="' + this.sectionId + '"]') ||
          document.getElementById('ProductSubmitButton-' + this.sectionId);

        if (anchor && 'IntersectionObserver' in window) {
          this.observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                // Visible only when the anchor has scrolled OUT and ABOVE the viewport.
                var scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
                this.classList.toggle('ct-sticky-atc--visible', scrolledPast);
              });
            },
            { threshold: 0 }
          );
          this.observer.observe(anchor);
          return;
        }

        // Fallback (standalone / no anchor / no IO support): reveal after a scroll threshold.
        this.scrollHandler = () => {
          this.classList.toggle('ct-sticky-atc--visible', window.scrollY > 500);
        };
        window.addEventListener('scroll', this.scrollHandler, { passive: true });
        this.scrollHandler();
      }

      setupVariantSync() {
        // Standalone mode: this bar owns its variant <select> — update its own display.
        if (this.select) {
          this.select.addEventListener('change', () => {
            var option = this.select.options[this.select.selectedIndex];
            if (!option) return;
            if (this.priceEl && option.dataset.price) this.priceEl.textContent = option.dataset.price;
            this.applySave(option.dataset.save);
            if (this.btn) this.btn.disabled = option.disabled;
          });
        }

        // Reuse mode: mirror the host product form's variant changes.
        if (window.subscribe && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.variantChange) {
          this.unsubscribe = window.subscribe(window.PUB_SUB_EVENTS.variantChange, (event) => {
            if (!event || !event.data) return;
            var evtId = event.data.sectionId;
            // Plain PDP matches directly; quick-add modal rewrites the id to quickadd-<id>.
            if (evtId !== this.sectionId && 'quickadd-' + evtId !== this.sectionId) return;
            this.applyVariant(event.data.variant, event.data.html);
          });
        }
      }

      applyVariant(variant, html) {
        if (!variant) {
          if (this.btn) this.btn.disabled = true;
          return;
        }
        if (this.btn) this.btn.disabled = !variant.available;

        // Pull the freshly-rendered, money-formatted price straight from Dawn's price block.
        if (this.priceEl && html) {
          var priceBlock = html.getElementById('price-' + this.sectionId);
          if (priceBlock) {
            var onSale = priceBlock.querySelector('.price--on-sale');
            var saleNode = priceBlock.querySelector('.price-item--sale');
            var regNode = priceBlock.querySelector('.price-item--regular');
            var node = onSale && saleNode ? saleNode : regNode;
            if (node) this.priceEl.textContent = node.textContent.trim();
          }
        }

        // Save badge from the variant's own compare-at (cents).
        if (this.saveEl) {
          var save = '';
          if (variant.compare_at_price && variant.compare_at_price > variant.price) {
            save = Math.round(((variant.compare_at_price - variant.price) * 100) / variant.compare_at_price).toString();
          }
          this.applySave(save);
        }
      }

      applySave(percent) {
        if (!this.saveEl) return;
        if (percent) {
          // Preserve the merchant's label prefix (text before the number), swap the number.
          var label = (this.saveEl.textContent || '').replace(/\d+%?\s*$/, '').trim();
          this.saveEl.textContent = (label ? label + ' ' : '') + percent + '%';
          this.saveEl.hidden = false;
        } else {
          this.saveEl.hidden = true;
        }
      }
    }
  );
}
