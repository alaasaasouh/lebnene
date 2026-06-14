/* ═══════════════════════════════════════════════════════════
   LEBNENE — Menu & scroll animations

   Drives scroll-triggered reveals for:
   • Section headings (clip-path wipe)
   • Section header wrappers (fade + slide up)
   • Menu bento cards (staggered entrance)
   • Parallax on card / gallery images
   • Story points (staggered entrance)
   • Stats section (fade + counter tick)
═══════════════════════════════════════════════════════════ */

function initMenu() {
  gsap.registerPlugin(ScrollTrigger);
  animateHeadings();
  animateCards();
  animateImageParallax();
  animateStoryPoints();
  animateStats();
}

/* ─────────────────────────────────────────────────────────
   Section headings — clip-path curtain wipe on scroll enter
───────────────────────────────────────────────────────── */
function animateHeadings() {
  // Heading text wipes up from behind a clip-path mask
  gsap.utils.toArray('.section-heading').forEach(el => {
    gsap.to(el, {
      clipPath: 'inset(0 0 0% 0)',
      y:        0,
      opacity:  1,
      duration: 1.15,
      ease:     'power4.out',
      scrollTrigger: {
        trigger:      el,
        start:        'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Section header wrappers (eyebrow + heading row) fade up together
  gsap.utils.toArray('.section-header').forEach(el => {
    gsap.to(el, {
      opacity:  1,
      y:        0,
      duration: 0.95,
      ease:     'power3.out',
      scrollTrigger: {
        trigger:      el,
        start:        'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ─────────────────────────────────────────────────────────
   Menu cards — staggered fade-up as a group
───────────────────────────────────────────────────────── */
function animateCards() {
  const cards = gsap.utils.toArray('.menu-card');
  if (!cards.length) return;

  gsap.to(cards, {
    opacity:  1,
    y:        0,
    duration: 0.9,
    stagger:  0.09,
    ease:     'power3.out',
    scrollTrigger: {
      trigger:      cards[0].closest('section') || cards[0],
      start:        'top 78%',
      toggleActions: 'play none none none',
    },
  });
}

/* ─────────────────────────────────────────────────────────
   Image parallax — subtle vertical drift on card/gallery images
───────────────────────────────────────────────────────── */
function animateImageParallax() {
  gsap.utils.toArray('.parallax-img').forEach(img => {
    const parent = img.closest('.menu-card, .gallery-item');
    if (!parent) return;

    gsap.fromTo(
      img,
      { yPercent: 0 },
      {
        yPercent: -8,
        ease:     'none',
        scrollTrigger: {
          trigger: parent,
          start:   'top bottom',
          end:     'bottom top',
          scrub:   1.6,
        },
      }
    );
  });
}

/* ─────────────────────────────────────────────────────────
   Story points — each point fades up when it enters view
───────────────────────────────────────────────────────── */
function animateStoryPoints() {
  gsap.utils.toArray('.story-point').forEach((point, i) => {
    gsap.to(point, {
      opacity:  1,
      y:        0,
      duration: 0.7,
      delay:    i * 0.07,
      ease:     'power3.out',
      scrollTrigger: {
        trigger:      point,
        start:        'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });
}

/* ─────────────────────────────────────────────────────────
   Stats — fade up, then trigger counter on first enter
───────────────────────────────────────────────────────── */
function animateStats() {
  const items = gsap.utils.toArray('.stat-item');
  if (!items.length) return;

  gsap.to(items, {
    opacity:  1,
    y:        0,
    duration: 0.8,
    stagger:  0.12,
    ease:     'power3.out',
    scrollTrigger: {
      trigger:       '#stats',
      start:         'top 80%',
      toggleActions: 'play none none none',
      onEnter:       tickCounters,
    },
  });
}

/* Incrementing counter — runs once when stats section first enters view */
function tickCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target  = parseInt(el.dataset.target || '0', 10);
    const suffix  = el.dataset.suffix || '+';
    let   current = 0;
    const step    = Math.max(1, Math.ceil(target / 55));

    const ticker = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(ticker);
    }, 20);
  });
}
