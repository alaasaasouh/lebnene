/* ═══════════════════════════════════════════════════════════
   LEBNENE — Hero

   Architecture (three DOM layers):
   A) #hero — 100vh text panel, transparent bg so canvas shows through
   B) #hero-canvas-wrap — fixed full-screen canvas, visible from load
   C) #hero-scroll-container — 260vh driver that scrubs the frames

   Scroll timeline:
   1. Canvas starts at opacity 1 with frame 0 already drawn
   2. As hero scrolls off, hero text fades out; canvas stays
   3. Frames advance in sync with scroll through the driver div
   4. Overlay text panels (.hs-section) appear / disappear by %
   5. Canvas fades out cleanly before the next page sections
═══════════════════════════════════════════════════════════ */

let FRAME_COUNT  = 0;
let FRAME_SPEED  = 1.6;   // video completes at ~63% scroll — leaves room for end text
let frames       = [];
let currentFrame = 0;
let canvas, ctx;

function initHero() {
  gsap.registerPlugin(ScrollTrigger);
  initHeroEntrance();
  initRoleCycle();
  loadFrames(() => {
    initCanvas();
    initScrollSystem();
  });
}

/* ─────────────────────────────────────────────────────────
   A. Hero entrance
   Each letter clips up through a curtain wipe, then the
   supporting text elements fade in with a gentle stagger.
───────────────────────────────────────────────────────── */
function initHeroEntrance() {
  // Lock everything to its start-state before GSAP runs — prevents FOUC
  gsap.set('.hero-letter',  { clipPath: 'inset(0 0 100% 0)', y: 48 });
  gsap.set(['.hero-eyebrow', '.hero-sub', '.hero-desc', '.hero-ctas'], {
    autoAlpha: 0, y: 18,
  });
  gsap.set('.hero-scroll', { autoAlpha: 0 });

  gsap.timeline({ delay: 0.15 })
    // Letters rise one by one through the clip curtain
    .to('.hero-letter', {
      clipPath: 'inset(0 0 0% 0)',
      y:        0,
      duration: 1.35,
      stagger:  { each: 0.065, ease: 'power2.inOut' },
      ease:     'power4.out',
    })
    .to('.hero-eyebrow', { autoAlpha: 1, y: 0, duration: 0.9,  ease: 'power3.out' }, '-=1.1')
    .to('.hero-sub',     { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.55')
    .to('.hero-desc',    { autoAlpha: 1, y: 0, duration: 0.85, ease: 'power3.out' }, '-=0.68')
    .to('.hero-ctas',    { autoAlpha: 1, y: 0, duration: 0.8,  ease: 'power3.out' }, '-=0.62')
    .to('.hero-scroll',  { autoAlpha: 1,        duration: 0.65, ease: 'power2.out' }, '-=0.38');
}

/* ─────────────────────────────────────────────────────────
   B. Cycling adjective ("Authentic", "Elevated", …)
   Fades the word out, swaps text, fades back in.
───────────────────────────────────────────────────────── */
function initRoleCycle() {
  const el = document.getElementById('hero-role');
  if (!el) return;

  const roles = ['Authentic', 'Elevated', 'Soulful', 'Timeless'];
  let i = 0;

  setInterval(() => {
    i = (i + 1) % roles.length;

    el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(6px)';

    setTimeout(() => {
      el.textContent     = roles[i];
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0)';
    }, 265);
  }, 2600);
}

/* ─────────────────────────────────────────────────────────
   C. Frame loading
   Probes for the first frame, binary-searches the count,
   then loads all frames (every 3rd on mobile to save RAM).
───────────────────────────────────────────────────────── */
function loadFrames(onReady) {
  const probe = new Image();
  probe.onload  = () => discoverAndLoad(onReady);
  probe.onerror = () => {
    console.warn('LEBNENE: frames folder not found — canvas disabled');
    onReady();
  };
  probe.src = 'frames/frame_0001.jpg';
}

function discoverAndLoad(onReady) {
  // Mobile loads every 3rd frame — ~66% less memory, motion still readable
  const stride = window.innerWidth < 768 ? 3 : 1;

  // Binary search for the last valid frame number
  let lo = 1, hi = 400;
  (function step() {
    if (lo >= hi - 1) { FRAME_COUNT = lo; bulkLoad(onReady, stride); return; }
    const mid = Math.floor((lo + hi) / 2);
    const img = new Image();
    img.onload  = () => { lo = mid; step(); };
    img.onerror = () => { hi = mid; step(); };
    img.src = frameSrc(mid);
  })();
}

function bulkLoad(onReady, stride) {
  stride = stride || 1;
  const indices = [];
  for (let i = 1; i <= FRAME_COUNT; i += stride) indices.push(i);

  const count = indices.length;
  frames      = new Array(count);
  FRAME_COUNT = count;

  let done = 0;
  indices.forEach((srcIdx, arrIdx) => {
    const img = new Image();
    img.onload = img.onerror = () => {
      if (img.naturalWidth) frames[arrIdx] = img;
      done++;
      if (done === 1) drawFrame(0);         // render first frame the instant it arrives
      if (done >= count) { drawFrame(0); onReady(); }
    };
    img.src = frameSrc(srcIdx);
  });
}

function frameSrc(n) {
  return `frames/frame_${String(n).padStart(4, '0')}.jpg`;
}

/* ─────────────────────────────────────────────────────────
   D. Canvas — DPR-aware, true cover scaling
───────────────────────────────────────────────────────── */
function initCanvas() {
  canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // Enable high-quality JPEG interpolation
  ctx.imageSmoothingEnabled  = true;
  ctx.imageSmoothingQuality  = 'high';

  sizeCanvas();
  window.addEventListener('resize', debounce(sizeCanvas, 160));
}

function sizeCanvas() {
  if (!canvas || !ctx) return;

  // Cap DPR at 2 — retina beyond that wastes memory on JPEG frames
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  drawFrame(currentFrame);
}

function drawFrame(idx) {
  if (!ctx || !FRAME_COUNT) return;
  const img = frames[idx];
  if (!img?.naturalWidth) return;

  const cw = window.innerWidth;
  const ch = window.innerHeight;

  // True cover: image fills the viewport with no gaps or black bars
  const scale  = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const drawW  = img.naturalWidth  * scale;
  const drawH  = img.naturalHeight * scale;
  const drawX  = (cw - drawW) / 2;
  const drawY  = (ch - drawH) / 2;

  ctx.fillStyle = '#080706';
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

/* ─────────────────────────────────────────────────────────
   E. Scroll system
   Canvas is already at opacity 1 — we only need to:
   • Fade the hero TEXT out as it scrolls away
   • Scrub frames in sync with the scroll container
   • Fade the canvas out at the end of the scroll zone
   • Animate the dark overlay and text panels
───────────────────────────────────────────────────────── */
function initScrollSystem() {
  const heroEl     = document.getElementById('hero');
  const canvasWrap = document.getElementById('hero-canvas-wrap');
  const scrollCont = document.getElementById('hero-scroll-container');
  const overlay    = document.getElementById('hero-dark-overlay');
  if (!scrollCont) return;

  /* 1 — Hero text fades out as user scrolls past the 100vh panel.
        Canvas stays fully visible — frames are now the focus.     */
  ScrollTrigger.create({
    trigger: heroEl,
    start:   'top top',
    end:     'bottom top',
    scrub:   1,
    onUpdate(self) {
      heroEl.style.opacity = Math.max(0, 1 - self.progress * 2.5).toFixed(3);
    },
  });

  /* 2 — Frame scrubbing through the 260vh scroll driver.
        scrub: 1.5 adds organic lag so fast scrollers still see frames. */
  ScrollTrigger.create({
    trigger: scrollCont,
    start:   'top top',
    end:     'bottom bottom',
    scrub:   1.5,
    onUpdate(self) {
      if (!FRAME_COUNT) return;
      const acc = Math.min(self.progress * FRAME_SPEED, 1);
      const idx = Math.min(Math.floor(acc * FRAME_COUNT), FRAME_COUNT - 1);
      if (idx !== currentFrame) {
        currentFrame = idx;
        requestAnimationFrame(() => drawFrame(currentFrame));
      }
    },
  });

  /* 3 — Canvas fades out after the scroll zone so the next
        page sections (menu, story, etc.) have a clean background. */
  ScrollTrigger.create({
    trigger: scrollCont,
    start:   'bottom 85%',
    end:     'bottom top',
    scrub:   1,
    onUpdate(self) {
      canvasWrap.style.opacity = Math.max(0, 1 - self.progress * 2.2).toFixed(3);
    },
  });

  /* 4 — Dark overlay dims the canvas while text panels are visible.
        Ramps: 5→18% (fade in) · 18→78% (hold at 0.78) · 78→97% (fade out). */
  if (overlay) {
    ScrollTrigger.create({
      trigger: scrollCont,
      start:   'top top',
      end:     'bottom bottom',
      scrub:   0.8,
      onUpdate(self) {
        const p = self.progress;
        let o = 0;
        if      (p > 0.05 && p < 0.18)       o = ((p - 0.05) / 0.13) * 0.78;
        else if (p >= 0.18 && p <= 0.78)      o = 0.78;
        else if (p > 0.78  && p < 0.97)       o = ((0.97 - p) / 0.19) * 0.78;
        overlay.style.opacity = o.toFixed(3);
      },
    });
  }

  /* 5 — Text overlay sections (.hs-section) animate in/out by scroll %.
        enter/leave are set as data attributes on each element (0–100). */
  document.querySelectorAll('.hs-section').forEach(sec => {
    const enter = parseFloat(sec.dataset.enter) / 100;
    const leave = parseFloat(sec.dataset.leave) / 100;
    const mid   = (enter + leave) / 2;
    const dir   = sec.dataset.animation === 'slide-left' ? -80 : 80;

    // Vertically position the section at the midpoint of its active range
    sec.style.top = `${mid * 100}%`;

    // Staggered entrance timeline (paused; fired when section enters range)
    const kids = sec.querySelectorAll('.hs-label, .hs-heading, .hs-body');
    const tl   = gsap.timeline({ paused: true });
    tl.from(kids, {
      x:       dir,
      opacity: 0,
      filter:  'blur(6px)',
      stagger: 0.14,
      duration: 1.1,
      ease:    'power3.out',
    });

    let inView = false;
    ScrollTrigger.create({
      trigger: scrollCont,
      start:   'top top',
      end:     'bottom bottom',
      onUpdate(self) {
        const p = self.progress;
        if (p >= enter && p < leave) {
          if (!inView) {
            inView = true;
            gsap.to(sec, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' });
            tl.restart();
          }
        } else if (inView) {
          inView = false;
          const exitDir = p < enter ? -24 : 24;
          gsap.to(sec, {
            autoAlpha: 0,
            x:         exitDir,
            filter:    'blur(5px)',
            duration:  0.5,
            ease:      'power2.in',
            onComplete() {
              gsap.set(sec, { x: 0, filter: 'blur(0px)' });
              tl.pause(0);
            },
          });
        }
      },
    });
  });

  /* 6 — Marquee text drifts horizontally as the scroll progresses */
  const mWrap = document.querySelector('.hs-marquee-wrap');
  const mText = document.querySelector('.hs-marquee-text');
  if (mWrap && mText) {
    const mEnter = parseFloat(mWrap.dataset.enter) / 100;
    const mLeave = parseFloat(mWrap.dataset.leave) / 100;
    mWrap.style.top = `${((mEnter + mLeave) / 2) * 100}%`;

    gsap.fromTo(mText,
      { xPercent: 5 },
      {
        xPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: scrollCont,
          start:   'top top',
          end:     'bottom bottom',
          scrub:   1.5,
        },
      }
    );

    let mVisible = false;
    ScrollTrigger.create({
      trigger: scrollCont,
      start:   'top top',
      end:     'bottom bottom',
      onUpdate(self) {
        const p = self.progress;
        if (p >= mEnter && p < mLeave && !mVisible) {
          mVisible = true;
          gsap.to(mWrap, { autoAlpha: 1, duration: 0.55, ease: 'power2.out' });
        } else if ((p < mEnter || p >= mLeave) && mVisible) {
          mVisible = false;
          gsap.to(mWrap, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' });
        }
      },
    });
  }
}

/* ─────────────────────────────────────────────────────────
   Utilities
───────────────────────────────────────────────────────── */
function debounce(fn, ms) {
  let t;
  return () => { clearTimeout(t); t = setTimeout(fn, ms); };
}
