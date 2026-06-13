/*
 * <ct-quantity-breaks> — W3.T01 quantity-break tier selector.
 * Tier select = radiogroup. Add goes through Dawn's cart/add.js endpoint and
 * refreshes Dawn's cart UI (G-07): qty-N of the host variant, or — with
 * per-unit variants — a multi-line items[] payload of each unit's chosen variant.
 */
if (!customElements.get('ct-quantity-breaks')) {
  customElements.define(
    'ct-quantity-breaks',
    class CtQuantityBreaks extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';

        this.sectionId = this.dataset.sectionId;
        this.formId = this.dataset.formId;
        this.perUnit = this.dataset.perUnit === 'true';
        this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';
        this.tiers = Array.from(this.querySelectorAll('[data-ct-qb-tier]'));
        this.addBtn = this.querySelector('[data-ct-qb-add]');

        this.tiers.forEach((tier) => {
          tier.addEventListener('click', () => this.selectTier(tier));
          tier.addEventListener('keydown', (e) => this.onTierKey(e, tier));
          // Per-unit selects must not bubble a tier "click" that resets focus.
          tier.querySelectorAll('[data-ct-qb-unit]').forEach((sel) => {
            sel.addEventListener('click', (e) => e.stopPropagation());
          });
        });

        if (this.addBtn) this.addBtn.addEventListener('click', () => this.add());

        if (window.subscribe && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.variantChange) {
          this.unsubscribe = window.subscribe(window.PUB_SUB_EVENTS.variantChange, (event) => {
            if (!event || !event.data || event.data.sectionId !== this.sectionId) return;
            this.onVariantChange(event.data.variant);
          });
        }
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }

      currentTier() {
        return this.querySelector('[data-ct-qb-tier].ct-qb__tier--active') || this.tiers[0];
      }

      selectTier(tier) {
        this.tiers.forEach((t) => {
          var active = t === tier;
          t.classList.toggle('ct-qb__tier--active', active);
          t.setAttribute('aria-checked', active ? 'true' : 'false');
          t.setAttribute('tabindex', active ? '0' : '-1');
        });
        tier.focus();
      }

      onTierKey(event, tier) {
        var key = event.key;
        if (key === ' ' || key === 'Enter') {
          event.preventDefault();
          this.selectTier(tier);
          return;
        }
        var idx = this.tiers.indexOf(tier);
        if (key === 'ArrowDown' || key === 'ArrowRight') {
          event.preventDefault();
          this.selectTier(this.tiers[(idx + 1) % this.tiers.length]);
        } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
          event.preventDefault();
          this.selectTier(this.tiers[(idx - 1 + this.tiers.length) % this.tiers.length]);
        }
      }

      mainForm() {
        return this.formId ? document.getElementById(this.formId) : null;
      }

      // Variant id the host buy box currently has selected.
      hostVariantId() {
        var form = this.mainForm();
        var input = form && form.querySelector('[name="id"]');
        return input ? input.value : null;
      }

      buildPayload() {
        var tier = this.currentTier();
        var qty = tier ? parseInt(tier.getAttribute('data-quantity'), 10) || 1 : 1;

        if (this.perUnit) {
          var selects = tier ? tier.querySelectorAll('[data-ct-qb-unit]') : [];
          var counts = {};
          selects.forEach((sel) => {
            var id = sel.value;
            counts[id] = (counts[id] || 0) + 1;
          });
          var items = Object.keys(counts).map((id) => ({ id: Number(id), quantity: counts[id] }));
          if (items.length) return { items: items };
        }

        var variantId = this.hostVariantId();
        if (!variantId) return null;
        return { items: [{ id: Number(variantId), quantity: qty }] };
      }

      cartElement() {
        return document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      }

      add() {
        var payload = this.buildPayload();
        if (!payload) return;

        var cart = this.cartElement();
        var sections = 'cart-icon-bubble';
        if (cart && typeof cart.getSectionsToRender === 'function') {
          sections = cart
            .getSectionsToRender()
            .map((s) => s.id)
            .join(',');
        }
        payload.sections = sections;
        payload.sections_url = window.location.pathname;

        this.setLoading(true);
        var routes = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

        fetch(routes + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status) {
              // Shopify error shape (e.g. sold out): surface, do not refresh.
              this.showError(data.description || data.message);
              return;
            }
            if (cart && typeof cart.renderContents === 'function') {
              if (cart.setActiveElement) cart.setActiveElement(document.activeElement);
              cart.renderContents(data);
            } else if (window.publish && window.PUB_SUB_EVENTS) {
              window.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'ct-quantity-breaks' });
            }
          })
          .catch(() => this.showError(''))
          .finally(() => this.setLoading(false));
      }

      setLoading(on) {
        if (!this.addBtn) return;
        this.addBtn.classList.toggle('loading', on);
        this.addBtn.setAttribute('aria-disabled', on ? 'true' : 'false');
        var spinner = this.addBtn.querySelector('.loading__spinner, .loading-overlay__spinner');
        if (spinner) spinner.classList.toggle('hidden', !on);
      }

      showError(message) {
        if (!message) return;
        var box = this.querySelector('[data-ct-qb-error]');
        if (!box) {
          box = document.createElement('div');
          box.className = 'ct-qb__error';
          box.setAttribute('data-ct-qb-error', '');
          box.setAttribute('role', 'alert');
          this.appendChild(box);
        }
        box.textContent = message;
      }

      onVariantChange(variant) {
        if (!variant) {
          if (this.addBtn) this.addBtn.disabled = true;
          return;
        }
        if (this.addBtn) this.addBtn.disabled = !variant.available;
        this.recomputePrices(variant.price, variant.compare_at_price);
      }

      recomputePrices(unitCents, compareCents) {
        this.tiers.forEach((tier) => {
          var qty = parseInt(tier.getAttribute('data-quantity'), 10) || 1;
          var total = unitCents * qty;
          var priceEl = tier.querySelector('[data-ct-qb-price]');
          if (priceEl) priceEl.textContent = this.formatMoney(total);

          var compareEl = tier.querySelector('[data-ct-qb-compare]');
          var saveEl = tier.querySelector('[data-ct-qb-save]');
          if (compareCents && compareCents > unitCents) {
            var compareTotal = compareCents * qty;
            if (compareEl) compareEl.textContent = this.formatMoney(compareTotal);
            if (saveEl) {
              var pct = Math.round(((compareTotal - total) * 100) / compareTotal);
              var label = (saveEl.textContent || '').replace(/\d+%?\s*$/, '').trim();
              saveEl.textContent = (label ? label + ' ' : '') + pct + '%';
            }
          } else {
            if (compareEl) compareEl.textContent = '';
            if (saveEl) saveEl.textContent = '';
          }
        });
      }

      // Minimal Shopify money formatter — covers the common money_format tokens.
      formatMoney(cents) {
        var value = '';
        var format = this.moneyFormat;
        function group(number, decimals, thousands, decimalSep) {
          number = (number / 100).toFixed(decimals);
          var parts = number.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
          return parts.join(decimalSep || '.');
        }
        var match = format.match(/\{\{\s*(\w+)\s*\}\}/);
        var token = match ? match[1] : 'amount';
        switch (token) {
          case 'amount':
            value = group(cents, 2, ',', '.');
            break;
          case 'amount_no_decimals':
            value = group(cents, 0, ',', '.');
            break;
          case 'amount_with_comma_separator':
            value = group(cents, 2, '.', ',');
            break;
          case 'amount_no_decimals_with_comma_separator':
            value = group(cents, 0, '.', ',');
            break;
          case 'amount_with_apostrophe_separator':
            value = group(cents, 2, "'", '.');
            break;
          default:
            value = group(cents, 2, ',', '.');
        }
        return format.replace(/\{\{\s*\w+\s*\}\}/, value);
      }
    }
  );
}
