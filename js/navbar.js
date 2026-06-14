/* ═══════════════════════════════════════════════════════════
   LEBNENE — Navbar

   Floating pill navbar with:
   • Scroll shadow that appears once the user has scrolled
   • Active-link highlighting based on which section is in view
   • Smooth-scroll for in-page anchor links
   • Mobile overlay menu with GSAP stagger entrance
═══════════════════════════════════════════════════════════ */

function initNavbar() {
  const navbar      = document.getElementById('navbar');
  const pill        = document.getElementById('navbar-pill');
  const links       = document.querySelectorAll('.nav-link');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-menu-close');

  // Fade navbar in after load — slight delay avoids clash with hero entrance
  setTimeout(() => {
    navbar.style.transition = 'opacity 0.8s ease';
    navbar.style.opacity    = '1';
  }, 200);

  /* ── Scroll: shadow + active link ──────────────────────── */
  window.addEventListener('scroll', () => {
    // Add depth shadow once user has scrolled — signals navbar is floating
    pill.style.boxShadow = window.scrollY > 80
      ? '0 4px 32px rgba(0,0,0,0.5)'
      : 'none';
    updateActiveLink();
  }, { passive: true });

  // Highlight the nav link whose section is currently in view
  function updateActiveLink() {
    const sections = [
      ['hero',    'home'],
      ['menu',    'menu'],
      ['story',   'story'],
      ['gallery', 'gallery'],
    ];

    // Iterate from bottom so the topmost-visible section wins
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i][0]);
      if (!el) continue;
      if (window.scrollY >= el.offsetTop - 140) {
        links.forEach(l => l.classList.toggle('active', l.dataset.nav === sections[i][1]));
        break;
      }
    }
  }

  /* ── Smooth scroll for all in-page anchor links ─────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ── Mobile menu ─────────────────────────────────────────── */

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.style.display  = 'flex';
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');

    // rAF ensures display:flex is applied before the opacity transition
    requestAnimationFrame(() => {
      mobileMenu.classList.add('is-open');
      // Stagger nav links in from the left
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          '.mobile-nav-item',
          { x: -32, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, duration: 0.42, stagger: 0.065, ease: 'power3.out', delay: 0.08 }
        );
      }
    });
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');

    setTimeout(() => {
      mobileMenu.style.display  = 'none';
      document.body.style.overflow = '';
      // Clear GSAP inline styles so the stagger can re-run next open
      if (typeof gsap !== 'undefined') gsap.set('.mobile-nav-item', { clearProps: 'all' });
    }, 290);
  }

  hamburger?.addEventListener('click', openMobileMenu);
  mobileClose?.addEventListener('click', closeMobileMenu);

  // Close on any link or modal-trigger tap inside the overlay
  mobileMenu?.querySelectorAll('.mobile-nav-item, [data-modal]').forEach(el => {
    el.addEventListener('click', closeMobileMenu);
  });

  // Escape key closes the menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu?.style.display === 'flex') closeMobileMenu();
  });
}
