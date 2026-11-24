// Homepage hero: header over the dark band, the 3D stack, pointer tilt,
// and the example dashboard coming alive when it scrolls into view.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.header');
  const hero = document.querySelector('.hero');

  // Header reads light-on-dark until the dark band has scrolled past
  if (header && hero) {
    const band = () => hero.offsetTop + hero.offsetHeight - parseInt(getComputedStyle(hero).getPropertyValue('--band'), 10) - header.offsetHeight;
    const update = () => header.classList.toggle('on-dark', window.scrollY < band());
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  // The three layers separate shortly after load
  const stack = document.querySelector('.stack');
  const scene = stack && stack.querySelector('.stack-scene');
  if (stack) {
    if (reduce) stack.classList.add('is-open');
    else requestAnimationFrame(() => setTimeout(() => stack.classList.add('is-open'), 250));
  }

  // Gentle tilt toward the pointer, only on devices with a fine pointer
  if (stack && scene && !reduce && matchMedia('(pointer: fine)').matches) {
    const base = { rx: 56, rz: -38 };
    let frame = 0;
    const set = (rx, rz) => {
      stack.style.setProperty('--rx', rx + 'deg');
      stack.style.setProperty('--rz', rz + 'deg');
    };
    hero.addEventListener('pointermove', e => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = stack.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
        const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
        set(base.rx - y * 4, base.rz + x * 5);
      });
    });
    hero.addEventListener('pointerleave', () => set(base.rx, base.rz));
  }

  // Dashboard: chart draws in, figures count up
  const win = document.querySelector('.hero-figure .app-window');
  if (!win) return;
  const counters = win.querySelectorAll('[data-count]');
  const format = (n, el) => (el.dataset.prefix || '') + Math.round(n).toLocaleString('en-US');
  const run = () => {
    win.classList.add('is-live');
    if (reduce) return;
    counters.forEach(el => {
      const to = Number(el.dataset.count);
      const start = performance.now();
      const dur = 1200;
      const tick = now => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = format(to * eased, el);
        if (t < 1) requestAnimationFrame(tick);
      };
      el.textContent = format(0, el);
      requestAnimationFrame(tick);
    });
  };
  if (!('IntersectionObserver' in window)) return run();
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      run();
      io.disconnect();
    }
  }, { threshold: 0.35 });
  io.observe(win);
})();
