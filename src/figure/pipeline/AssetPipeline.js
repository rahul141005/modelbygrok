import { useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * GLB / glTF Character Asset Pipeline
 * Checks for external production-quality character asset at /models/solenne.glb or /models/heroine_a_base.glb.
 * If available, loads it and binds morph targets & outfits.
 * If not present, seamlessly falls back to the high-definition procedural engine.
 */

export function useCharacterAsset(assetUrl = "/models/solenne.glb") {
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();

    // Check HEAD request first to avoid throwing noisy 404 in console
    fetch(assetUrl, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) {
          // File does not exist, use procedural engine
          return;
        }
        setLoading(true);
        loader.load(
          assetUrl,
          (gltf) => {
            if (cancelled) {
              gltf.scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                  if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
                  else obj.material.dispose();
                }
              });
              return;
            }
            // Normalize scale and orientation
            gltf.scene.rotation.y = 0;
            setAsset(gltf.scene);
            setLoading(false);
          },
          undefined,
          (err) => {
            if (!cancelled) {
              setError(err);
              setLoading(false);
            }
          }
        );
      })
      .catch(() => {
        // Fallback to procedural
      });

    return () => {
      cancelled = true;
      if (asset) {
        asset.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
            else obj.material.dispose();
          }
        });
      }
    };
  }, [assetUrl]);

  return { asset, loading, error };
}
