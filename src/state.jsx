import { createContext, useContext, useMemo, useState } from "react";

const ViewerContext = createContext(null);

export function ViewerProvider({ children }) {
  const [look, setLook] = useState("casual");
  const [robe, setRobe] = useState(false);
  const [bust, setBust] = useState(0.42);
  const [hips, setHips] = useState(0.48);
  const [heroView, setHeroView] = useState("front");
  const [showBible, setShowBible] = useState(false);
  const [showMorphGrid, setShowMorphGrid] = useState(false);
  const [faceTexture, setFaceTexture] = useState(null);
  const [consent, setConsent] = useState(false);
  const [adultAttest, setAdultAttest] = useState(false);

  const clothed = look === "casual" || look === "dress";
  const outfit = {
    lingerie: look === "lingerie",
    casual: look === "casual",
    dress: look === "dress",
    robe
  };

  const value = useMemo(
    () => ({
      look,
      setLook,
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
    [look, robe, outfit, bust, hips, heroView, showBible, showMorphGrid, faceTexture, consent, adultAttest, clothed]
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used within ViewerProvider");
  return ctx;
}
