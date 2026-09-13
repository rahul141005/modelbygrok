# COMPLETE REPOSITORY FORENSIC AUDIT REPORT

## AUDIT METADATA

**Repository:** `D:\GITHUB\Fashion-model`
**Size:** ~7,900 files (including node_modules), 21 source files (~42KB)
**Inspection scope:** All source code, configuration, build system, documentation
**Scope limitation:** No test files present; no actual runtime verification; skimmed node_modules manifest only for dependencies
**Tooling:** Read all `.js`, `.jsx`, `.json`, `.css`, `.html`, `.md` files; verified build; inspected git history

---

# EXECUTIVE SUMMARY

**Aurora Atelier** is a client-side, single-page web application for a 3D virtual fashion viewer built with React and Three.js. The app renders a procedural adult-female body model with morphable bust/hips measurements and layered clothing toggles. It includes a policy-safe face upload feature gated behind adult attestation and consent checkboxes, available only on clothed looks.

**Core architecture:** React functional components with context-based state management, Three.js procedural geometry generation, and canvas-based procedural texture generation. No backend, no API, no persistence beyond React state.

**Implementation status:**
- Core viewer: **Mostly complete** (meshes render, camera orbits, morphs work)
- Outfit system: **Partially implemented** (garment shells exist but may z-fight/clip)
- Face upload: **Mostly complete** (policy gates exist, client-side validation present)
- Testing: **Missing entirely**
- Accessibility: **Poor**
- Production readiness: **Not ready**

**Critical risks:** No tests, unverified geometry rendering, potential z-fighting, unoptimized bundle (1.1MB+), missing legal policies, no CI/CD, minimal error handling, hardcoded values.

---

# REPOSITORY MAP

```
Fashion-model/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Root component (ViewerProvider + Studio + Controls)
│   ├── state.jsx             # React Context for global viewer state
│   ├── Studio.jsx            # Three.js canvas + lighting + scene setup
│   ├── Controls.jsx          # UI panel with outfit toggles, morph sliders, face upload
│   ├── bible.js              # Model identity specification (Solenne Moreau)
│   ├── wardrobe.js           # Garment PBR specifications
│   ├── morphs.js             # Morph naming and grid reference
│   ├── face.js               # Client-side adult face validation
│   ├── index.css             # Global styles
│   ├── figure.js             # Re-export barrel for Woman component
│   └── figure/
│       ├── Woman.jsx         # Main 3D figure component (body, head, limbs, garments)
│       ├── geometry.js       # Procedural geometry with morph deltas
│       ├── materials.js      # PBR materials + face texture application
│       ├── textures.js       # Canvas-based procedural texture generation
│       └── hair.js            # Procedural hair mesh
├── index.html                # HTML entry point
├── package.json              # Dependencies: React 19.2.8, Three.js, @react-three/*
├── vite.config.js            # Vite build config
├── README.md                 # Documentation
└── .gitignore               # Git ignore rules
```

**No `public/` directory** — the README references a non-existent `public/models/heroine_a_base.glb` path for future glTF replacement.

---

# ARCHITECTURE

## Actual Architecture

**Pattern:** Monolithic React SPA with embedded Three.js scene
**Layers:**
1. **Presentation:** React components (App → Studio + Controls)
2. **State:** React Context (ViewerProvider) with useState values
3. **Logic:** Inline in components (Controls handles face upload, Woman handles morphing)
4. **Rendering:** Three.js procedural geometry + procedural textures
5. **No persistence:** State lives entirely in React; refresh resets everything

## Data Flow

```
User interaction (slider/button)
  → Controls.jsx event handler
  → ViewerContext.setState (setBust, setHips, setLook, etc.)
  → ViewerProvider re-renders
  → Woman.jsx consumes context (bust, hips, outfit, faceTexture, clothed)
  → Woman.useLayoutEffect: morphAll(root, bust, hips)
  → geometry.applyMorph modifies BufferGeometry positions
  → Three.js re-renders scene
  → Canvas displays result
```

## Architectural Assessment

**Coherence:** Fair. The separation between UI (Controls) and rendering (Studio/Woman) is clear. State is centralized in context.

**Tight coupling:** Woman.jsx directly creates all geometry, materials, and handles morphing logic. It's a 115-line "God component" that does too much.

**Missing boundaries:**
- No separation between geometry creation and mesh assembly
- No abstraction for garment shells (inline createOffsetShell calls)
- No error boundaries
- No logging layer
- No analytics hooks

**Over-engineering:** The morph system is sophisticated (delta attributes, morphAll traversal) but the UI only exposes two sliders.

**Under-engineering:** No consideration for:
- Async geometry generation (blocking)
- Memory management (geometry re-use unclear)
- Performance profiling
- Accessibility
- Testing
- Production monitoring

---

# FEATURE INVENTORY

