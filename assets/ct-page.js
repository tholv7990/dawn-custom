(function () {
  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initDots(track, box) {
    if (!track || !box || box.dataset.ready === 'true') return;
    var slides = qsa('[data-gs-slide]', track);
    if (!slides.length) slides = Array.prototype.slice.call(track.children);
    if (slides.length < 2) return;
    box.dataset.ready = 'true';
    slides.forEach(function (_, index) {
      var dot = document.createElement('b');
      if (index === 0) dot.className = 'on';
      dot.addEventListener('click', function () {
        track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' });
      });
      box.appendChild(dot);
    });
    var dots = qsa('b', box);
    track.addEventListener(
      'scroll',
      function () {
        var width = track.clientWidth || 1;
        var active = Math.round(track.scrollLeft / width);
        active = Math.max(0, Math.min(slides.length - 1, active));
        dots.forEach(function (dot, index) {
          dot.classList.toggle('on', index === active);
        });
      },
      { passive: true }
    );
  }

  function initAutoplayVideos(root) {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    qsa('[data-gs-autoplay-video]', root).forEach(function (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      // Honour prefers-reduced-motion: keep the muted video pausable and visible
      // on its first frame, but do not auto-start it for users who opt out.
      if (reduceMotion) {
        video.removeAttribute('autoplay');
        video.setAttribute('controls', '');
        return;
      }
      video.setAttribute('autoplay', '');
      video.setAttribute('loop', '');

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener('loadeddata', playVideo, { once: true });
      }
    });
  }

  function initProduct(root) {
    var galleryTrack = root.querySelector('[data-gs-gallery-track]');
    var galleryDots = root.querySelector('[data-gs-gallery-dots]');
    initDots(galleryTrack, galleryDots);
    var galleryTriggers = qsa('[data-gs-gallery-open]', root);

    function move(direction) {
      if (!galleryTrack) return;
      var width = galleryTrack.clientWidth || 1;
      var slides = qsa('[data-gs-slide]', galleryTrack);
      var next = Math.round(galleryTrack.scrollLeft / width) + direction;
      next = Math.max(0, Math.min(slides.length - 1, next));
      galleryTrack.scrollTo({ left: width * next, behavior: 'smooth' });
    }

    var prev = root.querySelector('[data-gs-gallery-prev]');
    var next = root.querySelector('[data-gs-gallery-next]');
    if (prev && !prev.dataset.ready) {
      prev.dataset.ready = 'true';
      prev.addEventListener('click', function () {
        move(-1);
      });
    }
    if (next && !next.dataset.ready) {
      next.dataset.ready = 'true';
      next.addEventListener('click', function () {
        move(1);
      });
    }

    var lightbox = root.querySelector('[data-gs-lightbox]');
    var lightboxStage = root.querySelector('[data-gs-lightbox-stage]');
    var lightboxImage = lightboxStage ? lightboxStage.querySelector('img') : null;
    var lightboxIndex = 0;

    function closeLightbox() {
      if (!lightbox || !lightboxStage) return;
      lightbox.hidden = true;
      lightboxStage.textContent = '';
      lightboxImage = null;
      document.documentElement.classList.remove('gs-lightbox-open');
    }

    function renderLightbox(index) {
      if (!lightboxStage || !galleryTriggers.length) return;
      lightboxIndex = Math.max(0, Math.min(galleryTriggers.length - 1, index));
      var trigger = galleryTriggers[lightboxIndex];
      var image = trigger.querySelector('img');
      // Match Dawn: reuse the image the gallery already downloaded + decoded
      // (image.currentSrc) instead of fetching a separate large file per slide.
      // That separate fetch + decode was the only thing the smooth gallery never
      // did, and the only place this popup lagged. dataset.gsFullImage is just a
      // fallback for the no-media (fallback image) case.
      var src = image ? image.currentSrc || image.src : trigger.dataset.gsFullImage;
      if (!src) return;
      lightboxStage.textContent = '';
      lightboxImage = document.createElement('img');
      lightboxImage.loading = 'eager';
      lightboxImage.decoding = 'async';
      lightboxImage.setAttribute('fetchpriority', 'high');
      lightboxImage.alt = image ? image.alt || '' : '';
      lightboxImage.src = src;
      lightboxStage.appendChild(lightboxImage);

      // Warm neighbours so a swipe shows their (already device-sized) gallery
      // image instantly even if that slide had not been viewed in the gallery.
      [lightboxIndex - 1, lightboxIndex + 1].forEach(function (neighbor) {
        if (neighbor < 0 || neighbor >= galleryTriggers.length) return;
        var nimg = galleryTriggers[neighbor].querySelector('img');
        var nsrc = nimg ? nimg.currentSrc || nimg.src : galleryTriggers[neighbor].dataset.gsFullImage;
        if (nsrc) {
          var warm = new Image();
          warm.src = nsrc;
        }
      });
    }

    function moveLightbox(direction) {
      if (!lightbox || lightbox.hidden || !galleryTriggers.length) return;
      var nextIndex = lightboxIndex + direction;
      if (nextIndex < 0) nextIndex = galleryTriggers.length - 1;
      if (nextIndex >= galleryTriggers.length) nextIndex = 0;
      renderLightbox(nextIndex);
    }

    function openLightbox(trigger, index) {
      if (!lightbox || !lightboxStage || !trigger) return;
      renderLightbox(index);
      lightbox.hidden = false;
      document.documentElement.classList.add('gs-lightbox-open');
      var closeButton = lightbox.querySelector('[data-gs-lightbox-close]');
      if (closeButton) closeButton.focus({ preventScroll: true });
    }

    galleryTriggers.forEach(function (trigger, index) {
      if (trigger.dataset.lightboxReady === 'true') return;
      trigger.dataset.lightboxReady = 'true';
      trigger.addEventListener('click', function () {
        openLightbox(trigger, index);
      });
    });

    if (lightbox && lightbox.dataset.ready !== 'true') {
      lightbox.dataset.ready = 'true';
      qsa('[data-gs-lightbox-close]', lightbox).forEach(function (button) {
        button.addEventListener('click', closeLightbox);
      });
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
        if (event.key === 'ArrowLeft' && !lightbox.hidden) moveLightbox(-1);
        if (event.key === 'ArrowRight' && !lightbox.hidden) moveLightbox(1);
      });
      var lightboxPrev = lightbox.querySelector('[data-gs-lightbox-prev]');
      var lightboxNext = lightbox.querySelector('[data-gs-lightbox-next]');
      if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function () {
          moveLightbox(-1);
        });
      }
      if (lightboxNext) {
        lightboxNext.addEventListener('click', function () {
          moveLightbox(1);
        });
      }
      var startX = 0;
      lightbox.addEventListener(
        'touchstart',
        function (event) {
          startX = event.touches && event.touches.length ? event.touches[0].clientX : 0;
        },
        { passive: true }
      );
      lightbox.addEventListener(
        'touchend',
        function (event) {
          if (!startX || !event.changedTouches || !event.changedTouches.length) return;
          var delta = event.changedTouches[0].clientX - startX;
          if (Math.abs(delta) > 40) moveLightbox(delta > 0 ? -1 : 1);
          startX = 0;
        },
        { passive: true }
      );
    }

    function syncTierPrice(tier) {
      if (!tier) return;
      var price = root.querySelector('[data-gs-main-price]');
      var compare = root.querySelector('[data-gs-main-was]');
      var save = root.querySelector('[data-gs-main-save]');
      if (price && tier.dataset.price) price.textContent = tier.dataset.price;
      if (compare) {
        compare.textContent = tier.dataset.comparePrice || '';
        compare.hidden = !tier.dataset.comparePrice;
      }
      if (save) {
        save.textContent = tier.dataset.save || '';
        save.hidden = !tier.dataset.save;
      }
    }

    qsa('[data-gs-tier]', root).forEach(function (tier) {
      if (tier.dataset.ready === 'true') return;
      tier.dataset.ready = 'true';
      tier.addEventListener('click', function (event) {
        if (event.target.tagName === 'SELECT') return;
        qsa('[data-gs-tier]', root).forEach(function (item) {
          item.classList.toggle('is-active', item === tier);
        });
        var quantityInput = root.querySelector('[data-gs-quantity]');
        if (quantityInput) quantityInput.value = tier.dataset.quantity || '1';
        syncTierPrice(tier);
      });
    });
    syncTierPrice(root.querySelector('[data-gs-tier].is-active'));

    var form = root.querySelector('[data-gs-product-form]');
    if (form && !form.dataset.ready) {
      form.dataset.ready = 'true';
      form.addEventListener('submit', function () {
        window.setTimeout(function () {
          qsa('[data-gs-toast]').forEach(function (toast) {
            toast.classList.add('show');
            window.setTimeout(function () {
              toast.classList.remove('show');
            }, 1600);
          });
        }, 300);
      });
    }

    var clock = root.querySelector('[data-gs-countdown]');
    if (clock && clock.dataset.ready !== 'true') {
      clock.dataset.ready = 'true';
      var tick = function () {
        var now = new Date();
        var cutoff = new Date();
        cutoff.setHours(18, 0, 0, 0);
        if (now >= cutoff) cutoff.setDate(cutoff.getDate() + 1);
        var seconds = Math.max(0, Math.floor((cutoff - now) / 1000));
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        var rest = seconds % 60;
        clock.textContent = [hours, minutes, rest]
          .map(function (number) {
            return number < 10 ? '0' + number : String(number);
          })
          .join(':');
      };
      tick();
      window.setInterval(tick, 1000);
    }
  }

  function initInfo(root) {
    var tabs = qsa('[data-gs-tab]', root);
    var panels = qsa('[data-gs-panel]', root);
    tabs.forEach(function (tab) {
      if (tab.dataset.ready === 'true') return;
      tab.dataset.ready = 'true';
      tab.addEventListener('click', function () {
        var index = tab.dataset.gsTab;
        tabs.forEach(function (item) {
          item.classList.toggle('is-active', item === tab);
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('is-active', panel.dataset.gsPanel === index);
        });
      });
    });
    qsa('[data-gs-accordion-toggle]', root).forEach(function (button) {
      if (button.dataset.ready === 'true') return;
      button.dataset.ready = 'true';
      button.addEventListener('click', function () {
        button.closest('[data-gs-panel]').classList.toggle('is-open');
      });
    });
  }

  function initSticky(root) {
    var bar = root.querySelector('[data-gs-sticky]');
    if (!bar || bar.dataset.ready === 'true') return;
    bar.dataset.ready = 'true';
    var buy = document.querySelector('[data-gs-buy]');
    qsa('[data-gs-sticky-variant]', bar).forEach(function (select) {
      select.addEventListener('change', function () {
        var option = select.options[select.selectedIndex];
        var price = bar.querySelector('.gs-sticky__price');
        var save = bar.querySelector('[data-gs-sticky-save]');
        if (option && price && option.dataset.price) price.textContent = option.dataset.price;
        if (option && save) {
          save.textContent = option.dataset.save || '';
          save.hidden = !option.dataset.save;
        }
      });
    });
    window.addEventListener(
      'scroll',
      function () {
        if (!buy) {
          bar.classList.toggle('show', window.scrollY > 500);
          return;
        }
        bar.classList.toggle('show', buy.getBoundingClientRect().bottom < 0);
      },
      { passive: true }
    );
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function initEmailSignup(root) {
    qsa('[data-gs-email-signup]', root).forEach(function (section) {
      if (section.dataset.ready === 'true') return;
      section.dataset.ready = 'true';
      var form = section.querySelector('form');
      var input = section.querySelector('[data-gs-email-input]');
      var submit = section.querySelector('[data-gs-email-submit]');
      var error = section.querySelector('[data-gs-email-error]');
      var modal = section.querySelector('[data-gs-email-modal]');

      function updateState() {
        var valid = input && isValidEmail(input.value);
        if (submit) submit.disabled = !valid;
        if (error && valid) error.hidden = true;
        return valid;
      }

      function closeModal() {
        if (!modal) return;
        modal.hidden = true;
        modal.classList.remove('is-open');
        document.documentElement.classList.remove('gs-lightbox-open');
      }

      if (input) {
        input.addEventListener('input', updateState);
        input.addEventListener('blur', function () {
          if (error) error.hidden = !input.value || isValidEmail(input.value);
        });
      }

      if (form) {
        form.addEventListener('submit', function (event) {
          if (updateState()) return;
          event.preventDefault();
          if (error) error.hidden = false;
          if (input) input.focus();
        });
      }

      if (modal && !modal.hidden) {
        modal.classList.add('is-open');
        document.documentElement.classList.add('gs-lightbox-open');
      }

      qsa('[data-gs-email-close]', section).forEach(function (button) {
        button.addEventListener('click', closeModal);
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && modal && !modal.hidden) closeModal();
      });

      updateState();
    });
  }

  function initHeader(root) {
    qsa('[data-gs-menu-toggle]', root).forEach(function (button) {
      if (button.dataset.ready === 'true') return;
      button.dataset.ready = 'true';
      var header = button.closest('.gs-head');
      var menu = header ? header.querySelector('[data-gs-mobile-menu]') : null;
      function closeMenu() {
        if (!menu) return;
        menu.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('gs-menu-open');
      }
      function openMenu() {
        if (!menu) return;
        menu.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        document.documentElement.classList.add('gs-menu-open');
        var firstLink = menu.querySelector('a, button');
        if (firstLink) firstLink.focus({ preventScroll: true });
      }
      button.addEventListener('click', function () {
        if (menu && menu.hidden) openMenu();
        else closeMenu();
      });
      if (menu) {
        qsa('[data-gs-menu-close]', menu).forEach(function (close) {
          close.addEventListener('click', closeMenu);
        });
        qsa('a', menu).forEach(function (link) {
          link.addEventListener('click', closeMenu);
        });
      }
      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menu && !menu.hidden) closeMenu();
      });
    });
  }

  function init(root) {
    root = root || document;
    initAutoplayVideos(root);
    qsa('[data-gs-product]', root).forEach(initProduct);
    qsa('.gs-head', root).forEach(initHeader);
    qsa('[data-gs-info]', root).forEach(initInfo);
    initEmailSignup(root);
    qsa('[data-gs-carousel]', root).forEach(function (track) {
      initDots(track, root.querySelector('[data-gs-dots="' + track.dataset.gsCarousel + '"]'));
    });
    qsa('[data-gs-sticky-root]', root).forEach(initSticky);
  }

  document.addEventListener('DOMContentLoaded', function () {
    init(document);
  });
  document.addEventListener('shopify:section:load', function (event) {
    init(event.target);
  });
})();
