(function () {
  'use strict';

  /* Mobile contact panel toggle */
  var openBtn = document.getElementById('open')!;
  var closeBtn = document.getElementById('close')!;
  var panel = document.getElementById('panel')!;

  if (openBtn && closeBtn && panel) {
    openBtn.addEventListener('click', function () {
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      openBtn.style.display = 'none';
      closeBtn.style.display = 'inline-block';
    });

    closeBtn.addEventListener('click', function () {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      closeBtn.style.display = 'none';
      openBtn.style.display = 'inline-block';
    });
  }

  /* Contact form submission feedback */
  var contactStatus = document.getElementById('contact-form-status');
  if (contactStatus) {
    var status = new URLSearchParams(window.location.search).get('status');
    var messages = {
      sent: 'Thank you. Your message has been sent.',
      error:
        'Sorry, we could not send your message. Please call us at 253-446-6507.',
      invalid: 'Please enter your name and a valid email address.',
    };

    if (status === 'sent' || status === 'error' || status === 'invalid') {
      contactStatus.textContent = messages[status];
      contactStatus.className =
        'contact-form-status contact-form-status--' + status;
      contactStatus.hidden = false;
    }
  }

  //ask Zach if the code for the user review carousel should be on the same file as the toggle mobile panel feature.
  var reviews = document.querySelector('.reviews');
  if (reviews) {
    var root = reviews;
    var slides = document.querySelectorAll<HTMLElement>('.review-slide');
    var reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    var index = 0;
    var paused = false;
    var timer: ReturnType<typeof setInterval> | undefined;
    //this function doesn't make sense
    function showSlide(i: number) {
      var current = slides[index];
      if (current) {
        current.classList.remove('is-active');
        current.setAttribute('aria-hidden', 'true');
      }
      index = (i + slides.length) % slides.length;
      var nextSlide = slides[index];
      if (nextSlide) {
        nextSlide.classList.add('is-active');
        nextSlide.setAttribute('aria-hidden', 'false');
      }
    }

    function stopCarousel() {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    }

    function startCarousel() {
      if (reduceMotion || slides.length < 2 || paused) {
        return;
      }
      stopCarousel();
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 30000);
    }

    slides.forEach(function (slide, i) {
      slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    });

    root.addEventListener('mouseenter', function () {
      paused = true;
      stopCarousel();
    });
    root.addEventListener('mouseleave', function () {
      paused = false;
      startCarousel();
    });
    root.addEventListener('focusin', function () {
      paused = true;
      stopCarousel();
    });
    root.addEventListener('focusout', function (event) {
      var nextTarget = (event as FocusEvent).relatedTarget;
      if (nextTarget instanceof Node && root.contains(nextTarget)) {
        return;
      }
      paused = false;
      startCarousel();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopCarousel();
      } else {
        startCarousel();
      }
    });

    startCarousel();
  }

  /* Highlight current page in navigation */
  var currentPage = document.body.getAttribute('data-page');
  if (currentPage) {
    var navLinks = document.querySelectorAll(
      '.main-nav a[data-page="' +
        currentPage +
        '"], .footer-nav a[data-page="' +
        currentPage +
        '"]',
    );
    navLinks.forEach(function (link) {
      link.classList.add('is-current');
    });
  }
})();
