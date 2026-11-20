(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  // Calm scroll reveal
  if (!('IntersectionObserver' in window)) return;
  var targets = document.querySelectorAll('.off-title, .card, .about, .now, .rail, .contact h2, .postcard');
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
