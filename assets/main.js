(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // Scroll reveal
  var targets = document.querySelectorAll('.ravix-grid, .features, .ravix-cta, .before, .rail-inner, .contact-title, .email, .socials');
  var thread = document.querySelector('.thread');
  if (reduce || !('IntersectionObserver' in window)) {
    if (thread) thread.classList.add('in');
    return;
  }
  targets.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  targets.forEach(function (el) { io.observe(el); });
  if (thread) io.observe(thread);

  // Cursor glow (pointer devices only)
  if (window.matchMedia('(pointer: fine)').matches) {
    var raf = 0;
    window.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        root.style.setProperty('--mx', e.clientX + 'px');
        root.style.setProperty('--my', e.clientY + 'px');
        raf = 0;
      });
    }, { passive: true });
  }

  // Count-up stats
  var counters = document.querySelectorAll('[data-count]');
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, end = +el.getAttribute('data-count'), t0 = performance.now();
      (function tick(t) {
        var p = Math.min(1, (t - t0) / 900);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { cio.observe(el); });
})();
