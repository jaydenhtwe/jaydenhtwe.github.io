(function () {

  var IMG = {
    jhu: 'images/experiences/jhu.png',
    netz: 'images/experiences/netz.png',
    poster: 'images/projects/poster.jpg',
    'cert-autocad': 'images/about/cert-autocad.jpg',
    'cert-inventor': 'images/about/cert-inventor.jpg'
  };
  function fillImages(root) {
    Array.prototype.forEach.call(root.querySelectorAll('img[data-img]'), function (im) {
      var src = IMG[im.getAttribute('data-img')]; if (src) im.src = src;
    });
  }
  fillImages(document);

  // Lightbox
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var lbReturn = null;
  function openLightbox(key, caption, from) {
    if (!IMG[key]) return;
    lbReturn = from || null;
    lbImg.src = IMG[key]; lbImg.alt = caption || '';
    lbCap.textContent = caption || '';
    lb.hidden = false;
    document.getElementById('lb-close').focus();
  }
  function closeLightbox() {
    lb.hidden = true;
    if (lbReturn) lbReturn.focus();
  }
  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-lightbox]');
    if (t) openLightbox(t.getAttribute('data-lightbox'), t.getAttribute('data-caption'), t);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest && e.target.closest('[data-lightbox]');
    if (t) { e.preventDefault(); openLightbox(t.getAttribute('data-lightbox'), t.getAttribute('data-caption'), t); }
  });

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var nav = document.querySelector('nav');
  var pill = nav.querySelector('.pill');
  var current = -1;

  function movePill() {
    var t = tabs[current]; if (!t) return;
    pill.style.width = t.offsetWidth + 'px';
    pill.style.height = t.offsetHeight + 'px';
    pill.style.transform = 'translate(' + t.offsetLeft + 'px,' + t.offsetTop + 'px)';
  }

  function show(id, remember, force, dx) {
    var next = 0;
    tabs.forEach(function (t, i) {
      var on = t.getAttribute('aria-controls') === id;
      if (on) next = i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    var panel = document.getElementById(id);
    if (current !== -1 && (next !== current || force)) {
      animateIn(panel, dx != null ? dx : (next > current ? 24 : -24));
    }
    current = next;
    movePill();
    if (remember) { try { localStorage.setItem('tab', id); } catch (e) {} }
  }

  function animateIn(el, dx) {
    el.style.setProperty('--dx', dx + 'px');
    Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 8)); });
    el.classList.remove('enter');
    void el.offsetWidth;
    el.classList.add('enter');
  }

  // Project detail view
  var detail = document.getElementById('detail');
  var detailBody = document.getElementById('detail-body');
  var lastCard = null;

  function openProject(card) {
    var tpl = document.getElementById('p-' + card.getAttribute('data-project'));
    if (!tpl) return;
    lastCard = card;
    detailBody.innerHTML = '';
    detailBody.appendChild(tpl.content.cloneNode(true));
    fillImages(detailBody);
    nav.hidden = true;
    document.getElementById('projects').hidden = true;
    detail.hidden = false;
    animateIn(detailBody, 24);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('back').focus({ preventScroll: true });
  }

  function closeProject() {
    if (detail.hidden) return;
    detail.hidden = true;
    nav.hidden = false;
    nav.classList.add('no-anim');
    show('projects', false, true, -24);
    requestAnimationFrame(function () { nav.classList.remove('no-anim'); });
    if (lastCard) lastCard.focus({ preventScroll: true });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.item.project'), function (card) {
    card.addEventListener('click', function () { openProject(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card); }
    });
  });
  document.getElementById('back').addEventListener('click', closeProject);

  // Project filters, built from each project's tags
  (function () {
    var box = document.getElementById('filters');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.item.project'));
    var counts = {}, order = [];
    cards.forEach(function (c) {
      Array.prototype.forEach.call(c.querySelectorAll('.tags span'), function (t) {
        var k = t.textContent.trim();
        if (!counts[k]) { counts[k] = 0; order.push(k); }
        counts[k]++;
      });
    });
    var lab = document.createElement('span'); lab.className = 'f-label'; lab.textContent = 'Filter'; box.appendChild(lab);
    var buttons = [];
    function make(text, key, n) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'filter'; b.setAttribute('aria-pressed', key === '' ? 'true' : 'false');
      b.dataset.key = key; b.textContent = text;
      if (n != null) { var s = document.createElement('span'); s.className = 'n'; s.textContent = n; b.appendChild(s); }
      b.addEventListener('click', function () { apply(b.dataset.key === active ? '' : b.dataset.key); });
      box.appendChild(b); buttons.push(b);
    }
    var active = '';
    function apply(key) {
      active = key;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.key === key ? 'true' : 'false'); });
      cards.forEach(function (c) {
        var hit = false;
        Array.prototype.forEach.call(c.querySelectorAll('.tags span'), function (t) {
          var m = key !== '' && t.textContent.trim() === key;
          t.classList.toggle('match', m); if (m) hit = true;
        });
        c.classList.toggle('dim', key !== '' && !hit);
      });
    }
    make('All', '', cards.length);
    order.forEach(function (k) { make(k, k, counts[k]); });
  })();
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!lb.hidden) closeLightbox(); else closeProject();
  });
  window.addEventListener('resize', function () {
    nav.classList.add('no-anim'); movePill();
    requestAnimationFrame(function () { nav.classList.remove('no-anim'); });
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      nav.classList.add('no-anim'); movePill();
      requestAnimationFrame(function () { nav.classList.remove('no-anim'); });
    });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t.getAttribute('aria-controls'), true); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); show(n.getAttribute('aria-controls'), true);
    });
  });
  var start = (location.hash || '').slice(1);
  if (!document.getElementById(start)) { try { start = localStorage.getItem('tab'); } catch (e) { start = null; } }
  show(document.getElementById(start) ? start : 'projects', false);
  requestAnimationFrame(function () { requestAnimationFrame(function () { nav.classList.remove('no-anim'); }); });

  var btn = document.getElementById('copy');
  btn.addEventListener('click', function () {
    var txt = document.getElementById('email-text').textContent;
    function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = 'Copy'; }, 1500); }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById('email-text'));
      var s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { done('Copied'); }, fallback);
    } else { fallback(); }
  });
  document.getElementById('yr').textContent = new Date().getFullYear();
})();
