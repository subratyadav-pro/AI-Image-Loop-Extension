// ============================================================
// Content Script — Gemini (gemini.google.com)
// Full image generation support: auto-selects Imagen model,
// injects prompts, waits for output, extracts & downloads image
// ============================================================

let isWaiting = false;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForElement(selector, timeout = 25000, root = document) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = root.querySelector(selector);
    if (el) return el;
    await sleep(300);
  }
  return null;
}

// ─── Image Detection ─────────────────────────────────────────

/**
 * Returns true if an <img> element looks like a Gemini-generated image
 * (not an avatar, icon, or UI decoration).
 */
function isGeminiGeneratedImage(img) {
  if (!img) return false;
  const src = (img.src || img.currentSrc || '').toLowerCase();
  const alt = (img.alt || '').toLowerCase();

  // Reject known non-generated assets (avatars, icons, logos, account pictures)
  if (src.includes('avatar') || src.includes('favicon') ||
      src.includes('logo')   || src.includes('icon') ||
      src.includes('profile')) return false;
  if (alt.includes('avatar') || alt.includes('profile') ||
      alt.includes('user icon') || alt.includes('google account')) return false;

  // Positive signals: Gemini/Google image CDNs and blob
  if (src.includes('googleusercontent') || src.includes('blob:') ||
      src.includes('generativelanguage') || src.includes('gemini') ||
      src.includes('lh3.')              || src.includes('uc.googleusercontent')) return true;

  // Large rendered image — almost certainly an output
  const w = img.naturalWidth  || img.clientWidth  || parseInt(img.getAttribute('width')  || '0');
  const h = img.naturalHeight || img.clientHeight || parseInt(img.getAttribute('height') || '0');
  if (w > 150 || h > 150) return true;

  return false;
}

/**
 * Counts generated images currently visible in Gemini responses.
 */
function countGeminiImages() {
  const candidates = document.querySelectorAll([
    'model-response img',
    '.response-container img',
    'message-content img',
    '.chat-container img',
    '[data-test-id*="image"] img',
    '[class*="image-gen"] img',
    '[class*="generated"] img',
    'response-container img',
    '.conversation-container img',
    'img[src*="googleusercontent"]',
    'img[src*="blob:"]',
    'img[src*="generativelanguage"]'
  ].join(', '));

  let count = 0;
  for (const img of candidates) {
    if (isGeminiGeneratedImage(img)) count++;
  }
  return count;
}

/**
 * Returns the most recently generated image element in the Gemini UI.
 */
function getLatestGeminiImage() {
  const candidates = Array.from(document.querySelectorAll([
    'model-response img',
    '.response-container img',
    'message-content img',
    '.chat-container img',
    '[data-test-id*="image"] img',
    '[class*="image-gen"] img',
    '[class*="generated"] img',
    'response-container img',
    '.conversation-container img',
    'img[src*="googleusercontent"]',
    'img[src*="blob:"]',
    'img[src*="generativelanguage"]'
  ].join(', ')));

  const valid = candidates.filter(isGeminiGeneratedImage);
  return valid.length > 0 ? valid[valid.length - 1] : null;
}

/**
 * Converts a blob: or relative src to a data: URL for downloading.
 */
async function getImageUrlOrDataUrl(imgEl) {
  if (!imgEl) return null;
  const src = imgEl.src || imgEl.currentSrc;
  if (!src) return null;

  // data: and https: URLs can be downloaded directly
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }

  // blob: URLs — read as data URL so the background can download them
  if (src.startsWith('blob:')) {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror  = () => resolve(src);
        reader.readAsDataURL(blob);
      });
    } catch (_) {
      return src;
    }
  }
  return src;
}

// ─── Gemini Model Switcher ───────────────────────────────────

/**
 * Attempts to ensure Gemini is set to an image-capable model.
 * Looks for a model-selector button and clicks the image/Imagen option.
 * Safe to call — does nothing if the selector isn't found.
 */
