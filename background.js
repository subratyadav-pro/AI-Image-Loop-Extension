// ============================================================
// Background Service Worker — AI Image Loop Extension
// Coordinates prompt sending, auto-generation, and loop cycles
// ============================================================

importScripts('prompt_generator.js');

let state = {
  running: false,
  platform: 'both',
  promptMode: 'auto',   // 'auto' (extension creates prompts) or 'custom' (user list)
  autoTheme: 'xiao_yan_battle',  // 'xiao_yan_battle', 'flame_video', 'flame_emperor', 'cartoon_story', etc.
  autoDownload: true,    // Automatically download generated images
  thinkLonger: true,     // Instruct ChatGPT to use extended reasoning / Think button
  orderMode: 'random',   // 'random' or 'sequential'
  prompts: [],
  currentQueue: [],
  queueIndex: 0,
  currentLoop: 1,
  completedLoops: 0,
  totalPromptsSent: 0,
  loopCount: 0,
  maxLoops: 0,
  chatgptTabId: null,
  geminiTabId: null,
  chatgptDone: false,
  geminiDone: false,
  chatgptDownloaded: false,
  geminiDownloaded: false,
  currentPrompt: '',
  status: 'idle',
  log: [],
  framesHistory: []
};

// ─── State Persistence (MV3 Service Worker Safety) ───────────

async function saveState() {
  try {
    await chrome.storage.local.set({
      loopWorkerState: {
        running: state.running,
        platform: state.platform,
        promptMode: state.promptMode,
        autoTheme: state.autoTheme,
        autoDownload: state.autoDownload,
        thinkLonger: state.thinkLonger,
        orderMode: state.orderMode,
        prompts: state.prompts,
        currentQueue: state.currentQueue,
        queueIndex: state.queueIndex,
        currentLoop: state.currentLoop,
        completedLoops: state.completedLoops,
        totalPromptsSent: state.totalPromptsSent,
        loopCount: state.loopCount,
        maxLoops: state.maxLoops,
        chatgptTabId: state.chatgptTabId,
        geminiTabId: state.geminiTabId,
        chatgptDone: state.chatgptDone,
        geminiDone: state.geminiDone,
        currentPrompt: state.currentPrompt,
        status: state.status,
        framesHistory: state.framesHistory,
        log: state.log.slice(0, 50)
      }
    });
  } catch (_) {}
}

async function loadState() {
  try {
    const data = await chrome.storage.local.get('loopWorkerState');
    if (data && data.loopWorkerState) {
      Object.assign(state, data.loopWorkerState);
    }
  } catch (_) {}
}

// Restore state immediately upon worker wake-up
loadState();

// Chrome Alarms handle wakeups if Service Worker goes to sleep
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'loopKeepAlive') {
    await loadState();
    if (state.running) {
      checkIfRoundDone();
    }
  }
  if (alarm.name === 'nextLoopTimer') {
    await loadState();
    if (state.running) {
      runLoop();
    }
  }
});

// ─── Helpers ────────────────────────────────────────────────

function sanitizeFilename(str) {
  return (str || '')
    .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 45);
}

async function getLatestImageUrlFromTab(tabId, platform) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (plat) => {
        let imgs = [];
        if (plat.toLowerCase().includes('chatgpt')) {
          imgs = Array.from(document.querySelectorAll('main img, article img, [data-testid^="conversation-turn"] img, div[class*="image"] img'));
        } else {
          imgs = Array.from(document.querySelectorAll('model-response img, .response-container img, [class*="image-gen"] img, [data-test-id*="image"] img, message-content img'));
        }
        for (let i = imgs.length - 1; i >= 0; i--) {
          const img = imgs[i];
          const src = (img.src || img.currentSrc || '').toLowerCase();
          if (src.includes('avatar') || src.includes('favicon') || src.includes('logo') || src.includes('icon') || src.includes('profile')) continue;
          if (img.naturalWidth > 120 || img.width > 120 || src.includes('oaiusercontent') || src.includes('blob:') || src.includes('googleusercontent')) {
            return img.src || img.currentSrc;
          }
        }
        return null;
      },
      args: [platform]
    });
    return results?.[0]?.result || null;
  } catch (_) {
    return null;
  }
}

