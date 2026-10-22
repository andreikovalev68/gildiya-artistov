/* Сайт «Гильдия Артистов Эстрады»: меню на телефоне, бесшовная карусель */
(function () {
  'use strict';

  /* карусель: фотографии дублируются, чтобы лента шла по кругу без скачка */
  var track = document.querySelector('.reel-track');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (img) {
      var c = img.cloneNode(true);
      c.setAttribute('alt', '');
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
  }

  /* грамоты: открыть скан поверх страницы; без поддержки <dialog> работает обычная ссылка */
  var view = document.querySelector('.doc-view');
  if (view && typeof view.showModal === 'function') {
    var big = view.querySelector('img');
    document.querySelectorAll('.doc').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var thumb = link.querySelector('img');
        big.src = link.getAttribute('href');
        big.alt = thumb ? thumb.alt : '';
        view.showModal();
      });
    });
    view.querySelector('.doc-close').addEventListener('click', function () { view.close(); });
    view.addEventListener('click', function (e) { if (e.target === view) view.close(); });
    view.addEventListener('close', function () { big.removeAttribute('src'); });
  }

  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  }
  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (nav.classList.contains('is-open') && !nav.contains(e.target) && !btn.contains(e.target)) setOpen(false); });
})();

var IMG_DIR = 'img/';
/* Лента фото по дуге цилиндра (Tilted Grid Hero, 21st.dev): перенос с React на чистый JS, как на сайте «Сайты на Tilda».
   Каждая плитка режется на 16 вертикальных полос, полосы повёрнуты по дуге, плитка едет справа налево и берёт следующее фото за кадром. */
