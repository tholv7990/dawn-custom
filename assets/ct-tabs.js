if (!customElements.get('ct-tabs')) {
  customElements.define(
    'ct-tabs',
    class CtTabs extends HTMLElement {
      connectedCallback() {
        this.tabs = Array.from(this.querySelectorAll('[role="tab"]'));
        this.panels = Array.from(this.querySelectorAll('[role="tabpanel"]'));
        this.tabs.forEach((tab, index) => {
          tab.addEventListener('click', () => this.select(index));
          tab.addEventListener('keydown', (event) => this.onKeydown(event, index));
        });
      }

      select(index) {
        this.tabs.forEach((tab, i) => {
          const active = i === index;
          tab.setAttribute('aria-selected', active ? 'true' : 'false');
          tab.classList.toggle('is-active', active);
          tab.tabIndex = active ? 0 : -1;
        });
        this.panels.forEach((panel, i) => {
          const active = i === index;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });
      }

      onKeydown(event, index) {
        const last = this.tabs.length - 1;
        let next = null;
        if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
        else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = last;
        if (next === null) return;
        event.preventDefault();
        this.select(next);
        this.tabs[next].focus();
      }
    }
  );
}
