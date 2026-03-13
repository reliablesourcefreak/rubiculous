# Rubiculous Canonical Repo

This package is a fresh reconstruction from the uploaded source monolith (`rubiculous_v15 (1).html`).
It is meant to be a stable, local-first base you can keep, version, and re-upload without losing work to session expiry.

## What is in this repo

- `index.html` — original interface, with runtime moved to external scripts
- `engine/persistence.js` — local/session storage helpers
- `engine/world.js` — universe/world data and entry persistence helpers
- `engine/characters.js` — character registry data and registry load/save helpers
- `engine/search.js` — search overlay/runtime block extracted from the monolith
- `engine/app.js` — the remainder of the original application script

## Why this repo exists

The prior download links expired with the temporary execution session. This repo is the durable replacement.

## How to run locally

### Option 1: Python

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Option 2: VS Code Live Server

Open the folder and serve `index.html`.

## What is still intentionally unfinished

This package is a **clean canonical base**, not a fabricated "final perfect build".
The remaining deep kernelization work is still ahead:

1. `sandbox-controller.js` + `sandbox-geometry.js`
2. `plot-controller.js` + `plot-viewmodel.js`
3. `worlds-controller.js` + `worlds-viewmodel.js`
4. `content-controller.js` + `content-viewmodel.js`
5. `graph-layout.js` + `graph-adapter.js`
6. `radio-runtime.js`
7. `editor-controller.js` + `auth-service.js`

## Recommended next step

Keep this zip locally. Upload this exact repo back into chat when you want the next kernelization pass done.
