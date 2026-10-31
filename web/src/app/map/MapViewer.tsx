"use client";

import { useEffect, useRef, useState } from "react";
import { MAP_IMAGE, MAP_LAYERS } from "./mapLayers";

export type Marker = {
  id: number;
  layer: string;
  label: string | null;
  x: number;
  y: number;
  note: string | null;
};

type View = { z: number; x: number; y: number };
type Draft = { layer: string; x: number; y: number };

const gold = "#e7b457";
const muted = "#e7b457";
const MAX_ZOOM = 8;

function clampView(v: View, w: number, h: number): View {
  const z = Math.min(MAX_ZOOM, Math.max(1, v.z));
  const x = Math.min(0, Math.max(w * (1 - z), v.x));
  const y = Math.min(0, Math.max(h * (1 - z), v.y));
  return { z, x, y };
}

function LayerIcon({ layerKey, size = 22 }: { layerKey: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const info = MAP_LAYERS.find((l) => l.key === layerKey);
  if (failed || !info) {
    return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{info?.emoji ?? "📍"}</span>;
  }
  return (
    <img
      src={`/map/icons/${layerKey}.png`}
      alt=""
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
      onError={() => setFailed(true)}
    />
  );
}

export default function MapViewer({ markers }: { markers: Marker[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const press = useRef<{ id: number; sx: number; sy: number; vx: number; vy: number; moved: boolean } | null>(null);

  const [view, setView] = useState<View>({ z: 1, x: 0, y: 0 });
  const [active, setActive] = useState<string[]>(() => MAP_LAYERS.map((l) => l.key));
  const [selected, setSelected] = useState<Marker | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [edit, setEdit] = useState(false);
  const [editLayer, setEditLayer] = useState(MAP_LAYERS[0].key);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    setEdit(new URLSearchParams(window.location.search).get("edit") === "1");
  }, []);

  function zoomAt(clientX: number, clientY: number, factor: number) {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const px = clientX - r.left;
    const py = clientY - r.top;
    setView((v) => {
      const z = Math.min(MAX_ZOOM, Math.max(1, v.z * factor));
      const mx = (px - v.x) / v.z;
      const my = (py - v.y) / v.z;
      return clampView({ z, x: px - mx * z, y: py - my * z }, r.width, r.height);
    });
  }

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.18 : 1 / 1.18);
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, []);

  function zoomCenter(factor: number) {
    const box = boxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    press.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current;
    const box = boxRef.current;
    if (!p || !box || p.id !== e.pointerId) return;
    const dx = e.clientX - p.sx;
    const dy = e.clientY - p.sy;
    if (!p.moved && Math.hypot(dx, dy) > 5) {
      p.moved = true;
      box.setPointerCapture(e.pointerId);
    }
    if (p.moved) {
      const r = box.getBoundingClientRect();
      setView((v) => clampView({ z: v.z, x: p.vx + dx, y: p.vy + dy }, r.width, r.height));
    }
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const p = press.current;
    press.current = null;
    if (!p || p.moved || !edit) return;
    if ((e.target as HTMLElement).closest("button")) return;
    const inner = innerRef.current;
    if (!inner) return;
    const r = inner.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    setDrafts((d) => [...d, { layer: editLayer, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }]);
  }

  function toggle(key: string) {
    setActive((a) => (a.includes(key) ? a.filter((k) => k !== key) : [...a, key]));
    setSelected(null);
  }

  const counts: Record<string, number> = {};
  for (const m of markers) counts[m.layer] = (counts[m.layer] ?? 0) + 1;
  const layersToShow = MAP_LAYERS.filter((l) => edit || counts[l.key]);
  const visible = markers.filter((m) => active.includes(m.layer));
  const csv = drafts.map((d) => `${d.layer},,${d.x},${d.y}`).join("\n");

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {layersToShow.map((l) => {
          const on = active.includes(l.key);
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => toggle(l.key)}
              aria-pressed={on}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "1px solid rgba(231,180,87,0.4)",
                background: on ? gold : "transparent",
                color: on ? "#021432" : gold,
                borderRadius: 999,
                padding: "5px 12px",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              <LayerIcon layerKey={l.key} size={16} />
              {l.label} {counts[l.key] ? `(${counts[l.key]})` : ""}
            </button>
          );
        })}
      </div>

      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "relative",
          overflow: "hidden",
          touchAction: "none",
          borderRadius: 12,
          background: "#06122e",
          cursor: edit ? "crosshair" : "grab",
          maxWidth: 900,
        }}
      >
        <div
          ref={innerRef}
          style={{
            position: "relative",
            transformOrigin: "0 0",
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
          }}
        >
          {imgFailed ? (
            <div style={{ padding: 40, color: muted }}>
              Map image not found. Save it as <code>public{MAP_IMAGE}</code>.
            </div>
          ) : (
            <img
              src={MAP_IMAGE}
              alt="Map"
              draggable={false}
              onError={() => setImgFailed(true)}
              style={{ display: "block", width: "100%", height: "auto", userSelect: "none" }}
            />
          )}

          {visible.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelected(m)}
              title={m.label ?? ""}
              style={{
                position: "absolute",
                left: `${m.x}%`,
                top: `${m.y}%`,
                transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
              }}
            >
              <LayerIcon layerKey={m.layer} />
            </button>
          ))}

          {drafts.map((d, i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#fff",
                border: "2px solid #e11d48",
                transform: `translate(-50%, -50%) scale(${1 / view.z})`,
                pointerEvents: "none",
              }}
            />
          ))}
        </div>

        <div style={{ position: "absolute", right: 10, top: 10, display: "grid", gap: 6 }}>
          <button type="button" onClick={() => zoomCenter(1.5)} style={zoomBtn} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => zoomCenter(1 / 1.5)} style={zoomBtn} aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={() => setView({ z: 1, x: 0, y: 0 })} style={zoomBtn} aria-label="Reset view">
            ⟲
          </button>
        </div>
      </div>

      {selected && (
        <div style={{ marginTop: 12, background: "#0a2a5c", borderRadius: 12, padding: 12, maxWidth: 420 }}>
          <strong style={{ color: gold }}>{selected.label || MAP_LAYERS.find((l) => l.key === selected.layer)?.label}</strong>
          {selected.note && <div style={{ color: "#e8f4ff", marginTop: 6 }}>{selected.note}</div>}
        </div>
      )}

      {edit && (
        <div style={{ marginTop: 18, maxWidth: 620 }}>
          <div style={{ color: gold, fontWeight: 600, marginBottom: 6 }}>Edit mode: click the map to add points</div>
          <select
            value={editLayer}
            onChange={(e) => setEditLayer(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, marginBottom: 8 }}
          >
            {MAP_LAYERS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
          <textarea
            readOnly
            value={csv}
            rows={8}
            placeholder="layer,label,x,y"
            style={{ width: "100%", background: "#021432", color: "#e8f4ff", borderRadius: 8, padding: 8 }}
          />
          <div style={{ color: muted, fontSize: "0.8rem", margin: "6px 0" }}>
            Copy these lines into the CSV (columns layer,label,x,y). The label is optional.
          </div>
          <button type="button" onClick={() => setDrafts([])} style={zoomBtn}>
            Clear points
          </button>
        </div>
      )}
    </div>
  );
}

const zoomBtn: React.CSSProperties = {
  minWidth: 34,
  height: 34,
  borderRadius: 8,
  border: "1px solid rgba(231,180,87,0.5)",
  background: "rgba(2,20,50,0.85)",
  color: gold,
  fontSize: "1.1rem",
  cursor: "pointer",
  padding: "0 8px",
};
