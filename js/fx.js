// Shared 3D and motion layer used on every page:
// point-cloud objects drawn on <canvas class="orb">, a rotating tech sphere,
// card tilt with glare, the dark-hero header, scroll progress, marquees,
// counters and the process timeline. Everything stops for reduced motion.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const header = document.querySelector('.header');

  /* ---------- Headlines: words rise in one after another ---------- */
  document.querySelectorAll('.split-words').forEach(el => {
    let n = 0;
    const walk = node => [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          const w = document.createElement('span');
          w.className = 'w';
          w.style.setProperty('--w', n++);
          w.textContent = part;
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        if (child.classList.contains('accent-word')) {
          child.classList.add('w');
          child.style.setProperty('--w', n++);
        } else walk(child);
      }
    });
    walk(el);
  });

  /* ---------- Scroll progress in the header ---------- */
  if (header) {
    const bar = document.createElement('span');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    header.appendChild(bar);
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
  }

  /* ---------- Header reads light-on-dark over inner page heroes ---------- */
  const pageHero = document.querySelector('.page-hero.dark');
  if (header && pageHero) {
    const update = () => header.classList.toggle('on-dark', scrollY < pageHero.offsetTop + pageHero.offsetHeight - header.offsetHeight);
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
  }

  /* ---------- Pointer glow on dark heroes ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('.page-hero.dark, .hero, .cta-band').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--px', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        el.style.setProperty('--py', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      });
    });
  }

  /* ---------- Page scenes: layers lift apart on load, world tilts toward the pointer ---------- */
  document.querySelectorAll('.scene3d, .scene-ring, .scene-mail').forEach(scene => {
    const ring = scene.classList.contains('scene-ring') || scene.classList.contains('scene-mail');
    if (!ring) {
      if (reduce) scene.classList.add('is-open');
      else requestAnimationFrame(() => setTimeout(() => scene.classList.add('is-open'), 300));
    }
    if (reduce || !fine) return;
    const host = scene.closest('.page-hero') || scene;
    const cs = getComputedStyle(scene);
    const a = parseFloat(cs.getPropertyValue(ring ? '--tx' : '--rx'));
    const b = parseFloat(cs.getPropertyValue(ring ? '--ty' : '--rz'));
    let frame = 0;
    host.addEventListener('pointermove', e => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = scene.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
        const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
        if (ring) {
          scene.style.setProperty('--tx', (a - y * 6) + 'deg');
          scene.style.setProperty('--ty', (b + x * 14) + 'deg');
        } else {
          scene.style.setProperty('--rx', (a - y * 5) + 'deg');
          scene.style.setProperty('--rz', (b + x * 6) + 'deg');
        }
      });
    });
    host.addEventListener('pointerleave', () => {
      scene.style.removeProperty(ring ? '--tx' : '--rx');
      scene.style.removeProperty(ring ? '--ty' : '--rz');
    });
  });

  /* ---------- Services: the cube turns from service to service ---------- */
  const cube = document.querySelector('.cube');
  if (cube) {
    const stage = cube.closest('.cube-stage');
    const buttons = [...document.querySelectorAll('.cube-nav button')];
    // Rotation that brings each face to the front: website, web app, dashboard, API, support, AI
    const turns = [[0, 0], [0, -90], [0, -180], [0, 90], [-90, 0], [90, 0]];
    let face = 0, view = [-16, -24], paused = false, resumeAt = 0;
    const render = () => {
      const [fx, fy] = turns[face];
      cube.style.transform = `rotateX(${view[0]}deg) rotateY(${view[1]}deg) rotateX(${fx}deg) rotateY(${fy}deg)`;
      buttons.forEach((b, i) => {
        b.classList.toggle('on', i === face);
        b.setAttribute('aria-pressed', String(i === face));
      });
    };
    buttons.forEach((b, i) => b.addEventListener('click', () => {
      face = i;
      resumeAt = performance.now() + 8000;
      render();
    }));
    stage.addEventListener('pointerenter', () => { paused = true; });
    stage.addEventListener('pointerleave', () => { paused = false; view = [-16, -24]; render(); });
    if (fine && !reduce) {
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        view = [-16 - y * 16, -24 + x * 28];
        render();
      });
    }
    render();
    if (!reduce) setInterval(() => {
      if (paused || performance.now() < resumeAt || document.hidden) return;
      face = (face + 1) % turns.length;
      render();
    }, 2800);
  }

  /* ---------- Home technology: list names and 3D blocks light each other up ---------- */
  const city = document.querySelector('.tech-city');
  if (city) {
    const blocks = [...city.querySelectorAll('.blk')];
    const names = [...document.querySelectorAll('.tech-split .tech-tags span')];
    const match = (span, blk) => span.textContent.includes(blk.dataset.tech.replace(' APIs', ''));
    const light = blk => {
      blocks.forEach(b => b.classList.toggle('hot', b === blk));
      names.forEach(n => n.classList.toggle('lit', !!blk && match(n, blk)));
    };
    let held = false, step = 0, timer = 0;
    names.forEach(n => {
      n.addEventListener('pointerenter', () => {
        held = true;
        blocks.forEach(b => b.classList.toggle('hot', match(n, b)));
        names.forEach(m => m.classList.toggle('lit', m === n));
      });
      n.addEventListener('pointerleave', () => { held = false; light(null); });
    });
    blocks.forEach(b => {
      b.addEventListener('pointerenter', () => { held = true; light(b); });
      b.addEventListener('pointerleave', () => { held = false; light(null); });
    });
    // When nobody is pointing, walk through the stack one block at a time
    if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        clearInterval(timer);
        if (!en.isIntersecting) return light(null);
        timer = setInterval(() => {
          if (held) return;
          light(blocks[step++ % blocks.length]);
        }, 1400);
      }, { threshold: 0.3 }).observe(city);
    }
  }

  /* ---------- Point-cloud objects ---------- */
  const fib = n => {
    const pts = [];
    const g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      pts.push([Math.cos(g * i) * r, y, Math.sin(g * i) * r]);
    }
    return pts;
  };

  const shapes = {
    sphere() { return { pts: fib(220), link: 0.26 }; },
    torus() {
      const pts = [];
      for (let i = 0; i < 30; i++) for (let j = 0; j < 10; j++) {
        const u = (i / 30) * Math.PI * 2, v = (j / 10) * Math.PI * 2;
        pts.push([(0.72 + 0.28 * Math.cos(v)) * Math.cos(u), 0.28 * Math.sin(v), (0.72 + 0.28 * Math.cos(v)) * Math.sin(u)]);
      }
      return { pts, link: 0.2 };
    },
    cube() {
      const pts = [], s = 6;
      for (let x = 0; x <= s; x++) for (let y = 0; y <= s; y++) for (let z = 0; z <= s; z++) {
        if (x % s && y % s && z % s) continue;
        pts.push([(x / s - 0.5) * 1.3, (y / s - 0.5) * 1.3, (z / s - 0.5) * 1.3]);
      }
      return { pts, link: 0.23 };
    },
    helix() {
      const pts = [], edges = [], n = 56;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), a = t * Math.PI * 4, y = (t - 0.5) * 2;
        pts.push([Math.cos(a) * 0.5, y, Math.sin(a) * 0.5]);
        pts.push([Math.cos(a + Math.PI) * 0.5, y, Math.sin(a + Math.PI) * 0.5]);
        if (i) edges.push([2 * i - 2, 2 * i], [2 * i - 1, 2 * i + 1]);
        if (i % 3 === 0) edges.push([2 * i, 2 * i + 1]);
      }
      return { pts, edges };
    },
    wave() {
      const pts = [], edges = [], s = 20;
      for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
        pts.push([(i / (s - 1) - 0.5) * 2.2, 0, (j / (s - 1) - 0.5) * 2.2]);
        const k = i * s + j;
        if (j) edges.push([k - 1, k]);
        if (i) edges.push([k - s, k]);
      }
      return { pts, edges, wave: true };
    }
  };

  const linkEdges = (pts, max) => {
    const edges = [];
    for (let i = 0; i < pts.length; i++) {
      let c = 0;
      for (let j = i + 1; j < pts.length && c < 4; j++) {
        const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], dz = pts[i][2] - pts[j][2];
        if (dx * dx + dy * dy + dz * dz < max * max) { edges.push([i, j]); c++; }
      }
    }
    return edges;
  };

  const pointer = { x: 0, y: 0 };
  if (fine) addEventListener('pointermove', e => {
    pointer.x = e.clientX / innerWidth * 2 - 1;
    pointer.y = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  const ease = t => 1 - Math.pow(1 - t, 3);

  document.querySelectorAll('canvas.orb').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const def = (shapes[canvas.dataset.shape] || shapes.sphere)();
    const pts = def.pts;
    const edges = def.edges || linkEdges(pts, def.link);
    const tone = canvas.dataset.tone === 'light' ? 'light' : 'dark';
    const scaleK = parseFloat(canvas.dataset.scale || '0.38');
    const start = pts.map(() => [(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5]);
    const delay = pts.map(() => Math.random() * 0.5);
    const cur = pts.map(p => p.slice());
    const proj = pts.map(() => [0, 0, 0]);
    let w = 0, h = 0, dpr = 1, t0 = performance.now(), visible = true, raf = 0;
    let ax = -0.35, ay = 0, tx = 0, ty = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    };

    const draw = now => {
      const t = (now - t0) / 1000;
      const k = reduce ? 1 : Math.min(1, t / 1.8);
      ay += reduce ? 0 : 0.0035;
      tx += ((fine ? pointer.y * 0.35 : 0) - tx) * 0.04;
      ty += ((fine ? pointer.x * 0.5 : 0) - ty) * 0.04;
      const rx = ax + tx, ry = ay + ty;
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
      const R = Math.min(w, h) * scaleK, ox = w / 2, oy = h / 2;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let x = p[0], y = p[1], z = p[2];
        if (def.wave) y = Math.sin(x * 2.4 + t * 1.2) * Math.cos(z * 2.1 + t * 0.9) * 0.22;
        const e = ease(Math.max(0, Math.min(1, (k - delay[i]) / (1 - delay[i] || 1))));
        x = start[i][0] + (x - start[i][0]) * e;
        y = start[i][1] + (y - start[i][1]) * e;
        z = start[i][2] + (z - start[i][2]) * e;
        cur[i][0] = x; cur[i][1] = y; cur[i][2] = z;
        // rotate around Y then X
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        const s = 2.8 / (2.8 + z2);
        proj[i][0] = ox + x1 * R * s;
        proj[i][1] = oy + y2 * R * s;
        proj[i][2] = z2;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      const lineRGB = tone === 'dark' ? '147,180,248' : '37,99,235';
      for (const [a, b] of edges) {
        const d = (proj[a][2] + proj[b][2]) / 2;
        const alpha = (0.32 - d * 0.18) * (tone === 'dark' ? 1 : 0.7);
        if (alpha <= 0.02) continue;
        ctx.strokeStyle = `rgba(${lineRGB},${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(proj[a][0], proj[a][1]);
        ctx.lineTo(proj[b][0], proj[b][1]);
        ctx.stroke();
      }
      for (let i = 0; i < pts.length; i++) {
        const d = proj[i][2];
        const front = Math.max(0, Math.min(1, (1 - d) / 2));
        const r = 0.8 + front * 1.9;
        ctx.fillStyle = tone === 'dark'
          ? `rgba(${Math.round(96 + 142 * front)},${Math.round(140 + 100 * front)},${245},${(0.35 + front * 0.65).toFixed(3)})`
          : `rgba(37,99,235,${(0.25 + front * 0.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(proj[i][0], proj[i][1], r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduce && visible) raf = requestAnimationFrame(draw);
    };

    resize();
    addEventListener('resize', () => { resize(); if (reduce) draw(performance.now()); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(draw);
      }).observe(canvas);
    } else raf = requestAnimationFrame(draw);
  });

  /* ---------- Rotating tag sphere ---------- */
  document.querySelectorAll('.tag-sphere').forEach(sphere => {
    const tags = [...sphere.querySelectorAll('span')];
    const pos = fib(tags.length);
    let ay = 0, ax = 0.3, tx = 0, ty = 0, visible = true, raf = 0, hover = false;
    sphere.addEventListener('pointerenter', () => { hover = true; });
    sphere.addEventListener('pointerleave', () => { hover = false; });
    const frame = () => {
      ay += reduce ? 0 : (hover ? 0.0015 : 0.004);
      tx += ((fine ? pointer.y * 0.4 : 0) - tx) * 0.05;
      ty += ((fine ? pointer.x * 0.6 : 0) - ty) * 0.05;
      const R = sphere.clientWidth * 0.4;
      const rx = ax + tx, ry = ay + ty;
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
      tags.forEach((tag, i) => {
        const [x, y, z] = pos[i];
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        const s = 0.62 + (1 - z2) * 0.32;
        tag.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        tag.style.opacity = (0.28 + (1 - z2) / 2 * 0.72).toFixed(3);
        tag.style.zIndex = String(Math.round((1 - z2) * 100));
      });
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    };
    frame();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !reduce) raf = requestAnimationFrame(frame);
      }).observe(sphere);
    }
  });

  /* ---------- Card tilt with glare ---------- */
  if (fine && !reduce) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const glare = document.createElement('span');
      glare.className = 'glare';
      glare.setAttribute('aria-hidden', 'true');
      card.appendChild(glare);
      const max = parseFloat(card.dataset.tilt) || 6;
      card.addEventListener('pointerenter', () => {
        card.style.transition = 'transform 120ms linear, box-shadow 300ms ease, border-color 300ms ease';
      });
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(1000px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translateZ(0)`;
        card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.style.transition = 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease, border-color 300ms ease';
        card.style.transform = '';
      });
    });
  }

  /* ---------- Marquee: clone the track so it loops without a seam ---------- */
  document.querySelectorAll('.marquee-track').forEach(track => {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentElement.appendChild(clone);
  });

  /* ---------- Count-up numbers ---------- */
  const counters = document.querySelectorAll('[data-countup]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, to = Number(el.dataset.countup), suffix = el.dataset.suffix || '';
      const s = performance.now();
      const tick = now => {
        const p = Math.min(1, (now - s) / 1400);
        el.textContent = Math.round(to * ease(p)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    counters.forEach(el => io.observe(el));
  }

  /* ---------- Process timeline fills as it scrolls past ---------- */
  document.querySelectorAll('.timeline').forEach(line => {
    const update = () => {
      const r = line.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      line.style.setProperty('--fill', p.toFixed(3));
      line.querySelectorAll('.process-step').forEach((step, i, all) => {
        step.classList.toggle('lit', p >= (i + 0.5) / all.length);
      });
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
  });

  /* ---------- Services: highlight the section in view in the chip bar ---------- */
  const chips = document.querySelectorAll('.svc-nav a');
  if (chips.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      chips.forEach(c => c.classList.toggle('on', c.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('.detail-item[id]').forEach(s => io.observe(s));
  }
})();
