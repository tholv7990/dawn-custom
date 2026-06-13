/*
 * <ct-tnc-gate> — W4.T05 Terms & Conditions checkout gate.
 *
 * Blocks checkout until the shopper checks the agreement box:
 *   - regular checkout button: aria-disabled + a capture-phase click/submit
 *     guard (NEVER the native `disabled` attribute, so it can't fight Dawn's
 *     empty-cart state or wrongly enable an empty-cart checkout). The submit
 *     guard keys off the submitting FORM (not event.submitter, which is null on
 *     older Safari / programmatic submit) so a keyboard Enter can't leak through.
 *   - dynamic checkout buttons (Shop Pay etc.): the container is made inert +
 *     visibility:hidden while unconsented, which removes the cross-origin iframe
 *     from the tab order (pointer-events alone doesn't block keyboard).
 *
 * Consent is shared across both gate instances (drawer + page) and across
 * re-renders via window.__ctTncConsent, broadcast with a 'ct:tnc-consent' event
 * so every surface re-syncs. A full cart clear (item_count 0) drops consent so a
 * fresh cart must re-consent. FAIL-OPEN: if this never runs, nothing is blocked.
 * The host only renders the gate when settings.ct_require_tnc is ON.
 */
(function () {
  if (typeof window.__ctTncConsent === 'undefined') window.__ctTncConsent = false;

  function targetsFor(context) {
    var list = [];
    if (context === 'drawer') {
      var d = document.getElementById('CartDrawer-Checkout');
      if (d) list.push({ el: d, kind: 'button' });
    } else {
      var c = document.getElementById('checkout');
      if (c) list.push({ el: c, kind: 'button' });
      var dyn = document.querySelector('.cart__dynamic-checkout-buttons, .additional-checkout-buttons');
      if (dyn) list.push({ el: dyn, kind: 'dynamic' });
    }
    return list;
  }

  function apply(context) {
    var consented = window.__ctTncConsent === true;
    targetsFor(context).forEach(function (t) {
      if (t.kind === 'dynamic') {
        var blocked = !consented;
        t.el.classList.toggle('ct-tnc-blocked', blocked);
        t.el.setAttribute('aria-disabled', blocked ? 'true' : 'false');
        // `inert` + the CSS visibility:hidden remove the cross-origin Shop Pay
        // iframe from the tab order — pointer-events alone leaves a keyboard leak.
        if (blocked) t.el.setAttribute('inert', '');
        else t.el.removeAttribute('inert');
      } else if (consented) {
        t.el.removeAttribute('aria-disabled');
        t.el.classList.remove('ct-tnc-blocked');
      } else {
        t.el.setAttribute('aria-disabled', 'true');
        t.el.classList.add('ct-tnc-blocked');
      }
    });
  }

  function broadcast() {
    try {
      document.dispatchEvent(new CustomEvent('ct:tnc-consent'));
    } catch (e) {
      // CustomEvent unavailable: re-apply both surfaces directly.
      apply('drawer');
      apply('page');
    }
  }

  // FALSE-OPEN guard: a full cart clear must drop consent so a brand-new cart
  // re-consents (otherwise the box stays silently pre-ticked after empty+re-add).
  if (
    !window.__ctTncConsentReset &&
    window.subscribe &&
    window.PUB_SUB_EVENTS &&
    window.PUB_SUB_EVENTS.cartUpdate
  ) {
    window.__ctTncConsentReset = true;
    window.subscribe(window.PUB_SUB_EVENTS.cartUpdate, function (event) {
      var data = event && event.cartData;
      if (data && data.item_count === 0 && window.__ctTncConsent === true) {
        window.__ctTncConsent = false;
        broadcast();
      }
    });
  }

  if (!customElements.get('ct-tnc-gate')) {
    customElements.define(
      'ct-tnc-gate',
      class CtTncGate extends HTMLElement {
        connectedCallback() {
          if (this._ready) return;
          this._ready = true;

          this.context = this.dataset.context === 'drawer' ? 'drawer' : 'page';
          this.checkbox = this.querySelector('[data-ct-tnc-checkbox]');
          this.errorEl = this.dataset.errorId
            ? document.getElementById(this.dataset.errorId)
            : this.querySelector('.ct-tnc-gate__error');
          if (!this.checkbox) return;

          // Restore prior consent so a drawer/section re-render doesn't reset it.
          this.checkbox.checked = window.__ctTncConsent === true;

          this._onChange = this.onChange.bind(this);
          this._onClick = this.onGuardClick.bind(this);
          this._onSubmit = this.onGuardSubmit.bind(this);
          this._onConsent = this.onConsentSync.bind(this);
          this.checkbox.addEventListener('change', this._onChange);
          document.addEventListener('click', this._onClick, true);
          document.addEventListener('submit', this._onSubmit, true);
          document.addEventListener('ct:tnc-consent', this._onConsent);

          apply(this.context);
        }

        disconnectedCallback() {
          if (this.checkbox && this._onChange) this.checkbox.removeEventListener('change', this._onChange);
          if (this._onClick) document.removeEventListener('click', this._onClick, true);
          if (this._onSubmit) document.removeEventListener('submit', this._onSubmit, true);
          if (this._onConsent) document.removeEventListener('ct:tnc-consent', this._onConsent);
        }

        onChange() {
          window.__ctTncConsent = !!this.checkbox.checked;
          broadcast();
        }

        // Re-sync this instance's checkbox + its surface when consent changes anywhere.
        onConsentSync() {
          if (this.checkbox) this.checkbox.checked = window.__ctTncConsent === true;
          if (window.__ctTncConsent === true) this.hideError();
          apply(this.context);
        }

        // Only this surface's blocked checkout target(s).
        blockedTarget(node) {
          if (!node || !node.closest) return null;
          if (this.context === 'drawer') {
            return node.closest('#CartDrawer-Checkout.ct-tnc-blocked');
          }
          return node.closest(
            '#checkout.ct-tnc-blocked, .cart__dynamic-checkout-buttons.ct-tnc-blocked, .additional-checkout-buttons.ct-tnc-blocked'
          );
        }

        onGuardClick(event) {
          if (window.__ctTncConsent === true) return;
          if (this.blockedTarget(event.target)) {
            event.preventDefault();
            event.stopPropagation();
            this.showError();
            this.focusCheckbox();
          }
        }

        onGuardSubmit(event) {
          if (window.__ctTncConsent === true) return;
          // Key off the submitting FORM, not event.submitter (null on Safari <15.4
          // and on programmatic submit), so a keyboard Enter cannot leak through.
          var form = event.target;
          if (!form || !form.id) return;
          var formId = this.context === 'drawer' ? 'CartDrawer-Form' : 'cart';
          if (form.id !== formId) return;
          // If a submitter IS present and is clearly not the checkout button, allow it.
          var s = event.submitter;
          if (s && s.name !== 'checkout' && s.id !== 'checkout' && s.id !== 'CartDrawer-Checkout') return;
          event.preventDefault();
          event.stopPropagation();
          this.showError();
          this.focusCheckbox();
        }

        focusCheckbox() {
          if (this.checkbox && this.checkbox.focus) this.checkbox.focus();
        }
        // Live-region: mutate TEXT inside an always-present role=alert region so
        // screen readers announce it (toggling [hidden] would not announce).
        showError() {
          if (this.errorEl) this.errorEl.textContent = this.errorEl.getAttribute('data-ct-tnc-message') || '';
        }
        hideError() {
          if (this.errorEl) this.errorEl.textContent = '';
        }
      }
    );
  }
})();