async function ensureImageModel() {
  try {
    // Look for the model selector button (varies by Gemini UI version)
    const modelBtn = document.querySelector([
      'bard-model-switcher button',
      '[data-test-id="model-switcher"]',
      'button[aria-label*="model"]',
      'button[aria-label*="Model"]',
      '.model-selector button',
      '[class*="model-switcher"] button',
      'mat-select[aria-label*="model"]',
      '[class*="ModelSelector"]',
      'button[data-test-id*="model"]'
    ].join(', '));

    if (!modelBtn) return; // Model switcher not found — proceed as-is

    // Check if we're already on an image model
    const currentLabel = (modelBtn.textContent || modelBtn.getAttribute('aria-label') || '').toLowerCase();
    if (currentLabel.includes('image') || currentLabel.includes('imagen') || currentLabel.includes('flash')) {
      return; // Already on image-capable model
    }

    // Open the model selector
    modelBtn.click();
    await sleep(800);

    // Find and click an Imagen / image generation option
    const options = document.querySelectorAll([
      'mat-option',
      '[role="option"]',
      '.model-option',
      '[class*="model-item"]',
      'li[data-value]',
      '[data-test-id*="model-option"]'
    ].join(', '));

    for (const opt of options) {
      const txt = (opt.textContent || '').toLowerCase();
      if (txt.includes('image') || txt.includes('imagen') || txt.includes('flash')) {
        opt.click();
        await sleep(600);
        return;
      }
    }

    // No image model found — close the dropdown by pressing Escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await sleep(300);
  } catch (_) {
    // Silent fail — don't block the prompt send
  }
}

// ─── Wait for Generation Complete ───────────────────────────

async function waitForGeminiImageGeneration(baselineCount, baselineResponseCount = 0, timeout = 150000) {
  const start = Date.now();
  await sleep(3000); // Initial settling time

  let stableCount = 0;          // Consecutive idle ticks with new images
  const STABLE_REQ = 2;          // Require 2 stable ticks before declaring done
  let generationActiveSeen = false;

  while (Date.now() - start < timeout) {
    // ── Is Gemini still generating? ──
    const isGenerating = (() => {
      // Loading spinner / progress bar
      const spinner = document.querySelector([
        'mat-progress-bar',
        'model-response-loading',
        '[data-test-id="loading-indicator"]',
        '[class*="loading-indicator"]',
        '[aria-label*="Loading"]',
        '.thinking-indicator',
        '[class*="thinking"]',
        '[class*="spinner"]',
        'circle[class*="animate"]',
        'mat-spinner',
        '.mat-mdc-progress-bar'
      ].join(', '));
      if (spinner && spinner.offsetParent !== null) return true;

      // Stop button visible and enabled
      const stopBtn = document.querySelector([
        'button[aria-label*="Stop"]',
        'button[aria-label*="stop"]',
        '[data-test-id="stop-button"]',
        '.stop-button',
        'button[mattooltip*="Stop"]',
        'button[aria-label*="Cancel"]'
      ].join(', '));
      if (stopBtn && !stopBtn.disabled && stopBtn.offsetParent !== null) return true;

      return false;
    })();

    if (isGenerating) {
      generationActiveSeen = true;
    }

    const currentCount = countGeminiImages();
    const hasNewImage  = currentCount > baselineCount;

    if (hasNewImage) {
      if (!isGenerating) {
        stableCount++;
        if (stableCount >= STABLE_REQ) return 'done';
      } else {
        stableCount = 0;
      }
    } else {
      stableCount = 0;

      // Check if Gemini finished responding with text only
      // Only check if generation was seen active or at least 15s has passed, AND a NEW response has appeared
      const elapsed = Date.now() - start;
      if (!isGenerating && (generationActiveSeen || elapsed > 15000)) {
        const currentResponses = document.querySelectorAll([
          'model-response',
          '.response-container',
          'message-content',
          '[class*="model-response"]',
          '[data-test-id*="response"]'
        ].join(', ')).length;

        if (currentResponses > baselineResponseCount) {
          return 'done_text';
        }
      }
    }

    // Check for error messages
    const errorEl = document.querySelector([
      '[class*="error-message"]',
      '[data-test-id*="error"]',
      '.error-container',
      '[class*="ErrorMessage"]'
    ].join(', '));
    if (errorEl && !isGenerating && generationActiveSeen) return 'error';

    await sleep(1500);
  }

  // Final check at timeout
  if (countGeminiImages() > baselineCount) return 'done';

  return 'timeout';
}

// ─── Input Injection ─────────────────────────────────────────

/**
 * Finds the Gemini input element (handles both old Quill editor
 * and newer contenteditable textarea variants).
 */
async function findGeminiInput() {
  const selectors = [
    // Modern Gemini 2025 UI
    'rich-textarea .ql-editor',
    'rich-textarea [contenteditable="true"]',
    '.input-area-container [contenteditable="true"]',
    'div.ql-editor[contenteditable="true"]',
    // Fallback selectors
    'p[data-placeholder][contenteditable]',
    'div[contenteditable="true"][role="textbox"]',
    '[contenteditable="true"].input',
    '.message-input [contenteditable="true"]',
    'textarea#prompt-textarea',
    'textarea[placeholder]'
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }

  // Async wait for the most common selector
  return await waitForElement(
    'rich-textarea .ql-editor, rich-textarea [contenteditable="true"], div[contenteditable="true"][role="textbox"]',
    15000
  );
}

