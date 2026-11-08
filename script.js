(function () {

  var IMG = {
    jhu: 'images/experiences/jhu.png',
    netz: 'images/experiences/netz.png',
    vex: 'images/experiences/vexrobotics.png',
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
    ['lb-prev', 'lb-next', 'lb-count'].forEach(function (id) { document.getElementById(id).hidden = true; });
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
  var photos = Array.prototype.slice.call(document.querySelectorAll('.gallery .photo'));
  var singles = photos.filter(function (p) { return !p.classList.contains('folder'); });
  var lbPrev = document.getElementById('lb-prev');
  var lbNext = document.getElementById('lb-next');
  var lbCount = document.getElementById('lb-count');
  var set = [], setName = '', setIndex = -1;

  function itemFromImg(im, fallbackCaption) {
    return { src: im.getAttribute('src'), caption: im.getAttribute('alt') || fallbackCaption || '' };
  }
  function singleItem(p) {
    var cap = p.querySelector('figcaption');
    return itemFromImg(p.querySelector('img'), cap ? cap.textContent : '');
  }
  function folderItems(p) {
    var name = p.querySelector('figcaption');
    var ims = p.querySelectorAll('.folder-photos img');
    if (!ims.length) return [singleItem(p)];
    return Array.prototype.map.call(ims, function (im) { return itemFromImg(im, name ? name.textContent : ''); });
  }
  function showItem(i) {
    setIndex = (i + set.length) % set.length;
    var it = set[setIndex];
    lbImg.src = it.src; lbImg.alt = it.caption;
    lbCap.textContent = it.caption;
    lbCount.textContent = (setName ? setName + ' · ' : '') + (setIndex + 1) + ' / ' + set.length;
  }
  function openSet(items, i, name, from) {
    set = items; setName = name || ''; lbReturn = from || null;
    var many = items.length > 1;
    lbPrev.hidden = lbNext.hidden = lbCount.hidden = !many;
    showItem(i);
    lb.hidden = false;
    document.getElementById('lb-close').focus();
  }
  function openPhoto(p) {
    if (p.classList.contains('folder')) {
      var name = p.querySelector('figcaption');
      openSet(folderItems(p), 0, name ? name.textContent : '', p);
    } else {
      openSet(singles.map(singleItem), singles.indexOf(p), '', p);
    }
  }

  // Folder badge with the photo count
  photos.forEach(function (p) {
    if (!p.classList.contains('folder')) return;
    var n = p.querySelectorAll('.folder-photos img').length || 1;
    var badge = document.createElement('span');
    badge.className = 'folder-badge'; badge.setAttribute('aria-hidden', 'true');
    badge.innerHTML = '<svg viewBox="0 0 16 16"><path d="M3 4h10v8H3zM1.5 2.5h10V3h-9v7.5h-1z"/></svg>' + n + ' photos';
    p.appendChild(badge);
  });

  photos.forEach(function (p) {
    p.addEventListener('click', function () { openPhoto(p); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPhoto(p); }
    });
  });
  lbPrev.addEventListener('click', function () { showItem(setIndex - 1); });
  lbNext.addEventListener('click', function () { showItem(setIndex + 1); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden || lbPrev.hidden) return;
    if (e.key === 'ArrowLeft') showItem(setIndex - 1);
    if (e.key === 'ArrowRight') showItem(setIndex + 1);
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

  // project detail view
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

    // project search + tag filters
  (function () {
    var box = document.getElementById('filters');
    var input = document.getElementById('search-input');
    var clear = document.getElementById('search-clear');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.item.project'));
    var counts = {}, order = [];
    var selected = []; // tags currently toggled on

    // lowercase + strip accents so "Currás" matches "curras"
    function norm(s) {
      return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    }

    // per-project data: tags, plus searchable text (name + collaborators + tags)
    var info = cards.map(function (c) {
      var tags = Array.prototype.map.call(c.querySelectorAll('.tags span'), function (t) {
        return t.textContent.trim();
      });
      tags.forEach(function (k) {
        if (!counts[k]) { counts[k] = 0; order.push(k); }
        counts[k]++;
      });
      var h = c.querySelector('h3');
      return {
        el: c,
        tags: tags,
        text: norm((h ? h.textContent : '') + ' ' + (c.getAttribute('data-collab') || '') + ' ' + tags.join(' '))
      };
    });

    function query() { return norm(input.value); }
    function isOn(k) { return selected.indexOf(k) !== -1; }

    // unselected tags that match what's typed (all unselected tags when the bar is empty)
    function suggestions(q) {
      return order.filter(function (k) { return !isOn(k) && (!q || norm(k).indexOf(q) !== -1); });
    }

    function toggle(k) {
      if (isOn(k)) selected.splice(selected.indexOf(k), 1); else selected.push(k);
      input.value = '';
      update();
    }

    // tag buttons: selected tags always show, plus matching suggestions while typing
    function renderTags() {
      var q = query();
      var shown = order.filter(function (k) { return isOn(k) || !q || norm(k).indexOf(q) !== -1; });
      box.innerHTML = '';
      box.hidden = !shown.length;
      if (!shown.length) return;
      var lab = document.createElement('span');
      lab.className = 'f-label'; lab.textContent = q ? 'Suggestions' : 'Tags';
      box.appendChild(lab);
      shown.forEach(function (k) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'filter'; b.dataset.key = k;
        b.setAttribute('aria-pressed', isOn(k) ? 'true' : 'false');
        b.textContent = k;
        var s = document.createElement('span'); s.className = 'n'; s.textContent = counts[k]; b.appendChild(s);
        b.addEventListener('click', function () { toggle(k); });
        box.appendChild(b);
      });
    }

    // highlight / dim projects
    function applyFilter() {
      var q = query();
      var words = q ? q.split(/\s+/) : [];
      info.forEach(function (p) {
        var tagsOk = selected.every(function (k) { return p.tags.indexOf(k) !== -1; });
        var textOk = words.every(function (w) { return p.text.indexOf(w) !== -1; });
        Array.prototype.forEach.call(p.el.querySelectorAll('.tags span'), function (t) {
          t.classList.toggle('match', isOn(t.textContent.trim()));
        });
        p.el.classList.toggle('dim', (selected.length > 0 || words.length > 0) && !(tagsOk && textOk));
      });
    }

    function update() {
      clear.hidden = !input.value && !selected.length;
      renderTags();
      applyFilter();
    }

    function reset() { input.value = ''; selected = []; update(); }

    input.addEventListener('input', update);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var q = query(), list = suggestions(q);
        if (q && list.length) { e.preventDefault(); toggle(list[0]); }
      } else if (e.key === 'Backspace' && !input.value && selected.length) {
        selected.pop(); update();
      } else if (e.key === 'Escape' && (input.value || selected.length)) {
        reset();
      }
    });
    clear.addEventListener('click', function () { reset(); input.focus(); });

    update();
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

  var THEMES = [
    { id: 'indigo', name: 'Indigo', swatch: '#1f2f6b' },
    { id: 'forest', name: 'Forest', swatch: '#1f5f4a' },
    { id: 'rose',   name: 'Rose',   swatch: '#9b2c4f' },
    { id: 'amber',  name: 'Amber',  swatch: '#8a5a00' },
    { id: 'plum',   name: 'Plum',   swatch: '#5b2a86' }
  ];
  (function () {
    var root = document.documentElement;
    var btn = document.getElementById('theme-btn');
    var menu = document.getElementById('theme-menu');
    var box = document.getElementById('swatches');
    var modeBtns = Array.prototype.slice.call(menu.querySelectorAll('[data-mode]'));
    var mode = root.dataset.mode || 'light';
    var theme = root.dataset.theme || 'indigo';
    var swatchBtns = [];

    function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    function withFade(fn) {
      var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.startViewTransition && !reduce) document.startViewTransition(fn);
      else fn();
    }
    function apply() {
      root.dataset.mode = mode; root.dataset.theme = theme;
      modeBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.mode === mode ? 'true' : 'false'); });
      swatchBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === theme ? 'true' : 'false'); });
    }
    THEMES.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'swatch'; b.dataset.id = t.id;
      b.style.background = t.swatch; b.title = t.name; b.setAttribute('aria-label', t.name + ' theme');
      b.addEventListener('click', function () { withFade(function () { theme = t.id; save('theme', theme); apply(); }); });
      box.appendChild(b); swatchBtns.push(b);
    });
    modeBtns.forEach(function (b) {
      b.addEventListener('click', function () { withFade(function () { mode = b.dataset.mode; save('mode', mode); apply(); }); });
    });

    function setOpen(open) {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(menu.hidden); });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () { if (!menu.hidden) setOpen(false); });
    // capture phase so Escape closes the menu without also closing an open project
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { e.stopPropagation(); setOpen(false); btn.focus(); }
    }, true);

    apply();
  })();
})();