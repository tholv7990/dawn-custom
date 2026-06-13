/* ct-security.js (W6.T04) - optional copy protection.
   Loaded and active ONLY when the Security panel's "Enable copy protection" is on
   (theme.liquid gates both the script tag and the data-ct-copy-protect="true" flag on
   <body>). Default OFF -> this file is never even loaded.

   Accessibility note: copy protection interferes with assistive technology, keyboard copy,
   and normal selection. It is a deterrent, not real protection. Documented per W6.T04. */
(function () {
  var body = document.body;
  if (!body || body.getAttribute('data-ct-copy-protect') !== 'true') return;

  var notice = body.getAttribute('data-ct-copy-notice') || '';
  var noticed = false;

  function block(event) {
    event.preventDefault();
    if (notice && !noticed && window.CT && typeof window.CT.toast === 'function') {
      noticed = true;
      window.CT.toast(notice);
      setTimeout(function () {
        noticed = false;
      }, 2000);
    }
    return false;
  }

  ['contextmenu', 'copy', 'cut', 'dragstart'].forEach(function (type) {
    document.addEventListener(type, block);
  });

  var style = document.createElement('style');
  style.textContent =
    'body{-webkit-user-select:none;-moz-user-select:none;user-select:none;}' +
    'input,textarea,[contenteditable],[contenteditable] *{-webkit-user-select:text;-moz-user-select:text;user-select:text;}';
  document.head.appendChild(style);
})();
