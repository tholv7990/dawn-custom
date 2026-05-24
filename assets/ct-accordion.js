(function () {
  'use strict';
  document.querySelectorAll('[data-accordion]').forEach((root) => {
    const btns = root.querySelectorAll('[data-accordion-btn]');
    btns.forEach((btn) => {
      const panel = btn.nextElementSibling;
      panel.style.overflow = 'hidden'; panel.style.maxHeight = '0';
      panel.style.transition = 'max-height 0.28s ease';
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btns.forEach((b) => { b.setAttribute('aria-expanded', 'false'); b.nextElementSibling.style.maxHeight = '0'; });
        if (!open) { btn.setAttribute('aria-expanded', 'true'); panel.style.maxHeight = panel.scrollHeight + 'px'; }
      });
    });
  });
})();
