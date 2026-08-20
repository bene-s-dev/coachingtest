/* =============================================================
   SARAH UNKE COACHING – Main JavaScript
   =============================================================

   This file handles:
   1. Navigation shrink-on-scroll (adds .nav--scrolled class)
   2. Mobile hamburger menu toggle
   3. Active link highlighting as you scroll through sections
   4. FAQ accordion (expand / collapse answers)
   5. Smooth scroll offset correction (so sections aren't hidden under nav)

   Everything runs after the page has fully loaded.
   ============================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // ─────────────────────────────────────────────
  // 1. NAVIGATION: SHRINK ON SCROLL
  // ─────────────────────────────────────────────
  // When the user scrolls down more than SCROLL_THRESHOLD pixels,
  // the class "nav--scrolled" is added to <nav>, which triggers
  // the smaller, frosted-glass styles defined in css/nav.css.

  const nav = document.querySelector('.site-nav');
  const SCROLL_THRESHOLD = 60; // pixels – adjust if you want the transition sooner/later

  function updateNavOnScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', updateNavOnScroll, { passive: true });
  updateNavOnScroll(); // run once on load in case page is already scrolled


  // ─────────────────────────────────────────────
  // 2. MOBILE HAMBURGER MENU
  // ─────────────────────────────────────────────
  // The toggle button shows/hides the nav links on small screens.
  // "nav--open" class is added to <nav> to reveal the dropdown menu.

  const navToggle = document.querySelector('.site-nav__toggle');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon     = document.getElementById('close-icon');

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('nav--open');
      // Swap icon between ☰ and ✕
      if (hamburgerIcon && closeIcon) {
        hamburgerIcon.style.display = isOpen ? 'none'  : 'block';
        closeIcon.style.display     = isOpen ? 'block' : 'none';
      }
    });
  }

  // Close mobile menu when a nav link is clicked
  document.querySelectorAll('.site-nav__links a').forEach(function (link) {
    link.addEventListener('click', function () {
      nav.classList.remove('nav--open');
      if (hamburgerIcon && closeIcon) {
        hamburgerIcon.style.display = 'block';
        closeIcon.style.display     = 'none';
      }
    });
  });


  // ─────────────────────────────────────────────
  // 3. ACTIVE NAV LINK HIGHLIGHTING (IntersectionObserver)
  // ─────────────────────────────────────────────
  // As sections scroll into view, the matching nav link gets
  // the class "is-active" so visitors always know where they are.

  const navLinks   = document.querySelectorAll('.site-nav__links a[href^="#"]');
  const navHeight  = nav ? nav.offsetHeight : 80;

  // Build a map of section id → nav link element
  const linkMap = {};
  navLinks.forEach(function (link) {
    const id = link.getAttribute('href').slice(1); // strip the #
    linkMap[id] = link;
  });

  // Observe all sections that have an id matching a nav link
  const observerOptions = {
    rootMargin: `-${navHeight + 10}px 0px -55% 0px`,
    threshold: 0,
  };

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        // Remove active from all links
        navLinks.forEach(function (l) { l.classList.remove('is-active'); });
        // Add active to matching link
        const activeLink = linkMap[entry.target.id];
        if (activeLink) activeLink.classList.add('is-active');
      }
    });
  }, observerOptions);

  Object.keys(linkMap).forEach(function (id) {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });


  // ─────────────────────────────────────────────
  // 4. FAQ ACCORDION
  // ─────────────────────────────────────────────
  // Clicking a question toggles the "is-open" class on the parent .faq__item.
  // CSS in style.css handles the animation (max-height transition).
  //
  // TO ADD A NEW FAQ ITEM:
  //   Copy any <li class="faq__item"> block in index.html and adjust the
  //   question and answer text. No JavaScript changes needed.

  document.querySelectorAll('.faq__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item   = btn.closest('.faq__item');
      const isOpen = item.classList.contains('is-open');

      // Close all other items
      document.querySelectorAll('.faq__item.is-open').forEach(function (openItem) {
        openItem.classList.remove('is-open');
      });

      // Toggle this item – CSS handles the +/– icon switch
      if (!isOpen) {
        item.classList.add('is-open');
      }
    });
  });


  // ─────────────────────────────────────────────
  // 5. SCROLL OFFSET FOR ANCHOR LINKS
  // ─────────────────────────────────────────────
  // Because the nav bar is fixed, clicking an anchor link would normally
  // hide the section heading behind the nav. This adds a negative scroll
  // offset equal to the nav height so sections appear correctly.

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return; // skip empty hrefs
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navH   = nav ? nav.offsetHeight : 0;
      const offset = target.getBoundingClientRect().top + window.scrollY - navH - 8;

      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });


  // ─────────────────────────────────────────────
  // 6. SUBTLE SCROLL REVEAL ANIMATION
  // ─────────────────────────────────────────────
  const revealElements = document.querySelectorAll(
    '.welcome .container, .content-card, .service-card, .methodology__quote, .faq__item, .contact__inner > *'
  );

  revealElements.forEach(function (el) {
    el.classList.add('reveal-on-scroll');
  });

  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target); // Animate once
        }
      });
    },
    {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08,
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });


  // ─────────────────────────────────────────────
  // 7. CONTACT FORM AJAX SUBMISSION (FormSubmit.co)
  // ─────────────────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('contact-submit-btn');
  const statusBox   = document.getElementById('contact-status');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!submitBtn) return;
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';

      if (statusBox) {
        statusBox.style.display = 'none';
        statusBox.className = 'contact__form-status';
      }

      const formData = new FormData(contactForm);

      fetch('https://formsubmit.co/ajax/mail@su-coaching.de', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      })
      .then(function (res) {
        if (!res.ok) throw new Error('Fehler beim Senden');
        return res.json();
      })
      .then(function (data) {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (statusBox) {
          statusBox.textContent = 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Ich melde mich schnellstmöglich bei Ihnen.';
          statusBox.classList.add('is-success');
          statusBox.style.display = 'block';
        }
      })
      .catch(function (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (statusBox) {
          statusBox.textContent = 'Es gab ein Problem beim Senden. Bitte schreiben Sie mir alternativ direkt an mail@su-coaching.de.';
          statusBox.classList.add('is-error');
          statusBox.style.display = 'block';
        }
      });
    });
  }

}); // end DOMContentLoaded