(function () {
  'use strict';
  var host = document.getElementById('tgh');
  if (!host) return;

  var IMAGES = ['portret-kostyum', 'makferrin-rukopozhatie', 'syutkin-afisha', 'tokarev', 'mikrofon', 'andzhelina-afisha',
                'para', 'kuzmin', 'makferrin-poem', 'doroga-k-schastyu-proekt', 'yubilej-afisha']
    .map(function (n) { return IMG_DIR + n + '.jpg'; });
  var P = { speed: 5, tileHeight: 74, aspect: 0.8, gap: 6, axis: 50, curve: 68, fade: 10 };
  var SLICES = 16, CAMERA = 1.6, MAX_WIDTH = 55;
  var bend = Math.min(85, Math.max(5, P.curve)) * Math.PI / 180;

  function arc(b) { return (CAMERA - 1 + Math.cos(b)) / (2 * CAMERA * Math.sin(b)); }
  function deg(rad) { return rad * 180 / Math.PI; }
  function round(n) { return +n.toFixed(4); }

  function measure(width, height) {
    var h = Math.min(P.tileHeight / 100 * height, (MAX_WIDTH / 100 * width) / P.aspect);
    var radius = width * arc(bend);
    if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 };
    var unit = deg(h / radius);
    var pitch = (P.aspect + P.gap / 100) * unit;
    var limit = deg(bend) + P.aspect * unit / 2;
    var columns = Math.min(60, Math.max(2, Math.ceil(2 * limit / pitch)));
    var sweep = round(columns * pitch / 2);
    return { columns: columns, sweep: sweep, unit: round(unit), limit: round(Math.min(sweep, limit)) };
  }

  function u(n) {
    return 'calc(' + round(n) + ' * min(' + P.tileHeight + 'cqh, ' + round(MAX_WIDTH / P.aspect) + 'cqw))';
  }

  var styleEl = document.createElement('style');
  document.head.appendChild(styleEl);
  var layout = null;
  var shown = {};

  function build(L) {
    var columns = L.columns, sweep = L.sweep, unit = L.unit, limit = L.limit;
    var r = 100 * arc(bend);
    var radius = round(r) + 'cqw';
    function turn(d) { return 'translateZ(' + radius + ') rotateY(' + round(d) + 'deg) translateZ(-' + radius + ')'; }
    var hide = round((sweep - limit) / (2 * (sweep || 1)) * 100);
    styleEl.textContent =
      '@keyframes tgh-orbit{from{transform:' + turn(-sweep) + '}to{transform:' + turn(sweep) + '}' +
      '0%,' + hide + '%,' + (100 - hide) + '%,100%{visibility:hidden}' +
      (hide + 0.001) + '%,' + (100 - hide - 0.001) + '%{visibility:visible}}' +
      '@media(prefers-reduced-motion:reduce){.tgh-tile{animation-play-state:paused}}';

    var share = P.aspect / SLICES;
    var duration = columns * P.speed;
    var mask = 'linear-gradient(90deg,transparent,#000 ' + P.fade + '%,#000 ' + (100 - P.fade) + '%,transparent)';

    host.textContent = '';
    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .5s;' +
      'perspective:' + round(r * CAMERA) + 'cqw;perspective-origin:50% ' + P.axis + '%;' +
      '-webkit-mask-image:' + mask + ';mask-image:' + mask;

    for (var t = 0; t < columns; t++) {
      (function (t) {
        var first = columns - 1 - t;
        var idx = (shown[t] != null ? shown[t] : first) % IMAGES.length;
        var tile = document.createElement('div');
        tile.className = 'tgh-tile';
        tile.style.cssText = 'position:absolute;left:calc(50% - ' + u(P.aspect / 2) + ');top:calc(' + P.axis + '% - ' + u(0.5) + ');' +
          'width:' + u(P.aspect) + ';height:' + u(1) + ';transform-style:preserve-3d;' +
          'animation:tgh-orbit ' + duration + 's linear ' + (-t * P.speed) + 's infinite';
        for (var k = 0; k < SLICES; k++) {
          var s = document.createElement('div');
          s.className = 'tgh-slice';
          s.style.cssText = 'position:absolute;top:0;overflow:hidden;left:' + u((P.aspect - share) / 2) +
            ';width:' + (k === SLICES - 1 ? u(share) : 'calc(' + u(share) + ' + 1px)') + ';height:' + u(1) +
            ';transform:' + turn((P.aspect / 2 - (k + 0.5) * share) * unit) +
            (k === 0 ? ';border-radius:10px 0 0 10px' : '') + (k === SLICES - 1 ? ';border-radius:0 10px 10px 0' : '');
          var im = new Image();
          im.src = IMAGES[idx];
          im.alt = ''; im.draggable = false; im.decoding = 'async';
          im.style.cssText = 'position:absolute;top:0;max-width:none;object-fit:cover;left:' + u(-k * share) + ';width:' + u(P.aspect) + ';height:' + u(1);
          s.appendChild(im);
          tile.appendChild(s);
        }
        tile.addEventListener('animationiteration', function (e) {
          if (e.target !== tile) return;
          var lap = Math.round(e.elapsedTime / duration);
          var next = lap * columns + first;
          if (shown[t] === next) return;
          shown[t] = next;
          var src = IMAGES[next % IMAGES.length];
          tile.querySelectorAll('img').forEach(function (i) { i.src = src; });
        });
        wrap.appendChild(tile);
      })(t);
    }
    host.appendChild(wrap);
    requestAnimationFrame(function () { wrap.style.opacity = '1'; });
  }

  IMAGES.forEach(function (src) { new Image().src = src; });

  function relayout() {
    var r = host.getBoundingClientRect();
    var next = measure(r.width, r.height);
    if (layout && layout.columns === next.columns && layout.sweep === next.sweep && layout.unit === next.unit) return;
    layout = next;
    build(next);
  }
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(host);
  else window.addEventListener('resize', relayout);
  relayout();
})();

