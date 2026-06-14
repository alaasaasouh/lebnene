/* ═══════════════════════════════════════════════════════════
   LEBNENE — Modal system

   Handles three modals:
   • reservation  — booking form with validation
   • full-menu    — tabbed menu with all dishes + drinks
   • dish         — detail popup triggered by menu card clicks

   Also drives the toast notification and cancellation policy.
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   Dish data — populated into the dish detail modal on click
───────────────────────────────────────────────────────── */
const DISHES = {
  'kibbeh-royale': {
    img:   'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80&auto=format&fit=crop',
    badge: 'Signature · Lamb',
    name:  'Kibbeh Royale',
    price: '$28',
    short: 'Lamb & pine nut croquettes, pomegranate reduction, yogurt dip',
    desc:  'A LEBNENE signature since opening day. Hand-rolled lamb and pine nut kibbeh, fried to a golden shell, served with our house pomegranate reduction and cool mint yogurt dip. Contains gluten and nuts.',
  },
  'fattoush-garden': {
    img:   'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80&auto=format&fit=crop',
    badge: 'Mezze · Fresh · Vegan',
    name:  'Fattoush Garden',
    price: '$16',
    short: 'Heirloom tomatoes, sumac, crispy pita',
    desc:  'A riot of seasonal colour — heirloom tomatoes, Persian cucumber, watermelon radish and shaved fennel, tossed in a sumac vinaigrette and crowned with house-fried pita chips. Fully vegan.',
  },
  'mixed-grill': {
    img:   'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=700&q=80&auto=format&fit=crop',
    badge: 'Grill · Charcoal',
    name:  'Mixed Grill',
    price: '$52',
    short: 'Kafta, shish taouk, lamb chops, charcoal garlic sauce',
    desc:  'The full charcoal experience. Kafta mince skewers, marinated shish taouk and frenched lamb chops — served over grilled vegetables with our legendary toum garlic sauce. Cooked over live charcoal.',
  },
  'kunafa-cream': {
    img:   'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=80&auto=format&fit=crop',
    badge: 'Dessert · Signature',
    name:  'Kunāfa Cream',
    price: '$18',
    short: 'Shredded pastry, clotted cream, orange blossom syrup',
    desc:  'Our most requested dessert. Kataifi pastry crisped in clarified butter, filled with ashta clotted cream, drenched in orange blossom syrup and finished with crushed Sicilian pistachio. Contains dairy and nuts.',
  },
};

/* ─────────────────────────────────────────────────────────
   Bootstrap — wire all modals and their triggers
───────────────────────────────────────────────────────── */
function initModals() {
  // Register close-on-click-outside and close buttons for each modal
  ['reservation', 'full-menu', 'dish'].forEach(id => setupModal(id));

  setupMenuTabs();
  setupReservationForm();
  setupDishCards();
  setupMenuModalReserveBtn();
  setupCancellationPolicy();

  // Any element with [data-modal="x"] opens modal x when clicked
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal));
  });
}

/* ─────────────────────────────────────────────────────────
   Generic open / close
───────────────────────────────────────────────────────── */
function setupModal(id) {
  const overlay = document.getElementById(`modal-${id}`);
  if (!overlay) return;

  // All .modal-close buttons inside the overlay dismiss it
  overlay.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => closeModal(id));
  });

  // Click on the backdrop (not the panel) also closes
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(id);
  });
}

function openModal(id) {
  const overlay = document.getElementById(`modal-${id}`);
  if (!overlay) return;

  overlay.style.display       = 'flex';
  overlay.classList.remove('closing');
  document.body.style.overflow = 'hidden';

  // Scoped Escape listener — cleaned up when this modal closes
  function onEsc(e) {
    if (e.key === 'Escape') {
      closeModal(id);
      document.removeEventListener('keydown', onEsc);
    }
  }
  document.addEventListener('keydown', onEsc);
}

function closeModal(id) {
  const overlay = document.getElementById(`modal-${id}`);
  if (!overlay) return;

  overlay.classList.add('closing');

  // Wait for CSS exit animation before hiding — avoids a hard-cut
  setTimeout(() => {
    overlay.style.display       = 'none';
    overlay.classList.remove('closing');
    document.body.style.overflow = '';
  }, 260);
}

