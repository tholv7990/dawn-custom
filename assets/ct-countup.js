(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target, to = +el.dataset.to, suffix = el.dataset.suffix || '', dur = reduced ? 0 : 1600;
      if (!dur) { el.textContent = to + suffix; return; }
      const start = performance.now();
      requestAnimationFrame(function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.floor(p * to) + suffix;
        if (p < 1) requestAnimationFrame(step);
      });
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-countup]').forEach((el) => io.observe(el));
})();