/**
 * Injects text into the Gemini input and fires the necessary events
 * to trigger Gemini's Angular/React change detection.
 */
async function injectTextIntoGeminiInput(inputEl, text) {
  inputEl.click();
  await sleep(200);
  inputEl.focus();
  await sleep(200);

  // Clear existing content thoroughly using Selection API
  try {
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(inputEl);
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('delete', false, null);
  } catch (_) {}
  document.execCommand('selectAll', false, null);
  document.execCommand('delete', false, null);
  await sleep(150);

  // Quill editor path
  if (inputEl.classList.contains('ql-editor') || inputEl.closest('rich-textarea')) {
    // Use insertText execCommand (works well with Quill)
    document.execCommand('insertText', false, text);
    await sleep(200);

    // If text didn't insert via execCommand, set innerHTML directly
    if (!inputEl.textContent.trim()) {
      inputEl.innerHTML = `<p>${text}</p>`;
    }

    // Fire Quill and Angular expected events
    inputEl.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text
    }));
    inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    inputEl.dispatchEvent(new Event('change', { bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keyup',  { bubbles: true, key: 'a' }));
    await sleep(300);
  } else {
    // Native textarea / contenteditable fallback
    if (inputEl.tagName === 'TEXTAREA' || inputEl.tagName === 'INPUT') {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, 'value'
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(inputEl, text);
      } else {
        inputEl.value = text;
      }
    } else {
      document.execCommand('insertText', false, text);
    }
    inputEl.dispatchEvent(new InputEvent('input',  { bubbles: true }));
    inputEl.dispatchEvent(new Event('change',      { bubbles: true }));
    inputEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
  }

  await sleep(400);
}

/**
 * Finds the Gemini Send button using multiple selector strategies.
 */
function findGeminiSendButton() {
  const selectors = [
    // Standard aria-labels (case-insensitive)
    'button[aria-label*="Send" i]',
    'button[aria-label*="Submit" i]',
    'button[aria-label*="prompt" i]',
    'button[data-test-id*="send"]',
    'button[data-test-id*="submit"]',
    // Class-based
    'button.send-button',
    '.send-button-container button',
    '[class*="send-button"] button',
    'button[class*="send-button"]',
    '[class*="SendButton"]',
    'button[mattooltip*="Send" i]',
    // Material icons & Arrow upward
    'button:has(mat-icon[fonticon="send"])',
    'button:has(mat-icon[data-mat-icon-name="send"])',
    'button:has(mat-icon[fonticon*="arrow"])',
    'button:has(mat-icon[data-mat-icon-name*="arrow"])',
    'button:has(svg[data-icon*="arrow"])',
    // Sibling of microphone button (Gemini puts send directly to the right of mic)
    'button[aria-label*="micro" i] ~ button',
    'button[aria-label*="Micro" i] ~ button',
    'button[aria-label*="voice" i] ~ button',
    // div[role="button"] variants
    'div[role="button"][aria-label*="Send" i]',
    'div[role="button"][aria-label*="Submit" i]'
  ];

  for (const sel of selectors) {
    try {
      const btns = document.querySelectorAll(sel);
      for (const btn of btns) {
        if (btn && btn.offsetParent !== null && window.getComputedStyle(btn).display !== 'none') {
          return btn;
        }
      }
    } catch (_) {}
  }

  // Fallback: look in the bottom input bar container for the last visible action button
  const inputContainer = document.querySelector('rich-textarea, .input-area-container, .text-input-field, .bottom-container, form') || document;
  const allBtns = Array.from(inputContainer.querySelectorAll('button, div[role="button"]'));
  for (let i = allBtns.length - 1; i >= 0; i--) {
    const b = allBtns[i];
    const aria = (b.getAttribute('aria-label') || '').toLowerCase();
    if (aria.includes('add') || aria.includes('plus') || aria.includes('attach') || aria.includes('file') || aria.includes('menu')) continue;
    if (aria.includes('mic') || aria.includes('voice')) continue;
    if (b.offsetParent !== null) {
      return b;
    }
  }

  return null;
}

/**
 * Waits for the Gemini Send button to be enabled by Angular, then clicks it.
 */
