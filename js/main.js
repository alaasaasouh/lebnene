/* ═══════════════════════════════════════════════════════════
   LEBNENE — Entry point

   Boot order:
   1. Loading screen runs its animation
   2. On complete → Lenis (must be first so ScrollTrigger
      reads Lenis scroll values, not native scroll)
   3. All page modules initialise in sequence
   4. ScrollTrigger.refresh() recalculates positions once
      the DOM has fully settled (gallery pin + hero canvas
      both depend on accurate section heights)
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  initLoading(() => {
    initLenis();
    initModals();
    initNavbar();
    initHero();
    initMenu();
    initGallery();
    initContact();

    // Refresh after a short tick — ensures pinned elements and
    // fixed-position canvas are measured at their final sizes
    setTimeout(() => ScrollTrigger.refresh(true), 320);
  });

});

/* ─────────────────────────────────────────────────────────
   Lenis smooth scroll
   Drives a silky RAF-based scroll loop and feeds its
   position into GSAP's ticker so all ScrollTriggers stay
   in perfect sync with smooth-scrolled values.
───────────────────────────────────────────────────────── */
function initLenis() {
  if (typeof Lenis === 'undefined' || typeof gsap === 'undefined') return;

  const lenis = new Lenis({
    duration:       1.2,
    // Expo ease-out: snappy acceleration, smooth coast to rest
    easing:         t => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    smoothWheel:    true,
    wheelMultiplier: 1,
    touchMultiplier: 1.8,
    infinite:       false,
  });

  // Keep GSAP's ticker and Lenis in lockstep
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