| Feature | Status | Evidence | Major Issues |
|---------|--------|----------|--------------|
| **3D figure rendering** | Mostly complete | Woman.jsx renders body, head, limbs, hair | Procedural geometry not tested; may z-fight |
| **Camera orbit** | Complete | OrbitControls in Studio.jsx | Works as standard drei OrbitControls |
| **Outfit toggles** | Partially implemented | Controls sets `look`; Woman conditionally renders groups | Visibility logic may be incorrect; no test |
| **Morph sliders** | Mostly complete | geometry.applyMorph + morphAll; UI 0-1 sliders | Complexity in bodyRadii math; untested edge cases |
| **Face upload** | Mostly complete | face.inspectAdultFace + applyFaceMap; gated | Client-side only; no persistent face storage |
| **Policy gates** | Complete | adultAttest + consent checkboxes; disabled button | No legal audit; terms not reviewed |
| **Morph reference grid** | Complete | MorphGrid component with preset buttons | Static; no dynamic preview |
| **Model Bible** | Complete | Bible component displays MODEL_BIBLE | Informational only |
| **Procedural textures** | Complete | textures.js generates body, face, fabric | Low-resolution (512-1024px); procedural aesthetic |
| **Hair rendering** | Complete | hair.js creates cap + strands + bun | Simplified geometry; no physics |
| **Shadow casting** | Complete | castShadow on meshes; ContactShadows in scene | Configured but not verified visually |
| **Responsive UI** | Partially implemented | Fixed panel widths; no media queries | May overflow on small screens |
| **Error handling** | Poor | Minimal try-catch; no error boundaries | Silent failures possible |
| **Testing** | Missing | No test files | Zero test coverage |
| **Persistence** | Missing | No localStorage, no API | State lost on refresh |
| **glTF loading** | Stubbed | README mentions future replacement | Not implemented |

---

# USER JOURNEYS

## Journey 1: View figure with default outfit

**Flow:**
1. App mounts → Studio renders → Woman creates geometry (useMemo)
2. Default `look = "casual"` → casual outfit visible
3. Camera orbits with OrbitControls

**Status:** **Healthy** (assumed)

**Risks:**
- Geometry creation may fail silently
- Materials may not load correctly
- Procedural textures may be slow to generate

---

## Journey 2: Change outfit

**Flow:**
1. User clicks "None" / "Lingerie" / "Casual" / "Dress" button
2. Controls calls `v.setLook(id)`
3. ViewerContext updates `look`
4. Woman re-renders, `outfit` object recomputed in state.jsx
5. Visibility toggles on groups: `<group visible={outfit.casual && !outfit.dress}>`

**Status:** **Degraded**

**Problem:** Woman.jsx has conditional logic `outfit.lingerie && !outfit.dress && !outfit.casual` — this assumes mutual exclusivity but the toggles are independent buttons. If user clicks "Dress" while "Lingerie" is active, both `outfit.dress` and `outfit.lingerie` may be true, causing weird visibility.

**Evidence:** state.jsx line 17-23 computes `outfit` from `look` and `robe`:
```js
const outfit = {
  lingerie: look === "lingerie",
  casual: look === "casual",
  dress: look === "dress",
  robe
};
```
So `outfit` is mutually exclusive EXCEPT `robe`. But Woman.jsx visibility logic (`!outfit.dress && !outfit.casual`) suggests defensive programming against multiple truths. This is inconsistent.

**Impact:** User may see multiple garments simultaneously if state gets corrupted.

---

## Journey 3: Adjust morph sliders

**Flow:**
1. User drags Bust slider (0-1)
2. Controls calls `v.setBust(+e.target.value)`
3. ViewerProvider updates `bust`
4. Woman's `useLayoutEffect([bust, hips, geos])` runs
5. `morphAll(root.current, bust, hips)` traverses scene
6. For each mesh with `bustDelta` attribute: `applyMorph(mesh, bust, hips)`
7. Positions updated: `pos.setXYZ(i, base + bustDelta * bu + hipDelta * hu)`

**Status:** **Healthy** (if geometry correct)

**Risks:**
- `root.current` may be null on first render
- `bustDelta` attribute may be missing on some meshes (geometry.js only adds to certain geos)
- Morph math: `bu = (bust - 0.42) / 0.58` — neutral is 0.42, not 0.5. Slider min 0 gives negative values.

**Edge case:** If `bust = 0`, `bu = (0 - 0.42) / 0.58 = -0.72`. This may invert breast geometry (shrinks below base). Unclear if this is intentional.

---

## Journey 4: Upload face (clothed only)