async function submitGeminiPrompt(inputEl) {
  console.log('[AI Image Loop] Waiting for Gemini send button to be enabled…');

  let sendBtn = null;
  const start = Date.now();

  // Poll for up to 4000ms for Angular change detection to enable the send button
  while (Date.now() - start < 4000) {
    sendBtn = findGeminiSendButton();
    if (sendBtn) {
      const isDisabled = sendBtn.disabled ||
                         sendBtn.getAttribute('aria-disabled') === 'true' ||
                         sendBtn.classList.contains('disabled');
      if (!isDisabled) {
        break; // Found and enabled!
      }
    }
    await sleep(200);
  }

  if (sendBtn) {
    console.log('[AI Image Loop] Clicking Gemini send button…');
    inputEl.dispatchEvent(new Event('blur', { bubbles: true }));
    await sleep(100);

    sendBtn.focus();
    const eventOptions = { bubbles: true, cancelable: true, view: window };
    sendBtn.dispatchEvent(new PointerEvent('pointerdown', eventOptions));
    sendBtn.dispatchEvent(new MouseEvent('mousedown', eventOptions));
    await sleep(50);
    sendBtn.dispatchEvent(new PointerEvent('pointerup', eventOptions));
    sendBtn.dispatchEvent(new MouseEvent('mouseup', eventOptions));
    sendBtn.dispatchEvent(new MouseEvent('click', eventOptions));
    try {
      sendBtn.click();
    } catch (_) {}

    console.log('[AI Image Loop] Gemini send button clicked ✓');
    await sleep(600);
    return;
  }

  console.warn('[AI Image Loop] Send button not found or stayed disabled; dispatching Enter key…');
  inputEl.focus();
  ['keydown', 'keypress', 'keyup'].forEach(type => {
    inputEl.dispatchEvent(new KeyboardEvent(type, {
      key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
      bubbles: true, cancelable: true, shiftKey: false, composed: true
    }));
  });
  await sleep(400);
}

let isWaiting = false;
let lastGeminiPromptTime = 0;

async function sendPromptToGemini(prompt) {
  // If lock held for more than 50 seconds, force release
  if (isWaiting && Date.now() - lastGeminiPromptTime > 50000) {
    console.warn('[AI Image Loop] Releasing stale Gemini wait lock.');
    isWaiting = false;
  }

  if (isWaiting) {
    console.log('[AI Image Loop] Gemini: already waiting, skipping.');
    return;
  }
  isWaiting = true;
  lastGeminiPromptTime = Date.now();

  try {
    const baselineCount = countGeminiImages();
    const baselineResponses = document.querySelectorAll([
      'model-response',
      '.response-container',
      'message-content',
      '[class*="model-response"]',
      '[data-test-id*="response"]'
    ].join(', ')).length;

    // 1. Try to switch to an image-capable Gemini model
    await ensureImageModel();
    await sleep(500);

    // 2. Find the input
    const inputEl = await findGeminiInput();
    if (!inputEl) {
      chrome.runtime.sendMessage({
        type: 'IMAGE_ERROR',
        platform: 'gemini',
        error: 'Could not find Gemini input box — make sure gemini.google.com is open'
      }).catch(() => {});
      isWaiting = false;
      return;
    }

    // 3. Inject the prompt text
    await injectTextIntoGeminiInput(inputEl, prompt);

    // 4. Submit
    await submitGeminiPrompt(inputEl);

    // 5. Wait for generation to complete
    const result = await waitForGeminiImageGeneration(baselineCount, baselineResponses, 150000);
    await sleep(800);

    if (result === 'error') {
      chrome.runtime.sendMessage({
        type: 'IMAGE_ERROR',
        platform: 'gemini',
        error: 'Gemini reported a generation error'
      }).catch(() => {});

    } else if (result === 'timeout') {
      chrome.runtime.sendMessage({
        type: 'IMAGE_ERROR',
        platform: 'gemini',
        error: 'Gemini timed out (150s) waiting for image'
      }).catch(() => {});

    } else if (result === 'done' || countGeminiImages() > baselineCount) {
      const latestImg = getLatestGeminiImage();
      const imageUrl  = await getImageUrlOrDataUrl(latestImg);

      chrome.runtime.sendMessage({
        type: 'IMAGE_DONE',
        platform: 'gemini',
        imageUrl: imageUrl || null
      }).catch(() => {});

    } else {
      // 'done_text' — Gemini responded with text only
      chrome.runtime.sendMessage({
        type: 'IMAGE_ERROR',
        platform: 'gemini',
        error: 'Gemini responded with text instead of generating an image'
      }).catch(() => {});
    }

  } catch (err) {
    console.error('[AI Image Loop] Gemini content script error:', err);
    chrome.runtime.sendMessage({
      type: 'IMAGE_ERROR',
      platform: 'gemini',
      error: err.message
    }).catch(() => {});
  } finally {
    isWaiting = false;
  }
}

// ─── Message Listener ────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SEND_PROMPT') {
    sendPromptToGemini(msg.prompt);
    sendResponse({ ok: true });
  }
  if (msg.type === 'PING') {
    sendResponse({ ok: true, platform: 'gemini' });
  }
  return true;
});

console.log('[AI Image Loop] Gemini content script loaded ✓');
