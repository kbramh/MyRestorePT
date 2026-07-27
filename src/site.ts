(function () {
  'use strict';

  /* Mobile contact panel toggle */
  var openBtn = document.getElementById('open');
  var closeBtn = document.getElementById('close');
  var panel = document.getElementById('panel');

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

    if (messages[status]) {
      contactStatus.textContent = messages[status];
      contactStatus.className =
        'contact-form-status contact-form-status--' + status;
      contactStatus.hidden = false;
    }
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
