(function () {
  'use strict';
  const buybox = document.getElementById('buybox'), bar = document.getElementById('ct-sticky-atc');
  if (!buybox || !bar) return;
  new IntersectionObserver((entries) => {
    entries.forEach((e) => bar.classList.toggle('is-visible', !e.isIntersecting));
  }, { threshold: 0 }).observe(buybox);
  const btn = bar.querySelector('[data-sticky-atc-btn]');
  const form = document.querySelector('product-form form');
  if (btn && form) btn.addEventListener('click', () => form.requestSubmit());
})();