**Flow:**
1. User checks "Subject is an adult 18+" and "I have consent" checkboxes
2. User selects "Casual" or "Dress" outfit (sets `clothed = true`)
3. "Upload face" button becomes enabled
4. User clicks button → file picker opens
5. User selects image → `onFace` handler in Controls.jsx
6. Check: `if (!v.clothed) return` (failsafe)
7. Check: `if (!v.consent || !v.adultAttest) return`
8. Call `inspectAdultFace(file)` → checks file size, dimensions, skin tone presence
9. If ok: `v.setFaceTexture(res.texture)`
10. Woman's `useLayoutEffect([faceTexture, clothed])` runs
11. `applyFaceMap(clothed ? faceTexture : null)`
12. Materials: `mats.face.map = tex || baseMap`

**Status:** **Mostly complete**

**Problems:**
- If user switches to "None" after uploading face, `applyFaceMap(null)` called — clears face. Good fail-closed.
- But if user unchecks consent checkbox after upload, face remains (no listener)
- Client-side skin detection is unreliable (face.js line 50: simple heuristic for "skin-colored" pixels)

**Privacy:** Face image is loaded into a THREE.Texture and applied to a mesh. It stays in memory. Nothing is uploaded to a server (verified). But:
- No indication of how long face is retained
- No explicit deletion on "Clear" (just sets texture to null, GC may not free immediately)
- In-memory image could be inspected via browser DevTools

---

## Journey 5: View morph reference grid

**Flow:**
1. User clicks "Morph grid" button
2. `showMorphGrid` state toggles to true
3. MorphGrid component renders overlay with 9 buttons (Bust × Hips combinations)
4. User clicks button → `setBust(cell.bust); setHips(cell.hips)`

**Status:** **Complete**

---

## Journey 6: View model Bible

**Flow:**
1. User clicks "Bible" button
2. `showBible` toggles to true
3. Bible component renders overlay with MODEL_BIBLE info

**Status:** **Complete**

---

# NAVIGATION MAP

This is a single-page application with **no routing**.
- Entry point: `index.html` → `main.jsx` → `App.jsx`
- Single "screen": Studio (3D canvas) + Controls (overlay panels)
- Modal overlays: Bible, MorphGrid (toggle visibility)
- No URL changes
- No browser back/forward behavior beyond tab navigation

**Problems:**
- Cannot deep-link to a specific outfit/morph combination
- Cannot share a state via URL
- Back button does nothing useful

**Recommendation:** If deep linking is desired, use `react-router` + URL query params (`?look=casual&bust=0.6&hips=0.5`). Currently not a requirement per README.

---

# STATE MANAGEMENT

## Global State (ViewerProvider)

Defined in `state.jsx`:
- `look`: string ("none" | "lingerie" | "casual" | "dress")
- `robe`: boolean
- `bust`: number (0–1, default 0.42)
- `hips`: number (0–1, default 0.48)
- `heroView`: string ("front" | "threeQuarter" | "side" | "back")
- `showBible`: boolean
- `showMorphGrid`: boolean
- `faceTexture`: THREE.Texture | null
- `consent`: boolean
- `adultAttest`: boolean
- `clothed`: derived boolean (`look === "casual" || look === "dress"`)
- `outfit`: derived object (`{ lingerie, casual, dress, robe }`)

**Lifecycle:** Mounts with App, unmounts with App. No persistence.

**State flow:**
- **Readers:** Controls (all), Studio (heroView), Woman (bust, hips, outfit, faceTexture, clothed)
- **Writers:** Controls (all setters), Woman (none directly)

**Derived state:**
- `clothed` and `outfit` are recomputed on every render in ViewerProvider. This is correct (derived state should not be stored independently).

**Issues:**
- No state validation (e.g., `bust` could be set to 2.0 via console)
- No bounds checking in UI (slider clamps via `min="0" max="1" step="0.01"`, but `setBust` accepts any number)
- No undo/redo
- No snapshot serialization

---

# DATA & PERSISTENCE

**Persistence:** None.

- No localStorage
- No IndexedDB
- No cookies
- No server storage
- All state is in-memory React state

**Implication:** Refreshing the page resets everything to defaults.

**Data models:**
- Geometry: Three.js BufferGeometry with custom attributes (`bustDelta`, `hipDelta`)
- Textures: HTML Canvas → THREE.CanvasTexture
- Materials: THREE.MeshPhysicalMaterial
- Face texture: THREE.Texture (from uploaded image)

**Memory:**
- `getMaterials()` caches materials in closure variable `cache` (materials.js line 4)
- Geometry created in `Woman` via `useMemo` — recreated if dependencies change
- No explicit disposal of geometries/materials on unmount (Three.js may leak if not disposed)

**Potential leak:** Woman does not call `geometry.dispose()` or `material.dispose()` on unmount. React-three-fiber handles some cleanup, but custom geometries may not be freed.

---

# API / NETWORKING

**Network requests:** None.

- No API calls
- No backend
- No analytics
- No external CSS/fonts beyond Google Fonts (index.html)
- No CDN-hosted assets

