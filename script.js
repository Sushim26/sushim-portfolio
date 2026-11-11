/* Sushim Ranjan Dutta — Portfolio 2026 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 24) nav.classList.add('stuck');
    else nav.classList.remove('stuck');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  // not rAF-dependent: a backgrounded tab may never paint a frame
  setTimeout(function () { nav.classList.add('ready'); }, 60);

  /* ---------- mobile drawer ---------- */
  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('navDrawer');
  toggle.addEventListener('click', function () {
    var open = drawer.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  drawer.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      drawer.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ============================================================
     TYPEWRITER
     Splits [data-type] text into spans, then reveals them one at
     a time behind a blinking caret. Preserves the original text
     for screen readers via aria-label.
     ============================================================ */
  function buildTypewriter(el) {
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    el.classList.add('tw');

    var chars = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement('span');
      s.className = 'tw-char';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = text[i] === ' ' ? ' ' : text[i];
      el.appendChild(s);
      chars.push(s);
    }
    var caret = document.createElement('span');
    caret.className = 'tw-caret';
    caret.setAttribute('aria-hidden', 'true');
    el.appendChild(caret);

    return { el: el, chars: chars, played: false };
  }

  function playTypewriter(t, speed, startDelay) {
    if (t.played) return;
    t.played = true;

    if (reduced) { t.el.classList.add('done'); return; }

    t.el.classList.add('typing');
    var i = 0;
    function step() {
      if (i >= t.chars.length) {
        setTimeout(function () {
          t.el.classList.remove('typing');
          t.el.classList.add('done');
        }, 420);
        return;
      }
      t.chars[i].classList.add('on');
      i++;
      // slight rhythm variation so it reads as typing, not a metronome
      setTimeout(step, speed + (Math.random() * speed * 0.5));
    }
    setTimeout(step, startDelay || 0);
  }

  var typers = [];
  document.querySelectorAll('[data-type]').forEach(function (el) {
    typers.push({
      t: buildTypewriter(el),
      speed: parseInt(el.dataset.typeSpeed || '52', 10),
      delay: parseInt(el.dataset.typeDelay || '0', 10),
      eager: el.hasAttribute('data-type-eager')
    });
  });

  /* ---------- hero types on load ---------- */
  typers.filter(function (x) { return x.eager; })
    .forEach(function (x) { playTypewriter(x.t, x.speed, x.delay); });

  /* ============================================================
     SCROLL REVEAL
     Elements opt in with .rise / .fade / .mask / .draw / .uncover
     / .num-rise. Children of a [data-stagger] block cascade.
     ============================================================ */
  var revealSel = '.rise, .fade, .draw, .draw-top, .uncover, .num-rise, .mask';
  var items = document.querySelectorAll(revealSel);

  function showAll() {
    items.forEach(function (el) { el.classList.add('in'); });
    typers.forEach(function (x) { playTypewriter(x.t, x.speed, 0); });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    // stagger children within a group
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
      var step = parseInt(group.dataset.stagger || '110', 10);
      var kids = group.querySelectorAll(revealSel);
      kids.forEach(function (el, i) {
        el.style.transitionDelay = Math.min(i, 8) * step + 'ms';
      });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -12% 0px' });

    items.forEach(function (el) { io.observe(el); });

    // the negative rootMargin can never be satisfied at the very bottom
    // of the page, so release anything still pending once we land there
    window.addEventListener('scroll', function () {
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return;
      items.forEach(function (el) {
        if (!el.classList.contains('in')) { el.classList.add('in'); io.unobserve(el); }
      });
    }, { passive: true });

    // typewriters that wait until scrolled into view
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var found = typers.filter(function (x) { return x.t.el === entry.target; })[0];
        if (found) playTypewriter(found.t, found.speed, found.delay);
        tio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    typers.filter(function (x) { return !x.eager; })
      .forEach(function (x) { tio.observe(x.t.el); });
  }

  /* ============================================================
     SCROLL PANEL
     Drives the progress rail and clears the fade/hint once the
     reader reaches the bottom of the copy.
     ============================================================ */
  document.querySelectorAll('.scroll-panel').forEach(function (panel) {
    var body = panel.querySelector('.scroll-body');
    var thumb = panel.querySelector('.scroll-thumb');
    if (!body) return;

    function update() {
      var scrollable = body.scrollHeight - body.clientHeight;

      // nothing to scroll (short copy / wide viewport): drop the affordance
      if (scrollable < 8) {
        panel.classList.add('at-end');
        if (thumb) thumb.style.height = '100%';
        return;
      }

      var ratio = body.clientHeight / body.scrollHeight;
      var p = body.scrollTop / scrollable;

      if (thumb) {
        var h = Math.max(ratio * 100, 14);
        thumb.style.height = h + '%';
        thumb.style.transform = 'translateY(' + (p * (100 - h) / h * 100) + '%)';
      }

      panel.classList.toggle('at-end', p > 0.96);
    }

    body.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
  });

  /* ============================================================
     ENGAGEMENT DECK
     Horizontal scroll-snapped slides with arrows, drag-to-pan,
     keyboard paging and a progress rail.
     ============================================================ */
  (function () {
    var deck = document.getElementById('deck');
    if (!deck) return;

    var slides = deck.querySelectorAll('.slide');
    var prev = document.getElementById('deckPrev');
    var next = document.getElementById('deckNext');
    var now = document.getElementById('deckNow');
    var prog = document.getElementById('deckProg');
    if (!slides.length) return;

    function step() {
      // distance from one slide's left edge to the next
      if (slides.length < 2) return slides[0].offsetWidth;
      return slides[1].offsetLeft - slides[0].offsetLeft;
    }

    function maxScroll() { return deck.scrollWidth - deck.clientWidth; }

    function index() {
      var s = step();
      if (s <= 0) return 0;
      return Math.round(deck.scrollLeft / s);
    }

    function update() {
      var max = maxScroll();
      var i = Math.min(index(), slides.length - 1);

      if (now) now.textContent = ('0' + (i + 1)).slice(-2);

      if (prog) {
        // how much of the deck is on screen, and how far along we are
        var visible = deck.clientWidth / deck.scrollWidth;
        var p = max > 0 ? deck.scrollLeft / max : 0;
        prog.style.width = Math.max(visible * 100, 8) + '%';
        prog.style.transform = 'translateX(' +
          (p * (100 / Math.max(visible, 0.08) - 100)) + '%)';
      }

      if (prev) prev.disabled = deck.scrollLeft <= 2;
      if (next) next.disabled = deck.scrollLeft >= max - 2;
    }

    function go(dir) {
      deck.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });

    deck.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    deck.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    /* drag to pan — pointer events cover mouse, pen and touch */
    var down = false, startX = 0, startScroll = 0, moved = 0;

    deck.addEventListener('pointerdown', function (e) {
      // let touch keep its native momentum scrolling
      if (e.pointerType === 'touch') return;
      down = true; moved = 0;
      startX = e.clientX;
      startScroll = deck.scrollLeft;
      deck.classList.add('dragging');
    });

    deck.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      deck.scrollLeft = startScroll - dx;
    });

    function endDrag() {
      if (!down) return;
      down = false;
      deck.classList.remove('dragging');
      // settle onto the nearest slide
      var s = step();
      if (s > 0) {
        deck.scrollTo({
          left: Math.round(deck.scrollLeft / s) * s,
          behavior: reduced ? 'auto' : 'smooth'
        });
      }
    }
    deck.addEventListener('pointerup', endDrag);
    deck.addEventListener('pointercancel', endDrag);
    deck.addEventListener('pointerleave', endDrag);

    // a drag shouldn't fire a click on whatever ended up under the cursor
    deck.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    update();
  })();

  /* ============================================================
     METRIC COUNTERS — slow ease to final value
     ============================================================ */
  var nums = document.querySelectorAll('[data-count]');

  function run(el) {
    var target = parseFloat(el.dataset.count);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    if (reduced) { el.textContent = prefix + target + suffix; return; }

    var dur = 2100, start = performance.now(), done = false;
    function finish() {
      if (done) return;
      done = true;
      el.textContent = prefix + target + suffix;
    }
    function frame(ts) {
      if (done) return;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else finish();
    }
    requestAnimationFrame(frame);
    // guarantee the final value even if frames never arrive
    setTimeout(finish, dur + 400);
  }

  if (!('IntersectionObserver' in window)) {
    nums.forEach(run);
  } else {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        cio.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { cio.observe(el); });
  }
})();


