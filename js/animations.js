// Scroll reveals: single blocks [data-reveal] and staggered groups [data-reveal-group]
(() => {
  const els = document.querySelectorAll('[data-reveal], [data-reveal-group]');
  document.querySelectorAll('[data-reveal-group]').forEach(group => {
    [...group.children].forEach((child, i) => child.style.setProperty('--i', Math.min(i, 5)));
  });
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }
  const io = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      io.unobserve(entry.target);
    }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();
