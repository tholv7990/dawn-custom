/* ct-copy-button.js (W2.T04) - <ct-copy-button> custom element.
   Copies data-ct-clipboard (or its text) to the clipboard, shows a "copied" state >=1.5s,
   announces via aria-live, and falls back to execCommand in insecure contexts.
   Keyboard: Enter / Space. Inert until a <ct-copy-button> appears in the DOM. */
(function () {
  if (customElements.get('ct-copy-button')) return;

  customElements.define(
    'ct-copy-button',
    class CtCopyButton extends HTMLElement {
      connectedCallback() {
        if (this._wired) return;
        this._wired = true;
        if (!this.hasAttribute('role')) this.setAttribute('role', 'button');
        if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
        this.addEventListener('click', () => this._copy());
        this.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
            event.preventDefault();
            this._copy();
          }
        });
      }

      _payload() {
        return this.getAttribute('data-ct-clipboard') || (this.textContent || '').trim();
      }

      _copy() {
        const text = this._payload();
        if (!text) return;
        const done = () => this._flash('copied', this.getAttribute('data-ct-copied') || 'Copied');

        if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done, () => this._fallback(text, done));
        } else {
          this._fallback(text, done);
        }
      }

      _fallback(text, done) {
        try {
          const area = document.createElement('textarea');
          area.value = text;
          area.setAttribute('readonly', '');
          area.style.position = 'absolute';
          area.style.left = '-9999px';
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
          done();
        } catch (error) {
          this._flash('error', this.getAttribute('data-ct-error') || 'Press Ctrl+C to copy');
        }
      }

      _flash(state, message) {
        this.setAttribute('data-ct-copy-state', state);
        this._announce(message);
        clearTimeout(this._timer);
        this._timer = setTimeout(() => this.removeAttribute('data-ct-copy-state'), 1600);
      }

      _announce(message) {
        if (!this._region) {
          this._region = document.createElement('span');
          this._region.setAttribute('aria-live', 'polite');
          this._region.className = 'visually-hidden';
          this.appendChild(this._region);
        }
        this._region.textContent = '';
        const region = this._region;
        setTimeout(() => {
          region.textContent = message;
        }, 30);
      }

      disconnectedCallback() {
        clearTimeout(this._timer);
      }
    }
  );
})();
