(function () {
  'use strict';
  document.querySelectorAll('[data-ba]').forEach((root) => {
    const after = root.querySelector('.ct-ba-after'), handle = root.querySelector('.ct-ba-handle');
    if (!after || !handle) return;
    let dragging = false;
    function setPos(pct) {
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)'; handle.style.left = pct + '%';
    }
    setPos(50);
    function getPct(e) { const r = root.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; }
    handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
    root.addEventListener('pointermove', (e) => { if (dragging) setPos(getPct(e)); });
    ['pointerup', 'pointercancel'].forEach((ev) => root.addEventListener(ev, () => { dragging = false; }));
  });
})();