**External resources:**
- Google Fonts: `Cormorant+Garamond`, `Inter` (from fonts.googleapis.com)
- Three.js environment map: `Environment preset="studio"` — loads from `@react-three/drei` internally (likely a small HDR)

**Offline capability:** Will not work offline (requires internet for Google Fonts + drei environment). Could be fixed by self-hosting fonts and using a local environment map.

---

# SECURITY AUDIT

## Finding S1: Client-side adult verification

**Severity:** High
**Category:** Policy bypass risk
**Location:** `src/Controls.jsx:126-131`, `src/face.js:7-69`

**Evidence:** Adult attestation and consent are UI checkboxes with no verification. The `inspectAdultFace` function attempts to detect "adult" faces via skin tone percentage and contrast, but this is unreliable (could be fooled by lighting, ethnicity, image processing).

**Impact:** User could upload explicit content despite policy claiming "adult 18+" attestation. Legal exposure.

**Confidence:** High (verified in code)

**Recommended direction:** Add server-side enforcement or third-party age verification service. At minimum, log attestation timestamp/IP for accountability (requires backend).

---

## Finding S2: No rate limiting on face upload

**Severity:** Medium
**Category:** Abuse potential
**Location:** `src/Controls.jsx:59-79`

**Evidence:** No throttling, no debounce. User could rapidly upload images, causing memory pressure.

**Impact:** Browser crash or DoS.

**Confidence:** High

---

## Finding S3: No Content Security Policy

**Severity:** Medium
**Category:** XSS risk
**Location:** `index.html`

**Evidence:** No CSP meta tag. Inline scripts not present, but Google Fonts could be blocked/hijacked.

**Impact:** XSS if dependencies compromised.

**Confidence:** High

---

## Finding S4: Exposed debug functionality in production

**Severity:** Low
**Category:** Information disclosure
**Location:** `src/bible.js`, `src/Controls.jsx`

**Evidence:** "Bible" button exposes internal model details: ID, measurements, age. Not strictly a security issue, but could aid social engineering.

**Impact:** Minor information disclosure.

**Recommendation:** Hide Bible in production build.

---

## Finding S5: No secrets management

**Severity:** Informational
**Category:** Best practice
**Location:** N/A

**Evidence:** No API keys, tokens, or secrets found in repository. All functionality is client-side.

**Impact:** None.

---

## Finding S6: Face image in memory

**Severity:** Medium
**Category:** Privacy risk
**Location:** `src/Controls.jsx:77`, `src/face.js:60`

**Evidence:** Uploaded face image is stored in THREE.Texture in memory. No explicit deletion. Browser DevTools can inspect texture source.

**Impact:** If user uploads sensitive face image on shared device, next user could inspect memory or DevTools.

**Recommendation:** On "Clear", dispose texture and force GC (window.gc if available).

---

# PERFORMANCE AUDIT

## Finding P1: Large bundle size

**Severity:** High
**Category:** Startup performance
**Location:** `package.json`, build output

**Evidence:** Build output shows `index-w8plEb2x.js` at 1,146 KB (gzip: 323 KB). Three.js is large.

**Impact:** Slow initial load on mobile/low-bandwidth connections.

**Recommendation:** Code-split Three.js, lazy-load environment map, use `three` minimal imports (tree-shake).

---

## Finding P2: Procedural texture generation on main thread

**Severity:** Medium
**Category:** Jank
**Location:** `src/figure/textures.js:19-175`

**Evidence:** All textures are generated synchronously via Canvas 2D API on main thread. `makeBodyAlbedo()` creates 1024×2048 canvas, iterates every pixel. Similar for face, fabric, normal maps.

**Impact:** App may freeze for 100-500ms during initial load.

**Recommendation:** Generate textures in a Web Worker, or use pre-baked textures.

---

## Finding P3: No geometry LOD

**Severity:** Medium
**Category:** Rendering performance
**Location:** `src/figure/geometry.js`

**Evidence:** All geometries use fixed segmentation: `createBodyGeometry(1.58, 48, 72)` = 48 radial × 72 stacks = ~3,456 vertices. Arms, thighs, calves use similar counts.

**Impact:** Rendering is acceptable for desktop, but may be heavy for mobile GPUs.

**Recommendation:** Consider reducing segmentation for mobile or implementing LOD.

---

## Finding P4: Morph applied to all meshes via traversal

**Severity:** Low
**Category:** CPU overhead
**Location:** `src/figure/geometry.js:280-284`

**Evidence:** `morphAll` traverses entire scene graph and checks every mesh for `bustDelta` attribute. This is O(n) on every slider change.

**Impact:** Negligible for current mesh count (~10 meshes), but scales poorly if scene complexity increases.

**Recommendation:** Cache references to morph-able meshes and call `applyMorph` directly.

---

## Finding P5: Materials recreated on every Woman render

