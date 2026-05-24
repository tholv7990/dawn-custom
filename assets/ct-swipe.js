(function () {
  'use strict';
  function init(el) {
    let startX, scrollLeft, dragging = false;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (e) => {
      dragging = true; startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
      el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing'; el.style.userSelect = 'none';
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      el.scrollLeft = scrollLeft - (e.pageX - el.offsetLeft - startX) * 1.2;
    });
    ['pointerup', 'pointercancel'].forEach((ev) => el.addEventListener(ev, () => {
      dragging = false; el.style.cursor = 'grab'; el.style.userSelect = '';
    }));
  }
  document.querySelectorAll('[data-swipe]').forEach(init);
})();
