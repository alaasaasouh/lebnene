/* ═══════════════════════════════════════════════════════════
   LEBNENE — Loading screen

   Cinematic brand reveal:
   • Label + "Est. 2008" fade in from top-left / top-right
   • Wordmark rises in — large and commanding
   • Gold progress bar + counter tick 000 → 100 in sync
   • Brief hold at 100, then full-screen fade to site
═══════════════════════════════════════════════════════════ */

function initLoading(onComplete) {
  const screen      = document.getElementById('loading-screen');
  const bar         = document.getElementById('ls-bar');
  const counter     = document.getElementById('ls-counter');
  const wordmark    = document.getElementById('ls-wordmark');
  const label       = document.getElementById('ls-label');
  const topRight    = document.getElementById('ls-top-right');
  const bottomLabel = document.getElementById('ls-bottom-label');

  if (!screen) { onComplete?.(); return; }

  const DURATION = 2700; // ms
  let startTime  = null;

  // Stagger the top elements in first, then the wordmark and bottom
  requestAnimationFrame(() => {
    label.style.opacity   = '1';
    label.style.transform = 'translateY(0)';

    if (topRight) {
      topRight.style.opacity   = '1';
      topRight.style.transform = 'translateY(0)';
    }

    setTimeout(() => {
      wordmark.style.opacity   = '1';
      wordmark.style.transform = 'translateY(0)';
    }, 200);

    setTimeout(() => {
      counter.style.opacity   = '1';
      counter.style.transform = 'translateY(0)';
      if (bottomLabel) bottomLabel.style.opacity = '1';
    }, 320);
  });

  // rAF loop — keeps bar and counter perfectly in sync to the frame
  function tick(timestamp) {
    if (!startTime) startTime = timestamp;

    const progress = Math.min((timestamp - startTime) / DURATION, 1);
    const count    = Math.floor(progress * 100);

    bar.style.transform = `scaleX(${progress})`;
    counter.textContent = String(count).padStart(3, '0');

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = '100';
      bar.style.transform = 'scaleX(1)';

      // Hold at 100 so the number lands, then exit
      setTimeout(() => {
        screen.classList.add('exit');
        setTimeout(onComplete, 620);
      }, 400);
    }
  }

  requestAnimationFrame(tick);
}
