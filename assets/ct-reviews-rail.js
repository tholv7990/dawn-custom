/* ct-reviews-rail.js — mobile swipe dots indicator for ct-reviews grid layout.
   Listens to the scroll-snap track's scroll position; toggles .is-active on
   the dot matching the most-visible card. Click a dot to scroll to that
   card. No-op on desktop (CSS hides the dots ≥ 760px). */
(function () {
  if (customElements.get('ct-reviews-rail')) return;
  customElements.define('ct-reviews-rail', class extends HTMLElement {
    connectedCallback() {
      this.track = this.querySelector('[data-reviews-rail-track]');
      this.dots = Array.from(this.querySelectorAll('[data-reviews-rail-dot]'));
      if (!this.track || this.dots.length < 2) return;
      this.onScroll = this.update.bind(this);
      this.track.addEventListener('scroll', this.onScroll, { passive: true });
      this.dots.forEach((dot) => {
        dot.addEventListener('click', () => {
          const i = parseInt(dot.dataset.index, 10) || 0;
          const cards = this.track.children;
          if (cards[i]) cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        });
      });
      this.update();
    }
    disconnectedCallback() {
      if (this.track && this.onScroll) this.track.removeEventListener('scroll', this.onScroll);
    }
    update() {
      const cards = this.track.children;
      if (!cards.length) return;
      const center = this.track.scrollLeft + this.track.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i];
        const mid = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(mid - center);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === best));
    }
  });
})();
