if (!customElements.get('ct-carousel')) {
  customElements.define(
    'ct-carousel',
    class CtCarousel extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('[data-carousel-track]');
        if (!this.track) return;
        this.prevBtn = this.querySelector('[data-carousel-prev]');
        this.nextBtn = this.querySelector('[data-carousel-next]');
        this.dots = Array.from(this.querySelectorAll('[data-carousel-dot]'));
        this.autoplayMs = parseInt(this.dataset.autoplay || '0', 10) || 0;
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (this.prevBtn) this.prevBtn.addEventListener('click', () => { this.stopAuto(); this.step(-1); });
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.stopAuto(); this.step(1); });
        this.dots.forEach((dot, i) => dot.addEventListener('click', () => { this.stopAuto(); this.goTo(i); }));
        this.track.addEventListener('scroll', () => this.sync(), { passive: true });

        this.sync();
        if (this.autoplayMs > 0 && !this.reduced) {
          this.startAuto();
          this.addEventListener('mouseenter', () => this.stopAuto());
          this.addEventListener('mouseleave', () => this.startAuto());
          this.addEventListener('focusin', () => this.stopAuto());
        }
      }

      disconnectedCallback() {
        this.stopAuto();
      }

      cardWidth() {
        const card = this.track.children[0];
        if (!card) return this.track.clientWidth;
        const gap = parseFloat(getComputedStyle(this.track).columnGap || '0') || 0;
        return card.getBoundingClientRect().width + gap;
      }

      behavior() {
        return this.reduced ? 'auto' : 'smooth';
      }

      step(dir) {
        this.track.scrollBy({ left: dir * this.cardWidth(), behavior: this.behavior() });
      }

      goTo(i) {
        this.track.scrollTo({ left: i * this.cardWidth(), behavior: this.behavior() });
      }

      sync() {
        const i = Math.round(this.track.scrollLeft / this.cardWidth());
        this.dots.forEach((d, di) => d.setAttribute('aria-current', di === i ? 'true' : 'false'));
        const max = this.track.scrollWidth - this.track.clientWidth - 2;
        if (this.prevBtn) this.prevBtn.disabled = this.track.scrollLeft <= 2;
        if (this.nextBtn) this.nextBtn.disabled = this.track.scrollLeft >= max;
      }

      startAuto() {
        this.stopAuto();
        this.timer = setInterval(() => {
          const max = this.track.scrollWidth - this.track.clientWidth - 2;
          if (this.track.scrollLeft >= max) this.track.scrollTo({ left: 0, behavior: 'smooth' });
          else this.step(1);
        }, this.autoplayMs);
      }

      stopAuto() {
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      }
    }
  );
}
