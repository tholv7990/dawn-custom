if (!customElements.get('ct-scarcity')) {
  customElements.define(
    'ct-scarcity',
    class CtScarcity extends HTMLElement {
      connectedCallback() {
        this.sectionId = this.dataset.section;
        this.unsubscribe = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
          if (!event || !event.data || event.data.sectionId != this.sectionId) return;
          const source = event.data.html.getElementById(`Scarcity-${this.sectionId}`);
          if (source) this.innerHTML = source.innerHTML;
        });
      }

      disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
      }
    }
  );
}
