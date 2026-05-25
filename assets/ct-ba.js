(function () {
  'use strict';
  document.querySelectorAll('[data-ba]').forEach((root) => {
    const after = root.querySelector('.ct-ba-after'), handle = root.querySelector('.ct-ba-handle');
    if (!after || !handle) return;
    let dragging = false, pos = 50;
    function setPos(pct) {
      pos = Math.max(2, Math.min(98, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pos + '%)'; handle.style.left = pos + '%';
      handle.setAttribute('aria-valuenow', Math.round(pos));
    }
    setPos(50);
    function getPct(e) { const r = root.getBoundingClientRect(); return ((e.clientX - r.left) / r.width) * 100; }
    handle.addEventListener('pointerdown', (e) => { dragging = true; handle.setPointerCapture(e.pointerId); });
    root.addEventListener('pointermove', (e) => { if (dragging) setPos(getPct(e)); });
    ['pointerup', 'pointercancel'].forEach((ev) => root.addEventListener(ev, () => { dragging = false; }));
    handle.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setPos(pos - 4); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setPos(pos + 4); e.preventDefault(); }
      else if (e.key === 'Home') { setPos(0); e.preventDefault(); }
      else if (e.key === 'End') { setPos(100); e.preventDefault(); }
    });
  });
})();
