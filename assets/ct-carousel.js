/* ct-carousel.js (W2.T07) - <ct-carousel> standalone, dependency-free slider.
   Scroll-snap track with optional arrows + dots, keyboard nav, and autoplay that
   pauses on hover/focus and is disabled under prefers-reduced-motion. Consumes the
   arrow + dot chrome tokens via component-ct-carousel.css. Idempotent +
   theme-editor safe. Inert until a <ct-carousel> tag appears.

   Markup:
     <ct-carousel data-ct-autoplay="0">
       <button data-ct-carousel-prev>...</button>
       <div data-ct-carousel-track> <slide/> <slide/> ... </div>
       <button data-ct-carousel-next>...</button>
       <div data-ct-carousel-dots></div>
     </ct-carousel>
*/
(function () {
  if (customElements.get('ct-carousel')) return;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  customElements.define(
    'ct-carousel',
    class CtCarousel extends HTMLElement {
      connectedCallback() {
        if (this._wired) return;
        this.track = this.querySelector('[data-ct-carousel-track]');
        if (!this.track) return;
        this._wired = true;
        this.slides = Array.prototype.slice.call(
          this.track.querySelectorAll('[data-ct-slide]')
        );
        if (!this.slides.length) this.slides = Array.prototype.slice.call(this.track.children);

        this._buildDots();
        this._wireArrows();
        this._wireKeyboard();

        this._onScroll = this._syncActive.bind(this);
        this.track.addEventListener('scroll', this._onScroll, { passive: true });

        var autoplay = parseInt(this.getAttribute('data-ct-autoplay'), 10) || 0;
        if (autoplay > 0 && !reduceMotion && this.slides.length > 1) this._startAutoplay(autoplay);
      }

      disconnectedCallback() {
        this._stopAutoplay();
        if (this.track && this._onScroll) this.track.removeEventListener('scroll', this._onScroll);
      }

      _step() {
        return this.track.clientWidth;
      }

      _index() {
        return Math.round(this.track.scrollLeft / this._step());
      }

      _go(index) {
        var clamped = Math.max(0, Math.min(this.slides.length - 1, index));
        this.track.scrollTo({ left: this._step() * clamped, behavior: 'smooth' });
      }

      _buildDots() {
        this.dotsBox = this.querySelector('[data-ct-carousel-dots]');
        if (!this.dotsBox || this.slides.length < 2) return;
        this.dots = [];
        var self = this;
        this.slides.forEach(function (_, index) {
          var dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'ct-carousel__dot' + (index === 0 ? ' is-on' : '');
          dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
          dot.addEventListener('click', function () {
            self._go(index);
          });
          self.dotsBox.appendChild(dot);
          self.dots.push(dot);
        });
      }

      _wireArrows() {
        var self = this;
        var prev = this.querySelector('[data-ct-carousel-prev]');
        var next = this.querySelector('[data-ct-carousel-next]');
        if (prev) prev.addEventListener('click', function () {
          self._go(self._index() - 1);
        });
        if (next) next.addEventListener('click', function () {
          self._go(self._index() + 1);
        });
      }

      _wireKeyboard() {
        var self = this;
        if (!this.track.hasAttribute('tabindex')) this.track.setAttribute('tabindex', '0');
        this.track.setAttribute('role', 'group');
        this.track.addEventListener('keydown', function (event) {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            self._go(self._index() + 1);
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            self._go(self._index() - 1);
          }
        });
      }

      _syncActive() {
        if (!this.dots) return;
        var active = this._index();
        this.dots.forEach(function (dot, index) {
          dot.classList.toggle('is-on', index === active);
        });
      }

      _startAutoplay(delay) {
        var self = this;
        var advance = function () {
          var nextIndex = self._index() + 1;
          self._go(nextIndex >= self.slides.length ? 0 : nextIndex);
        };
        this._timer = setInterval(advance, delay);
        var pause = function () {
          self._stopAutoplay();
        };
        var resume = function () {
          if (!self._timer) self._timer = setInterval(advance, delay);
        };
        this.addEventListener('mouseenter', pause);
        this.addEventListener('mouseleave', resume);
        this.addEventListener('focusin', pause);
        this.addEventListener('focusout', resume);
      }

      _stopAutoplay() {
        clearInterval(this._timer);
        this._timer = null;
      }
    }
  );
})();
