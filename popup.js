// ============================================================
// Popup Script — AI Image Loop Extension
// Coordinates UI state, auto-generation, custom prompts & settings
// ============================================================

// ─── State ──────────────────────────────────────────────────

let prompts = [];
let bgState = null;
let activeTab = 'control';

// ─── Init ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await fetchState();
  renderPromptList();
  updateUI();
  listenForStateUpdates();
  attachEventListeners();
});

// ─── Event Listeners ─────────────────────────────────────────

function attachEventListeners() {
  // Tabs
  document.getElementById('tab-control').addEventListener('click', () => switchTab('control'));
  document.getElementById('tab-prompts').addEventListener('click', () => switchTab('prompts'));
  document.getElementById('tab-video').addEventListener('click', () => switchTab('video'));
  document.getElementById('tab-log').addEventListener('click', () => switchTab('log'));

  // Control buttons
  document.getElementById('btn-start').addEventListener('click', startLoop);
  document.getElementById('btn-stop').addEventListener('click', stopLoop);

  // Platform selection persistence
  document.querySelectorAll('input[name="platform"]').forEach(radio => {
    radio.addEventListener('change', () => {
      chrome.storage.local.set({ platform: radio.value });
    });
  });

  // Prompt Mode selection (Auto-Generate vs Custom)
  document.querySelectorAll('input[name="promptMode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const mode = radio.value;
      chrome.storage.local.set({ promptMode: mode });
      chrome.runtime.sendMessage({ type: 'UPDATE_PROMPT_MODE', promptMode: mode }).catch(() => {});
      updateModeVisibility(mode);
      updateStats();
    });
  });

  // Auto-Theme selection
  const themeSelect = document.getElementById('auto-theme');
  themeSelect?.addEventListener('change', () => {
    const theme = themeSelect.value;
    chrome.storage.local.set({ autoTheme: theme });
    chrome.runtime.sendMessage({ type: 'UPDATE_AUTO_THEME', autoTheme: theme }).catch(() => {});
    showToast(`Theme set to: ${themeSelect.options[themeSelect.selectedIndex].text}`);
  });

  // Order selection persistence (for custom mode)
  document.querySelectorAll('input[name="order"]').forEach(radio => {
    radio.addEventListener('change', () => {
      chrome.storage.local.set({ orderMode: radio.value });
      chrome.runtime.sendMessage({ type: 'UPDATE_ORDER_MODE', orderMode: radio.value }).catch(() => {});
    });
  });

  // Max loops persistence & sync
  const maxLoopsInput = document.getElementById('max-loops');
  maxLoopsInput.addEventListener('input', () => {
    const maxLoops = parseInt(maxLoopsInput.value) || 0;
    chrome.storage.local.set({ maxLoops });
    chrome.runtime.sendMessage({ type: 'UPDATE_MAX_LOOPS', maxLoops }).catch(() => {});
  });

  // Auto-Download persistence & sync
  const autoDownloadEl = document.getElementById('auto-download');
  autoDownloadEl?.addEventListener('change', () => {
    const val = autoDownloadEl.checked;
    chrome.storage.local.set({ autoDownload: val });
    chrome.runtime.sendMessage({ type: 'UPDATE_AUTO_DOWNLOAD', autoDownload: val }).catch(() => {});
    showToast(`Auto-download ${val ? 'enabled (saving to Downloads)' : 'disabled'}`);
  });

  // Think Longer persistence & sync
  const thinkLongerEl = document.getElementById('think-longer');
  thinkLongerEl?.addEventListener('change', () => {
    const val = thinkLongerEl.checked;
    chrome.storage.local.set({ thinkLonger: val });
    chrome.runtime.sendMessage({ type: 'UPDATE_THINK_LONGER', thinkLonger: val }).catch(() => {});
    showToast(`Think Longer ${val ? 'enabled (extended reasoning)' : 'disabled'}`);
  });

  // Preset loop buttons
  document.getElementById('btn-loop-1')?.addEventListener('click', () => setMaxLoops(1, '1x'));
  document.getElementById('btn-loop-2')?.addEventListener('click', () => setMaxLoops(2, '2x'));
  document.getElementById('btn-loop-4')?.addEventListener('click', () => setMaxLoops(4, '4x'));
  document.getElementById('btn-loop-inf')?.addEventListener('click', () => setMaxLoops(0, 'infinite (repeats forever)'));

  // Auto-fill buttons in Prompts tab
  document.getElementById('btn-load-battle')?.addEventListener('click', loadXiaoYanBattle);
  document.getElementById('btn-load-flame-video')?.addEventListener('click', loadFlameVideoReel);
  document.getElementById('btn-load-flame-emperor')?.addEventListener('click', loadFlameEmperorStoryboard);
  document.getElementById('btn-auto-fill-3')?.addEventListener('click', () => autoAddPrompts(3));
  document.getElementById('btn-auto-fill-5')?.addEventListener('click', () => autoAddPrompts(5));

  // Video player controls
  document.getElementById('btn-video-play')?.addEventListener('click', toggleVideoPlayback);
  document.getElementById('btn-video-prev')?.addEventListener('click', prevVideoFrame);
  document.getElementById('btn-video-next')?.addEventListener('click', nextVideoFrame);
  document.getElementById('video-scrubber')?.addEventListener('input', onScrubberInput);
  document.getElementById('video-fps')?.addEventListener('change', onFpsChange);
  document.getElementById('btn-popout-video')?.addEventListener('click', popoutCinema);
  document.getElementById('btn-clear-frames')?.addEventListener('click', clearFrames);

  // Prompt buttons
  document.getElementById('btn-add-prompt').addEventListener('click', addPrompt);
  document.getElementById('btn-clear-prompts').addEventListener('click', clearPrompts);

  // Log button
  document.getElementById('btn-clear-log').addEventListener('click', clearLog);

  // Ctrl+Enter in textarea to add prompt
  document.getElementById('new-prompt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      addPrompt();
    }
  });
}

