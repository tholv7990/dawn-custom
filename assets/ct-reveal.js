(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const els = document.querySelectorAll('[data-reveal]');
  if (reduced) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = +(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  els.forEach((el) => io.observe(el));
})();
