/* ct-toast.js (W2.T09) - unified toast service.
   Single polite aria-live host (created on first use), queued so rapid adds never overlap,
   auto-dismiss with a hover/focus pause. Self-injects token-based styles. Inert until
   window.CT.toast(message, options) is called by a consumer (e.g. an add-to-cart path). */
(function () {
  window.CT = window.CT || {};
  if (window.CT.toast) return;

  var STYLE_ID = 'ct-toast-style';
  var host = null;
  var queue = [];
  var active = null;
  var paused = false;
  var timer = null;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var css =
      '.ct-toast-host{position:fixed;left:50%;bottom:var(--ct-space-9,40px);transform:translateX(-50%);' +
      'z-index:1000;display:flex;flex-direction:column;gap:var(--ct-space-3,8px);pointer-events:none;' +
      'max-width:min(92vw,420px);}' +
      '.ct-toast{pointer-events:auto;display:flex;align-items:center;gap:var(--ct-space-3,8px);' +
      'padding:var(--ct-space-4,12px) var(--ct-space-6,20px);border-radius:var(--ct-r-md,12px);' +
      'background:var(--ct-text,#16181d);color:var(--ct-bg,#fff);box-shadow:var(--ct-shadow-lg);' +
      'font-size:var(--ct-text-sm,13px);opacity:0;transform:translateY(10px);' +
      'transition:opacity var(--ct-dur-base,240ms) ease,transform var(--ct-dur-base,240ms) ease;}' +
      '.ct-toast.is-in{opacity:1;transform:none;}' +
      '.ct-toast--success{background:var(--ct-success,#1e7d34);}' +
      '.ct-toast--error{background:var(--ct-error,#e23a2a);}' +
      '@media (prefers-reduced-motion: reduce){.ct-toast{transition:none;}}';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureHost() {
    if (host) return host;
    injectStyle();
    host = document.createElement('div');
    host.className = 'ct-toast-host';
    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-atomic', 'true');
    document.body.appendChild(host);
    return host;
  }

  function next() {
    if (active || !queue.length) return;
    active = queue.shift();
    var node = document.createElement('div');
    node.className = 'ct-toast' + (active.variant ? ' ct-toast--' + active.variant : '');
    node.textContent = active.message;
    node.addEventListener('mouseenter', function () {
      paused = true;
    });
    node.addEventListener('mouseleave', function () {
      paused = false;
    });
    ensureHost().appendChild(node);
    requestAnimationFrame(function () {
      node.classList.add('is-in');
    });
    active.node = node;
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function step() {
      if (paused) {
        timer = setTimeout(step, 400);
        return;
      }
      dismiss();
    }, active.duration);
  }

  function dismiss() {
    if (!active) return;
    var node = active.node;
    node.classList.remove('is-in');
    var finished = active;
    active = null;
    setTimeout(function () {
      if (node && node.parentNode) node.parentNode.removeChild(node);
      if (typeof finished.onClose === 'function') finished.onClose();
      next();
    }, 260);
  }

  window.CT.toast = function (message, options) {
    if (!message) return;
    var opts = options || {};
    queue.push({
      message: message,
      variant: opts.variant || '',
      duration: opts.duration || 2600,
      onClose: opts.onClose,
      node: null,
    });
    next();
  };
})();
