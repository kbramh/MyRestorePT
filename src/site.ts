(function () {
  'use strict';

  /* Mobile contact panel toggle */
  const openBtn = document.getElementById('open')!;
  const closeBtn = document.getElementById('close')!;
  const panel = document.getElementById('panel')!;

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
  const contactStatus = document.getElementById('contact-form-status');
  if (contactStatus) {
    const status = new URLSearchParams(window.location.search).get('status');
    const messages = {
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

  const reviews = document.querySelector('.reviews');
  if (reviews) {
    const slides = document.querySelectorAll<HTMLElement>('.review-slide');
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let index = 0;
    let paused = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    function showSlide(i: number) {
      const current = slides[index];
      if (current) {
        current.classList.remove('is-active');
        current.setAttribute('aria-hidden', 'true');
      }
      index = (i + slides.length) % slides.length;
      const nextSlide = slides[index];
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
      if (reduceMotion || paused) {
        return;
      }
      stopCarousel();
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 30000);
    }

    reviews.addEventListener('mouseenter', function () {
      paused = true;
      stopCarousel();
    });
    reviews.addEventListener('mouseleave', function () {
      paused = false;
      startCarousel();
    });
    reviews.addEventListener('focusin', function () {
      paused = true;
      stopCarousel();
    });
    reviews.addEventListener('focusout', function (event) {
      const nextTarget = (event as FocusEvent).relatedTarget;
      if (nextTarget instanceof Node && reviews!.contains(nextTarget)) {
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
  const currentPage = document.body.getAttribute('data-page');
  if (currentPage) {
    const navLinks = document.querySelectorAll(
      `.main-nav a[data-page="${currentPage}"], .footer-nav a[data-page="${currentPage}"]`,
    );
    navLinks.forEach(function (link) {
      link.classList.add('is-current');
    });
  }
})();