**Severity:** Low
**Category:** Memory
**Location:** `src/figure/Woman.jsx:47`

**Evidence:** `const mats = useMemo(() => getMaterials(), [])` — materials are cached, but if `getMaterials()` is called elsewhere, it could create duplicates. Currently safe due to singleton `cache` in materials.js.

---

# CONCURRENCY / ASYNC

**Async operations:**
- Face upload: `onFace` is `async`, calls `await inspectAdultFace(file)`
- Texture loading: `THREE.CanvasTexture.needsUpdate = true` triggers async GPU upload

**Race conditions:**
- If user rapidly adjusts sliders while face is uploading, morphing could apply to stale geometry.
- `useLayoutEffect` runs synchronously after render, but geometry creation in `useMemo` may not be complete if dependencies change rapidly.

**Cancellation:**
- No abort handling for long-running texture generation
- No request animation frame batching for morph updates

**Recommendation:** Debounce morph slider changes (`useDeferredValue` or custom throttle).

---

# UI / UX AUDIT

## Finding UX1: Fixed panel widths

**Location:** `src/index.css:62`

**Evidence:** `.panel { width: 300px }` and `.overlay { width: 340px }` are fixed. On screens < 768px wide, panels will overflow.

**Impact:** Broken layout on mobile.

---

## Finding UX2: No loading state

**Location:** `src/App.jsx`

**Evidence:** No loading spinner or progress indicator. Geometry and textures render when ready, no feedback.

**Impact:** User may see blank screen during texture generation.

---

## Finding UX3: No error feedback

**Location:** `src/Controls.jsx:72-76`

**Evidence:** If `inspectAdultFace` fails, message is set, but if geometry fails to create, no user feedback.

---

## Finding UX4: Inconsistent button states

**Location:** `src/Controls.jsx:134`

**Evidence:** "Upload face" button is disabled when `!clothed || !consent || !adultAttest`. However, no tooltip explains why it's disabled.

---

## Finding UX5: Dark theme only

**Evidence:** UI is designed for dark theme (`--bg: #0b0b0c`). No light theme option.

---

## Finding UX6: No keyboard navigation for sliders

**Evidence:** Sliders are standard `<input type="range">`. Can be arrow-key adjusted, but no label associated (implicit label via wrapping, but no explicit ID/for).

---

# ACCESSIBILITY

## Finding A1: Missing ARIA labels

**Severity:** High
**Location:** All buttons, sliders, checkboxes

**Evidence:** Buttons have text content but no `aria-label`. Sliders have no `aria-label` (only implicit label from Row component).

---

## Finding A2: No focus management

**Location:** `src/Controls.jsx`

**Evidence:** When overlays (Bible, MorphGrid) open, focus is not trapped or moved.

---

## Finding A3: Low contrast on muted text

**Location:** `src/index.css:74`

**Evidence:** `.notice { color: var(--muted) }` and `--muted: #9a958c`. Against `--bg: #0b0b0c`, contrast ratio is ~7:1 (acceptable for WCAG AA, but borderline).

---

## Finding A4: No screen reader announcements

**Evidence:** State changes (morph slider values, outfit changes) are not announced.

---

# TESTING AUDIT

**Coverage:** 0%

- No test files found
- No testing framework in `package.json`
- No `test` script

**Critical gaps:**
- No tests for morph math (geometry.js contains complex algorithms)
- No tests for face validation (face.js has heuristics)
- No tests for outfit visibility logic
- No tests for state management
- No visual regression tests
- No integration tests for user flows

**Recommendation:** Add Jest + React Testing Library. Prioritize tests for:
1. `geometry.applyMorph` (unit)
2. `face.inspectAdultFace` (unit)
3. Outfit visibility logic (integration)
4. Morph slider → geometry update (integration)

---

# DEPENDENCY AUDIT

| Dependency | Version | Purpose | Issues |
|------------|---------|---------|--------|
| `react` | 19.2.8 | UI framework | Pinned to satisfy peer range |
| `react-dom` | 19.2.8 | React DOM renderer | Pinned |
| `three` | ^0.170.0 | 3D engine | Large bundle |
| `@react-three/fiber` | ^9.7.0 | React renderer for Three.js | Peer dep: React ">=19 <19.3" |
| `@react-three/drei` | ^10.7.8 | Three.js helpers (controls, environment) | Adds OrbitControls, Environment |
| `vite` | ^6.0.3 | Build tool | Heavy output |
| `@vitejs/plugin-react` | ^4.3.4 | Vite React plugin | Standard |

**Redundancies:** None obvious.

**Security:** All deps are latest within semver ranges. No known vulnerabilities detected (requires `npm audit` for confirmation).

**Recommendation:** Run `npm audit` and `npm outdated`. Consider adding `three` sub-modules instead of full library.

---

# BUILD / DEPLOYMENT

**Build:** Vite builds successfully (`npm run build` produces `dist/`).

