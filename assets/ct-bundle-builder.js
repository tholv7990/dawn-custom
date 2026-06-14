/*
 * <ct-bundle-builder> - shopper-driven build-your-bundle.
 * Pick a variant + Add -> appends/increments a line; per-line qty stepper and
 * remove; live total from server-rendered variant cents (never synthesized);
 * "Add bundle to cart" posts items[] to cart/add.js through Dawn's cart (G-07).
 */
if (!customElements.get('ct-bundle-builder')) {
  customElements.define(
    'ct-bundle-builder',
    class CtBundleBuilder extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';

        this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';
        this.productTitle = this.dataset.productTitle || '';

        this.variants = {};
        var dataEl = this.querySelector('[data-ct-bb-variants]');
        if (dataEl) {
          try {
            (JSON.parse(dataEl.textContent) || []).forEach((v) => {
              this.variants[v.id] = v;
            });
          } catch (e) {
            /* leave variants empty */
          }
        }

        this.select = this.querySelector('[data-ct-bb-select]');
        this.addLineBtn = this.querySelector('[data-ct-bb-add-line]');
        this.linesEl = this.querySelector('[data-ct-bb-lines]');
        this.emptyEl = this.querySelector('[data-ct-bb-empty]');
        this.totalEl = this.querySelector('[data-ct-bb-total]');
        this.compareEl = this.querySelector('[data-ct-bb-compare]');
        this.checkoutBtn = this.querySelector('[data-ct-bb-checkout]');
        this.errorEl = this.querySelector('[data-ct-bb-error]');

        this.lines = []; // [{ id, qty }]

        if (this.addLineBtn) this.addLineBtn.addEventListener('click', () => this.addLine());
        if (this.checkoutBtn) this.checkoutBtn.addEventListener('click', () => this.checkout());
        if (this.linesEl) this.linesEl.addEventListener('click', (e) => this.onLinesClick(e));

        this.render();
      }

      addLine() {
        if (!this.select) return;
        var id = Number(this.select.value);
        var v = this.variants[id];
        if (!v || !v.available) return;
        var existing = this.lines.filter((l) => l.id === id)[0];
        if (existing) existing.qty += 1;
        else this.lines.push({ id: id, qty: 1 });
        this.clearError();
        this.render();
      }

      onLinesClick(e) {
        var btn = e.target.closest('[data-ct-bb-action]');
        if (!btn) return;
        var row = btn.closest('[data-ct-bb-line]');
        if (!row) return;
        var id = Number(row.dataset.id);
        var line = this.lines.filter((l) => l.id === id)[0];
        if (!line) return;
        var action = btn.dataset.ctBbAction;
        if (action === 'inc') {
          line.qty += 1;
        } else if (action === 'dec') {
          line.qty -= 1;
          if (line.qty < 1) this.lines = this.lines.filter((l) => l.id !== id);
        } else if (action === 'remove') {
          this.lines = this.lines.filter((l) => l.id !== id);
        }
        this.render();
      }

      render() {
        var html = '';
        this.lines.forEach((line) => {
          var v = this.variants[line.id];
          if (!v) return;
          html +=
            '<li class="ct-bb__line" data-ct-bb-line data-id="' + v.id + '">' +
            (v.image ? '<img class="ct-bb__thumb" src="' + v.image + '" alt="" width="48" height="48" loading="lazy">' : '') +
            '<div class="ct-bb__line-info">' +
            '<span class="ct-bb__line-title">' + this.escape(this.productTitle) + '</span>' +
            '<span class="ct-bb__line-variant">' + this.escape(v.title) + '</span>' +
            '<span class="ct-bb__line-price">' + this.formatMoney(v.price * line.qty) + '</span>' +
            '</div>' +
            '<div class="ct-bb__qty" role="group" aria-label="Quantity">' +
            '<button type="button" class="ct-bb__qty-btn" data-ct-bb-action="dec" aria-label="Decrease quantity">&minus;</button>' +
            '<span class="ct-bb__qty-num" aria-live="polite">' + line.qty + '</span>' +
            '<button type="button" class="ct-bb__qty-btn" data-ct-bb-action="inc" aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="ct-bb__remove" data-ct-bb-action="remove" aria-label="Remove item">&times;</button>' +
            '</li>';
        });
        if (this.linesEl) this.linesEl.innerHTML = html;

        var hasLines = this.lines.length > 0;
        if (this.emptyEl) this.emptyEl.hidden = hasLines;

        var total = 0;
        var compareTotal = 0;
        this.lines.forEach((line) => {
          var v = this.variants[line.id];
          if (!v) return;
          total += v.price * line.qty;
          compareTotal += (v.compare > v.price ? v.compare : v.price) * line.qty;
        });

        if (this.totalEl) this.totalEl.textContent = this.formatMoney(total);
        var savings = compareTotal - total;
        if (this.compareEl) {
          this.compareEl.hidden = savings <= 0;
          this.compareEl.textContent = savings > 0 ? this.formatMoney(compareTotal) : '';
        }

        if (this.checkoutBtn && !this._busy) {
          this.checkoutBtn.disabled = !hasLines;
          this.checkoutBtn.setAttribute('aria-disabled', hasLines ? 'false' : 'true');
        }
      }

      checkout() {
        if (this._busy || !this.lines.length) return;
        this.clearError();

        var items = this.lines.map((l) => ({ id: l.id, quantity: l.qty }));
        var cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
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
          body: JSON.stringify({ items: items, sections: sections, sections_url: window.location.pathname }),
        })
          .then((res) => res.json().then((data) => ({ ok: res.ok, data: data })))
          .then((res) => {
            if (!res.ok || res.data.status) {
              throw new Error(res.data.description || res.data.message || 'Could not add the bundle to cart.');
            }
            if (cart && typeof cart.renderContents === 'function') {
              if (cart.setActiveElement) cart.setActiveElement(document.activeElement);
              cart.renderContents(res.data);
            } else if (window.publish && window.PUB_SUB_EVENTS) {
              window.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'ct-bundle-builder' });
            }
          })
          .catch((err) => this.showError(err && err.message))
          .finally(() => this.setBusy(false));
      }

      setBusy(on) {
        this._busy = on;
        if (!this.checkoutBtn) return;
        this.checkoutBtn.disabled = on;
        this.checkoutBtn.classList.toggle('loading', on);
        this.checkoutBtn.setAttribute('aria-busy', on ? 'true' : 'false');
        var spinner = this.checkoutBtn.querySelector('.loading__spinner, .loading-overlay__spinner');
        if (spinner) spinner.classList.toggle('hidden', !on);
        if (!on) this.render();
      }

      showError(message) {
        if (!this.errorEl) return;
        this.errorEl.textContent = message || 'Something went wrong.';
        this.errorEl.hidden = false;
      }

      clearError() {
        if (!this.errorEl) return;
        this.errorEl.textContent = '';
        this.errorEl.hidden = true;
      }

      escape(str) {
        var d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
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
