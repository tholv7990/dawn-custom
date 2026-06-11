if (!customElements.get('ct-product-gallery')) {
  customElements.define(
    'ct-product-gallery',
    class CtProductGallery extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('[data-gallery-track]');
        this.slides = Array.from(this.querySelectorAll('[data-gallery-slide]'));
        this.dotsWrap = this.querySelector('[data-gallery-dots]');
        this.prev = this.querySelector('[data-gallery-prev]');
        this.next = this.querySelector('[data-gallery-next]');
        this.heart = this.querySelector('[data-gallery-heart]');
        this.index = 0;
        this.lightboxIndex = 0;
        this.lightboxSwiped = false;
        this.lightboxPreloads = new Map();
        this.suppressClick = false;
        this.drag = {
          active: false,
          moved: false,
          pointerId: null,
          startX: 0,
          scrollLeft: 0,
        };
        this.tap = {
          active: false,
          moved: false,
          pointerId: null,
          startX: 0,
          startY: 0,
          slide: null,
        };

        if (!this.track || this.slides.length < 1) return;

        this.buildDots();
        this.sync();

        this.track.addEventListener('scroll', () => {
          if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
          this.scrollFrame = requestAnimationFrame(() => this.sync());
        }, { passive: true });

        if (this.prev) this.prev.addEventListener('click', () => this.goTo(this.index - 1));
        if (this.next) this.next.addEventListener('click', () => this.goTo(this.index + 1));
        if (this.heart) this.heart.addEventListener('click', () => this.heart.classList.toggle('is-active'));
        if (this.track.dataset.galleryDrag !== 'false') this.setupDesktopDrag();
        this.setupOpenOnTap();

        if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
          this.unsubscribeVariantChange = subscribe(PUB_SUB_EVENTS.variantChange, ({ data }) => {
            const mediaId = data?.variant?.featured_media?.id;
            if (!mediaId) return;
            const mediaIndex = this.slides.findIndex((slide) => slide.dataset.mediaId === String(mediaId));
            if (mediaIndex >= 0) this.goTo(mediaIndex);
          });
        }
      }

      disconnectedCallback() {
        if (this.unsubscribeVariantChange) this.unsubscribeVariantChange();
      }

      setupDesktopDrag() {
        this.track.addEventListener('dragstart', (event) => event.preventDefault());

        this.track.addEventListener('pointerdown', (event) => {
          if (event.pointerType && event.pointerType !== 'mouse') return;
          if (event.button !== 0) return;

          this.drag.active = true;
          this.drag.moved = false;
          this.drag.pointerId = event.pointerId;
          this.drag.startX = event.clientX;
          this.drag.scrollLeft = this.track.scrollLeft;
          this.track.setPointerCapture?.(event.pointerId);
          this.track.classList.add('is-dragging');
        });

        this.track.addEventListener('pointermove', (event) => {
          if (!this.drag.active || event.pointerId !== this.drag.pointerId) return;

          const dx = event.clientX - this.drag.startX;
          if (Math.abs(dx) > 3) this.drag.moved = true;
          if (!this.drag.moved) return;

          event.preventDefault();
          this.track.scrollLeft = this.drag.scrollLeft - dx;
        });

        this.track.addEventListener('click', (event) => {
          if (!this.drag.moved) return;
          event.preventDefault();
          event.stopPropagation();
        }, true);

        ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((eventName) => {
          this.track.addEventListener(eventName, (event) => {
            if (event.pointerId !== this.drag.pointerId) return;
            this.drag.active = false;
            this.drag.pointerId = null;
            this.track.classList.remove('is-dragging');
          });
        });
      }

      isGalleryControl(target) {
        return target.closest('a, [data-gallery-heart], [data-gallery-prev], [data-gallery-next]');
      }

      openSlide(slide) {
        const fullImage = slide?.dataset.galleryFullImage;
        if (!fullImage) return false;

        const index = this.getLightboxIndexForSlide(slide);
        this.openLightbox(index);
        return true;
      }

      setupOpenOnTap() {
        this.track.addEventListener('pointerdown', (event) => {
          if (this.isGalleryControl(event.target)) return;
          if (event.pointerType === 'mouse' && event.button !== 0) return;

          const slide = event.target.closest('[data-gallery-slide]');
          if (!slide?.dataset.galleryFullImage) return;

          this.tap.active = true;
          this.tap.moved = false;
          this.tap.pointerId = event.pointerId;
          this.tap.startX = event.clientX;
          this.tap.startY = event.clientY;
          this.tap.slide = slide;
        }, true);

        this.track.addEventListener('pointermove', (event) => {
          if (!this.tap.active || event.pointerId !== this.tap.pointerId) return;
          const dx = event.clientX - this.tap.startX;
          const dy = event.clientY - this.tap.startY;
          if (Math.abs(dx) > 8 || Math.abs(dy) > 8) this.tap.moved = true;
        }, { passive: true, capture: true });

        this.track.addEventListener('pointerup', (event) => {
          if (!this.tap.active || event.pointerId !== this.tap.pointerId) return;

          const dx = event.clientX - this.tap.startX;
          const dy = event.clientY - this.tap.startY;
          const slide = this.tap.slide;
          const moved = this.tap.moved || Math.abs(dx) > 8 || Math.abs(dy) > 8 || this.drag.moved;
          this.tap.active = false;
          this.tap.moved = false;
          this.tap.pointerId = null;
          this.tap.slide = null;

          if (moved) {
            this.suppressClick = true;
            return;
          }
          if (!this.openSlide(slide)) return;

          this.suppressClick = true;
          event.preventDefault();
          event.stopPropagation();
        }, true);

        ['pointercancel', 'lostpointercapture'].forEach((eventName) => {
          this.track.addEventListener(eventName, (event) => {
            if (event.pointerId !== this.tap.pointerId) return;
            this.tap.active = false;
            this.tap.moved = false;
            this.tap.pointerId = null;
            this.tap.slide = null;
          }, true);
        });

        this.track.addEventListener('click', (event) => {
          if (this.suppressClick) {
            this.suppressClick = false;
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }

          if (this.isGalleryControl(event.target)) return;
          const slide = event.target.closest('[data-gallery-slide]');
          if (!this.openSlide(slide)) return;

          event.preventDefault();
          event.stopImmediatePropagation();
        }, true);
      }

      getLightboxSlides() {
        return this.slides.filter((slide) => slide.dataset.galleryFullImage);
      }

      getLightboxIndexForSlide(slide) {
        const imageSlides = this.getLightboxSlides();
        const clickedIndex = imageSlides.indexOf(slide);
        if (clickedIndex >= 0) return clickedIndex;

        const activeSlide = this.slides[this.index];
        const activeIndex = imageSlides.indexOf(activeSlide);
        return Math.max(0, activeIndex);
      }

      ensureLightbox() {
        if (this.lightbox) return this.lightbox;

        const lightbox = document.createElement('div');
        lightbox.className = 'ct-gallery-lightbox';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-modal', 'true');
        lightbox.setAttribute('aria-label', 'Full size product image');
        lightbox.innerHTML = `
          <button type="button" class="ct-gallery-lightbox__arrow ct-gallery-lightbox__arrow--prev" aria-label="Previous image" data-lightbox-prev>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="ct-gallery-lightbox__close" aria-label="Close full size image">&times;</button>
          <img class="ct-gallery-lightbox__img" alt="" draggable="false">
          <button type="button" class="ct-gallery-lightbox__arrow ct-gallery-lightbox__arrow--next" aria-label="Next image" data-lightbox-next>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        `;

        const close = () => this.closeLightbox();
        lightbox.addEventListener('click', (event) => {
          if (this.lightboxSwiped) {
            this.lightboxSwiped = false;
            return;
          }
          if (event.target === lightbox || event.target.closest('.ct-gallery-lightbox__close')) close();
        });
        lightbox.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => this.goLightbox(this.lightboxIndex - 1));
        lightbox.querySelector('[data-lightbox-next]')?.addEventListener('click', () => this.goLightbox(this.lightboxIndex + 1));
        document.addEventListener('keydown', (event) => {
          if (!lightbox.classList.contains('is-open')) return;
          if (event.key === 'Escape') close();
          if (event.key === 'ArrowLeft') this.goLightbox(this.lightboxIndex - 1);
          if (event.key === 'ArrowRight') this.goLightbox(this.lightboxIndex + 1);
        });
        this.setupLightboxSwipe(lightbox);

        document.body.appendChild(lightbox);
        this.lightbox = lightbox;
        return lightbox;
      }

      setupLightboxSwipe(lightbox) {
        const swipe = { active: false, pointerId: null, startX: 0, startY: 0 };

        lightbox.addEventListener('pointerdown', (event) => {
          if (event.target.closest('button')) return;
          swipe.active = true;
          swipe.pointerId = event.pointerId;
          swipe.startX = event.clientX;
          swipe.startY = event.clientY;
          lightbox.setPointerCapture?.(event.pointerId);
        });

        lightbox.addEventListener('pointerup', (event) => {
          if (!swipe.active || event.pointerId !== swipe.pointerId) return;
          const dx = event.clientX - swipe.startX;
          const dy = event.clientY - swipe.startY;
          swipe.active = false;
          swipe.pointerId = null;
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
          this.lightboxSwiped = true;
          if (dx < 0) this.goLightbox(this.lightboxIndex + 1);
          else this.goLightbox(this.lightboxIndex - 1);
        });

        ['pointercancel', 'lostpointercapture'].forEach((eventName) => {
          lightbox.addEventListener(eventName, () => {
            swipe.active = false;
            swipe.pointerId = null;
          });
        });
      }

      openLightbox(index) {
        const lightbox = this.ensureLightbox();
        this.lightboxIndex = Math.max(0, Math.min(this.getLightboxSlides().length - 1, index));
        this.renderLightbox();
        this.preloadLightboxAround(this.lightboxIndex);
        lightbox.classList.add('is-open');
        document.documentElement.classList.add('ct-gallery-lightbox-open');
        lightbox.querySelector('.ct-gallery-lightbox__close')?.focus();
      }

      goLightbox(index) {
        const slides = this.getLightboxSlides();
        if (!slides.length) return;
        this.lightboxIndex = Math.max(0, Math.min(slides.length - 1, index));
        requestAnimationFrame(() => {
          this.renderLightbox();
          this.preloadLightboxAround(this.lightboxIndex);
        });
      }

      preloadLightboxAround(index) {
        [index - 1, index, index + 1].forEach((slideIndex) => this.preloadLightboxImage(slideIndex));
      }

      preloadLightboxImage(index) {
        const slide = this.getLightboxSlides()[index];
        const src = slide?.dataset.galleryFullImage;
        if (!src || this.lightboxPreloads.has(src)) return;

        const image = new Image();
        image.decoding = 'async';
        image.src = src;
        this.lightboxPreloads.set(src, image);
      }

      renderLightbox() {
        if (!this.lightbox) return;
        const slides = this.getLightboxSlides();
        const slide = slides[this.lightboxIndex];
        if (!slide) return;

        const image = this.lightbox.querySelector('.ct-gallery-lightbox__img');
        image.decoding = 'async';
        image.src = slide.dataset.galleryFullImage;
        image.alt = slide.dataset.galleryFullAlt || '';

        this.lightbox.querySelector('[data-lightbox-prev]').disabled = this.lightboxIndex <= 0;
        this.lightbox.querySelector('[data-lightbox-next]').disabled = this.lightboxIndex >= slides.length - 1;
      }

      closeLightbox() {
        if (!this.lightbox) return;
        this.lightbox.classList.remove('is-open');
        document.documentElement.classList.remove('ct-gallery-lightbox-open');
      }

      buildDots() {
        if (!this.dotsWrap) return;
        this.dotsWrap.innerHTML = '';
        this.dots = this.slides.map((slide, index) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = this.dataset.dotClass || 'ct-product-gallery__dot';
          dot.setAttribute('aria-label', `Go to image ${index + 1}`);
          dot.addEventListener('click', () => this.goTo(index));
          this.dotsWrap.appendChild(dot);
          return dot;
        });
      }

      goTo(index) {
        const nextIndex = Math.max(0, Math.min(this.slides.length - 1, index));
        const nextSlide = this.slides[nextIndex];
        const nextLeft = nextSlide ? nextSlide.offsetLeft - this.track.offsetLeft : nextIndex * this.track.clientWidth;
        this.track.scrollTo({
          left: nextLeft,
          behavior: 'smooth',
        });
      }

      setActiveMedia(mediaId) {
        if (!mediaId) return;
        const id = String(mediaId);
        const mediaIndex = this.slides.findIndex((slide) => {
          const slideId = slide.dataset.mediaId;
          return slideId === id || slideId?.endsWith(`-${id}`);
        });
        if (mediaIndex >= 0) this.goTo(mediaIndex);
      }

      sync() {
        const currentLeft = this.track.scrollLeft;
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        this.slides.forEach((slide, index) => {
          const distance = Math.abs(currentLeft - (slide.offsetLeft - this.track.offsetLeft));
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });
        this.index = nearestIndex;
        if (this.dots) {
          this.dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === this.index);
          });
        }
        if (this.prev) this.prev.disabled = this.index <= 0;
        if (this.next) this.next.disabled = this.index >= this.slides.length - 1;
      }
    }
  );
}
