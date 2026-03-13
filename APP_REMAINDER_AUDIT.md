# App.js Remainder Audit

Source package: `rubiculous_targeted_surgery_4_complete.zip`

## Summary

- Remaining unique named functions in `engine/app.js` before minimization: **63**
- Remaining unique named functions in `engine/app.js` after minimization: **62**

## Buckets before minimization

### Boot / navigation shell
- `navigate`
- `toggleThemeMenu`
- `setTheme`
- `toggleMobileNav`
- `init`

### Home
- `renderHome`

### Radio
- `renderRadio`

### Registry / informatics
- `saveRegistry`
- `switchRegistryTab`
- `renderRegistryCharacters`
- `setRegistryFilter`
- `renderRegistryWorlds`
- `renderRegistryTimeline`

### Search / misc search
- none

### Misc / shared
- `getWorldColor`
- `loadPosts`
- `savePosts`
- `loadGallery`
- `initAudio`
- `stopAll`
- `noteFreq`
- `playTone`
- `playNoise`
- `scheduleLofi`
- `scheduleAmbient`
- `scheduleJazz`
- `scheduleSynth`
- `scheduleChillhop`
- `startStation`
- `drawViz`
- `animateBars`
- `updateDisplay`
- `renderPostGrid`
- `renderGalleryPreview`
- `setGalleryFilter`
- `setGalleryTypeFilter`
- `renderGalleryGrid`
- `buildCard`
- `openGalleryLightbox`
- `showZoom`
- `renderZoomUniverses`
- `universeCard`
- `renderZoomExNihilo`
- `renderAdminList`
- `showEditor`
- `editPost`
- `closeEditor`
- `closeMobileNav`
- `initRadio`
- `loadLinks`
- `saveLinks`
- `addLink`
- `removeLink`
- `getLinks`
- `openLinkModal`
- `closeLinkModal`
- `renderLinkModal`
- `filterLinkCandidates`
- `linkAndRefresh`
- `removeLinkAndRefresh`
- `renderLinkedPanel`
- `typewriter`
- `openProfile`
- `closeProfile`


## Minimization pass performed

Moved out of `app.js` where present:

- `characters.js`: `renderRegistryCharacters`

## Honest read

`app.js` is no longer the only place where subsystem behavior lives, but it still contains a meaningful shell plus several remaining feature bodies.

The next best extractions after sleep are likely:

1. home / navigation shell
2. registry / informatics
3. radio render helpers
4. cross-cutting shared UI helpers
