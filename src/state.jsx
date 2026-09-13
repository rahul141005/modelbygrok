import { createContext, useContext, useMemo, useState, useCallback } from "react";

const ViewerContext = createContext(null);

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

export function ViewerProvider({ children }) {
  const [look, setLook] = useState("casual");
  const [robe, setRobe] = useState(false);
  const [bust, setBustState] = useState(0.42);
  const [hips, setHipsState] = useState(0.48);
  const [heroView, setHeroView] = useState("front");
  const [showBible, setShowBible] = useState(false);
  const [showMorphGrid, setShowMorphGrid] = useState(false);
  const [faceTexture, setFaceTexture] = useState(null);
  const [consent, setConsentState] = useState(false);
  const [adultAttest, setAdultAttestState] = useState(false);

  const setBust = useCallback((val) => setBustState(clamp(val, 0, 1)), []);
  const setHips = useCallback((val) => setHipsState(clamp(val, 0, 1)), []);

  const setConsent = useCallback((val) => {
    setConsentState(val);
    if (!val) setFaceTexture(null);
  }, []);

  const setAdultAttest = useCallback((val) => {
    setAdultAttestState(val);
    if (!val) setFaceTexture(null);
  }, []);

  const setLookSafe = useCallback((newLook) => {
    setLook(newLook);
    const isClothed = newLook === "casual" || newLook === "dress";
    if (!isClothed) setFaceTexture(null);
  }, []);

  const clothed = look === "casual" || look === "dress";
  const outfit = useMemo(() => ({
    lingerie: look === "lingerie",
    casual: look === "casual",
    dress: look === "dress",
    robe
  }), [look, robe]);

  const value = useMemo(
    () => ({
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
    [look, robe, outfit, bust, hips, heroView, showBible, showMorphGrid, faceTexture, consent, adultAttest, clothed, setLookSafe, setBust, setHips, setConsent, setAdultAttest]
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used within ViewerProvider");
  return ctx;
}
