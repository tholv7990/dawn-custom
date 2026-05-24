(function () {
  'use strict';
  let modal = null;
  function close() { if (modal) modal.classList.remove('is-open'); }
  function getModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'ct-qv'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = '<div class="ct-qv__overlay"></div><div class="ct-qv__panel"><button class="ct-qv__close" aria-label="Close">&#x2715;</button><div class="ct-qv__body"></div></div>';
    modal.querySelector('.ct-qv__overlay').addEventListener('click', close);
    modal.querySelector('.ct-qv__close').addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.body.appendChild(modal);
    return modal;
  }
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-quickview]'); if (!btn) return;
    const url = btn.dataset.url; if (!url) return;
    const m = getModal();
    m.querySelector('.ct-qv__body').innerHTML = '<div class="ct-skeleton" style="height:360px"></div>';
    m.classList.add('is-open');
    try {
      const html = await (await fetch(url)).text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const content = doc.querySelector('.product');
      m.querySelector('.ct-qv__body').innerHTML = content ? content.outerHTML : 'Could not load product.';
    } catch (err) { m.querySelector('.ct-qv__body').innerHTML = 'Error loading product.'; }
  });
})();
