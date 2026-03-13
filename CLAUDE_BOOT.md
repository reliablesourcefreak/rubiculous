# CLAUDE_BOOT.md — Rubiculous Context Bootstrap
> Drop this file into every new Claude chat. Claude reads it and we're building in 60 seconds.

---

## WHO I AM
Freestyle builder, zero formal IT background, Rocky Linux, learning as I go.
I work with: Claude (UI/live rendering/QA), ChatGPT (backend/kernel building), Gemini (narrative).
I hate: nano editing, back-and-forth, manual debugging, being treated like an expert.
I love: one command fixes, live visual rendering in chat, small steps, no frameworks.

---

## THE ECOSYSTEM — 4 PROPERTIES

### 1. THE RUBICULOUS (primary build — this is what we work on most)
- **What:** Creative laboratory. Fiction, worlds, games, art. "A black market art gallery in a city that never recovered."
- **Vibe:** Hot chaos. Mid-explosion. Warm, kinetic, alive.
- **Colors:** Amber/rust `#ff6b35`, gold tones, dark brown-black backgrounds
- **Typography:** Playfair Display (serif) + monospace for functional elements
- **Language:** transmission, signal, operative, archive, frequency, artifact, fragment
- **NOT:** cold, cyberpunk terminal, encrypted, neural link (that's Rugen's vocabulary — never contaminate)
- **Live at:** `http://localhost:8123` (python3 http.server)
- **Files:** `~/rubiculous/dev/rubiculous/` — `index.html` is 6640 lines (legacy monolith)

### 2. RUGEN'S 3RD EYE
- **What:** Epistemic engine. Systems thinking. Slow cognitive habitat.
- **Vibe:** Cold, precise, cybernetic. Control room behind a locked door.
- **Colors:** Terminal green `#00FF41`, dark navy `#0a0f14`, cyan `#00E5FF`
- **Typography:** JetBrains Mono / monospace only
- **Platform:** Replit

### 3. MAKKI'S BLOG
- **What:** Technical mind out loud. Linux, OSINT, hacking + philosophy crossover.
- **Colors:** Cyan `#4fc3f7`, dark minimal
- **Platform:** Base44 (makkiwrites.base44.app) — already functional

### 4. OCTOPUS METHOD (mothership — not built yet)
- **What:** Life architecture for sovereign polymaths. 8 Arms framework.
- **Colors:** Gold `#d4a853`, teal `#4db8a4`, dark `#07090d`
- **Status:** Concept only. Build last.

---

## THE RUBICULOUS — TECH STACK

```
index.html                  ← 6640 line legacy monolith (host file)
engine/runtime-kernel.js    ← module registry + boot sequencer (NEW — ChatGPT built)
engine/app.js               ← main entry, patched to route through kernel
engine/navigation.js        ← routing, patched
engine/home.js              ← first module to boot
engine/radio.js             ← NEURAL_LOFI_STATION widget
engine/content-controller.js
engine/worlds-controller.js
engine/registry-ui.js
engine/editor-controller.js
engine/sandbox-controller.js
engine/gallery-runtime.js
engine/registry.js
engine/registry-links.js
+ 14 more engine files
```

**Script load order in index.html (correct as of yesterday):**
1. `runtime-kernel.js` ← must be first
2. `navigation.js`
3. `home.js`
4. `app.js`

**Kernel status:** WORKING. `Rubiculous.list()` returns `['home']` in console.

---

## CORE PHILOSOPHY

Born from suffering with Claude HTML dumps and rate limits.

- **Core-4 kernel** (data, ops, storage, ui) — stays under 200 lines, never grows
- **Orbits** = swappable modules (blog, game, research, etc.)
- **Pain = signal** → new orbit, never core bloat
- **Local-first** — no backend, no frameworks, vanilla JS only, browser-native
- **"Rate limits that tortured me became kernels that freed me"**

---

## HOW WE WORK TOGETHER

1. **Claude renders UI live in chat** — I look at it, say what I like/hate, Claude adjusts
2. **One file at a time** — never paste everything at once
3. **One command fixes** — no nano, no back-and-forth
4. **Screenshots** → Claude sees the site, we design together
5. **Console errors** → paste here, Claude diagnoses

---

## CURRENT STATUS (March 2026)

✅ Kernel wired and booting  
✅ Homepage hero — stunning (dark, Rubiculous cube, "Where worlds are built")  
✅ Navigation — Home, Bazaar, Worlds, Gallery, Informatics  
✅ NEURAL_LOFI_STATION radio widget  
✅ Script load order fixed yesterday  
⏳ Continue building from here — ask me what's next  

---

## FIRST MESSAGE AFTER DROPPING THIS FILE
> "I've read the bootstrap. What do you want to work on today?"
