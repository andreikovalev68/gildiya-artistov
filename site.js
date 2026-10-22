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