const downloadedUrlsSet = new Set();

async function downloadGeneratedImage(imageUrl, platform, promptText, promptNum) {
  if (!state.autoDownload) return;

  const isChatGPT = platform.toLowerCase().includes('chatgpt');
  if (isChatGPT && state.chatgptDownloaded) return;
  if (!isChatGPT && state.geminiDownloaded) return;

  // If no direct imageUrl was sent from content script, attempt to grab from tab
  if (!imageUrl) {
    const tabId = isChatGPT ? state.chatgptTabId : state.geminiTabId;
    if (tabId) {
      imageUrl = await getLatestImageUrlFromTab(tabId, platform);
    }
  }

  if (!imageUrl) {
    addLog(`ℹ️ No image found to download for ${platform}.`);
    return;
  }

  // Prevent duplicate downloads of the same image URL
  if (downloadedUrlsSet.has(imageUrl)) {
    addLog(`⚠️ Skipping duplicate: identical image was already downloaded previously.`);
    return;
  }
  downloadedUrlsSet.add(imageUrl);

  // Mark downloaded for this round
  if (isChatGPT) state.chatgptDownloaded = true;
  else state.geminiDownloaded = true;

  // Add to in-memory video reel
  state.framesHistory.push({
    index: state.framesHistory.length + 1,
    url: imageUrl,
    platform: platform || 'AI',
    prompt: promptText || '',
    time: new Date().toLocaleTimeString()
  });
  if (state.framesHistory.length > 80) state.framesHistory.shift();
  broadcastState();

  try {
    let namePart = 'image';
    const frameMatch = (promptText || '').match(/frame\s*#?(\d+)/i);
    if (frameMatch) {
      namePart = `FlameEmperor_Frame_${String(frameMatch[1]).padStart(2, '0')}`;
    } else {
      const cleanPrompt = sanitizeFilename((promptText || '').replace(/^make an image of\s*/i, ''));
      namePart = `${platform}_${cleanPrompt || 'frame'}`;
    }

    const timestamp = Date.now().toString().slice(-4);
    const filename = `AI_Image_Loop/${namePart}_${promptNum || 1}_${timestamp}.png`;

    addLog(`📥 Downloading image to ${filename}…`);

    chrome.downloads.download({
      url: imageUrl,
      filename: filename,
      conflictAction: 'uniquify',
      saveAs: false
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        addLog(`⚠️ Download: ${chrome.runtime.lastError.message}`);
      } else {
        addLog(`✅ Download complete: ${filename}`);
      }
    });
  } catch (err) {
    addLog(`⚠️ Download error: ${err.message}`);
  }
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addLog(msg) {
  const entry = { time: new Date().toLocaleTimeString(), msg };
  state.log.unshift(entry);
  if (state.log.length > 200) state.log.pop();
  broadcastState();
}

function broadcastState() {
  saveState();
  chrome.runtime.sendMessage({ type: 'STATE_UPDATE', state }).catch(() => {});
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Tab Management ─────────────────────────────────────────

async function ensureTab(url, existingId) {
  const host = new URL(url).hostname;
  if (existingId) {
    try {
      const tab = await chrome.tabs.get(existingId);
      if (tab && tab.url && tab.url.includes(host)) {
        return existingId;
      }
    } catch (_) {}
  }

  // Look for any existing open tab matching this platform URL
  try {
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) {
      if (t.url && t.url.includes(host)) {
        return t.id;
      }
    }
  } catch (_) {}

  // None open — create new tab
  const tab = await chrome.tabs.create({ url, active: false });
  await waitForTabLoad(tab.id);
  return tab.id;
}

function waitForTabLoad(tabId) {
  return new Promise(resolve => {
    chrome.tabs.onUpdated.addListener(function listener(id, info) {
      if (id === tabId && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        setTimeout(resolve, 2000);
      }
    });
  });
}

async function sendTabMessage(tabId, message, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await chrome.tabs.sendMessage(tabId, message);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(1200);
    }
  }
}

// ─── ChatGPT Background-Side Polling (Backup Detector) ──────