function setMaxLoops(val, label) {
  document.getElementById('max-loops').value = val;
  chrome.storage.local.set({ maxLoops: val });
  chrome.runtime.sendMessage({ type: 'UPDATE_MAX_LOOPS', maxLoops: val }).catch(() => {});
  showToast(`Set to ${label}`);
}

function updateModeVisibility(mode) {
  const themeSection = document.getElementById('theme-section');
  const orderSection = document.getElementById('order-section');
  const loopLabel    = document.getElementById('loop-label');

  if (mode === 'auto') {
    if (themeSection) themeSection.style.display = 'flex';
    if (orderSection) orderSection.style.display = 'none';
    if (loopLabel) loopLabel.innerHTML = 'Images <span class="label-hint">(total to generate, 0 = infinite)</span>';
  } else {
    if (themeSection) themeSection.style.display = 'none';
    if (orderSection) orderSection.style.display = 'flex';
    if (loopLabel) loopLabel.innerHTML = 'Loops <span class="label-hint">(repeats of all prompts)</span>';
  }
}

// ─── Auto-Add Prompts ───────────────────────────────────────

function autoAddPrompts(count) {
  const theme = document.getElementById('auto-theme')?.value || 'xiao_yan_battle';
  for (let i = 0; i < count; i++) {
    const p = generateRandomPrompt(theme, prompts.length + 1);
    prompts.push(p);
  }
  savePrompts();
  renderPromptList();
  updateStats();
  showToast(`Added ${count} auto-generated prompts!`);
}

function loadFlameVideoReel() {
  const frames = (typeof FLAME_EMPEROR_VIDEO_SEQUENCE !== 'undefined' && Array.isArray(FLAME_EMPEROR_VIDEO_SEQUENCE))
    ? FLAME_EMPEROR_VIDEO_SEQUENCE
    : (window.FLAME_EMPEROR_VIDEO_SEQUENCE || []);

  if (!frames || frames.length === 0) {
    showToast('⚠️ Could not load video sequence frames.');
    return;
  }

  prompts = [...frames];
  savePrompts();

  // Set prompt mode to custom and order to sequential
  const customRadio = document.querySelector('input[name="promptMode"][value="custom"]');
  if (customRadio) {
    customRadio.checked = true;
    chrome.storage.local.set({ promptMode: 'custom' });
    chrome.runtime.sendMessage({ type: 'UPDATE_PROMPT_MODE', promptMode: 'custom' }).catch(() => {});
    updateModeVisibility('custom');
  }

  const seqRadio = document.querySelector('input[name="order"][value="sequential"]');
  if (seqRadio) {
    seqRadio.checked = true;
    chrome.storage.local.set({ orderMode: 'sequential' });
    chrome.runtime.sendMessage({ type: 'UPDATE_ORDER_MODE', orderMode: 'sequential' }).catch(() => {});
  }

  renderPromptList();
  updateStats();
  showToast('🎬 Loaded 12 continuous video motion frames! Ready to play.');
}

