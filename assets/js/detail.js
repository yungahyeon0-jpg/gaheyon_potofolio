/**
 * Project detail page: autoplay videos (muted) while they are on screen.
 * 브라우저 정책상 소리 없이(muted)만 자동재생 가능 — 소리는 컨트롤에서 켤 수 있음.
 * 화면에 보이면 재생, 벗어나면 일시정지. 사용자가 직접 멈춘 영상은 다시 자동재생하지 않음.
 */
(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll('.detail-page video'));
  if (!videos.length) return;

  videos.forEach(function (v) {
    v.muted = true;
    v.setAttribute('muted', '');
    v.addEventListener('pause', function () {
      if (!v._autoPausing) v._userPaused = true;
      v._autoPausing = false;
    });
    v.addEventListener('play', function () { v._userPaused = false; });
  });

  if (!('IntersectionObserver' in window)) return;   // 구형 브라우저: autoplay 속성으로 바로 재생

  // 화면 밖 영상은 먼저 멈춰두고, 보일 때 재생
  videos.forEach(function (v) { v.removeAttribute('autoplay'); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var v = entry.target;
      if (entry.isIntersecting) {
        if (!v._userPaused && v.paused) {
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        }
      } else if (!v.paused) {
        v._autoPausing = true;
        v.pause();
      }
    });
  }, { threshold: 0.4 });

  videos.forEach(function (v) { observer.observe(v); });
})();

/**
 * Project detail page: highlight the tab of the section in view.
 */
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.detail-tabs a[href^="#"]'));
  if (!tabs.length || !('IntersectionObserver' in window)) return;

  function setActive(id) {
    tabs.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  tabs.forEach(function (a) {
    var section = document.querySelector(a.getAttribute('href'));
    if (section) observer.observe(section);
  });
})();
