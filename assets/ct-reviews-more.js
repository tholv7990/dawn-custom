if (!customElements.get('ct-reviews-more')) {
  customElements.define(
    'ct-reviews-more',
    class CtReviewsMore extends HTMLElement {
      connectedCallback() {
        this.button = this.querySelector('[data-reviews-more-btn]');
        this.cards = Array.from(this.querySelectorAll('[data-review-card]'));
        this.step = parseInt(this.dataset.step || '6', 10) || 6;
        if (!this.button || !this.cards.length) return;
        this.button.addEventListener('click', () => this.showMore());
        this.sync();
      }

      showMore() {
        const hidden = this.cards.filter((card) => card.dataset.reviewHidden === 'true');
        hidden.slice(0, this.step).forEach((card) => {
          card.dataset.reviewHidden = 'false';
          card.classList.add('is-visible');
        });
        this.sync();
      }

      sync() {
        const remaining = this.cards.some((card) => card.dataset.reviewHidden === 'true');
        if (this.button) this.button.hidden = !remaining;
      }
    }
  );
}