function loadFlameEmperorStoryboard() {
  const frames = (typeof FLAME_EMPEROR_CANON_FRAMES !== 'undefined' && Array.isArray(FLAME_EMPEROR_CANON_FRAMES))
    ? FLAME_EMPEROR_CANON_FRAMES
    : (window.FLAME_EMPEROR_CANON_FRAMES || []);

  if (!frames || frames.length === 0) {
    showToast('⚠️ Could not load storyboard frames.');
    return;
  }

  prompts = [...frames];
  savePrompts();

  // Set prompt mode to custom and order to sequential
  const customRadio = document.querySelector('input[name="promptMode"][value="custom"]');
  if (customRadio) {
    customRadio.checked = true;
    chrome.storage.local.set({ promptMode: 'custom' });
    chrome.runtime.sendMessage({ type: 'UPDATE_PROMPT_MODE', promptMode: 'custom' }).catch(() => {});
    updateModeVisibility('custom');
  }

  const seqRadio = document.querySelector('input[name="order"][value="sequential"]');
  if (seqRadio) {
    seqRadio.checked = true;
    chrome.storage.local.set({ orderMode: 'sequential' });
    chrome.runtime.sendMessage({ type: 'UPDATE_ORDER_MODE', orderMode: 'sequential' }).catch(() => {});
  }

  renderPromptList();
  updateStats();
  showToast('🔥 Loaded 16 Flame Emperor novel frames (Sequential Storyboard)!');
}

function loadXiaoYanBattle() {
  const frames = (typeof XIAO_YAN_VS_3STAR_SEQUENCE !== 'undefined' && Array.isArray(XIAO_YAN_VS_3STAR_SEQUENCE))
    ? XIAO_YAN_VS_3STAR_SEQUENCE
    : (window.XIAO_YAN_VS_3STAR_SEQUENCE || []);

  if (!frames || frames.length === 0) {
    showToast('⚠️ Could not load battle sequence frames.');
    return;
  }

  prompts = [...frames];
  savePrompts();

  // Switch to custom + sequential mode
  const customRadio = document.querySelector('input[name="promptMode"][value="custom"]');
  if (customRadio) {
    customRadio.checked = true;
    chrome.storage.local.set({ promptMode: 'custom' });
    chrome.runtime.sendMessage({ type: 'UPDATE_PROMPT_MODE', promptMode: 'custom' }).catch(() => {});
    updateModeVisibility('custom');
  }

  const seqRadio = document.querySelector('input[name="order"][value="sequential"]');
  if (seqRadio) {
    seqRadio.checked = true;
    chrome.storage.local.set({ orderMode: 'sequential' });
    chrome.runtime.sendMessage({ type: 'UPDATE_ORDER_MODE', orderMode: 'sequential' }).catch(() => {});
  }

  renderPromptList();
  updateStats();
  showToast('⚔️ Loaded Ep.08→09: Xiao Yan vs Peak 3-Star Dou Di — 24 keyframes ready! (Ep.08 world-build + Ep.09 full battle)');
}

// ─── Storage ─────────────────────────────────────────────────

