/*
 * <ct-gift-engine> — W3.T04 automatic free gift (PDP block host).
 * Same oscillation-safe engine as sections/ct-gift-auto.liquid, as a reusable
 * element: a module/instance `busy` re-entrancy flag, a 350ms debounce, the
 * qualifying total EXCLUDES the gift's own line (so a gift-only cart can't
 * self-qualify), the gift line is found by its `_ct_gift` property (not variant
 * id), one-per-cart add, remove via cart/change.js by line key. No polling.
 */
if (!customElements.get('ct-gift-engine')) {
  customElements.define(
    'ct-gift-engine',
    class CtGiftEngine extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;
        this.dataset.ready = 'true';

        this.giftVariantId = parseInt(this.getAttribute('data-gift-variant'), 10);
        this.threshold = parseInt(this.getAttribute('data-threshold'), 10) || 0;
        this.lockedTemplate = this.getAttribute('data-locked-template') || '';
        this.unlockedText = this.getAttribute('data-unlocked-text') || '';
        this.moneyFormat = this.getAttribute('data-money-format') || '${{amount}}';
        this.statusText = this.querySelector('[data-gift-status-text]');
        this.bar = this.querySelector('[data-gift-bar]');
        this.busy = false;

        if (!this.giftVariantId || isNaN(this.giftVariantId)) return;

        this.debounced = this.debounce(() => this.evaluate(), 350);
        if (window.subscribe && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.cartUpdate) {
          this.unsubscribe = window.subscribe(window.PUB_SUB_EVENTS.cartUpdate, this.debounced);
        }
        this.evaluate();
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }

      debounce(fn, wait) {
        var t;
        return function () {
          clearTimeout(t);
          t = setTimeout(fn, wait);
        };
      }

      routeRoot() {
        var routes = window.Shopify && window.Shopify.routes;
        return (routes && routes.root) || '/';
      }

      cartElement() {
        return document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      }

      renderCart(data) {
        try {
          var cart = this.cartElement();
          if (cart && typeof cart.renderContents === 'function') cart.renderContents(data);
        } catch (e) {
          /* fail silent */
        }
      }

      findGiftLine(cart) {
        if (!cart || !cart.items) return null;
        for (var i = 0; i < cart.items.length; i++) {
          var line = cart.items[i];
          if (line && line.properties && line.properties._ct_gift === 'true') return line;
        }
        return null;
      }

      addGift() {
        return fetch(this.routeRoot() + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            id: this.giftVariantId,
            quantity: 1,
            properties: { _ct_gift: 'true' },
            sections: ['cart-drawer', 'cart-icon-bubble', 'cart-notification'],
            sections_url: window.location.pathname,
          }),
        })
          .then((res) => res.json())
          .then((data) => this.renderCart(data));
      }

      removeGift(lineKey) {
        return fetch(this.routeRoot() + 'cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            id: lineKey,
            quantity: 0,
            sections: ['cart-drawer', 'cart-icon-bubble', 'cart-notification'],
            sections_url: window.location.pathname,
          }),
        })
          .then((res) => res.json())
          .then((data) => this.renderCart(data));
      }

      setUnlockedUI(unlocked, remaining, qualifying) {
        this.classList.toggle('ct-gift-offer--unlocked', unlocked);
        if (this.statusText) {
          this.statusText.textContent = unlocked
            ? this.unlockedText
            : this.lockedTemplate.replace('[amount]', this.formatMoney(remaining));
        }
        if (this.bar && this.threshold > 0) {
          var pct = Math.max(0, Math.min(100, Math.round((qualifying * 100) / this.threshold)));
          this.bar.style.width = pct + '%';
        }
      }

      evaluate() {
        if (this.busy) return;
        fetch(this.routeRoot() + 'cart.js', { headers: { Accept: 'application/json' } })
          .then((res) => res.json())
          .then((cart) => {
            if (this.busy) return;
            if (!cart || typeof cart.total_price !== 'number') return;

            var giftLine = this.findGiftLine(cart);
            var giftPresent = giftLine !== null;
            var qualifying = cart.total_price;
            if (giftPresent && typeof giftLine.final_line_price === 'number') {
              qualifying -= giftLine.final_line_price;
            }
            if (qualifying < 0) qualifying = 0;

            var eligible = this.threshold === 0 || qualifying >= this.threshold;
            var remaining = this.threshold - qualifying;
            if (remaining < 0) remaining = 0;
            this.setUnlockedUI(eligible, remaining, qualifying);

            if (eligible && !giftPresent) {
              this.busy = true;
              this.addGift()
                .catch(() => {})
                .then(() => {
                  this.busy = false;
                });
            } else if (!eligible && giftPresent) {
              this.busy = true;
              this.removeGift(giftLine.key)
                .catch(() => {})
                .then(() => {
                  this.busy = false;
                });
            }
          })
          .catch(() => {});
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
          default:
            value = group(cents, 2, ',', '.');
        }
        return format.replace(/\{\{\s*\w+\s*\}\}/, value);
      }
    }
  );
}
