/* ct-signup-popup.js — 15%-off email capture + thank-you popup.
   Opens after the configured delay, or any time the visitor clicks an
   `<a href="#signup-popup">` link (announcement bar, footer, etc.). Submits
   via fetch to Shopify's customer form endpoint so the email lands in admin
   → Customers (tagged via the hidden 'contact[tags]' input). On success the
   backdrop swaps to the thank-you card and the fireworks canvas runs until
   the visitor closes the popup. SessionStorage prevents the auto-open from
   firing twice in one tab session; explicit clicks always re-open. */
(function () {
  if (!('customElements' in window)) return;
  if (customElements.get('ct-signup-popup')) return;

  const FX_COLORS = ['#5A3E2B', '#D9C7B4', '#E0A53B', '#ffffff', '#F1E8DE', '#7A573D', '#43301F'];
  const OPEN_EVENT = 'ct:signup-popup:open';
  let pendingOpen = false;

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest && e.target.closest('a[href="#signup-popup"], [data-ct-signup-popup-trigger], .ct-announce a[href="#signup"]');
    if (!trigger) return;
    e.preventDefault();
    pendingOpen = true;
    window.dispatchEvent(new CustomEvent(OPEN_EVENT));
  }, true);

  customElements.define('ct-signup-popup', class CtSignupPopup extends HTMLElement {
    connectedCallback() {
      this.backdrop = this.querySelector('[data-popup-backdrop]');
      this.signupModal = this.querySelector('[data-popup-signup-modal]');
      this.thankyouModal = this.querySelector('[data-popup-thankyou]');
      this.form = this.querySelector('[data-popup-form]');
      this.emailInput = this.querySelector('[data-popup-email]');
      this.errMsg = this.querySelector('[data-popup-err]');
      this.externalForms = Array.from(document.querySelectorAll('[data-ct-newsletter-form]'));
      this.successMarker = document.querySelector('[data-ct-newsletter-success]');
      this.fxCanvas = this.querySelector('[data-popup-fx]');
      this.sessionKey = this.dataset.sessionKey || 'ct-signup-popup';
      this.storageKeyDismissedUntil = `${this.sessionKey}:dismissed-until`;
      this.storageKeySubscribed = `${this.sessionKey}:subscribed`;
      this.delay = Math.max(0, parseInt(this.dataset.delay, 10) || 0);
      this.frequencyDays = Math.max(1, parseInt(this.dataset.frequencyDays, 10) || 1);
      this.reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this.querySelectorAll('[data-popup-close]').forEach((el) => {
        el.addEventListener('click', (e) => { e.preventDefault(); this.close(); });
      });
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) this.close();
      });
      document.addEventListener('keydown', this.onKey.bind(this));
      this.onOpenRequest = () => this.open(true);
      window.addEventListener(OPEN_EVENT, this.onOpenRequest);
      if (this.form) this.form.addEventListener('submit', (e) => this.onSubmit(e, this.form));
      if (this.form) this.bindEmailValidation(this.form);
      this.externalForms.forEach((form) => {
        form.addEventListener('submit', (e) => this.onSubmit(e, form));
        this.bindEmailValidation(form);
      });

      if (this.successMarker) {
        setTimeout(() => this.showThankYou(), 80);
        return;
      }

      if (!this.wasDismissed()) {
        this.openTimer = setTimeout(() => this.open(), this.delay);
      }

      if (pendingOpen) {
        pendingOpen = false;
        setTimeout(() => this.open(true), 0);
      }
    }

    disconnectedCallback() {
      if (this.onOpenRequest) window.removeEventListener(OPEN_EVENT, this.onOpenRequest);
      if (this.openTimer) clearTimeout(this.openTimer);
    }

    wasDismissed() {
      try {
        if (localStorage.getItem(this.storageKeySubscribed) === '1') return true;
        const dismissedUntil = parseInt(localStorage.getItem(this.storageKeyDismissedUntil), 10) || 0;
        if (dismissedUntil > Date.now()) return true;
        if (dismissedUntil) localStorage.removeItem(this.storageKeyDismissedUntil);
        return false;
      } catch (e) {
        try { return sessionStorage.getItem(this.sessionKey) === '1'; }
        catch (err) { return false; }
      }
    }
    markDismissed() {
      try {
        const ttl = this.frequencyDays * 24 * 60 * 60 * 1000;
        localStorage.setItem(this.storageKeyDismissedUntil, String(Date.now() + ttl));
      } catch (e) {
        try { sessionStorage.setItem(this.sessionKey, '1'); } catch (err) { /* private mode */ }
      }
    }
    markSubscribed() {
      try {
        localStorage.setItem(this.storageKeySubscribed, '1');
        localStorage.removeItem(this.storageKeyDismissedUntil);
      } catch (e) {
        try { sessionStorage.setItem(this.sessionKey, '1'); } catch (err) { /* private mode */ }
      }
    }

    open(forceReset) {
      if (forceReset) this.backdrop.classList.remove('is-thankyou');
      this.backdrop.classList.add('is-open');
      this.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (this.openTimer) { clearTimeout(this.openTimer); this.openTimer = null; }
      if (!this.backdrop.classList.contains('is-thankyou') && this.emailInput) {
        setTimeout(() => this.emailInput.focus(), 320);
      }
    }

    close() {
      this.backdrop.classList.remove('is-open');
      this.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      this.markDismissed();
      this.stopFx();
      if (this.openTimer) { clearTimeout(this.openTimer); this.openTimer = null; }
    }

    onKey(e) {
      if (e.key === 'Escape' && this.backdrop.classList.contains('is-open')) this.close();
    }

    isValidEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
    }

    bindEmailValidation(form) {
      const emailInput = form && form.querySelector('input[type="email"]');
      const submitBtn = form && form.querySelector('button[type="submit"]');
      if (!emailInput || !submitBtn) return;

      const sync = () => {
        const valid = this.isValidEmail(emailInput.value);
        submitBtn.disabled = !valid;
        submitBtn.setAttribute('aria-disabled', String(!valid));
        if (valid) {
          emailInput.classList.remove('is-err');
          const errMsg = form.querySelector('[data-newsletter-err]') || this.errMsg;
          if (errMsg) errMsg.classList.remove('is-shown');
        }
      };

      sync();
      emailInput.addEventListener('input', sync);
      emailInput.addEventListener('change', sync);
    }

    onSubmit(e, form) {
      const activeForm = form || this.form;
      const emailInput = activeForm && activeForm.querySelector('input[type="email"]');
      const errMsg = activeForm && activeForm.querySelector('[data-newsletter-err]') || this.errMsg;
      const value = emailInput && emailInput.value;
      if (!this.isValidEmail(value)) {
        e.preventDefault();
        if (emailInput) emailInput.classList.add('is-err');
        if (errMsg) errMsg.classList.add('is-shown');
        if (emailInput) emailInput.focus();
        return;
      }
      if (emailInput) emailInput.classList.remove('is-err');
      if (errMsg) errMsg.classList.remove('is-shown');
      const submitBtn = activeForm && activeForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
        submitBtn.dataset.submitting = 'true';
      }
    }

    showThankYou() {
      this.markSubscribed();
      this.open();
      this.backdrop.classList.add('is-thankyou');
      this.startFx();
    }

    // ---- Background fireworks ----
    startFx() {
      if (this.reduced || !this.fxCanvas) return;
      const cv = this.fxCanvas;
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      this.fxCtx = ctx;
      this.fxParts = [];
      this.fxRockets = [];
      this.fxRunning = true;
      this.fxLastLaunch = 0;
      this.fxResize = () => { cv.width = cv.clientWidth || window.innerWidth; cv.height = cv.clientHeight || window.innerHeight; };
      this.fxResize();
      window.addEventListener('resize', this.fxResize);
      // Seed a few initial bursts so the moment of celebration is immediate.
      const W = cv.width, H = cv.height;
      this.fxBoom(W * 0.5, H * 0.26, '#E0A53B');
      this.fxBoom(W * 0.22, H * 0.4, '#5A3E2B');
      this.fxBoom(W * 0.8, H * 0.36, '#D9C7B4');
      this.fxBoom(W * 0.62, H * 0.6, '#7A573D');
      this.fxRaf = requestAnimationFrame(this.fxFrame.bind(this));
    }

    stopFx() {
      if (!this.fxCtx) return;
      this.fxRunning = false;
      // Let existing particles finish their decay, then clean up.
      setTimeout(() => {
        if (this.fxRunning) return;
        this.fxParts = []; this.fxRockets = [];
        if (this.fxCtx && this.fxCanvas.width) this.fxCtx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
        if (this.fxRaf) { cancelAnimationFrame(this.fxRaf); this.fxRaf = null; }
        if (this.fxResize) window.removeEventListener('resize', this.fxResize);
      }, 1300);
    }

    fxRnd(a, b) { return a + Math.random() * (b - a); }
    fxPick() { return FX_COLORS[Math.floor(Math.random() * FX_COLORS.length)]; }

    fxBoom(x, y, c) {
      const n = Math.floor(this.fxRnd(38, 58));
      for (let i = 0; i < n; i++) {
        const a = Math.PI * 2 * i / n + this.fxRnd(-0.1, 0.1);
        const sp = this.fxRnd(2.4, 7.6);
        this.fxParts.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          dec: this.fxRnd(0.006, 0.013),
          col: Math.random() < 0.7 ? c : this.fxPick(),
          r: this.fxRnd(2.4, 3.6)
        });
      }
    }

    fxLaunch() {
      const cv = this.fxCanvas;
      this.fxRockets.push({
        x: this.fxRnd(cv.width * 0.08, cv.width * 0.92),
        y: cv.height + 8,
        vy: -this.fxRnd(9, 13),
        ty: this.fxRnd(cv.height * 0.08, cv.height * 0.55),
        col: this.fxPick()
      });
    }

    fxFrame(ts) {
      const ctx = this.fxCtx, cv = this.fxCanvas;
      if (!ctx || !cv) return;
      const W = cv.width, H = cv.height;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      if (this.fxRunning && ts - this.fxLastLaunch > this.fxRnd(200, 400)) {
        this.fxLastLaunch = ts;
        this.fxLaunch();
        if (Math.random() < 0.5) this.fxLaunch();
      }

      for (let r = this.fxRockets.length - 1; r >= 0; r--) {
        const k = this.fxRockets[r];
        k.y += k.vy;
        k.vy += 0.14;
        ctx.globalAlpha = 1;
        ctx.fillStyle = k.col;
        ctx.shadowBlur = 10;
        ctx.shadowColor = k.col;
        ctx.beginPath();
        ctx.arc(k.x, k.y, 2.6, 0, 7);
        ctx.fill();
        if (k.vy >= -1.4 || k.y <= k.ty) {
          this.fxBoom(k.x, k.y, k.col);
          this.fxRockets.splice(r, 1);
        }
      }

      for (let p = this.fxParts.length - 1; p >= 0; p--) {
        const q = this.fxParts[p];
        q.x += q.vx;
        q.y += q.vy;
        q.vy += 0.045;
        q.vx *= 0.99;
        q.life -= q.dec;
        if (q.life <= 0) { this.fxParts.splice(p, 1); continue; }
        ctx.globalAlpha = Math.max(q.life, 0);
        ctx.fillStyle = q.col;
        ctx.shadowBlur = 12;
        ctx.shadowColor = q.col;
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r, 0, 7);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (this.fxRunning || this.fxParts.length || this.fxRockets.length) {
        this.fxRaf = requestAnimationFrame(this.fxFrame.bind(this));
      } else {
        this.fxRaf = null;
      }
    }
  });
})();
