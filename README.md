# 🔁 AI Image Loop — Browser Extension

A browser extension that **continuously sends image-generation prompts** to ChatGPT and/or Gemini in an automated loop — cycling through your prompt list, waiting for each image to finish before sending the next.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Loop Control** | Start / Stop the loop from the popup |
| **Platform Choice** | ChatGPT only, Gemini only, or Both simultaneously |
| **Prompt Cycling** | Add a list of prompts — they cycle in order |
| **Smart Waiting** | Waits for image generation to complete before next prompt |
| **Max Loops** | Set a limit (or 0 for infinite) |
| **Live Log** | Real-time activity feed in the Log tab |
| **Status Dots** | Per-platform generation status indicators |

---

## 📁 File Structure

```
AI Image Loop Extension/
├── manifest.json           ← Chrome/Edge (MV3)
├── manifest_firefox.json   ← Firefox (MV2) — rename to manifest.json when loading in Firefox
├── background.js           ← Service worker: loop orchestration
├── content_chatgpt.js      ← ChatGPT injector & completion detector
├── content_gemini.js       ← Gemini injector & completion detector
├── popup.html              ← Extension popup UI
├── popup.css               ← Premium dark-mode styles
├── popup.js                ← Popup logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🚀 Installation

### Chrome / Edge (Recommended)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `AI Image Loop Extension` folder
5. The extension icon appears in your toolbar

### Firefox

1. Rename `manifest_firefox.json` → `manifest.json` (backup the Chrome one first)
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click **"Load Temporary Add-on"**
4. Select any file inside the extension folder

---

## 🎯 How to Use

### Step 1 — Add Prompts
1. Click the extension icon to open the popup
2. Go to the **Prompts** tab
3. Type your image prompt (e.g. `A futuristic city at sunset, ultra detailed`)
4. Click **Add** or press **Ctrl+Enter**
5. Add as many prompts as you want — they cycle in order

### Step 2 — Configure
1. Go to the **Control** tab
2. Choose your **Platform**: ChatGPT, Gemini, or Both
3. Set **Max Loops** (0 = run forever)

### Step 3 — Start!
1. Click **Start Loop** 🚀
2. The extension opens tabs for your chosen platforms
3. It types the prompt, submits it, waits for the image to finish, then moves to the next prompt
4. Watch the **Log** tab for real-time activity

### Step 4 — Stop
- Click **Stop** at any time to halt the loop

---

## ⚙️ How It Works

```
Popup → Background Worker → Content Script (ChatGPT/Gemini)
                                    ↓
                          Types prompt into input
                                    ↓
                          Clicks Send button
                                    ↓
                          Waits for image to appear
                                    ↓
                          Sends IMAGE_DONE back to background
                                    ↓
                          Background starts next iteration
```

### Detection Strategy

**ChatGPT**: Waits for the "Stop generating" button to disappear AND an `<img>` tag to appear in the latest message.

**Gemini**: Waits for the loading indicator and stop button to disappear, then confirms a response appeared.

---

## 🔧 Prompt Tips for Image Generation

For **ChatGPT (DALL-E)**, prompts should be direct:
- `Generate an image of a dragon flying over a medieval castle`
- `Create a photorealistic image of an astronaut on Mars at sunrise`

For **Gemini (Imagen)**, prompts work similarly:
- `Generate an image: a cyberpunk street scene, neon lights, rain`
- `Create an artistic illustration of a phoenix rising from flames`

> **Note**: Make sure you're using a ChatGPT account with DALL-E image generation enabled, and a Gemini account with image generation available.

---

## ⚠️ Troubleshooting

| Issue | Solution |
|---|---|
| Extension can't find the input box | The AI site may have updated its UI. Try refreshing the ChatGPT/Gemini tab |
| Loop gets stuck | Click Stop, reload the AI tab, and restart |
| "Could not find input" error | Make sure you're logged in to ChatGPT/Gemini before starting |
| Images not generating | Ensure your account has image generation access |

---

## 🛡️ Privacy

- This extension only runs on `chatgpt.com`, `chat.openai.com`, and `gemini.google.com`
- No data is sent to any external server — everything runs locally in your browser
- Prompts are stored in `chrome.storage.local` (your browser only)

---

*Built with vanilla JS, no frameworks, no dependencies.*