async function loadSettings() {
  const result = await chrome.storage.local.get([
    'prompts',
    'platform',
    'promptMode',
    'autoTheme',
    'orderMode',
    'maxLoops',
    'autoDownload',
    'thinkLonger'
  ]);

  prompts = result.prompts || [];

  if (result.platform) {
    const radio = document.querySelector(`input[name="platform"][value="${result.platform}"]`);
    if (radio) radio.checked = true;
  }

  // Prompt Mode (default to 'auto')
  const promptMode = result.promptMode || 'auto';
  const modeRadio = document.querySelector(`input[name="promptMode"][value="${promptMode}"]`);
  if (modeRadio) modeRadio.checked = true;
  updateModeVisibility(promptMode);

  // Auto Theme
  if (result.autoTheme) {
    const themeSelect = document.getElementById('auto-theme');
    if (themeSelect) themeSelect.value = result.autoTheme;
  }

  // Order Mode
  const order = result.orderMode || 'random';
  const orderRadio = document.querySelector(`input[name="order"][value="${order}"]`);
  if (orderRadio) orderRadio.checked = true;

  // Max loops
  if (result.maxLoops !== undefined) {
    const ml = document.getElementById('max-loops');
    if (ml) ml.value = result.maxLoops;
  }

  // Auto Download
  const autoDownload = result.autoDownload !== undefined ? result.autoDownload : true;
  const autoDownloadEl = document.getElementById('auto-download');
  if (autoDownloadEl) autoDownloadEl.checked = autoDownload;

  // Think Longer (default true)
  const thinkLonger = result.thinkLonger !== undefined ? result.thinkLonger : true;
  const thinkLongerEl = document.getElementById('think-longer');
  if (thinkLongerEl) thinkLongerEl.checked = thinkLonger;
}

async function savePrompts() {
  await chrome.storage.local.set({ prompts });
  try {
    await chrome.runtime.sendMessage({ type: 'UPDATE_PROMPTS', prompts });
  } catch (_) {}
}

// ─── Background Communication ────────────────────────────────

async function fetchState() {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (res && res.state) bgState = res.state;
  } catch (_) {}
}

function listenForStateUpdates() {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'STATE_UPDATE') {
      bgState = msg.state;
      updateUI();
      if (activeTab === 'log') renderLog();
    }
  });
}

// ─── Loop Control ────────────────────────────────────────────

async function startLoop() {
  const promptMode = document.querySelector('input[name="promptMode"]:checked')?.value || 'auto';
  const platform   = document.querySelector('input[name="platform"]:checked')?.value || 'both';
  const autoTheme  = document.getElementById('auto-theme')?.value || 'mixed';
  const orderMode  = document.querySelector('input[name="order"]:checked')?.value || 'random';
  const maxLoops   = parseInt(document.getElementById('max-loops').value) || 0;

  // If in custom mode, check that prompts exist
  if (promptMode === 'custom' && prompts.length === 0) {
    switchTab('prompts');
    document.getElementById('new-prompt').focus();
    showToast('⚠️ Add custom prompts or switch to Auto-Generate!');
    return;
  }

  const autoDownload = document.getElementById('auto-download')?.checked ?? true;
  const thinkLonger  = document.getElementById('think-longer')?.checked ?? true;

  try {
    await chrome.runtime.sendMessage({
      type: 'START_LOOP',
      prompts,
      platform,
      promptMode,
      autoTheme,
      autoDownload,
      thinkLonger,
      orderMode,
      maxLoops
    });

    if (promptMode === 'auto') {
      const countMsg = maxLoops > 0 ? `${maxLoops} prompts` : 'infinite prompts';
      showToast(`🤖 Auto-Loop started! Generating ${countMsg}…`);
    } else {
      const orderText = orderMode === 'random' ? '🔀 random' : '➡️ sequential';
      if (maxLoops > 0) {
        showToast(`Starting ${maxLoops} loops (${prompts.length * maxLoops} prompts, ${orderText})`);
      } else {
        showToast(`Starting continuous loop (${orderText})`);
      }
    }
  } catch (e) {
    showToast('❌ Could not connect to background. Try reloading the extension.');
    return;
  }

  await fetchState();
  updateUI();
}

async function stopLoop() {
  try {
    await chrome.runtime.sendMessage({ type: 'STOP_LOOP' });
  } catch (_) {}
  await fetchState();
  updateUI();
}

// ─── Prompt Management ───────────────────────────────────────

