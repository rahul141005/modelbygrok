# Aurora Atelier

Private digital fitting room. Photoreal. Editorial. Client-side Three.js viewer.

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Studio default

Casual look. Synthetic adult identity (Solenne Moreau, 28). Unclothed / lingerie available for fitting. Face-from-upload is locked to casual and dress only.

## Morphs

UI sliders `0–1`. Neutral is not zero.

| Control | Slider default | Names |
| --- | --- | --- |
| Bust | `0.42` | `Bust_0` / `Bust_50` / `Bust_100` |
| Hips | `0.48` | `Hips_0` / `Hips_50` / `Hips_100` |

Runtime: `position = base + bustDelta * ((bust - 0.42) / 0.58) + hipDelta * ((hips - 0.48) / 0.52)`

Safe garment range: `0.15–0.85`.

## Wardrobe IDs

- `none` — synthetic base
- `GAR-LINGERIE-01`
- `GAR-CASUAL-01`
- `GAR-DRESS-01`
- `GAR-ROBE-01` (optional overlay)

## Replace the procedural figure with a glTF

1. Put the asset at `public/models/heroine_a_base.glb`.
2. Morph target names must be `bust` and `hips` (`0–1`).
3. Outfit meshes: `outfit_lingerie`, `outfit_casual`, `outfit_dress`, `outfit_robe`.
4. Swap `src/figure/Woman.jsx` to `useGLTF` and drive `morphTargetInfluences` from the same sliders.

No API keys. Face inspect is client-side and fail-closed.
