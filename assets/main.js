(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var root = document.documentElement;
  var stage = document.querySelector('.stage');

  // Depth: the name drifts behind Raunak as you scroll, and leans gently toward the pointer.
  var ticking = false, px = 0, py = 0;
  function frame() {
    ticking = false;
    var h = stage.offsetHeight || 1;
    var s = Math.min(window.scrollY, h);
    stage.style.setProperty('--photo-y', (s * 0.12) + 'px');
    stage.style.setProperty('--name-y', (s * 0.32 + py) + 'px');
    stage.style.setProperty('--name-x', px + 'px');
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', request, { passive: true });
  if (window.matchMedia('(pointer: fine)').matches) {
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * -18;
      py = ((e.clientY - r.top) / r.height - 0.5) * -10;
      request();
    });
    stage.addEventListener('pointerleave', function () { px = 0; py = 0; request(); });
  }

  // Calm scroll reveal
  if (!('IntersectionObserver' in window)) return;
  var targets = document.querySelectorAll('.off-title, .card, .about, .now, .rail, .contact h2, .email, .socials');
  targets.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (el) { io.observe(el); });

  // Doodles: animate on hover/focus, and once when a card scrolls into view
  var cards = document.querySelectorAll('.card');
  var dio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      setTimeout(function () { el.classList.add('play'); setTimeout(function () { el.classList.remove('play'); }, 2200); }, 500);
      dio.unobserve(el);
    });
  }, { threshold: 0.6 });
  cards.forEach(function (c) {
    dio.observe(c);
    c.addEventListener('pointerenter', function () { c.classList.add('play'); });
    c.addEventListener('pointerleave', function () { c.classList.remove('play'); });
  });

  // Rotating word in the Off hours headline
  var words = document.querySelectorAll('.rot-word');
  var i = 0;
  if (words.length > 1) {
    setInterval(function () {
      if (document.hidden) return;
      var cur = words[i];
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      i = (i + 1) % words.length;
      var next = words[i];
      next.classList.remove('is-out'); next.classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-out'); }, 700);
    }, 2600);
  }
})();