function checkChatGPTStatus() {
  const stopBtns = document.querySelectorAll(
    '[data-testid="stop-button"], button[aria-label*="Stop"], button[aria-label*="stop"]'
  );
  for (const b of stopBtns) {
    if (!b.disabled && b.offsetParent !== null && window.getComputedStyle(b).display !== 'none') {
      return 'generating';
    }
  }

  const sendBtn = document.querySelector(
    'button[data-testid="send-button"], button[aria-label*="Send prompt"], button[aria-label*="Send message"], button[aria-label*="Send"]'
  );
  const sendReady = sendBtn && !sendBtn.disabled && sendBtn.offsetParent !== null;

  const imgs = document.querySelectorAll(
    'main img, article img, [data-testid^="conversation-turn"] img, div[class*="image"] img'
  );
  for (const img of imgs) {
    const src = (img.src || '').toLowerCase();
    const alt = (img.alt || '').toLowerCase();
    if (src.includes('avatar') || src.includes('favicon') || src.includes('logo') || src.includes('profile')) continue;
    if (alt.includes('avatar') || alt.includes('profile') || alt.includes('user')) continue;

    if (src.includes('oaiusercontent') || src.includes('blob:') || src.includes('dalle') || alt.includes('generated') || alt.includes('dall')) {
      return 'done';
    }

    const w = img.naturalWidth || img.clientWidth || img.width || 0;
    const h = img.naturalHeight || img.clientHeight || img.height || 0;
    if (w > 120 || h > 120) {
      return 'done';
    }
  }

  const input = document.querySelector('#prompt-textarea, div[contenteditable="true"]');
  const inputReady = input && !input.disabled && input.getAttribute('aria-disabled') !== 'true';

  const turns = document.querySelectorAll('article, [data-testid^="conversation-turn"], [data-message-author-role="assistant"]');
  if ((sendReady || inputReady) && turns.length > 0) {
    return 'done';
  }

  return 'waiting';
}

async function pollChatGPT(tabId, startTime, timeout) {
  if (!state.running || state.chatgptDone) return;

  if (Date.now() - startTime > timeout) {
    addLog('⏱️ ChatGPT wait timer expired — proceeding to next prompt');
    state.chatgptDone = true;
    checkIfRoundDone();
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: checkChatGPTStatus
    });

    const status = results?.[0]?.result;

    if (status === 'done') {
      if (!state.chatgptDone) {
        addLog('🖼️ ChatGPT image ready!');
        state.chatgptDone = true;
        downloadGeneratedImage(null, 'ChatGPT', state.currentPrompt, state.totalPromptsSent);
        checkIfRoundDone();
      }
      return;
    }
  } catch (_) {}

  setTimeout(() => pollChatGPT(tabId, startTime, timeout), 2000);
}

// ─── Gemini Background-Side Polling (Backup Detector) ───────

function checkGeminiStatus() {
  const loading = document.querySelector(
    'mat-progress-bar, model-response-loading, [data-test-id="loading-indicator"], .thinking-indicator, [class*="thinking"]'
  );
  const stopBtn = document.querySelector(
    'button[aria-label*="Stop"], button[aria-label*="stop"], [data-test-id="stop-button"], .stop-button, button[mattooltip*="Stop"]'
  );

  if ((loading && loading.offsetParent !== null) || (stopBtn && !stopBtn.disabled && stopBtn.offsetParent !== null)) {
    return 'generating';
  }

  const imgs = document.querySelectorAll(
    'model-response img, .response-container img, [class*="image-gen"] img, [data-test-id*="image"] img, message-content img, image-block img, img[src*="googleusercontent"]'
  );
  for (const img of imgs) {
    const src = (img.src || '').toLowerCase();
    const alt = (img.alt || '').toLowerCase();
    if (src.includes('avatar') || src.includes('favicon') || src.includes('logo') || src.includes('icon') || src.includes('profile')) continue;
    if (alt.includes('avatar') || alt.includes('profile') || alt.includes('user')) continue;

    const w = img.naturalWidth || img.clientWidth || img.width || 0;
    const h = img.naturalHeight || img.clientHeight || img.height || 0;
    if (w > 150 || h > 150 || src.includes('googleusercontent') || src.includes('blob:') || src.includes('generativelanguage')) {
      return 'done';
    }
  }

  return 'waiting';
}

