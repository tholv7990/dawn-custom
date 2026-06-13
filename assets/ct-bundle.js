/*
 * <ct-bundle> — W3.T03 bundle offer. Host product + add-ons added in one
 * click as a multi-line cart/add.js items[] payload through Dawn's cart (G-07).
 * Live combined total recomputes as per-line variants change.
 */
if (!customElements.get('ct-bundle')) {
  customElements.define(
    'ct-bundle',
    class CtBundle extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';

        this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';
        this.partial = this.dataset.partial || 'skip';
        this.emptyMsg = this.dataset.emptyMsg || '';
        this.errorMsg = this.dataset.errorMsg || '';
        this.lines = Array.from(this.querySelectorAll('[data-ct-bundle-line]'));
        this.addBtn = this.querySelector('[data-ct-bundle-add]');
        this.totalEl = this.querySelector('[data-ct-bundle-total]');
        this.compareEl = this.querySelector('[data-ct-bundle-compare]');
        this.savingsRow = this.querySelector('[data-ct-bundle-savings]');
        this.savingsAmount = this.querySelector('[data-ct-bundle-savings-amount]');
        this.errorEl = this.querySelector('[data-ct-bundle-error]');

        this.lines.forEach((line) => {
          var sel = line.querySelector('select[data-ct-bundle-variant]');
          if (sel) sel.addEventListener('change', () => this.onLineChange(line, sel));
        });

        if (this.addBtn) this.addBtn.addEventListener('click', () => this.add());
        this.recompute();
      }

      lineControl(line) {
        return line.querySelector('[data-ct-bundle-variant]');
      }

      lineQty(line) {
        return parseInt(line.dataset.qty, 10) || 1;
      }

      lineState(line) {
        var ctrl = this.lineControl(line);
        if (!ctrl) return null;
        if (ctrl.tagName === 'SELECT') {
          var opt = ctrl.options[ctrl.selectedIndex];
          return {
            id: Number(ctrl.value),
            unit: parseInt(opt.getAttribute('data-cents'), 10) || 0,
            compare: parseInt(opt.getAttribute('data-compare-cents'), 10) || 0,
            available: opt.getAttribute('data-available') === 'true',
          };
        }
        return {
          id: Number(ctrl.value),
          unit: parseInt(line.dataset.unitCents, 10) || 0,
          // Read the server-rendered compare-at for single-variant / variant-select-off
          // lines so the on-connect recompute() reproduces the Liquid compare_total
          // instead of zeroing the savings of an on-sale line (e.g. the main product).
          compare: parseInt(line.dataset.compareCents, 10) || 0,
          available: ctrl.getAttribute('data-available') === 'true',
        };
      }

      onLineChange(line, sel) {
        var opt = sel.options[sel.selectedIndex];
        var unit = parseInt(opt.getAttribute('data-cents'), 10) || 0;
        var qty = this.lineQty(line);
        var priceEl = line.querySelector('[data-ct-bundle-line-price]');
        if (priceEl) priceEl.textContent = this.formatMoney(unit * qty);
        var wasEl = line.querySelector('.ct-bundle__line-was');
        var compare = parseInt(opt.getAttribute('data-compare-cents'), 10) || 0;
        if (wasEl) wasEl.textContent = compare > unit ? this.formatMoney(compare * qty) : '';
        this.recompute();
      }

      recompute() {
        var total = 0;
        var compareTotal = 0;
        var allAvailable = true;
        this.lines.forEach((line) => {
          var st = this.lineState(line);
          if (!st) return;
          var qty = this.lineQty(line);
          total += st.unit * qty;
          compareTotal += (st.compare > st.unit ? st.compare : st.unit) * qty;
          if (!st.available) allAvailable = false;
        });

        if (this.totalEl) this.totalEl.textContent = this.formatMoney(total);
        var savings = compareTotal - total;
        if (this.compareEl) {
          this.compareEl.textContent = savings > 0 ? this.formatMoney(compareTotal) : '';
        }
        if (this.savingsRow && this.savingsAmount) {
          this.savingsRow.hidden = savings <= 0;
          this.savingsAmount.textContent = this.formatMoney(savings);
        }

        // Reconcile the add button on load + on every line change. Never
        // override the in-flight busy state. In skip mode buildItems() drops
        // unavailable lines, so the button must stay live; in block mode any
        // unavailable line disables the whole bundle.
        if (this.addBtn && !this._busy) {
          this.addBtn.disabled = this.partial === 'block' ? !allAvailable : false;
          this.addBtn.setAttribute('aria-disabled', this.addBtn.disabled ? 'true' : 'false');
        }
      }

      buildItems() {
        var counts = {};
        var skipped = 0;
        this.lines.forEach((line) => {
          var st = this.lineState(line);
          if (!st || !st.id) return;
          if (!st.available) {
            if (this.partial === 'skip') {
              skipped += 1;
              return; // drop the unavailable line, keep the rest
            }
          }
          var qty = this.lineQty(line);
          counts[st.id] = (counts[st.id] || 0) + qty;
        });
        var items = Object.keys(counts).map((id) => ({ id: Number(id), quantity: counts[id] }));
        return { items: items, skipped: skipped };
      }

      cartElement() {
        return document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      }

      add() {
        if (this._busy) return;
        if (this.addBtn && this.addBtn.disabled) return;
        this.clearError();

        var built = this.buildItems();
        if (!built.items.length) {
          this.showError(this.emptyMsg);
          return;
        }

        var cart = this.cartElement();
        var sections = 'cart-icon-bubble';
        if (cart && typeof cart.getSectionsToRender === 'function') {
          sections = cart
            .getSectionsToRender()
            .map((sec) => sec.id)
            .join(',');
        }

        var routes = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
        this.setBusy(true);

        fetch(routes + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: built.items, sections: sections, sections_url: window.location.pathname }),
        })
          .then((res) => res.json().then((data) => ({ ok: res.ok, data: data })))
          .then((res) => {
            if (!res.ok || res.data.status) {
              throw new Error(res.data.description || res.data.message || this.errorMsg);
            }
            if (cart && typeof cart.renderContents === 'function') {
              if (cart.setActiveElement) cart.setActiveElement(document.activeElement);
              cart.renderContents(res.data);
            } else if (window.publish && window.PUB_SUB_EVENTS) {
              window.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'ct-bundle' });
            }
          })
          .catch((err) => this.showError(err && err.message))
          .finally(() => this.setBusy(false));
      }

      setBusy(on) {
        this._busy = on;
        if (!this.addBtn) return;
        this.addBtn.disabled = on;
        this.addBtn.classList.toggle('loading', on);
        this.addBtn.setAttribute('aria-busy', on ? 'true' : 'false');
        var spinner = this.addBtn.querySelector('.loading__spinner, .loading-overlay__spinner');
        if (spinner) spinner.classList.toggle('hidden', !on);
        if (!on) this.recompute();
      }

      showError(message) {
        if (!this.errorEl) return;
        this.errorEl.textContent = message || this.errorMsg;
        this.errorEl.hidden = false;
      }

      clearError() {
        if (!this.errorEl) return;
        this.errorEl.textContent = '';
        this.errorEl.hidden = true;
      }

      formatMoney(cents) {
        var format = this.moneyFormat;
        function group(number, decimals, thousands, decimalSep) {
          number = (number / 100).toFixed(decimals);
          var parts = number.split('.');
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
          return parts.join(decimalSep || '.');
        }
        var match = format.match(/\{\{\s*(\w+)\s*\}\}/);
        var token = match ? match[1] : 'amount';
        var value;
        switch (token) {
          case 'amount_no_decimals':
            value = group(cents, 0, ',', '.');
            break;
          case 'amount_with_comma_separator':
            value = group(cents, 2, '.', ',');
            break;
          case 'amount_no_decimals_with_comma_separator':
            value = group(cents, 0, '.', ',');
            break;
          case 'amount_with_space_separator':
            value = group(cents, 2, ' ', ',');
            break;
          case 'amount_no_decimals_with_space_separator':
            value = group(cents, 0, ' ', ',');
            break;
          case 'amount_with_period_and_space_separator':
            value = group(cents, 2, ' ', '.');
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
