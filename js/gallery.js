/* ═══════════════════════════════════════════════════════════
   LEBNENE — Gallery

   Desktop: pins the title panel while two image columns
   scroll past at different speeds for a parallax effect.

   Mobile (<768px): skips GSAP entirely — columns flow as a
   standard CSS grid so nothing is hidden or clipped.
═══════════════════════════════════════════════════════════ */

function initGallery() {
  gsap.registerPlugin(ScrollTrigger);
  initParallaxColumns();
  initLightbox();
}

/* ─────────────────────────────────────────────────────────
   Parallax columns (desktop only)
───────────────────────────────────────────────────────── */
function initParallaxColumns() {
  const section  = document.getElementById('gallery');
  const pinEl    = document.getElementById('gallery-pin');
  const colLeft  = document.getElementById('gallery-col-left');
  const colRight = document.getElementById('gallery-col-right');
  if (!section || !pinEl || !colLeft || !colRight) return;

  // On mobile the section uses normal document flow — skip GSAP entirely
  if (window.innerWidth < 768) return;

  // Pin the intro title while the image columns scroll beneath it
  ScrollTrigger.create({
    trigger:    section,
    start:      'top top',
    end:        'bottom bottom',
    pin:        pinEl,
    pinSpacing: false,
  });

  // Left column drifts upward, right drifts downward — opposite motion = depth
  gsap.to(colLeft, {
    y:    -240,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start:   'top bottom',
      end:     'bottom top',
      scrub:   1.6,
    },
  });

  gsap.to(colRight, {
    y:    240,
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start:   'top bottom',
      end:     'bottom top',
      scrub:   1.6,
    },
  });
}

/* ─────────────────────────────────────────────────────────
   Lightbox — opens on gallery item click, closes on Escape
───────────────────────────────────────────────────────── */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const lbImg    = document.getElementById('lightbox-img');
  const lbLabel  = document.getElementById('lightbox-label');
  if (!lightbox) return;

  // Open — request a larger image size for full-screen quality
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        lbImg.src = img.src.replace(/w=\d+/, 'w=1600');
        lbImg.alt = img.alt;
      }
      lbLabel.textContent         = item.dataset.label || '';
      lightbox.style.display      = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.style.display       = 'none';
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeLightbox);
  // Click outside the image frame to close
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}
