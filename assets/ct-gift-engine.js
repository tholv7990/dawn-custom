/*
 * <ct-gift-engine> — W3.T04 automatic free gift (PDP block host).
 * Same oscillation-safe engine as sections/ct-gift-auto.liquid: a MODULE-scoped
 * `ctGiftBusy` re-entrancy flag (shared across instances so two engines on one
 * page can't double-add), a 350ms debounce, the qualifying total EXCLUDES the
 * gift's own line (so a gift-only cart can't self-qualify), the gift line is
 * found by its `_ct_gift` property (not variant id), one-per-cart add, remove
 * via cart/change.js by line key. No polling.
 */
var ctGiftBusy = false;
// Singleton actor: when more than one engine is on a page (e.g. a global cart
// gift + a PDP gift_offer block), only ONE performs cart add/remove so they
// can't oscillate against each other's config. All engines still update their
// own display. First valid engine to connect wins; releases on disconnect.
var ctGiftActor = null;
if (!customElements.get('ct-gift-engine')) {
  customElements.define(
    'ct-gift-engine',
    class CtGiftEngine extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready === 'true') return;

        this.giftVariantId = parseInt(this.getAttribute('data-gift-variant'), 10);
        this.threshold = parseInt(this.getAttribute('data-threshold'), 10) || 0;
        this.lockedTemplate = this.getAttribute('data-locked-template') || '';
        this.unlockedText = this.getAttribute('data-unlocked-text') || '';
        this.moneyFormat = this.getAttribute('data-money-format') || '${{amount}}';
        this.statusText = this.querySelector('[data-gift-status-text]');
        this.bar = this.querySelector('[data-gift-bar]');

        // Only mark ready (and wire up) once we have a usable gift variant, so a
        // re-connected element that bailed can still init later.
        if (!this.giftVariantId || isNaN(this.giftVariantId)) return;
        this.dataset.ready = 'true';

        // Claim cart-mutation actorship if free OR currently held by a DETACHED
        // engine. The drawer engine re-mounts on every cart refresh, and
        // replaceWith() connects the new node before disconnecting the old — so
        // without the isConnected check the actor slot would be left null and
        // never reclaimed, silently killing auto add/remove after the first
        // external add-to-cart.
        if (ctGiftActor === null || ctGiftActor.isConnected === false) {
          ctGiftActor = this;
          this.isActor = true;
        } else {
          this.isActor = false;
        }

        this.debounced = this.debounce(() => this.evaluate(), 350);
        if (window.subscribe && window.PUB_SUB_EVENTS && window.PUB_SUB_EVENTS.cartUpdate) {
          this.unsubscribe = window.subscribe(window.PUB_SUB_EVENTS.cartUpdate, this.debounced);
        }
        this.evaluate();
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
        this.isActor = false;
        // Release actorship so a re-rendered/sibling engine can take over.
        if (ctGiftActor === this) ctGiftActor = null;
      }

      debounce(fn, wait) {
        var self = this;
        return function () {
          clearTimeout(self._debounceTimer);
          self._debounceTimer = setTimeout(fn, wait);
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
          .then((res) => res.json().then((data) => ({ ok: res.ok, data: data })))
          .then((res) => {
            // 422 etc (e.g. sold-out gift): leave the cart UI untouched, don't render an error object as a cart.
            if (!res.ok || (res.data && res.data.status)) return false;
            this.renderCart(res.data);
            return true;
          });
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
          .then((res) => res.json().then((data) => ({ ok: res.ok, data: data })))
          .then((res) => {
            if (!res.ok || (res.data && res.data.status)) return false;
            this.renderCart(res.data);
            return true;
          });
      }

      setUnlockedUI(unlocked, remaining, qualifying) {
        this.classList.toggle('ct-gift-offer--unlocked', unlocked);
        if (this.statusText) {
          this.statusText.textContent = unlocked
            ? this.unlockedText
            : this.lockedTemplate.replace('[amount]', this.formatMoney(remaining));
        }
        if (this.bar && this.threshold > 0) {
          // Floor to match the Liquid divided_by server render (no hydration snap).
          var pct = Math.max(0, Math.min(100, Math.floor((qualifying * 100) / this.threshold)));
          this.bar.style.width = pct + '%';
        }
      }

      evaluate() {
        if (ctGiftBusy) return;
        if (!this.isConnected) return;
        fetch(this.routeRoot() + 'cart.js', { headers: { Accept: 'application/json' } })
          .then((res) => res.json())
          .then((cart) => {
            if (ctGiftBusy) return;
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

            // Display updates for every engine; only the actor mutates the cart.
            if (!this.isActor) return;

            if (eligible && !giftPresent) {
              ctGiftBusy = true;
              this.addGift()
                .catch(() => false)
                .then((ok) => {
                  ctGiftBusy = false;
                  // Reconcile cart changes that landed during the round-trip — but
                  // ONLY after a successful add. Re-arming on a failed (sold-out
                  // 422) add would loop ~3 req/s while the cart stays eligible.
                  if (ok) this.debounced();
                });
            } else if (!eligible && giftPresent) {
              ctGiftBusy = true;
              this.removeGift(giftLine.key)
                .catch(() => false)
                .then((ok) => {
                  ctGiftBusy = false;
                  if (ok) this.debounced();
                });
            }
          })
          .catch(() => {});
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
