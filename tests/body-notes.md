# Body skill tree

A static app at `/body/`, copied from `public/body/` by the existing Reactfolio build. No application server.

The UI is a hierarchy: all skills → movement family → skill path → exercise details. No card library or dashboard. Pan and zoom work with pointer gestures, touch pinch, keyboard arrows, and the three map controls. Skill statuses are explicit; earlier skills are never automatically marked.

`data.js` contains 22 curated paths and 134 stable exercise IDs. `media.js` provides 39 direct visual matches and clearly labelled related references for other variations. `scripts/body-media.py` vendors the selected image assets from the permitted RepDB free tier and Wikimedia Commons; credits and licenses accompany the images. Images are illustrations or still photographs, not video demonstrations. The video action is explicitly a YouTube search link.

`store.js` saves locally, reads JSONBin before writing, merges per-entry timestamps, and reads back after writing. Failed reads never trigger blind writes. JSONBin has no transactional compare-and-swap here; concurrent edits to the same skill are best-effort, latest timestamp wins. Export/import is in the small progress settings sheet. `config.js` uses the existing requested client-side credential arrangement; do not log it.

`sw.js` caches the app and the locally hosted reference images for offline return visits. It does not cache JSONBin. `?preview=1` is an isolated in-memory browser test mode; it never reads or writes real progress.

Checks: `node --test tests/body.test.cjs`, `CI=true npm test -- --watchAll=false --runInBand`, `npm run build`. Existing GitHub Pages deployment is retained. Source is committed and pushed on request; the CI workflow includes the Body checks.
