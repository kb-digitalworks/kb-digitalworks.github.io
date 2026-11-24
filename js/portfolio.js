// Work page: filter project cards by client type
(() => {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');
  const count = document.querySelector('.filter-count');
  if (!buttons.length || !cards.length) return;

  const apply = filter => {
    let shown = 0;
    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        shown++;
        card.classList.remove('hidden');
        card.classList.remove('filter-in');
        void card.offsetWidth; // restart the entrance animation
        card.classList.add('filter-in');
      } else {
        card.classList.add('hidden');
      }
    });
    if (count) count.textContent = shown === 1 ? '1 project type' : `${shown} project types`;
  };

  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => {
      b.classList.toggle('active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    apply(btn.dataset.filter);
  }));
})();
