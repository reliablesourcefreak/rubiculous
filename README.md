# The Rubiculous

> *"Pain is information. Orbits absorb evolution. Core stays inert."*

---

This is not a website. This is not a platform. This is not a tool.

This is an atelier.

A working studio open to the sky. Where music gets made, worlds get built, stories get written, characters breathe, plots arc, illustrations accumulate, games get shipped, and anime gets dissected at 2am because something about it mattered.

Everything under one roof. Your roof. Your machine. Your rules.

No algorithm decides what surfaces. No subscription decides what stays. No platform decides what you are. The Rubiculous is a creative OS — not because it runs on an operating system, but because it *is* one. A kernel that never bloats. Orbits that grow, break, get replaced, and grow again. Pain becomes architecture. Resistance becomes fuel.

The workshop is open. The guest room has a light on.

But the building is yours.

---

## What lives here

| Orbit | What it holds |
|---|---|
| Worlds | GOA · Fotura · Gyanja · Null Sector · characters · lore · maps |
| Bazaar | Writing · transmissions · blog · anime commentary |
| Gallery | Illustrations · collages · visual archive |
| Radio | Generative music · lofi · jazz · ambient |
| Sandbox | Relationship maps · project boards · connections |
| Plot Room | Story arcs · scene structure · codex |
| Game | Future: indie games built here |

---

## Run it

```bash
cd ~/rubiculous/dev/rubiculous
python3 -m http.server 8123
```

Open `http://localhost:8123`

---

## Architecture

```
engine/          ← kernel (never touches content)
  runtime-kernel.js
  navigation.js
  persistence.js
  registry.js

modules/         ← one folder per orbit
  worlds/
  radio/
  gallery/
  sandbox/
  plot/
  ...

index.html       ← the shell
```

Verify everything is alive:
```javascript
Rubiculous.list() // → 9 modules
```

---

## Save your work

```bash
git add -A && git commit -m "what you did"
```

Escape hatch if something breaks:
```bash
git reset --hard HEAD
```

---

*Built March 2026. Still shipping universes.*
