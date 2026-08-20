/* =============================================================
   SARAH UNKE COACHING – Main JavaScript
   =============================================================

   This file handles:
   1. Navigation shrink-on-scroll (adds .nav--scrolled class)
   2. Mobile hamburger menu toggle
   3. Active link highlighting as you scroll through sections
   4. FAQ accordion (expand / collapse answers)
   5. Smooth scroll offset correction
   6. Subtle scroll reveal animations
   7. Contact form AJAX submission (FormSubmit)

   ============================================================= */

function initSarahWebsite() {

  // ─────────────────────────────────────────────
  // 1. NAVIGATION: SHRINK ON SCROLL
  // ─────────────────────────────────────────────
  const nav = document.querySelector('.site-nav');
  const SCROLL_THRESHOLD = 40;

  function updateNavOnScroll() {
    if (!nav) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', updateNavOnScroll, { passive: true });
  updateNavOnScroll();


  // ─────────────────────────────────────────────
  // 2. MOBILE HAMBURGER MENU
  // ─────────────────────────────────────────────
  const navToggle = document.querySelector('.site-nav__toggle');
  const hamburgerIcon = document.getElementById('hamburger-icon');
  const closeIcon     = document.getElementById('close-icon');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = nav.classList.toggle('nav--open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (hamburgerIcon && closeIcon) {
        hamburgerIcon.style.display = isOpen ? 'none'  : 'block';
        closeIcon.style.display     = isOpen ? 'block' : 'none';
      }
    });
  }

  // Close mobile menu when clicking outside or on a nav link
  document.querySelectorAll('.site-nav__links a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (nav) nav.classList.remove('nav--open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      if (hamburgerIcon && closeIcon) {
        hamburgerIcon.style.display = 'block';
        closeIcon.style.display     = 'none';
      }
    });
  });

  document.addEventListener('click', function (e) {
    if (nav && nav.classList.contains('nav--open') && !nav.contains(e.target)) {
      nav.classList.remove('nav--open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
      if (hamburgerIcon && closeIcon) {
        hamburgerIcon.style.display = 'block';
        closeIcon.style.display     = 'none';
      }
    }
  });


  // ─────────────────────────────────────────────
  // 3. ACTIVE NAV LINK HIGHLIGHTING
  // ─────────────────────────────────────────────
  const navLinks  = document.querySelectorAll('.site-nav__links a[href^="#"]');
  const navHeight = nav ? nav.offsetHeight : 60;

  const linkMap = {};
  navLinks.forEach(function (link) {
    const id = link.getAttribute('href').slice(1);
    if (id) linkMap[id] = link;
  });

  if ('IntersectionObserver' in window && Object.keys(linkMap).length > 0) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('is-active'); });
            const activeLink = linkMap[entry.target.id];
            if (activeLink) activeLink.classList.add('is-active');
          }
        });
      },
      {
        rootMargin: `-${navHeight + 10}px 0px -55% 0px`,
        threshold: 0,
      }
    );

    Object.keys(linkMap).forEach(function (id) {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }


  // ─────────────────────────────────────────────
  // 4. FAQ ACCORDION (Expand / Collapse)
  // ─────────────────────────────────────────────
  const faqQuestions = document.querySelectorAll('.faq__question');

  faqQuestions.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const item   = btn.closest('.faq__item');
      if (!item) return;
      const isOpen = item.classList.contains('is-open');

      // Close other open FAQ items
      document.querySelectorAll('.faq__item.is-open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('is-open');
          const otherBtn = openItem.querySelector('.faq__question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });


  // ─────────────────────────────────────────────
  // 5. SMOOTH SCROLL OFFSET FOR ANCHORS
  // ─────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navH   = nav ? nav.offsetHeight : 50;
      const offset = target.getBoundingClientRect().top + window.scrollY - navH - 8;

      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });


  // ─────────────────────────────────────────────
  // 6. SUBTLE SCROLL REVEAL ANIMATIONS
  // ─────────────────────────────────────────────
  const revealElements = document.querySelectorAll(
    '.welcome .container, .content-card, .service-card, .methodology__quote, .faq__item, .contact__inner > *'
  );

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    revealElements.forEach(function (el) {
      el.classList.add('reveal-on-scroll');
    });

    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05,
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback if no IntersectionObserver
    revealElements.forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }


  // ─────────────────────────────────────────────
  // 7. CONTACT FORM AJAX SUBMISSION (FormSubmit)
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

      fetch('https://formsubmit.co/ajax/coaching@sarah-unke.de', {
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
      .then(function () {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (statusBox) {
          statusBox.textContent = 'Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet. Ich melde mich schnellstmöglich bei Ihnen.';
          statusBox.classList.add('is-success');
          statusBox.style.display = 'block';
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;

        if (statusBox) {
          statusBox.textContent = 'Es gab ein Problem beim Senden. Bitte schreiben Sie mir alternativ direkt an coaching@sarah-unke.de.';
          statusBox.classList.add('is-error');
          statusBox.style.display = 'block';
        }
      });
    });
  }
}

// Ensure execution whether DOM is loading or already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSarahWebsite);
} else {
  initSarahWebsite();
}
