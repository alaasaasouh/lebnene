/* ═══════════════════════════════════════════════════════════
   LEBNENE — Footer / Contact

   Drives the infinite horizontal marquee in the footer.
   Two identical text spans are placed side-by-side; GSAP
   animates the pair 50% to the left then loops seamlessly.
═══════════════════════════════════════════════════════════ */

function initContact() {
  initMarquee();
}

function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  // Animate the doubled track 50% left then loop — creates an endless scroll.
  // 40 s keeps the pace slow and editorial rather than busy.
  gsap.to(track, {
    xPercent: -50,
    duration: 40,
    ease:     'none',
    repeat:   -1,
  });
}
