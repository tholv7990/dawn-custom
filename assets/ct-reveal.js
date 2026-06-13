/* ct-reveal.js (W2.T06) - scroll reveal engine consuming the --ct-reveal-* tokens.
   Opt-in via data-ct-reveal on any element. Honors prefers-reduced-motion (shows
   immediately, no transform). Stagger via --ct-reveal-order (set from data-ct-reveal-order
   or DOM index). Repeat via data-ct-reveal-repeat. Idempotent + theme-editor safe
   (re-inits on shopify:section:load). Self-injects its stylesheet; inert until used. */
(function () {
  var STYLE_ID = 'ct-reveal-style';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '[data-ct-reveal]{opacity:var(--ct-reveal-opacity,0);' +
      'transform:translate(var(--ct-reveal-x,0),var(--ct-reveal-y,16px)) scale(var(--ct-reveal-zoom,1));' +
      'transition:opacity var(--ct-reveal-duration,480ms) var(--ct-reveal-ease,ease) var(--ct-reveal-delay,0ms),' +
      'transform var(--ct-reveal-duration,480ms) var(--ct-reveal-ease,ease) var(--ct-reveal-delay,0ms);' +
      'transition-delay:calc(var(--ct-reveal-delay,0ms) + (var(--ct-reveal-order,0) * var(--ct-reveal-stagger,80ms)));' +
      'will-change:opacity,transform;}' +
      '[data-ct-reveal].ct-reveal-in{opacity:1;transform:none;}' +
      '@media (prefers-reduced-motion: reduce){[data-ct-reveal]{opacity:1;transform:none;transition:none;}}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function reveal(el) {
    el.classList.add('ct-reveal-in');
  }

  function init(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var nodes = Array.prototype.slice.call(scope.querySelectorAll('[data-ct-reveal]'));
    if (!nodes.length) return;
    injectStyle();

    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(reveal);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            if (entry.target.getAttribute('data-ct-reveal-repeat') != null) {
              entry.target.classList.remove('ct-reveal-in');
            }
            return;
          }
          reveal(entry.target);
          if (entry.target.getAttribute('data-ct-reveal-repeat') == null) {
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach(function (node, index) {
      if (node.dataset.ctRevealReady === 'true') return;
      node.dataset.ctRevealReady = 'true';
      if (node.style.getPropertyValue('--ct-reveal-order') === '') {
        var order = node.getAttribute('data-ct-reveal-order');
        node.style.setProperty('--ct-reveal-order', order != null ? order : String(index));
      }
      observer.observe(node);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      init(document);
    });
  } else {
    init(document);
  }
  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
  });
})();