/* ============================================================
   SELECTED WORK — accessible project detail dialog
   ============================================================ */
(function () {
  var dialog = document.getElementById('workDialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var title = document.getElementById('workDialogTitle');
  var category = document.getElementById('workDialogCategory');
  var description = document.getElementById('workDialogDescription');
  var highlights = document.getElementById('workDialogHighlights');
  var preview = document.getElementById('workDialogPreview');
  var platformLink = document.getElementById('workDialogLink');
  var closeButton = dialog.querySelector('.work-dialog-close');
  var triggers = document.querySelectorAll('.work-card-trigger');

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var card = trigger.closest('.work-card');
      if (!card) return;

      var heading = card.querySelector('.work-title');
      var meta = card.querySelector('.work-card-meta');
      var summary = card.querySelector('.work-card-copy p');
      var outcome = card.querySelector('.work-outcome');
      var visual = card.querySelector('.work-preview');

      title.textContent = heading ? heading.childNodes[0].textContent.trim() : 'Project details';
      category.textContent = meta ? meta.firstElementChild.textContent : '';
      description.textContent = trigger.getAttribute('data-dialog-description') || (summary ? summary.textContent.trim() : '');
      platformLink.href = trigger.getAttribute('data-platform-url') || '#';

      highlights.replaceChildren();
      (outcome ? outcome.textContent : '').split('·').map(function (item) {
        return item.trim();
      }).filter(Boolean).forEach(function (item) {
        var chip = document.createElement('span');
        chip.className = 'work-dialog-chip';
        chip.textContent = item;
        highlights.appendChild(chip);
      });

      preview.replaceChildren();
      if (visual) {
        var clone = visual.cloneNode(true);
        clone.removeAttribute('aria-hidden');
        preview.appendChild(clone);
      }

      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });
})();
