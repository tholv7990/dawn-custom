(function () {
  'use strict';
  const navs = document.querySelectorAll('[data-scrollspy]'); if (!navs.length) return;
  const links = [...navs].flatMap((n) => [...n.querySelectorAll('a[href^="#"]')]);
  const targets = links.map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.removeAttribute('aria-current'));
      const a = links.find((l) => l.getAttribute('href') === '#' + entry.target.id);
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  targets.forEach((t) => io.observe(t));
})();
