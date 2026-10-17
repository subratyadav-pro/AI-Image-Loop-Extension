// ============================================================
// AI Video Cinema — Fullscreen Player Script
// Receives live generated frames from background and plays them like a video
// ============================================================

let frames = [];
let currentIndex = 0;
let isPlaying = false;
let timer = null;
let fps = 4;

const imgEl       = document.getElementById('cinema-img');
const emptyEl     = document.getElementById('stage-empty');
const badgeEl     = document.getElementById('badge-overlay');
const scrubberEl  = document.getElementById('scrubber');
const metaEl      = document.getElementById('meta-text');
const playBtn     = document.getElementById('btn-play');
const prevBtn     = document.getElementById('btn-prev');
const nextBtn     = document.getElementById('btn-next');
const fpsSelect   = document.getElementById('fps-select');
const fsBtn       = document.getElementById('btn-fullscreen');

document.addEventListener('DOMContentLoaded', async () => {
  await fetchFrames();
  attachEvents();
  renderPlayer();
  if (frames.length > 1) {
    startPlayback();
  }
});

// ─── Fetch frames from background ───────────────────────────

async function fetchFrames() {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (res && res.state && Array.isArray(res.state.framesHistory)) {
      frames = res.state.framesHistory;
    }
  } catch (_) {}
}

// ─── Listen for live frame updates ──────────────────────────

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'STATE_UPDATE' && msg.state && Array.isArray(msg.state.framesHistory)) {
    const prevCount = frames.length;
    frames = msg.state.framesHistory;

    // If new frames arrived and player was idle, start playing!
    if (prevCount === 0 && frames.length > 0) {
      currentIndex = 0;
      renderPlayer();
      startPlayback();
    } else {
      renderPlayer();
    }
  }
});

// ─── Player Render ──────────────────────────────────────────

function renderPlayer() {
  if (frames.length === 0) {
    emptyEl.style.display = 'block';
    imgEl.style.display   = 'none';
    badgeEl.textContent   = 'Frame 0/0';
    scrubberEl.min        = 0;
    scrubberEl.max        = 0;
    scrubberEl.value      = 0;
    metaEl.textContent    = 'Waiting for loop to generate frames…';
    stopPlayback();
    return;
  }

  emptyEl.style.display = 'none';
  imgEl.style.display   = 'block';

  if (currentIndex >= frames.length) {
    currentIndex = 0;
  } else if (currentIndex < 0) {
    currentIndex = frames.length - 1;
  }

  const frame = frames[currentIndex];
  if (frame && imgEl.src !== frame.url) {
    imgEl.src = frame.url;
  }

  badgeEl.textContent = `Frame ${currentIndex + 1}/${frames.length} (${fps} FPS)`;
  scrubberEl.min   = 0;
  scrubberEl.max   = frames.length - 1;
  scrubberEl.value = currentIndex;

  if (frame) {
    metaEl.textContent = frame.prompt || `Frame #${currentIndex + 1}`;
    metaEl.title = frame.prompt || '';
  }

  playBtn.textContent = isPlaying ? '⏸️ Pause' : '▶️ Play';
}

// ─── Playback Controls ──────────────────────────────────────

function startPlayback() {
  stopPlayback();
  isPlaying = true;
  playBtn.textContent = '⏸️ Pause';

  const interval = Math.max(80, Math.floor(1000 / fps));
  timer = setInterval(() => {
    if (frames.length === 0) return;
    currentIndex = (currentIndex + 1) % frames.length;
    renderPlayer();
  }, interval);
}

function stopPlayback() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  isPlaying = false;
  playBtn.textContent = '▶️ Play';
}

function togglePlayback() {
  if (frames.length === 0) return;
  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function prevFrame() {
  stopPlayback();
  if (frames.length === 0) return;
  currentIndex = (currentIndex - 1 + frames.length) % frames.length;
  renderPlayer();
}

function nextFrame() {
  stopPlayback();
  if (frames.length === 0) return;
  currentIndex = (currentIndex + 1) % frames.length;
  renderPlayer();
}

// ─── Events & Hotkeys ───────────────────────────────────────

function attachEvents() {
  playBtn.addEventListener('click', togglePlayback);
  prevBtn.addEventListener('click', prevFrame);
  nextBtn.addEventListener('click', nextFrame);

  scrubberEl.addEventListener('input', (e) => {
    stopPlayback();
    currentIndex = parseInt(e.target.value) || 0;
    renderPlayer();
  });

  fpsSelect.addEventListener('change', (e) => {
    fps = parseInt(e.target.value) || 4;
    if (isPlaying) {
      startPlayback();
    } else {
      renderPlayer();
    }
  });

  fsBtn.addEventListener('click', toggleFullscreen);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayback();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      prevFrame();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      nextFrame();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
  });
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}
