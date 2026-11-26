/*
 * 상세 페이지 배경 음악
 * 사용법: 페이지에 <audio id="bgm" src="..." loop preload="auto"></audio> 만 넣고 이 파일을 불러오면 됩니다.
 *  - 들어오면 작은 볼륨으로 재생 시도. 브라우저가 소리 자동재생을 막으면 첫 클릭/터치/키 입력 때 시작
 *  - 오른쪽 아래 BGM 버튼으로 켜고 끔. 끈 상태는 다른 작품 페이지에서도 다시 켜기 전까지 유지
 *  - 페이지 안 영상의 소리를 켜면 배경 음악은 잠시 멈추고, 영상을 다시 음소거하거나 멈추면 이어서 재생
 *  - 유튜브 영상을 클릭하면 배경 음악을 잠시 멈춤 (유튜브 소리 상태는 알 수 없어서 클릭 기준)
 */
(function () {
  var audio = document.getElementById('bgm');
  if (!audio) return;

  var KEY = 'yghBgm';
  var VOLUME = parseFloat(audio.getAttribute('data-volume')) || 0.25;

  // 버튼 만들기
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bgm-toggle';
  btn.innerHTML = '<span class="bgm-bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="bgm-label">BGM OFF</span>';
  audio.insertAdjacentElement('afterend', btn);
  var label = btn.querySelector('.bgm-label');

  var userOff = false;
  try { userOff = localStorage.getItem(KEY) === 'off'; } catch (e) {}
  audio.volume = VOLUME;

  function render() {
    var on = !audio.paused;
    btn.classList.toggle('is-on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? '배경 음악 끄기' : '배경 음악 켜기');
    label.textContent = on ? 'BGM ON' : 'BGM OFF';
  }
  function play() { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  audio.addEventListener('play', render);
  audio.addEventListener('pause', render);

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    resumeAfterVideo = false;
    if (audio.paused) { userOff = false; save('on'); play(); }
    else { userOff = true; save('off'); audio.pause(); }
  });

  var GESTURES = ['click', 'touchstart', 'keydown'];
  function firstGesture(e) {
    if (e && btn.contains(e.target)) return; // 버튼 클릭은 버튼이 직접 처리
    GESTURES.forEach(function (t) { document.removeEventListener(t, firstGesture, true); });
    if (!userOff && audio.paused && !resumeAfterVideo) play();
  }
  if (!userOff) {
    play();
    GESTURES.forEach(function (t) { document.addEventListener(t, firstGesture, true); });
  }

  // 페이지 안 영상(팝업 영상 포함)의 소리와 겹치지 않게
  var resumeAfterVideo = false;
  function audibleVideo() {
    var vids = document.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i];
      if (!v.paused && !v.muted && v.volume > 0) return true;
    }
    return false;
  }
  function checkVideos(e) {
    if (!e.target || e.target.tagName !== 'VIDEO') return;
    if (audibleVideo()) {
      if (!audio.paused) { resumeAfterVideo = true; audio.pause(); }
    } else if (resumeAfterVideo && !userOff) {
      resumeAfterVideo = false; play();
    }
  }
  ['play', 'pause', 'ended', 'volumechange', 'emptied'].forEach(function (t) {
    document.addEventListener(t, checkVideos, true);
  });

  // 유튜브 영상을 클릭하면 잠시 멈춤 (클릭하면 iframe으로 포커스가 넘어감)
  window.addEventListener('blur', function () {
    setTimeout(function () {
      var el = document.activeElement;
      if (el && el.tagName === 'IFRAME' && !audio.paused) { audio.pause(); }
    }, 0);
  });

  render();
})();
