/* =========================================================
   LIN YU — interactions
   Vanilla JS, no dependencies. Everything degrades gracefully:
   without JS the page still renders (veil is hidden by <noscript>).
   ========================================================= */
(function () {
  'use strict';

  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, ctx) => (ctx || doc).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || doc).querySelectorAll(sel));

  /* ---------- 00. content config (edit me) ---------- */
  const CONFIG = {
    email: 'hello@linyu.design',
    storageKey: 'linyu.notes.v1',
    seedNote: {
      name: '林屿',
      message: '欢迎来到这间收件箱。留言只保存在你自己的浏览器里，不上传任何服务器——可以放心写下想说的话。',
      time: Date.now(),
      owner: true
    }
  };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const pad = (n) => String(n).padStart(2, '0');

  /* restore scroll position quirks: start at top on reload */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ---------- 01. hero title split ---------- */
  (function splitTitle() {
    $$('[data-split]').forEach((word) => {
      const text = word.textContent.trim();
      word.textContent = '';
      let index = 0;
      const offset = word.closest('.hero__line--outline') ? 3 : 0;
      text.split('').forEach((ch) => {
        const outer = doc.createElement('span');
        const inner = doc.createElement('span');
        outer.className = 'ch';
        outer.style.setProperty('--i', index + offset);
        if (ch === ' ') outer.style.width = '.32em';
        inner.textContent = ch;
        outer.appendChild(inner);
        word.appendChild(outer);
        index++;
      });
    });
    $$('[data-hero]').forEach((el) => el.style.setProperty('--i', el.dataset.hero || 0));
  })();

  /* ---------- 02. unseal sequence ---------- */
  const veil = $('#veil');
  const seal = $('#seal');
  let unsealed = false;
  let autoTimer = null;

  function unseal(instant) {
    if (unsealed) return;
    unsealed = true;
    clearTimeout(autoTimer);

    if (veil) {
      veil.classList.add('is-open');
      if (seal && !instant) seal.classList.add('is-break');
      window.setTimeout(() => {
        veil.classList.add('is-done');
        veil.setAttribute('aria-hidden', 'true');
        veil.removeAttribute('tabindex');
      }, instant ? 0 : 1500);
    }
    body.classList.remove('is-locked');
    body.classList.add('is-ready');
    window.setTimeout(() => { body.classList.add('hero-settled'); }, 1400);
  }

  if (veil) {
    ['click', 'pointerdown'].forEach((evt) => {
      veil.addEventListener(evt, (e) => { e.preventDefault(); unseal(false); }, { passive: false });
    });
    veil.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        unseal(false);
      }
    });
    veil.addEventListener('wheel', () => unseal(false), { passive: true });
    body.classList.add('is-locked');

    /* safety net: never trap a visitor behind the seal */
    autoTimer = window.setTimeout(() => unseal(false), 11000);
  } else {
    body.classList.add('is-ready');
  }

  if (reduce) {
    if (veil) unseal(true);
    body.classList.add('is-ready');
  }

  /* if someone lands on a deep link, open right away */
  if (window.location.hash && window.location.hash.length > 1) {
    window.setTimeout(() => unseal(reduce), 350);
  }

  /* /#letter opens the sealed letter directly */
  function handleLetterHash() {
    if (window.location.hash === '#letter') {
      window.setTimeout(openLetter, reduce ? 200 : 1100);
    }
  }
  window.addEventListener('hashchange', handleLetterHash);
  handleLetterHash();

  /* ---------- 03. accent cursor ---------- */
  if (finePointer && !reduce) {
    const cursor = $('.cursor');
    const dot = $('#cursor-dot');
    const ring = $('#cursor-ring');
    if (cursor && dot && ring) {
      root.classList.add('has-cursor');
      cursor.classList.add('is-hidden');
      let mx = window.innerWidth / 2, my = window.innerHeight / 2;
      let rx = mx, ry = my, dx = mx, dy = my;
      let raf = null;

      const render = () => {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        dx += (mx - dx) * 0.45;
        dy += (my - dy) * 0.45;
        ring.style.transform = `translate3d(${rx.toFixed(2)}px,${ry.toFixed(2)}px,0)`;
        dot.style.transform = `translate3d(${dx.toFixed(2)}px,${dy.toFixed(2)}px,0)`;
        raf = requestAnimationFrame(render);
      };
      render();

      window.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        cursor.classList.remove('is-hidden');
      }, { passive: true });
      doc.addEventListener('mouseleave', () => cursor.classList.add('is-hidden'));
      window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
      window.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

      const hoverables = 'a, button, [data-letter], .lettercard, .card__link, .stack li, input, textarea';
      doc.addEventListener('mouseover', (e) => {
        if (e.target.closest && e.target.closest(hoverables)) cursor.classList.add('is-hover');
      });
      doc.addEventListener('mouseout', (e) => {
        if (e.target.closest && e.target.closest(hoverables)) cursor.classList.remove('is-hover');
      });

      window.addEventListener('blur', () => { cancelAnimationFrame(raf); });
    }
  }

  /* ---------- 04. star field ---------- */
  (function stars() {
    const canvas = $('#stars');
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let ticking = false;

    function build() {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = w < 720 ? 46 : Math.round(clamp(w / 14, 60, 130));
      particles = Array.from({ length: count }, () => {
        const depth = Math.random() * 0.85 + 0.15;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.25 * depth + 0.18,
          a: Math.random() * 0.55 + 0.08,
          depth,
          vy: (Math.random() * 0.14 + 0.03) * depth,
          vx: (Math.random() - 0.5) * 0.05,
          tw: Math.random() * Math.PI * 2,
          tws: Math.random() * 0.014 + 0.004
        };
      });
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y -= p.vy;
        p.tw += p.tws;
        if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
        if (p.x < -6) p.x = w + 6;
        if (p.x > w + 6) p.x = -6;

        const alpha = p.a * (0.55 + Math.sin(p.tw) * 0.45);
        const ox = targetX * p.depth * 0.014;
        const oy = targetY * p.depth * 0.014;

        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(236,238,248,' + alpha.toFixed(3) + ')';
        ctx.fill();

        if (p.r > 1.05) {
          ctx.beginPath();
          ctx.arc(p.x + ox, p.y + oy, p.r * 4.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(220,224,240,' + (alpha * 0.055).toFixed(3) + ')';
          ctx.fill();
        }
      }
      ticking = true;
      requestAnimationFrame(frame);
    }

    build();
    frame();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(0);
      build();
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX - window.innerWidth / 2;
      mouseY = e.clientY - window.innerHeight / 2;
    }, { passive: true });
    void ticking;
  })();

  /* ---------- 05. nav / progress ---------- */
  const nav = $('#nav');
  const bar = $('#progress-bar');
  let scrollTick = false;

  function onScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (nav) nav.classList.toggle('is-scrolled', y > 40);
      if (bar) {
        const max = doc.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? clamp(y / max, 0, 1) * 100 : 0) + '%';
      }
      scrollTick = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 06. mobile menu ---------- */
  const burger = $('#burger');
  const menu = $('#menu');
  function setMenu(open) {
    if (!menu || !burger) return;
    body.classList.toggle('menu-open', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    body.classList.toggle('is-locked', open || (!unsealed && !!veil));
    if (open) {
      const first = menu.querySelector('a');
      if (first) first.focus({ preventScroll: true });
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  }

  /* ---------- 07. reveal on scroll ---------- */
  const reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- 08. tilt ---------- */
  if (finePointer && !reduce) {
    $$('[data-tilt]').forEach((el) => {
      let raf = null;
      const strength = el.classList.contains('orb') ? 9 : 3.4;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          if (el.id === 'orb' || el.classList.contains('orb')) {
            el.style.setProperty('--rx', (-py * strength).toFixed(2) + 'deg');
            el.style.setProperty('--ry', (px * strength).toFixed(2) + 'deg');
          } else {
            el.style.transform = `perspective(900px) rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg) translateY(-4px)`;
          }
          raf = null;
        });
      });
      el.addEventListener('mouseleave', () => {
        if (el.id === 'orb' || el.classList.contains('orb')) {
          el.style.setProperty('--rx', '0deg');
          el.style.setProperty('--ry', '0deg');
        } else {
          el.style.transform = '';
        }
      });
    });

    /* the orb reacts to the cursor wherever it is */
    const orb = $('#orb');
    if (orb) {
      window.addEventListener('mousemove', (e) => {
        const r = orb.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        orb.style.setProperty('--ry', clamp((e.clientX - cx) / 60, -4, 4).toFixed(2) + 'deg');
        orb.style.setProperty('--rx', clamp(-(e.clientY - cy) / 80, -3, 3).toFixed(2) + 'deg');
      }, { passive: true });
    }
  }

  /* ---------- 09. magnetic buttons ---------- */
  if (finePointer && !reduce) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.18;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- 10. letter modal ---------- */
  const letter = $('#letter');
  let lastFocus = null;

  function openLetter() {
    if (!letter || letter.classList.contains('is-open')) return;
    lastFocus = doc.activeElement;
    letter.classList.add('is-open');
    letter.setAttribute('aria-hidden', 'false');
    body.classList.add('is-locked');
    const closeBtn = $('.letter__close', letter);
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }
  function closeLetter() {
    if (!letter || !letter.classList.contains('is-open')) return;
    letter.classList.remove('is-open');
    letter.setAttribute('aria-hidden', 'true');
    if (!body.classList.contains('menu-open') && unsealed) body.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  $$('[data-letter]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); openLetter(); });
    el.addEventListener('keydown', (e) => {
      if (el.getAttribute('role') === 'button' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault(); openLetter();
      }
    });
  });
  $$('[data-letter-close]').forEach((el) => el.addEventListener('click', closeLetter));

  doc.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (letter && letter.classList.contains('is-open')) closeLetter();
      else if (menu && menu.classList.contains('is-open')) setMenu(false);
    }
    /* simple focus loop inside the letter */
    if (e.key === 'Tab' && letter && letter.classList.contains('is-open')) {
      const focusables = $$('button, [href], input, textarea', letter).filter((el) => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    }
  });

  /* ---------- 11. guestbook (local only) ---------- */
  const noteForm = $('#note-form');
  const noteList = $('#note-list');
  const noteCount = $('#note-count');
  const noteEmpty = $('#note-empty');
  const inbox = $('.inbox');
  const inboxToggle = $('#inbox-toggle');

  function loadNotes() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) return [CONFIG.seedNote];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [CONFIG.seedNote];
    } catch (err) {
      return [CONFIG.seedNote];
    }
  }
  function saveNotes(list) {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(list)); } catch (err) { /* private mode */ }
  }
  function formatTime(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
  }
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function renderNotes(list, animateIndex) {
    if (!noteList) return;
    noteList.innerHTML = '';
    list.forEach((note, i) => {
      const li = doc.createElement('li');
      li.className = 'note';
      if (typeof animateIndex === 'number' && i === animateIndex) {
        li.style.animation = 'noteIn .7s var(--ease) both';
      } else {
        li.style.animation = 'none';
      }
      li.innerHTML = `
        <div class="note__meta">
          <span class="note__name">${escapeHTML(note.name)}${note.owner ? ' · 站长' : ''}</span>
          <time datetime="${new Date(note.time).toISOString()}">${formatTime(note.time)}</time>
        </div>
        <p>${escapeHTML(note.message)}</p>`;
      noteList.appendChild(li);
    });
    if (noteCount) noteCount.textContent = pad(list.length);
    if (noteEmpty) noteEmpty.hidden = list.length > 0;
  }

  let notes = loadNotes();
  renderNotes(notes);

  if (noteForm) {
    noteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameEl = $('#note-name');
      const msgEl = $('#note-msg');
      const name = (nameEl.value || '').trim();
      const message = (msgEl.value || '').trim();
      if (!name || !message) {
        toast('名字和留言都还空着');
        (!name ? nameEl : msgEl).focus();
        return;
      }
      notes.unshift({ name, message, time: Date.now() });
      notes = notes.slice(0, 40);
      saveNotes(notes);
      renderNotes(notes, 0);
      noteForm.reset();
      toast('信已投入收件箱');
      if (inbox && inbox.classList.contains('is-collapsed')) setInbox(true);
    });
  }

  function setInbox(open) {
    if (!inbox || !inboxToggle) return;
    inbox.classList.toggle('is-collapsed', !open);
    inboxToggle.setAttribute('aria-expanded', String(open));
    inboxToggle.querySelector('span').textContent = open ? '合 上' : '展 开';
  }
  if (inboxToggle) {
    inboxToggle.addEventListener('click', () => {
      setInbox(inbox.classList.contains('is-collapsed'));
    });
  }

  /* seed links open the letter when clicked in the footer note */
  const seedOwner = $('.note__name');
  if (seedOwner) seedOwner.setAttribute('title', '站长留言');

  /* ---------- 12. toast / copy ---------- */
  const clockEl = $('#clock');
  if (clockEl) {
    try {
      const fmt = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', hour12: false
      });
      const tick = () => { clockEl.textContent = fmt.format(new Date()); };
      tick();
      window.setInterval(tick, 20000);
    } catch (err) {
      clockEl.textContent = '--:--';
    }
  }

  let toastTimer = null;
  function toast(text) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('is-show'), 2600);
  }

  const copyBtn = $('#copy-mail');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = CONFIG.email;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = doc.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          doc.body.appendChild(ta);
          ta.select();
          doc.execCommand('copy');
          ta.remove();
        }
        toast('邮箱已复制 · ' + text);
      } catch (err) {
        toast(text);
      }
    });
  }

  /* ---------- 13. active nav link ---------- */
  const sections = ['work', 'about', 'craft', 'journey', 'notes'].map((id) => doc.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          $$('.nav__links a').forEach((a) => {
            a.style.color = a.getAttribute('href') === '#' + entry.target.id ? '#ffffff' : '';
          });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- 14. keep the seal honest ---------- */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted && !unsealed && veil) unseal(false);
  });
})();
