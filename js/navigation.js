const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.nav-links');

function setMenuOpen(open) {
  if (!toggle || !menu) return;
  menu.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  toggle.innerHTML = open
    ? '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
    : '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
}

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    setMenuOpen(!menu.classList.contains('open'));
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) setMenuOpen(false);
  });
}

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (header) header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

document.querySelectorAll('.year').forEach(el => {
  el.textContent = new Date().getFullYear();
});