function addPrompt() {
  const textarea = document.getElementById('new-prompt');
  const text = textarea.value.trim();
  if (!text) {
    textarea.focus();
    return;
  }

  prompts.push(text);
  savePrompts();
  renderPromptList();
  textarea.value = '';
  textarea.focus();
  updateStats();
}

function deletePrompt(index) {
  prompts.splice(index, 1);
  savePrompts();
  renderPromptList();
  updateStats();
}

function clearPrompts() {
  if (prompts.length === 0) return;
  if (!confirm('Clear all prompts?')) return;
  prompts = [];
  savePrompts();
  renderPromptList();
  updateStats();
}

// ─── Render ──────────────────────────────────────────────────

function renderPromptList() {
  const list = document.getElementById('prompt-list');
  if (prompts.length === 0) {
    list.innerHTML = '<div class="empty-state">No prompts yet. Add one above or click +3 Auto ☝️</div>';
    return;
  }

  const currentIndex = bgState && bgState.queueIndex > 0
    ? (bgState.queueIndex - 1) % prompts.length
    : -1;

  list.innerHTML = prompts.map((p, i) => `
    <div class="prompt-item ${bgState && bgState.running && i === currentIndex ? 'active-prompt' : ''}" data-index="${i}">
      <span class="prompt-index">${i + 1}</span>
      <span class="prompt-text">${escapeHtml(p)}</span>
      <button class="prompt-del" data-del="${i}" title="Delete">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.prompt-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-del'));
      deletePrompt(idx);
    });
  });
}

function renderLog() {
  const list = document.getElementById('log-list');
  if (!bgState || !bgState.log || bgState.log.length === 0) {
    list.innerHTML = '<div class="empty-state">No activity yet. Start the loop!</div>';
    document.getElementById('log-badge').textContent = '0';
    return;
  }

  document.getElementById('log-badge').textContent = bgState.log.length;

  list.innerHTML = bgState.log.map(entry => {
    const cls = getLogClass(entry.msg);
    return `
      <div class="log-entry ${cls}">
        <span class="log-time">${entry.time}</span>
        <span class="log-msg">${escapeHtml(entry.msg)}</span>
      </div>
    `;
  }).join('');
}

function getLogClass(msg) {
  if (msg.startsWith('🖼️') || msg.startsWith('✔️') || msg.startsWith('✅') || msg.startsWith('🚀') || msg.startsWith('🎉')) return 'log-ok';
  if (msg.startsWith('⚠️') || msg.startsWith('🛑') || msg.startsWith('⏱️')) return 'log-warn';
  if (msg.startsWith('❌')) return 'log-error';
  return 'log-info';
}

// ─── UI State Sync ───────────────────────────────────────────

function updateUI() {
  if (!bgState) return;

  const running = bgState.running;
  const status  = bgState.status || 'idle';

  // Status badge
  const badge = document.getElementById('status-badge');
  badge.textContent = status.toUpperCase();
  badge.className   = `status-badge ${status}`;

  // Logo spin while running
  const logoIcon = document.getElementById('logo-icon');
  logoIcon.classList.toggle('spinning', running);

  // Buttons
  document.getElementById('btn-start').disabled = running;
  document.getElementById('btn-stop').disabled  = !running;

  // Stats
  updateStats();

  // Platform dots
  updatePlatformDots();

  // Log badge
  if (bgState.log) {
    document.getElementById('log-badge').textContent = bgState.log.length;
  }

  // Frame badge (for Video Player)
  const frameCount = bgState && bgState.framesHistory ? bgState.framesHistory.length : 0;
  const frameBadge = document.getElementById('frame-badge');
  if (frameBadge) frameBadge.textContent = frameCount;

  // Re-render log if on log tab
  if (activeTab === 'log') renderLog();

  // Re-render prompt list for active highlight
  if (activeTab === 'prompts') renderPromptList();

  // Re-render video player if on video tab
  if (activeTab === 'video') renderVideoPlayer();
}

function updateStats() {
  const loopEl          = document.getElementById('stat-loop');
  const promptEl        = document.getElementById('stat-prompt');
  const totalEl         = document.getElementById('stat-total');
  const totalLabelEl    = document.getElementById('stat-total-label');

  const currentMode = document.querySelector('input[name="promptMode"]:checked')?.value || 'auto';

  if (currentMode === 'auto') {
    if (totalEl) totalEl.textContent = 'Auto';
    if (totalLabelEl) totalLabelEl.textContent = 'AI Mode';

    if (bgState) {
      const sent = bgState.totalPromptsSent || 0;
      const maxL = bgState.maxLoops > 0 ? `/${bgState.maxLoops}` : '';
      loopEl.textContent = `${sent}${maxL}`;
    } else {
      loopEl.textContent = '0';
    }
  } else {
    if (totalEl) totalEl.textContent = prompts.length;
    if (totalLabelEl) totalLabelEl.textContent = 'Prompts';

    if (bgState) {
      const cycle = bgState.currentLoop || 1;
      const maxL = bgState.maxLoops > 0 ? `/${bgState.maxLoops}` : '';
      const completed = bgState.completedLoops || 0;
      loopEl.textContent = bgState.running ? `${cycle}${maxL}` : `${completed}${maxL}`;
    } else {
      loopEl.textContent = '0';
    }
  }

  if (bgState && bgState.currentPrompt) {
    const p = bgState.currentPrompt;
    promptEl.textContent = p.length > 14 ? p.slice(0, 14) + '…' : p;
    promptEl.title = p;
  } else {
    promptEl.textContent = '—';
  }
}

function updatePlatformDots() {
  if (!bgState) return;

  const platform = bgState.platform;
  const running  = bgState.running;

  const dotChatGPT = document.getElementById('dot-chatgpt');
  const dotGemini  = document.getElementById('dot-gemini');

  if (!running) {
    dotChatGPT.className = 'ps-dot dot-idle';
    dotGemini.className  = 'ps-dot dot-idle';
    return;
  }

  if (platform === 'chatgpt' || platform === 'both') {
    dotChatGPT.className = bgState.chatgptDone ? 'ps-dot dot-done' : 'ps-dot dot-working';
  } else {
    dotChatGPT.className = 'ps-dot dot-idle';
  }

  if (platform === 'gemini' || platform === 'both') {
    dotGemini.className = bgState.geminiDone ? 'ps-dot dot-done' : 'ps-dot dot-working';
  } else {
    dotGemini.className = 'ps-dot dot-idle';
  }
}

// ─── Tab Switching ───────────────────────────────────────────

function switchTab(name) {
  activeTab = name;

  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));

  document.getElementById(`tab-${name}`).classList.add('active');
  document.getElementById(`panel-${name}`).classList.remove('hidden');

  if (name === 'log') renderLog();
  if (name === 'prompts') renderPromptList();
  if (name === 'video') {
    renderVideoPlayer();
    if (!videoState.timer && (bgState?.framesHistory?.length || 0) > 1) {
      startVideoPlayback();
    }
  }
}

// ─── Video Player Controller ────────────────────────────────

let videoState = {
  isPlaying: false,
  currentIndex: 0,
  timer: null,
  fps: 3
};

function renderVideoPlayer() {
  const frames = (bgState && bgState.framesHistory) ? bgState.framesHistory : [];
  const emptyEl = document.getElementById('cinema-empty');
  const imgEl   = document.getElementById('video-display-img');
  const badgeEl = document.getElementById('cinema-badge');
  const scrubEl = document.getElementById('video-scrubber');
  const metaEl  = document.getElementById('video-meta-prompt');
  const playBtn = document.getElementById('btn-video-play');

  if (frames.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (imgEl)   imgEl.style.display   = 'none';
    if (badgeEl) badgeEl.textContent   = 'Frame 0/0';
    if (scrubEl) {
      scrubEl.min   = 0;
      scrubEl.max   = 0;
      scrubEl.value = 0;
    }
    if (metaEl)  metaEl.textContent    = 'Start the loop to stream frames into this player!';
    stopVideoPlayback();
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (imgEl)   imgEl.style.display   = 'block';

  // Ensure index is within range
  if (videoState.currentIndex >= frames.length) {
    videoState.currentIndex = 0;
  } else if (videoState.currentIndex < 0) {
    videoState.currentIndex = frames.length - 1;
  }

  const currentFrame = frames[videoState.currentIndex];
  if (imgEl && currentFrame) {
    if (imgEl.src !== currentFrame.url) {
      imgEl.src = currentFrame.url;
    }
  }

  if (badgeEl) {
    badgeEl.textContent = `Frame ${videoState.currentIndex + 1}/${frames.length} (${videoState.fps} FPS)`;
  }

  if (scrubEl) {
    scrubEl.min   = 0;
    scrubEl.max   = frames.length - 1;
    scrubEl.value = videoState.currentIndex;
  }

  if (metaEl && currentFrame) {
    metaEl.textContent = currentFrame.prompt || 'Generated frame';
    metaEl.title = currentFrame.prompt || '';
  }

  if (playBtn) {
    playBtn.textContent = videoState.isPlaying ? '⏸️ Pause' : '▶️ Play';
  }
}

function startVideoPlayback() {
  stopVideoPlayback();
  videoState.isPlaying = true;
  const playBtn = document.getElementById('btn-video-play');
  if (playBtn) playBtn.textContent = '⏸️ Pause';

  const interval = Math.max(80, Math.floor(1000 / videoState.fps));
  videoState.timer = setInterval(() => {
    const frames = (bgState && bgState.framesHistory) ? bgState.framesHistory : [];
    if (frames.length === 0) return;
    videoState.currentIndex = (videoState.currentIndex + 1) % frames.length;
    renderVideoPlayer();
  }, interval);
}

function stopVideoPlayback() {
  if (videoState.timer) {
    clearInterval(videoState.timer);
    videoState.timer = null;
  }
  videoState.isPlaying = false;
  const playBtn = document.getElementById('btn-video-play');
  if (playBtn) playBtn.textContent = '▶️ Play';
}

function toggleVideoPlayback() {
  const frames = (bgState && bgState.framesHistory) ? bgState.framesHistory : [];
  if (frames.length === 0) {
    showToast('⚠️ No frames to play yet. Run the loop first!');
    return;
  }

  if (videoState.isPlaying) {
    stopVideoPlayback();
    showToast('⏸️ Video paused');
  } else {
    startVideoPlayback();
    showToast(`▶️ Playing at ${videoState.fps} FPS`);
  }
}

function prevVideoFrame() {
  stopVideoPlayback();
  const frames = (bgState && bgState.framesHistory) ? bgState.framesHistory : [];
  if (frames.length === 0) return;
  videoState.currentIndex = (videoState.currentIndex - 1 + frames.length) % frames.length;
  renderVideoPlayer();
}

function nextVideoFrame() {
  stopVideoPlayback();
  const frames = (bgState && bgState.framesHistory) ? bgState.framesHistory : [];
  if (frames.length === 0) return;
  videoState.currentIndex = (videoState.currentIndex + 1) % frames.length;
  renderVideoPlayer();
}

function onScrubberInput(e) {
  stopVideoPlayback();
  videoState.currentIndex = parseInt(e.target.value) || 0;
  renderVideoPlayer();
}

function onFpsChange(e) {
  videoState.fps = parseInt(e.target.value) || 3;
  if (videoState.isPlaying) {
    startVideoPlayback();
  } else {
    renderVideoPlayer();
  }
}

function popoutCinema() {
  chrome.tabs.create({ url: chrome.runtime.getURL('player.html') });
}

async function clearFrames() {
  if (!confirm('Clear all video reel frames?')) return;
  stopVideoPlayback();
  videoState.currentIndex = 0;
  try {
    await chrome.runtime.sendMessage({ type: 'CLEAR_FRAMES' });
  } catch (_) {}
  if (bgState) bgState.framesHistory = [];
  renderVideoPlayer();
  showToast('🎬 Cleared video reel frames');
}

function clearLog() {
  if (bgState) bgState.log = [];
  renderLog();
}

// ─── Utils ───────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '44px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#a855f7',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    padding: '8px 16px',
    borderRadius: '20px',
    zIndex: '9999',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 14px rgba(168,85,247,0.4)'
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}
