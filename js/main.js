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

    // 4. Parallax background mapping with smooth floating inertia (Lerp delay)
    const parallaxWrapper = document.querySelector('.parallax-wrapper');
    let targetParallaxY = 200;
    let currentParallaxY = 200;
    let isParallaxLoopRunning = false;

    function renderParallax() {
      if (!parallaxWrapper) return;
      const diff = targetParallaxY - currentParallaxY;
      currentParallaxY += diff * 0.08;
      parallaxWrapper.style.setProperty('--parallax-y', `${currentParallaxY.toFixed(2)}px`);

      if (Math.abs(diff) > 0.1) {
        requestAnimationFrame(renderParallax);
      } else {
        currentParallaxY = targetParallaxY;
        parallaxWrapper.style.setProperty('--parallax-y', `${currentParallaxY.toFixed(2)}px`);
        isParallaxLoopRunning = false;
      }
    }

    function updateParallaxTarget() {
      if (!parallaxWrapper) return;
      const rect = parallaxWrapper.getBoundingClientRect();
      const wrapperHeight = parallaxWrapper.offsetHeight;
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / (wrapperHeight - windowHeight + 1)));
      targetParallaxY = (1 - progress) * 200;

      if (!isParallaxLoopRunning) {
        isParallaxLoopRunning = true;
        requestAnimationFrame(renderParallax);
      }
    }

    window.addEventListener('scroll', function () {
      updateNavState();
      updateParallaxTarget();
    }, { passive: true });

    window.addEventListener('resize', function () {
      updateNavState();
      updateParallaxTarget();
    }, { passive: true });

    updateNavState();
    updateParallaxTarget();
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
  // 6. SUBTLE SCROLL REVEAL ANIMATIONS (Nur beim Herunterscrollen)
  // ─────────────────────────────────────────────
  try {
    const revealElements = document.querySelectorAll(
      '.welcome .container, .content-card, .service-card, .methodology__quote, .faq__item'
    );

    if (revealElements.length > 0) {
      if ('IntersectionObserver' in window) {
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
            rootMargin: '0px 0px -25px 0px',
            threshold: 0.05,
          }
        );

        revealElements.forEach(function (el) {
          el.classList.add('reveal-on-scroll');
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

      // 2.0s stationary badge with rotating Orca icon (shadow does not rotate)
      const oldLoader = document.querySelector('.calendly-orca-loader');
      if (oldLoader && oldLoader.parentNode) oldLoader.parentNode.removeChild(oldLoader);

      const loader = document.createElement('div');
      loader.className = 'calendly-orca-loader';
      loader.innerHTML = '<svg viewBox="0 0 14.88724 12.577273" class="calendly-orca-icon" aria-hidden="true"><g transform="translate(-45.765321,-60.049142)"><path fill="#1d3d52" d="m 52.454992,72.564861 c -0.416436,-0.06594 -0.859345,-0.168492 -1.140965,-0.264188 -0.693559,-0.235676 -1.609765,-0.778151 -2.117368,-1.253671 -0.175363,-0.164281 -0.187026,-0.192742 -0.121255,-0.295915 0.04921,-0.07719 0.04182,-0.08165 0.488589,0.294802 0.382849,0.322591 1.067162,0.735329 1.538184,0.927744 1.088318,0.444584 2.482233,0.521519 3.673383,0.202746 1.362252,-0.364563 2.604727,-1.277467 3.43031,-2.520407 0.181807,-0.273717 0.61939,-1.149607 0.589508,-1.179994 -0.0081,-0.0083 -0.169336,0.04522 -0.358129,0.118967 -0.999263,0.390348 -1.976466,0.493704 -2.941114,0.311079 -0.260684,-0.04935 -0.849175,-0.191673 -1.307754,-0.316266 -0.778383,-0.211483 -0.867314,-0.22652 -1.33844,-0.226313 -0.571488,2.49e-4 -0.812094,0.04471 -1.532816,0.283259 -0.622651,0.206084 -1.030307,0.279811 -1.374559,0.248596 -0.298856,-0.0271 -0.377238,-0.07543 -0.28,-0.172678 0.04734,-0.04734 0.1265,-0.05978 0.284073,-0.04464 0.302815,0.02909 0.708369,-0.04951 1.407034,-0.2727 1.15657,-0.369479 1.61071,-0.373939 2.900532,-0.02849 1.521667,0.407539 2.027516,0.464976 2.923421,0.331948 0.506167,-0.07515 0.968911,-0.213845 1.440445,-0.431707 0.350511,-0.161945 0.336715,-0.138378 0.491163,-0.839129 0.0594,-0.26953 0.07789,-0.559865 0.07961,-1.250067 0.002,-0.813108 0.0094,-0.900384 0.07746,-0.913494 0.119452,-0.02301 0.144251,0.161357 0.143446,1.066478 -9.62e-4,1.156728 -0.135188,1.742263 -0.633443,2.764646 -0.898066,1.84277 -2.536129,3.077686 -4.538817,3.421762 -0.357549,0.06143 -1.482244,0.08517 -1.782495,0.03763 z m -4.484414,-1.320088 c -0.01638,-0.330028 -0.04305,-0.436386 -0.189809,-0.756987 -0.129978,-0.283933 -0.175048,-0.443742 -0.188738,-0.669219 -0.01557,-0.256557 -0.02926,-0.296212 -0.102208,-0.296212 -0.15784,0 -0.407385,-0.134838 -0.666265,-0.360004 -0.326843,-0.284278 -0.526477,-0.386011 -0.757485,-0.386011 -0.343647,0 -0.355159,-0.177064 -0.0257,-0.395288 0.459961,-0.304666 0.90711,-0.328679 1.655614,-0.08891 0.82527,0.264359 0.907968,0.207115 1.474874,-1.020923 0.605655,-1.311974 0.968566,-1.897423 1.585066,-2.557027 0.422377,-0.451909 0.80752,-0.761995 1.454406,-1.170974 0.555089,-0.350941 0.623701,-0.456288 0.575375,-0.883435 -0.04164,-0.368091 -0.223282,-0.915901 -0.426861,-1.287398 -0.215434,-0.393131 -0.211195,-0.51151 0.019,-0.530573 0.199865,-0.01655 0.632407,0.08993 0.943444,0.232262 0.375131,0.171657 0.709909,0.415074 1.153738,0.83888 0.267933,0.255847 0.478779,0.419387 0.586563,0.454958 0.199061,0.06569 0.465938,0.04299 1.277073,-0.108648 1.55282,-0.290293 2.050513,-0.314919 2.751734,-0.136151 0.545835,0.139152 1.163276,0.424139 1.213588,0.560146 0.05447,0.147252 0.01038,0.25518 -0.142795,0.349475 -0.163322,0.100544 -0.81901,0.316199 -1.200065,0.394699 -0.272689,0.05617 -0.27514,0.05578 -0.586756,-0.0949 -0.357487,-0.172858 -0.608388,-0.191993 -0.926161,-0.07064 -0.240338,0.09179 -0.452419,0.300582 -0.412082,0.4057 0.0245,0.06384 0.07167,0.07102 0.323855,0.04924 0.162348,-0.01401 0.381589,-0.05633 0.487201,-0.09405 0.261174,-0.09326 0.471919,-0.08611 0.6225,0.02111 0.114387,0.08145 0.137148,0.08389 0.248133,0.02656 0.06721,-0.03471 0.329542,-0.127201 0.582968,-0.205526 0.253425,-0.07833 0.560195,-0.186051 0.681711,-0.239385 0.203193,-0.08919 0.423665,-0.289403 0.469861,-0.426694 0.03274,-0.0973 0.164925,0.0488 0.164925,0.182291 0,0.382576 -0.359208,1.012798 -0.87586,1.536674 -0.542878,0.550472 -1.404777,1.137551 -2.008063,1.367785 l -0.27287,0.104137 -0.04722,0.241358 c -0.14764,0.754681 -0.555509,1.484012 -1.021938,1.827377 -0.272156,0.200351 -0.459784,0.242959 -0.556535,0.126381 -0.02961,-0.03568 -0.09548,-0.401506 -0.146368,-0.812949 -0.07823,-0.632506 -0.10295,-0.744026 -0.15998,-0.721853 -0.238176,0.0926 -1.058066,0.249595 -1.713073,0.328011 -1.410361,0.168849 -2.268527,0.384962 -3.028822,0.76275 -0.531565,0.264132 -0.98545,0.585871 -1.323673,0.938291 -0.403564,0.420503 -0.48471,0.613772 -0.524403,1.249007 -0.01779,0.284716 -0.06477,0.629171 -0.104383,0.765457 -0.131553,0.452529 -0.515265,0.93517 -0.743484,0.93517 -0.09623,0 -0.101868,-0.01803 -0.12003,-0.383979 z m 0.435306,-0.175617 c 0.205586,-0.30221 0.26682,-0.533228 0.311269,-1.174328 0.03402,-0.490688 0.05674,-0.604897 0.16149,-0.811841 0.325866,-0.643775 1.152286,-1.286084 2.224453,-1.728888 0.513727,-0.212168 1.48281,-0.444687 2.218466,-0.532293 0.872321,-0.103879 1.614699,-0.225994 1.941958,-0.319432 l 0.285242,-0.08145 0.01321,-0.276173 0.01321,-0.276172 -0.144864,0.09665 c -0.267625,0.178551 -0.672699,0.352797 -0.931287,0.400598 -0.324484,0.05999 -0.555911,0.0275 -1.271956,-0.178516 -0.679986,-0.195647 -1.015763,-0.240092 -1.339362,-0.177286 -0.405354,0.07867 -0.692404,0.240153 -1.020339,0.573994 -0.166588,0.169589 -0.321842,0.296627 -0.345011,0.282308 -0.09489,-0.05865 -0.0287,-0.205882 0.20701,-0.46048 0.292578,-0.316019 0.63238,-0.503641 1.08417,-0.598623 0.410043,-0.0862 0.736488,-0.0498 1.43411,0.159899 0.303221,0.09115 0.652426,0.179632 0.776011,0.19663 0.48207,0.0663 1.042823,-0.150627 1.529533,-0.591704 0.335016,-0.303604 0.462597,-0.354022 0.594285,-0.234846 0.138164,0.125037 0.09078,0.425879 -0.138226,0.877517 l -0.187929,0.370633 0.07556,0.623746 c 0.08825,0.728583 0.107005,0.821222 0.166244,0.821222 0.08923,0 0.683503,-0.643176 0.790662,-0.855725 0.175809,-0.348713 0.329763,-0.877868 0.42714,-1.46811 0.12365,-0.749494 0.313663,-1.144735 0.746745,-1.553284 0.415351,-0.391821 0.358469,-0.470008 -0.211867,-0.291226 -0.375263,0.117631 -0.748412,0.116078 -0.90075,-0.0038 -0.374326,-0.294444 0.23962,-0.875944 0.940011,-0.890331 0.189193,-0.0038 0.312792,0.02679 0.55187,0.136993 0.290739,0.13401 0.321884,0.13945 0.553429,0.09665 0.291872,-0.05395 0.984141,-0.282761 1.069266,-0.353408 0.03304,-0.02742 0.04902,-0.06774 0.03552,-0.0896 -0.04807,-0.07778 -0.449499,-0.253791 -0.856168,-0.375395 -0.371362,-0.111047 -0.476813,-0.123347 -1.049165,-0.122377 -0.555579,9.63e-4 -0.75044,0.02294 -1.535914,0.173374 -1.037106,0.198626 -1.511079,0.223826 -1.755331,0.09333 -0.08447,-0.04513 -0.312306,-0.233808 -0.506291,-0.419272 -0.369607,-0.353376 -0.755251,-0.636167 -1.111691,-0.815198 -0.230079,-0.115559 -0.751713,-0.253234 -0.751713,-0.198397 0,0.01866 0.07861,0.201669 0.174693,0.406701 0.192944,0.411733 0.351124,1.000763 0.351597,1.309284 2.49e-4,0.127456 -0.04078,0.282287 -0.113149,0.427508 -0.101005,0.202694 -0.15759,0.253655 -0.515628,0.46439 -0.591307,0.348032 -0.922127,0.605689 -1.399885,1.090295 -0.626004,0.634976 -1.068702,1.335207 -1.616816,2.557371 -0.463526,1.03355 -0.643692,1.249918 -1.070248,1.285291 -0.173056,0.01435 -0.328296,-0.01481 -0.662269,-0.124417 -0.525418,-0.172432 -0.986045,-0.197591 -1.27001,-0.06936 l -0.175533,0.07927 0.219417,0.09887 c 0.120679,0.05438 0.328027,0.192489 0.460774,0.306916 0.280084,0.24143 0.521901,0.37625 0.674853,0.37625 0.224641,0 0.246696,0.03227 0.246696,0.360937 0,0.266192 0.02434,0.36168 0.180577,0.708409 0.116276,0.258042 0.188764,0.490596 0.203569,0.653073 0.01264,0.138781 0.03506,0.252291 0.04981,0.252243 0.01475,-4.5e-5 0.0906,-0.09385 0.168561,-0.208444 z m 7.587815,-5.406142 c 0.01746,-0.08728 0.0092,-0.134037 -0.02365,-0.134037 -0.06639,0 -0.134963,0.186519 -0.160204,0.435783 l -0.02031,0.200525 0.08868,-0.184118 c 0.04877,-0.101263 0.100738,-0.244433 0.115482,-0.318153 z m 1.979064,-0.128222 c 0.915175,-0.461979 1.919147,-1.372553 2.265977,-2.055178 0.09712,-0.191156 0.09241,-0.197961 -0.07127,-0.102817 -0.07844,0.0456 -0.379591,0.161433 -0.669221,0.257406 -0.28963,0.09597 -0.605143,0.208247 -0.701143,0.249497 -0.415859,0.178689 -0.816087,0.545939 -1.027837,0.943146 -0.120408,0.225863 -0.267707,0.693555 -0.267707,0.85 0,0.08166 0.06957,0.06069 0.471195,-0.142054 z m -10.733909,2.28727 c -0.211317,-0.39485 -0.266536,-1.914683 -0.09876,-2.718243 0.40393,-1.93461 1.631491,-3.512634 3.427918,-4.40657 2.071309,-1.03072 4.695578,-0.741042 6.525087,0.72027 0.307072,0.245272 0.352261,0.317519 0.237143,0.379128 -0.06474,0.03465 -0.13611,-0.0015 -0.368638,-0.18681 -1.813374,-1.445034 -4.330078,-1.703066 -6.381783,-0.654309 -1.700504,0.869236 -2.853872,2.400384 -3.221492,4.276674 -0.122844,0.626983 -0.128907,1.406532 -0.01579,2.030165 0.04378,0.241357 0.08145,0.477711 0.08371,0.525229 0.0054,0.113995 -0.131367,0.139155 -0.187393,0.03447 z"/></g></svg>';
      document.body.appendChild(loader);

      setTimeout(function () {
        loader.classList.add('is-hidden');
        setTimeout(function () {
          if (loader.parentNode) loader.parentNode.removeChild(loader);
        }, 380);
      }, 2000);

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
  } catch (err) {
    console.error('Calendly popup error:', err);
  }

  // ─────────────────────────────────────────────
  // 9. REVIEWS SLIDER (Kundenstimmen)
  // ─────────────────────────────────────────────
  try {
    const track = document.getElementById('reviews-track');
    const dotsContainer = document.getElementById('reviews-dots');
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');
    const sliderContainer = document.getElementById('reviews-slider');

    const reviews = (window.REVIEWS_DATA && window.REVIEWS_DATA.length > 0)
      ? window.REVIEWS_DATA
      : [
          {
            author: "Vanessa Neumann",
            role: "Klientin",
            rating: 5,
            text: "Ich kann die Zusammenarbeit mit Sarah unbedingt empfehlen 💗 Die Auswahl der Methoden, eine Begleitung auf Augenhöhe, ein gemeinsamer Prozess, das Finden guter Lösungen. Sarah hat die Fähigkeit zu Wertschätzung und Empathie, auch deswegen konnte ich Perspektiven dazugewinnen und konkrete Fortschritte erkennen. Ich freue mich schon auf eine nächste Zusammenarbeit 🥂❗"
          },
          {
            author: "Ralph Burterdinger",
            role: "Klient",
            rating: 5,
            text: "Ich habe das systemische Coaching genutzt, um mein Team durch eine Phase der Restrukturierung zu führen und einige verfahrene Konflikte zu lösen. Frau Unke war dabei eine Sparringspartnerin auf Augenhöhe. Anstatt lange um den heißen Brei herumzureden, ging es direkt analytisch und strukturiert zur Sache. Besonders geholfen hat mir der systemische Ansatz: Probleme im Team wurden nicht isoliert betrachtet, sondern im Kontext des gesamten Unternehmens. Das hat den Blick auf die tatsächlichen Ursachen von Blockaden extrem geschärft.\nDie Ergebnisse lassen sich im Führungsalltag direkt umsetzen. Die Kommunikation im Team läuft spürbar runder, Entscheidungen fallen schneller und Konflikte werden sachlich geklärt. Keine theoretischen Vorträge, sondern handfeste Werkzeuge. Kann ich jeder Führungskraft, die nach pragmatischen Lösungen sucht, nur empfehlen."
          },
          {
            author: "Janine Peterson",
            role: "Klientin",
            rating: 5,
            text: "Die Zusammenarbeit mit Frau Unke war für mich eine absolute Bereicherung. Vom ersten Moment an habe ich mich bei ihr unglaublich sicher, verstanden und gut aufgehoben gefühlt. Mit ihrer empathischen, einfühlsamen und gleichzeitig hochprofessionellen Art schafft sie einen Raum, in dem man sich wunderbar öffnen kann. Dank ihrer systemischen Impulse konnte ich festgefahrene Muster erkennen und ganz neue, wertvolle Perspektiven für mich gewinnen. Ich bin ihr unglaublich dankbar für die Unterstützung und kann sie von ganzem Herzen jedem weiterempfehlen, der echte Veränderung sucht!"
          },
          {
            author: "Yvonne Wahnschaap",
            role: "Klientin",
            rating: 5,
            text: "Ich habe eine wunderbare Lebensreise mit Sarah's Hilfe begonnen. Ich bin in ein anderes Bundesland gezogen und habe gleichzeitig den Job gewechselt. Sarah hat mich auf meinem Weg begleitet. Sie hat mich bestärkt immer weiter zu gehen und mich nicht von äußeren Umständen verunsichern zu lassen. Ich habe mich oft verloren gefühlt und an meiner Entscheidung gezweifelt. Durch den regelmässigen Austausch mit Sarah habe ich nicht aufgegeben. Sie hat mich dazu gebracht Mittel und Wege zu finden um meine Ziele zu erreichen. Ihre Mantras begleiten mich noch immer. Ich danke Sarah sehr für ihr Coaching."
          }
        ];

    if (track && dotsContainer) {
      track.innerHTML = '';
      dotsContainer.innerHTML = '';

      let currentIndex = 0;
      const totalSlides = reviews.length;
      let autoScrollTimer = null;
      let userHasInteracted = false;
      const AUTO_SCROLL_DELAY = 5000; // 5 seconds per slide

      function formatReviewText(fullText, maxChars = 290) {
        const safeText = fullText.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (safeText.length <= maxChars) {
          return {
            isLong: false,
            html: `<p class="review-text">${safeText}</p>`
          };
        }

        const sentenceBreakRegex = /([.!?]\s+)/g;
        let match;
        let cutIndex = -1;
        while ((match = sentenceBreakRegex.exec(safeText)) !== null) {
          const end = match.index + 1;
          if (end >= 190 && end <= 330) {
            cutIndex = end;
            break;
          }
          if (end > 330 && cutIndex !== -1) {
            break;
          }
          if (end < 190) {
            cutIndex = end;
          }
        }

        if (cutIndex === -1 || cutIndex > 360) {
          cutIndex = safeText.lastIndexOf(' ', maxChars);
          if (cutIndex === -1) cutIndex = maxChars;
        }

        const visiblePart = safeText.slice(0, cutIndex).trim();
        const hiddenPart = safeText.slice(cutIndex).trim();

        return {
          isLong: true,
          html: `
            <p class="review-text">
              <span>${visiblePart}</span><span class="review-text-more" style="display:none;"> ${hiddenPart}</span>
              <button type="button" class="review-toggle-btn" aria-expanded="false">Weiterlesen</button>
            </p>
          `
        };
      }

      reviews.forEach(function (rev, idx) {
        const slide = document.createElement('div');
        slide.className = 'review-slide';
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-label', `Bewertung ${idx + 1} von ${totalSlides}`);

        const lucideStarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        const count = rev.rating || 5;
        let starsHtml = '';
        for (let i = 0; i < count; i++) {
          starsHtml += lucideStarSvg;
        }

        const textObj = formatReviewText(rev.text);

        slide.innerHTML = `
          <div class="review-card">
            <div class="review-header">
              <div class="review-stars" aria-label="${rev.rating || 5} von 5 Sternen">${starsHtml}</div>
              <svg class="review-quote-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/>
              </svg>
            </div>
            ${textObj.html}
            <div class="review-footer">
              <div class="review-author">${rev.author}</div>
              ${rev.role ? `<div class="review-role">${rev.role}</div>` : ''}
            </div>
          </div>
        `;
        track.appendChild(slide);

        const toggleBtn = slide.querySelector('.review-toggle-btn');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            onUserAction();
            const moreSpan = slide.querySelector('.review-text-more');
            const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
              if (moreSpan) moreSpan.style.display = 'none';
              toggleBtn.setAttribute('aria-expanded', 'false');
              toggleBtn.textContent = 'Weiterlesen';
            } else {
              if (moreSpan) moreSpan.style.display = 'inline';
              toggleBtn.setAttribute('aria-expanded', 'true');
              toggleBtn.textContent = 'Weniger anzeigen';
            }
          });
        }

        const dot = document.createElement('button');
        dot.className = 'reviews-dot' + (idx === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', `Zu Bewertung ${idx + 1} springen`);
        dot.addEventListener('click', function () {
          onUserAction();
          goToSlide(idx);
        });
        dotsContainer.appendChild(dot);
      });

      function updateDots() {
        const dots = dotsContainer.querySelectorAll('.reviews-dot');
        dots.forEach(function (d, i) {
          d.classList.toggle('is-active', i === currentIndex);
        });
      }

      function goToSlide(index, mode) {
        if (totalSlides <= 0) return;
        let targetIndex = index;
        if (targetIndex < 0) {
          targetIndex = totalSlides - 1;
        } else if (targetIndex >= totalSlides) {
          targetIndex = 0;
        }

        if (mode === 'fade') {
          const currentSlide = track.children[currentIndex];
          if (currentSlide) {
            currentSlide.classList.add('is-fading');
          }
          setTimeout(function () {
            track.style.transition = 'none';
            currentIndex = targetIndex;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots();

            const nextSlide = track.children[currentIndex];
            if (nextSlide) {
              nextSlide.classList.add('is-fading');
              void nextSlide.offsetWidth;
              nextSlide.classList.remove('is-fading');
            }
            if (currentSlide && currentSlide !== nextSlide) {
              currentSlide.classList.remove('is-fading');
            }
          }, 360);
        } else {
          track.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
          currentIndex = targetIndex;
          track.style.transform = `translateX(-${currentIndex * 100}%)`;
          updateDots();
        }
      }

      function onUserAction() {
        userHasInteracted = true;
        stopAutoScroll();
      }

      function startAutoScroll() {
        stopAutoScroll();
        if (userHasInteracted || totalSlides <= 1) return;
        autoScrollTimer = setInterval(function () {
          if (!userHasInteracted) {
            goToSlide(currentIndex + 1, 'fade');
          } else {
            stopAutoScroll();
          }
        }, AUTO_SCROLL_DELAY);
      }

      function stopAutoScroll() {
        if (autoScrollTimer) {
          clearInterval(autoScrollTimer);
          autoScrollTimer = null;
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          onUserAction();
          goToSlide(currentIndex - 1, 'slide');
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          onUserAction();
          goToSlide(currentIndex + 1, 'slide');
        });
      }

      // Touch swipe support (horizontal)
      let touchStartX = 0;
      let touchStartY = 0;
      let isHorizontalSwipe = false;

      if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', function (e) {
          onUserAction();
          if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isHorizontalSwipe = false;
          }
        }, { passive: true });

        sliderContainer.addEventListener('touchmove', function (e) {
          if (e.touches.length === 1) {
            const diffX = Math.abs(e.touches[0].clientX - touchStartX);
            const diffY = Math.abs(e.touches[0].clientY - touchStartY);
            if (diffX > diffY && diffX > 10) {
              isHorizontalSwipe = true;
            }
          }
        }, { passive: true });

        sliderContainer.addEventListener('touchend', function (e) {
          if (isHorizontalSwipe && e.changedTouches.length === 1) {
            const endX = e.changedTouches[0].clientX;
            const diffX = endX - touchStartX;
            if (Math.abs(diffX) > 35) {
              if (diffX > 0) {
                goToSlide(currentIndex - 1);
              } else {
                goToSlide(currentIndex + 1);
              }
            }
          }
        }, { passive: true });

        sliderContainer.addEventListener('mousedown', function () {
          onUserAction();
        });
      }

      // Start automatic scrolling initially
      startAutoScroll();
    }
  } catch (err) {
    console.error('Reviews slider error:', err);
  }
}

// Ensure execution whether DOM is loading or already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSarahWebsite);
} else {
  initSarahWebsite();
}