async function pollGemini(tabId, startTime, timeout) {
  if (!state.running || state.geminiDone) return;

  if (Date.now() - startTime > timeout) {
    addLog('⏱️ Gemini wait timer expired — proceeding to next prompt');
    state.geminiDone = true;
    checkIfRoundDone();
    return;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: checkGeminiStatus
    });

    const status = results?.[0]?.result;

    if (status === 'done') {
      if (!state.geminiDone) {
        addLog('🖼️ Gemini image ready!');
        state.geminiDone = true;
        downloadGeneratedImage(null, 'Gemini', state.currentPrompt, state.totalPromptsSent);
        checkIfRoundDone();
      }
      return;
    }
  } catch (_) {}

  setTimeout(() => pollGemini(tabId, startTime, timeout), 2000);
}

// ─── Core Loop ──────────────────────────────────────────────

async function runLoop() {
  if (!state.running) return;

  if (state.promptMode === 'auto') {
    // ── Auto-Generate Mode ──
    if (state.maxLoops > 0 && state.totalPromptsSent >= state.maxLoops) {
      addLog(`✅ Completed all ${state.maxLoops} auto-generated prompts. Stopping.`);
      stopLoop();
      return;
    }

    state.currentPrompt = generateRandomPrompt(state.autoTheme, state.totalPromptsSent + 1);
    state.totalPromptsSent++;
    state.loopCount = state.totalPromptsSent;

    const maxLabel = state.maxLoops > 0 ? `/${state.maxLoops}` : '';
    addLog(`🤖 Auto-Prompt #${state.totalPromptsSent}${maxLabel} [${state.autoTheme}] — "${state.currentPrompt}"`);

  } else {
    // ── Custom Prompts Mode ──
    if (state.prompts.length === 0) {
      addLog('❌ No custom prompts configured.');
      stopLoop();
      return;
    }

    if (state.maxLoops > 0 && state.completedLoops >= state.maxLoops) {
      addLog(`✅ Completed all ${state.maxLoops} loops (${state.totalPromptsSent} total prompts generated). Stopping.`);
      stopLoop();
      return;
    }

    if (!state.currentQueue || state.currentQueue.length === 0 || state.queueIndex >= state.currentQueue.length) {
      state.currentQueue = state.orderMode === 'random' ? shuffleArray(state.prompts) : [...state.prompts];
      state.queueIndex = 0;
    }

    const pIndex = state.queueIndex;
    state.currentPrompt = state.currentQueue[pIndex];
    state.totalPromptsSent++;

    const maxLabel = state.maxLoops > 0 ? `/${state.maxLoops}` : '';
    const orderIcon = state.orderMode === 'random' ? '🔀' : '➡️';
    addLog(`🔁 Loop #${state.currentLoop}${maxLabel} · ${orderIcon} Prompt ${pIndex + 1}/${state.currentQueue.length} — "${state.currentPrompt}"`);

    state.queueIndex++;
    if (state.queueIndex >= state.currentQueue.length) {
      state.completedLoops++;
      state.currentLoop++;
    }

    state.loopCount = state.completedLoops;
  }

  broadcastState();

  const needsChatGPT = state.platform === 'chatgpt' || state.platform === 'both';
  const needsGemini  = state.platform === 'gemini'  || state.platform === 'both';

  state.chatgptDone = !needsChatGPT;
  state.geminiDone  = !needsGemini;
  state.chatgptDownloaded = false;
  state.geminiDownloaded  = false;

  // ── ChatGPT ─────────────────────────────────────────────
  if (needsChatGPT) {
    try {
      state.chatgptTabId = await ensureTab('https://chatgpt.com/', state.chatgptTabId);
      const thinkTag = state.thinkLonger ? ' [🧠 Think Longer ON]' : '';
      addLog(`📨 Sending prompt to ChatGPT…${thinkTag}`);

      await sendTabMessage(state.chatgptTabId, {
        type: 'SEND_PROMPT',
        prompt: state.currentPrompt,
        thinkLonger: state.thinkLonger
      });

      const chatgptStart = Date.now();
      // Content script handles real detection; backup poller runs after 80s if thinkLonger, else 60s
      const pollerDelay = state.thinkLonger ? 80000 : 60000;
      const pollerTimeout = state.thinkLonger ? 180000 : 140000;
      setTimeout(() => pollChatGPT(state.chatgptTabId, chatgptStart, pollerTimeout), pollerDelay);

    } catch (e) {
      addLog(`⚠️ ChatGPT tab error: ${e.message}`);
      state.chatgptDone = true;
    }
  }

  // ── Gemini ──────────────────────────────────────────────
  if (needsGemini) {
    try {
      state.geminiTabId = await ensureTab('https://gemini.google.com/', state.geminiTabId);
      addLog('📨 Sending prompt to Gemini…');

      await sendTabMessage(state.geminiTabId, {
        type: 'SEND_PROMPT',
        prompt: state.currentPrompt
      });

      const geminiStart = Date.now();
      // Content script handles real detection; backup poller runs after 75s
      setTimeout(() => pollGemini(state.geminiTabId, geminiStart, 160000), 75000);

    } catch (e) {
      addLog(`⚠️ Gemini tab error: ${e.message} (skipping for this round)`);
      state.geminiDone = true;
    }
  }

  checkIfRoundDone();
}

