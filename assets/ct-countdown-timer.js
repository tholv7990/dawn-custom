/* ct-countdown-timer.js (W2.T05) - <ct-countdown-timer> custom element.
   Modes:
     data-ct-mode="date"      + data-ct-deadline="2026-12-31T23:59:59" (ISO)
     data-ct-mode="daily"     + data-ct-daily="18:00" (next occurrence of HH:MM, local)
     data-ct-mode="evergreen" + data-ct-minutes="30" (per-visitor, persisted in sessionStorage)
   Expiry: data-ct-expire="hide" | "zero" | "restart" (default "zero").
   SSR-safe: keeps existing markup until the first computed tick (no CLS).
   Fills child [data-ct-part="days|hours|minutes|seconds"] nodes when present,
   otherwise sets its own textContent to HH:MM:SS. Inert until the tag appears. */
(function () {
  if (customElements.get('ct-countdown-timer')) return;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  customElements.define(
    'ct-countdown-timer',
    class CtCountdownTimer extends HTMLElement {
      connectedCallback() {
        if (this._wired) return;
        this._wired = true;
        this._mode = this.getAttribute('data-ct-mode') || 'date';
        this._expire = this.getAttribute('data-ct-expire') || 'zero';
        this._target = this._resolveTarget();
        if (!this._target) return;
        this._tick();
        this._interval = setInterval(() => this._tick(), 1000);
      }

      disconnectedCallback() {
        clearInterval(this._interval);
      }

      _resolveTarget() {
        const now = Date.now();
        if (this._mode === 'daily') {
          const time = (this.getAttribute('data-ct-daily') || '18:00').split(':');
          const target = new Date();
          target.setHours(parseInt(time[0], 10) || 0, parseInt(time[1], 10) || 0, 0, 0);
          if (target.getTime() <= now) target.setDate(target.getDate() + 1);
          return target.getTime();
        }
        if (this._mode === 'evergreen') {
          const minutes = parseFloat(this.getAttribute('data-ct-minutes')) || 30;
          const key = 'ct-countdown-' + (this.id || this.getAttribute('data-ct-key') || 'default');
          let end = parseInt(sessionStorage.getItem(key), 10);
          if (!end || isNaN(end) || end <= now) {
            end = now + minutes * 60000;
            try {
              sessionStorage.setItem(key, String(end));
            } catch (error) {
              /* storage blocked - run for this page view only */
            }
          }
          this._storageKey = key;
          this._minutes = minutes;
          return end;
        }
        const deadline = this.getAttribute('data-ct-deadline');
        const parsed = deadline ? Date.parse(deadline) : NaN;
        return isNaN(parsed) ? 0 : parsed;
      }

      _tick() {
        let remaining = this._target - Date.now();
        if (remaining <= 0) {
          remaining = 0;
          this._onExpire();
          if (this._expire === 'restart' && this._mode === 'evergreen') {
            this._target = Date.now() + this._minutes * 60000;
            try {
              sessionStorage.setItem(this._storageKey, String(this._target));
            } catch (error) {
              /* ignore */
            }
            remaining = this._target - Date.now();
          } else if (this._expire !== 'zero') {
            return;
          }
        }
        this._render(remaining);
      }

      _onExpire() {
        if (this._fired) return;
        if (this._expire === 'hide') {
          this.setAttribute('hidden', '');
          clearInterval(this._interval);
          this._fired = true;
        }
        this.dispatchEvent(new CustomEvent('ct:countdown:expired', { bubbles: true }));
      }

      _render(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const parts = this.querySelectorAll('[data-ct-part]');

        if (parts.length) {
          parts.forEach((node) => {
            const unit = node.getAttribute('data-ct-part');
            const value =
              unit === 'days' ? days : unit === 'hours' ? hours : unit === 'minutes' ? minutes : seconds;
            const valueNode = node.querySelector('[data-ct-value]') || node;
            valueNode.textContent = unit === 'days' ? String(value) : pad(value);
          });
        } else {
          const prefix = days > 0 ? days + 'd ' : '';
          this.textContent = prefix + pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
        }
      }
    }
  );
})();
