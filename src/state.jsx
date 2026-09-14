import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { CHARACTER_PRESETS } from "./presets/characterPresets.js";

const ViewerContext = createContext(null);

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function ViewerProvider({ children }) {
  // Master state initialized from canonical Solenne Reference
  const [activePreset, setActivePreset] = useState("reference");

  const [body, setBodyState] = useState(() => ({ ...CHARACTER_PRESETS.reference.body }));
  const [face, setFaceState] = useState(() => ({ ...CHARACTER_PRESETS.reference.face }));
  const [expression, setExpression] = useState(CHARACTER_PRESETS.reference.expression);
  const [eyes, setEyesState] = useState(() => ({ ...CHARACTER_PRESETS.reference.eyes }));
  const [hair, setHairState] = useState(() => ({ ...CHARACTER_PRESETS.reference.hair }));
  const [pose, setPose] = useState(CHARACTER_PRESETS.reference.pose);
  const [wardrobe, setWardrobeState] = useState(() => ({ ...CHARACTER_PRESETS.reference.wardrobe }));
  const [accessories, setAccessoriesState] = useState(() => ({ ...CHARACTER_PRESETS.reference.accessories }));
  const [beauty, setBeautyState] = useState(() => ({ ...CHARACTER_PRESETS.reference.beauty }));
  const [cameraPreset, setCameraPreset] = useState(CHARACTER_PRESETS.reference.camera);
  const [lightingPreset, setLightingPreset] = useState(CHARACTER_PRESETS.reference.lighting);
  const [backdrop, setBackdrop] = useState("dark");

  // Safety & Overlay State
  const [faceTexture, setFaceTexture] = useState(null);
  const [consent, setConsentState] = useState(false);
  const [adultAttest, setAdultAttestState] = useState(false);
  const [showBible, setShowBible] = useState(false);
  const [showMorphGrid, setShowMorphGrid] = useState(false);

  // Partial Updaters
  const setBody = useCallback((patch) => {
    setBodyState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch)
    }));
  }, []);

  const setFace = useCallback((patch) => {
    setFaceState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch)
    }));
  }, []);

  const setEyes = useCallback((patch) => {
    setEyesState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch)
    }));
  }, []);

  const setHair = useCallback((patch) => {
    setHairState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch)
    }));
  }, []);

  const setWardrobe = useCallback((patch) => {
    setWardrobeState((prev) => {
      const next = typeof patch === "function" ? patch(prev) : patch;
      return { ...prev, ...next };
    });
  }, []);

  const setAccessories = useCallback((patch) => {
    setAccessoriesState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch)
    }));
  }, []);

  const setBeauty = useCallback((patch) => {
    setBeautyState((prev) => ({
      ...prev,
      ...(typeof patch === "function" ? patch(prev) : patch)
    }));
  }, []);

  // Backward-compatible bust / hips
  const setBust = useCallback((val) => {
    setBodyState((prev) => ({ ...prev, bust: clamp(val, 0, 1) }));
  }, []);

  const setHips = useCallback((val) => {
    setBodyState((prev) => ({ ...prev, hips: clamp(val, 0, 1) }));
  }, []);

  // Backward-compatible look & robe
  const setLookSafe = useCallback((newLook) => {
    setWardrobeState((prev) => ({
      ...prev,
      category: newLook,
      dress: newLook === "dress" ? "satinSlip" : "none",
      top: newLook === "casual" ? "cropTank" : "none",
      bottom: newLook === "casual" ? "denimShorts" : "none"
    }));
    const isClothed = newLook === "casual" || newLook === "dress" || newLook === "tailored" || newLook === "traditional";
    if (!isClothed) setFaceTexture(null);
  }, []);

  const setRobe = useCallback((action) => {
    setWardrobeState((prev) => {
      const isRobeOn = typeof action === "function" ? action(prev.outerwear === "robe") : action;
      return {
        ...prev,
        outerwear: isRobeOn ? "robe" : "none"
      };
    });
  }, []);

  // Safety Setters
  const setConsent = useCallback((val) => {
    setConsentState(val);
    if (!val) setFaceTexture(null);
  }, []);

  const setAdultAttest = useCallback((val) => {
    setAdultAttestState(val);
    if (!val) setFaceTexture(null);
  }, []);

  // 1. Restore Canonical Solenne Reference Preset
  const restoreReference = useCallback(() => {
    const ref = CHARACTER_PRESETS.reference;
    setActivePreset("reference");
    setBodyState({ ...ref.body });
    setFaceState({ ...ref.face });
    setExpression(ref.expression);
    setEyesState({ ...ref.eyes });
    setHairState({ ...ref.hair });
    setPose(ref.pose);
    setWardrobeState({ ...ref.wardrobe });
    setAccessoriesState({ ...ref.accessories });
    setBeautyState({ ...ref.beauty });
    setCameraPreset(ref.camera);
    setLightingPreset(ref.lighting);
    setBackdrop("dark");
  }, []);

  // 2. Apply Complete Character Preset
  const applyPreset = useCallback((presetId) => {
    const p = CHARACTER_PRESETS[presetId];
    if (!p) return;
    setActivePreset(presetId);
    setBodyState({ ...p.body });
    setFaceState({ ...p.face });
    setExpression(p.expression);
    setEyesState({ ...p.eyes });
    setHairState({ ...p.hair });
    setPose(p.pose);
    setWardrobeState({ ...p.wardrobe });
    setAccessoriesState({ ...p.accessories });
    setBeautyState({ ...p.beauty });
    setCameraPreset(p.camera);
    setLightingPreset(p.lighting);
  }, []);

  // 3. Constrained Randomize (Generates believable, high-fashion combinations without distortion)
  const randomizeCharacter = useCallback(() => {
    const styles = ["waves", "straight", "curls", "halfUp", "ponytail", "bun"];
    const colors = ["darkChestnut", "espressoBlack", "chocolate", "warmChestnut", "honeyHighlights"];
    const irisColors = ["hazelGreen", "espressoBrown", "honeyAmber", "deepBlue", "slateGray"];
    const expressions = ["neutral", "subtleSmile", "happy", "confident", "relaxed", "playful"];
    const poses = ["neutral", "relaxed", "editorial", "handOnHip", "oneLegRelaxed", "confident"];
    const looks = ["casual", "dress", "traditional", "editorial"];
    const lightings = ["softStudio", "beauty", "editorial", "warm", "cool"];
    const backdrops = ["dark", "warm", "gray", "editorial"];

    setActivePreset("custom");

    // Realistic subtle variations
    setBodyState((prev) => ({
      ...prev,
      heightScale: 0.96 + Math.random() * 0.08,
      shoulderWidth: (Math.random() - 0.5) * 0.02,
      armVolume: 0.92 + Math.random() * 0.16,
      waistDepth: 0.92 + Math.random() * 0.16,
      thighThickness: 0.92 + Math.random() * 0.16,
      calfThickness: 0.92 + Math.random() * 0.16,
      bust: 0.3 + Math.random() * 0.35,
      hips: 0.38 + Math.random() * 0.32
    }));

    setFaceState({
      faceWidth: (Math.random() - 0.5) * 0.06,
      jawWidth: (Math.random() - 0.5) * 0.04,
      chinSize: (Math.random() - 0.5) * 0.04,
      chinProj: (Math.random() - 0.5) * 0.02,
      eyeSpacing: (Math.random() - 0.5) * 0.02,
      eyeSize: (Math.random() - 0.5) * 0.04,
      noseBridge: (Math.random() - 0.5) * 0.02,
      noseTip: (Math.random() - 0.5) * 0.03,
      lipFullness: (Math.random() - 0.3) * 0.12,
      cheekFullness: (Math.random() - 0.5) * 0.06
    });

    setHairState({
      style: styles[Math.floor(Math.random() * styles.length)],
      color: colors[Math.floor(Math.random() * colors.length)]
    });

    setEyesState({
      irisColor: irisColors[Math.floor(Math.random() * irisColors.length)],
      pupilSize: 0.28 + Math.random() * 0.12,
      eyeWetness: 1.0,
      gazeX: (Math.random() - 0.5) * 0.04,
      gazeY: (Math.random() - 0.5) * 0.02
    });

    setExpression(expressions[Math.floor(Math.random() * expressions.length)]);
    setPose(poses[Math.floor(Math.random() * poses.length)]);

    const chosenLook = looks[Math.floor(Math.random() * looks.length)];
    setWardrobeState({
      category: chosenLook,
      top: chosenLook === "casual" ? "cropTank" : chosenLook === "traditional" ? "kurta" : chosenLook === "editorial" ? "blazer" : "none",
      bottom: chosenLook === "casual" ? "denimShorts" : chosenLook === "traditional" ? "trousers" : chosenLook === "editorial" ? "trousers" : "none",
      dress: chosenLook === "dress" ? "satinSlip" : "none",
      outerwear: Math.random() > 0.6 ? "robe" : "none",
      shoes: Math.random() > 0.5 ? "stilettos" : "slides",
      colorTheme: "default",
      fabricType: "cotton"
    });

    setLightingPreset(lightings[Math.floor(Math.random() * lightings.length)]);
    setBackdrop(backdrops[Math.floor(Math.random() * backdrops.length)]);
  }, []);

  // 4. Serialization (Export / Import JSON)
  const exportConfig = useCallback(() => {
    const config = {
      version: "2.0.0",
      timestamp: new Date().toISOString(),
      activePreset,
      body,
      face,
      expression,
      eyes,
      hair,
      pose,
      wardrobe,
      accessories,
      beauty,
      cameraPreset,
      lightingPreset,
      backdrop
    };
    return JSON.stringify(config, null, 2);
  }, [activePreset, body, face, expression, eyes, hair, pose, wardrobe, accessories, beauty, cameraPreset, lightingPreset, backdrop]);

  const importConfig = useCallback((jsonStr) => {
    try {
      const cfg = JSON.parse(jsonStr);
      if (cfg.body) setBodyState(cfg.body);
      if (cfg.face) setFaceState(cfg.face);
      if (cfg.expression) setExpression(cfg.expression);
      if (cfg.eyes) setEyesState(cfg.eyes);
      if (cfg.hair) setHairState(cfg.hair);
      if (cfg.pose) setPose(cfg.pose);
      if (cfg.wardrobe) setWardrobeState(cfg.wardrobe);
      if (cfg.accessories) setAccessoriesState(cfg.accessories);
      if (cfg.beauty) setBeautyState(cfg.beauty);
      if (cfg.cameraPreset) setCameraPreset(cfg.cameraPreset);
      if (cfg.lightingPreset) setLightingPreset(cfg.lightingPreset);
      if (cfg.backdrop) setBackdrop(cfg.backdrop);
      setActivePreset("imported");
      return { ok: true };
    } catch {
      return { ok: false, reason: "Invalid JSON configuration." };
    }
  }, []);

  // Backward compatibility derived values
  const look = wardrobe.category || "casual";
  const robe = wardrobe.outerwear === "robe";
  const bust = body.bust;
  const hips = body.hips;
  const heroView = cameraPreset === "portrait" ? "threeQuarter" : cameraPreset === "side" ? "side" : cameraPreset === "back" ? "back" : "front";

  const clothed = look !== "none" && look !== "lingerie";
  const outfit = useMemo(() => ({
    lingerie: look === "lingerie",
    casual: look === "casual",
    dress: look === "dress",
    traditional: look === "traditional",
    tailored: look === "tailored",
    robe
  }), [look, robe]);

  const setHeroView = useCallback((viewKey) => {
    const map = {
      front: "studio",
      threeQuarter: "portrait",
      side: "side",
      back: "back"
    };
    setCameraPreset(map[viewKey] || "studio");
  }, []);

  const value = useMemo(
    () => ({
      // Expanded Character Studio API
      activePreset,
      applyPreset,
      restoreReference,
      randomizeCharacter,
      exportConfig,
      importConfig,
      body,
      setBody,
      face,
      setFace,
      expression,
      setExpression,
      eyes,
      setEyes,
      hair,
      setHair,
      pose,
      setPose,
      wardrobe,
      setWardrobe,
      accessories,
      setAccessories,
      beauty,
      setBeauty,
      cameraPreset,
      setCameraPreset,
      lightingPreset,
      setLightingPreset,
      backdrop,
      setBackdrop,

      // Backward-Compatible API
      look,
      setLook: setLookSafe,
      robe,
      setRobe,
      outfit,
      bust,
      setBust,
      hips,
      setHips,
      heroView,
      setHeroView,
      showBible,
      setShowBible,
      showMorphGrid,
      setShowMorphGrid,
      faceTexture,
      setFaceTexture,
      consent,
      setConsent,
      adultAttest,
      setAdultAttest,
      clothed
    }),
    [
      activePreset,
      applyPreset,
      restoreReference,
      randomizeCharacter,
      exportConfig,
      importConfig,
      body,
      setBody,
      face,
      setFace,
      expression,
      setExpression,
      eyes,
      setEyes,
      hair,
      setHair,
      pose,
      setPose,
      wardrobe,
      setWardrobe,
      accessories,
      setAccessories,
      beauty,
      setBeauty,
      cameraPreset,
      setCameraPreset,
      lightingPreset,
      setLightingPreset,
      backdrop,
      setBackdrop,
      look,
      setLookSafe,
      robe,
      setRobe,
      outfit,
      bust,
      setBust,
      hips,
      setHips,
      heroView,
      setHeroView,
      showBible,
      showMorphGrid,
      faceTexture,
      consent,
      setConsent,
      adultAttest,
      setAdultAttest,
      clothed
    ]
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used within ViewerProvider");
  return ctx;
}