function checkIfRoundDone() {
  if (state.chatgptDone && state.geminiDone) {
    if (state.promptMode === 'auto') {
      if (state.maxLoops > 0 && state.totalPromptsSent >= state.maxLoops) {
        addLog(`🎉 All ${state.maxLoops} auto-generated prompts finished!`);
        broadcastState();
        stopLoop();
        return;
      }
    } else {
      if (state.maxLoops > 0 && state.completedLoops >= state.maxLoops && (state.queueIndex >= state.currentQueue.length || state.queueIndex === 0)) {
        addLog(`🎉 All ${state.maxLoops} loops finished (${state.totalPromptsSent} total prompts generated)!`);
        broadcastState();
        stopLoop();
        return;
      }
    }

    addLog(`✔️ Image ready! Next prompt entering in 3s…`);
    broadcastState();
    if (state.running) {
      // Both alarm and setTimeout ensure prompt 2 triggers even if service worker sleeps
      chrome.alarms.create('nextLoopTimer', { when: Date.now() + 3000 });
      setTimeout(() => {
        if (state.running) runLoop();
      }, 3000);
    }
  }
}

// ─── Start / Stop ───────────────────────────────────────────

async function startLoop() {
  if (state.promptMode === 'custom' && state.prompts.length === 0) {
    addLog('❌ No custom prompts configured. Add prompts or switch to Auto-Generate.');
    return;
  }

  state.running          = true;
  state.status           = 'running';
  state.currentLoop      = 1;
  state.completedLoops   = 0;
  state.totalPromptsSent = 0;
  state.loopCount        = 0;
  state.log              = [];

  if (state.promptMode === 'custom') {
    state.currentQueue = state.orderMode === 'random' ? shuffleArray(state.prompts) : [...state.prompts];
    state.queueIndex   = 0;
    const modeText = state.orderMode === 'random' ? '🔀 random shuffle' : '➡️ sequential';
    const maxLabel = state.maxLoops > 0
      ? `${state.maxLoops} loops (${state.prompts.length * state.maxLoops} prompts total)`
      : 'infinitely';
    addLog(`🚀 Loop started! Running ${state.prompts.length} custom prompts (${modeText}) for ${maxLabel}.`);
  } else {
    const maxLabel = state.maxLoops > 0 ? `${state.maxLoops} prompts` : 'infinite prompts';
    addLog(`🚀 Auto-Loop started! Generating AI image prompts [${state.autoTheme}] for ${maxLabel}.`);
  }

  // Create keep-alive alarm while running
  chrome.alarms.create('loopKeepAlive', { periodInMinutes: 0.25 });

  broadcastState();
  runLoop();
}

function stopLoop() {
  state.running = false;
  state.status  = 'stopped';
  chrome.alarms.clear('loopKeepAlive');
  chrome.alarms.clear('nextLoopTimer');
  addLog('🛑 Loop stopped.');
  broadcastState();
}