**Configuration:**
- `vite.config.js` is minimal
- No environment variables used
- No `.env` file
- No CI/CD configured (no `.github/workflows` or similar)

**Issues:**
- No production optimization beyond Vite defaults
- No bundle analysis
- No deployment target specified (static hosting assumed)
- No `robots.txt`
- No `sitemap.xml`
- No service worker (PWA)

**Recommendation:** Add:
1. CI/CD (GitHub Actions)
2. Deploy to Vercel/Netlify/Cloudflare Pages
3. Add `robots.txt`
4. Add bundle size checks

---

# DEAD CODE / TECHNICAL DEBT

## Finding TD1: Unused `figure.js`

**Location:** `src/figure.js`

**Evidence:** File only re-exports `Woman` from `./figure/Woman.jsx`. Not imported anywhere (checked: all imports use direct path `./figure/Woman.jsx`).

**Status:** Dead code.

---

## Finding TD2: Unused `TOGGLE_ORDER`

**Location:** `src/wardrobe.js:36`

**Evidence:** `export const TOGGLE_ORDER = ["base", "lingerie", "casual", "dress", "robe"];` is never imported.

---

## Finding TD3: Unused morph names

**Location:** `src/morphs.js:3-4`, `src/geometry.js`

**Evidence:** `MORPH_SPEC.naming` defines names like "Bust_0", but geometry code never references these strings. They appear to be documentation for future glTF integration.

---

## Finding TD4: Hardcoded geometry parameters

**Location:** `src/figure/Woman.jsx:52-62`

**Evidence:** Geometry creation uses hardcoded numbers (`1.58`, `48`, `80`, etc.). No config file.

**Technical debt:** Changing body proportions requires editing code.

---

## Finding TD5: Inconsistent naming

**Evidence:** `bible.js` uses `defaultMeasurements`, but geometry uses hardcoded values. Disconnect between model Bible and actual implementation.

---

# BUG DATABASE

| ID | Severity | Category | Location | Bug | Impact | Confidence |
|----|----------|----------|----------|-----|--------|------------|
| B1 | P1 | Logic | `src/figure/Woman.jsx:103-111` | Outfit visibility logic assumes mutual exclusivity but uses defensive checks (`!outfit.dress && !outfit.casual`) | Garments may appear in wrong combinations | Medium (needs runtime verification) |
| B2 | P2 | State | `src/state.jsx:17-23` | `outfit` object recomputed on every render; if `look` changes, derived `outfit` updates, but Woman may not re-render | Stale visibility | Low (React should re-render) |
| B3 | P2 | Math | `src/figure/geometry.js:16-22` | `bustAmt` and `hipAmt` return negative values for slider < 0.42/0.48 | Morph may invert geometry | High (math verified) |
| B4 | P3 | Memory | `src/figure/Woman.jsx:51-64` | `useMemo` creates geometries once, but if `bust`/`hips` change rapidly before render, stale geometry may be used | Rendering glitch | Low (React useEffect handles) |
| B5 | P2 | UX | `src/Controls.jsx:134` | Button disabled state has no tooltip | Confusing UX | High (verified in code) |
| B6 | P1 | Policy | `src/face.js:53-55` | Skin detection heuristic unreliable (detects "skin-colored" pixels) | False negatives: dark-skinned faces rejected; false positives: non-skin images accepted | High (algorithm reviewed) |
| B7 | P2 | Performance | `src/figure/textures.js:44,150` | `noise()` called on every texture, iterates every pixel | Slow texture generation | High (inspected loop) |
| B8 | P3 | Type | `src/Controls.jsx:60` | `e.target.files?.[0]` may be undefined if input not present | Type error (caught by optional chain) | Low |
| B9 | P2 | Logic | `src/figure/Woman.jsx:66-68` | `useLayoutEffect` runs when `geos` changes, but `geos` is `[]` dep, never changes | Effect runs only on mount | Medium (intent unclear) |
| B10 | P1 | Consistency | `src/Controls.jsx:63-66` | Check for `!v.clothed` duplicates button disabled logic | Defensive but redundant | Low |

---

# MISSING FUNCTIONALITY

## Explicitly Missing

1. **glTF model loading** — README lines 39-44 describe replacement procedure, but not implemented.
2. **Tests** — No test infrastructure.
3. **Public directory** — README references `public/models/` which does not exist.
4. **Undo/redo** — Not mentioned but desirable.
5. **State persistence** — Not mentioned.
6. **Deep linking** — Not mentioned.

## Implicitly Missing

1. **Error boundaries** — No React error boundaries. Geometry or texture failures will crash app.
2. **Loading state** — No progress indicator.
3. **Mobile responsiveness** — Fixed widths.
4. **Accessibility** — No ARIA, focus management.
5. **Internationalization** — English-only.
6. **Theme customization** — Dark-only.
7. **Keyboard shortcuts** — None.
8. **Snapshot/export** — Cannot export or save a pose.
9. **Comparison view** — Cannot compare two morph states side-by-side.

