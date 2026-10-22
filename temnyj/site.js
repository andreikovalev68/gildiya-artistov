
/* звёздное небо и фейерверки в первом экране */
(function(){
  var hero = document.getElementById('top');
  var sc = document.getElementById('stars'), fc = document.getElementById('fw');
  if (!hero || !sc || !fc) return;
  var sx = sc.getContext('2d'), fx = fc.getContext('2d');
  var W = 0, H = 0, dpr = 1, stars = [], parts = [], rockets = [], visible = true, last = 0, nextLaunch = 0;
  var GOLD = ['#FFFFFF','#FFE6DA','#FFB9A0','#FF9C86','#E0785A','#FF7A96','#F7B6C8'];
  var TAU = 6.283185;

  function size(){
    var r = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    [sc, fc].forEach(function(c){ c.width = W * dpr; c.height = H * dpr; });
    sx.setTransform(dpr,0,0,dpr,0,0); fx.setTransform(dpr,0,0,dpr,0,0);
    var n = Math.min(520, Math.round(W * H / 2000));
    stars = [];
    for (var i = 0; i < n; i++){
      var big = Math.random() < .12;
      stars.push({x:Math.random()*W, y:Math.random()*H, r:big ? Math.random()*1.4+1.4 : Math.random()*1.2+.35,
        p:Math.random()*TAU, s:Math.random()*2+.5, c:Math.random()<.4?'#FFB9A0':'#FFFFFF', star:big || Math.random()<.1});
    }
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

  function drawStars(t){
    sx.clearRect(0,0,W,H);
    for (var i = 0; i < stars.length; i++){
      var st = stars[i];
      var a = .2 + .8 * (.5 + .5 * Math.sin(t / 1000 * st.s + st.p));
      sx.globalAlpha = a;
      sx.fillStyle = st.c;
      if (st.star) star4(sx, st.x, st.y, st.r * 3.2 * (.7 + .5 * a));
      else { sx.beginPath(); sx.arc(st.x, st.y, st.r, 0, TAU); sx.fill(); }
    }
    sx.globalAlpha = 1;
  }

  function burst(x, y, n){
    var base = GOLD[(Math.random() * GOLD.length) | 0];
    n = n || (120 + (Math.random() * 70 | 0));
    for (var i = 0; i < n; i++){
      var a = Math.random() * TAU, ring = Math.random() < .35;
      var v = ring ? 4.6 + Math.random() * .6 : (Math.random() * .7 + .3) * (2 + Math.random() * 5.2);
      var isStar = Math.random() < .45;
      parts.push({x:x, y:y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, life:1, d:.008 + Math.random() * .010,
        r:isStar ? Math.random() * 3 + 2.2 : Math.random() * 1.8 + .9, star:isStar, tw:Math.random() * TAU,
        c:Math.random() < .55 ? base : GOLD[(Math.random() * GOLD.length) | 0], g:isStar ? .035 : .05});
    }
    /* мелкие блёстки, которые медленно осыпаются */
    for (var k = 0; k < 40; k++){
      var b = Math.random() * TAU, vv = Math.random() * 2.2;
      parts.push({x:x, y:y, vx:Math.cos(b) * vv, vy:Math.sin(b) * vv - .4, life:1, d:.004 + Math.random() * .004,
        r:Math.random() * 1.1 + .5, star:false, tw:Math.random() * TAU, c:'#FFE6DA', g:.02, glitter:true});
    }
  }
  function launch(tx, ty){
    rockets.push({x:tx + (Math.random() - .5) * 160, y:H + 10, tx:tx, ty:ty, vy:-(7.5 + Math.random() * 3)});
  }

  function drawFx(t){
    fx.globalCompositeOperation = 'destination-out';
    fx.fillStyle = 'rgba(0,0,0,.18)';
    fx.fillRect(0,0,W,H);
    fx.globalCompositeOperation = 'lighter';
    var i, p;
    for (i = rockets.length - 1; i >= 0; i--){
      p = rockets[i];
      p.y += p.vy; p.x += (p.tx - p.x) * .035;
      fx.fillStyle = '#FFE6DA'; fx.beginPath(); fx.arc(p.x, p.y, 2.4, 0, TAU); fx.fill();
      fx.fillStyle = 'rgba(255,156,134,.5)'; fx.beginPath(); fx.arc(p.x, p.y + 6, 1.6, 0, TAU); fx.fill();
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
    drawStars(t);
    if (t > nextLaunch){
      launch(W * (.1 + Math.random() * .8), H * (.1 + Math.random() * .38));
      if (Math.random() < .4) launch(W * (.1 + Math.random() * .8), H * (.1 + Math.random() * .38));
      nextLaunch = t + 900 + Math.random() * 1300;
    }
    drawFx(t);
  }

  hero.addEventListener('pointerdown', function(e){
    var r = hero.getBoundingClientRect();
    burst(e.clientX - r.left, e.clientY - r.top, 200);
  });
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }, {threshold:0}).observe(hero);
  }
  window.addEventListener('resize', size);
  size();
  requestAnimationFrame(frame);
})();


/* Перенос формул Image Stream Hero (ruixen.ui) на чистый JS: те же параметры по умолчанию */
(function(){
  var P = {perspective:30, cardWidth:18, cardHeight:25, cardRadius:0.4, birthHeight:2.6, exitHeight:46,
           railBirth:-11, railExit:44, fan:3.3, turnBirth:6, turnExit:28, stops:24};
  var CARDS = 9, SPEED = 18, AXIS = 50;
  var IMAGES = ['portret-kostyum','makferrin-rukopozhatie','syutkin-afisha','tokarev','mikrofon','andzhelina-afisha','para','kuzmin','makferrin-poem','doroga-k-schastyu-proekt','yubilej-afisha'];
  var ALT = 'Фото';

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

  var persp = document.getElementById('persp');
  persp.style.perspective = P.perspective + 'cqw';
  persp.style.perspectiveOrigin = '50% ' + AXIS + '%';
  var root = document.getElementById('ish3d');

  [['ish-r', 0], ['ish-l', 5]].forEach(function(side){var name = side[0];
    for (var i = 0; i < CARDS; i++){
      var d = document.createElement('div');
      d.className = 'ish-card';
      d.style.cssText = 'left:50%;top:' + AXIS + '%;width:' + P.cardWidth + 'cqw;height:' + P.cardHeight + 'cqw;' +
        'margin-left:' + (-P.cardWidth / 2) + 'cqw;margin-top:' + (-P.cardHeight / 2) + 'cqw;border-radius:' + P.cardRadius + 'cqw;' +
        'animation:' + name + ' ' + SPEED + 's linear infinite;animation-delay:' + (-(i * SPEED) / CARDS) + 's';
      var im = new Image();
      im.src = '../img/' + IMAGES[(i + side[1]) % IMAGES.length] + '.jpg';
      im.alt = ''; im.decoding = 'async'; im.draggable = false;
      d.appendChild(im);
      root.appendChild(d);
    }
  });
})();



/* грамоты: открыть скан поверх страницы; без поддержки <dialog> работает обычная ссылка */
(function () {
  var view = document.querySelector('.doc-view');
  if (!view || typeof view.showModal !== 'function') return;
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
})();
