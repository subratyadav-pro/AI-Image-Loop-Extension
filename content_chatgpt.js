// ============================================================
// Content Script — ChatGPT (chatgpt.com)
// Injects prompt, submits, and monitors generation completion
// ============================================================

let isBusy = false;
let lastPromptTime = 0;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForElement(selector, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.querySelector(selector);
    if (el) return el;
    await sleep(300);
  }
  return null;
}

// ─── Image & Status Detection Helpers ────────────────────────

function isGeneratedImage(img) {
  if (!img) return false;
  const src = (img.src || '').toLowerCase();
  const alt = (img.alt || '').toLowerCase();

  // Filter out avatars, icons, logos, emojis
  if (src.includes('avatar') || src.includes('favicon') || src.includes('logo') || src.includes('profile')) return false;
  if (alt.includes('avatar') || alt.includes('profile') || alt.includes('user')) return false;

  // Positive indicators for AI generated images
  if (src.includes('oaiusercontent') || src.includes('blob:') || src.includes('dalle') || src.includes('generat')) return true;
  if (alt.includes('generated') || alt.includes('dall') || alt.includes('image')) return true;

  // Large rendered dimensions typically mean it's an image output, not an avatar
  const w = img.naturalWidth || img.clientWidth || img.width || 0;
  const h = img.naturalHeight || img.clientHeight || img.height || 0;
  if (w > 120 || h > 120) return true;

  return false;
}

function countGeneratedImages() {
  const imgs = document.querySelectorAll('main img, article img, [data-testid^="conversation-turn"] img, div[class*="image"] img');
  let count = 0;
  for (const img of imgs) {
    if (isGeneratedImage(img)) count++;
  }
  return count;
}

function getLatestGeneratedImage() {
  const imgs = Array.from(document.querySelectorAll('main img, article img, [data-testid^="conversation-turn"] img, div[class*="image"] img'));
  const valid = imgs.filter(isGeneratedImage);
  return valid.length > 0 ? valid[valid.length - 1] : null;
}

async function getImageUrlOrDataUrl(imgEl) {
  if (!imgEl) return null;
  const src = imgEl.src || imgEl.currentSrc;
  if (!src) return null;

  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }

  if (src.startsWith('blob:')) {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => resolve(src);
        reader.readAsDataURL(blob);
      });
    } catch (_) {
      return src;
    }
  }
  return src;
}

function getTurnCount() {
  const turns = document.querySelectorAll(
    'article, [data-testid^="conversation-turn"], [data-message-author-role], .agent-turn'
  );
  return turns.length;
}

function isComposerReady() {
  // If a stop button is visible, definitely NOT ready
  const stopBtns = document.querySelectorAll(
    '[data-testid="stop-button"], button[aria-label*="Stop"], button[aria-label*="stop"]'
  );
  for (const btn of stopBtns) {
    if (!btn.disabled && btn.offsetParent !== null && window.getComputedStyle(btn).display !== 'none') {
      return false;
    }
  }

  // If loading/pulse animation or thinking indicator is visible, NOT ready
  const loading = document.querySelector(
    '.animate-pulse, .animate-spin, [class*="thinking"], [class*="generating"], [data-testid*="loading"], [data-testid*="thought"], [data-testid*="reasoning"], [aria-label*="thought" i], [aria-label*="thinking" i]'
  );
  if (loading && loading.offsetParent !== null) return false;

  // Check if input textarea is present and not disabled
  const input = document.querySelector('#prompt-textarea, div[contenteditable="true"]');
  if (input && !input.disabled && input.getAttribute('aria-disabled') !== 'true') {
    return true;
  }

  return false;
}

// ─── Input & Submission ─────────────────────────────────────

function typeIntoInput(el, text) {
  el.focus();

  // Clear existing content thoroughly
  try {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('delete', false, null);
  } catch (_) {}
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);

  // Insert text via execCommand
  document.execCommand('insertText', false, text);

  // Fallback if execCommand did not set content
  if (!el.textContent.trim()) {
    el.innerHTML = `<p>${text}</p>`;
  }

  // Dispatch standard synthetic input events
  el.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: text
  }));
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
}

async function submit(inputEl) {
  const start = Date.now();

  // Poll for up to 3500ms for React state to enable the send button
  while (Date.now() - start < 3500) {
    const byTestId = document.querySelector('[data-testid="send-button"]');
    if (byTestId && !byTestId.disabled) {
      byTestId.click();
      return;
    }

    const ariaLabels = ['Send prompt', 'Send message', 'Send'];
    for (const label of ariaLabels) {
      const btn = document.querySelector(`button[aria-label="${label}"]`);
      if (btn && !btn.disabled) {
        btn.click();
        return;
      }
    }

    const form = inputEl.closest('form') || document.querySelector('form');
    if (form) {
      const svgBtns = form.querySelectorAll('button:not([disabled]) svg');
      if (svgBtns.length > 0) {
        svgBtns[svgBtns.length - 1].closest('button').click();
        return;
      }
    }

    await sleep(200);
  }

  // Fallback: Enter key
  ['keydown', 'keypress', 'keyup'].forEach(type => {
    inputEl.dispatchEvent(new KeyboardEvent(type, {
      key: 'Enter', code: 'Enter', keyCode: 13,
      which: 13, bubbles: true, cancelable: true,
      shiftKey: false
    }));
  });
}

