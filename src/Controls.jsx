import { useRef, useState } from "react";
import { MODEL_BIBLE, HERO_VIEWS } from "./bible.js";
import { WARDROBE } from "./wardrobe.js";
import { MORPH_SPEC, morphLabel } from "./morphs.js";
import { inspectAdultFace } from "./face.js";
import { useViewer } from "./state.jsx";

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
          <button key={cell.id} onClick={() => { setBust(cell.bust); setHips(cell.hips); }}>
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

export default function Controls() {
  const v = useViewer();
  const fileRef = useRef();
  const [msg, setMsg] = useState("");

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

  return (
    <>
      <header className="topbar">
        <div>
          <h1 className="brand">Solenne</h1>
          <p className="sub">Synthetic fashion viewer · fictional adult</p>
        </div>
        <div className="row" role="tablist" aria-label="Camera views">
          {Object.entries(HERO_VIEWS).map(([k, view]) => (
            <button
              key={k}
              role="tab"
              aria-selected={v.heroView === k}
              className={v.heroView === k ? "active" : ""}
              onClick={() => v.setHeroView(k)}
            >
              {view.label}
            </button>
          ))}
        </div>
      </header>

      <aside className="panel" role="region" aria-label="Viewer controls">
        <Row label="Clothing">
          <div className="row" role="radiogroup" aria-label="Outfit selection">
            {["none", "lingerie", "casual", "dress"].map((id) => (
              <button
                key={id}
                role="radio"
                aria-checked={v.look === id}
                className={v.look === id ? "active" : ""}
                onClick={() => v.setLook(id)}
              >
                {id === "none" ? "None" : id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
            <button
              role="switch"
              aria-checked={v.robe}
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

        <div className="row">
          <button
            aria-pressed={v.showBible}
            className={v.showBible ? "active" : ""}
            onClick={() => v.setShowBible((s) => !s)}
          >
            Bible
          </button>
          <button
            aria-pressed={v.showMorphGrid}
            className={v.showMorphGrid ? "active" : ""}
            onClick={() => v.setShowMorphGrid((s) => !s)}
          >
            Morph grid
          </button>
        </div>

        <Row label="Face from upload · clothed only">
          <p className="notice">
            Synthetic body + user-provided face likeness. Casual or dress only. Do not upload others without permission. Adult 18+ attestation required. Fail closed to the base face.
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
          {msg ? <p className="notice" role="status" live="polite">{msg}</p> : null}
          {!v.clothed ? <p className="notice">Enable casual or dress to use a face overlay.</p> : null}
        </Row>
      </aside>

      {v.showBible ? <Bible /> : null}
      {v.showMorphGrid ? <MorphGrid /> : null}
    </>
  );
}