/* ─────────────────────────────────────────────────────────
   Full-menu tabs — Mezze / Mains / Grill / Desserts / Drinks
───────────────────────────────────────────────────────── */
function setupMenuTabs() {
  const tabs     = document.querySelectorAll('.menu-tab');
  const contents = document.querySelectorAll('.menu-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      contents.forEach(c => c.classList.toggle('hidden', c.dataset.content !== target));
    });
  });
}

/* ─────────────────────────────────────────────────────────
   Reservation form — validation + simulated submit
───────────────────────────────────────────────────────── */
function setupReservationForm() {
  const form = document.getElementById('reservation-form');
  if (!form) return;

  // Default date to today — prevents past-date selection
  const dateInput = form.querySelector('#res-date');
  if (dateInput) {
    const today      = new Date().toISOString().split('T')[0];
    dateInput.min    = today;
    dateInput.value  = today;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn       = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending…';
    btn.disabled    = true;

    // Simulated network delay — swap for a real API call in production
    setTimeout(() => {
      closeModal('reservation');
      showToast('Reservation received! We\'ll confirm within 2 hours.');
      form.reset();
      btn.textContent = 'Confirm Reservation';
      btn.disabled    = false;
      if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    }, 1200);
  });

  // Clear field errors the moment the user starts correcting input
  form.querySelectorAll('.form-input').forEach(input => {
    ['input', 'change'].forEach(ev => input.addEventListener(ev, () => clearFieldError(input)));
  });
}

function validateForm(form) {
  let valid = true;

  form.querySelectorAll('[required]').forEach(field => {
    const errorEl = field.nextElementSibling;
    const bad = !field.value.trim() ||
      (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));

    field.classList.toggle('error', bad);
    if (errorEl) errorEl.classList.toggle('visible', bad);
    if (bad) valid = false;
  });

  return valid;
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorEl = field.nextElementSibling;
  if (errorEl) errorEl.classList.remove('visible');
}

/* ─────────────────────────────────────────────────────────
   Dish cards → detail popup
───────────────────────────────────────────────────────── */
function setupDishCards() {
  document.querySelectorAll('.menu-card[data-dish]').forEach(card => {
    card.addEventListener('click', () => {
      const dish = DISHES[card.dataset.dish];
      if (!dish) return;

      // Populate modal fields
      document.getElementById('dish-img').src           = dish.img;
      document.getElementById('dish-img').alt           = dish.name;
      document.getElementById('dish-badge').textContent = dish.badge;
      document.getElementById('dish-name').textContent  = dish.name;
      document.getElementById('dish-price').textContent = dish.price;
      document.getElementById('dish-short').textContent = dish.short;
      document.getElementById('dish-desc').textContent  = dish.desc;
      openModal('dish');
    });
  });

  // Reserve button inside dish modal: close dish → open reservation
  document.getElementById('dish-reserve-btn')?.addEventListener('click', () => {
    closeModal('dish');
    setTimeout(() => openModal('reservation'), 300);
  });
}

/* ─────────────────────────────────────────────────────────
   Full menu → reservation button
───────────────────────────────────────────────────────── */
function setupMenuModalReserveBtn() {
  document.getElementById('menu-modal-reserve')?.addEventListener('click', () => {
    closeModal('full-menu');
    setTimeout(() => openModal('reservation'), 320);
  });
}

/* ─────────────────────────────────────────────────────────
   Cancellation policy — shows toast instead of a page
───────────────────────────────────────────────────────── */
function setupCancellationPolicy() {
  document.getElementById('cancellation-policy-btn')?.addEventListener('click', e => {
    e.preventDefault();
    showToast('Cancellations accepted up to 24 hours before. Email reserve@lebnene.com.');
  });
}

/* ─────────────────────────────────────────────────────────
   Toast notification — auto-dismisses after 5 s
───────────────────────────────────────────────────────── */
function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent         = message;
  toast.style.opacity       = '1';
  toast.style.transform     = 'translate(-50%, 0)';
  toast.style.pointerEvents = 'auto';

  setTimeout(() => {
    toast.style.opacity       = '0';
    toast.style.transform     = 'translate(-50%, 16px)';
    toast.style.pointerEvents = 'none';
  }, 5000);
}