// ─── Thinking Phase Detection ────────────────────────────────

function isThinking() {
  // Detect ChatGPT's reasoning/thinking spinner or accordion
  const thinkingSelectors = [
    '[data-testid*="thinking"]',
    '[data-testid*="thought"]',
    '[data-testid*="reasoning"]',
    '[class*="thinking"]',
    '[class*="reasoningContent"]',
    '[aria-label*="thinking" i]',
    '[aria-label*="thought" i]',
    // ChatGPT o-series: collapsible thought summary
    'details[open] summary',
    '.text-token-text-secondary .animate-pulse'
  ];
  for (const sel of thinkingSelectors) {
    try {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) return true;
    } catch (_) {}
  }
  // Also check if any visible element contains "Thinking" text
  const allSpans = document.querySelectorAll('span, p, div');
  for (const el of allSpans) {
    if (el.children.length === 0) {
      const txt = el.textContent.trim();
      if (txt === 'Thinking…' || txt === 'Thinking...' || txt === 'Reasoning…' || txt === 'Reasoning...') {
        if (el.offsetParent !== null) return true;
      }
    }
  }
  return false;
}

// ─── Wait For Image Completion ──────────────────────────────

async function waitForCompletion(baselineImgCount, baselineTurnCount, timeout = 210000) {
  const start = Date.now();
  let generationActiveSeen = false;
  let thinkingPhaseSeen = false;
  let thinkingPhaseEnded = false;

  console.log('[AI Loop] Monitoring generation… baseline images:', baselineImgCount, 'turns:', baselineTurnCount);

  // Initial grace period for ChatGPT to register submission + start thinking
  await sleep(4000);

  while (Date.now() - start < timeout) {
    await sleep(1500);

    const thinking = isThinking();
    const isReady  = isComposerReady();

    // Track thinking phase
    if (thinking) {
      thinkingPhaseSeen = true;
      thinkingPhaseEnded = false;
      generationActiveSeen = true;
      const elapsed = Math.round((Date.now() - start) / 1000);
      if (elapsed % 10 < 2) { // log every ~10s to avoid spam
        console.log(`[AI Loop] 🧠 ChatGPT is thinking… (${elapsed}s elapsed)`);
      }
      continue; // Keep waiting — never return early while thinking
    }

    // Thinking phase just ended
    if (thinkingPhaseSeen && !thinking && !thinkingPhaseEnded) {
      thinkingPhaseEnded = true;
      console.log('[AI Loop] 🧠 Thinking phase complete — now waiting for image generation…');
      await sleep(2000); // give ChatGPT a moment to start rendering
    }

    if (!isReady) {
      generationActiveSeen = true;
    }

    const currentImgCount  = countGeneratedImages();
    const currentTurnCount = getTurnCount();

    // 1. New image detected
    if (currentImgCount > baselineImgCount) {
      console.log('[AI Loop] ✅ New image detected! count:', currentImgCount);
      await sleep(2000);
      return 'done_image';
    }

    // 2. Generation was active and composer is ready — but ONLY after thinking phase
    //    and at least 15s of total activity
    const minWait = thinkingPhaseSeen ? 8000 : 15000;
    if (generationActiveSeen && isReady && Date.now() - start > minWait) {
      if (currentImgCount > baselineImgCount) {
        await sleep(2000);
        return 'done_image';
      }
      if (currentTurnCount > baselineTurnCount) {
        // Extra safety: if thinking was seen, wait 5 more seconds
        // in case image is still rendering after think phase
        if (thinkingPhaseSeen) {
          await sleep(5000);
          if (countGeneratedImages() > baselineImgCount) return 'done_image';
        }
        console.log('[AI Loop] Turn finished — no image produced (text/refusal).');
        return 'done_text';
      }
    }
  }

  // Final check at timeout
  if (countGeneratedImages() > baselineImgCount) return 'done_image';

  console.warn('[AI Loop] Generation wait timed out.');
  return 'timeout';
}

// ─── Think Longer Helpers ────────────────────────────────────

