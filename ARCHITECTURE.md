# Rubiculous Architecture — Canonical Definitions

## Flows (Navigation Choreography)
What lives in `modules/orbits/orbit-engine.js`.
Named, persistent sequences of module steps.
Handles: step sequencing, timing, localStorage persistence, navigation triggering.
This is runtime behavior inside one system.

## Orbits (NOT YET BUILT)
Independent, deployable satellite systems sharing the Rubiculous kernel.
Each orbit is its own greenhouse — separate structure, own purpose, own door.
Same land (kernel), different builds.
Examples: merch store, Rugen's 3rd Eye portal, Octopus Method, Makki Writes.

## Rule
flows = internal navigation choreography
orbits = external satellite systems
Never mix these.

## Current file alias
orbit-engine.js = flow engine (name kept to avoid breaking imports)
