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
  document.documentElement.classList.add('js-animated');

  // ─────────────────────────────────────────────
  // 1. NAVIGATION: SHRINK, PROGRESS & LOGO REVEAL
  // ─────────────────────────────────────────────
  try {
    const nav = document.querySelector('.site-nav');
    const heroCard = document.querySelector('.hero__card');
    const progressBar = document.getElementById('scroll-progress');
    const SCROLL_THRESHOLD = 30;

    if (heroCard) {
      document.body.classList.add('has-hero');
    }

    function updateNavState() {
      const scrollY = window.scrollY || window.pageYOffset;

      if (nav) {
        // 1. Shrink nav & shadow
        if (scrollY > SCROLL_THRESHOLD) {
          nav.classList.add('nav--scrolled');
        } else {
          nav.classList.remove('nav--scrolled');
        }

        // 2. Show logo in top nav ONLY when hero header card is scrolled out of view
        if (heroCard) {
          const rect = heroCard.getBoundingClientRect();
          const navHeight = nav.offsetHeight || 55;
          if (rect.bottom <= navHeight + 10) {
            nav.classList.add('nav--show-logo');
          } else {
            nav.classList.remove('nav--show-logo');
          }
        } else {
          nav.classList.add('nav--show-logo');
        }
      }

      // 3. Scroll progress indicator
      if (progressBar) {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const pct = (scrollY / totalHeight) * 100;
          progressBar.style.width = Math.min(100, Math.max(0, pct)) + '%';
        }
      }
    }

    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', updateNavState, { passive: true });
    updateNavState();
  } catch (err) {
    console.error('Nav state error:', err);
  }


  // ─────────────────────────────────────────────
  // 2. MOBILE HAMBURGER MENU
  // ─────────────────────────────────────────────
  try {
    const nav = document.querySelector('.site-nav');
    const navToggle = document.querySelector('.site-nav__toggle');
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const closeIcon     = document.getElementById('close-icon');

    if (navToggle && nav) {
      function toggleMenu(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        const isOpen = nav.classList.toggle('nav--open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (hamburgerIcon && closeIcon) {
          hamburgerIcon.style.display = isOpen ? 'none'  : 'block';
          closeIcon.style.display     = isOpen ? 'block' : 'none';
        }
      }

      navToggle.addEventListener('click', toggleMenu);

      // Close mobile menu when clicking on a nav link
      document.querySelectorAll('.site-nav__links a').forEach(function (link) {
        link.addEventListener('click', function () {
          nav.classList.remove('nav--open');
          navToggle.setAttribute('aria-expanded', 'false');
          if (hamburgerIcon && closeIcon) {
            hamburgerIcon.style.display = 'block';
            closeIcon.style.display     = 'none';
          }
        });
      });

      // Close menu on click outside
      document.addEventListener('click', function (e) {
        if (nav.classList.contains('nav--open') && !nav.contains(e.target)) {
          nav.classList.remove('nav--open');
          navToggle.setAttribute('aria-expanded', 'false');
          if (hamburgerIcon && closeIcon) {
            hamburgerIcon.style.display = 'block';
            closeIcon.style.display     = 'none';
          }
        }
      });
    }
  } catch (err) {
    console.error('Mobile menu error:', err);
  }


  // ─────────────────────────────────────────────
  // 3. ACTIVE NAV LINK HIGHLIGHTING
  // ─────────────────────────────────────────────
  try {
    const nav = document.querySelector('.site-nav');
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
  } catch (err) {
    console.error('Active nav link error:', err);
  }


  // ─────────────────────────────────────────────
  // 4. FAQ ACCORDION (Expand / Collapse)
  // ─────────────────────────────────────────────
  try {
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
  } catch (err) {
    console.error('FAQ error:', err);
  }


  // ─────────────────────────────────────────────
  // 5. SMOOTH SCROLL OFFSET FOR ANCHORS
  // ─────────────────────────────────────────────
  try {
    const nav = document.querySelector('.site-nav');
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
  } catch (err) {
    console.error('Smooth scroll error:', err);
  }


  // ─────────────────────────────────────────────
  // 6. SUBTLE SCROLL REVEAL ANIMATIONS
  // ─────────────────────────────────────────────
  try {
    const revealElements = document.querySelectorAll(
      '.welcome .container, .content-card, .service-card, .methodology__quote, .faq__item, .contact__inner > *'
    );

    if (revealElements.length > 0) {
      if ('IntersectionObserver' in window) {
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
            rootMargin: '0px 0px -10px 0px',
            threshold: 0,
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
    }
  } catch (err) {
    console.error('Reveal animation error:', err);
  }


  // ─────────────────────────────────────────────
  // 7. CONTACT FORM AJAX SUBMISSION (FormSubmit)
  // ─────────────────────────────────────────────
  try {
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
  } catch (err) {
    console.error('Contact form error:', err);
  }

  // ─────────────────────────────────────────────
  // 8. CALENDLY POPUP OVERLAY
  // ─────────────────────────────────────────────
  try {
    const openBtn = document.getElementById('open-calendly-btn');
    const CALENDLY_URL = 'https://calendly.com/sarah-unke/erstes-kennenlerngesprach';

    function triggerCalendly(e) {
      if (e) e.preventDefault();

      // 1.5s animated loading indicator
      document.body.classList.add('calendly-is-loading');
      setTimeout(function () {
        document.body.classList.remove('calendly-is-loading');
      }, 1500);

      if (window.Calendly) {
        window.Calendly.initPopupWidget({ url: CALENDLY_URL });
      } else {
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.onload = function() {
          if (window.Calendly) {
            window.Calendly.initPopupWidget({ url: CALENDLY_URL });
          } else {
            window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
          }
        };
        script.onerror = function() {
          window.open(CALENDLY_URL, '_blank', 'noopener,noreferrer');
        };
        document.body.appendChild(script);
      }
    }

    if (openBtn) {
      openBtn.addEventListener('click', triggerCalendly);
    }
  } catch (e) {
    console.error('Calendly overlay error:', e);
  }
}

// Ensure execution whether DOM is loading or already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSarahWebsite);
} else {
  initSarahWebsite();
}