async function activateThinkButton() {
  try {
    // 1. Selector based detection for ChatGPT's Think / Reasoning button
    const selectors = [
      'button[data-testid*="think"]',
      'button[data-testid*="reasoning"]',
      'button[aria-label*="Think" i]',
      'button[aria-label*="Reason" i]',
      'button[aria-label*="Reasoning" i]'
    ];

    let thinkBtn = null;
    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn && btn.offsetParent !== null) {
        thinkBtn = btn;
        break;
      }
    }

    // 2. Scan buttons inside composer/form if selector did not find it
    if (!thinkBtn) {
      const composer = document.querySelector('form') || document.querySelector('#prompt-textarea')?.closest('div');
      const buttons = composer ? composer.querySelectorAll('button') : document.querySelectorAll('button');
      for (const btn of buttons) {
        const txt = (btn.innerText || btn.textContent || '').trim();
        if (/^think\b/i.test(txt) || /^reason\b/i.test(txt)) {
          thinkBtn = btn;
          break;
        }
      }
    }

    if (thinkBtn) {
      const isPressed = thinkBtn.getAttribute('aria-pressed') === 'true' ||
                        thinkBtn.getAttribute('data-state') === 'checked' ||
                        thinkBtn.getAttribute('data-state') === 'on' ||
                        thinkBtn.classList.contains('active') ||
                        thinkBtn.classList.contains('bg-token-main-surface-secondary');

      if (!isPressed) {
        console.log('[AI Loop] Activating ChatGPT "Think" button…');
        thinkBtn.click();
        await sleep(400);
      } else {
        console.log('[AI Loop] ChatGPT "Think" mode is already activated.');
      }
      return true;
    }

    console.log('[AI Loop] "Think" button not detected in UI; proceeding with reasoning directive.');
    return false;
  } catch (e) {
    console.warn('[AI Loop] activateThinkButton error:', e);
    return false;
  }
}

function applyThinkLongerDirective(prompt) {
  if (!prompt) return prompt;
  // If prompt already contains reasoning instructions, do not duplicate
  if (prompt.toLowerCase().includes('think deeply') || prompt.toLowerCase().includes('plan the exact')) {
    return prompt;
  }
  return `Think deeply step-by-step and plan the exact cinematography, lighting dynamics, character consistency, and composition before generating the image: ${prompt}`;
}

// ─── Send Prompt Handler ────────────────────────────────────

// thinkLonger param kept for API compatibility but ALWAYS forced true:
// every prompt uses extended reasoning — no exceptions.
async function sendPrompt(rawPrompt, thinkLonger = true) {
  if (isBusy && Date.now() - lastPromptTime > 60000) {
    console.warn('[AI Loop] Releasing stale busy lock.');
    isBusy = false;
  }

  if (isBusy) {
    console.warn('[AI Loop] Still busy processing previous prompt');
    return;
  }
  isBusy = true;
  lastPromptTime = Date.now();

  try {
    // 1. Always activate Think button + reasoning directive on EVERY prompt
    //    (thinkLonger toggle only controls the reasoning prefix, not the Think button)
    const thinkBtnActivated = await activateThinkButton();
    const prompt = thinkBtnActivated
      ? rawPrompt  // Think button is on — model reasons natively, no prefix needed
      : applyThinkLongerDirective(rawPrompt); // fallback: prepend reasoning directive
    if (thinkBtnActivated) {
      console.log('[AI Loop] 🧠 Think button activated — ChatGPT will reason before generating.');
    } else {
      console.log('[AI Loop] 🧠 Think button not found — using deep reasoning directive prefix.');
    }

    // 2. Record baselines before submission
    const baselineImgCount = countGeneratedImages();
    const baselineTurnCount = getTurnCount();

    // 3. Find the input box
    const inputEl = await waitForElement(
      '#prompt-textarea, div[contenteditable="true"], textarea[placeholder]',
      15000
    );

    if (!inputEl) {
      console.warn('[AI Loop] Could not find ChatGPT input');
      chrome.runtime.sendMessage({
        type: 'IMAGE_ERROR',
        platform: 'chatgpt',
        error: 'Could not find ChatGPT input box'
      }).catch(() => {});
      return;
    }

    console.log('[AI Loop] Found input, typing prompt:', prompt);
    typeIntoInput(inputEl, prompt);

    await sleep(500);
    console.log('[AI Loop] Submitting prompt…');
    await submit(inputEl);
    console.log('[AI Loop] Prompt submitted. Waiting for generation…');

    // 4. Wait for image completion — always 210s to allow for full reasoning + image gen
    const result = await waitForCompletion(baselineImgCount, baselineTurnCount, 210000);
    await sleep(1000);

    const currentImgCount = countGeneratedImages();
    if (result === 'done_image' || currentImgCount > baselineImgCount) {
      const latestImg = getLatestGeneratedImage();
      const imageUrl = await getImageUrlOrDataUrl(latestImg);

      console.log('[AI Loop] New image ready:', imageUrl ? 'found' : 'none');
      chrome.runtime.sendMessage({
        type: 'IMAGE_DONE',
        platform: 'chatgpt',
        imageUrl
      }).catch(() => {});
    } else {
      console.warn('[AI Loop] No new image was produced (result:', result, ')');
      chrome.runtime.sendMessage({
        type: 'IMAGE_ERROR',
        platform: 'chatgpt',
        error: `ChatGPT did not produce a new image (${result})`
      }).catch(() => {});
    }

  } catch (err) {
    console.error('[AI Loop] Error:', err);
    chrome.runtime.sendMessage({
      type: 'IMAGE_ERROR',
      platform: 'chatgpt',
      error: err.message
    }).catch(() => {});
  } finally {
    isBusy = false;
  }
}

// ─── Listen for messages from background ────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SEND_PROMPT') {
    sendPrompt(msg.prompt, msg.thinkLonger !== undefined ? msg.thinkLonger : true);
    sendResponse({ ok: true });
  }
  return true;
});