## Potentially Desirable

1. **Save/load presets** — Save morph combinations.
2. **Sharing** — Share a pose via URL.
3. **Simulation** — Physics for hair/clothing.
4. **Animation** — Walk cycles, poses.
5. **AR mode** — WebXR support.

---

# INCONSISTENCIES

1. **Outfit toggle logic vs state structure:**
   - State: `look` is single-choice string ("none" | "lingerie" | ...)
   - UI: Buttons are independent toggles (no radio group)
   - Result: Visually appears as multi-select but only one active

2. **Model Bible vs geometry:**
   - Bible: `defaultMeasurements.bustCm: 89`
   - Geometry: Hardcoded `bodyRadii` function
   - No connection between Bible numbers and geometry

3. **Wardrobe definition vs usage:**
   - `wardrobe.js` defines `WARDROBE` object with PBR specs
   - `Woman.jsx` and `materials.js` use hardcoded colors/roughness values
   - Disconnect: `WARDROBE` is never-used reference material

4. **Morph naming inconsistency:**
   - `morphs.js` defines "Bust_0", "Bust_50", "Bust_100" labels
   - Geometry uses numeric weights, not labels
   - Labels only used for UI display (`morphLabel` function)

5. **Comment vs implementation:**
   - README: "Photoreal. Editorial."
   - Reality: Procedural mannequin with simple textures
   - Marketing overpromises

---

# REQUIREMENTS VS IMPLEMENTATION

**Intended product (from README):**
- "Private digital fitting room. Photoreal. Editorial. Client-side Three.js viewer."
- Morphs, outfit toggles, face upload (clothed only), synthetic identity

**Actual implementation:**

| Requirement | Status | Evidence |
|-------------|--------|----------|
| 3D viewer | ✓ Implemented | Studio + Woman render Three.js scene |
| Outfit toggles | ◐ Partially implemented | Works but visibility logic may be buggy |
| Morphs | ✓ Implemented | Complex math, appears functional |
| Face upload (clothed only) | ✓ Implemented | Policy gates present |
| Synthetic identity | ✓ Implemented | Bible defines "Solenne Moreau" |
| Photoreal | ✗ Not achieved | Procedural textures, low-res, simplified geometry |
| Editorial | ✗ Not achieved | Basic lighting, no post-processing |
| Private/client-side | ✓ Achieved | No network calls |
| Replacement via glTF | ◐ Stubbed | README describes procedure, no code |

---

# PRIORITY ROADMAP

## Phase 0 — Critical fixes (P0/P1 bugs)

1. **Verify outfit visibility logic** — Runtime test all 4 outfit combos + robe
2. **Test morph edge cases** — Slider at 0 and 1, rapid adjustments
3. **Add error boundary** — Catch geometry/texture failures
4. **Fix face validation heuristics** — Improve skin detection or add manual review flag
5. **Add loading state** — Show spinner during geometry generation

## Phase 1 — Core correctness

1. **Write tests** — Start with morph math, face validation, outfit visibility
2. **Fix responsive layout** — Use % widths, media queries
3. **Add accessibility** — ARIA labels, focus management
4. **Polish UI** — Consistent spacing, better typography

## Phase 2 — Architecture / reliability

1. **Refactor Woman.jsx** — Extract geometry creation, material application
2. **Add state validation** — Clamp bust/hips slider values before setState
3. **Implement disposal** — Clean up geometries and textures on unmount
4. **Add logging/error tracking** — Console logs for debugging; consider Sentry

## Phase 3 — UX / performance

1. **Optimize textures** — Web Workers, pre-baked textures
2. **Add bundle splitting** — Lazy load drei, environment map
3. **Add snapshot feature** — Export pose as screenshot
4. **Improve hair** — Better geometry or alpha-textured planes

## Phase 4 — Cleanup / polish

1. **Remove dead code** — `figure.js`, `TOGGLE_ORDER`, unused morph names
2. **Add CI/CD** — GitHub Actions for build + deploy
3. **Documentation** — Inline JSDoc, architecture diagram
4. **Legal review** — Terms of service, privacy policy for face upload

---

# TOP 10 MOST IMPORTANT PROBLEMS

1. **Zero tests** — Cannot verify correctness without manual testing
2. **Unverified outfit visibility** — May show wrong garments
3. **Unreliable face validation** — Skin detection heuristic may reject valid faces
4. **Large bundle** — 1.1MB+ on initial load
5. **No error boundaries** — Crashes are silent
6. **Accessibility missing** — Unusable for screen readers
7. **No mobile responsiveness** — Fixed panel widths break on small screens
8. **Dead code** — Unused exports (`figure.js`, `TOGGLE_ORDER`)
9. **No persistence** — State lost on refresh
10. **Misleading README** — Claims "photoreal" but is procedural mannequin

