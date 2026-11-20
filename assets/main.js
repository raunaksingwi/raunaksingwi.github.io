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
  var targets = document.querySelectorAll('.about, .now, .career li, .figures, .rail, .contact h2, .email, .socials');
  targets.forEach(function (el) { el.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (el) { io.observe(el); });
})();
