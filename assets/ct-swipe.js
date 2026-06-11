(function () {
  'use strict';

  function init(el) {
    if (el.dataset.ctSwipeReady === 'true') return;
    el.dataset.ctSwipeReady = 'true';

    let startX;
    let startY;
    let scrollLeft;
    let dragging = false;
    let tracking = false;
    let activePointerId = null;

    el.style.cursor = 'grab';

    const stop = () => {
      tracking = false;
      dragging = false;
      activePointerId = null;
      el.style.cursor = 'grab';
      el.style.userSelect = '';
    };

    el.addEventListener('pointerdown', (e) => {
      if (activePointerId !== null) return;
      tracking = true;
      dragging = false;
      activePointerId = e.pointerId;
      startX = e.pageX;
      startY = e.pageY;
      scrollLeft = el.scrollLeft;
    });

    el.addEventListener('pointermove', (e) => {
      if (!tracking || e.pointerId !== activePointerId) return;

      const dx = e.pageX - startX;
      const dy = e.pageY - startY;

      if (!dragging) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
          stop();
          return;
        }
        if (Math.abs(dx) < 8) return;

        dragging = true;
        if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
        el.style.cursor = 'grabbing';
        el.style.userSelect = 'none';
      }

      if (e.cancelable) e.preventDefault();
      el.scrollLeft = scrollLeft - dx * 1.2;
    }, { passive: false });

    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => el.addEventListener(ev, stop));
  }

  function initAll(root) {
    (root || document).querySelectorAll('[data-swipe]').forEach(init);
  }

  document.addEventListener('DOMContentLoaded', () => initAll());
  document.addEventListener('shopify:section:load', (event) => initAll(event.target));
  window.ctInitSwipe = initAll;

  initAll();
})();
