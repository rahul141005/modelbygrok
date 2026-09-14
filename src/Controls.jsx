import { useRef, useState } from "react";
import { MODEL_BIBLE, HERO_VIEWS } from "./bible.js";
import { MORPH_SPEC, morphLabel } from "./morphs.js";
import { inspectAdultFace } from "./face.js";
import { useViewer } from "./state.jsx";
import { CHARACTER_PRESETS } from "./presets/characterPresets.js";
import { POSE_PRESETS } from "./presets/posePresets.js";
import {
  LIGHTING_PRESETS,
  STUDIO_BACKDROPS,
  CAMERA_PRESETS
} from "./presets/lightingPresets.js";
import { HAIR_COLORS } from "./figure/hair/HairSystem.jsx";
import { FABRIC_PROFILES, COLOR_THEMES } from "./figure/clothing/ClothingSystem.jsx";

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function MorphGrid() {
  const { setBust, setHips } = useViewer();
  return (
    <div className="overlay" role="dialog" aria-labelledby="morphgrid-title">
      <b id="morphgrid-title">Morph reference grid</b>
      <p>Bust_0/50/100 × Hips_0/50/100. Soft-tissue only. Height, head, limbs, ribcage preserved.</p>
      <p>Safe clothing: sliders 0.15–0.85. Extremes may clip thin shells.</p>
      <div className="grid3">
        {MORPH_SPEC.grid.map((cell) => (
          <button
            key={cell.id}
            onClick={() => {
              setBust(cell.bust);
              setHips(cell.hips);
            }}
          >
            {cell.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bible() {
  const m = MODEL_BIBLE;
  return (
    <div className="overlay" role="dialog" aria-labelledby="bible-title">
      <b id="bible-title">{m.name}</b>
      <p>{m.legal}</p>
      <p>ID {m.id} · Age {m.age} ({m.ageRange}) · {m.heightCm} cm · {m.weightKg} kg</p>
      <p>Skin {m.skin.fitzpatrick} {m.skin.undertone} · {m.hair.color} · {m.eyes.color} eyes</p>
      <p>
        Default {m.defaultMeasurements.bustCm}/{m.defaultMeasurements.waistCm}/{m.defaultMeasurements.hipsCm}
      </p>
      <p>{m.lighting}</p>
      <p>{m.usage}</p>
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Presets" },
  { id: "face", label: "Face & Mood" },
  { id: "hair", label: "Hair & Beauty" },
  { id: "wardrobe", label: "Wardrobe" },
  { id: "body", label: "Body & Pose" },
  { id: "studio", label: "Studio" }
];

export default function Controls() {
  const v = useViewer();
  const fileRef = useRef();
  const [activeTab, setActiveTab] = useState("overview");
  const [msg, setMsg] = useState("");
  const [jsonDialog, setJsonDialog] = useState(false);
  const [jsonText, setJsonText] = useState("");

  const onFace = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!v.clothed) {
      setMsg("Face-from-upload is only allowed on clothed looks.");
      return;
    }
    if (!v.consent || !v.adultAttest) {
      setMsg("Confirm adult subject and consent first.");
      return;
    }
    const res = await inspectAdultFace(file);
    if (!res.ok) {
      setMsg(res.reason);
      v.setFaceTexture(null);
      return;
    }
    v.setFaceTexture(res.texture);
    setMsg("Face applied to clothed look only.");
  };

  const uploadDisabled = !v.clothed || !v.consent || !v.adultAttest;
  const uploadDisabledReason = !v.clothed
    ? "Enable casual or dress outfit first"
    : !v.consent
    ? "Check consent checkbox first"
    : !v.adultAttest
    ? "Check adult attestation first"
    : "";

  const handleExport = () => {
    const data = v.exportConfig();
    navigator.clipboard?.writeText(data);
    setJsonText(data);
    setJsonDialog(true);
    setMsg("Configuration copied to clipboard!");
  };

  const handleImport = () => {
    if (!jsonText.trim()) return;
    const res = v.importConfig(jsonText);
    if (res.ok) {
      setMsg("Character configuration loaded successfully!");
      setJsonDialog(false);
    } else {
      setMsg(res.reason);
    }
  };

  return (
    <>
      {/* Top Bar with Camera Angle Quick Pickers */}
      <header className="topbar">
        <div>
          <h1 className="brand">Solenne</h1>
          <p className="sub">Digital Fashion Model Studio · Fictional Adult</p>
        </div>
        <div className="row" aria-label="Camera views">
          {Object.entries(HERO_VIEWS).map(([k, view]) => (
            <button
              key={k}
              aria-pressed={v.heroView === k}
              className={v.heroView === k ? "active" : ""}
              onClick={() => v.setHeroView(k)}
            >
              {view.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Studio Control Panel */}
      <aside className="panel" role="region" aria-label="Viewer controls">
        {/* Canonical Reference Restore Anchor */}
        <button
          className="reference-btn"
          onClick={v.restoreReference}
          title="Restore Solenne to canonical ground truth appearance"
        >
          <span>Solenne — Reference</span>
          <span className="badge">Canonical</span>
        </button>

        {/* Global Utilities (Randomize, Save/Load JSON) */}
        <div className="row" style={{ marginTop: -4 }}>
          <button
            onClick={v.randomizeCharacter}
            title="Generate a curated, plausible fashion-model variation"
            style={{ flex: 1 }}
          >
            Randomize
          </button>
          <button onClick={handleExport} title="Export JSON configuration" style={{ flex: 1 }}>
            Save / JSON
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-bar" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              className={activeTab === t.id ? "active" : ""}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW / PRESETS */}
        {activeTab === "overview" && (
          <>
            <Row label="Character Presets">
              <div className="preset-grid">
                {Object.entries(CHARACTER_PRESETS).map(([id, p]) => (
                  <button
                    key={id}
                    className={v.activePreset === id ? "active" : ""}
                    onClick={() => v.applyPreset(id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Quick Wardrobe Looks">
              <div className="row" aria-label="Outfit selection">
                {["none", "lingerie", "casual", "dress"].map((id) => (
                  <button
                    key={id}
                    aria-pressed={v.look === id}
                    className={v.look === id ? "active" : ""}
                    onClick={() => v.setLook(id)}
                  >
                    {id === "none" ? "None" : id.charAt(0).toUpperCase() + id.slice(1)}
                  </button>
                ))}
                <button
                  aria-pressed={v.robe}
                  className={v.robe ? "active" : ""}
                  onClick={() => v.setRobe((r) => !r)}
                >
                  Robe
                </button>
              </div>
            </Row>

            <Row label={`Bust  ${morphLabel(v.bust, "bust")}`}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={v.bust}
                onChange={(e) => v.setBust(+e.target.value)}
                aria-label="Bust morph slider"
              />
            </Row>
            <Row label={`Hips  ${morphLabel(v.hips, "hips")}`}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={v.hips}
                onChange={(e) => v.setHips(+e.target.value)}
                aria-label="Hips morph slider"
              />
            </Row>
          </>
        )}

        {/* TAB 2: FACE & MOOD */}
        {activeTab === "face" && (
          <>
            <Row label="Editorial Expressions">
              <div className="chip-grid">
                {[
                  { id: "neutral", label: "Neutral" },
                  { id: "subtleSmile", label: "Subtle Smile" },
                  { id: "happy", label: "Happy" },
                  { id: "confident", label: "Confident" },
                  { id: "relaxed", label: "Relaxed" },
                  { id: "surprised", label: "Surprised" },
                  { id: "thoughtful", label: "Thoughtful" },
                  { id: "serious", label: "Serious" },
                  { id: "playful", label: "Playful" }
                ].map((exp) => (
                  <button
                    key={exp.id}
                    className={v.expression === exp.id ? "active" : ""}
                    onClick={() => v.setExpression(exp.id)}
                  >
                    {exp.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Eye Optics & Iris Color">
              <div className="chip-grid">
                {[
                  { id: "hazelGreen", label: "Hazel Green" },
                  { id: "espressoBrown", label: "Espresso" },
                  { id: "honeyAmber", label: "Honey Amber" },
                  { id: "deepBlue", label: "Deep Blue" },
                  { id: "slateGray", label: "Slate Gray" }
                ].map((col) => (
                  <button
                    key={col.id}
                    className={v.eyes.irisColor === col.id ? "active" : ""}
                    onClick={() => v.setEyes({ irisColor: col.id })}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Gaze Direction">
              <div className="chip-grid">
                {[
                  { label: "At Camera", x: 0, y: 0 },
                  { label: "Look Left", x: -0.4, y: 0 },
                  { label: "Look Right", x: 0.4, y: 0 },
                  { label: "Look Up", x: 0, y: 0.35 },
                  { label: "Look Down", x: 0, y: -0.35 }
                ].map((g) => (
                  <button
                    key={g.label}
                    className={(v.eyes.gazeX === g.x && v.eyes.gazeY === g.y) || (!v.eyes.gazeX && g.x === 0 && !v.eyes.gazeY && g.y === 0) ? "active" : ""}
                    onClick={() => v.setEyes({ gazeX: g.x, gazeY: g.y })}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </Row>

            <div className="slider-group">
              <div className="slider-row">
                <div className="slider-header">
                  <span>Pupil Dilation</span>
                  <span>{Math.round((v.eyes.pupilSize || 0.35) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.5"
                  step="0.01"
                  value={v.eyes.pupilSize || 0.35}
                  onChange={(e) => v.setEyes({ pupilSize: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Eye Spacing</span>
                  <span>{((v.face.eyeSpacing || 0) * 10).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={v.face.eyeSpacing || 0}
                  onChange={(e) => v.setFace({ eyeSpacing: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Face Width</span>
                  <span>{((v.face.faceWidth || 0) * 10).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={v.face.faceWidth || 0}
                  onChange={(e) => v.setFace({ faceWidth: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Jaw Width</span>
                  <span>{((v.face.jawWidth || 0) * 10).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={v.face.jawWidth || 0}
                  onChange={(e) => v.setFace({ jawWidth: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Cheek Fullness</span>
                  <span>{((v.face.cheekFullness || 0) * 10).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={v.face.cheekFullness || 0}
                  onChange={(e) => v.setFace({ cheekFullness: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Chin Size</span>
                  <span>{((v.face.chinSize || 0) * 10).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={v.face.chinSize || 0}
                  onChange={(e) => v.setFace({ chinSize: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Nose Tip Projection</span>
                  <span>{((v.face.noseTip || 0) * 10).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={v.face.noseTip || 0}
                  onChange={(e) => v.setFace({ noseTip: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Lip Fullness</span>
                  <span>{((v.face.lipFullness || 0) * 10).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={v.face.lipFullness || 0}
                  onChange={(e) => v.setFace({ lipFullness: +e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {/* TAB 3: HAIR & BEAUTY */}
        {activeTab === "hair" && (
          <>
            <Row label="Hairstyles">
              <div className="chip-grid">
                {[
                  { id: "waves", label: "Solenne Waves" },
                  { id: "straight", label: "Sleek Straight" },
                  { id: "curls", label: "Volumetric Curls" },
                  { id: "halfUp", label: "Half-Up Knot" },
                  { id: "ponytail", label: "High Ponytail" },
                  { id: "bun", label: "Chic Low Bun" }
                ].map((h) => (
                  <button
                    key={h.id}
                    className={v.hair.style === h.id ? "active" : ""}
                    onClick={() => v.setHair({ style: h.id })}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Hair Colors">
              <div className="chip-grid">
                {Object.keys(HAIR_COLORS).map((k) => (
                  <button
                    key={k}
                    className={v.hair.color === k ? "active" : ""}
                    onClick={() => v.setHair({ color: k })}
                  >
                    {k === "darkChestnut" ? "Chestnut (Ref)" : k.charAt(0).toUpperCase() + k.slice(1)}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Lipstick Finish">
              <div className="chip-grid">
                {["natural", "gloss", "crimson", "wine", "rose"].map((lip) => (
                  <button
                    key={lip}
                    className={v.beauty.lipstick === lip ? "active" : ""}
                    onClick={() => v.setBeauty({ lipstick: lip })}
                  >
                    {lip.charAt(0).toUpperCase() + lip.slice(1)}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Manicure / Nails">
              <div className="chip-grid">
                {["natural", "subtlePink", "nude", "red", "dark"].map((n) => (
                  <button
                    key={n}
                    className={v.beauty.nails === n ? "active" : ""}
                    onClick={() => v.setBeauty({ nails: n })}
                  >
                    {n === "subtlePink" ? "Petal Pink" : n.charAt(0).toUpperCase() + n.slice(1)}
                  </button>
                ))}
              </div>
            </Row>
          </>
        )}

        {/* TAB 4: WARDROBE & ACCESSORIES */}
        {activeTab === "wardrobe" && (
          <>
            <Row label="Dresses (Full Piece)">
              <div className="chip-grid">
                {[
                  { id: "none", label: "None" },
                  { id: "satinSlip", label: "Satin Slip" },
                  { id: "eveningGown", label: "Evening Gown" },
                  { id: "sundress", label: "Summer Dress" },
                  { id: "midiDress", label: "Midi Dress" }
                ].map((d) => (
                  <button
                    key={d.id}
                    className={v.wardrobe.dress === d.id ? "active" : ""}
                    onClick={() => {
                      v.setWardrobe({
                        dress: d.id,
                        top: d.id !== "none" ? "none" : v.wardrobe.top,
                        bottom: d.id !== "none" ? "none" : v.wardrobe.bottom,
                        category: d.id !== "none" ? "dress" : "casual"
                      });
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Tops">
              <div className="chip-grid">
                {[
                  { id: "none", label: "None" },
                  { id: "cropTank", label: "Crop Tank" },
                  { id: "blouse", label: "Silk Blouse" },
                  { id: "kurta", label: "Kurta (Ethnic)" },
                  { id: "blazer", label: "Blazer" },
                  { id: "sweater", label: "Sweater" }
                ].map((t) => (
                  <button
                    key={t.id}
                    className={v.wardrobe.top === t.id ? "active" : ""}
                    onClick={() => {
                      v.setWardrobe({
                        top: t.id,
                        dress: "none",
                        category: "casual"
                      });
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Bottoms">
              <div className="chip-grid">
                {[
                  { id: "none", label: "None" },
                  { id: "denimShorts", label: "Denim Cut-Offs" },
                  { id: "trousers", label: "Trousers" },
                  { id: "wideLegPants", label: "Wide-Leg Pants" },
                  { id: "midiSkirt", label: "Midi Skirt" }
                ].map((b) => (
                  <button
                    key={b.id}
                    className={v.wardrobe.bottom === b.id ? "active" : ""}
                    onClick={() => {
                      v.setWardrobe({
                        bottom: b.id,
                        dress: "none",
                        category: "casual"
                      });
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Outerwear">
              <div className="chip-grid">
                {[
                  { id: "none", label: "None" },
                  { id: "robe", label: "Kimono Robe" },
                  { id: "shawl", label: "Shawl / Dupatta" },
                  { id: "blazer", label: "Blazer" },
                  { id: "coat", label: "Overcoat" }
                ].map((o) => (
                  <button
                    key={o.id}
                    className={v.wardrobe.outerwear === o.id ? "active" : ""}
                    onClick={() => v.setWardrobe({ outerwear: o.id })}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Footwear">
              <div className="chip-grid">
                {[
                  { id: "none", label: "Barefoot" },
                  { id: "stilettos", label: "Stilettos" },
                  { id: "slides", label: "Leather Slides" },
                  { id: "sandals", label: "Strappy Sandals" },
                  { id: "ankleBoots", label: "Ankle Boots" }
                ].map((s) => (
                  <button
                    key={s.id}
                    className={v.wardrobe.shoes === s.id ? "active" : ""}
                    onClick={() => v.setWardrobe({ shoes: s.id })}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Fabric & Color Palette">
              <div className="chip-grid" style={{ marginBottom: 6 }}>
                {Object.keys(FABRIC_PROFILES).map((f) => (
                  <button
                    key={f}
                    className={v.wardrobe.fabricType === f ? "active" : ""}
                    onClick={() => v.setWardrobe({ fabricType: f })}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="chip-grid">
                {["default", ...Object.keys(COLOR_THEMES)].map((c) => (
                  <button
                    key={c}
                    className={v.wardrobe.colorTheme === c ? "active" : ""}
                    onClick={() => v.setWardrobe({ colorTheme: c })}
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Jewelry & Accessories">
              <div className="chip-grid" style={{ marginBottom: 6 }}>
                {["gold", "silver", "roseGold"].map((m) => (
                  <button
                    key={m}
                    className={v.accessories.metal === m ? "active" : ""}
                    onClick={() => v.setAccessories({ metal: m })}
                  >
                    {m === "roseGold" ? "Rose Gold" : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
              <div className="chip-grid">
                {[
                  { key: "earrings", opts: ["none", "goldHoops", "statementDrops", "jhumka", "diamondStuds"] },
                  { key: "necklace", opts: ["none", "delicateChain", "choker", "pendant"] },
                  { key: "sunglasses", opts: ["none", "aviator", "catEye"] },
                  { key: "bracelet", opts: ["none", "bangles", "tennisBracelet"] }
                ].map((item) => (
                  <div key={item.key} style={{ width: "100%", marginTop: 4 }}>
                    <div style={{ fontSize: 9, color: "var(--muted)", marginBottom: 4 }}>
                      {item.key.toUpperCase()}
                    </div>
                    <div className="chip-grid">
                      {item.opts.map((opt) => (
                        <button
                          key={opt}
                          className={v.accessories[item.key] === opt ? "active" : ""}
                          onClick={() => v.setAccessories({ [item.key]: opt })}
                        >
                          {opt.replace(/([A-Z])/g, " $1")}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Row>
          </>
        )}

        {/* TAB 5: BODY & POSE */}
        {activeTab === "body" && (
          <>
            <Row label="Editorial Fashion Poses">
              <div className="chip-grid">
                {Object.values(POSE_PRESETS).map((p) => (
                  <button
                    key={p.id}
                    className={v.pose === p.id ? "active" : ""}
                    onClick={() => v.setPose(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label={`Bust  ${morphLabel(v.bust, "bust")}`}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={v.bust}
                onChange={(e) => v.setBust(+e.target.value)}
                aria-label="Bust morph slider"
              />
            </Row>
            <Row label={`Hips  ${morphLabel(v.hips, "hips")}`}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={v.hips}
                onChange={(e) => v.setHips(+e.target.value)}
                aria-label="Hips morph slider"
              />
            </Row>

            <div className="slider-group">
              <div className="slider-row">
                <div className="slider-header">
                  <span>Height Scale</span>
                  <span>{Math.round((v.body.heightScale || 1.0) * 175)} cm</span>
                </div>
                <input
                  type="range"
                  min="0.94"
                  max="1.06"
                  step="0.01"
                  value={v.body.heightScale || 1.0}
                  onChange={(e) => v.setBody({ heightScale: +e.target.value })}
                />
              </div>

              <div className="slider-row">
                <div className="slider-header">
                  <span>Shoulder Width</span>
                  <span>{((v.body.shoulderWidth || 0) * 100).toFixed(0)} mm</span>
                </div>
                <input
                  type="range"
                  min="-0.03"
                  max="0.03"
                  step="0.005"
                  value={v.body.shoulderWidth || 0}
                  onChange={(e) => v.setBody({ shoulderWidth: +e.target.value })}
                />
              </div>
            </div>

            <div className="row">
              <button
                aria-pressed={v.showMorphGrid}
                className={v.showMorphGrid ? "active" : ""}
                onClick={() => v.setShowMorphGrid((s) => !s)}
                style={{ flex: 1 }}
              >
                Morph reference grid
              </button>
            </div>
          </>
        )}

        {/* TAB 6: STUDIO & POLICY */}
        {activeTab === "studio" && (
          <>
            <Row label="Camera Presets">
              <div className="chip-grid">
                {Object.values(CAMERA_PRESETS).map((c) => (
                  <button
                    key={c.id}
                    className={v.cameraPreset === c.id ? "active" : ""}
                    onClick={() => v.setCameraPreset(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Studio Lighting">
              <div className="chip-grid">
                {Object.values(LIGHTING_PRESETS).map((l) => (
                  <button
                    key={l.id}
                    className={v.lightingPreset === l.id ? "active" : ""}
                    onClick={() => v.setLightingPreset(l.id)}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </Row>

            <Row label="Studio Backdrop">
              <div className="chip-grid">
                {Object.values(STUDIO_BACKDROPS).map((b) => (
                  <button
                    key={b.id}
                    className={v.backdrop === b.id ? "active" : ""}
                    onClick={() => v.setBackdrop(b.id)}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </Row>

            <div className="row">
              <button
                aria-pressed={v.showBible}
                className={v.showBible ? "active" : ""}
                onClick={() => v.setShowBible((s) => !s)}
                style={{ flex: 1 }}
              >
                Model Bible
              </button>
            </div>

            <Row label="Face from upload · clothed only">
              <p className="notice">
                Synthetic body + user-provided face likeness. Casual or dress only. Do not upload others without permission. Adult 18+ attestation required. Fail closed to base face.
              </p>
              <label className="check">
                <input
                  type="checkbox"
                  checked={v.adultAttest}
                  onChange={(e) => v.setAdultAttest(e.target.checked)}
                  aria-describedby="adult-desc"
                />
                <span id="adult-desc">Subject is an adult 18+</span>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={v.consent}
                  onChange={(e) => v.setConsent(e.target.checked)}
                  aria-describedby="consent-desc"
                />
                <span id="consent-desc">I have consent / rights to this face</span>
              </label>
              <div className="row">
                <button
                  disabled={uploadDisabled}
                  onClick={() => fileRef.current?.click()}
                  title={uploadDisabled ? uploadDisabledReason : "Upload face image"}
                  style={{ flex: 1 }}
                >
                  Upload face
                </button>
                <button onClick={() => { v.setFaceTexture(null); setMsg(""); }}>
                  Clear
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={onFace}
                aria-label="Face image upload"
              />
              {msg ? <p className="notice" role="status" aria-live="polite">{msg}</p> : null}
              {!v.clothed ? <p className="notice">Enable casual or dress to use a face overlay.</p> : null}
            </Row>
          </>
        )}
      </aside>

      {/* Popups & Dialogs */}
      {v.showBible ? <Bible /> : null}
      {v.showMorphGrid ? <MorphGrid /> : null}

      {jsonDialog && (
        <div className="overlay" role="dialog" aria-labelledby="json-dialog-title" style={{ maxWidth: 440 }}>
          <b id="json-dialog-title">Character JSON Configuration</b>
          <p>Export or import structured JSON state for Solenne.</p>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            style={{
              width: "100%",
              height: 180,
              background: "#121113",
              color: "#e8e5dc",
              fontFamily: "monospace",
              fontSize: 10,
              border: "1px solid var(--line)",
              padding: 8,
              borderRadius: 2,
              marginTop: 6
            }}
          />
          <div className="row" style={{ marginTop: 8 }}>
            <button onClick={handleImport}>Import JSON</button>
            <button onClick={() => setJsonDialog(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