/* золотистые фейерверки на синем фоне ленты фото (механика как на сайте Валерия Щербакова) */
(function(){
  var host = document.getElementById('zone') || document.getElementById('tgh');
  if (!host || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var cv = document.createElement('canvas');
  cv.className = 'fxg';
  cv.setAttribute('aria-hidden', 'true');
  host.appendChild(cv);
  var fx = cv.getContext('2d');
  var GOLD = ['#FFF6D5','#FFE08A','#FFD24D','#F5B81C','#FFC83D','#FFFFFF'];
  var TAU = 6.283185, W = 0, H = 0, dpr = 1, parts = [], rockets = [], visible = true, last = 0, nextLaunch = 0;

  function size(){
    var r = host.getBoundingClientRect();
    dpr = 1;
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    cv.width = W * dpr; cv.height = H * dpr;
    fx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function star4(ctx, x, y, R){
    var r = R * .28;
    ctx.beginPath();
    for (var i = 0; i < 8; i++){
      var a = i * Math.PI / 4 - Math.PI / 2, rr = (i % 2 === 0) ? R : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
  }
  function burst(x, y, n){
    var base = GOLD[(Math.random() * GOLD.length) | 0];
    n = n || (90 + (Math.random() * 50 | 0));
    for (var i = 0; i < n; i++){
      var a = Math.random() * TAU, ring = Math.random() < .35;
      var v = ring ? 3.6 + Math.random() * .5 : (Math.random() * .7 + .3) * (1.6 + Math.random() * 4);
      var isStar = Math.random() < .45;
      parts.push({x:x, y:y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, life:1, d:.008 + Math.random() * .010,
        r:isStar ? Math.random() * 2.4 + 1.8 : Math.random() * 1.5 + .8, star:isStar, tw:Math.random() * TAU,
        c:Math.random() < .6 ? base : GOLD[(Math.random() * GOLD.length) | 0], g:isStar ? .03 : .045});
    }
    for (var k = 0; k < 30; k++){
      var b = Math.random() * TAU, vv = Math.random() * 1.8;
      parts.push({x:x, y:y, vx:Math.cos(b) * vv, vy:Math.sin(b) * vv - .3, life:1, d:.004 + Math.random() * .004,
        r:Math.random() * 1 + .5, star:false, tw:Math.random() * TAU, c:'#FFF6D5', g:.02, glitter:true});
    }
  }
  function launch(tx, ty){
    rockets.push({x:tx + (Math.random() - .5) * 120, y:H + 10, tx:tx, ty:ty, vy:-(5.5 + Math.random() * 2.5) * Math.max(1, Math.min(3, H / 420))});
  }
  function draw(t){
    fx.globalCompositeOperation = 'destination-out';
    fx.fillStyle = 'rgba(0,0,0,.2)';
    fx.fillRect(0, 0, W, H);
    fx.globalCompositeOperation = 'lighter';
    var i, p;
    for (i = rockets.length - 1; i >= 0; i--){
      p = rockets[i];
      p.y += p.vy; p.x += (p.tx - p.x) * .035;
      fx.fillStyle = '#FFF6D5'; fx.beginPath(); fx.arc(p.x, p.y, 2.2, 0, TAU); fx.fill();
      fx.fillStyle = 'rgba(255,210,77,.5)'; fx.beginPath(); fx.arc(p.x, p.y + 6, 1.5, 0, TAU); fx.fill();
      if (p.y <= p.ty){ burst(p.x, p.y); rockets.splice(i, 1); }
    }
    for (i = parts.length - 1; i >= 0; i--){
      p = parts[i];
      p.vx *= .985; p.vy = p.vy * .985 + p.g;
      p.x += p.vx; p.y += p.vy; p.life -= p.d;
      if (p.life <= 0){ parts.splice(i, 1); continue; }
      var al = Math.max(0, p.life);
      if (p.glitter) al *= .5 + .5 * Math.sin(t / 60 + p.tw);
      fx.globalAlpha = Math.min(1, al * 1.2);
      fx.fillStyle = p.c;
      if (p.star) star4(fx, p.x, p.y, p.r * (.7 + p.life * .7));
      else { fx.beginPath(); fx.arc(p.x, p.y, p.r * (.6 + p.life * .6), 0, TAU); fx.fill(); }
    }
    fx.globalAlpha = 1;
  }
  function frame(t){
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    if (t - last < 24) return;
    last = t;
    if (t > nextLaunch){
      launch(W * (.08 + Math.random() * .84), H * (.12 + Math.random() * .4));
      if (Math.random() < .35) launch(W * (.08 + Math.random() * .84), H * (.12 + Math.random() * .4));
      nextLaunch = t + 800 + Math.random() * 1200;
    }
    draw(t);
  }
  host.addEventListener('pointerdown', function(e){
    var r = host.getBoundingClientRect();
    burst(e.clientX - r.left, e.clientY - r.top, 160);
  });
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }, {threshold:0}).observe(host);
  }
  window.addEventListener('resize', size);
  size();
  requestAnimationFrame(frame);
})();