// ─── Message Handler ────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {

    case 'GET_STATE':
      sendResponse({ state });
      break;

    case 'START_LOOP':
      state.prompts      = msg.prompts || [];
      state.platform     = msg.platform || 'both';
      state.promptMode   = msg.promptMode || 'auto';
      state.autoTheme    = msg.autoTheme || 'xiao_yan_battle';
      state.autoDownload = msg.autoDownload !== undefined ? !!msg.autoDownload : true;
      state.thinkLonger  = msg.thinkLonger !== undefined ? !!msg.thinkLonger : true;
      state.orderMode    = msg.orderMode || 'random';
      state.maxLoops     = msg.maxLoops || 0;
      saveState();
      startLoop();
      sendResponse({ ok: true });
      break;

    case 'UPDATE_THINK_LONGER':
      state.thinkLonger = msg.thinkLonger !== undefined ? !!msg.thinkLonger : true;
      saveState();
      addLog(`🧠 Think Longer set to: ${state.thinkLonger ? 'Enabled' : 'Disabled'}`);
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'STOP_LOOP':
      stopLoop();
      sendResponse({ ok: true });
      break;

    case 'UPDATE_PROMPTS':
      state.prompts = msg.prompts || [];
      addLog(`📝 Prompts updated (${state.prompts.length} total)`);
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'UPDATE_MAX_LOOPS':
      state.maxLoops = msg.maxLoops || 0;
      addLog(`⚙️ Loop limit set to: ${state.maxLoops === 0 ? 'infinite' : state.maxLoops}`);
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'UPDATE_ORDER_MODE':
      state.orderMode = msg.orderMode || 'random';
      addLog(`🔀 Prompt order set to: ${state.orderMode === 'random' ? 'Random (Shuffle)' : 'Sequential'}`);
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'UPDATE_PROMPT_MODE':
      state.promptMode = msg.promptMode || 'auto';
      addLog(`⚙️ Mode set to: ${state.promptMode === 'auto' ? '🤖 Auto-Generate' : '✍️ Custom List'}`);
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'UPDATE_AUTO_THEME':
      state.autoTheme = msg.autoTheme || 'xiao_yan_battle';
      addLog(`🎨 Auto theme set to: ${state.autoTheme}`);
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'UPDATE_AUTO_DOWNLOAD':
      state.autoDownload = !!msg.autoDownload;
      addLog(`📥 Auto-download ${state.autoDownload ? 'enabled' : 'disabled'}`);
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'CLEAR_FRAMES':
      state.framesHistory = [];
      addLog('🎬 Cleared video player frames');
      broadcastState();
      sendResponse({ ok: true });
      break;

    case 'IMAGE_DONE': {
      const fromChatGPT = msg.platform === 'chatgpt' || (sender.tab && sender.tab.id === state.chatgptTabId);
      const fromGemini  = msg.platform === 'gemini'  || (sender.tab && sender.tab.id === state.geminiTabId);

      if (fromChatGPT && !state.chatgptDone) {
        addLog('🖼️ ChatGPT image generation complete!');
        state.chatgptDone = true;
        downloadGeneratedImage(msg.imageUrl, 'ChatGPT', state.currentPrompt, state.totalPromptsSent);
        checkIfRoundDone();
      }
      if (fromGemini && !state.geminiDone) {
        addLog('🖼️ Gemini image generation complete!');
        state.geminiDone = true;
        downloadGeneratedImage(msg.imageUrl, 'Gemini', state.currentPrompt, state.totalPromptsSent);
        checkIfRoundDone();
      }
      if (!fromChatGPT && !fromGemini) {
        if (!state.chatgptDone) state.chatgptDone = true;
        if (!state.geminiDone)  state.geminiDone  = true;
        checkIfRoundDone();
      }
      sendResponse({ ok: true });
      break;
    }

    case 'IMAGE_ERROR': {
      addLog(`⚠️ Error from ${msg.platform || 'tab'}: ${msg.error || 'Unknown error'}`);
      if (msg.platform === 'chatgpt' || (sender.tab && sender.tab.id === state.chatgptTabId)) {
        state.chatgptDone = true;
      }
      if (msg.platform === 'gemini' || (sender.tab && sender.tab.id === state.geminiTabId)) {
        state.geminiDone = true;
      }
      checkIfRoundDone();
      sendResponse({ ok: true });
      break;
    }
  }
  return true;
});
