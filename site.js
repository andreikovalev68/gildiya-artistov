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

/* Перенос формул Image Stream Hero (ruixen.ui) на чистый JS, как на сайте Валерия Щербакова: фото вылетают из центра в обе стороны */
(function(){
  var persp = document.getElementById('persp');
  var root = document.getElementById('ish3d');
  if (!persp || !root) return;
  var P = {perspective:30, cardWidth:18, cardHeight:25, cardRadius:0.4, birthHeight:2.6, exitHeight:46,
           railBirth:-11, railExit:44, fan:3.3, turnBirth:6, turnExit:28, stops:24};
  var CARDS = 9, SPEED = 20, AXIS = 50;
  var IMAGES = ['portret-kostyum','makferrin-rukopozhatie','syutkin-afisha','tokarev','mikrofon','andzhelina-afisha','para','kuzmin','makferrin-poem','doroga-k-schastyu-proekt','yubilej-afisha'];

  function keyframes(dir, name){
    var steps = [];
    for (var s = 0; s <= P.stops; s++){
      var u = s / P.stops;
      var scale = (P.birthHeight / P.cardHeight) * Math.pow(P.exitHeight / P.birthHeight, u);
      var z = P.perspective * (1 - 1 / scale);
      var rail = P.railExit - (P.railExit - P.railBirth) * Math.pow(1 - u, P.fan);
      var turn = P.turnBirth + (P.turnExit - P.turnBirth) * u;
      steps.push((u * 100).toFixed(2) + '%{transform:translate3d(' + (dir * rail).toFixed(2) + 'cqw,0,' + z.toFixed(2) + 'cqw) rotateY(' + (-dir * turn).toFixed(2) + 'deg)}');
    }
    return '@keyframes ' + name + '{' + steps.join('') + '}';
  }

  var st = document.createElement('style');
  st.textContent = keyframes(1, 'ish-r') + keyframes(-1, 'ish-l');
  document.head.appendChild(st);

  persp.style.perspective = P.perspective + 'cqw';
  persp.style.perspectiveOrigin = '50% ' + AXIS + '%';

  [['ish-r', 0], ['ish-l', 5]].forEach(function(side){
    for (var i = 0; i < CARDS; i++){
      var d = document.createElement('div');
      d.className = 'ish-card';
      d.style.cssText = 'left:50%;top:' + AXIS + '%;width:' + P.cardWidth + 'cqw;height:' + P.cardHeight + 'cqw;' +
        'margin-left:' + (-P.cardWidth / 2) + 'cqw;margin-top:' + (-P.cardHeight / 2) + 'cqw;border-radius:' + P.cardRadius + 'cqw;' +
        'animation:' + side[0] + ' ' + SPEED + 's linear infinite;animation-delay:' + (-(i * SPEED) / CARDS) + 's';
      var im = new Image();
      im.src = 'img/' + IMAGES[(i + side[1]) % IMAGES.length] + '.jpg';
      im.alt = ''; im.decoding = 'async'; im.draggable = false;
      d.appendChild(im);
      root.appendChild(d);
    }
  });
})();

/* золотистые фейерверки на синем фоне ленты фото (механика как на сайте Валерия Щербакова) */
(function(){
  var host = document.getElementById('zone') || document.getElementById('stream');
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
