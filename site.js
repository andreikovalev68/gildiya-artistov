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
