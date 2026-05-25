if (!customElements.get('ct-back-to-top')) {
  customElements.define(
    'ct-back-to-top',
    class CtBackToTop extends HTMLElement {
      connectedCallback() {
        this.btn = this.querySelector('button');
        this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.onScroll = () => this.classList.toggle('is-visible', window.scrollY > 600);
        window.addEventListener('scroll', this.onScroll, { passive: true });
        this.onScroll();
        if (this.btn) {
          this.btn.addEventListener('click', () =>
            window.scrollTo({ top: 0, behavior: this.reduced ? 'auto' : 'smooth' })
          );
        }
      }

      disconnectedCallback() {
        window.removeEventListener('scroll', this.onScroll);
      }
    }
  );
}