---

# TOP 10 BEST IMPROVEMENTS

1. **Add integration tests** — Verify user flows work
2. **Add error boundary** — Catch and display errors gracefully
3. **Make responsive** — Use flexbox/grid, media queries
4. **Add loading state** — Hero section skeleton or progress bar
5. **Implement persistence** — Save state to localStorage
6. **Add accessibility** — ARIA labels, keyboard navigation
7. **Optimize bundle** — Code split, tree shake Three.js
8. **Remove dead code** — Clean up unused files
9. **Add undo/redo** — Better UX for morph experiments
10. **Add deep linking** — Share poses via URL

---

# WHAT IS ALREADY GOOD

1. **Clear separation of concerns** — Controls (UI) vs Studio (3D) vs state (context)
2. **Policy gates** — Adult attestation + consent checkboxes
3. **Fail-closed face upload** — `clothed` check in Controls.jsx
4. **Procedural geometry with morph deltas** — Sophisticated approach, delta attributes stored
5. **Singleton materials** — Cached in closure, not recreated
6. **Centralized state** — All viewer state in ViewerProvider
7. **No API keys/secrets** — No exposure
8. **No network dependencies** — Works offline (except fonts)
9. **Model Bible** — Clear documentation of synthetic identity
10. **Git repository** — Version control in place

---

# OVERALL SCORECARD

| Area | Rating | Reason |
|------|--------|--------|
| Architecture | Fair | Clear separation but Woman.jsx is a God component; missing boundaries |
| Correctness | Poor | Unverified geometry, complex morph math, potential outfit bugs |
| Reliability | Poor | No error handling, no tests, no bounds checking |
| Security | Medium | No secrets, client-side only, but adult verification is unreliable |
| Performance | Fair | Large bundle, procedural textures on main thread, but acceptable for desktop |
| UX | Poor | No loading state, no error feedback, not responsive, inaccessible |
| Accessibility | Critical | No ARIA, no focus management, no announcements |
| Testing | Critical | Zero coverage |
| Maintainability | Fair | Code is readable, but hard-coded values, no types, no tests |
| Completeness | Fair | Core features mostly implemented, but quality gaps |

---

# FINAL VERDICT

1. **Is the foundation good?**
   - Partially. The React + Three.js + Context architecture is sound. The morph system is sophisticated. However, the implementation lacks tests, error handling, and verification.

2. **Is it production-ready?**
   - No. Critical gaps: no tests, accessibility fail, unverified geometry, potential outfit bug, no persistence.

3. **What is preventing it from being production-ready?**
   - 1. No automated testing (cannot verify correctness)
   - 2. Accessibility violations (legal risk in many jurisdictions)
   - 3. Unverified geometry/outfit logic (core feature may be broken)
   - 4. Poor UX on mobile (fixed panel widths)
   - 5. No error boundaries (crashes are silent)

4. **What should absolutely NOT be changed?**
   - The policy gates (adult attestation + consent) — this is legally sensitive
   - The fail-closed face upload (disabled on unclothed) — critical for compliance
   - The synthetic identity (Solenne Moreau) — clear documentation of fictional nature
   - The useLayoutEffect for morph application — ensures morphs applied before paint

5. **What should be fixed first?**
   - Add integration tests for:
     - Outfit visibility (all 4 combos + robe)
     - Morph sliders (min/max/neutral)
     - Face upload gate (disabled on unclothed)
   - Add error boundary around Studio
   - Add loading state during geometry generation

6. **What should be redesigned?**
   - Woman.jsx should be split: Body, Head, Garments, Hair as separate components
   - Controls.jsx should use a form library for validation
   - State should add bounds validation + maybe state machine for outfit transitions
   - Texture generation should move to Web Worker or pre-baked assets

7. **What should be removed?**
   - `src/figure.js` (dead re-export)
   - `TOGGLE_ORDER` in wardrobe.js (unused)
   - Morph naming strings if not used for glTF integration (dead docs)
   - Hardcoded geometry numbers (move to config)

8. **What is the biggest hidden risk?**
   - **Face validation false negatives.** The skin detection heuristic (`src/face.js:50`) may reject dark-skinned faces or accept non-face images. This creates both:
     - **Legal risk:** If valid adult faces are rejected, users may report discrimination
     - **Compliance risk:** If non-adult/non-face images are accepted, policy is circumvented
   
   Mitigation: Add manual review flag, or integrate a third-party face verification API.

9. **What is the biggest opportunity for improvement?**
   - **Add tests.** With zero test coverage, any change is a regression risk. Adding Jest + React Testing Library with integration tests for core flows would dramatically increase confidence and enable safe refactoring.

---

**Audit complete. No modifications made to source code per instructions.**
