// DGLS BAT — interactions du site public (aucune dépendance).
(() => {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('menu');

  // Menu mobile
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav?.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  matchMedia('(min-width: 1200px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // Ombre de l'en-tête au défilement
  const onScroll = () => header?.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Apparition progressive des sections
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Barre d'appel mobile : masquée tant qu'un bouton « Appeler maintenant » est déjà visible (pas de doublon à l'écran)
  const bar = document.querySelector('.mobile-cta');
  const calls = document.querySelectorAll('main .btn-call');
  if (bar && calls.length && 'IntersectionObserver' in window) {
    const onScreen = new Set();
    const watch = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? onScreen.add(en.target) : onScreen.delete(en.target)));
      bar.classList.toggle('is-hidden', onScreen.size > 0);
    });
    calls.forEach((b) => watch.observe(b));
  }

  // Filtres des réalisations (ligne défilante sur mobile) : le filtre actif reste visible
  const activeFilter = document.querySelector('.filters [aria-current]');
  if (activeFilter) {
    const row = activeFilter.parentElement;
    row.scrollLeft += activeFilter.getBoundingClientRect().left - row.getBoundingClientRect().left - 20;
  }

  // Comparateur avant / après
  document.querySelectorAll('[data-compare]').forEach((fig) => {
    const range = fig.querySelector('input[type=range]');
    const update = () => fig.style.setProperty('--pos', range.value + '%');
    range.addEventListener('input', update);
    update();
  });

  // Visionneuse photo (élément <dialog> natif) : précédente / suivante au clic, aux flèches du clavier et au balayage
  const dialog = document.querySelector('[data-lightbox-dialog]');
  if (dialog) {
    const big = dialog.querySelector('img');
    const count = dialog.querySelector('.lightbox-count');
    const links = [...document.querySelectorAll('[data-lightbox]')];
    let current = 0;
    const show = (i) => {
      current = (i + links.length) % links.length;
      big.src = links[current].href;
      big.alt = links[current].querySelector('img')?.alt || '';
      if (count) count.textContent = `${current + 1} / ${links.length}`;
    };
    links.forEach((link, i) => link.addEventListener('click', (e) => {
      e.preventDefault();
      show(i);
      dialog.showModal();
    }));
    dialog.querySelectorAll('[data-step]').forEach((btn) => btn.addEventListener('click', () => show(current + Number(btn.dataset.step))));
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    let startX = null;
    dialog.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - (startX ?? e.changedTouches[0].clientX);
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  }
})();
